/**
 * Card Effect System - Registry-based effect processing
 * 
 * Effects are categorized by execution phase:
 * - PRE_DAMAGE: Modify damage/stats before dealing (e.g., Gambler's multiplier)
 * - ON_HIT: Execute per hit during damage loop (e.g., lifesteal, gold gain)
 * - POST_DAMAGE: Apply after all damage dealt (e.g., status effects, draw)
 */

import { CardInstance, PlayerStats, EnemyData, EnemyStatus } from '@/types';

// --- Effect Context ---

export interface WeaponSlots {
  handle: CardInstance | null;
  head: CardInstance | null;
  deco: CardInstance | null;
}

export interface WeaponStats {
  totalCost: number;
  damage: number;
  block: number;
  hitCount: number;
}

export interface EffectModifiers {
  finalDamage: number;
  finalBlock: number;
  ignoreBlock: boolean;
  selfDamage: number;
}

export interface CardEffectContext {
  slots: WeaponSlots;
  stats: WeaponStats;
  player: PlayerStats;
  enemy: EnemyData;
  effectMultiplier: number;
  remainingEnergyAfterCost: number;
  growingCrystalBonus: number;
  showFeedback: (msg: string, type?: 'good' | 'bad') => void;
}

// --- Effect Actions ---

export type EffectAction =
  | { type: 'MODIFY_DAMAGE'; amount: number; mode: 'add' | 'multiply' | 'set' }
  | { type: 'MODIFY_BLOCK'; amount: number; mode: 'add' | 'multiply' }
  | { type: 'SET_IGNORE_BLOCK'; value: boolean }
  | { type: 'PLAYER_SELF_DAMAGE'; amount: number }
  | { type: 'PLAYER_HEAL'; amount: number }
  | { type: 'PLAYER_GAIN_ENERGY'; amount: number }
  | { type: 'PLAYER_GAIN_BLOCK'; amount: number }
  | { type: 'PLAYER_REDUCE_BLOCK'; amount: number }
  | { type: 'PLAYER_GAIN_GOLD'; amount: number }
  | { type: 'PLAYER_SET_DODGE'; value: boolean }
  | { type: 'PLAYER_OVERHEAT'; amount: number }
  | { type: 'PLAYER_NEXT_TURN_DRAW'; amount: number }
  | { type: 'ENEMY_APPLY_STATUS'; status: keyof EnemyStatus; amount: number }
  | { type: 'ENEMY_SKIP_INTENT' }
  | { type: 'ENEMY_EXECUTE_THRESHOLD'; threshold: number }
  | { type: 'DRAW_CARDS'; count: number }
  | { type: 'CREATE_REPLICA'; baseDamage: number }
  | { type: 'GROW_CRYSTAL'; amount: number; max: number };

// --- Effect Definition ---

export type EffectPhase = 'SELF_DAMAGE' | 'PRE_DAMAGE' | 'ON_HIT' | 'POST_DAMAGE';
export type SlotType = 'handle' | 'head' | 'deco';

export interface CardEffect {
  cardId: number;
  slot: SlotType;
  phase: EffectPhase;
  condition?: (ctx: CardEffectContext, modifiers: EffectModifiers) => boolean;
  execute: (ctx: CardEffectContext, modifiers: EffectModifiers) => EffectAction[];
}

// --- Effect Registry ---

const effectRegistry: CardEffect[] = [];

function registerEffect(effect: CardEffect): void {
  effectRegistry.push(effect);
}

// ============================================================
// PRE-DAMAGE EFFECTS
// ============================================================

// 309: Gambler's Handle - Random multiplier 1~3
registerEffect({
  cardId: 309,
  slot: 'handle',
  phase: 'PRE_DAMAGE',
  execute: (ctx) => {
    const randomMultiplier = Math.floor(Math.random() * 3) + 1;
    const { head, deco } = ctx.slots;
    const baseValue = head!.value + (deco ? deco.value : 0);
    const newDamage = Math.floor(baseValue * randomMultiplier);
    ctx.showFeedback(`x${randomMultiplier}!`);
    return [{ type: 'MODIFY_DAMAGE', amount: newDamage, mode: 'set' }];
  }
});

// 211: Capacitor - +4 damage per remaining energy
registerEffect({
  cardId: 211,
  slot: 'deco',
  phase: 'PRE_DAMAGE',
  condition: (ctx) => ctx.remainingEnergyAfterCost > 0,
  execute: (ctx) => {
    const bonusDmg = ctx.remainingEnergyAfterCost * 4;
    ctx.showFeedback(`+${bonusDmg}!`, 'good');
    return [{ type: 'MODIFY_DAMAGE', amount: bonusDmg, mode: 'add' }];
  }
});

