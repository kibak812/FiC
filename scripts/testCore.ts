import {
  BOSS_REWARDS,
  CARD_ARCHETYPES,
  COMBAT_REWARD_RULES,
  ENEMIES,
  ENEMY_POOLS,
  GAME_EVENTS,
  MAP_NODE_LAYOUTS,
  SHOP_ITEMS
} from '../constants';
import { CardRarity, CardType, EnemyTier, EventOptionType, IntentType, NodeType, PlayerStats } from '../types';
import { cleanJunkFromDeck, createCardInstance, resetTemporaryDeckModifiers } from '../utils/cardUtils';
import {
  applyModifierActions,
  CardEffectContext,
  EffectModifiers,
  executeEffectsForPhase,
  isTwinHandle
} from '../utils/cardEffects';
import {
  applyCombatEffectActions,
  calculateBlockedDamage,
  calculateEnemyIntentPlan,
  calculateEnemyStrengthGain,
  calculateWeaponStats,
  resolveEnemyTurn,
  resolveEnemyTurnStartStatuses
} from '../utils/combatEngine';
import {
  createCombatCardRewards,
  createRandomCardReward,
  getCombatRewardRule,
  rollGoldReward
} from '../utils/rewardUtils';
import { createActMap } from '../utils/mapUtils';
import { assert, assertDeepEqual, assertEqual, createSeededRng, runSuite, test } from './testUtils';

const createPlayer = (overrides: Partial<PlayerStats> = {}): PlayerStats => ({
  hp: 50,
  maxHp: 50,
  energy: 3,
  maxEnergy: 3,
  block: 0,
  gold: 0,
  costLimit: null,
  disarmed: false,
  nextTurnDraw: 0,
  overheat: 0,
  weaponsUsedThisTurn: 0,
  dodgeNextAttack: false,
  selfDamageThisTurn: 0,
  ...overrides
});

const createEffectContext = (
  cardIds: { handle: number; head: number; deco?: number },
  overrides: Partial<CardEffectContext> = {}
): CardEffectContext => {
  const rng = createSeededRng(`effect-${cardIds.handle}-${cardIds.head}-${cardIds.deco || 0}`);
  const slots = {
    handle: createCardInstance(cardIds.handle, rng),
    head: createCardInstance(cardIds.head, rng),
    deco: cardIds.deco ? createCardInstance(cardIds.deco, rng) : null
  };
  const enemy = JSON.parse(JSON.stringify(ENEMIES.RUST_SLIME));
  const player = createPlayer();
  const stats = calculateWeaponStats({
    slots,
    playerBlock: player.block,
    weaponsUsedThisTurn: player.weaponsUsedThisTurn,
    enemyStatuses: enemy.statuses,
    growingCrystalBonus: 0
  });

  return {
    slots,
    stats,
    player,
    enemy,
    effectMultiplier: isTwinHandle(slots.handle?.id || 0) ? 2 : 1,
    remainingEnergyAfterCost: Math.max(0, player.energy - stats.totalCost),
    growingCrystalBonus: 0,
    rng,
    showFeedback: () => undefined,
    ...overrides
  };
};

const getEnemyById = (enemyId: string) => {
  const enemy = Object.values(ENEMIES).find(candidate => candidate.id === enemyId);
  assert(!!enemy, `Enemy ${enemyId} should exist`);
  return JSON.parse(JSON.stringify(enemy!));
};

const findIntentIndex = (enemyId: string, predicate: (intentIndex: number) => boolean): number => {
  const enemy = getEnemyById(enemyId);

  for (let i = 0; i < enemy.intents.length; i++) {
    enemy.currentIntentIndex = i;
    if (predicate(i)) return i;
  }

  throw new Error(`No matching intent found for ${enemyId}`);
};

