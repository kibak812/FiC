import { BOSS_REWARDS, CARD_DATABASE, ENEMIES, GAME_EVENTS, INITIAL_DECK_IDS, SHOP_ITEMS } from '../constants';
import { CardInstance, CardRarity, CardType, EnemyData, EnemyTier, EnemyTrait, EventOption, MapNode, NodeType, PlayerStats, ShopItemDefinition } from '../types';
import { cleanJunkFromDeck, createCardInstance, resetTemporaryDeckModifiers, shuffle } from '../utils/cardUtils';
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
import { applyCombatEffectActions, calculateEnemyIntentPlan, calculateWeaponStats, resolveEnemyTurn, resolvePlayerWeaponAttack } from '../utils/combatEngine';
import { createActMap, getAvailableMapNodeIds } from '../utils/mapUtils';
import { createInitialPlayerStats } from '../utils/playerUtils';
import { createCombatRewardBundle, createRandomCardReward, resolveBossReward, resolveShopPurchase } from '../utils/rewardUtils';
import { assert, createSeededRng, pick } from './testUtils';

const RUN_COUNT = Number(process.env.SIM_RUNS || 1000);
const MIN_WIN_RATE = Number(process.env.SIM_MIN_WIN_RATE || 0.05);
const MAX_COMBAT_TURNS = 60;
const MAX_WEAPONS_PER_TURN = 5;

type TerminalState = 'WIN' | 'LOSE';
type LossReason = 'DEATH' | 'TIMEOUT' | 'NON_COMBAT' | null;

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
  nodeType: NodeType | null;
  enemyId: string | null;
  playerHp: number;
  entryHp: number;
  enemyHp: number | null;
  deckSize: number;
  lossReason: LossReason;
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
  player: createInitialPlayerStats(),
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

const resetPlayerCombatDebuffs = (player: PlayerStats): void => {
  player.energy = player.maxEnergy;
  player.block = 0;
  player.costLimit = null;
  player.disarmed = false;
  player.nextTurnDraw = 0;
  player.overheat = 0;
  player.weaponsUsedThisTurn = 0;
  player.dodgeNextAttack = false;
  player.selfDamageThisTurn = 0;
};

