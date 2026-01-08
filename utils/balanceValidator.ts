/**
 * Balance Validator - Validation functions for WWM Physics Layer
 *
 * These functions validate cards and enemies against the balance system rules.
 * Any AI-generated content MUST pass these validations before being accepted.
 */

import { CardData, CardType, CardRarity, EnemyData, EnemyTier, IntentType, EnemyTrait } from '../types';
import {
  ENERGY_ECONOMY,
  POWER_BUDGET,
  SLOT_CONSTRAINTS,
  EFFECT_BOUNDS,
  FORBIDDEN_COMBINATIONS,
  ENEMY_TIER_CONSTRAINTS,
  INTENT_PATTERN_RULES,
  ACT_SCALING,
  EffectCategory,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  PowerAnalysis,
  calculateEffectPower
} from './balanceSystem';

// Helper to safely extract numeric values from union type
const num = (v: number | boolean | number[] | undefined, defaultVal: number = 0): number => {
  if (typeof v === 'number') return v;
  return defaultVal;
};

// ============================================================
// CARD EFFECT MAPPING
// ============================================================

/**
 * Map card IDs to their effect categories
 * This allows validation of existing cards
 */
const CARD_EFFECT_MAPPING: Record<number, {
  effects: EffectCategory[];
  values: Record<string, number | boolean | number[]>;
}> = {
  // Starter
  101: { effects: ['DAMAGE_MULT'], values: { multiplier: 1 } },
  102: { effects: ['BLOCK'], values: { block: 0 } },  // Parry - converts to block
  103: { effects: ['DIRECT_DAMAGE'], values: { damage: 6 } },
  104: { effects: ['BLOCK'], values: { block: 5 } },
  105: { effects: ['DAMAGE_ADD'], values: { bonus: 3 } },
  106: { effects: ['NEXT_TURN_DRAW'], values: { draw: 1 } },

  // Common Handles
  201: { effects: ['DAMAGE_MULT', 'STATUS_APPLY'], values: { multiplier: 1, weak: 1 } },
  206: { effects: ['DAMAGE_MULT', 'STATUS_APPLY'], values: { multiplier: 1, vulnerable: 2 } },
  212: { effects: ['DAMAGE_MULT', 'DRAW_CARD'], values: { multiplier: 1, draw: 1 } },  // Conditional
  218: { effects: ['DAMAGE_MULT'], values: { multiplier: 0.8 } },

  // Common Heads
  202: { effects: ['DIRECT_DAMAGE'], values: { damage: 9 } },
  203: { effects: ['DIRECT_DAMAGE', 'STATUS_APPLY'], values: { damage: 3, bleed: 3 } },
  209: { effects: ['DIRECT_DAMAGE', 'STATUS_APPLY'], values: { damage: 5, bleedScaling: true } },
  213: { effects: ['DIRECT_DAMAGE', 'STATUS_APPLY'], values: { damage: 3, poisonScaling: true } },
  214: { effects: ['DIRECT_DAMAGE', 'STATUS_APPLY'], values: { damage: 8, weak: 1 } },
  215: { effects: ['DIRECT_DAMAGE', 'NEXT_TURN_DRAW'], values: { damage: 6, draw: 1 } },

  // Common Decos
  204: { effects: ['DRAW_CARD'], values: { draw: 1 } },
  205: { effects: ['STATUS_APPLY'], values: { poison: 4 } },
  207: { effects: ['BLOCK_CONVERT'], values: { percent: 1.0 } },
  208: { effects: ['ENERGY_GAIN'], values: { energy: 1 } },
  210: { effects: ['BLOCK_CONVERT'], values: { percent: 0.5 } },
  211: { effects: ['DAMAGE_ADD'], values: { energyScaling: true } },
  219: { effects: ['STATUS_APPLY'], values: { weak: 1 } },

  // Rare Handles
  301: { effects: ['DAMAGE_MULT', 'MULTI_HIT'], values: { multiplier: 2, effectDouble: true } },
  302: { effects: ['DAMAGE_MULT', 'LIFESTEAL'], values: { multiplier: 1, lifesteal: 50 } },
  307: { effects: ['DAMAGE_MULT', 'GOLD_GAIN'], values: { multiplier: 1, gold: 5 } },
  309: { effects: ['DAMAGE_MULT'], values: { multiplierRandom: [1, 3] } },
  317: { effects: ['DAMAGE_MULT', 'IGNORE_BLOCK'], values: { multiplier: 1 } },
  318: { effects: ['DAMAGE_MULT', 'SELF_DAMAGE'], values: { multiplier: 1, selfDamage: 4 } },

  // Rare Heads
  303: { effects: ['DIRECT_DAMAGE', 'STATUS_APPLY'], values: { damage: 8, burn: 3 } },
  304: { effects: ['DIRECT_DAMAGE', 'SELF_DAMAGE'], values: { damage: 18, blockCost: 5 } },
  306: { effects: ['DIRECT_DAMAGE', 'MULTI_HIT'], values: { damage: 4, hits: 2 } },
  308: { effects: ['DIRECT_DAMAGE', 'OVERHEAT'], values: { damage: 15, overheat: 1 } },
  310: { effects: ['DIRECT_DAMAGE'], values: { damage: 4, comboScaling: true } },
  312: { effects: ['DIRECT_DAMAGE', 'STATUS_APPLY'], values: { damage: 10, burn: 4 } },
  313: { effects: ['DIRECT_DAMAGE', 'ENERGY_GAIN'], values: { damage: 4, energy: 1 } },
  314: { effects: ['DIRECT_DAMAGE', 'SELF_DAMAGE'], values: { damage: 12, selfDamage: 4 } },

  // Rare Decos
  305: { effects: ['DAMAGE_ADD'], values: { createReplica: true } },
  311: { effects: ['BLOCK'], values: { blockMultiplier: 2 } },
  319: { effects: ['DAMAGE_ADD', 'STATUS_APPLY'], values: { bonus: 2, bleed: 2 } },
  320: { effects: ['DAMAGE_ADD'], values: { selfDamageBonus: true } },

  // Legend Handles
  401: { effects: ['DAMAGE_MULT', 'STUN'], values: { multiplier: 3, stun: 1 } },
  405: { effects: ['DAMAGE_MULT'], values: { multiplier: 1, returnToHand: true } },
  412: { effects: ['DAMAGE_MULT', 'DODGE'], values: { multiplier: 1 } },

  // Legend Heads
  402: { effects: ['DIRECT_DAMAGE', 'EXHAUST'], values: { damage: 30 } },
  404: { effects: ['DIRECT_DAMAGE', 'SELF_DAMAGE'], values: { damage: 30, selfDamage: 6 } },
  406: { effects: ['STUN'], values: { stun: 1, skipIntent: true } },
  408: { effects: ['DIRECT_DAMAGE', 'STUN'], values: { damage: 8, stun: 1 } },
  409: { effects: ['DIRECT_DAMAGE', 'EXECUTE'], values: { damage: 5, threshold: 0.2 } },

  // Legend Decos
  403: { effects: ['DAMAGE_ADD'], values: { zeroCost: true } },
  407: { effects: ['DAMAGE_ADD', 'GROW_PERMANENT'], values: { grow: 2, max: 16 } },
  413: { effects: ['DAMAGE_MULT'], values: { multiplier: 2 } }
};

