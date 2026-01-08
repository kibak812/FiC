/**
 * Balance System - WWM Physics Layer for FiC
 *
 * This system defines the "laws of physics" for card and enemy generation.
 * Any AI-generated content MUST pass validation through this system.
 *
 * Design Philosophy (from Slay the Spire + AI Spire):
 * 1. Energy Economy: All effects have calculable "power value"
 * 2. Slot Constraints: Each slot type has allowed/forbidden effects
 * 3. Rarity Budget: Higher rarity = more power, but with trade-offs
 * 4. Forbidden Combinations: Prevent game-breaking synergies
 */

import { CardType, CardRarity, EnemyTier, IntentType } from '../types';

// ============================================================
// SECTION 1: ENERGY ECONOMY CONSTANTS
// ============================================================

/**
 * Base values derived from Slay the Spire's implicit balance rules.
 * 1 Energy should roughly equal these values in raw effect.
 */
export const ENERGY_ECONOMY = {
  // Core exchange rates (1 Energy = X)
  DAMAGE_PER_ENERGY: 6,           // Strike baseline
  BLOCK_PER_ENERGY: 5,            // Defend baseline
  DRAW_PER_ENERGY: 1.5,           // Card draw value
  GOLD_PER_ENERGY: 10,            // Gold gain value

  // Status effect power values (per stack)
  STATUS_POWER_VALUE: {
    weak: 3,           // 25% damage reduction ≈ 3 damage saved
    vulnerable: 4,     // 50% damage increase ≈ 4 extra damage
    poison: 2,         // Cumulative damage ≈ 2 per stack
    bleed: 1.5,        // Attack-triggered ≈ 1.5 per stack
    burn: 2.5,         // Persistent damage ≈ 2.5 per stack
    stun: 10,          // Skip turn ≈ 10 damage equivalent
    strength: 3        // Permanent buff ≈ 3 per stack
  },

  // Special effect values
  SPECIAL_POWER_VALUE: {
    ignoreBlock: 4,           // Piercing ≈ 4 power
    lifestealPercent: 0.08,   // Per 1% lifesteal ≈ 0.08 power
    dodgeAttack: 8,           // Dodge one attack ≈ 8 power
    executeThreshold: 40,     // Per 1% threshold ≈ 0.4 power (so 20% = 8)
    drawCard: 4,              // Immediate draw ≈ 4 power
    nextTurnDraw: 2,          // Delayed draw ≈ 2 power
    energyGain: 6,            // 1 energy ≈ 6 power
    permanentGrow: 1.5        // Per point of permanent growth
  },

  // Downside values (negative power)
  DOWNSIDE_VALUE: {
    selfDamagePerHp: -0.8,    // Self damage per HP
    exhaust: -3,              // Card removal penalty
    overheat: -4,             // Next turn energy loss
    deckPollution: -2         // Per junk card added
  }
} as const;

// ============================================================
// SECTION 2: RARITY POWER BUDGETS
// ============================================================

/**
 * Power budget per energy cost, by rarity.
 * Cards exceeding budget MUST have downsides.
 */
export const POWER_BUDGET = {
  [CardRarity.STARTER]: {
    perEnergy: 6,
    zeroCostMax: 3,
    maxEffects: 1,
    downsideRequired: false
  },
  [CardRarity.COMMON]: {
    perEnergy: 7,
    zeroCostMax: 4,
    maxEffects: 2,  // Common cards often have damage + status (e.g., 203 Serrated Blade)
    downsideRequired: false
  },
  [CardRarity.RARE]: {
    perEnergy: 9,
    zeroCostMax: 5,
    maxEffects: 2,
    downsideRequired: false  // Unless exceeding budget by >20%
  },
  [CardRarity.LEGEND]: {
    perEnergy: 12,
    zeroCostMax: 6,
    maxEffects: 3,
    downsideRequired: false  // Changed: high cost (2+) or limited use counts as trade-off
  },
  [CardRarity.SPECIAL]: {
    perEnergy: 8,
    zeroCostMax: 6,
    maxEffects: 1,
    downsideRequired: false
  },
  [CardRarity.JUNK]: {
    perEnergy: 0,
    zeroCostMax: 0,
    maxEffects: 0,
    downsideRequired: false
  }
} as const;