// 317: Piercing Handle - Ignore enemy block
registerEffect({
  cardId: 317,
  slot: 'handle',
  phase: 'PRE_DAMAGE',
  execute: () => [{ type: 'SET_IGNORE_BLOCK', value: true }]
});

// 318: Blood Handle - Self damage 4 (SELF_DAMAGE phase - runs before PRE_DAMAGE)
registerEffect({
  cardId: 318,
  slot: 'handle',
  phase: 'SELF_DAMAGE',
  execute: (ctx) => {
    ctx.showFeedback('-4', 'bad');
    return [{ type: 'PLAYER_SELF_DAMAGE', amount: 4 }];
  }
});

// 314: Frenzy Blade - Self damage 4 (SELF_DAMAGE phase - runs before PRE_DAMAGE)
registerEffect({
  cardId: 314,
  slot: 'head',
  phase: 'SELF_DAMAGE',
  execute: (ctx) => {
    ctx.showFeedback('-4', 'bad');
    return [{ type: 'PLAYER_SELF_DAMAGE', amount: 4 }];
  }
});

// 320: Berserker Rune - Add self damage taken as bonus damage
registerEffect({
  cardId: 320,
  slot: 'deco',
  phase: 'PRE_DAMAGE',
  condition: (_, mods) => mods.selfDamage > 0,
  execute: (ctx, mods) => {
    ctx.showFeedback(`+${mods.selfDamage}`, 'good');
    return [{ type: 'MODIFY_DAMAGE', amount: mods.selfDamage, mode: 'add' }];
  }
});

// 413: Dragon Sigil - Double final damage
registerEffect({
  cardId: 413,
  slot: 'deco',
  phase: 'PRE_DAMAGE',
  execute: (ctx) => {
    ctx.showFeedback('x2!', 'good');
    return [{ type: 'MODIFY_DAMAGE', amount: 2, mode: 'multiply' }];
  }
});

// ============================================================
// ON-HIT EFFECTS (per damage instance)
// ============================================================

// 307: Midas Touch - +5 gold per hit
registerEffect({
  cardId: 307,
  slot: 'handle',
  phase: 'ON_HIT',
  execute: (ctx) => {
    ctx.showFeedback('+5', 'good');
    return [{ type: 'PLAYER_GAIN_GOLD', amount: 5 }];
  }
});

// 302: Vampiric Handle - Lifesteal 50%
registerEffect({
  cardId: 302,
  slot: 'handle',
  phase: 'ON_HIT',
  execute: (ctx, mods) => {
    const heal = Math.floor(mods.finalDamage * 0.5);
    if (heal > 0) {
      ctx.showFeedback(`+${heal} HP`, 'good');
      return [{ type: 'PLAYER_HEAL', amount: heal }];
    }
    return [];
  }
});

// ============================================================
// POST-DAMAGE EFFECTS
// ============================================================

// 201: Swift Dagger Hilt - Apply Weak 1
registerEffect({
  cardId: 201,
  slot: 'handle',
  phase: 'POST_DAMAGE',
  execute: () => [{ type: 'ENEMY_APPLY_STATUS', status: 'weak', amount: 1 }]
});

// 206: Bone Handle - Apply Vulnerable 2
registerEffect({
  cardId: 206,
  slot: 'handle',
  phase: 'POST_DAMAGE',
  execute: () => [{ type: 'ENEMY_APPLY_STATUS', status: 'vulnerable', amount: 2 }]
});

// 208: Charged Gem - Restore Energy 1
registerEffect({
  cardId: 208,
  slot: 'deco',
  phase: 'POST_DAMAGE',
  execute: () => [{ type: 'PLAYER_GAIN_ENERGY', amount: 1 }]
});

// 404: Meteor Shard - Self Damage 6
registerEffect({
  cardId: 404,
  slot: 'head',
  phase: 'POST_DAMAGE',
  execute: (ctx) => {
    ctx.showFeedback('-6 HP', 'bad');
    return [{ type: 'PLAYER_SELF_DAMAGE', amount: 6 }];
  }
});

// 203: Serrated Blade - Apply Bleed 3 (x effectMultiplier)
registerEffect({
  cardId: 203,
  slot: 'head',
  phase: 'POST_DAMAGE',
  condition: (ctx) => ctx.stats.damage > 0,
  execute: (ctx) => {
    const bleedAmt = 3 * ctx.effectMultiplier;
    return [{ type: 'ENEMY_APPLY_STATUS', status: 'bleed', amount: bleedAmt }];
  }
});

// 303: Flamethrower - Apply Burn 3 (x effectMultiplier)
registerEffect({
  cardId: 303,
  slot: 'head',
  phase: 'POST_DAMAGE',
  execute: (ctx) => {
    const burnAmt = 3 * ctx.effectMultiplier;
    return [{ type: 'ENEMY_APPLY_STATUS', status: 'burn', amount: burnAmt }];
  }
});

