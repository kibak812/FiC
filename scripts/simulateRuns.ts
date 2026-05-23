import { BOSS_REWARDS, CARD_DATABASE, ENEMIES, GAME_EVENTS, INITIAL_DECK_IDS, SHOP_ITEMS } from '../constants';
import { CardInstance, CardRarity, CardType, EnemyData, EnemyTier, EnemyTrait, EventOption, MapNode, NodeType, PlayerStats } from '../types';
import { createCardInstance, shuffle } from '../utils/cardUtils';
import {
  applyModifierActions,
  CardEffectContext,
  EffectAction,
  EffectModifiers,
  executeEffectsForPhase,
  isExhaustCard,
  isInfiniteLoopCard,
  isTwinHandle,
  WeaponSlots
} from '../utils/cardEffects';
import { calculateBlockedDamage, calculateEnemyIntentPlan, calculateEnemyStrengthGain, calculateWeaponStats, resolveEnemyTurnStartStatuses } from '../utils/combatEngine';
import { createActMap, getAvailableMapNodeIds } from '../utils/mapUtils';
import { createCombatCardRewards, createRandomCardReward, getCombatRewardRule, rollGoldReward } from '../utils/rewardUtils';
import { assert, createSeededRng, pick } from './testUtils';

const RUN_COUNT = Number(process.env.SIM_RUNS || 1000);
const MAX_COMBAT_TURNS = 60;
const MAX_WEAPONS_PER_TURN = 5;

type TerminalState = 'WIN' | 'LOSE';

interface SimState {
  player: PlayerStats;
  deck: CardInstance[];
  hand: CardInstance[];
  discard: CardInstance[];
  growingCrystalBonus: number;
  infiniteLoopUsed: boolean;
}

interface SimResult {
  seed: number;
  terminal: TerminalState;
  act: 1 | 2 | 3;
  floor: number;
  combats: number;
  turns: number;
  rewards: number;
  cardsSeen: Set<number>;
}

interface WeaponChoice {
  slots: WeaponSlots;
  stats: ReturnType<typeof calculateWeaponStats>;
  score: number;
}

const cloneEnemy = (enemyData: EnemyData): EnemyData => JSON.parse(JSON.stringify(enemyData));

const createInitialState = (rng: () => number): SimState => ({
  player: {
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
    selfDamageThisTurn: 0
  },
  deck: shuffle(INITIAL_DECK_IDS.map(id => createCardInstance(id, rng)), rng),
  hand: [],
  discard: [],
  growingCrystalBonus: 0,
  infiniteLoopUsed: false
});

const drawCards = (state: SimState, count: number, rng: () => number): void => {
  for (let i = 0; i < count; i++) {
    if (state.deck.length === 0) {
      if (state.discard.length === 0) return;
      state.deck = shuffle(state.discard, rng);
      state.discard = [];
    }

    const card = state.deck.pop();
    if (card) state.hand.push(card);
  }
};

const removeUsedCardsFromHand = (state: SimState, cards: Array<CardInstance | null>): void => {
  const usedIds = new Set(cards.filter(Boolean).map(card => card!.instanceId));
  state.hand = state.hand.filter(card => !usedIds.has(card.instanceId));
};

const scoreCard = (card: CardInstance): number => {
  if (card.type === CardType.JUNK) return -100;
  if (card.rarity === CardRarity.LEGEND) return 40 + card.value;
  if (card.rarity === CardRarity.RARE) return 25 + card.value;
  if (card.rarity === CardRarity.COMMON) return 12 + card.value;
  return card.value;
};

const chooseRewardCard = (cards: CardInstance[]): CardInstance | null => {
  if (cards.length === 0) return null;
  return [...cards].sort((a, b) => scoreCard(b) - scoreCard(a))[0];
};

