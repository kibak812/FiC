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
  executeEffectsForPhase,
  isTwinHandle
} from '../utils/cardEffects';
import type {
  CardEffectContext,
  EffectAction,
  EffectModifiers,
  EffectPhase,
  SlotType
} from '../utils/cardEffects';
import {
  applyCombatEffectActions,
  calculateBlockedDamage,
  calculateEnemyIntentPlan,
  calculateEnemyStrengthGain,
  calculateWeaponStats,
  resolveEnemyTurn,
  resolvePlayerWeaponAttack,
  resolveEnemyTurnStartStatuses
} from '../utils/combatEngine';
import {
  createCombatRewardBundle,
  createCombatCardRewards,
  createRandomCardReward,
  getCombatRewardRule,
  resolveBossReward,
  resolveShopPurchase,
  rollGoldReward,
  scoreCombatRewardCandidate
} from '../utils/rewardUtils';
import {
  applyEventOptionCost,
  canPayEventOption,
  resolveEventCardRemoval,
  resolveEventOption
} from '../utils/eventUtils';
import { createRunLearningFeedback, RunLearningSnapshot } from '../utils/learningFeedback';
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

const calculateStatsForCards = (
  cardIds: { handle: number; head: number; deco?: number },
  overrides: {
    playerBlock?: number;
    weaponsUsedThisTurn?: number;
    enemyStatuses?: Partial<typeof ENEMIES.RUST_SLIME.statuses>;
    growingCrystalBonus?: number;
  } = {}
) => {
  const rng = createSeededRng(`stats-${cardIds.handle}-${cardIds.head}-${cardIds.deco || 0}`);

  return calculateWeaponStats({
    slots: {
      handle: createCardInstance(cardIds.handle, rng),
      head: createCardInstance(cardIds.head, rng),
      deco: cardIds.deco ? createCardInstance(cardIds.deco, rng) : null
    },
    playerBlock: overrides.playerBlock || 0,
    weaponsUsedThisTurn: overrides.weaponsUsedThisTurn || 0,
    enemyStatuses: {
      ...ENEMIES.RUST_SLIME.statuses,
      ...(overrides.enemyStatuses || {})
    },
    growingCrystalBonus: overrides.growingCrystalBonus || 0
  });
};

type ExpectedEffectAction = {
  type: EffectAction['type'];
  [key: string]: string | number | boolean;
};

type CardEffectRegressionCase = {
  label: string;
  cardId: number;
  slot: SlotType;
  phase: EffectPhase;
  expected: ExpectedEffectAction[];
  modifiers?: Partial<EffectModifiers>;
  overrides?: Partial<CardEffectContext>;
};

const createContextForEffectCase = (currentCase: CardEffectRegressionCase): CardEffectContext => {
  if (currentCase.slot === 'handle') {
    return createEffectContext({ handle: currentCase.cardId, head: 103 }, currentCase.overrides);
  }

  if (currentCase.slot === 'head') {
    return createEffectContext({ handle: 101, head: currentCase.cardId }, currentCase.overrides);
  }

  return createEffectContext({ handle: 101, head: 103, deco: currentCase.cardId }, currentCase.overrides);
};

const createEffectModifiers = (
  ctx: CardEffectContext,
  overrides: Partial<EffectModifiers> = {}
): EffectModifiers => ({
  finalDamage: ctx.stats.damage,
  finalBlock: ctx.stats.block,
  ignoreBlock: false,
  selfDamage: 0,
  ...overrides
});

const effectActionMatches = (action: EffectAction, expected: ExpectedEffectAction): boolean => {
  const actionRecord = action as unknown as Record<string, unknown>;

  return Object.entries(expected).every(([key, value]) => actionRecord[key] === value);
};