// ============================================================
// CARD VALIDATION
// ============================================================

/**
 * Main card validation function
 */
export function validateCardBalance(card: CardData): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // 1. Basic field validation
  validateCardFields(card, errors);

  // 2. Slot constraint validation
  validateSlotConstraints(card, errors, warnings);

  // 3. Effect bounds validation
  validateEffectBounds(card, errors, warnings);

  // 4. Power budget validation
  const powerAnalysis = analyzeCardPower(card);
  validatePowerBudget(card, powerAnalysis, errors, warnings);

  // 5. Forbidden combination check
  validateForbiddenCombinations(card, errors);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    powerAnalysis
  };
}

function validateCardFields(card: CardData, errors: ValidationError[]): void {
  // Cost validation
  if (card.cost < 0 || card.cost > 3) {
    errors.push({
      code: 'INVALID_COST',
      field: 'cost',
      message: `Cost must be 0-3, got ${card.cost}`,
      severity: 'critical'
    });
  }

  // Value validation based on slot
  const constraints = SLOT_CONSTRAINTS[card.type];
  if (constraints && card.type !== CardType.JUNK) {
    if (card.value < constraints.valueBounds.min || card.value > constraints.valueBounds.max) {
      errors.push({
        code: 'VALUE_OUT_OF_BOUNDS',
        field: 'value',
        message: `${card.type} value must be ${constraints.valueBounds.min}-${constraints.valueBounds.max}, got ${card.value}`,
        severity: 'error'
      });
    }
  }

  // Rarity validation
  const validRarities = Object.values(CardRarity);
  if (!validRarities.includes(card.rarity)) {
    errors.push({
      code: 'INVALID_RARITY',
      field: 'rarity',
      message: `Invalid rarity: ${card.rarity}`,
      severity: 'critical'
    });
  }

  // Type validation
  const validTypes = Object.values(CardType);
  if (!validTypes.includes(card.type)) {
    errors.push({
      code: 'INVALID_TYPE',
      field: 'type',
      message: `Invalid type: ${card.type}`,
      severity: 'critical'
    });
  }
}

