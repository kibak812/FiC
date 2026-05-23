import { CardInstance, CardRarity, EventOption, PlayerStats } from '../types';
import type { RandomSource } from './cardUtils';
import { createRandomCardReward } from './rewardUtils';

export type EventResolveEvent =
  | { type: 'INSUFFICIENT_RESOURCE' }
  | { type: 'REQUEST_CARD_REMOVAL' }
  | { type: 'REMOVE_CARD'; removedCard: CardInstance | null }
  | { type: 'HEAL'; amount: number; actualHeal: number }
  | { type: 'DAMAGE'; amount: number }
  | { type: 'GAIN_CARD'; card: CardInstance }
  | { type: 'GAIN_GOLD'; amount: number }
  | { type: 'LOSE_GOLD'; amount: number }
  | { type: 'FULL_HEAL'; actualHeal: number }
  | { type: 'UPGRADE_CARD'; from: CardInstance; to: CardInstance }
  | { type: 'UPGRADE_UNAVAILABLE' }
  | { type: 'LEAVE' };

export interface EventResolveResult {
  player: PlayerStats;
  deck: CardInstance[];
  event: EventResolveEvent;
  paidCost: boolean;
  playerHit: boolean;
  defeat: boolean;
}

interface EventCostResult {
  player: PlayerStats;
  paidCost: boolean;
  playerHit: boolean;
}

export const canPayEventOption = (player: PlayerStats, option: EventOption): boolean => {
  if (!option.cost || !option.costResource) return true;
  if (option.costResource === 'GOLD') return player.gold >= option.cost;
  return player.hp > option.cost;
};

export const applyEventOptionCost = (player: PlayerStats, option: EventOption): EventCostResult => {
  if (!option.cost || !option.costResource) {
    return { player: { ...player }, paidCost: false, playerHit: false };
  }

  if (option.costResource === 'GOLD') {
    return {
      player: { ...player, gold: Math.max(0, player.gold - option.cost) },
      paidCost: true,
      playerHit: false
    };
  }

  return {
    player: { ...player, hp: Math.max(1, player.hp - option.cost) },
    paidCost: true,
    playerHit: true
  };
};

export const getEventUpgradeCandidates = (deck: CardInstance[]): CardInstance[] => {
  return deck.filter(card =>
    card.rarity !== CardRarity.RARE &&
    card.rarity !== CardRarity.LEGEND &&
    card.rarity !== CardRarity.JUNK &&
    card.rarity !== CardRarity.SPECIAL
  );
};

export const resolveEventOption = (
  player: PlayerStats,
  deck: CardInstance[],
  option: EventOption,
  rng: RandomSource = Math.random
): EventResolveResult => {
  if (!canPayEventOption(player, option)) {
    return {
      player: { ...player },
      deck: [...deck],
      event: { type: 'INSUFFICIENT_RESOURCE' },
      paidCost: false,
      playerHit: false,
      defeat: false
    };
  }

  if (option.type === 'REMOVE_CARD') {
    return {
      player: { ...player },
      deck: [...deck],
      event: { type: 'REQUEST_CARD_REMOVAL' },
      paidCost: false,
      playerHit: false,
      defeat: false
    };
  }

  const costResult = applyEventOptionCost(player, option);
  let nextPlayer = costResult.player;
  let nextDeck = [...deck];
  const value = option.value || 0;
  let event: EventResolveEvent;
  let playerHit = costResult.playerHit;

  switch (option.type) {
    case 'HEAL': {
      const nextHp = Math.min(nextPlayer.maxHp, nextPlayer.hp + value);
      event = { type: 'HEAL', amount: value, actualHeal: nextHp - nextPlayer.hp };
      nextPlayer = { ...nextPlayer, hp: nextHp };
      break;
    }
    case 'DAMAGE':
      nextPlayer = { ...nextPlayer, hp: Math.max(0, nextPlayer.hp - value) };
      event = { type: 'DAMAGE', amount: value };
      playerHit = true;
      break;
    case 'GAIN_CARD_RARE': {
      const card = createRandomCardReward(CardRarity.RARE, undefined, rng);
      nextDeck = [...nextDeck, card];
      event = { type: 'GAIN_CARD', card };
      break;
    }
    case 'GAIN_GOLD':
      nextPlayer = { ...nextPlayer, gold: nextPlayer.gold + value };
      event = { type: 'GAIN_GOLD', amount: value };
      break;
    case 'LOSE_GOLD':
      nextPlayer = { ...nextPlayer, gold: Math.max(0, nextPlayer.gold - value) };
      event = { type: 'LOSE_GOLD', amount: value };
      break;
    case 'FULL_HEAL': {
      event = { type: 'FULL_HEAL', actualHeal: nextPlayer.maxHp - nextPlayer.hp };
      nextPlayer = { ...nextPlayer, hp: nextPlayer.maxHp };
      break;
    }
    case 'RANDOM_UPGRADE': {
      const candidates = getEventUpgradeCandidates(nextDeck);

      if (candidates.length === 0) {
        event = { type: 'UPGRADE_UNAVAILABLE' };
        break;
      }

      const target = candidates[Math.floor(rng() * candidates.length)];
      const upgradedCard = {
        ...createRandomCardReward(CardRarity.RARE, target.type, rng),
        instanceId: target.instanceId
      };
      nextDeck = nextDeck.map(card => card.instanceId === target.instanceId ? upgradedCard : card);
      event = { type: 'UPGRADE_CARD', from: target, to: upgradedCard };
      break;
    }
    case 'LEAVE':
      event = { type: 'LEAVE' };
      break;
  }

  return {
    player: nextPlayer,
    deck: nextDeck,
    event,
    paidCost: costResult.paidCost,
    playerHit,
    defeat: nextPlayer.hp <= 0
  };
};

export const resolveEventCardRemoval = (
  player: PlayerStats,
  deck: CardInstance[],
  option: EventOption,
  selectedCardId: string
): EventResolveResult => {
  if (option.type !== 'REMOVE_CARD') {
    throw new Error(`Event option ${option.type} does not remove a card`);
  }

  if (!canPayEventOption(player, option)) {
    return {
      player: { ...player },
      deck: [...deck],
      event: { type: 'INSUFFICIENT_RESOURCE' },
      paidCost: false,
      playerHit: false,
      defeat: false
    };
  }

  const costResult = applyEventOptionCost(player, option);
  const removedCard = deck.find(card => card.instanceId === selectedCardId) || null;
  const nextDeck = deck.filter(card => card.instanceId !== selectedCardId);

  return {
    player: costResult.player,
    deck: nextDeck,
    event: { type: 'REMOVE_CARD', removedCard },
    paidCost: costResult.paidCost,
    playerHit: costResult.playerHit,
    defeat: costResult.player.hp <= 0
  };
};
