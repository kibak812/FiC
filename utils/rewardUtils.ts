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
  PlayerStats,
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

export interface CombatRewardBundle {
  rule: CombatRewardRule;
  gold: number;
  cardOptions: CardInstance[];
}

export const createCombatRewardBundle = (
  enemyTier: EnemyTier,
  rng: RandomSource = Math.random
): CombatRewardBundle => {
  const rule = getCombatRewardRule(enemyTier);

  return {
    rule,
    gold: rollGoldReward(rule, rng),
    cardOptions: createCombatCardRewards(rule, rng)
  };
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