function validateSlotConstraints(card: CardData, errors: ValidationError[], warnings: ValidationWarning[]): void {
  if (card.type === CardType.JUNK) return;

  const constraints = SLOT_CONSTRAINTS[card.type];
  const effectMapping = CARD_EFFECT_MAPPING[card.id];

  if (!effectMapping) {
    warnings.push({
      code: 'UNMAPPED_CARD',
      field: 'effectId',
      message: `Card ${card.id} has no effect mapping, cannot validate effects`,
      suggestion: 'Add effect mapping to CARD_EFFECT_MAPPING'
    });
    return;
  }

  // Check for forbidden effects
  for (const effect of effectMapping.effects) {
    if (constraints.forbiddenEffects.includes(effect)) {
      errors.push({
        code: 'FORBIDDEN_EFFECT',
        field: 'effects',
        message: `${card.type} cannot have effect: ${effect}`,
        severity: 'error'
      });
    }

    // Check if effect is allowed (warning if unexpected)
    if (!constraints.allowedEffects.includes(effect) && !constraints.forbiddenEffects.includes(effect)) {
      warnings.push({
        code: 'UNUSUAL_EFFECT',
        field: 'effects',
        message: `${card.type} typically doesn't have effect: ${effect}`,
        suggestion: 'Verify this is intentional'
      });
    }
  }

  // Slot-specific limits
  if (card.type === CardType.HANDLE) {
    const multRaw = effectMapping.values.multiplier;
    if (multRaw !== undefined && typeof multRaw === 'number') {
      const mult = multRaw;
      if (mult < (constraints.minMultiplier || 0.5) || mult > (constraints.maxMultiplier || 3.0)) {
        errors.push({
          code: 'MULTIPLIER_OUT_OF_BOUNDS',
          field: 'value',
          message: `Handle multiplier must be ${constraints.minMultiplier}-${constraints.maxMultiplier}, got ${mult}`,
          severity: 'error'
        });
      }
    }
  }
}

function validateEffectBounds(card: CardData, errors: ValidationError[], warnings: ValidationWarning[]): void {
  const effectMapping = CARD_EFFECT_MAPPING[card.id];
  if (!effectMapping) return;

  const values = effectMapping.values;

  // Check each value against bounds
  if (values.damage !== undefined && typeof values.damage === 'number') {
    const damage = values.damage;
    // Direct damage has different bounds than bonus
    if (card.type === CardType.HEAD && (damage < 3 || damage > 30)) {
      warnings.push({
        code: 'DAMAGE_UNUSUAL',
        field: 'value',
        message: `Head damage ${damage} is outside typical range (3-30)`,
        suggestion: 'Consider adjusting for balance'
      });
    }
  }

  if (values.weak !== undefined && typeof values.weak === 'number' && !isWithinBounds(values.weak, 'WEAK_AMOUNT')) {
    errors.push({
      code: 'WEAK_OUT_OF_BOUNDS',
      field: 'effects',
      message: `Weak amount must be ${EFFECT_BOUNDS.WEAK_AMOUNT.min}-${EFFECT_BOUNDS.WEAK_AMOUNT.max}`,
      severity: 'error'
    });
  }

  if (values.vulnerable !== undefined && typeof values.vulnerable === 'number' && !isWithinBounds(values.vulnerable, 'VULNERABLE_AMOUNT')) {
    errors.push({
      code: 'VULNERABLE_OUT_OF_BOUNDS',
      field: 'effects',
      message: `Vulnerable amount must be ${EFFECT_BOUNDS.VULNERABLE_AMOUNT.min}-${EFFECT_BOUNDS.VULNERABLE_AMOUNT.max}`,
      severity: 'error'
    });
  }

  if (values.poison !== undefined && typeof values.poison === 'number' && !isWithinBounds(values.poison, 'POISON_AMOUNT')) {
    warnings.push({
      code: 'POISON_UNUSUAL',
      field: 'effects',
      message: `Poison amount ${values.poison} outside typical range`,
      suggestion: `Consider ${EFFECT_BOUNDS.POISON_AMOUNT.min}-${EFFECT_BOUNDS.POISON_AMOUNT.max}`
    });
  }

  if (values.bleed !== undefined && typeof values.bleed === 'number' && !isWithinBounds(values.bleed, 'BLEED_AMOUNT')) {
    warnings.push({
      code: 'BLEED_UNUSUAL',
      field: 'effects',
      message: `Bleed amount ${values.bleed} outside typical range`,
      suggestion: `Consider ${EFFECT_BOUNDS.BLEED_AMOUNT.min}-${EFFECT_BOUNDS.BLEED_AMOUNT.max}`
    });
  }

  if (values.burn !== undefined && typeof values.burn === 'number' && !isWithinBounds(values.burn, 'BURN_AMOUNT')) {
    warnings.push({
      code: 'BURN_UNUSUAL',
      field: 'effects',
      message: `Burn amount ${values.burn} outside typical range`,
      suggestion: `Consider ${EFFECT_BOUNDS.BURN_AMOUNT.min}-${EFFECT_BOUNDS.BURN_AMOUNT.max}`
    });
  }

  if (values.selfDamage !== undefined && typeof values.selfDamage === 'number' && !isWithinBounds(values.selfDamage, 'SELF_DAMAGE')) {
    errors.push({
      code: 'SELF_DAMAGE_OUT_OF_BOUNDS',
      field: 'effects',
      message: `Self damage must be ${EFFECT_BOUNDS.SELF_DAMAGE.min}-${EFFECT_BOUNDS.SELF_DAMAGE.max}`,
      severity: 'error'
    });
  }

  if (values.threshold !== undefined && typeof values.threshold === 'number' && !isWithinBounds(values.threshold, 'EXECUTE_THRESHOLD')) {
    errors.push({
      code: 'EXECUTE_THRESHOLD_OUT_OF_BOUNDS',
      field: 'effects',
      message: `Execute threshold must be ${EFFECT_BOUNDS.EXECUTE_THRESHOLD.min * 100}%-${EFFECT_BOUNDS.EXECUTE_THRESHOLD.max * 100}%`,
      severity: 'error'
    });
  }
}