// ============================================================
// SECTION 3: SLOT CONSTRAINTS (Card Type Rules)
// ============================================================

export type EffectCategory =
  | 'DAMAGE_MULT'      // Multiplier (Handle specialty)
  | 'DAMAGE_ADD'       // Flat damage bonus
  | 'DIRECT_DAMAGE'    // Base damage value (Head specialty)
  | 'MULTI_HIT'        // Multiple attacks
  | 'BLOCK'            // Defense value
  | 'BLOCK_CONVERT'    // Block to damage conversion
  | 'STATUS_APPLY'     // Apply debuff to enemy
  | 'SELF_DAMAGE'      // Damage to self
  | 'HEAL'             // HP recovery
  | 'LIFESTEAL'        // Damage-based healing
  | 'ENERGY_GAIN'      // Restore energy
  | 'DRAW_CARD'        // Draw cards
  | 'NEXT_TURN_DRAW'   // Draw next turn
  | 'GOLD_GAIN'        // Earn gold
  | 'DODGE'            // Avoid attack
  | 'IGNORE_BLOCK'     // Pierce defense
  | 'EXECUTE'          // Kill at HP threshold
  | 'STUN'             // Skip enemy turn
  | 'GROW_PERMANENT'   // Permanent stat increase
  | 'EXHAUST'          // Remove card from combat
  | 'OVERHEAT';        // Energy penalty next turn

export interface SlotConstraints {
  allowedEffects: EffectCategory[];
  forbiddenEffects: EffectCategory[];
  valueBounds: {
    min: number;
    max: number;
  };
  // Slot-specific limits
  maxMultiplier?: number;
  minMultiplier?: number;
  maxHitCount?: number;
  maxStatusAmount?: number;
}