const chooseBestWeapon = (state: SimState, enemy: EnemyData): WeaponChoice | null => {
  const handles = state.hand.filter(card => card.type === CardType.HANDLE);
  const heads = state.player.disarmed ? [] : state.hand.filter(card => card.type === CardType.HEAD);
  const decos = [null, ...state.hand.filter(card => card.type === CardType.DECO)];
  const incomingPlan = calculateEnemyIntentPlan(enemy, state.player);
  const incomingDamage = incomingPlan.isAttack ? incomingPlan.attackDamage * incomingPlan.attackCount : 0;
  const blockWeight = incomingDamage > 0
    ? state.player.hp < state.player.maxHp * 0.45 ? 2.4 : 1.4
    : 0.65;
  let bestChoice: WeaponChoice | null = null;

  for (const handle of handles) {
    for (const head of heads) {
      for (const deco of decos) {
        const slots = { handle, head, deco };
        const stats = calculateWeaponStats({
          slots,
          playerBlock: state.player.block,
          weaponsUsedThisTurn: state.player.weaponsUsedThisTurn,
          enemyStatuses: enemy.statuses,
          growingCrystalBonus: state.growingCrystalBonus
        });

        if (state.player.costLimit !== null && stats.totalCost > state.player.costLimit) continue;
        if (stats.totalCost > state.player.energy) continue;

        const twinMultiplier = isTwinHandle(handle.id) ? 2 : 1;
        const totalDamageEstimate = stats.damage * stats.hitCount * twinMultiplier;
        const effectScore =
          [handle, head, deco].filter(Boolean).reduce((sum, card) => sum + scoreCard(card!), 0) * 0.08;
        const expectedBlockedDamage = Math.min(incomingDamage, stats.block + state.player.block);
        const score = totalDamageEstimate + stats.block * blockWeight + expectedBlockedDamage * 0.75 + effectScore - stats.totalCost * 0.5;

        if (!bestChoice || score > bestChoice.score) {
          bestChoice = { slots, stats, score };
        }
      }
    }
  }

  return bestChoice;
};

const processActions = (
  actions: EffectAction[],
  modifiers: EffectModifiers,
  state: SimState,
  enemy: EnemyData,
  rng: () => number
): void => {
  for (const action of actions) {
    switch (action.type) {
      case 'PLAYER_SELF_DAMAGE':
        state.player.hp = Math.max(0, state.player.hp - action.amount);
        state.player.selfDamageThisTurn += action.amount;
        modifiers.selfDamage += action.amount;
        break;
      case 'PLAYER_HEAL':
        state.player.hp = Math.min(state.player.maxHp, state.player.hp + action.amount);
        break;
      case 'PLAYER_GAIN_ENERGY':
        state.player.energy += action.amount;
        break;
      case 'PLAYER_GAIN_BLOCK':
        state.player.block += action.amount;
        break;
      case 'PLAYER_REDUCE_BLOCK': {
        const hpDamage = Math.max(0, action.amount - state.player.block);
        state.player.block = Math.max(0, state.player.block - action.amount);
        state.player.hp = Math.max(0, state.player.hp - hpDamage);
        break;
      }
      case 'PLAYER_GAIN_GOLD':
        state.player.gold += action.amount;
        break;
      case 'PLAYER_SET_DODGE':
        state.player.dodgeNextAttack = action.value;
        break;
      case 'PLAYER_OVERHEAT':
        state.player.overheat += action.amount;
        break;
      case 'PLAYER_NEXT_TURN_DRAW':
        state.player.nextTurnDraw += action.amount;
        break;
      case 'ENEMY_APPLY_STATUS':
        enemy.statuses[action.status] += action.amount;
        break;
      case 'ENEMY_SKIP_INTENT':
        enemy.currentIntentIndex = (enemy.currentIntentIndex + 1) % enemy.intents.length;
        break;
      case 'ENEMY_EXECUTE_THRESHOLD':
        if (enemy.currentHp > 0 && enemy.currentHp <= enemy.maxHp * action.threshold) {
          enemy.currentHp = 0;
        }
        break;
      case 'DRAW_CARDS':
        drawCards(state, action.count, rng);
        break;
      case 'CREATE_REPLICA': {
        const replica = createCardInstance(801, rng);
        replica.value = action.baseDamage;
        replica.description = `Simulated replica. Damage ${action.baseDamage}. Cost 0.`;
        state.deck.push(replica);
        break;
      }
      case 'GROW_CRYSTAL':
        state.growingCrystalBonus = Math.min(action.max, state.growingCrystalBonus + action.amount);
        break;
    }
  }
};