function isWithinBounds(value: number, boundsKey: string): boolean {
  const bounds = EFFECT_BOUNDS[boundsKey];
  if (!bounds) return true;
  return value >= bounds.min && value <= bounds.max;
}

function analyzeCardPower(card: CardData): PowerAnalysis {
  const effectMapping = CARD_EFFECT_MAPPING[card.id];
  const budget = POWER_BUDGET[card.rarity];

  if (!effectMapping || !budget) {
    return {
      totalPower: 0,
      budget: 0,
      efficiency: 0,
      hasDownside: false,
      downsideValue: 0,
      netPower: 0,
      balanceRating: 'balanced'
    };
  }

  let totalPower = 0;
  let downsideValue = 0;
  const values = effectMapping.values;

  // Base damage estimate for multiplier calculations
  const BASE_DAMAGE_ESTIMATE = 8;  // Average weapon damage

  // Calculate power from base value based on card type
  if (card.type === CardType.HEAD) {
    totalPower += num(values.damage) || card.value || 0;
  } else if (card.type === CardType.HANDLE) {
    // Handle multiplier power calculation
    let mult = num(values.multiplier, 1) || card.value || 1;

    // Handle random multiplier (e.g., Gambler's Handle 309)
    if (values.multiplierRandom && Array.isArray(values.multiplierRandom)) {
      const [min, max] = values.multiplierRandom;
      mult = (min + max) / 2;  // Use average
    }

    // Multiplier power: (mult - 1) * base damage estimate
    totalPower += (mult - 1) * BASE_DAMAGE_ESTIMATE;
  } else if (card.type === CardType.DECO) {
    // Deco can have flat bonus OR multiplier
    const multVal = num(values.multiplier, 1);
    if (multVal && multVal !== 1) {
      // Dragon Sigil (413) style: x2 multiplier
      totalPower += (multVal - 1) * BASE_DAMAGE_ESTIMATE;
    } else {
      totalPower += num(values.bonus) || card.value || 0;
    }
  }

  // Add effect power
  for (const effect of effectMapping.effects) {
    switch (effect) {
      case 'DAMAGE_MULT':
        // Already calculated in base value section above
        break;
      case 'STATUS_APPLY':
        if (values.weak) totalPower += num(values.weak) * ENERGY_ECONOMY.STATUS_POWER_VALUE.weak;
        if (values.vulnerable) totalPower += num(values.vulnerable) * ENERGY_ECONOMY.STATUS_POWER_VALUE.vulnerable;
        if (values.poison) totalPower += num(values.poison) * ENERGY_ECONOMY.STATUS_POWER_VALUE.poison;
        if (values.bleed) totalPower += num(values.bleed) * ENERGY_ECONOMY.STATUS_POWER_VALUE.bleed;
        if (values.burn) totalPower += num(values.burn) * ENERGY_ECONOMY.STATUS_POWER_VALUE.burn;
        // Scaling effects get bonus power
        if (values.bleedScaling) totalPower += 4;  // Estimated scaling value
        if (values.poisonScaling) totalPower += 4;
        break;
      case 'STUN':
        totalPower += num(values.stun, 1) * ENERGY_ECONOMY.STATUS_POWER_VALUE.stun;
        // Skip intent is additional value
        if (values.skipIntent) totalPower += 4;
        break;
      case 'ENERGY_GAIN':
        totalPower += num(values.energy, 1) * ENERGY_ECONOMY.SPECIAL_POWER_VALUE.energyGain;
        break;
      case 'DRAW_CARD':
        totalPower += num(values.draw, 1) * ENERGY_ECONOMY.SPECIAL_POWER_VALUE.drawCard;
        break;
      case 'NEXT_TURN_DRAW':
        totalPower += num(values.draw, 1) * ENERGY_ECONOMY.SPECIAL_POWER_VALUE.nextTurnDraw;
        break;
      case 'LIFESTEAL':
        totalPower += num(values.lifesteal, 50) * ENERGY_ECONOMY.SPECIAL_POWER_VALUE.lifestealPercent;
        break;
      case 'IGNORE_BLOCK':
        totalPower += ENERGY_ECONOMY.SPECIAL_POWER_VALUE.ignoreBlock;
        break;
      case 'DODGE':
        totalPower += ENERGY_ECONOMY.SPECIAL_POWER_VALUE.dodgeAttack;
        break;
      case 'EXECUTE':
        totalPower += num(values.threshold, 0.2) * 100 * 0.4;
        break;
      case 'GOLD_GAIN':
        totalPower += num(values.gold, 5) * 0.5;
        break;
      case 'MULTI_HIT':
        // Multi-hit value: synergy with on-hit effects
        const hitBonus = num(values.hits, 2) * 3;
        totalPower += hitBonus;
        // Effect double (Twin Handle 301) is very powerful
        if (values.effectDouble) totalPower += 8;
        break;
      case 'GROW_PERMANENT':
        // Permanent growth: grow amount * estimated turns * value per point
        const growValue = num(values.grow, 2) * ENERGY_ECONOMY.SPECIAL_POWER_VALUE.permanentGrow * 5;
        totalPower += growValue;
        break;
      case 'BLOCK':
        totalPower += num(values.block) * (ENERGY_ECONOMY.DAMAGE_PER_ENERGY / ENERGY_ECONOMY.BLOCK_PER_ENERGY);
        // Block multiplier (311) is powerful
        if (values.blockMultiplier) totalPower += 4;
        break;
      case 'BLOCK_CONVERT':
        // Block to damage conversion
        totalPower += num(values.percent, 0.5) * 6;  // Estimated block value
        break;
      case 'DAMAGE_ADD':
        // Special damage add effects
        if (values.createReplica) totalPower += 6;  // Mirror of Duplication
        if (values.selfDamageBonus) totalPower += 5;  // Berserker synergy
        if (values.zeroCost) totalPower += 6;  // Philosopher's Stone effect
        if (values.comboScaling) totalPower += 4;  // Combo blade scaling
        if (values.energyScaling) totalPower += 4;  // Capacitor scaling
        break;
      case 'SELF_DAMAGE':
        downsideValue += num(values.selfDamage) * ENERGY_ECONOMY.DOWNSIDE_VALUE.selfDamagePerHp;
        // Block cost is a different downside
        if (values.blockCost) downsideValue += num(values.blockCost) * -0.5;
        break;
      case 'EXHAUST':
        downsideValue += ENERGY_ECONOMY.DOWNSIDE_VALUE.exhaust;
        break;
      case 'OVERHEAT':
        downsideValue += ENERGY_ECONOMY.DOWNSIDE_VALUE.overheat;
        break;
    }
  }

  // Special card effects that aren't in the standard effect list
  if (values.returnToHand) totalPower += 4;  // Infinite Recursion (405)

  // Calculate budget
  const effectiveCost = Math.max(1, card.cost);  // 0-cost still has budget
  const expectedBudget = card.cost === 0 ? budget.zeroCostMax : budget.perEnergy * effectiveCost;

  const netPower = totalPower + downsideValue;  // downsideValue is negative
  const efficiency = effectiveCost > 0 ? netPower / effectiveCost : netPower;

  // Determine balance rating with adjusted thresholds
  let balanceRating: PowerAnalysis['balanceRating'];
  const budgetRatio = expectedBudget > 0 ? netPower / expectedBudget : 1;

  if (budgetRatio < 0.6) {
    balanceRating = 'underpowered';
  } else if (budgetRatio <= 1.3) {
    balanceRating = 'balanced';
  } else if (budgetRatio <= 1.6) {
    balanceRating = 'strong';
  } else {
    balanceRating = 'overpowered';
  }

  return {
    totalPower,
    budget: expectedBudget,
    efficiency,
    hasDownside: downsideValue < 0,
    downsideValue,
    netPower,
    balanceRating
  };
}