runSuite('Core combat tests', [
  test('starter weapon calculates base damage and cost', () => {
    const rng = createSeededRng('starter');
    const enemy = JSON.parse(JSON.stringify(ENEMIES.RUST_SLIME));
    const stats = calculateWeaponStats({
      slots: {
        handle: createCardInstance(101, rng),
        head: createCardInstance(103, rng),
        deco: null
      },
      playerBlock: 0,
      weaponsUsedThisTurn: 0,
      enemyStatuses: enemy.statuses,
      growingCrystalBonus: 0
    });

    assertEqual(stats.totalCost, 2, 'Starter weapon cost should be handle + head');
    assertEqual(stats.damage, 6, 'Starter weapon damage should come from the head value');
    assertEqual(stats.block, 0, 'Starter weapon should not produce block');
    assertEqual(stats.hitCount, 1, 'Starter weapon should hit once');
  }),

  test('defensive handle converts weapon damage into block', () => {
    const rng = createSeededRng('defense');
    const enemy = JSON.parse(JSON.stringify(ENEMIES.RUST_SLIME));
    const stats = calculateWeaponStats({
      slots: {
        handle: createCardInstance(102, rng),
        head: createCardInstance(103, rng),
        deco: null
      },
      playerBlock: 0,
      weaponsUsedThisTurn: 0,
      enemyStatuses: enemy.statuses,
      growingCrystalBonus: 0
    });

    assertEqual(stats.damage, 0, 'Defensive weapon should not deal direct damage');
    assertEqual(stats.block, 6, 'Defensive weapon should grant the forged value as block');
  }),

  test('multi-hit cards expose deterministic hit count and damage bonuses', () => {
    const rng = createSeededRng('multi-hit');
    const enemy = JSON.parse(JSON.stringify(ENEMIES.RUST_SLIME));
    const twinHookStats = calculateWeaponStats({
      slots: {
        handle: createCardInstance(101, rng),
        head: createCardInstance(249, rng),
        deco: null
      },
      playerBlock: 0,
      weaponsUsedThisTurn: 0,
      enemyStatuses: enemy.statuses,
      growingCrystalBonus: 0
    });
    const stats = calculateWeaponStats({
      slots: {
        handle: createCardInstance(101, rng),
        head: createCardInstance(233, rng),
        deco: createCardInstance(243, rng)
      },
      playerBlock: 0,
      weaponsUsedThisTurn: 0,
      enemyStatuses: enemy.statuses,
      growingCrystalBonus: 0
    });

    assertEqual(twinHookStats.hitCount, 2, 'Twin Hook Awl should hit twice');
    assertEqual(stats.hitCount, 3, 'Three-pronged awl should hit three times');
    assertEqual(stats.damage, 7, 'Twin needle deco should add the multi-hit bonus');
  }),

  test('status-scaling heads read current enemy status stacks', () => {
    const rng = createSeededRng('status-scaling');
    const enemy = JSON.parse(JSON.stringify(ENEMIES.RUST_SLIME));
    enemy.statuses.bleed = 5;
    const stats = calculateWeaponStats({
      slots: {
        handle: createCardInstance(101, rng),
        head: createCardInstance(209, rng),
        deco: null
      },
      playerBlock: 0,
      weaponsUsedThisTurn: 0,
      enemyStatuses: enemy.statuses,
      growingCrystalBonus: 0
    });

    assertEqual(stats.damage, 10, 'Cog head should gain +1 damage per bleed stack');
  }),

  test('self-damage bonuses use damage taken earlier in the same forge', () => {
    const ctx = createEffectContext({ handle: 318, head: 103, deco: 320 });
    let modifiers: EffectModifiers = {
      finalDamage: ctx.stats.damage,
      finalBlock: ctx.stats.block,
      ignoreBlock: false,
      selfDamage: 0
    };

    const selfDamageActions = executeEffectsForPhase(ctx, modifiers, 'SELF_DAMAGE');
    modifiers = applyModifierActions(modifiers, selfDamageActions);
    const preDamageActions = executeEffectsForPhase(ctx, modifiers, 'PRE_DAMAGE');
    modifiers = applyModifierActions(modifiers, preDamageActions);

    assertEqual(modifiers.selfDamage, 4, 'Blood handle should register 4 self damage');
    assertEqual(modifiers.finalDamage, 10, 'Berserker rune should add the self damage to final damage');
  }),

  test('twin handles double head status application through effect multiplier', () => {
    const ctx = createEffectContext({ handle: 225, head: 203 });
    const actions = executeEffectsForPhase(ctx, {
      finalDamage: ctx.stats.damage,
      finalBlock: ctx.stats.block,
      ignoreBlock: false,
      selfDamage: 0
    }, 'POST_DAMAGE');

    const bleedAction = actions.find(action => action.type === 'ENEMY_APPLY_STATUS' && action.status === 'bleed');
    assert(!!bleedAction, 'Saw blade should apply bleed');
    assertEqual(bleedAction!.type === 'ENEMY_APPLY_STATUS' ? bleedAction!.amount : 0, 6, 'Twin handle should double saw blade bleed application');
  }),

  test('energy and draw loop cards emit explicit effect actions', () => {
    const ctx = createEffectContext({ handle: 222, head: 230, deco: 425 });
    const actions = executeEffectsForPhase(ctx, {
      finalDamage: ctx.stats.damage,
      finalBlock: ctx.stats.block,
      ignoreBlock: false,
      selfDamage: 0
    }, 'POST_DAMAGE');

    assertEqual(actions.filter(action => action.type === 'PLAYER_GAIN_ENERGY').length, 2, 'Handle and head should both restore energy');
    assertEqual(actions.filter(action => action.type === 'DRAW_CARDS').length, 1, 'Infinite battery feather should draw cards');
    assertEqual(actions.filter(action => action.type === 'PLAYER_NEXT_TURN_DRAW').length, 1, 'Infinite battery feather should add next-turn draw');
  }),

  test('counterweight handle rewards the first weapon only', () => {
    const firstWeaponCtx = createEffectContext({ handle: 248, head: 249 });
    const firstWeaponActions = executeEffectsForPhase(firstWeaponCtx, {
      finalDamage: firstWeaponCtx.stats.damage,
      finalBlock: firstWeaponCtx.stats.block,
      ignoreBlock: false,
      selfDamage: 0
    }, 'POST_DAMAGE');
    const laterWeaponCtx = createEffectContext(
      { handle: 248, head: 249 },
      { player: createPlayer({ weaponsUsedThisTurn: 1 }) }
    );
    const laterWeaponActions = executeEffectsForPhase(laterWeaponCtx, {
      finalDamage: laterWeaponCtx.stats.damage,
      finalBlock: laterWeaponCtx.stats.block,
      ignoreBlock: false,
      selfDamage: 0
    }, 'POST_DAMAGE');

    assertEqual(firstWeaponActions.filter(action => action.type === 'DRAW_CARDS').length, 1, 'Counterweight Handle should draw on the first weapon');
    assertEqual(laterWeaponActions.filter(action => action.type === 'DRAW_CARDS').length, 0, 'Counterweight Handle should not draw after another weapon was forged');
  }),

  test('turn-start statuses tick poison, burn, weak, vulnerable, and stun predictably', () => {
    const result = resolveEnemyTurnStartStatuses({
      poison: 4,
      bleed: 2,
      stunned: 0,
      strength: 0,
      vulnerable: 2,
      weak: 1,
      burn: 3
    });

    assertEqual(result.poisonDamage, 4, 'Poison should deal current stack damage');
    assertEqual(result.burnDamage, 3, 'Burn should deal current stack damage');
    assertEqual(result.statuses.poison, 3, 'Poison should decay by one');
    assertEqual(result.statuses.burn, 3, 'Burn should not decay');
    assertEqual(result.statuses.vulnerable, 1, 'Vulnerable should decay by one');
    assertEqual(result.statuses.weak, 0, 'Weak should decay by one');
  }),

  test('blocked damage exposes unblocked damage and remaining block', () => {
    assertDeepEqual(calculateBlockedDamage(9, 4), { unblockedDamage: 5, nextBlock: 0 }, 'Damage above block should spill over');
    assertDeepEqual(calculateBlockedDamage(3, 8), { unblockedDamage: 0, nextBlock: 5 }, 'Damage below block should preserve the remainder');
  }),

  test('combat effect reducer applies card effects without UI state', () => {
    const enemy = getEnemyById('rust_slime');
    enemy.currentHp = 4;
    const result = applyCombatEffectActions({
      player: createPlayer({ hp: 20, maxHp: 30, energy: 2, maxEnergy: 3, block: 2 }),
      enemy,
      modifiers: {
        finalDamage: 5,
        finalBlock: 0,
        ignoreBlock: false,
        selfDamage: 0
      },
      growingCrystalBonus: 2
    }, [
      { type: 'MODIFY_DAMAGE', amount: 3, mode: 'add' },
      { type: 'MODIFY_DAMAGE', amount: 2, mode: 'multiply' },
      { type: 'MODIFY_BLOCK', amount: 4, mode: 'add' },
      { type: 'MODIFY_BLOCK', amount: 2, mode: 'multiply' },
      { type: 'SET_IGNORE_BLOCK', value: true },
      { type: 'PLAYER_SELF_DAMAGE', amount: 4 },
      { type: 'PLAYER_HEAL', amount: 20 },
      { type: 'PLAYER_GAIN_ENERGY', amount: 5 },
      { type: 'PLAYER_GAIN_BLOCK', amount: 3 },
      { type: 'PLAYER_REDUCE_BLOCK', amount: 7 },
      { type: 'PLAYER_GAIN_GOLD', amount: 9 },
      { type: 'PLAYER_SET_DODGE', value: true },
      { type: 'PLAYER_OVERHEAT', amount: 1 },
      { type: 'PLAYER_NEXT_TURN_DRAW', amount: 2 },
      { type: 'ENEMY_APPLY_STATUS', status: 'poison', amount: 3 },
      { type: 'ENEMY_SKIP_INTENT' },
      { type: 'ENEMY_EXECUTE_THRESHOLD', threshold: 0.2 },
      { type: 'DRAW_CARDS', count: 2 },
      { type: 'CREATE_REPLICA', baseDamage: 11 },
      { type: 'GROW_CRYSTAL', amount: 2, max: 3 }
    ]);

    assertEqual(result.player.hp, 28, 'Block reduction overflow should damage HP after self-damage and healing');
    assertEqual(result.player.energy, 3, 'Energy recovery should cap at max energy like runtime combat');
    assertEqual(result.player.block, 0, 'Block reduction should consume all available block');
    assertEqual(result.player.gold, 9, 'Gold gain should apply to the player');
    assert(result.player.dodgeNextAttack, 'Dodge flag should be preserved on the player');
    assertEqual(result.player.overheat, 1, 'Overheat should accumulate on the player');
    assertEqual(result.player.nextTurnDraw, 2, 'Next-turn draw should accumulate on the player');
    assertEqual(result.player.selfDamageThisTurn, 4, 'Self damage should be tracked for the turn');
    assertEqual(result.modifiers.finalDamage, 16, 'Damage modifiers should be applied in order');
    assertEqual(result.modifiers.finalBlock, 8, 'Block modifiers should be applied in order');
    assert(result.modifiers.ignoreBlock, 'Ignore-block modifier should be preserved');
    assertEqual(result.modifiers.selfDamage, 4, 'Self damage should update effect modifiers');
    assertEqual(result.enemy.statuses.poison, 3, 'Enemy status application should be pure and inspectable');
    assertEqual(result.enemy.currentIntentIndex, 1, 'Intent skip should advance the enemy intent');
    assertEqual(result.enemy.currentHp, 0, 'Execute threshold should defeat low-HP enemies');
    assertEqual(result.growingCrystalBonus, 3, 'Growing crystal should respect its maximum');
    assertDeepEqual(result.sideEffects, [
      { type: 'DRAW_CARDS', count: 2 },
      { type: 'CREATE_REPLICA', baseDamage: 11 }
    ], 'Deck-changing effects should be exposed as explicit side effects');
  }),

  test('enemy turn resolver applies attacks, block, thievery, and intent advance without UI', () => {
    const enemy = getEnemyById('loot_goblin');
    const result = resolveEnemyTurn(enemy, createPlayer({ hp: 30, block: 4, gold: 12 }));

    assertEqual(result.player.hp, 24, 'Enemy attack should deal only unblocked damage');
    assertEqual(result.player.block, 0, 'Enemy attack should consume block');
    assertEqual(result.player.gold, 7, 'Thievery should steal gold on unblocked damage');
    assertEqual(result.enemy.currentIntentIndex, 1, 'Enemy turn should advance intent after acting');
    assert(
      result.events.some(event => event.type === 'ATTACK_HIT' && event.damage === 6 && event.stolenGold === 5),
      'Enemy turn events should expose attack damage and stolen gold'
    );
  }),

  test('enemy turn resolver exposes cost, junk, and cleanse side effects', () => {
    const player = createPlayer();
    const hammerhead = getEnemyById('hammerhead');
    hammerhead.currentIntentIndex = findIntentIndex('hammerhead', index => hammerhead.intents[index].type === IntentType.DEBUFF);
    const hammerResult = resolveEnemyTurn(hammerhead, player);

    assertDeepEqual(hammerResult.sideEffects, [
      { type: 'INCREASE_RANDOM_HANDLE_COST', amount: 1 }
    ], 'Handle cost pressure should be a deck side effect');

    const caveHeart = getEnemyById('cave_heart');
    caveHeart.currentIntentIndex = findIntentIndex('cave_heart', index => caveHeart.intents[index].effect?.type === 'ADD_JUNK');
    const junkResult = resolveEnemyTurn(caveHeart, player);

    assertDeepEqual(junkResult.sideEffects, [
      { type: 'ADD_JUNK', count: 1 }
    ], 'Deck pollution should be an explicit side effect');

    const sporeTotem = getEnemyById('spore_totem');
    sporeTotem.statuses.poison = 2;
    sporeTotem.statuses.burn = 1;
    sporeTotem.currentIntentIndex = findIntentIndex('spore_totem', index => sporeTotem.intents[index].effect?.type === 'CLEANSE_STATUSES_GAIN_STRENGTH');
    const cleanseResult = resolveEnemyTurn(sporeTotem, player);

    assertEqual(cleanseResult.enemy.statuses.poison, 0, 'Cleanse should clear poison');
    assertEqual(cleanseResult.enemy.statuses.burn, 0, 'Cleanse should clear burn');
    assertEqual(cleanseResult.enemy.statuses.strength, 2, 'Cleanse should convert remaining turn-start status stacks into strength');
    assert(
      cleanseResult.events.some(event => event.type === 'ENEMY_CLEANSE_STRENGTH' && event.amount === 2),
      'Cleanse strength gain should be visible as an enemy turn event'
    );
  }),

  test('combat cleanup restores temporary cost debuffs without erasing card identity', () => {
    const handle = createCardInstance(101);
    const head = createCardInstance(103);
    const replica = createCardInstance(801);
    const junk = createCardInstance(901);
    const originalHandleInstanceId = handle.instanceId;

    handle.cost += 3;
    head.cost += 2;
    replica.value = 17;
    replica.description = 'Copied weapon payload should survive cleanup.';
    replica.cost = 2;

    const cleaned = resetTemporaryDeckModifiers(cleanJunkFromDeck([handle, head, replica, junk]));

    assertEqual(cleaned.length, 3, 'Combat cleanup should remove temporary junk cards');
    assertEqual(cleaned.find(card => card.id === 101)?.cost, 1, 'Temporary handle cost increases should reset after combat');
    assertEqual(cleaned.find(card => card.id === 103)?.cost, 1, 'Temporary head cost increases should reset after combat');
    assertEqual(cleaned.find(card => card.id === 801)?.cost, 0, 'Generated replicas should reset temporary cost changes');
    assertEqual(cleaned.find(card => card.id === 801)?.value, 17, 'Cleanup should preserve non-cost generated card payloads');
    assertEqual(cleaned.find(card => card.id === 101)?.instanceId, originalHandleInstanceId, 'Cleanup should preserve card instance identity');
  })
]);