const createEffectContext = (
  state: SimState,
  enemy: EnemyData,
  slots: WeaponSlots,
  stats: ReturnType<typeof calculateWeaponStats>,
  modifiers: EffectModifiers,
  rng: () => number
): CardEffectContext => ({
  slots,
  stats,
  player: state.player,
  enemy,
  effectMultiplier: isTwinHandle(slots.handle?.id || 0) ? 2 : 1,
  remainingEnergyAfterCost: Math.max(0, state.player.energy - stats.totalCost),
  growingCrystalBonus: state.growingCrystalBonus,
  rng,
  showFeedback: () => undefined
});

const forgeBestWeapon = (state: SimState, enemy: EnemyData, rng: () => number): boolean => {
  const choice = chooseBestWeapon(state, enemy);
  if (!choice) return false;

  const { slots, stats } = choice;
  state.player.energy -= stats.totalCost;
  state.player.weaponsUsedThisTurn += 1;

  let modifiers: EffectModifiers = {
    finalDamage: stats.damage,
    finalBlock: stats.block,
    ignoreBlock: false,
    selfDamage: state.player.selfDamageThisTurn
  };

  let ctx = createEffectContext(state, enemy, slots, stats, modifiers, rng);
  processActions(executeEffectsForPhase(ctx, modifiers, 'SELF_DAMAGE'), modifiers, state, enemy, rng);
  if (state.player.hp <= 0) return true;

  ctx = createEffectContext(state, enemy, slots, stats, modifiers, rng);
  modifiers = applyModifierActions(modifiers, executeEffectsForPhase(ctx, modifiers, 'PRE_DAMAGE'));

  const hitLoops = stats.hitCount * (isTwinHandle(slots.handle?.id || 0) ? 2 : 1);
  for (let i = 0; i < hitLoops; i++) {
    let actualDamage = modifiers.finalDamage;

    if (enemy.statuses.vulnerable > 0) {
      actualDamage = Math.floor(actualDamage * 1.5);
    }

    if (enemy.traits.includes(EnemyTrait.DAMAGE_CAP_15) && actualDamage > 15) {
      actualDamage = 15;
    }

    if (enemy.traits.includes(EnemyTrait.THORNS_5) && actualDamage > 0) {
      state.player.hp = Math.max(0, state.player.hp - 5);
      if (state.player.hp <= 0) break;
    }

    let damageDealt = actualDamage;
    if (damageDealt > 0 && enemy.block > 0 && !modifiers.ignoreBlock) {
      const blockDamage = Math.min(enemy.block, damageDealt);
      enemy.block -= blockDamage;
      damageDealt -= blockDamage;
    }

    if (damageDealt > 0) {
      enemy.currentHp = Math.max(0, enemy.currentHp - damageDealt);
      enemy.damageTakenThisTurn += damageDealt;
      ctx = createEffectContext(state, enemy, slots, stats, modifiers, rng);
      processActions(executeEffectsForPhase(ctx, modifiers, 'ON_HIT'), modifiers, state, enemy, rng);
    }

    if (enemy.currentHp <= 0) break;
  }

  if (modifiers.finalBlock > 0) {
    state.player.block += modifiers.finalBlock;
  }

  ctx = createEffectContext(state, enemy, slots, stats, modifiers, rng);
  processActions(executeEffectsForPhase(ctx, modifiers, 'POST_DAMAGE'), modifiers, state, enemy, rng);

  removeUsedCardsFromHand(state, [slots.handle, slots.head, slots.deco]);

  const usedCards = [slots.handle, slots.head, slots.deco]
    .filter(card => card && !isExhaustCard(card.id) && !isInfiniteLoopCard(card.id)) as CardInstance[];

  const infiniteLoopCard = slots.handle && isInfiniteLoopCard(slots.handle.id) && !state.infiniteLoopUsed
    ? slots.handle
    : null;

  if (infiniteLoopCard) {
    state.hand.push(infiniteLoopCard);
    state.infiniteLoopUsed = true;
  }

  state.discard.push(...usedCards);
  return true;
};