function validatePowerBudget(
  card: CardData,
  analysis: PowerAnalysis,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  const budget = POWER_BUDGET[card.rarity];
  if (!budget) return;

  // Check effect count
  const effectMapping = CARD_EFFECT_MAPPING[card.id];
  if (effectMapping) {
    const positiveEffects = effectMapping.effects.filter(e =>
      !['SELF_DAMAGE', 'EXHAUST', 'OVERHEAT'].includes(e)
    );
    if (positiveEffects.length > budget.maxEffects) {
      warnings.push({
        code: 'TOO_MANY_EFFECTS',
        field: 'effects',
        message: `${card.rarity} cards should have max ${budget.maxEffects} positive effects, has ${positiveEffects.length}`,
        suggestion: 'Consider removing an effect or increasing rarity'
      });
    }
  }

  // Note: Downside requirement removed from validation
  // High cost (2+), limited uses, or situational effects are valid trade-offs

  // Check power vs budget
  if (analysis.balanceRating === 'overpowered') {
    errors.push({
      code: 'OVER_BUDGET',
      field: 'power',
      message: `Card power (${analysis.netPower.toFixed(1)}) exceeds budget (${analysis.budget}) by >50%`,
      severity: 'error'
    });
  } else if (analysis.balanceRating === 'strong') {
    warnings.push({
      code: 'STRONG_CARD',
      field: 'power',
      message: `Card is above average power (${analysis.netPower.toFixed(1)} vs budget ${analysis.budget})`,
      suggestion: 'Consider adding a minor downside'
    });
  } else if (analysis.balanceRating === 'underpowered') {
    warnings.push({
      code: 'WEAK_CARD',
      field: 'power',
      message: `Card power (${analysis.netPower.toFixed(1)}) is below budget (${analysis.budget})`,
      suggestion: 'Consider buffing the card'
    });
  }
}