const cleanupCombatCards = (state: SimState): void => {
  state.deck = resetTemporaryDeckModifiers(cleanJunkFromDeck([
    ...state.deck,
    ...state.hand,
    ...state.discard
  ]));
  state.hand = [];
  state.discard = [];
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

const countCardsByType = (state: SimState): Record<CardType.HANDLE | CardType.HEAD | CardType.DECO, number> => {
  const counts = {
    [CardType.HANDLE]: 0,
    [CardType.HEAD]: 0,
    [CardType.DECO]: 0
  };

  for (const card of [...state.deck, ...state.hand, ...state.discard]) {
    if (card.type === CardType.HANDLE || card.type === CardType.HEAD || card.type === CardType.DECO) {
      counts[card.type] += 1;
    }
  }

  return counts;
};

const scoreRewardCard = (state: SimState, card: CardInstance): number => {
  const counts = countCardsByType(state);
  const pairCount = Math.min(counts[CardType.HANDLE], counts[CardType.HEAD]);
  let score = scoreCard(card);

  if (card.type === CardType.HEAD && counts[CardType.HEAD] <= counts[CardType.HANDLE]) score += 18;
  if (card.type === CardType.HANDLE && counts[CardType.HANDLE] < counts[CardType.HEAD]) score += 16;
  if (card.type === CardType.DECO && pairCount >= counts[CardType.DECO]) score += 8;
  if (card.cost <= Math.max(1, state.player.maxEnergy - 2)) score += 5;
  if (card.cost > state.player.maxEnergy) score -= 20;
  if (card.type === CardType.JUNK || card.rarity === CardRarity.SPECIAL) score -= 100;

  return score;
};

const chooseRewardCard = (state: SimState, cards: CardInstance[]): CardInstance | null => {
  if (cards.length === 0) return null;
  const ranked = [...cards].sort((a, b) => scoreRewardCard(state, b) - scoreRewardCard(state, a));
  const bestCard = ranked[0];
  const allCards = [...state.deck, ...state.hand, ...state.discard]
    .filter(card => card.type !== CardType.JUNK && card.rarity !== CardRarity.SPECIAL);
  const averageDeckScore = allCards.reduce((sum, card) => sum + scoreCard(card), 0) / Math.max(1, allCards.length);
  const bestScore = scoreRewardCard(state, bestCard);

  if (allCards.length >= 18 && bestScore < averageDeckScore + 4) {
    return null;
  }

  return bestCard;
};

const createScoringEffectContext = (
  state: SimState,
  enemy: EnemyData,
  slots: WeaponSlots,
  stats: ReturnType<typeof calculateWeaponStats>
): CardEffectContext => ({
  slots,
  stats,
  player: state.player,
  enemy,
  effectMultiplier: isTwinHandle(slots.handle?.id || 0) ? 2 : 1,
  remainingEnergyAfterCost: Math.max(0, state.player.energy - stats.totalCost),
  growingCrystalBonus: state.growingCrystalBonus,
  rng: () => 0.5,
  showFeedback: () => undefined
});

const scoreEffectAction = (
  action: EffectAction,
  state: SimState,
  enemy: EnemyData,
  incomingDamage: number
): number => {
  switch (action.type) {
    case 'MODIFY_DAMAGE':
      return 0;
    case 'MODIFY_BLOCK':
      return 0;
    case 'SET_IGNORE_BLOCK':
      return action.value && enemy.block > 0 ? Math.min(12, enemy.block * 0.65) : 0;
    case 'PLAYER_SELF_DAMAGE':
      return -action.amount * (state.player.hp < state.player.maxHp * 0.4 ? 2.5 : 1.2);
    case 'PLAYER_HEAL':
      return Math.min(action.amount, state.player.maxHp - state.player.hp) * 0.8;
    case 'PLAYER_GAIN_ENERGY':
      return action.amount * 5;
    case 'PLAYER_GAIN_BLOCK':
      return Math.min(action.amount, incomingDamage) * 0.9;
    case 'PLAYER_REDUCE_BLOCK':
      return -action.amount;
    case 'PLAYER_GAIN_GOLD':
      return action.amount * 0.25;
    case 'PLAYER_SET_DODGE':
      return action.value ? Math.max(6, incomingDamage) : 0;
    case 'PLAYER_OVERHEAT':
      return -action.amount * 7;
    case 'PLAYER_NEXT_TURN_DRAW':
      return action.amount * 3;
    case 'ENEMY_APPLY_STATUS': {
      const bossMultiplier = enemy.tier === EnemyTier.BOSS ? 1.35 : 1;
      const statusValues = {
        poison: 3.2,
        bleed: 2.2,
        burn: 3.4,
        vulnerable: 7,
        weak: incomingDamage > 0 ? 5 : 2,
        stunned: 12,
        strength: 0
      };
      return action.amount * statusValues[action.status] * bossMultiplier;
    }
    case 'ENEMY_SKIP_INTENT':
      return 8;
    case 'ENEMY_EXECUTE_THRESHOLD':
      return enemy.currentHp <= enemy.maxHp * action.threshold ? 40 : 5;
    case 'DRAW_CARDS':
      return action.count * 5;
    case 'CREATE_REPLICA':
      return Math.min(12, Math.max(4, action.baseDamage * 0.4));
    case 'GROW_CRYSTAL':
      return state.growingCrystalBonus < action.max ? 10 : 0;
  }
};

const evaluateWeaponChoice = (
  state: SimState,
  enemy: EnemyData,
  slots: WeaponSlots,
  stats: ReturnType<typeof calculateWeaponStats>,
  incomingDamage: number
): { finalDamage: number; finalBlock: number; ignoreBlock: boolean; effectScore: number } => {
  let modifiers: EffectModifiers = {
    finalDamage: stats.damage,
    finalBlock: stats.block,
    ignoreBlock: false,
    selfDamage: state.player.selfDamageThisTurn
  };
  const ctx = createScoringEffectContext(state, enemy, slots, stats);
  const selfDamageActions = executeEffectsForPhase(ctx, modifiers, 'SELF_DAMAGE');
  modifiers = applyModifierActions(modifiers, selfDamageActions);
  const preDamageActions = executeEffectsForPhase(ctx, modifiers, 'PRE_DAMAGE');
  modifiers = applyModifierActions(modifiers, preDamageActions);
  const postDamageActions = executeEffectsForPhase(ctx, modifiers, 'POST_DAMAGE');
  const allActions = [...selfDamageActions, ...preDamageActions, ...postDamageActions];

  return {
    finalDamage: modifiers.finalDamage,
    finalBlock: modifiers.finalBlock,
    ignoreBlock: modifiers.ignoreBlock,
    effectScore: allActions.reduce((sum, action) => sum + scoreEffectAction(action, state, enemy, incomingDamage), 0)
  };
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

        const evaluation = evaluateWeaponChoice(state, enemy, slots, stats, incomingDamage);
        const twinMultiplier = isTwinHandle(handle.id) ? 2 : 1;
        let perHitDamage = evaluation.finalDamage;
        if (enemy.statuses.vulnerable > 0) perHitDamage = Math.floor(perHitDamage * 1.5);
        if (enemy.traits.includes(EnemyTrait.DAMAGE_CAP_15) && perHitDamage > 15) perHitDamage = 15;

        const hitLoops = stats.hitCount * twinMultiplier;
        const totalDamageEstimate = perHitDamage * hitLoops;
        const enemyHpDamageEstimate = evaluation.ignoreBlock
          ? totalDamageEstimate
          : Math.max(0, totalDamageEstimate - enemy.block);
        const enemyBlockChipEstimate = evaluation.ignoreBlock ? 0 : Math.min(enemy.block, totalDamageEstimate);
        const slotQualityScore =
          [handle, head, deco].filter(Boolean).reduce((sum, card) => sum + scoreCard(card!), 0) * 0.04;
        const expectedBlockedDamage = Math.min(incomingDamage, evaluation.finalBlock + state.player.block);
        const expectedHpLoss = Math.max(0, incomingDamage - state.player.block - evaluation.finalBlock);
        const currentExpectedHpLoss = Math.max(0, incomingDamage - state.player.block);
        const preventedHpLoss = Math.max(0, currentExpectedHpLoss - expectedHpLoss);
        const lethalRiskPenalty = expectedHpLoss >= state.player.hp && incomingDamage > 0 ? 70 : 0;
        const bossSurvivalBonus = enemy.tier === EnemyTier.BOSS ? preventedHpLoss * 1.3 : 0;
        const thornsPenalty = enemy.traits.includes(EnemyTrait.THORNS_5) && totalDamageEstimate > 0
          ? hitLoops * 5 * (state.player.hp < state.player.maxHp * 0.45 ? 1.8 : 0.9)
          : 0;
        const lethalBonus = enemyHpDamageEstimate >= enemy.currentHp ? 25 : 0;
        const score =
          enemyHpDamageEstimate +
          enemyBlockChipEstimate * 0.35 +
          evaluation.finalBlock * blockWeight +
          expectedBlockedDamage * 0.75 +
          bossSurvivalBonus +
          evaluation.effectScore +
          slotQualityScore +
          lethalBonus -
          lethalRiskPenalty -
          thornsPenalty -
          stats.totalCost * 0.35;

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
  const result = applyCombatEffectActions({
    player: state.player,
    enemy,
    modifiers,
    growingCrystalBonus: state.growingCrystalBonus
  }, actions);

  state.player = result.player;
  Object.assign(enemy, result.enemy, { statuses: { ...result.enemy.statuses } });
  Object.assign(modifiers, result.modifiers);
  state.growingCrystalBonus = result.growingCrystalBonus;

  for (const sideEffect of result.sideEffects) {
    switch (sideEffect.type) {
      case 'DRAW_CARDS':
        drawCards(state, sideEffect.count, rng);
        break;
      case 'CREATE_REPLICA': {
        const replica = createCardInstance(801, rng);
        replica.value = sideEffect.baseDamage;
        replica.description = `Simulated replica. Damage ${sideEffect.baseDamage}. Cost 0.`;
        state.deck.push(replica);
        break;
      }
    }
  }
};

const createEffectContext = (
  state: SimState,
  enemy: EnemyData,
  slots: WeaponSlots,
  stats: ReturnType<typeof calculateWeaponStats>,
  modifiers: EffectModifiers,
  rng: () => number,
  playerSnapshot: PlayerStats = state.player,
  remainingEnergyAfterCost: number = Math.max(0, state.player.energy - stats.totalCost)
): CardEffectContext => ({
  slots,
  stats,
  player: playerSnapshot,
  enemy,
  effectMultiplier: isTwinHandle(slots.handle?.id || 0) ? 2 : 1,
  remainingEnergyAfterCost,
  growingCrystalBonus: state.growingCrystalBonus,
  rng,
  showFeedback: () => undefined
});

const forgeBestWeapon = (state: SimState, enemy: EnemyData, rng: () => number): boolean => {
  const choice = chooseBestWeapon(state, enemy);
  if (!choice) return false;

  const { slots, stats } = choice;
  const playerBeforeForge = { ...state.player };
  const remainingEnergyAfterCost = Math.max(0, state.player.energy - stats.totalCost);
  state.player.energy -= stats.totalCost;
  state.player.weaponsUsedThisTurn += 1;

  let modifiers: EffectModifiers = {
    finalDamage: stats.damage,
    finalBlock: stats.block,
    ignoreBlock: false,
    selfDamage: state.player.selfDamageThisTurn
  };

  let ctx = createEffectContext(state, enemy, slots, stats, modifiers, rng, playerBeforeForge, remainingEnergyAfterCost);
  processActions(executeEffectsForPhase(ctx, modifiers, 'SELF_DAMAGE'), modifiers, state, enemy, rng);
  if (state.player.hp <= 0) return true;

  ctx = createEffectContext(state, enemy, slots, stats, modifiers, rng, playerBeforeForge, remainingEnergyAfterCost);
  modifiers = applyModifierActions(modifiers, executeEffectsForPhase(ctx, modifiers, 'PRE_DAMAGE'));

  const attackResult = resolvePlayerWeaponAttack({
    player: state.player,
    enemy,
    slots,
    stats,
    modifiers,
    growingCrystalBonus: state.growingCrystalBonus,
    effectMultiplier: isTwinHandle(slots.handle?.id || 0) ? 2 : 1,
    remainingEnergyAfterCost,
    rng
  });

  state.player = attackResult.player;
  Object.assign(enemy, attackResult.enemy, { statuses: { ...attackResult.enemy.statuses } });
  modifiers = attackResult.modifiers;
  state.growingCrystalBonus = attackResult.growingCrystalBonus;

  for (const sideEffect of attackResult.sideEffects) {
    switch (sideEffect.type) {
      case 'DRAW_CARDS':
        drawCards(state, sideEffect.count, rng);
        break;
      case 'CREATE_REPLICA': {
        const replica = createCardInstance(801, rng);
        replica.value = sideEffect.baseDamage;
        replica.description = `Simulated replica. Damage ${sideEffect.baseDamage}. Cost 0.`;
        state.deck.push(replica);
        break;
      }
    }
  }

  if (modifiers.finalBlock > 0) {
    state.player.block += modifiers.finalBlock;
  }

  ctx = createEffectContext(state, enemy, slots, stats, modifiers, rng, playerBeforeForge, remainingEnergyAfterCost);
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
  const result = resolveEnemyTurn(enemy, state.player, rng);
  state.player = result.player;
  Object.assign(enemy, result.enemy, { statuses: { ...result.enemy.statuses } });

  for (const sideEffect of result.sideEffects) {
    switch (sideEffect.type) {
      case 'INCREASE_RANDOM_HANDLE_COST': {
        const handles = [...state.deck, ...state.discard].filter(card => card.type === CardType.HANDLE);
        if (handles.length > 0) {
          pick(handles, rng).cost += sideEffect.amount;
        }
        break;
      }
      case 'ADD_JUNK':
        for (let i = 0; i < sideEffect.count; i++) {
          state.discard.push(createCardInstance(901, rng));
        }
        break;
    }
  }
};

const simulateCombat = (state: SimState, enemyData: EnemyData, rng: () => number): { won: boolean; turns: number; lossReason: LossReason; enemyHp: number } => {
  const enemy = cloneEnemy(enemyData);
  const finishWin = (turns: number) => {
    cleanupCombatCards(state);
    resetPlayerCombatDebuffs(state.player);
    return { won: true, turns, lossReason: null, enemyHp: enemy.currentHp };
  };

  cleanupCombatCards(state);
  resetPlayerCombatDebuffs(state.player);
  state.deck = shuffle(state.deck, rng);

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

    if (enemy.currentHp <= 0) return finishWin(turn);
    if (state.player.hp <= 0) return { won: false, turns: turn, lossReason: 'DEATH', enemyHp: enemy.currentHp };

    runEnemyTurn(state, enemy, rng);
    if (enemy.currentHp <= 0) return finishWin(turn);
    if (state.player.hp <= 0) return { won: false, turns: turn, lossReason: 'DEATH', enemyHp: enemy.currentHp };
  }

  return { won: false, turns: MAX_COMBAT_TURNS, lossReason: 'TIMEOUT', enemyHp: enemy.currentHp };
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

const scoreCardRemoval = (state: SimState): number => {
  const allCards = [...state.deck, ...state.discard];
  if (allCards.length === 0) return 0;
  const target = [...allCards].sort((a, b) => scoreCard(a) - scoreCard(b))[0];

  if (target.type === CardType.JUNK) return 45;
  if (target.rarity === CardRarity.STARTER) return 24;
  if (scoreCard(target) < 14) return 16;
  return 6;
};

const scoreEventOption = (state: SimState, option: EventOption): number => {
  const missingHp = state.player.maxHp - state.player.hp;
  const hpCostWeight = state.player.hp < state.player.maxHp * 0.45 ? 3.2 : 1.6;
  let score = 0;

  if (option.cost && option.costResource === 'GOLD') score -= option.cost * 0.3;
  if (option.cost && option.costResource === 'HP') score -= option.cost * hpCostWeight;

  switch (option.type) {
    case 'HEAL':
      score += Math.min(option.value || 0, missingHp) * 1.25;
      break;
    case 'DAMAGE':
      score -= (option.value || 0) * hpCostWeight;
      break;
    case 'GAIN_CARD_RARE':
      score += state.deck.length > 22 ? 14 : 30;
      break;
    case 'REMOVE_CARD':
      score += scoreCardRemoval(state);
      break;
    case 'GAIN_GOLD':
      score += (option.value || 0) * 0.34;
      break;
    case 'LOSE_GOLD':
      score -= (option.value || 0) * 0.35;
      break;
    case 'FULL_HEAL':
      score += missingHp * 1.15;
      break;
    case 'RANDOM_UPGRADE':
      score += 22 + Math.min(10, scoreCardRemoval(state) * 0.25);
      break;
    case 'LEAVE':
      break;
  }

  return score;
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

const applyShopItem = (state: SimState, item: ShopItemDefinition, rng: () => number): void => {
  const result = resolveShopPurchase(state.player, item.id, rng);
  state.player = result.player;

  switch (result.event.type) {
    case 'INSUFFICIENT_GOLD':
      break;
    case 'REMOVE_CARD':
      removeLowestValueCard(state);
      break;
    case 'GAIN_CARD':
      state.deck.push(result.event.card);
      break;
    case 'HEAL':
    case 'MAX_ENERGY':
      break;
  }
};

const scoreShopItem = (state: SimState, item: ShopItemDefinition): number => {
  const missingHp = state.player.maxHp - state.player.hp;
  let score = -item.price * 0.25;

  switch (item.effect.type) {
    case 'HEAL_PERCENT': {
      const healAmount = Math.min(missingHp, Math.floor(state.player.maxHp * item.effect.percent));
      score += healAmount * (state.player.hp < state.player.maxHp * 0.5 ? 1.45 : 0.9);
      break;
    }
    case 'REMOVE_CARD':
      score += scoreCardRemoval(state);
      break;
    case 'GAIN_RANDOM_CARD':
      score += state.deck.length > 22 ? 18 : 34;
      break;
    case 'MAX_ENERGY':
      score += state.player.maxEnergy < 6 ? 80 + (6 - state.player.maxEnergy) * 8 : -100;
      break;
  }

  return score;
};

const processNonCombatNode = (state: SimState, node: MapNode, rng: () => number): void => {
  if (node.type === NodeType.REST) {
    if (state.player.hp < state.player.maxHp) {
      state.player.hp = Math.min(state.player.maxHp, state.player.hp + Math.floor(state.player.maxHp * 0.5));
    } else {
      removeLowestValueCard(state);
    }
    return;
  }

  if (node.type === NodeType.SHOP) {
    const purchasedItemIds = new Set<string>();

    for (let purchaseCount = 0; purchaseCount < 4; purchaseCount++) {
      const affordableItems = SHOP_ITEMS.filter(item => state.player.gold >= item.price && !purchasedItemIds.has(item.id));
      if (affordableItems.length === 0) break;

      const bestItem = affordableItems
        .map(item => ({ item, score: scoreShopItem(state, item) }))
        .sort((a, b) => b.score - a.score)[0];

      if (!bestItem || bestItem.score <= 0) break;
      applyShopItem(state, bestItem.item, rng);
      purchasedItemIds.add(bestItem.item.id);
    }
    return;
  }

  if (node.type === NodeType.EVENT) {
    const event = GAME_EVENTS.find(candidate => candidate.id === node.eventId);
    assert(!!event, `Event node ${node.id} should reference a valid event`);
    const payableOptions = event!.options.filter(option => canPayEventOption(state, option));
    assert(payableOptions.length > 0, `Event ${event!.id} should have at least one payable option`);
    const bestOption = payableOptions
      .map(option => ({ option, score: scoreEventOption(state, option) + rng() * 0.01 }))
      .sort((a, b) => b.score - a.score)[0].option;
    applyEventOption(state, bestOption, rng);
  }
};

const applyCombatReward = (state: SimState, enemyTier: EnemyTier, rng: () => number, result: SimResult): void => {
  const rewardBundle = createCombatRewardBundle(enemyTier, rng);
  state.player.gold += rewardBundle.gold;
  const rewardCard = chooseRewardCard(state, rewardBundle.cardOptions);

  if (rewardCard) {
    state.deck.push(rewardCard);
    result.cardsSeen.add(rewardCard.id);
  }

  result.rewards += 1;
};

const applyBossReward = (state: SimState, act: 1 | 2, rng: () => number): void => {
  const reward = act === 1 && state.player.maxEnergy < 5
    ? BOSS_REWARDS.find(candidate => candidate.effect.type === 'MAX_ENERGY') || pick(BOSS_REWARDS, rng)
    : state.player.maxHp < 100
      ? BOSS_REWARDS.find(candidate => candidate.effect.type === 'MAX_HP') || pick(BOSS_REWARDS, rng)
      : pick(BOSS_REWARDS, rng);

  state.player = resolveBossReward(state.player, reward.id, true).player;
};

const chooseMapNode = (nodes: MapNode[], state: SimState, result: SimResult, rng: () => number): MapNode => {
  assert(nodes.length > 0, 'A route should always have an available next node');
  const hpRatio = state.player.hp / state.player.maxHp;
  const deckQuality = [...state.deck, ...state.hand, ...state.discard]
    .filter(card => card.type !== CardType.JUNK)
    .reduce((sum, card) => sum + scoreCard(card), 0);

  const scored = nodes.map(node => {
    let score = rng();

    if (node.type === NodeType.COMBAT) score += hpRatio < 0.55 ? -1.5 : 1.4;
    if (node.type === NodeType.REST && state.player.hp < state.player.maxHp) score += hpRatio < 0.65 ? 8 : 3;
    if (node.type === NodeType.SHOP) {
      if (state.player.gold >= 40 && hpRatio < 0.8) score += 7;
      else if (state.player.gold >= 75) score += hpRatio < 0.55 ? 4 : 2.5;
    }
    if (node.type === NodeType.EVENT) score += hpRatio < 0.7 ? 2.4 : 1.2;
    if (node.type === NodeType.ELITE) {
      const hasEliteBuffer = hpRatio > 0.85 && result.rewards >= 3 && deckQuality >= 180;
      score += hasEliteBuffer ? 2.5 : -5;
    }
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
    nodeType: null,
    enemyId: null,
    playerHp: state.player.hp,
    entryHp: state.player.hp,
    enemyHp: null,
    deckSize: state.deck.length,
    lossReason: null,
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
      const node = chooseMapNode(availableNodes, state, result, rng);
      currentNodeId = node.id;
      result.floor = node.floor;
      result.nodeType = node.type;
      result.enemyId = node.enemyId || null;
      result.playerHp = state.player.hp;
      result.entryHp = state.player.hp;
      result.enemyHp = null;
      result.deckSize = state.deck.length + state.hand.length + state.discard.length;

      if (node.type === NodeType.COMBAT || node.type === NodeType.ELITE || node.type === NodeType.BOSS) {
        assert(!!node.enemyId, `Combat node ${node.id} should reference an enemy`);
        const enemy = Object.values(ENEMIES).find(candidate => candidate.id === node.enemyId);
        assert(!!enemy, `Enemy ${node.enemyId} should exist`);
        const combat = simulateCombat(state, enemy!, rng);
        result.combats += 1;
        result.turns += combat.turns;

        if (!combat.won) {
          result.terminal = 'LOSE';
          result.playerHp = state.player.hp;
          result.enemyHp = combat.enemyHp;
          result.deckSize = state.deck.length + state.hand.length + state.discard.length;
          result.lossReason = combat.lossReason;
          return result;
        }

        applyCombatReward(state, enemy!.tier, rng, result);

        if (node.type === NodeType.BOSS) {
          if (act === 3) {
            result.terminal = 'WIN';
            result.playerHp = state.player.hp;
            result.enemyHp = combat.enemyHp;
            result.deckSize = state.deck.length + state.hand.length + state.discard.length;
            return result;
          }

          applyBossReward(state, act, rng);
          break;
        }
      } else {
        processNonCombatNode(state, node, rng);
        if (state.player.hp <= 0) {
          result.terminal = 'LOSE';
          result.playerHp = state.player.hp;
          result.enemyHp = null;
          result.deckSize = state.deck.length + state.hand.length + state.discard.length;
          result.lossReason = 'NON_COMBAT';
          return result;
        }
      }
    }
  }

  result.terminal = 'WIN';
  result.playerHp = state.player.hp;
  result.enemyHp = null;
  result.deckSize = state.deck.length + state.hand.length + state.discard.length;
  return result;
};

const startedAt = Date.now();
const results = Array.from({ length: RUN_COUNT }, (_, index) => simulateRun(index + 1));
const wins = results.filter(result => result.terminal === 'WIN').length;
const losses = RUN_COUNT - wins;
const minWins = Math.ceil(RUN_COUNT * MIN_WIN_RATE);
const totalCombats = results.reduce((sum, result) => sum + result.combats, 0);
const totalTurns = results.reduce((sum, result) => sum + result.turns, 0);
const totalRewards = results.reduce((sum, result) => sum + result.rewards, 0);
const allSeenCardIds = new Set(results.flatMap(result => [...result.cardsSeen]));
const terminalStates = new Set(results.map(result => result.terminal));
const lossesByCheckpoint = results
  .filter(result => result.terminal === 'LOSE')
  .reduce<Record<string, number>>((counts, result) => {
    const key = `A${result.act}F${result.floor}:${result.nodeType || 'UNKNOWN'}:${result.enemyId || 'none'}:${result.lossReason || 'unknown'}`;
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
const topLosses = Object.entries(lossesByCheckpoint)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .map(([checkpoint, count]) => `${checkpoint}=${count}`)
  .join(', ');
const lossesByAct = results
  .filter(result => result.terminal === 'LOSE')
  .reduce<Record<number, number>>((counts, result) => {
    counts[result.act] = (counts[result.act] || 0) + 1;
    return counts;
  }, {});
const bossLosses = results.filter(result => result.terminal === 'LOSE' && result.nodeType === NodeType.BOSS);
const averageBossEntryHp = bossLosses.length > 0
  ? bossLosses.reduce((sum, result) => sum + result.entryHp, 0) / bossLosses.length
  : 0;
const averageBossEnemyHp = bossLosses.length > 0
  ? bossLosses.reduce((sum, result) => sum + (result.enemyHp || 0), 0) / bossLosses.length
  : 0;

assert(results.length === RUN_COUNT, `Expected ${RUN_COUNT} simulated runs`);
assert(results.every(result => result.combats > 0), 'Every simulated run should enter at least one combat');
assert(results.every(result => result.floor >= 1 && result.floor <= 15), 'Every simulated run should stop on a valid floor');
assert(terminalStates.size > 0, 'Simulations should reach terminal states');
assert(wins >= minWins, `Seeded simulation should produce at least ${minWins} wins at ${(MIN_WIN_RATE * 100).toFixed(1)}% minimum win rate`);

console.log(`Seeded run simulation: ${RUN_COUNT} runs completed in ${Date.now() - startedAt}ms`);
console.log(`Results: ${wins} wins / ${losses} losses`);
console.log(`Coverage: ${totalCombats} combats, ${totalTurns} combat turns, ${totalRewards} rewards, ${allSeenCardIds.size}/${CARD_DATABASE.length} card ids seen`);
if (losses > 0) console.log(`Top loss checkpoints: ${topLosses}`);
if (losses > 0) console.log(`Losses by act: ${[1, 2, 3].map(act => `A${act}=${lossesByAct[act] || 0}`).join(', ')}`);
if (bossLosses.length > 0) {
  console.log(`Boss loss average: entry HP ${averageBossEntryHp.toFixed(1)}, enemy HP remaining ${averageBossEnemyHp.toFixed(1)}`);
}