const runEnemyTurn = (state: SimState, enemy: EnemyData, rng: () => number): void => {
  enemy.block = 0;
  const turnStart = resolveEnemyTurnStartStatuses(enemy.statuses);
  enemy.statuses = turnStart.statuses;

  if (turnStart.isStunned) return;

  enemy.currentHp = Math.max(0, enemy.currentHp - turnStart.poisonDamage - turnStart.burnDamage);
  if (enemy.currentHp <= 0) return;

  const plan = calculateEnemyIntentPlan(enemy, state.player);
  const intent = plan.intent;

  if (plan.handleCostIncrease > 0) {
    const handles = [...state.deck, ...state.discard].filter(card => card.type === CardType.HANDLE);
    if (handles.length > 0) {
      pick(handles, rng).cost += plan.handleCostIncrease;
    }
  }

  if (plan.costLimit !== null) {
    state.player.costLimit = plan.costLimit;
  }

  if (plan.disarmsHead) {
    state.player.disarmed = true;
  }

  if (plan.isAttack) {
    for (let i = 0; i < plan.attackCount; i++) {
      if (enemy.statuses.bleed > 0) {
        const bleedDamage = enemy.statuses.bleed;
        enemy.currentHp = Math.max(0, enemy.currentHp - bleedDamage);
        enemy.statuses.bleed = Math.max(0, enemy.statuses.bleed - 1);
      }

      if (enemy.currentHp <= 0) break;

      if (state.player.dodgeNextAttack) {
        state.player.dodgeNextAttack = false;
        continue;
      }

      const { unblockedDamage, nextBlock } = calculateBlockedDamage(plan.attackDamage, state.player.block);
      state.player.hp = Math.max(0, state.player.hp - unblockedDamage);
      state.player.block = nextBlock;
      if (state.player.hp <= 0) break;
    }

    if (enemy.statuses.strength > 0) {
      enemy.statuses.strength = 0;
    }
  }

  if (enemy.currentHp <= 0 || state.player.hp <= 0) return;

  if (plan.defendBlock > 0) {
    enemy.block += plan.defendBlock;
  } else if (intent.effect?.type === 'GAIN_STRENGTH') {
    enemy.statuses.strength += calculateEnemyStrengthGain(enemy, intent, rng);
  } else if (plan.healAmount > 0) {
    enemy.currentHp = Math.min(enemy.maxHp, enemy.currentHp + plan.healAmount);
  } else if (intent.effect?.type === 'CLEANSE_STATUSES_GAIN_STRENGTH') {
    if (plan.statusCleanseStrengthGain > 0) {
      enemy.statuses.poison = 0;
      enemy.statuses.bleed = 0;
      enemy.statuses.burn = 0;
      enemy.statuses.vulnerable = 0;
      enemy.statuses.weak = 0;
      enemy.statuses.stunned = 0;
      enemy.statuses.strength += plan.statusCleanseStrengthGain;
    }
  } else if (plan.junkCount > 0) {
    for (let i = 0; i < plan.junkCount; i++) {
      state.discard.push(createCardInstance(901, rng));
    }
  } else if (intent.type === 'BUFF' && intent.description.includes('공격력')) {
    enemy.statuses.strength += calculateEnemyStrengthGain(enemy, intent, rng);
  } else if (intent.type === 'BUFF') {
    enemy.currentHp = Math.min(enemy.maxHp, enemy.currentHp + intent.value);
  }

  enemy.currentIntentIndex = (enemy.currentIntentIndex + 1) % enemy.intents.length;
};