function validateForbiddenCombinations(card: CardData, errors: ValidationError[]): void {
  const effectMapping = CARD_EFFECT_MAPPING[card.id];
  if (!effectMapping) return;

  for (const rule of FORBIDDEN_COMBINATIONS) {
    if (!rule.check(effectMapping.effects, card.cost, card.rarity)) {
      errors.push({
        code: rule.id,
        field: 'effects',
        message: `${rule.name}: ${rule.description}`,
        severity: 'critical'
      });
    }
  }
}

// ============================================================
// ENEMY VALIDATION
// ============================================================

/**
 * Main enemy validation function
 */
export function validateEnemyBalance(enemy: EnemyData, act: number = 1): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // 1. Basic field validation
  validateEnemyFields(enemy, errors);

  // 2. Tier constraint validation
  validateTierConstraints(enemy, act, errors, warnings);

  // 3. Intent pattern validation
  validateIntentPatterns(enemy, errors, warnings);

  // 4. Difficulty validation
  validateDifficulty(enemy, act, errors, warnings);

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

function validateEnemyFields(enemy: EnemyData, errors: ValidationError[]): void {
  // HP validation
  if (enemy.maxHp <= 0) {
    errors.push({
      code: 'INVALID_HP',
      field: 'maxHp',
      message: 'Enemy HP must be positive',
      severity: 'critical'
    });
  }

  // Tier validation
  const validTiers = Object.values(EnemyTier);
  if (!validTiers.includes(enemy.tier)) {
    errors.push({
      code: 'INVALID_TIER',
      field: 'tier',
      message: `Invalid tier: ${enemy.tier}`,
      severity: 'critical'
    });
  }

  // Intent validation
  if (!enemy.intents || enemy.intents.length === 0) {
    errors.push({
      code: 'NO_INTENTS',
      field: 'intents',
      message: 'Enemy must have at least one intent',
      severity: 'critical'
    });
  }
}

function validateTierConstraints(
  enemy: EnemyData,
  act: number,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  const constraints = ENEMY_TIER_CONSTRAINTS[enemy.tier];
  if (!constraints) return;

  const scaling = ACT_SCALING[act as 1 | 2 | 3] || ACT_SCALING[1];
  const scaledHpMax = constraints.hpRange.max * scaling.enemyHpMultiplier;
  const scaledHpMin = constraints.hpRange.min * scaling.enemyHpMultiplier;

  // HP range check
  if (enemy.maxHp < scaledHpMin || enemy.maxHp > scaledHpMax) {
    warnings.push({
      code: 'HP_OUT_OF_RANGE',
      field: 'maxHp',
      message: `${enemy.tier} HP should be ${Math.floor(scaledHpMin)}-${Math.floor(scaledHpMax)} for Act ${act}, got ${enemy.maxHp}`,
      suggestion: 'Adjust HP for proper difficulty scaling'
    });
  }

  // Intent count check
  if (enemy.intents.length < constraints.intentCount.min || enemy.intents.length > constraints.intentCount.max) {
    warnings.push({
      code: 'INTENT_COUNT_UNUSUAL',
      field: 'intents',
      message: `${enemy.tier} should have ${constraints.intentCount.min}-${constraints.intentCount.max} intents, has ${enemy.intents.length}`,
      suggestion: 'Adjust intent variety'
    });
  }

  // Trait validation
  if (enemy.traits.length > constraints.maxTraits) {
    errors.push({
      code: 'TOO_MANY_TRAITS',
      field: 'traits',
      message: `${enemy.tier} can have max ${constraints.maxTraits} traits, has ${enemy.traits.length}`,
      severity: 'error'
    });
  }

  // Check if traits are allowed
  for (const trait of enemy.traits) {
    if (trait !== EnemyTrait.NONE && !constraints.allowedTraits.includes(trait)) {
      warnings.push({
        code: 'UNUSUAL_TRAIT',
        field: 'traits',
        message: `Trait ${trait} is unusual for ${enemy.tier}`,
        suggestion: 'Consider if this is intentional'
      });
    }
  }

  // Check intent types
  for (const intent of enemy.intents) {
    if (!constraints.allowedIntentTypes.includes(intent.type)) {
      errors.push({
        code: 'FORBIDDEN_INTENT_TYPE',
        field: 'intents',
        message: `${enemy.tier} cannot use intent type: ${intent.type}`,
        severity: 'error'
      });
    }
  }

  // Check damage values
  const scaledDmgMax = constraints.damageRange.max * scaling.enemyDamageMultiplier;
  const scaledDmgMin = constraints.damageRange.min * scaling.enemyDamageMultiplier;

  for (const intent of enemy.intents) {
    if (intent.type === IntentType.ATTACK) {
      if (intent.value < scaledDmgMin || intent.value > scaledDmgMax) {
        warnings.push({
          code: 'DAMAGE_OUT_OF_RANGE',
          field: 'intents',
          message: `${enemy.tier} damage should be ${Math.floor(scaledDmgMin)}-${Math.floor(scaledDmgMax)} for Act ${act}, got ${intent.value}`,
          suggestion: 'Adjust damage for proper balance'
        });
      }
    }

    if (intent.type === IntentType.DEFEND) {
      if (intent.value < constraints.blockRange.min || intent.value > constraints.blockRange.max) {
        warnings.push({
          code: 'BLOCK_OUT_OF_RANGE',
          field: 'intents',
          message: `${enemy.tier} block should be ${constraints.blockRange.min}-${constraints.blockRange.max}, got ${intent.value}`,
          suggestion: 'Adjust block value'
        });
      }
    }
  }
}