runSuite('Enemy pattern tests', [
  test('enemy roster meets commercial act and tier coverage targets', () => {
    const enemies = Object.values(ENEMIES);
    const enemyIds = enemies.map(enemy => enemy.id);
    const staticEnemyObjects = new Set(enemies);

    assert(enemies.length >= 35 && enemies.length <= 45, 'Enemy roster should stay within the 35-45 target range');
    assertEqual(new Set(enemyIds).size, enemyIds.length, 'Enemy ids should be unique');

    for (const act of [1, 2, 3] as const) {
      const common = ENEMY_POOLS[act][EnemyTier.COMMON];
      const elite = ENEMY_POOLS[act][EnemyTier.ELITE];
      const boss = ENEMY_POOLS[act][EnemyTier.BOSS];
      const actPool = [...common, ...elite, ...boss];

      assert(common.length >= 6, `Act ${act} should have at least 6 common enemies`);
      assert(elite.length >= 3, `Act ${act} should have at least 3 elite enemies`);
      assert(boss.length >= 2, `Act ${act} should have at least 2 boss candidates`);
      assertEqual(new Set(actPool.map(enemy => enemy.id)).size, actPool.length, `Act ${act} enemy pool should not repeat candidates`);

      for (const enemy of common) assertEqual(enemy.tier, EnemyTier.COMMON, `${enemy.id} should be in the common tier`);
      for (const enemy of elite) assertEqual(enemy.tier, EnemyTier.ELITE, `${enemy.id} should be in the elite tier`);
      for (const enemy of boss) assertEqual(enemy.tier, EnemyTier.BOSS, `${enemy.id} should be in the boss tier`);
      for (const enemy of actPool) assert(staticEnemyObjects.has(enemy), `${enemy.id} should come from static ENEMIES`);
    }
  }),

  test('structured enemy intent plans preserve special enemy counter patterns', () => {
    const player = createPlayer({ block: 12, weaponsUsedThisTurn: 3 });
    const hammerhead = getEnemyById('hammerhead');
    hammerhead.currentIntentIndex = findIntentIndex('hammerhead', index =>
      hammerhead.intents[index].effect?.type === 'INCREASE_RANDOM_HANDLE_COST' ||
      hammerhead.intents[index].type === IntentType.DEBUFF
    );
    assertEqual(calculateEnemyIntentPlan(hammerhead, player).handleCostIncrease, 1, 'Hammerhead should pressure handle costs');

    const deus = getEnemyById('deus_ex_machina');
    deus.currentIntentIndex = findIntentIndex('deus_ex_machina', index => deus.intents[index].effect?.type === 'SET_PLAYER_COST_LIMIT');
    assertEqual(calculateEnemyIntentPlan(deus, player).costLimit, 2, 'Deus Ex Machina should set a cost limit');

    const smith = getEnemyById('corrupted_smith');
    smith.currentIntentIndex = findIntentIndex('corrupted_smith', index => smith.intents[index].effect?.type === 'DISARM_HEAD');
    assert(calculateEnemyIntentPlan(smith, player).disarmsHead, 'Corrupted Smith should disarm head cards');

    const mimic = getEnemyById('mimic_anvil');
    mimic.damageTakenThisTurn = 17;
    mimic.currentIntentIndex = findIntentIndex('mimic_anvil', index => mimic.intents[index].effect?.type === 'REFLECT_DAMAGE_TAKEN');
    assertEqual(calculateEnemyIntentPlan(mimic, player).attackDamage, 17, 'Mimic Anvil should reflect damage taken this turn');
  }),

  test('enemy plans include defense, combo, cleanse, heal, and junk effects', () => {
    const player = createPlayer({ block: 10, weaponsUsedThisTurn: 4 });
    const blockCounter = getEnemyById('shield_mite');
    blockCounter.currentIntentIndex = findIntentIndex('shield_mite', index => blockCounter.intents[index].effect?.type === 'ATTACK_FROM_PLAYER_BLOCK');
    assertEqual(calculateEnemyIntentPlan(blockCounter, player).blockCounterBonus, 5, 'Block counter should scale from player block');

    const comboCounter = getEnemyById('paradox_jailer');
    comboCounter.currentIntentIndex = findIntentIndex('paradox_jailer', index => comboCounter.intents[index].effect?.type === 'ATTACK_FROM_WEAPONS_USED');
    assertEqual(calculateEnemyIntentPlan(comboCounter, player).weaponCounterBonus, 8, 'Combo counter should scale from weapons used');

    const cleanser = getEnemyById('spore_totem');
    cleanser.statuses.poison = 2;
    cleanser.statuses.burn = 1;
    cleanser.currentIntentIndex = findIntentIndex('spore_totem', index => cleanser.intents[index].effect?.type === 'CLEANSE_STATUSES_GAIN_STRENGTH');
    assertEqual(calculateEnemyIntentPlan(cleanser, player).statusCleanseStrengthGain, 3, 'Cleanse should convert status stacks into strength');

    const healer = getEnemyById('gear_leech');
    healer.currentIntentIndex = findIntentIndex('gear_leech', index => healer.intents[index].effect?.type === 'HEAL_SELF');
    assertEqual(calculateEnemyIntentPlan(healer, player).healAmount, 15, 'Healer intent should expose heal amount');

    const polluter = getEnemyById('cave_heart');
    polluter.currentIntentIndex = findIntentIndex('cave_heart', index => polluter.intents[index].effect?.type === 'ADD_JUNK');
    assertEqual(
      calculateEnemyIntentPlan(polluter, player).junkCount,
      polluter.intents[polluter.currentIntentIndex].effect?.type === 'ADD_JUNK'
        ? polluter.intents[polluter.currentIntentIndex].effect.count
        : 0,
      'Junk intent should expose configured junk count'
    );
  }),

  test('each act pool covers the required enemy pressure families', () => {
    const requiredFamilies = ['statusCounter', 'defenseCounter', 'multiHitPressure', 'costPressure', 'deckPollution'] as const;

    for (const act of [1, 2, 3] as const) {
      const enemies = Object.values(ENEMY_POOLS[act]).flat();

      const coverage = {
        statusCounter: enemies.some(enemy => enemy.intents.some(intent => intent.effect?.type === 'CLEANSE_STATUSES_GAIN_STRENGTH')),
        defenseCounter: enemies.some(enemy => enemy.intents.some(intent => intent.effect?.type === 'ATTACK_FROM_PLAYER_BLOCK')),
        multiHitPressure: enemies.some(enemy => enemy.intents.some(intent => (intent.hits || 1) > 1 || intent.description.includes('(x3)'))),
        costPressure: enemies.some(enemy => enemy.intents.some(intent =>
          intent.effect?.type === 'SET_PLAYER_COST_LIMIT' ||
          intent.effect?.type === 'INCREASE_RANDOM_HANDLE_COST' ||
          (enemy.id === 'hammerhead' && intent.type === IntentType.DEBUFF)
        )),
        deckPollution: enemies.some(enemy => enemy.intents.some(intent =>
          intent.effect?.type === 'ADD_JUNK' ||
          (intent.type === IntentType.DEBUFF && !intent.effect && enemy.id !== 'hammerhead' && enemy.id !== 'deus_ex_machina')
        ))
      };

      for (const family of requiredFamilies) {
        assert(coverage[family], `Act ${act} should include ${family}`);
      }
    }
  }),

  test('strength gain helper makes random and fixed buffs deterministic under seeded RNG', () => {
    const kobold = getEnemyById('kobold_scrapper');
    kobold.currentIntentIndex = findIntentIndex('kobold_scrapper', index => kobold.intents[index].type === IntentType.BUFF);
    assertEqual(calculateEnemyStrengthGain(kobold, kobold.intents[kobold.currentIntentIndex], () => 0), 1, 'Kobold minimum random strength should be 1');
    assertEqual(calculateEnemyStrengthGain(kobold, kobold.intents[kobold.currentIntentIndex], () => 0.99), 3, 'Kobold maximum random strength should be 3');

    const ledgerWraith = getEnemyById('ledger_wraith');
    ledgerWraith.currentIntentIndex = findIntentIndex('ledger_wraith', index => ledgerWraith.intents[index].effect?.type === 'GAIN_STRENGTH');
    assertEqual(calculateEnemyStrengthGain(ledgerWraith, ledgerWraith.intents[ledgerWraith.currentIntentIndex], () => 0.5), 3, 'Fixed strength gain should ignore RNG');
  })
]);

