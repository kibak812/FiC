import { BOSS_REWARDS, CARD_ARCHETYPES, CARD_DATABASE, COMBAT_REWARD_RULES, SHOP_ITEMS } from '../constants';
import {
  BossRewardDefinition,
  CardData,
  BossRewardId,
  CardInstance,
  CardRarity,
  CardType,
  CombatRewardContext,
  CombatRewardId,
  CombatRewardRule,
  EnemyTier,
  PlayerStats,
  ShopItemDefinition,
  ShopItemId
} from '../types';
import { generateId } from './cardUtils';
import type { RandomSource } from './cardUtils';

const COMBAT_REWARD_BY_ENEMY_TIER: Record<EnemyTier, CombatRewardId> = {
  [EnemyTier.COMMON]: 'COMMON',
  [EnemyTier.ELITE]: 'ELITE',
  [EnemyTier.BOSS]: 'BOSS'
};

export const getCombatRewardRule = (enemyTier: EnemyTier): CombatRewardRule => {
  return COMBAT_REWARD_RULES[COMBAT_REWARD_BY_ENEMY_TIER[enemyTier]];
};

export const rollGoldReward = (rule: CombatRewardRule, rng: RandomSource = Math.random): number => {
  const range = rule.gold.max - rule.gold.min + 1;
  return rule.gold.min + Math.floor(rng() * range);
};

const REWARD_RARITIES = [CardRarity.COMMON, CardRarity.RARE, CardRarity.LEGEND];
const CORE_CARD_TYPES = [CardType.HANDLE, CardType.HEAD, CardType.DECO] as const;

const getRewardablePool = (rule: CombatRewardRule, selectedIds: Set<number> = new Set()): CardData[] => {
  return CARD_DATABASE.filter(card =>
    CORE_CARD_TYPES.includes(card.type as typeof CORE_CARD_TYPES[number]) &&
    rule.cardRarities.includes(card.rarity) &&
    !selectedIds.has(card.id)
  );
};

const getAdjustedRarityWeights = (
  rule: CombatRewardRule,
  context?: CombatRewardContext
): Partial<Record<CardRarity, number>> => {
  const weights: Partial<Record<CardRarity, number>> = { ...rule.rarityWeights };

  if (!context) return weights;

  const totalFloor = (context.act - 1) * 15 + context.floor;
  const legendUnlock = (context.act - 1) * 15 + rule.legendUnlockFloor;

  if (totalFloor < legendUnlock) {
    weights[CardRarity.LEGEND] = 0;
  }

  if (context.act >= 2) {
    weights[CardRarity.RARE] = (weights[CardRarity.RARE] || 0) + 4;
  }

  if (context.act >= 3) {
    weights[CardRarity.LEGEND] = (weights[CardRarity.LEGEND] || 0) + 3;
  }

  return weights;
};

const chooseRewardRarity = (
  rule: CombatRewardRule,
  pool: CardData[],
  rng: RandomSource,
  context?: CombatRewardContext
): CardRarity => {
  const weights = getAdjustedRarityWeights(rule, context);
  const availableRarities = REWARD_RARITIES
    .filter(rarity => rule.cardRarities.includes(rarity))
    .filter(rarity => (weights[rarity] || 0) > 0)
    .filter(rarity => pool.some(card => card.rarity === rarity));

  if (availableRarities.length === 0) {
    const fallback = REWARD_RARITIES.find(rarity => pool.some(card => card.rarity === rarity));
    if (!fallback) throw new Error(`No reward cards available for ${rule.id}`);
    return fallback;
  }

  const totalWeight = availableRarities.reduce((sum, rarity) => sum + (weights[rarity] || 0), 0);
  let roll = rng() * totalWeight;

  for (const rarity of availableRarities) {
    roll -= weights[rarity] || 0;
    if (roll <= 0) return rarity;
  }

  return availableRarities[availableRarities.length - 1];
};

const getActStageCardIds = (act: CombatRewardContext['act']): Set<number> => {
  const ids = CARD_ARCHETYPES.flatMap(archetype => {
    if (act === 1) return archetype.entryCardIds;
    if (act === 2) return archetype.midCardIds;
    return archetype.lateCardIds;
  });

  return new Set(ids);
};