export const SLOT_CONSTRAINTS: Record<CardType, SlotConstraints> = {
  [CardType.HANDLE]: {
    allowedEffects: [
      'DAMAGE_MULT',     // Primary role: modify damage multiplier
      'GOLD_GAIN',       // On-hit gold (Midas)
      'DODGE',           // Evasion
      'IGNORE_BLOCK',    // Pierce
      'SELF_DAMAGE',     // Blood handle
      'LIFESTEAL',       // Vampiric
      'STUN',            // Thunder handle
      'STATUS_APPLY',    // Weak only (Swift Dagger)
      'BLOCK',           // Defensive handles (Parry Guard 102)
      'DRAW_CARD'        // Conditional draw (Lightweight 212)
    ],
    forbiddenEffects: [
      'DIRECT_DAMAGE',   // Handles don't deal direct damage
      'GROW_PERMANENT',  // Decos only
      'EXECUTE'          // Heads only
    ],
    valueBounds: {
      min: 0,            // 0 for special handles (Gambler 309 uses random)
      max: 3.0           // Maximum 3x multiplier
    },
    maxMultiplier: 3.0,
    minMultiplier: 0,    // Allow 0 for special cases
    maxStatusAmount: 2   // Max 2 stacks of status
  },

  [CardType.HEAD]: {
    allowedEffects: [
      'DIRECT_DAMAGE',   // Primary role: base damage
      'MULTI_HIT',       // Twin Fangs, etc.
      'STATUS_APPLY',    // Bleed, Burn, Poison
      'SELF_DAMAGE',     // Frenzy Blade
      'BLOCK',           // Shield heads
      'ENERGY_GAIN',     // Mana Blade
      'STUN',            // Frost Blade, Time Cog (utility heads)
      'EXECUTE',         // Executioner
      'NEXT_TURN_DRAW',  // Agile Blade
      'EXHAUST',         // Void Crystal
      'OVERHEAT'         // Furnace Core
    ],
    forbiddenEffects: [
      'DAMAGE_MULT',     // Handles only
      'GROW_PERMANENT',  // Decos only
      'GOLD_GAIN',       // Handles only
      'DODGE',           // Handles only
      'LIFESTEAL'        // Handles only
    ],
    valueBounds: {
      min: 0,            // 0 for utility heads (Time Cog 406 = pure stun)
      max: 30            // Maximum 30 damage (Void Crystal level)
    },
    maxHitCount: 4,      // Max 4 hits
    maxStatusAmount: 5   // Max 5 stacks
  },

  [CardType.DECO]: {
    allowedEffects: [
      'DAMAGE_ADD',      // Flat damage bonus
      'DAMAGE_MULT',     // Dragon Sigil (x2)
      'DRAW_CARD',       // Light Feather
      'NEXT_TURN_DRAW',  // Old String
      'ENERGY_GAIN',     // Charged Gem
      'STATUS_APPLY',    // Poison Vial, Blood Whetstone
      'BLOCK_CONVERT',   // Spiked Armor, Thorn Sigil
      'GROW_PERMANENT',  // Growing Crystal
      'SELF_DAMAGE'      // Berserker synergy
    ],
    forbiddenEffects: [
      'DIRECT_DAMAGE',   // Decos add, not set
      'MULTI_HIT',       // Heads only
      'EXECUTE',         // Heads only
      'STUN',            // Heads/Handles only
      'DODGE',           // Handles only
      'IGNORE_BLOCK',    // Handles only
      'LIFESTEAL'        // Handles only
    ],
    valueBounds: {
      min: 0,            // Can be 0 (pure utility)
      max: 10            // Max +10 damage
    },
    maxStatusAmount: 4   // Max 4 stacks
  },

  [CardType.JUNK]: {
    allowedEffects: [],  // No positive effects
    forbiddenEffects: ['DAMAGE_MULT', 'DAMAGE_ADD', 'DIRECT_DAMAGE', 'STATUS_APPLY',
                       'HEAL', 'ENERGY_GAIN', 'DRAW_CARD', 'GOLD_GAIN'],
    valueBounds: {
      min: 0,
      max: 0
    }
  }
};

// ============================================================
// SECTION 4: EFFECT BOUNDS (Value Limits)
// ============================================================

export interface EffectBounds {
  min: number;
  max: number;
  // Per-rarity adjustments
  rarityMultiplier?: Partial<Record<CardRarity, number>>;
}

export const EFFECT_BOUNDS: Record<string, EffectBounds> = {
  // Damage modifiers
  DAMAGE_BONUS_FLAT: { min: 1, max: 10 },
  DAMAGE_MULTIPLIER: { min: 0.5, max: 3.0 },

  // Status effects
  WEAK_AMOUNT: { min: 1, max: 3 },
  VULNERABLE_AMOUNT: { min: 1, max: 3 },
  POISON_AMOUNT: { min: 2, max: 8 },
  BLEED_AMOUNT: { min: 2, max: 6 },
  BURN_AMOUNT: { min: 2, max: 6 },
  STUN_AMOUNT: { min: 1, max: 2 },  // Stun is very powerful

  // Self effects
  SELF_DAMAGE: { min: 2, max: 10 },
  HEAL_AMOUNT: { min: 2, max: 15 },
  LIFESTEAL_PERCENT: { min: 25, max: 75 },

  // Resources
  ENERGY_GAIN: { min: 1, max: 2 },
  DRAW_COUNT: { min: 1, max: 3 },
  GOLD_GAIN: { min: 3, max: 15 },

  // Special
  EXECUTE_THRESHOLD: { min: 0.10, max: 0.25 },  // 10% to 25% HP
  HIT_COUNT: { min: 2, max: 4 },
  GROW_AMOUNT: { min: 1, max: 3 },
  GROW_MAX: { min: 8, max: 20 },

  // Block
  BLOCK_VALUE: { min: 3, max: 20 },
  BLOCK_CONVERT_PERCENT: { min: 0.25, max: 1.0 }  // 25% to 100%
};