runSuite('Static reward, map, and archetype tests', [
  test('map layouts expose all required node types in every act', () => {
    const requiredNodeTypes = [NodeType.COMBAT, NodeType.ELITE, NodeType.REST, NodeType.SHOP, NodeType.EVENT, NodeType.BOSS];

    for (const act of [1, 2, 3] as const) {
      const rows = MAP_NODE_LAYOUTS[act];
      const nodeTypes = rows.flat();

      assertEqual(rows.length, 15, `Act ${act} should keep the 15-floor map structure`);
      assertEqual(rows[rows.length - 1].length, 1, `Act ${act} final row should be a single boss node`);
      assertEqual(rows[rows.length - 1][0], NodeType.BOSS, `Act ${act} final row should route to the boss`);

      for (const nodeType of requiredNodeTypes) {
        assert(nodeTypes.includes(nodeType), `Act ${act} should include ${nodeType} nodes`);
      }
    }
  }),

  test('early act one combats use onboarding-safe enemies', () => {
    const earlyEnemyIds = new Set(['rust_slime', 'kobold_scrapper', 'skeleton_warrior', 'mine_bat']);

    for (let seed = 1; seed <= 20; seed++) {
      const map = createActMap(1, createSeededRng(`opening-${seed}`));
      const earlyCombats = map.filter(node => node.floor <= 3 && node.type === NodeType.COMBAT);

      assert(earlyCombats.length > 0, 'Act one early floors should have combat nodes');
      for (const combat of earlyCombats) {
        assert(!!combat.enemyId, 'Act one early combat should have an enemy');
        assert(earlyEnemyIds.has(combat.enemyId!), `Early act one combat should not start with a counter enemy, got ${combat.enemyId}`);
      }
    }
  }),

  test('static reward, shop, boss reward, and event tables are complete', () => {
    assertDeepEqual(Object.keys(COMBAT_REWARD_RULES).sort(), ['BOSS', 'COMMON', 'ELITE'], 'Combat reward rules should cover every enemy reward tier');
    for (const rule of Object.values(COMBAT_REWARD_RULES)) {
      assert(rule.gold.min > 0 && rule.gold.max >= rule.gold.min, `${rule.id} gold reward range should be valid`);
      assert(rule.cardOptionCount >= 3, `${rule.id} should offer at least three card choices`);
      assert(rule.cardRarities.every(rarity => [CardRarity.COMMON, CardRarity.RARE, CardRarity.LEGEND].includes(rarity)), `${rule.id} should only use reward-pool rarities`);
    }

    assertDeepEqual(SHOP_ITEMS.map(item => item.id).sort(), ['ENERGY', 'HEAL', 'RARE', 'REMOVE'], 'Shop should expose the full static item set');
    assertEqual(new Set(SHOP_ITEMS.map(item => item.id)).size, SHOP_ITEMS.length, 'Shop item ids should be unique');
    for (const item of SHOP_ITEMS) {
      assert(item.price > 0, `${item.id} should have a positive price`);
      assert(!!item.name && !!item.description, `${item.id} should have display copy`);
    }

    assertDeepEqual(BOSS_REWARDS.map(reward => reward.id).sort(), ['ENERGY', 'GOLD', 'MAX_HP'], 'Boss rewards should expose the full static reward set');
    assertEqual(new Set(BOSS_REWARDS.map(reward => reward.id)).size, BOSS_REWARDS.length, 'Boss reward ids should be unique');
    for (const reward of BOSS_REWARDS) {
      assert(!!reward.name && !!reward.description && !!reward.feedback, `${reward.id} should have reward copy and feedback`);
    }

    const validEventTypes: EventOptionType[] = ['HEAL', 'DAMAGE', 'GAIN_CARD_RARE', 'REMOVE_CARD', 'GAIN_GOLD', 'LOSE_GOLD', 'FULL_HEAL', 'RANDOM_UPGRADE', 'LEAVE'];
    assert(GAME_EVENTS.length >= 6, 'Event pool should have enough static events for route variety');
    for (const event of GAME_EVENTS) {
      assert(event.options.length >= 2, `${event.id} should offer at least two choices`);
      for (const option of event.options) {
        assert(validEventTypes.includes(option.type), `${event.id} option should use a supported event type`);
        if (option.cost !== undefined) {
          assert(option.cost > 0, `${event.id} option cost should be positive`);
          assert(!!option.costResource, `${event.id} option with a cost should define a cost resource`);
        }
      }
    }
  }),

  test('reward generation is deterministic when seeded', () => {
    const rule = getCombatRewardRule(EnemyTier.COMMON);
    const firstRng = createSeededRng('reward-seed');
    const secondRng = createSeededRng('reward-seed');
    const firstRewardIds = createCombatCardRewards(rule, firstRng).map(card => card.id);
    const secondRewardIds = createCombatCardRewards(rule, secondRng).map(card => card.id);

    assertDeepEqual(firstRewardIds, secondRewardIds, 'Seeded card rewards should be repeatable');
    assertEqual(rollGoldReward(rule, () => 0), rule.gold.min, 'Gold reward should include minimum bound');
    assertEqual(rollGoldReward(rule, () => 0.999), rule.gold.max, 'Gold reward should include maximum bound');
    assertEqual(createRandomCardReward(CardRarity.RARE, CardType.HEAD, () => 0).type, CardType.HEAD, 'Random typed rewards should honor requested slot');
  }),

  test('archetypes have entry, mid, late, and all slot connections', () => {
    for (const archetype of CARD_ARCHETYPES) {
      assert(archetype.entryCardIds.length > 0, `${archetype.name} should have entry cards`);
      assert(archetype.midCardIds.length > 0, `${archetype.name} should have mid cards`);
      assert(archetype.lateCardIds.length > 0, `${archetype.name} should have late cards`);
      assert(archetype.slotCardIds[CardType.HANDLE].length > 0, `${archetype.name} should have handle cards`);
      assert(archetype.slotCardIds[CardType.HEAD].length > 0, `${archetype.name} should have head cards`);
      assert(archetype.slotCardIds[CardType.DECO].length > 0, `${archetype.name} should have deco cards`);
    }
  })
]);