const simulateCombat = (state: SimState, enemyData: EnemyData, rng: () => number): { won: boolean; turns: number } => {
  const enemy = cloneEnemy(enemyData);

  for (let turn = 1; turn <= MAX_COMBAT_TURNS; turn++) {
    state.player.energy = Math.max(0, state.player.maxEnergy - state.player.overheat);
    state.player.block = 0;
    state.player.overheat = 0;
    state.player.weaponsUsedThisTurn = 0;
    state.player.selfDamageThisTurn = 0;
    state.infiniteLoopUsed = false;
    enemy.damageTakenThisTurn = 0;

    const drawCount = 5 + state.player.nextTurnDraw;
    state.player.nextTurnDraw = 0;
    drawCards(state, drawCount, rng);

    for (let weaponsThisTurn = 0; weaponsThisTurn < MAX_WEAPONS_PER_TURN; weaponsThisTurn++) {
      if (!forgeBestWeapon(state, enemy, rng)) break;
      if (enemy.currentHp <= 0 || state.player.hp <= 0) break;
    }

    state.discard.push(...state.hand);
    state.hand = [];
    state.player.costLimit = null;
    state.player.disarmed = false;

    if (enemy.currentHp <= 0) return { won: true, turns: turn };
    if (state.player.hp <= 0) return { won: false, turns: turn };

    runEnemyTurn(state, enemy, rng);
    if (enemy.currentHp <= 0) return { won: true, turns: turn };
    if (state.player.hp <= 0) return { won: false, turns: turn };
  }

  return { won: false, turns: MAX_COMBAT_TURNS };
};

const canPayEventOption = (state: SimState, option: EventOption): boolean => {
  if (!option.cost || !option.costResource) return true;
  if (option.costResource === 'GOLD') return state.player.gold >= option.cost;
  return state.player.hp > option.cost;
};

const removeLowestValueCard = (state: SimState): void => {
  const allCards = [...state.deck, ...state.discard];
  if (allCards.length === 0) return;
  const target = [...allCards].sort((a, b) => scoreCard(a) - scoreCard(b))[0];
  state.deck = state.deck.filter(card => card.instanceId !== target.instanceId);
  state.discard = state.discard.filter(card => card.instanceId !== target.instanceId);
};

const applyEventOption = (state: SimState, option: EventOption, rng: () => number): void => {
  if (option.cost && option.costResource === 'GOLD') {
    state.player.gold = Math.max(0, state.player.gold - option.cost);
  } else if (option.cost && option.costResource === 'HP') {
    state.player.hp = Math.max(1, state.player.hp - option.cost);
  }

  switch (option.type) {
    case 'HEAL':
      state.player.hp = Math.min(state.player.maxHp, state.player.hp + (option.value || 0));
      break;
    case 'DAMAGE':
      state.player.hp = Math.max(0, state.player.hp - (option.value || 0));
      break;
    case 'GAIN_CARD_RARE':
      state.deck.push(createRandomCardReward(CardRarity.RARE, undefined, rng));
      break;
    case 'REMOVE_CARD':
      removeLowestValueCard(state);
      break;
    case 'GAIN_GOLD':
      state.player.gold += option.value || 0;
      break;
    case 'LOSE_GOLD':
      state.player.gold = Math.max(0, state.player.gold - (option.value || 0));
      break;
    case 'FULL_HEAL':
      state.player.hp = state.player.maxHp;
      break;
    case 'RANDOM_UPGRADE': {
      const candidates = state.deck.filter(card =>
        card.rarity !== CardRarity.RARE &&
        card.rarity !== CardRarity.LEGEND &&
        card.rarity !== CardRarity.JUNK &&
        card.rarity !== CardRarity.SPECIAL
      );

      if (candidates.length > 0) {
        const target = pick(candidates, rng);
        const upgradedCard = {
          ...createRandomCardReward(CardRarity.RARE, target.type, rng),
          instanceId: target.instanceId
        };
        state.deck = state.deck.map(card => card.instanceId === target.instanceId ? upgradedCard : card);
      }
      break;
    }
    case 'LEAVE':
      break;
  }
};

