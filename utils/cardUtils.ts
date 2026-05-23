import { CardInstance, CardType } from '../types';
import { CARD_DATABASE } from '../constants';

export type RandomSource = () => number;

/**
 * Generate a unique ID for card instances
 */
export const generateId = (rng: RandomSource = Math.random): string => rng().toString(36).substr(2, 9);

/**
 * Create a card instance from the database by ID
 */
export const createCardInstance = (id: number, rng: RandomSource = Math.random): CardInstance => {
  const data = CARD_DATABASE.find(c => c.id === id);
  if (!data) throw new Error(`Card ${id} not found`);
  return { ...data, instanceId: generateId(rng) };
};

const baseCardCostById = new Map(CARD_DATABASE.map(card => [card.id, card.cost]));

export const resetTemporaryCardModifiers = (card: CardInstance): CardInstance => {
  const baseCost = baseCardCostById.get(card.id);
  if (baseCost === undefined || card.cost === baseCost) return card;
  return { ...card, cost: baseCost };
};

export const resetTemporaryDeckModifiers = (cards: CardInstance[]): CardInstance[] => {
  return cards.map(resetTemporaryCardModifiers);
};

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
export const shuffle = <T,>(array: T[], rng: RandomSource = Math.random): T[] => {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
};

/**
 * Clean junk cards from a deck
 */
export const cleanJunkFromDeck = (cards: CardInstance[]): CardInstance[] => {
  return cards.filter(c => c.type !== CardType.JUNK);
};
