import { CardInstance, CardType } from '../types';
import { CARD_DATABASE } from '../constants';

/**
 * Generate a unique ID for card instances
 */
export const generateId = (): string => Math.random().toString(36).substr(2, 9);

/**
 * Create a card instance from the database by ID
 */
export const createCardInstance = (id: number): CardInstance => {
  const data = CARD_DATABASE.find(c => c.id === id);
  if (!data) throw new Error(`Card ${id} not found`);
  return { ...data, instanceId: generateId() };
};

/**
 * Shuffle an array using Fisher-Yates-like algorithm
 */
export const shuffle = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

/**
 * Clean junk cards from a deck
 */
export const cleanJunkFromDeck = (cards: CardInstance[]): CardInstance[] => {
  return cards.filter(c => c.type !== CardType.JUNK);
};