// 205: Poison Vial - Apply Poison 4
registerEffect({
  cardId: 205,
  slot: 'deco',
  phase: 'POST_DAMAGE',
  execute: () => [{ type: 'ENEMY_APPLY_STATUS', status: 'poison', amount: 4 }]
});

// 304: Furnace Blade - Reduce own block by 5 (damage if insufficient)
registerEffect({
  cardId: 304,
  slot: 'head',
  phase: 'POST_DAMAGE',
  execute: (ctx) => {
    const debuff = 5 * ctx.effectMultiplier;
    ctx.showFeedback(`-${debuff}`, 'bad');
    return [{ type: 'PLAYER_REDUCE_BLOCK', amount: debuff }];
  }
});

// 401: Thunder Handle - Stun 1
registerEffect({
  cardId: 401,
  slot: 'handle',
  phase: 'POST_DAMAGE',
  condition: (_, mods) => mods.finalDamage > 0,
  execute: () => [{ type: 'ENEMY_APPLY_STATUS', status: 'stunned', amount: 1 }]
});

// 204: Scroll - Draw +1 next turn
registerEffect({
  cardId: 204,
  slot: 'deco',
  phase: 'POST_DAMAGE',
  execute: () => [{ type: 'PLAYER_NEXT_TURN_DRAW', amount: 1 }]
});

// 106: Feather - Draw +1 next turn
registerEffect({
  cardId: 106,
  slot: 'deco',
  phase: 'POST_DAMAGE',
  execute: () => [{ type: 'PLAYER_NEXT_TURN_DRAW', amount: 1 }]
});

// 305: Echo Forge - Create replica
registerEffect({
  cardId: 305,
  slot: 'deco',
  phase: 'POST_DAMAGE',
  execute: (_, mods) => [{ type: 'CREATE_REPLICA', baseDamage: mods.finalDamage }]
});

// 212: Lightweight Handle - Draw 1 if cost <= 1
registerEffect({
  cardId: 212,
  slot: 'handle',
  phase: 'POST_DAMAGE',
  condition: (ctx) => ctx.stats.totalCost <= 1,
  execute: () => [{ type: 'DRAW_CARDS', count: 1 }]
});

// 214: Blunt Club - Apply Weak 1
registerEffect({
  cardId: 214,
  slot: 'head',
  phase: 'POST_DAMAGE',
  execute: () => [{ type: 'ENEMY_APPLY_STATUS', status: 'weak', amount: 1 }]
});

// 308: Furnace Core - Overheat 1
registerEffect({
  cardId: 308,
  slot: 'head',
  phase: 'POST_DAMAGE',
  execute: () => [{ type: 'PLAYER_OVERHEAT', amount: 1 }]
});

// 312: Lava Blade - Burn 4 (x effectMultiplier)
registerEffect({
  cardId: 312,
  slot: 'head',
  phase: 'POST_DAMAGE',
  execute: (ctx) => {
    const burnAmt = 4 * ctx.effectMultiplier;
    return [{ type: 'ENEMY_APPLY_STATUS', status: 'burn', amount: burnAmt }];
  }
});

// 215: Agile Blade - Draw +1 next turn
registerEffect({
  cardId: 215,
  slot: 'head',
  phase: 'POST_DAMAGE',
  execute: () => [{ type: 'PLAYER_NEXT_TURN_DRAW', amount: 1 }]
});

// 219: Weakening Sigil - Apply Weak 1
registerEffect({
  cardId: 219,
  slot: 'deco',
  phase: 'POST_DAMAGE',
  execute: () => [{ type: 'ENEMY_APPLY_STATUS', status: 'weak', amount: 1 }]
});

// 313: Mana Blade - Restore energy 1
registerEffect({
  cardId: 313,
  slot: 'head',
  phase: 'POST_DAMAGE',
  execute: () => [{ type: 'PLAYER_GAIN_ENERGY', amount: 1 }]
});

// 319: Blood Whetstone - Apply Bleed 2 (x effectMultiplier)
registerEffect({
  cardId: 319,
  slot: 'deco',
  phase: 'POST_DAMAGE',
  execute: (ctx) => {
    const bleedAmt = 2 * ctx.effectMultiplier;
    return [{ type: 'ENEMY_APPLY_STATUS', status: 'bleed', amount: bleedAmt }];
  }
});

// 408: Frost Blade - Stun 1
registerEffect({
  cardId: 408,
  slot: 'head',
  phase: 'POST_DAMAGE',
  execute: () => [{ type: 'ENEMY_APPLY_STATUS', status: 'stunned', amount: 1 }]
});

// 409: Executioner's Blade - Execute at 20% HP
registerEffect({
  cardId: 409,
  slot: 'head',
  phase: 'POST_DAMAGE',
  execute: () => [{ type: 'ENEMY_EXECUTE_THRESHOLD', threshold: 0.2 }]
});

