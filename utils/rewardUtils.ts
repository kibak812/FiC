import { BOSS_REWARDS, CARD_DATABASE, COMBAT_REWARD_RULES, SHOP_ITEMS } from '../constants';
import {
  BossRewardDefinition,
  BossRewardId,
  CardInstance,
  CardRarity,
  CardType,
  CombatRewardId,
  CombatRewardRule,
  EnemyTier,
  ShopItemDefinition,
  ShopItemId
} from '../types';
import { generateId, shuffle } from './cardUtils';
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

export const createCombatCardRewards = (
  rule: CombatRewardRule,
  rng: RandomSource = Math.random
): CardInstance[] => {
  const pool = CARD_DATABASE.filter(card => rule.cardRarities.includes(card.rarity));
  return shuffle(pool, rng)
    .slice(0, rule.cardOptionCount)
    .map(card => ({ ...card, instanceId: generateId(rng) }));
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
