import { PlayerStats } from '../types';

export const INITIAL_PLAYER_MAX_HP = 80;
export const INITIAL_PLAYER_MAX_ENERGY = 4;

export const createInitialPlayerStats = (): PlayerStats => ({
  hp: INITIAL_PLAYER_MAX_HP,
  maxHp: INITIAL_PLAYER_MAX_HP,
  energy: INITIAL_PLAYER_MAX_ENERGY,
  maxEnergy: INITIAL_PLAYER_MAX_ENERGY,
  block: 0,
  gold: 0,
  costLimit: null,
  disarmed: false,
  nextTurnDraw: 0,
  overheat: 0,
  weaponsUsedThisTurn: 0,
  dodgeNextAttack: false,
  selfDamageThisTurn: 0
});