// 412: Evasion Handle - Dodge next attack
registerEffect({
  cardId: 412,
  slot: 'handle',
  phase: 'POST_DAMAGE',
  execute: () => [{ type: 'PLAYER_SET_DODGE', value: true }]
});

// 406: Time Cog - Stun + Skip intent
registerEffect({
  cardId: 406,
  slot: 'head',
  phase: 'POST_DAMAGE',
  execute: () => [
    { type: 'ENEMY_APPLY_STATUS', status: 'stunned', amount: 1 },
    { type: 'ENEMY_SKIP_INTENT' }
  ]
});

// 407: Growing Crystal - +2 permanent damage (max 16)
registerEffect({
  cardId: 407,
  slot: 'deco',
  phase: 'POST_DAMAGE',
  condition: (ctx) => ctx.growingCrystalBonus < 16,
  execute: () => [{ type: 'GROW_CRYSTAL', amount: 2, max: 16 }]
});

// ============================================================
// Query Functions
// ============================================================

export function getEffectsForPhase(
  slots: WeaponSlots,
  phase: EffectPhase
): CardEffect[] {
  const results: CardEffect[] = [];
  
  for (const effect of effectRegistry) {
    const card = slots[effect.slot];
    if (card && card.id === effect.cardId && effect.phase === phase) {
      results.push(effect);
    }
  }
  
  return results;
}

export function executeEffectsForPhase(
  ctx: CardEffectContext,
  modifiers: EffectModifiers,
  phase: EffectPhase
): EffectAction[] {
  const effects = getEffectsForPhase(ctx.slots, phase);
  const actions: EffectAction[] = [];
  
  for (const effect of effects) {
    if (effect.condition && !effect.condition(ctx, modifiers)) {
      continue;
    }
    const effectActions = effect.execute(ctx, modifiers);
    actions.push(...effectActions);
  }
  
  return actions;
}

// ============================================================
// Modifier Processing (for PRE_DAMAGE effects)
// ============================================================

export function applyModifierActions(
  modifiers: EffectModifiers,
  actions: EffectAction[]
): EffectModifiers {
  let result = { ...modifiers };
  
  for (const action of actions) {
    switch (action.type) {
      case 'MODIFY_DAMAGE':
        if (action.mode === 'add') {
          result.finalDamage += action.amount;
        } else if (action.mode === 'multiply') {
          result.finalDamage = Math.floor(result.finalDamage * action.amount);
        } else if (action.mode === 'set') {
          result.finalDamage = action.amount;
        }
        break;
      case 'MODIFY_BLOCK':
        if (action.mode === 'add') {
          result.finalBlock += action.amount;
        } else if (action.mode === 'multiply') {
          result.finalBlock = Math.floor(result.finalBlock * action.amount);
        }
        break;
      case 'SET_IGNORE_BLOCK':
        result.ignoreBlock = action.value;
        break;
      case 'PLAYER_SELF_DAMAGE':
        result.selfDamage += action.amount;
        break;
    }
  }
  
  return result;
}

// ============================================================
// Special Card Checks
// ============================================================

export function isExhaustCard(cardId: number): boolean {
  return cardId === 402; // Void Crystal
}

export function isInfiniteLoopCard(cardId: number): boolean {
  return cardId === 405; // Infinite Loop
}

export function isTwinHandle(cardId: number): boolean {
  return cardId === 301; // Twin Handle
}

// ============================================================
// Feedback Message Helpers (Korean)
// ============================================================

export const EFFECT_MESSAGES = {
  // Status effects
  weak: (amt: number) => `${amt}!`,
  vulnerable: (amt: number) => `${amt}!`,
  bleed: (amt: number) => `${amt}!`,
  burn: (amt: number) => `${amt}!`,
  poison: (amt: number) => `${amt}!`,
  stunned: () => '!',
  
  // Player effects
  energy: (amt: number) => `+${amt}`, 
  nextDraw: () => '+1!',
  dodge: () => '!',
  overheat: () => '! (-1)',
  
  // Damage modifiers
  gambler: (mult: number) => `! x${mult}!`,
  capacitor: (bonus: number) => `+${bonus}!`,
  berserker: (bonus: number) => `! +${bonus}`,
  dragon: () => '! 2!',
  bloodHandle: () => '! 4',
  frenzyBlade: () => '! 4',
  
  // Special
  replica: () => '!',
  execute: () => '!',
  timeStop: () => '! + !',
  crystal: (current: number) => `! +2 (: ${current})`,
  infiniteLoop: () => ': !',
  exhaust: () => '!',
  lifesteal: (heal: number) => `! +${heal} HP`,
  gold: () => '+5',
};