// ============================================================
// SECTION 5: FORBIDDEN COMBINATIONS
// ============================================================

export interface ForbiddenRule {
  id: string;
  name: string;
  description: string;
  check: (effects: EffectCategory[], cardCost: number, cardRarity: CardRarity) => boolean;
}

export const FORBIDDEN_COMBINATIONS: ForbiddenRule[] = [
  {
    id: 'NO_INFINITE_LOOP',
    name: 'No Infinite Energy-Draw Loop',
    description: '0 cost card cannot have both energy gain and draw',
    check: (effects, cost) => {
      if (cost !== 0) return true;
      const hasEnergy = effects.includes('ENERGY_GAIN');
      const hasDraw = effects.includes('DRAW_CARD');
      return !(hasEnergy && hasDraw);
    }
  },
  {
    id: 'NO_LIFESTEAL_WITH_GROW',
    name: 'No Lifesteal + Permanent Growth',
    description: 'Lifesteal and permanent growth cannot coexist (scaling issue)',
    check: (effects) => {
      const hasLifesteal = effects.includes('LIFESTEAL');
      const hasGrow = effects.includes('GROW_PERMANENT');
      return !(hasLifesteal && hasGrow);
    }
  },
  {
    id: 'NO_OVERPOWERED_ZERO_COST',
    name: 'Zero Cost Power Limit',
    description: '0 cost cards limited to 2 positive effects',
    check: (effects, cost) => {
      if (cost !== 0) return true;
      const positiveEffects = effects.filter(e =>
        !['SELF_DAMAGE', 'EXHAUST', 'OVERHEAT'].includes(e)
      );
      return positiveEffects.length <= 2;
    }
  },
  {
    id: 'NO_MULTI_HIT_STUN',
    name: 'No Multi-Hit with Stun',
    description: 'Multi-hit cannot combine with stun (too powerful)',
    check: (effects) => {
      const hasMultiHit = effects.includes('MULTI_HIT');
      const hasStun = effects.includes('STUN');
      return !(hasMultiHit && hasStun);
    }
  },
  {
    id: 'NO_EXECUTE_WITH_MULTI_HIT',
    name: 'No Execute with Multi-Hit',
    description: 'Execute threshold cannot combine with multi-hit',
    check: (effects) => {
      const hasMultiHit = effects.includes('MULTI_HIT');
      const hasExecute = effects.includes('EXECUTE');
      return !(hasMultiHit && hasExecute);
    }
  },
  {
    id: 'NO_STUN_WITH_ENERGY_ZERO_COST',
    name: 'No Stun + Energy at Zero Cost',
    description: 'Stun with energy gain is too strong at 0 cost',
    check: (effects, cost) => {
      if (cost !== 0) return true;
      const hasStun = effects.includes('STUN');
      const hasEnergy = effects.includes('ENERGY_GAIN');
      return !(hasStun && hasEnergy);
    }
  }
];

// Note: Removed LEGEND_REQUIRES_DOWNSIDE rule
// Reason: High cost (2+), limited use per turn, or situational effects
// are valid trade-offs for Legend cards in this game's design.

// ============================================================
// SECTION 6: ENEMY TIER CONSTRAINTS
// ============================================================

export interface EnemyTierConstraints {
  hpRange: { min: number; max: number };
  damageRange: { min: number; max: number };
  blockRange: { min: number; max: number };
  intentCount: { min: number; max: number };
  allowedTraits: string[];
  maxTraits: number;
  allowedIntentTypes: IntentType[];
  difficultyRating: { min: number; max: number };  // Expected damage per turn
}