const scoreSlotNeed = (card: CardData, deck: CardInstance[]): number => {
  const playableDeck = deck.filter(deckCard => CORE_CARD_TYPES.includes(deckCard.type as typeof CORE_CARD_TYPES[number]));
  if (playableDeck.length === 0) return 1;

  const counts = {
    [CardType.HANDLE]: playableDeck.filter(deckCard => deckCard.type === CardType.HANDLE).length,
    [CardType.HEAD]: playableDeck.filter(deckCard => deckCard.type === CardType.HEAD).length,
    [CardType.DECO]: playableDeck.filter(deckCard => deckCard.type === CardType.DECO).length
  };

  const targetRatios = {
    [CardType.HANDLE]: 0.34,
    [CardType.HEAD]: 0.38,
    [CardType.DECO]: 0.28
  };
  const currentRatio = counts[card.type as keyof typeof counts] / playableDeck.length;
  const shortfall = targetRatios[card.type as keyof typeof targetRatios] - currentRatio;

  return Math.max(0.65, 1 + shortfall * 2.4);
};

const scoreArchetypeNeed = (card: CardData, context: CombatRewardContext): number => {
  const deckCardIds = new Set(context.deck.map(deckCard => deckCard.id));
  const stageCardIds = getActStageCardIds(context.act);
  let score = stageCardIds.has(card.id) ? 1.22 : 1;

  let strongestCount = 0;
  const matchingArchetypeCounts: number[] = [];

  for (const archetype of CARD_ARCHETYPES) {
    const archetypeCardIds = new Set([
      ...archetype.entryCardIds,
      ...archetype.midCardIds,
      ...archetype.lateCardIds,
      ...Object.values(archetype.slotCardIds).flat()
    ]);
    const deckMatchCount = [...deckCardIds].filter(id => archetypeCardIds.has(id)).length;
    strongestCount = Math.max(strongestCount, deckMatchCount);

    if (archetypeCardIds.has(card.id)) {
      matchingArchetypeCounts.push(deckMatchCount);
    }
  }

  const strongestMatchingCount = matchingArchetypeCounts.length > 0
    ? Math.max(...matchingArchetypeCounts)
    : 0;

  if (strongestMatchingCount >= 2) {
    score *= 1.35 + Math.min(0.45, strongestMatchingCount * 0.08);
  } else if (strongestCount < 2 && context.act === 1 && stageCardIds.has(card.id)) {
    score *= 1.12;
  }

  return score;
};

export const scoreCombatRewardCandidate = (
  card: CardData,
  context?: CombatRewardContext
): number => {
  if (!context) return 1;

  return scoreSlotNeed(card, context.deck) * scoreArchetypeNeed(card, context);
};

const chooseWeightedCard = (
  candidates: CardData[],
  rng: RandomSource,
  context?: CombatRewardContext
): CardData => {
  const scoredCandidates = candidates.map(card => ({
    card,
    score: scoreCombatRewardCandidate(card, context)
  }));
  const totalScore = scoredCandidates.reduce((sum, candidate) => sum + candidate.score, 0);
  let roll = rng() * totalScore;

  for (const candidate of scoredCandidates) {
    roll -= candidate.score;
    if (roll <= 0) return candidate.card;
  }

  return scoredCandidates[scoredCandidates.length - 1].card;
};

export interface CombatRewardBundle {
  rule: CombatRewardRule;
  gold: number;
  cardOptions: CardInstance[];
}

export const createCombatRewardBundle = (
  enemyTier: EnemyTier,
  rng: RandomSource = Math.random,
  context?: CombatRewardContext
): CombatRewardBundle => {
  const rule = getCombatRewardRule(enemyTier);

  return {
    rule,
    gold: rollGoldReward(rule, rng),
    cardOptions: createCombatCardRewards(rule, rng, context)
  };
};

export const createCombatCardRewards = (
  rule: CombatRewardRule,
  rng: RandomSource = Math.random,
  context?: CombatRewardContext
): CardInstance[] => {
  const selectedCards: CardData[] = [];
  const selectedIds = new Set<number>();

  for (let index = 0; index < rule.cardOptionCount; index++) {
    const remainingPool = getRewardablePool(rule, selectedIds);
    if (remainingPool.length === 0) break;

    const rarity = chooseRewardRarity(rule, remainingPool, rng, context);
    const rarityPool = remainingPool.filter(card => card.rarity === rarity);
    const selectedCard = chooseWeightedCard(rarityPool.length > 0 ? rarityPool : remainingPool, rng, context);

    selectedCards.push(selectedCard);
    selectedIds.add(selectedCard.id);
  }

  return selectedCards.map(card => ({ ...card, instanceId: generateId(rng) }));
};