function validateIntentPatterns(enemy: EnemyData, errors: ValidationError[], warnings: ValidationWarning[]): void {
  const rules = INTENT_PATTERN_RULES;

  // Check consecutive attacks
  let consecutiveAttacks = 0;
  let maxConsecutive = 0;

  for (const intent of enemy.intents) {
    if (intent.type === IntentType.ATTACK) {
      consecutiveAttacks++;
      maxConsecutive = Math.max(maxConsecutive, consecutiveAttacks);
    } else {
      consecutiveAttacks = 0;
    }
  }

  // Also check wrap-around (last intent -> first intent)
  if (enemy.intents.length > 1) {
    const firstIsAttack = enemy.intents[0].type === IntentType.ATTACK;
    const lastIsAttack = enemy.intents[enemy.intents.length - 1].type === IntentType.ATTACK;
    if (firstIsAttack && lastIsAttack) {
      // Count from end
      let wrapCount = 0;
      for (let i = enemy.intents.length - 1; i >= 0; i--) {
        if (enemy.intents[i].type === IntentType.ATTACK) wrapCount++;
        else break;
      }
      for (let i = 0; i < enemy.intents.length; i++) {
        if (enemy.intents[i].type === IntentType.ATTACK) wrapCount++;
        else break;
      }
      maxConsecutive = Math.max(maxConsecutive, wrapCount);
    }
  }

  if (maxConsecutive > rules.maxConsecutiveAttacks) {
    warnings.push({
      code: 'TOO_MANY_CONSECUTIVE_ATTACKS',
      field: 'intents',
      message: `Max ${rules.maxConsecutiveAttacks} consecutive attacks recommended, has ${maxConsecutive}`,
      suggestion: 'Add defensive or utility intents for variety'
    });
  }

  // Check variety requirement
  if (rules.requiresVariety) {
    const allAttacks = enemy.intents.every(i => i.type === IntentType.ATTACK);
    if (allAttacks && enemy.intents.length > 1) {
      warnings.push({
        code: 'NO_VARIETY',
        field: 'intents',
        message: 'Enemy has only attack intents',
        suggestion: 'Add DEFEND, BUFF, or DEBUFF for variety'
      });
    }
  }

  // Boss-specific rules
  if (enemy.tier === EnemyTier.BOSS) {
    const bossRules = rules.bossRules;

    if (bossRules.mustHaveSpecial) {
      const hasSpecial = enemy.intents.some(i => i.type === IntentType.SPECIAL || i.type === IntentType.DEBUFF);
      if (!hasSpecial) {
        warnings.push({
          code: 'BOSS_NO_SPECIAL',
          field: 'intents',
          message: 'Bosses should have a SPECIAL or DEBUFF intent',
          suggestion: 'Add a unique mechanic'
        });
      }
    }

    if (bossRules.requiresDefensePhase) {
      const hasDefend = enemy.intents.some(i => i.type === IntentType.DEFEND);
      if (!hasDefend) {
        warnings.push({
          code: 'BOSS_NO_DEFEND',
          field: 'intents',
          message: 'Bosses should have at least one DEFEND phase',
          suggestion: 'Add a defensive intent'
        });
      }
    }

    // Check total damage per cycle
    const totalDamage = enemy.intents
      .filter(i => i.type === IntentType.ATTACK)
      .reduce((sum, i) => sum + i.value, 0);

    if (totalDamage > bossRules.maxDamagePerCycle) {
      warnings.push({
        code: 'BOSS_HIGH_DAMAGE_CYCLE',
        field: 'intents',
        message: `Boss total damage per cycle (${totalDamage}) exceeds recommended ${bossRules.maxDamagePerCycle}`,
        suggestion: 'Reduce damage or add more non-attack phases'
      });
    }
  }
}