export const ENEMY_TIER_CONSTRAINTS: Record<EnemyTier, EnemyTierConstraints> = {
  [EnemyTier.COMMON]: {
    hpRange: { min: 25, max: 85 },
    damageRange: { min: 4, max: 12 },
    blockRange: { min: 0, max: 15 },
    intentCount: { min: 2, max: 4 },
    allowedTraits: ['THIEVERY', 'THORNS_5'],  // Allow thorns for Act 3 commons
    maxTraits: 1,
    allowedIntentTypes: [IntentType.ATTACK, IntentType.DEFEND, IntentType.BUFF, IntentType.DEBUFF],
    difficultyRating: { min: 3, max: 12 }  // Relaxed: some commons are easier (Loot Goblin)
  },

  [EnemyTier.ELITE]: {
    hpRange: { min: 70, max: 160 },
    damageRange: { min: 5, max: 30 },  // Relaxed min for reflect mechanics (Mimic)
    blockRange: { min: 0, max: 30 },   // Some elites don't block
    intentCount: { min: 2, max: 4 },
    allowedTraits: ['DAMAGE_CAP_15', 'THORNS_5', 'THIEVERY', 'RESURRECT'],
    maxTraits: 2,
    allowedIntentTypes: [IntentType.ATTACK, IntentType.DEFEND, IntentType.BUFF, IntentType.DEBUFF, IntentType.SPECIAL],
    difficultyRating: { min: 5, max: 20 }  // Relaxed for varied elite designs
  },

  [EnemyTier.BOSS]: {
    hpRange: { min: 140, max: 450 },
    damageRange: { min: 10, max: 55 },
    blockRange: { min: 0, max: 40 },   // Some bosses are pure offense
    intentCount: { min: 2, max: 5 },   // Allow simpler boss patterns
    allowedTraits: ['DAMAGE_CAP_15', 'THORNS_5', 'RESURRECT', 'THIEVERY'],
    maxTraits: 2,
    allowedIntentTypes: [IntentType.ATTACK, IntentType.DEFEND, IntentType.BUFF, IntentType.DEBUFF, IntentType.SPECIAL, IntentType.WAIT],
    difficultyRating: { min: 8, max: 35 }  // Wide range for boss variety
  }
};

// Enemy intent patterns - ensures varied gameplay
export const INTENT_PATTERN_RULES = {
  // Consecutive attack limit (relaxed for special enemies like Ember Wisp)
  maxConsecutiveAttacks: 4,

  // Variety is recommended but not strictly required
  // Some enemies (Chimera Engine) are designed as pure attackers
  requiresVariety: false,

  // Boss special rules (relaxed - these are recommendations)
  bossRules: {
    mustHaveSpecial: false,      // Recommended, not required (DEBUFF counts)
    maxDamagePerCycle: 100,      // Total damage in one intent cycle
    requiresDefensePhase: false  // Recommended but not required (some bosses are aggressive)
  }
};

// ============================================================
// SECTION 7: ACT SCALING
// ============================================================

/**
 * Difficulty scales with Act progression.
 * These multipliers affect enemy stats and rewards.
 */
export const ACT_SCALING = {
  1: {
    enemyHpMultiplier: 1.0,
    enemyDamageMultiplier: 1.0,
    rewardRarityBonus: 0,
    description: 'The Abandoned Mine - Learning curve'
  },
  2: {
    enemyHpMultiplier: 1.3,
    enemyDamageMultiplier: 1.2,
    rewardRarityBonus: 0.1,  // 10% more rare cards
    description: 'The Molten Forge - Intermediate'
  },
  3: {
    enemyHpMultiplier: 1.6,
    enemyDamageMultiplier: 1.4,
    rewardRarityBonus: 0.2,  // 20% more rare cards
    description: 'Clockwork Sanctuary - Endgame'
  }
} as const;

// ============================================================
// SECTION 8: VALIDATION TYPES
// ============================================================

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  powerAnalysis?: PowerAnalysis;
}

export interface ValidationError {
  code: string;
  field: string;
  message: string;
  severity: 'critical' | 'error';
}