export const createRandomCardReward = (
  rarity: CardRarity,
  type?: CardType,
  rng: RandomSource = Math.random
): CardInstance => {
  const pool = CARD_DATABASE.filter(card => card.rarity === rarity && (!type || card.type === type));
  const card = pool[Math.floor(rng() * pool.length)];

  if (!card) {
    throw new Error(`No card reward found for rarity ${rarity}${type ? ` and type ${type}` : ''}`);
  }

  return { ...card, instanceId: generateId(rng) };
};

export const getShopItemDefinition = (itemId: ShopItemId): ShopItemDefinition => {
  const item = SHOP_ITEMS.find(candidate => candidate.id === itemId);

  if (!item) {
    throw new Error(`Shop item ${itemId} not found`);
  }

  return item;
};

export const getBossRewardDefinition = (rewardId: BossRewardId): BossRewardDefinition => {
  const reward = BOSS_REWARDS.find(candidate => candidate.id === rewardId);

  if (!reward) {
    throw new Error(`Boss reward ${rewardId} not found`);
  }

  return reward;
};

export type ShopPurchaseEvent =
  | { type: 'INSUFFICIENT_GOLD'; missingGold: number }
  | { type: 'REMOVE_CARD' }
  | { type: 'HEAL'; amount: number; actualHeal: number }
  | { type: 'GAIN_CARD'; card: CardInstance }
  | { type: 'MAX_ENERGY'; amount: number };

export interface ShopPurchaseResult {
  player: PlayerStats;
  item: ShopItemDefinition;
  event: ShopPurchaseEvent;
}

export const resolveShopPurchase = (
  player: PlayerStats,
  itemId: ShopItemId,
  rng: RandomSource = Math.random
): ShopPurchaseResult => {
  const item = getShopItemDefinition(itemId);

  if (player.gold < item.price) {
    return {
      player: { ...player },
      item,
      event: { type: 'INSUFFICIENT_GOLD', missingGold: item.price - player.gold }
    };
  }

  const nextPlayer = {
    ...player,
    gold: player.gold - item.price
  };

  switch (item.effect.type) {
    case 'REMOVE_CARD':
      return { player: nextPlayer, item, event: { type: 'REMOVE_CARD' } };
    case 'HEAL_PERCENT': {
      const amount = Math.floor(player.maxHp * item.effect.percent);
      const nextHp = Math.min(player.maxHp, player.hp + amount);
      return {
        player: { ...nextPlayer, hp: nextHp },
        item,
        event: { type: 'HEAL', amount, actualHeal: nextHp - player.hp }
      };
    }
    case 'GAIN_RANDOM_CARD':
      return {
        player: nextPlayer,
        item,
        event: { type: 'GAIN_CARD', card: createRandomCardReward(item.effect.rarity, undefined, rng) }
      };
    case 'MAX_ENERGY':
      return {
        player: { ...nextPlayer, maxEnergy: nextPlayer.maxEnergy + item.effect.amount },
        item,
        event: { type: 'MAX_ENERGY', amount: item.effect.amount }
      };
  }
};

export type BossRewardEvent =
  | { type: 'MAX_ENERGY'; amount: number; fullRepair: boolean; healAmount: number }
  | { type: 'MAX_HP'; amount: number; fullRepair: boolean; healAmount: number }
  | { type: 'GAIN_GOLD'; amount: number; fullRepair: boolean; healAmount: number };

export interface BossRewardResult {
  player: PlayerStats;
  reward: BossRewardDefinition;
  event: BossRewardEvent;
}

export const resolveBossReward = (
  player: PlayerStats,
  rewardId: BossRewardId,
  fullRepair: boolean
): BossRewardResult => {
  const reward = getBossRewardDefinition(rewardId);
  let nextPlayer = { ...player };

  switch (reward.effect.type) {
    case 'MAX_ENERGY':
      nextPlayer = { ...nextPlayer, maxEnergy: nextPlayer.maxEnergy + reward.effect.amount };
      break;
    case 'MAX_HP':
      nextPlayer = {
        ...nextPlayer,
        maxHp: nextPlayer.maxHp + reward.effect.amount,
        hp: Math.min(nextPlayer.maxHp + reward.effect.amount, nextPlayer.hp + reward.effect.amount)
      };
      break;
    case 'GAIN_GOLD':
      nextPlayer = { ...nextPlayer, gold: nextPlayer.gold + reward.effect.amount };
      break;
  }

  if (fullRepair) {
    nextPlayer = { ...nextPlayer, hp: nextPlayer.maxHp };
  }

  return {
    player: nextPlayer,
    reward,
    event: {
      type: reward.effect.type,
      amount: reward.effect.amount,
      fullRepair,
      healAmount: nextPlayer.hp - player.hp
    }
  };
};