function validateDifficulty(
  enemy: EnemyData,
  act: number,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  const constraints = ENEMY_TIER_CONSTRAINTS[enemy.tier];
  if (!constraints) return;

  // Calculate average damage per turn
  const attackIntents = enemy.intents.filter(i => i.type === IntentType.ATTACK);
  const avgDamagePerIntent = attackIntents.length > 0
    ? attackIntents.reduce((sum, i) => sum + i.value, 0) / attackIntents.length
    : 0;
  const attackRatio = attackIntents.length / enemy.intents.length;
  const expectedDamagePerTurn = avgDamagePerIntent * attackRatio;

  if (expectedDamagePerTurn < constraints.difficultyRating.min) {
    warnings.push({
      code: 'ENEMY_TOO_EASY',
      field: 'difficulty',
      message: `Expected damage/turn (${expectedDamagePerTurn.toFixed(1)}) below minimum ${constraints.difficultyRating.min}`,
      suggestion: 'Increase damage or attack frequency'
    });
  }

  if (expectedDamagePerTurn > constraints.difficultyRating.max) {
    warnings.push({
      code: 'ENEMY_TOO_HARD',
      field: 'difficulty',
      message: `Expected damage/turn (${expectedDamagePerTurn.toFixed(1)}) above maximum ${constraints.difficultyRating.max}`,
      suggestion: 'Reduce damage or add non-attack intents'
    });
  }
}

// ============================================================
// BATCH VALIDATION HELPERS
// ============================================================

/**
 * Validate all cards in database
 */
export function validateAllCards(cards: CardData[]): Map<number, ValidationResult> {
  const results = new Map<number, ValidationResult>();

  for (const card of cards) {
    results.set(card.id, validateCardBalance(card));
  }

  return results;
}

/**
 * Validate all enemies in database
 */
export function validateAllEnemies(enemies: Record<string, EnemyData>): Map<string, ValidationResult> {
  const results = new Map<string, ValidationResult>();

  for (const [key, enemy] of Object.entries(enemies)) {
    // Determine act from enemy pool (simplified)
    let act = 1;
    if (['ember_wisp', 'hammerhead', 'loot_goblin', 'mimic_anvil', 'corrupted_smith'].includes(enemy.id)) {
      act = 2;
    } else if (['automaton_defender', 'shadow_assassin', 'chimera_engine', 'deus_ex_machina'].includes(enemy.id)) {
      act = 3;
    }

    results.set(key, validateEnemyBalance(enemy, act));
  }

  return results;
}

/**
 * Generate validation report
 */
export function generateValidationReport(
  cardResults: Map<number, ValidationResult>,
  enemyResults: Map<string, ValidationResult>
): string {
  const lines: string[] = [];

  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push('                    FiC BALANCE VALIDATION REPORT');
  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push('');

  // Card summary
  let cardErrors = 0;
  let cardWarnings = 0;
  const cardIssues: string[] = [];

  cardResults.forEach((result, cardId) => {
    cardErrors += result.errors.length;
    cardWarnings += result.warnings.length;

    if (result.errors.length > 0 || result.warnings.length > 0) {
      cardIssues.push(`Card ${cardId}:`);
      result.errors.forEach(e => cardIssues.push(`  [ERROR] ${e.message}`));
      result.warnings.forEach(w => cardIssues.push(`  [WARN] ${w.message}`));
    }
  });

  lines.push(`CARDS: ${cardResults.size} validated`);
  lines.push(`  Errors: ${cardErrors}  |  Warnings: ${cardWarnings}`);
  lines.push('');

  if (cardIssues.length > 0) {
    lines.push('Card Issues:');
    cardIssues.forEach(line => lines.push(line));
    lines.push('');
  }

  // Enemy summary
  let enemyErrors = 0;
  let enemyWarnings = 0;
  const enemyIssues: string[] = [];

  enemyResults.forEach((result, enemyKey) => {
    enemyErrors += result.errors.length;
    enemyWarnings += result.warnings.length;

    if (result.errors.length > 0 || result.warnings.length > 0) {
      enemyIssues.push(`Enemy ${enemyKey}:`);
      result.errors.forEach(e => enemyIssues.push(`  [ERROR] ${e.message}`));
      result.warnings.forEach(w => enemyIssues.push(`  [WARN] ${w.message}`));
    }
  });

  lines.push('───────────────────────────────────────────────────────────────');
  lines.push(`ENEMIES: ${enemyResults.size} validated`);
  lines.push(`  Errors: ${enemyErrors}  |  Warnings: ${enemyWarnings}`);
  lines.push('');

  if (enemyIssues.length > 0) {
    lines.push('Enemy Issues:');
    enemyIssues.forEach(line => lines.push(line));
    lines.push('');
  }

  // Overall status
  lines.push('═══════════════════════════════════════════════════════════════');
  const totalErrors = cardErrors + enemyErrors;
  const totalWarnings = cardWarnings + enemyWarnings;

  if (totalErrors === 0 && totalWarnings === 0) {
    lines.push('STATUS: ALL VALIDATIONS PASSED');
  } else if (totalErrors === 0) {
    lines.push(`STATUS: PASSED WITH ${totalWarnings} WARNINGS`);
  } else {
    lines.push(`STATUS: FAILED - ${totalErrors} ERRORS, ${totalWarnings} WARNINGS`);
  }
  lines.push('═══════════════════════════════════════════════════════════════');

  return lines.join('\n');
}

// ============================================================
// EXPORT
// ============================================================

export default {
  validateCardBalance,
  validateEnemyBalance,
  validateAllCards,
  validateAllEnemies,
  generateValidationReport,
  CARD_EFFECT_MAPPING
};