export interface ValidationWarning {
  code: string;
  field: string;
  message: string;
  suggestion?: string;
}

export interface PowerAnalysis {
  totalPower: number;
  budget: number;
  efficiency: number;  // power per energy
  hasDownside: boolean;
  downsideValue: number;
  netPower: number;    // totalPower + downsideValue
  balanceRating: 'underpowered' | 'balanced' | 'strong' | 'overpowered';
}

// ============================================================
// SECTION 9: HELPER FUNCTIONS
// ============================================================

/**
 * Calculate the power value of a single effect
 */
export function calculateEffectPower(
  effect: EffectCategory,
  amount: number,
  context?: { hitCount?: number; lifestealPercent?: number }
): number {
  const eco = ENERGY_ECONOMY;

  switch (effect) {
    case 'DIRECT_DAMAGE':
      return amount;
    case 'DAMAGE_ADD':
      return amount;
    case 'DAMAGE_MULT':
      // Multiplier value depends on base damage, estimate at 6
      return (amount - 1) * 6;
    case 'BLOCK':
      return amount * (eco.DAMAGE_PER_ENERGY / eco.BLOCK_PER_ENERGY);
    case 'STATUS_APPLY':
      return amount * 2;  // Generic status value
    case 'SELF_DAMAGE':
      return amount * eco.DOWNSIDE_VALUE.selfDamagePerHp;
    case 'HEAL':
      return amount * 0.8;  // Healing slightly less valuable than damage
    case 'LIFESTEAL':
      return (context?.lifestealPercent || 50) * eco.SPECIAL_POWER_VALUE.lifestealPercent;
    case 'ENERGY_GAIN':
      return amount * eco.SPECIAL_POWER_VALUE.energyGain;
    case 'DRAW_CARD':
      return amount * eco.SPECIAL_POWER_VALUE.drawCard;
    case 'NEXT_TURN_DRAW':
      return amount * eco.SPECIAL_POWER_VALUE.nextTurnDraw;
    case 'GOLD_GAIN':
      return amount * 0.5;  // Gold is low combat value
    case 'DODGE':
      return eco.SPECIAL_POWER_VALUE.dodgeAttack;
    case 'IGNORE_BLOCK':
      return eco.SPECIAL_POWER_VALUE.ignoreBlock;
    case 'EXECUTE':
      return amount * 100 * 0.4;  // threshold * 100 * 0.4
    case 'STUN':
      return amount * eco.STATUS_POWER_VALUE.stun;
    case 'GROW_PERMANENT':
      return amount * eco.SPECIAL_POWER_VALUE.permanentGrow * 5;  // Estimated turns
    case 'EXHAUST':
      return eco.DOWNSIDE_VALUE.exhaust;
    case 'OVERHEAT':
      return eco.DOWNSIDE_VALUE.overheat;
    case 'MULTI_HIT':
      return (context?.hitCount || 2) * 0.5;  // Synergy bonus
    default:
      return 0;
  }
}

/**
 * Check if a value is within bounds
 */
export function isWithinBounds(
  value: number,
  boundsKey: keyof typeof EFFECT_BOUNDS
): boolean {
  const bounds = EFFECT_BOUNDS[boundsKey];
  if (!bounds) return true;
  return value >= bounds.min && value <= bounds.max;
}

/**
 * Get the allowed value range for an effect
 */
export function getEffectRange(boundsKey: keyof typeof EFFECT_BOUNDS): { min: number; max: number } | null {
  return EFFECT_BOUNDS[boundsKey] || null;
}

// ============================================================
// EXPORT ALL
// ============================================================

export default {
  ENERGY_ECONOMY,
  POWER_BUDGET,
  SLOT_CONSTRAINTS,
  EFFECT_BOUNDS,
  FORBIDDEN_COMBINATIONS,
  ENEMY_TIER_CONSTRAINTS,
  INTENT_PATTERN_RULES,
  ACT_SCALING,
  calculateEffectPower,
  isWithinBounds,
  getEffectRange
};