const assertActionsInclude = (
  actions: EffectAction[],
  expectedActions: ExpectedEffectAction[],
  label: string
): void => {
  const missingActions = expectedActions.filter(expected =>
    !actions.some(action => effectActionMatches(action, expected))
  );

  assert(
    missingActions.length === 0,
    `${label} expected actions ${JSON.stringify(missingActions)} in ${JSON.stringify(actions)}`
  );
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

  test('registered card effects expose expected actions across all combat phases', () => {
    const preDamageCases: CardEffectRegressionCase[] = [
      {
        label: 'Gambler handle sets deterministic preview damage from RNG',
        cardId: 309,
        slot: 'handle',
        phase: 'PRE_DAMAGE',
        overrides: { rng: () => 0.99 },
        expected: [{ type: 'MODIFY_DAMAGE', amount: 18, mode: 'set' }]
      },
      {
        label: 'Capacitor converts floating energy into damage',
        cardId: 211,
        slot: 'deco',
        phase: 'PRE_DAMAGE',
        overrides: { remainingEnergyAfterCost: 2 },
        expected: [{ type: 'MODIFY_DAMAGE', amount: 8, mode: 'add' }]
      },
      {
        label: 'Piercing handle ignores enemy block',
        cardId: 317,
        slot: 'handle',
        phase: 'PRE_DAMAGE',
        expected: [{ type: 'SET_IGNORE_BLOCK', value: true }]
      },
      {
        label: 'Berserker rune converts self damage into damage',
        cardId: 320,
        slot: 'deco',
        phase: 'PRE_DAMAGE',
        modifiers: { selfDamage: 5 },
        expected: [{ type: 'MODIFY_DAMAGE', amount: 5, mode: 'add' }]
      },
      {
        label: 'Dragon sigil doubles final damage',
        cardId: 413,
        slot: 'deco',
        phase: 'PRE_DAMAGE',
        expected: [{ type: 'MODIFY_DAMAGE', amount: 2, mode: 'multiply' }]
      },
      {
        label: 'Bloodstone rune scales from self damage',
        cardId: 337,
        slot: 'deco',
        phase: 'PRE_DAMAGE',
        modifiers: { selfDamage: 5 },
        expected: [{ type: 'MODIFY_DAMAGE', amount: 5, mode: 'add' }]
      },
      {
        label: 'Heart shard doubles self-damage scaling',
        cardId: 422,
        slot: 'deco',
        phase: 'PRE_DAMAGE',
        modifiers: { selfDamage: 5 },
        expected: [{ type: 'MODIFY_DAMAGE', amount: 10, mode: 'add' }]
      }
    ];
    const selfDamageCases: CardEffectRegressionCase[] = [
      { label: 'Blood handle self damage', cardId: 318, slot: 'handle', phase: 'SELF_DAMAGE', expected: [{ type: 'PLAYER_SELF_DAMAGE', amount: 4 }] },
      { label: 'Frenzy blade self damage', cardId: 314, slot: 'head', phase: 'SELF_DAMAGE', expected: [{ type: 'PLAYER_SELF_DAMAGE', amount: 4 }] },
      { label: 'Pain grip self damage', cardId: 216, slot: 'handle', phase: 'SELF_DAMAGE', expected: [{ type: 'PLAYER_SELF_DAMAGE', amount: 2 }] },
      { label: 'Pain edge self damage', cardId: 226, slot: 'head', phase: 'SELF_DAMAGE', expected: [{ type: 'PLAYER_SELF_DAMAGE', amount: 2 }] },
      { label: 'Pain charm self damage', cardId: 236, slot: 'deco', phase: 'SELF_DAMAGE', expected: [{ type: 'PLAYER_SELF_DAMAGE', amount: 2 }] },
      { label: 'Blood spike self damage', cardId: 321, slot: 'handle', phase: 'SELF_DAMAGE', expected: [{ type: 'PLAYER_SELF_DAMAGE', amount: 4 }] },
      { label: 'Blood blade self damage', cardId: 329, slot: 'head', phase: 'SELF_DAMAGE', expected: [{ type: 'PLAYER_SELF_DAMAGE', amount: 4 }] },
      { label: 'Bloodstone rune self damage', cardId: 337, slot: 'deco', phase: 'SELF_DAMAGE', expected: [{ type: 'PLAYER_SELF_DAMAGE', amount: 3 }] },
      { label: 'Giant grip self damage', cardId: 414, slot: 'handle', phase: 'SELF_DAMAGE', expected: [{ type: 'PLAYER_SELF_DAMAGE', amount: 8 }] },
      { label: 'Void crystal self damage', cardId: 418, slot: 'head', phase: 'SELF_DAMAGE', expected: [{ type: 'PLAYER_SELF_DAMAGE', amount: 8 }] },
      { label: 'Heart shard self damage', cardId: 422, slot: 'deco', phase: 'SELF_DAMAGE', expected: [{ type: 'PLAYER_SELF_DAMAGE', amount: 4 }] }
    ];
    const onHitCases: CardEffectRegressionCase[] = [
      { label: 'Midas touch grants gold per hit', cardId: 307, slot: 'handle', phase: 'ON_HIT', expected: [{ type: 'PLAYER_GAIN_GOLD', amount: 5 }] },
      {
        label: 'Vampiric handle heals from hit damage',
        cardId: 302,
        slot: 'handle',
        phase: 'ON_HIT',
        modifiers: { finalDamage: 9 },
        expected: [{ type: 'PLAYER_HEAL', amount: 4 }]
      }
    ];
    const postDamageCases: CardEffectRegressionCase[] = [
      { label: 'Swift dagger hilt applies weak', cardId: 201, slot: 'handle', phase: 'POST_DAMAGE', expected: [{ type: 'ENEMY_APPLY_STATUS', status: 'weak', amount: 1 }] },
      { label: 'Bone handle applies vulnerable', cardId: 206, slot: 'handle', phase: 'POST_DAMAGE', expected: [{ type: 'ENEMY_APPLY_STATUS', status: 'vulnerable', amount: 2 }] },
      { label: 'Charged gem restores energy', cardId: 208, slot: 'deco', phase: 'POST_DAMAGE', expected: [{ type: 'PLAYER_GAIN_ENERGY', amount: 1 }] },
      { label: 'Meteor shard hurts the player', cardId: 404, slot: 'head', phase: 'POST_DAMAGE', expected: [{ type: 'PLAYER_SELF_DAMAGE', amount: 6 }] },
      { label: 'Serrated blade applies bleed', cardId: 203, slot: 'head', phase: 'POST_DAMAGE', expected: [{ type: 'ENEMY_APPLY_STATUS', status: 'bleed', amount: 3 }] },
      { label: 'Flamethrower applies burn', cardId: 303, slot: 'head', phase: 'POST_DAMAGE', expected: [{ type: 'ENEMY_APPLY_STATUS', status: 'burn', amount: 3 }] },
      { label: 'Poison vial applies poison', cardId: 205, slot: 'deco', phase: 'POST_DAMAGE', expected: [{ type: 'ENEMY_APPLY_STATUS', status: 'poison', amount: 4 }] },
      { label: 'Furnace blade reduces player block', cardId: 304, slot: 'head', phase: 'POST_DAMAGE', expected: [{ type: 'PLAYER_REDUCE_BLOCK', amount: 5 }] },
      { label: 'Thunder handle applies stun', cardId: 401, slot: 'handle', phase: 'POST_DAMAGE', expected: [{ type: 'ENEMY_APPLY_STATUS', status: 'stunned', amount: 1 }] },
      { label: 'Light feather draws immediately', cardId: 204, slot: 'deco', phase: 'POST_DAMAGE', expected: [{ type: 'DRAW_CARDS', count: 1 }] },
      { label: 'Starter feather draws next turn', cardId: 106, slot: 'deco', phase: 'POST_DAMAGE', expected: [{ type: 'PLAYER_NEXT_TURN_DRAW', amount: 1 }] },
      { label: 'Echo forge creates a replica side effect', cardId: 305, slot: 'deco', phase: 'POST_DAMAGE', expected: [{ type: 'CREATE_REPLICA', baseDamage: 6 }] },
      { label: 'Lightweight handle draws on low-cost weapons', cardId: 212, slot: 'handle', phase: 'POST_DAMAGE', expected: [{ type: 'DRAW_CARDS', count: 1 }] },
      { label: 'Counterweight handle draws on the first weapon', cardId: 248, slot: 'handle', phase: 'POST_DAMAGE', expected: [{ type: 'DRAW_CARDS', count: 1 }] },
      { label: 'Blunt club applies weak', cardId: 214, slot: 'head', phase: 'POST_DAMAGE', expected: [{ type: 'ENEMY_APPLY_STATUS', status: 'weak', amount: 1 }] },
      { label: 'Furnace core adds overheat', cardId: 308, slot: 'head', phase: 'POST_DAMAGE', expected: [{ type: 'PLAYER_OVERHEAT', amount: 1 }] },
      { label: 'Lava blade applies stronger burn', cardId: 312, slot: 'head', phase: 'POST_DAMAGE', expected: [{ type: 'ENEMY_APPLY_STATUS', status: 'burn', amount: 4 }] },
      { label: 'Agile blade draws next turn', cardId: 215, slot: 'head', phase: 'POST_DAMAGE', expected: [{ type: 'PLAYER_NEXT_TURN_DRAW', amount: 1 }] },
      { label: 'Weakening sigil applies weak', cardId: 219, slot: 'deco', phase: 'POST_DAMAGE', expected: [{ type: 'ENEMY_APPLY_STATUS', status: 'weak', amount: 1 }] },
      { label: 'Mana blade restores energy', cardId: 313, slot: 'head', phase: 'POST_DAMAGE', expected: [{ type: 'PLAYER_GAIN_ENERGY', amount: 1 }] },
      { label: 'Blood whetstone applies bleed', cardId: 319, slot: 'deco', phase: 'POST_DAMAGE', expected: [{ type: 'ENEMY_APPLY_STATUS', status: 'bleed', amount: 2 }] },
      { label: 'Frost blade applies stun', cardId: 408, slot: 'head', phase: 'POST_DAMAGE', expected: [{ type: 'ENEMY_APPLY_STATUS', status: 'stunned', amount: 1 }] },
      { label: 'Executioner blade exposes execute threshold', cardId: 409, slot: 'head', phase: 'POST_DAMAGE', expected: [{ type: 'ENEMY_EXECUTE_THRESHOLD', threshold: 0.2 }] },
      { label: 'Evasion handle sets dodge', cardId: 412, slot: 'handle', phase: 'POST_DAMAGE', expected: [{ type: 'PLAYER_SET_DODGE', value: true }] },
      {
        label: 'Time cog stuns and skips the next intent',
        cardId: 406,
        slot: 'head',
        phase: 'POST_DAMAGE',
        expected: [
          { type: 'ENEMY_APPLY_STATUS', status: 'stunned', amount: 1 },
          { type: 'ENEMY_SKIP_INTENT' }
        ]
      },
      { label: 'Growing crystal exposes its permanent growth side effect', cardId: 407, slot: 'deco', phase: 'POST_DAMAGE', expected: [{ type: 'GROW_CRYSTAL', amount: 2, max: 16 }] },
      { label: 'Poison grip applies poison', cardId: 220, slot: 'handle', phase: 'POST_DAMAGE', expected: [{ type: 'ENEMY_APPLY_STATUS', status: 'poison', amount: 2 }] },
      { label: 'Ignition grip applies burn', cardId: 221, slot: 'handle', phase: 'POST_DAMAGE', expected: [{ type: 'ENEMY_APPLY_STATUS', status: 'burn', amount: 2 }] },
      { label: 'Plague needle applies poison', cardId: 228, slot: 'head', phase: 'POST_DAMAGE', expected: [{ type: 'ENEMY_APPLY_STATUS', status: 'poison', amount: 3 }] },
      { label: 'Ember edge applies burn', cardId: 229, slot: 'head', phase: 'POST_DAMAGE', expected: [{ type: 'ENEMY_APPLY_STATUS', status: 'burn', amount: 2 }] },
      { label: 'Venom charm applies poison', cardId: 238, slot: 'deco', phase: 'POST_DAMAGE', expected: [{ type: 'ENEMY_APPLY_STATUS', status: 'poison', amount: 2 }] },
      { label: 'Flame charm applies burn', cardId: 239, slot: 'deco', phase: 'POST_DAMAGE', expected: [{ type: 'ENEMY_APPLY_STATUS', status: 'burn', amount: 2 }] },
      { label: 'Weak charm applies weak', cardId: 244, slot: 'deco', phase: 'POST_DAMAGE', expected: [{ type: 'ENEMY_APPLY_STATUS', status: 'weak', amount: 1 }] },
      { label: 'Plague grip applies poison', cardId: 323, slot: 'handle', phase: 'POST_DAMAGE', expected: [{ type: 'ENEMY_APPLY_STATUS', status: 'poison', amount: 4 }] },
      { label: 'Ignition core applies burn', cardId: 324, slot: 'handle', phase: 'POST_DAMAGE', expected: [{ type: 'ENEMY_APPLY_STATUS', status: 'burn', amount: 3 }] },
      { label: 'Plague scythe applies poison', cardId: 331, slot: 'head', phase: 'POST_DAMAGE', expected: [{ type: 'ENEMY_APPLY_STATUS', status: 'poison', amount: 5 }] },
      { label: 'Storm trident applies burn', cardId: 332, slot: 'head', phase: 'POST_DAMAGE', expected: [{ type: 'ENEMY_APPLY_STATUS', status: 'burn', amount: 5 }] },
      { label: 'Venom lens applies poison', cardId: 339, slot: 'deco', phase: 'POST_DAMAGE', expected: [{ type: 'ENEMY_APPLY_STATUS', status: 'poison', amount: 5 }] },
      { label: 'Flame lens applies burn', cardId: 340, slot: 'deco', phase: 'POST_DAMAGE', expected: [{ type: 'ENEMY_APPLY_STATUS', status: 'burn', amount: 4 }] },
      {
        label: 'Phoenix talon applies poison and burn',
        cardId: 420,
        slot: 'head',
        phase: 'POST_DAMAGE',
        expected: [
          { type: 'ENEMY_APPLY_STATUS', status: 'poison', amount: 8 },
          { type: 'ENEMY_APPLY_STATUS', status: 'burn', amount: 6 }
        ]
      },
      { label: 'Dynamo grip restores energy', cardId: 222, slot: 'handle', phase: 'POST_DAMAGE', expected: [{ type: 'PLAYER_GAIN_ENERGY', amount: 1 }] },
      { label: 'Mana shard restores energy', cardId: 230, slot: 'head', phase: 'POST_DAMAGE', expected: [{ type: 'PLAYER_GAIN_ENERGY', amount: 1 }] },
      { label: 'Battery charm restores energy', cardId: 240, slot: 'deco', phase: 'POST_DAMAGE', expected: [{ type: 'PLAYER_GAIN_ENERGY', amount: 1 }] },
      { label: 'Overcharge grip restores energy', cardId: 325, slot: 'handle', phase: 'POST_DAMAGE', expected: [{ type: 'PLAYER_GAIN_ENERGY', amount: 1 }] },
      { label: 'Arc blade restores energy', cardId: 333, slot: 'head', phase: 'POST_DAMAGE', expected: [{ type: 'PLAYER_GAIN_ENERGY', amount: 1 }] },
      { label: 'Overcharge coil restores energy', cardId: 341, slot: 'deco', phase: 'POST_DAMAGE', expected: [{ type: 'PLAYER_GAIN_ENERGY', amount: 1 }] },
      { label: 'Singularity battery restores two energy', cardId: 424, slot: 'deco', phase: 'POST_DAMAGE', expected: [{ type: 'PLAYER_GAIN_ENERGY', amount: 2 }] },
      { label: 'Cycle grip draws immediately', cardId: 223, slot: 'handle', phase: 'POST_DAMAGE', expected: [{ type: 'DRAW_CARDS', count: 1 }] },
      { label: 'Flow blade draws immediately', cardId: 231, slot: 'head', phase: 'POST_DAMAGE', expected: [{ type: 'DRAW_CARDS', count: 1 }] },
      { label: 'Clone grip draws immediately', cardId: 326, slot: 'handle', phase: 'POST_DAMAGE', expected: [{ type: 'DRAW_CARDS', count: 1 }] },
      { label: 'Flow edge draws immediately', cardId: 334, slot: 'head', phase: 'POST_DAMAGE', expected: [{ type: 'DRAW_CARDS', count: 1 }] },
      { label: 'Flow feather draws immediately', cardId: 342, slot: 'deco', phase: 'POST_DAMAGE', expected: [{ type: 'DRAW_CARDS', count: 1 }] },
      { label: 'Dream grip draws immediately', cardId: 416, slot: 'handle', phase: 'POST_DAMAGE', expected: [{ type: 'DRAW_CARDS', count: 1 }] },
      { label: 'Ribbon charm draws next turn', cardId: 241, slot: 'deco', phase: 'POST_DAMAGE', expected: [{ type: 'PLAYER_NEXT_TURN_DRAW', amount: 1 }] },
      {
        label: 'Infinite battery feather draws now and next turn',
        cardId: 425,
        slot: 'deco',
        phase: 'POST_DAMAGE',
        expected: [
          { type: 'DRAW_CARDS', count: 2 },
          { type: 'PLAYER_NEXT_TURN_DRAW', amount: 1 }
        ]
      }
    ];

    for (const currentCase of [...preDamageCases, ...selfDamageCases, ...onHitCases, ...postDamageCases]) {
      const ctx = createContextForEffectCase(currentCase);
      const actions = executeEffectsForPhase(
        ctx,
        createEffectModifiers(ctx, currentCase.modifiers),
        currentCase.phase
      );

      assertActionsInclude(actions, currentCase.expected, currentCase.label);
    }
  }),

  test('static weapon stat table covers non-action card mechanics', () => {
    const baseStrike = calculateStatsForCards({ handle: 101, head: 103 });
    const zeroCost = calculateStatsForCards({ handle: 101, head: 103, deco: 403 });
    const timeCog = calculateStatsForCards({ handle: 101, head: 406 });
    const crystalFresh = calculateStatsForCards({ handle: 101, head: 103, deco: 407 });
    const crystalGrown = calculateStatsForCards({ handle: 101, head: 103, deco: 407 }, { growingCrystalBonus: 6 });
    const thornPlate = calculateStatsForCards({ handle: 101, head: 103, deco: 207 }, { playerBlock: 10 });
    const thornMark = calculateStatsForCards({ handle: 101, head: 103, deco: 210 }, { playerBlock: 10 });
    const poisonNeedleBase = calculateStatsForCards({ handle: 101, head: 213 });
    const poisonNeedleScaled = calculateStatsForCards({ handle: 101, head: 213 }, { enemyStatuses: { poison: 4 } });
    const comboBase = calculateStatsForCards({ handle: 101, head: 310 });
    const comboScaled = calculateStatsForCards({ handle: 101, head: 310 }, { weaponsUsedThisTurn: 3 });
    const steelPlateBase = calculateStatsForCards({ handle: 102, head: 103 });
    const steelPlate = calculateStatsForCards({ handle: 102, head: 103, deco: 311 });
    const wallLens = calculateStatsForCards({ handle: 102, head: 103, deco: 338 }, { playerBlock: 7 });
    const eternalWall = calculateStatsForCards({ handle: 102, head: 103, deco: 423 }, { playerBlock: 10 });
    const growthCrest = calculateStatsForCards({ handle: 101, head: 103, deco: 343 });
    const meteorCluster = calculateStatsForCards({ handle: 101, head: 421 });

    assertEqual(zeroCost.totalCost, 0, 'Philosopher stone should zero weapon cost');
    assertEqual(timeCog.damage, 0, 'Time cog should deal no direct damage');
    assertEqual(crystalGrown.damage, crystalFresh.damage + 6, 'Growing crystal should add stored combat growth to damage');
    assertEqual(thornPlate.damage, baseStrike.damage + 10, 'Iron thorn should convert current block into damage');
    assertEqual(thornMark.damage, baseStrike.damage + 5, 'Thorn mark should convert half of current block into damage');
    assertEqual(poisonNeedleScaled.damage, poisonNeedleBase.damage + 4, 'Poison-scaling heads should read current poison stacks');
    assertEqual(comboScaled.damage, comboBase.damage + 6, 'Combo heads should scale from weapons used this turn');
    assertEqual(steelPlate.block, steelPlateBase.block * 2, 'Steel plating should double defensive weapon block');
    assertEqual(wallLens.block, steelPlateBase.block * 2, 'Wall lens should double defensive weapon block');
    assertEqual(wallLens.damage, 7, 'Wall lens should convert current block into damage');
    assertEqual(eternalWall.block, steelPlateBase.block * 2, 'Eternal wall should double defensive weapon block');
    assertEqual(eternalWall.damage, 15, 'Eternal wall should convert 150% of current block into damage');
    assertEqual(growthCrest.damage, Math.floor(baseStrike.damage * 1.5), 'Growth crest should multiply positive damage by 1.5');
    assertEqual(meteorCluster.hitCount, 4, 'Meteor cluster should expose four hits');
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
  }),

  test('player weapon attack resolver shares cap, block, thorns, and on-hit rules', () => {
    const cappedEnemy = getEnemyById('rock_crusher');
    cappedEnemy.block = 5;
    cappedEnemy.statuses.vulnerable = 1;
    const heavySlots = {
      handle: createCardInstance(101),
      head: createCardInstance(304),
      deco: null
    };
    const heavyStats = calculateWeaponStats({
      slots: heavySlots,
      playerBlock: 0,
      weaponsUsedThisTurn: 0,
      enemyStatuses: cappedEnemy.statuses,
      growingCrystalBonus: 0
    });
    const cappedResult = resolvePlayerWeaponAttack({
      player: createPlayer(),
      enemy: cappedEnemy,
      slots: heavySlots,
      stats: heavyStats,
      modifiers: { finalDamage: heavyStats.damage, finalBlock: heavyStats.block, ignoreBlock: false, selfDamage: 0 },
      growingCrystalBonus: 0,
      effectMultiplier: 1,
      remainingEnergyAfterCost: 0
    });

    assertEqual(cappedResult.events[0].actualDamage, 15, 'Damage cap should apply after vulnerable scaling');
    assertEqual(cappedResult.events[0].blockDamage, 5, 'Shared attack resolver should chip block before HP');
    assertEqual(cappedResult.events[0].damageDealt, 10, 'Only unblocked capped damage should hit HP');
    assert(cappedResult.events[0].cappedByDamageLimit, 'Damage cap event should be inspectable');

    const thornsEnemy = getEnemyById('barbed_mine');
    const midasSlots = {
      handle: createCardInstance(307),
      head: createCardInstance(103),
      deco: null
    };
    const midasStats = calculateWeaponStats({
      slots: midasSlots,
      playerBlock: 0,
      weaponsUsedThisTurn: 0,
      enemyStatuses: thornsEnemy.statuses,
      growingCrystalBonus: 0
    });
    const thornsResult = resolvePlayerWeaponAttack({
      player: createPlayer({ hp: 30, gold: 2 }),
      enemy: thornsEnemy,
      slots: midasSlots,
      stats: midasStats,
      modifiers: { finalDamage: midasStats.damage, finalBlock: midasStats.block, ignoreBlock: false, selfDamage: 0 },
      growingCrystalBonus: 0,
      effectMultiplier: 1,
      remainingEnergyAfterCost: 0
    });

    assertEqual(thornsResult.player.hp, 25, 'Thorns should damage the player through the shared resolver');
    assertEqual(thornsResult.player.gold, 7, 'On-hit Midas gold should be applied by the shared resolver');
    assertEqual(thornsResult.events[0].thornsDamage, 5, 'Thorns feedback should be inspectable');
    assert(
      thornsResult.events[0].onHitActions.some(action => action.type === 'PLAYER_GAIN_GOLD' && action.amount === 5),
      'On-hit actions should be exposed for UI feedback'
    );
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
      assert(rule.legendUnlockFloor >= 1, `${rule.id} should declare when legends can enter the reward pool`);
      assert((rule.rarityWeights[CardRarity.COMMON] || 0) > 0, `${rule.id} should keep common rewards weighted`);
      assert((rule.rarityWeights[CardRarity.RARE] || 0) > 0, `${rule.id} should keep rare rewards weighted`);
    }
    assert((COMBAT_REWARD_RULES.COMMON.rarityWeights[CardRarity.LEGEND] || 0) < (COMBAT_REWARD_RULES.ELITE.rarityWeights[CardRarity.LEGEND] || 0), 'Elite rewards should expose more legendary weight than common rewards');
    assert((COMBAT_REWARD_RULES.ELITE.rarityWeights[CardRarity.LEGEND] || 0) < (COMBAT_REWARD_RULES.BOSS.rarityWeights[CardRarity.LEGEND] || 0), 'Boss rewards should expose more legendary weight than elite rewards');

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
    const firstBundle = createCombatRewardBundle(EnemyTier.ELITE, createSeededRng('reward-bundle'));
    const secondBundle = createCombatRewardBundle(EnemyTier.ELITE, createSeededRng('reward-bundle'));
    const firstRewardIds = createCombatCardRewards(rule, firstRng).map(card => card.id);
    const secondRewardIds = createCombatCardRewards(rule, secondRng).map(card => card.id);

    assertDeepEqual(firstRewardIds, secondRewardIds, 'Seeded card rewards should be repeatable');
    assertEqual(firstBundle.gold, secondBundle.gold, 'Seeded reward bundles should repeat gold');
    assertDeepEqual(firstBundle.cardOptions.map(card => card.id), secondBundle.cardOptions.map(card => card.id), 'Seeded reward bundles should repeat card options');
    assertEqual(rollGoldReward(rule, () => 0), rule.gold.min, 'Gold reward should include minimum bound');
    assertEqual(rollGoldReward(rule, () => 0.999), rule.gold.max, 'Gold reward should include maximum bound');
    assertEqual(createRandomCardReward(CardRarity.RARE, CardType.HEAD, () => 0).type, CardType.HEAD, 'Random typed rewards should honor requested slot');
  }),

  test('combat rewards respect early legend gates and deck needs', () => {
    const openingContext = {
      act: 1 as const,
      floor: 1,
      deck: [101, 101, 102, 103, 103, 104, 105, 106].map(id => createCardInstance(id, () => 0.1))
    };

    for (let seed = 1; seed <= 20; seed++) {
      const reward = createCombatRewardBundle(EnemyTier.COMMON, createSeededRng(`opening-reward-${seed}`), openingContext);
      assert(
        reward.cardOptions.every(card => card.rarity !== CardRarity.LEGEND),
        'Opening common rewards should not surface legendary cards'
      );
    }

    const headHeavyContext = {
      act: 1 as const,
      floor: 4,
      deck: [103, 103, 104, 202, 203, 105, 106].map(id => createCardInstance(id, () => 0.2))
    };
    const candidateHandle = createCardInstance(201, () => 0.3);
    const candidateHead = createCardInstance(202, () => 0.4);

    assert(
      scoreCombatRewardCandidate(candidateHandle, headHeavyContext) > scoreCombatRewardCandidate(candidateHead, headHeavyContext),
      'Reward scoring should favor a missing required slot when the deck is head-heavy'
    );

    const statusDeckContext = {
      act: 2 as const,
      floor: 6,
      deck: [201, 203, 205, 238, 103, 104].map(id => createCardInstance(id, () => 0.5))
    };
    const matchingStatusCard = createCardInstance(331, () => 0.6);
    const offPlanCard = createCardInstance(336, () => 0.7);

    assert(
      scoreCombatRewardCandidate(matchingStatusCard, statusDeckContext) > scoreCombatRewardCandidate(offPlanCard, statusDeckContext),
      'Reward scoring should reinforce the deck archetype that is already emerging'
    );
  }),

  test('shop and boss rewards resolve from static data without UI state', () => {
    const brokePurchase = resolveShopPurchase(createPlayer({ gold: 10 }), 'HEAL', () => 0);
    assertEqual(brokePurchase.event.type, 'INSUFFICIENT_GOLD', 'Shop resolver should reject unaffordable purchases');
    assertEqual(brokePurchase.player.gold, 10, 'Rejected shop purchases should not spend gold');

    const healPurchase = resolveShopPurchase(createPlayer({ hp: 20, maxHp: 80, gold: 100 }), 'HEAL', () => 0);
    assertEqual(healPurchase.event.type, 'HEAL', 'Heal shop item should produce a heal event');
    assertEqual(healPurchase.player.hp, 60, 'Heal shop item should restore 50% of max HP');
    assertEqual(healPurchase.player.gold, 60, 'Heal shop item should charge its static price');

    const rarePurchase = resolveShopPurchase(createPlayer({ gold: 100 }), 'RARE', createSeededRng('shop-rare'));
    assertEqual(rarePurchase.event.type, 'GAIN_CARD', 'Rare shop item should generate a card side effect');
    assertEqual(rarePurchase.player.gold, 25, 'Rare shop item should charge its static price');
    assert(rarePurchase.event.type === 'GAIN_CARD' && rarePurchase.event.card.rarity === CardRarity.RARE, 'Rare shop item should generate a rare card');

    const energyReward = resolveBossReward(createPlayer({ hp: 35, maxHp: 80, maxEnergy: 4 }), 'ENERGY', true);
    assertEqual(energyReward.player.maxEnergy, 5, 'Boss energy reward should increase max energy');
    assertEqual(energyReward.player.hp, 80, 'Boss reward full repair should restore to max HP');

    const maxHpReward = resolveBossReward(createPlayer({ hp: 35, maxHp: 80 }), 'MAX_HP', true);
    assertEqual(maxHpReward.player.maxHp, 110, 'Boss max HP reward should increase max HP');
    assertEqual(maxHpReward.player.hp, 110, 'Boss max HP reward should full repair to the new max when requested');
  }),

  test('event options resolve from static data without UI state', () => {
    const deck = [
      createCardInstance(101, createSeededRng('event-card-1')),
      createCardInstance(103, createSeededRng('event-card-2'))
    ];

    const hpCostOption = {
      label: 'Risk',
      description: 'Pay HP for gold',
      type: 'GAIN_GOLD' as const,
      value: 25,
      cost: 5,
      costResource: 'HP' as const
    };
    const paidGold = resolveEventOption(createPlayer({ hp: 30, gold: 4 }), deck, hpCostOption, () => 0);
    assert(canPayEventOption(createPlayer({ hp: 6 }), hpCostOption), 'Event cost helper should allow payable HP costs');
    assert(!canPayEventOption(createPlayer({ hp: 5 }), hpCostOption), 'Event cost helper should reject lethal HP costs');
    assertEqual(applyEventOptionCost(createPlayer({ hp: 9 }), hpCostOption).player.hp, 4, 'Event cost helper should apply HP costs before effects');
    assertEqual(paidGold.player.hp, 25, 'Event resolver should apply HP costs');
    assertEqual(paidGold.player.gold, 29, 'Event resolver should apply gold gains after costs');
    assert(paidGold.playerHit, 'Event resolver should expose HP-cost hit feedback');

    const rareCard = resolveEventOption(createPlayer(), deck, {
      label: 'Blueprint',
      description: 'Gain a rare card',
      type: 'GAIN_CARD_RARE'
    }, createSeededRng('event-rare'));
    assertEqual(rareCard.deck.length, 3, 'Rare-card event should add one card to deck');
    assert(rareCard.event.type === 'GAIN_CARD' && rareCard.event.card.rarity === CardRarity.RARE, 'Rare-card event should expose the generated card');

    const lethalDamage = resolveEventOption(createPlayer({ hp: 5 }), deck, {
      label: 'Trap',
      description: 'Take damage',
      type: 'DAMAGE',
      value: 7
    });
    assert(lethalDamage.defeat, 'Damage events should report defeat when HP reaches zero');

    const upgraded = resolveEventOption(createPlayer(), deck, {
      label: 'Upgrade',
      description: 'Upgrade a random card',
      type: 'RANDOM_UPGRADE'
    }, createSeededRng('event-upgrade'));
    assert(upgraded.event.type === 'UPGRADE_CARD', 'Upgrade event should expose the upgraded card pair');
    assertEqual(upgraded.deck.length, deck.length, 'Upgrade event should preserve deck size');

    const removed = resolveEventCardRemoval(createPlayer({ gold: 20 }), deck, {
      label: 'Purge',
      description: 'Remove a card',
      type: 'REMOVE_CARD',
      cost: 10,
      costResource: 'GOLD'
    }, deck[0].instanceId);
    assertEqual(removed.player.gold, 10, 'Removal event should charge its static cost');
    assertEqual(removed.deck.length, 1, 'Removal event should remove the selected card');
    assert(removed.event.type === 'REMOVE_CARD' && removed.event.removedCard?.instanceId === deck[0].instanceId, 'Removal event should expose the removed card');
  }),

  test('run learning feedback identifies concrete loss lessons', () => {
    const baseSnapshot: RunLearningSnapshot = {
      isWin: false,
      act: 2,
      floor: 9,
      gold: 75,
      playerHp: 0,
      playerMaxHp: 80,
      maxEnergy: 5,
      deckSize: 18,
      junkCount: 0,
      starterCount: 2,
      rareOrLegendCount: 7,
      enemyName: '부패한 대장장이',
      enemyHp: 50,
      enemyMaxHp: 120
    };

    assertEqual(createRunLearningFeedback({ ...baseSnapshot, junkCount: 4 }).focus, 'DECK_POLLUTION', 'Learning feedback should call out polluted decks');
    assertEqual(createRunLearningFeedback({ ...baseSnapshot, maxEnergy: 4, junkCount: 0 }).focus, 'ENERGY_PRESSURE', 'Learning feedback should call out midgame energy pressure');
    assertEqual(createRunLearningFeedback({ ...baseSnapshot, act: 1, floor: 7, deckSize: 28, rareOrLegendCount: 3 }).focus, 'DECK_BLOAT', 'Learning feedback should call out bloated low-quality decks');
    assertEqual(createRunLearningFeedback({ ...baseSnapshot, act: 1, floor: 7, starterCount: 6 }).focus, 'CARD_QUALITY', 'Learning feedback should call out too many starter cards');
    assertEqual(createRunLearningFeedback({ ...baseSnapshot, act: 1, floor: 5, enemyHp: 12 }).focus, 'FINISHING_DAMAGE', 'Learning feedback should call out near-kill damage gaps');
    assertEqual(createRunLearningFeedback({ ...baseSnapshot, isWin: true, playerHp: 35, enemyHp: 0 }).focus, 'VICTORY', 'Learning feedback should use a victory lesson after winning');
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