const processNonCombatNode = (state: SimState, node: MapNode, rng: () => number): void => {
  if (node.type === NodeType.REST) {
    if (state.player.hp < state.player.maxHp) {
      state.player.hp = Math.min(state.player.maxHp, state.player.hp + Math.floor(state.player.maxHp * 0.3));
    } else {
      removeLowestValueCard(state);
    }
    return;
  }

  if (node.type === NodeType.SHOP) {
    const energyItem = SHOP_ITEMS.find(item => item.effect.type === 'MAX_ENERGY');
    const rareItem = SHOP_ITEMS.find(item => item.effect.type === 'GAIN_RANDOM_CARD');
    const healItem = SHOP_ITEMS.find(item => item.effect.type === 'HEAL_PERCENT');
    const removeItem = SHOP_ITEMS.find(item => item.effect.type === 'REMOVE_CARD');

    if (healItem && state.player.gold >= healItem.price && healItem.effect.type === 'HEAL_PERCENT' && state.player.hp < state.player.maxHp * 0.65) {
      state.player.gold -= healItem.price;
      state.player.hp = Math.min(state.player.maxHp, state.player.hp + Math.floor(state.player.maxHp * healItem.effect.percent));
    } else if (energyItem && state.player.gold >= energyItem.price) {
      state.player.gold -= energyItem.price;
      state.player.maxEnergy += energyItem.effect.type === 'MAX_ENERGY' ? energyItem.effect.amount : 0;
    } else if (rareItem && state.player.gold >= rareItem.price && rareItem.effect.type === 'GAIN_RANDOM_CARD') {
      state.player.gold -= rareItem.price;
      state.deck.push(createRandomCardReward(rareItem.effect.rarity, undefined, rng));
    } else if (healItem && state.player.gold >= healItem.price && healItem.effect.type === 'HEAL_PERCENT' && state.player.hp < state.player.maxHp) {
      state.player.gold -= healItem.price;
      state.player.hp = Math.min(state.player.maxHp, state.player.hp + Math.floor(state.player.maxHp * healItem.effect.percent));
    } else if (removeItem && state.player.gold >= removeItem.price) {
      state.player.gold -= removeItem.price;
      removeLowestValueCard(state);
    }
    return;
  }

  if (node.type === NodeType.EVENT) {
    const event = GAME_EVENTS.find(candidate => candidate.id === node.eventId);
    assert(!!event, `Event node ${node.id} should reference a valid event`);
    const payableOptions = event!.options.filter(option => canPayEventOption(state, option));
    assert(payableOptions.length > 0, `Event ${event!.id} should have at least one payable option`);
    const preferredOptions = payableOptions.filter(option => option.type !== 'LEAVE');
    applyEventOption(state, preferredOptions.length > 0 ? pick(preferredOptions, rng) : pick(payableOptions, rng), rng);
  }
};

const applyCombatReward = (state: SimState, enemyTier: EnemyTier, rng: () => number, result: SimResult): void => {
  const rewardRule = getCombatRewardRule(enemyTier);
  state.player.gold += rollGoldReward(rewardRule, rng);
  const rewardCard = chooseRewardCard(createCombatCardRewards(rewardRule, rng));

  if (rewardCard) {
    state.deck.push(rewardCard);
    result.cardsSeen.add(rewardCard.id);
  }

  result.rewards += 1;
};

const applyBossReward = (state: SimState, rng: () => number): void => {
  const reward = pick(BOSS_REWARDS, rng);

  switch (reward.effect.type) {
    case 'MAX_ENERGY':
      state.player.maxEnergy += reward.effect.amount;
      break;
    case 'MAX_HP':
      state.player.maxHp += reward.effect.amount;
      state.player.hp += reward.effect.amount;
      break;
    case 'GAIN_GOLD':
      state.player.gold += reward.effect.amount;
      break;
  }
};

const chooseMapNode = (nodes: MapNode[], state: SimState, rng: () => number): MapNode => {
  assert(nodes.length > 0, 'A route should always have an available next node');
  const scored = nodes.map(node => {
    let score = rng();

    if (node.type === NodeType.REST && state.player.hp < state.player.maxHp) score += state.player.hp < state.player.maxHp * 0.65 ? 8 : 3;
    if (node.type === NodeType.SHOP && state.player.gold >= 75) score += 3;
    if (node.type === NodeType.EVENT) score += 1.5;
    if (node.type === NodeType.ELITE && state.player.hp > state.player.maxHp * 0.85) score += 1;
    if (node.type === NodeType.BOSS) score += 10;

    return { node, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0].node;
};

const simulateRun = (seed: number): SimResult => {
  const rng = createSeededRng(seed);
  const state = createInitialState(rng);
  const result: SimResult = {
    seed,
    terminal: 'LOSE',
    act: 1,
    floor: 0,
    combats: 0,
    turns: 0,
    rewards: 0,
    cardsSeen: new Set(INITIAL_DECK_IDS)
  };

  for (const act of [1, 2, 3] as const) {
    result.act = act;
    let currentNodeId: string | null = null;
    const mapNodes = createActMap(act, rng);

    while (true) {
      const availableNodeIds = getAvailableMapNodeIds(mapNodes, currentNodeId);
      const availableNodes = availableNodeIds.map(id => {
        const node = mapNodes.find(candidate => candidate.id === id);
        assert(!!node, `Map node ${id} should exist`);
        return node!;
      });
      const node = chooseMapNode(availableNodes, state, rng);
      currentNodeId = node.id;
      result.floor = node.floor;

      if (node.type === NodeType.COMBAT || node.type === NodeType.ELITE || node.type === NodeType.BOSS) {
        assert(!!node.enemyId, `Combat node ${node.id} should reference an enemy`);
        const enemy = Object.values(ENEMIES).find(candidate => candidate.id === node.enemyId);
        assert(!!enemy, `Enemy ${node.enemyId} should exist`);
        const combat = simulateCombat(state, enemy!, rng);
        result.combats += 1;
        result.turns += combat.turns;

        if (!combat.won) {
          result.terminal = 'LOSE';
          return result;
        }

        applyCombatReward(state, enemy!.tier, rng, result);

        if (node.type === NodeType.BOSS) {
          if (act === 3) {
            result.terminal = 'WIN';
            return result;
          }

          applyBossReward(state, rng);
          break;
        }
      } else {
        processNonCombatNode(state, node, rng);
        if (state.player.hp <= 0) {
          result.terminal = 'LOSE';
          return result;
        }
      }
    }
  }

  result.terminal = 'WIN';
  return result;
};

const startedAt = Date.now();
const results = Array.from({ length: RUN_COUNT }, (_, index) => simulateRun(index + 1));
const wins = results.filter(result => result.terminal === 'WIN').length;
const losses = RUN_COUNT - wins;
const totalCombats = results.reduce((sum, result) => sum + result.combats, 0);
const totalTurns = results.reduce((sum, result) => sum + result.turns, 0);
const totalRewards = results.reduce((sum, result) => sum + result.rewards, 0);
const allSeenCardIds = new Set(results.flatMap(result => [...result.cardsSeen]));
const terminalStates = new Set(results.map(result => result.terminal));

assert(results.length === RUN_COUNT, `Expected ${RUN_COUNT} simulated runs`);
assert(results.every(result => result.combats > 0), 'Every simulated run should enter at least one combat');
assert(results.every(result => result.floor >= 1 && result.floor <= 15), 'Every simulated run should stop on a valid floor');
assert(terminalStates.size > 0, 'Simulations should reach terminal states');

console.log(`Seeded run simulation: ${RUN_COUNT} runs completed in ${Date.now() - startedAt}ms`);
console.log(`Results: ${wins} wins / ${losses} losses`);
console.log(`Coverage: ${totalCombats} combats, ${totalTurns} combat turns, ${totalRewards} rewards, ${allSeenCardIds.size}/${CARD_DATABASE.length} card ids seen`);
