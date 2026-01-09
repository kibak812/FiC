/**
 * AI Card Effect System - Dynamic effect execution for AI-generated cards
 *
 * This module enables AI-generated cards to have functional effects by:
 * 1. Defining effect templates that AI can use
 * 2. Parsing effect metadata from AI cards
 * 3. Generating EffectActions dynamically at runtime
 */

import {
  CardEffectContext,
  EffectModifiers,
  EffectAction,
  EffectPhase
} from './cardEffects';

// ============================================================
// EFFECT TEMPLATE DEFINITIONS
// ============================================================

/**
 * Effect templates that AI can select from
 * Each template maps to game mechanics
 */
export type AIEffectType =
  // Damage modifiers
  | 'DAMAGE_BONUS'           // Add flat damage
  | 'DAMAGE_MULTIPLIER'      // Multiply damage
  | 'IGNORE_BLOCK'           // Piercing attack

  // Status effects
  | 'APPLY_WEAK'             // Reduce enemy damage
  | 'APPLY_VULNERABLE'       // Increase damage taken
  | 'APPLY_POISON'           // DoT that decays
  | 'APPLY_BLEED'            // DoT that decays faster
  | 'APPLY_BURN'             // DoT that doesn't decay
  | 'APPLY_STUN'             // Skip enemy turn

  // Player benefits
  | 'LIFESTEAL'              // Heal % of damage dealt
  | 'GAIN_ENERGY'            // Restore energy
  | 'GAIN_BLOCK'             // Add block/defense
  | 'DRAW_CARDS'             // Draw cards this turn
  | 'DRAW_NEXT_TURN'         // Draw cards next turn
  | 'DODGE_NEXT'             // Dodge next attack
  | 'GAIN_GOLD'              // Get gold per hit

  // Player costs
  | 'SELF_DAMAGE'            // Take damage
  | 'LOSE_BLOCK'             // Reduce block
  | 'OVERHEAT'               // Reduce energy next turn

  // Special effects
  | 'EXECUTE'                // Kill if below threshold
  | 'SKIP_INTENT'            // Enemy skips next turn
  | 'CREATE_REPLICA'         // Create weapon copy
  | 'GROW_CRYSTAL';          // Permanent damage increase

/**
 * Effect metadata stored in AI card's effectId field
 */
export interface AIEffectTemplate {
  type: AIEffectType;
  phase: EffectPhase;
  value?: number;          // Main value (damage, status amount, etc.)
  percentage?: number;     // For percentage-based effects (lifesteal, execute)
  condition?: string;      // Condition to check ('hasDamage', 'lowCost', etc.)
}

/**
 * Serialized format for storing in CardData.effectId
 * Example: "ai_effect:APPLY_WEAK:POST_DAMAGE:2" means "Apply Weak 2 after damage"
 */
export function serializeAIEffect(effect: AIEffectTemplate): string {
  const parts = [
    'ai_effect',
    effect.type,
    effect.phase,
    effect.value?.toString() || '0',
    effect.percentage?.toString() || '0',
    effect.condition || 'none'
  ];
  return parts.join(':');
}

/**
 * Parse effectId back into AIEffectTemplate
 */
export function parseAIEffect(effectId: string): AIEffectTemplate | null {
  if (!effectId.startsWith('ai_effect:')) {
    return null;
  }

  const parts = effectId.split(':');
  if (parts.length < 4) {
    return null;
  }

  return {
    type: parts[1] as AIEffectType,
    phase: parts[2] as EffectPhase,
    value: parseInt(parts[3]) || undefined,
    percentage: parseInt(parts[4]) || undefined,
    condition: parts[5] !== 'none' ? parts[5] : undefined
  };
}

// ============================================================
// CONDITION EVALUATION
// ============================================================

function evaluateCondition(
  condition: string | undefined,
  ctx: CardEffectContext,
  modifiers: EffectModifiers
): boolean {
  if (!condition) return true;

  switch (condition) {
    case 'hasDamage':
      return modifiers.finalDamage > 0;
    case 'lowCost':
      return ctx.stats.totalCost <= 1;
    case 'hasSelfDamage':
      return modifiers.selfDamage > 0;
    case 'hasEnergy':
      return ctx.remainingEnergyAfterCost > 0;
    case 'lowHp':
      return ctx.player.hp < ctx.player.maxHp * 0.5;
    default:
      return true;
  }
}

// ============================================================
// DYNAMIC EFFECT GENERATION
// ============================================================

/**
 * Convert AI effect template to EffectActions
 */
export function generateAIEffectActions(
  template: AIEffectTemplate,
  ctx: CardEffectContext,
  modifiers: EffectModifiers
): EffectAction[] {
  // Check condition
  if (!evaluateCondition(template.condition, ctx, modifiers)) {
    return [];
  }

  const actions: EffectAction[] = [];
  const value = template.value || 0;
  const percentage = template.percentage || 0;

  switch (template.type) {
    // Damage modifiers
    case 'DAMAGE_BONUS':
      actions.push({ type: 'MODIFY_DAMAGE', amount: value, mode: 'add' });
      break;

    case 'DAMAGE_MULTIPLIER':
      // Value is stored as integer (e.g., 150 for 1.5x)
      const mult = value / 100;
      actions.push({ type: 'MODIFY_DAMAGE', amount: mult, mode: 'multiply' });
      break;

    case 'IGNORE_BLOCK':
      actions.push({ type: 'SET_IGNORE_BLOCK', value: true });
      break;

    // Status effects (respect effectMultiplier for scalable effects)
    case 'APPLY_WEAK':
      actions.push({
        type: 'ENEMY_APPLY_STATUS',
        status: 'weak',
        amount: value
      });
      break;

    case 'APPLY_VULNERABLE':
      actions.push({
        type: 'ENEMY_APPLY_STATUS',
        status: 'vulnerable',
        amount: value
      });
      break;

    case 'APPLY_POISON':
      actions.push({
        type: 'ENEMY_APPLY_STATUS',
        status: 'poison',
        amount: value * ctx.effectMultiplier
      });
      break;

    case 'APPLY_BLEED':
      actions.push({
        type: 'ENEMY_APPLY_STATUS',
        status: 'bleed',
        amount: value * ctx.effectMultiplier
      });
      break;

    case 'APPLY_BURN':
      actions.push({
        type: 'ENEMY_APPLY_STATUS',
        status: 'burn',
        amount: value * ctx.effectMultiplier
      });
      break;

    case 'APPLY_STUN':
      actions.push({
        type: 'ENEMY_APPLY_STATUS',
        status: 'stunned',
        amount: value
      });
      break;

    // Player benefits
    case 'LIFESTEAL':
      const healAmount = Math.floor(modifiers.finalDamage * (percentage / 100));
      if (healAmount > 0) {
        ctx.showFeedback(`+${healAmount} HP`, 'good');
        actions.push({ type: 'PLAYER_HEAL', amount: healAmount });
      }
      break;

    case 'GAIN_ENERGY':
      actions.push({ type: 'PLAYER_GAIN_ENERGY', amount: value });
      break;

    case 'GAIN_BLOCK':
      actions.push({ type: 'PLAYER_GAIN_BLOCK', amount: value });
      break;

    case 'DRAW_CARDS':
      actions.push({ type: 'DRAW_CARDS', count: value });
      break;

    case 'DRAW_NEXT_TURN':
      actions.push({ type: 'PLAYER_NEXT_TURN_DRAW', amount: value });
      break;

    case 'DODGE_NEXT':
      actions.push({ type: 'PLAYER_SET_DODGE', value: true });
      break;

    case 'GAIN_GOLD':
      ctx.showFeedback(`+${value} 골드`, 'good');
      actions.push({ type: 'PLAYER_GAIN_GOLD', amount: value });
      break;

    // Player costs
    case 'SELF_DAMAGE':
      ctx.showFeedback(`-${value} HP`, 'bad');
      actions.push({ type: 'PLAYER_SELF_DAMAGE', amount: value });
      break;

    case 'LOSE_BLOCK':
      ctx.showFeedback(`-${value} 방어력`, 'bad');
      actions.push({ type: 'PLAYER_REDUCE_BLOCK', amount: value });
      break;

    case 'OVERHEAT':
      actions.push({ type: 'PLAYER_OVERHEAT', amount: value });
      break;

    // Special effects
    case 'EXECUTE':
      actions.push({
        type: 'ENEMY_EXECUTE_THRESHOLD',
        threshold: percentage / 100
      });
      break;

    case 'SKIP_INTENT':
      actions.push({ type: 'ENEMY_SKIP_INTENT' });
      break;

    case 'CREATE_REPLICA':
      actions.push({
        type: 'CREATE_REPLICA',
        baseDamage: modifiers.finalDamage
      });
      break;

    case 'GROW_CRYSTAL':
      if (ctx.growingCrystalBonus < (template.percentage || 16)) {
        actions.push({
          type: 'GROW_CRYSTAL',
          amount: value,
          max: template.percentage || 16
        });
      }
      break;
  }

  return actions;
}

// ============================================================
// AI EFFECT BUILDER (for Gemini prompt)
// ============================================================

/**
 * Available effects for AI to choose from, grouped by category
 */
export const AI_EFFECT_CATALOG = {
  // Handle effects (배율 카드)
  HANDLE_COMMON: [
    { type: 'APPLY_WEAK', phase: 'POST_DAMAGE', value: 1, description: '약화 1 부여' },
    { type: 'LIFESTEAL', phase: 'ON_HIT', percentage: 30, description: '생명력 흡수 30%' },
    { type: 'DAMAGE_BONUS', phase: 'PRE_DAMAGE', value: 2, description: '피해 +2' },
  ],
  HANDLE_RARE: [
    { type: 'APPLY_VULNERABLE', phase: 'POST_DAMAGE', value: 2, description: '취약 2 부여' },
    { type: 'LIFESTEAL', phase: 'ON_HIT', percentage: 50, description: '생명력 흡수 50%' },
    { type: 'IGNORE_BLOCK', phase: 'PRE_DAMAGE', description: '방어력 무시' },
    { type: 'APPLY_STUN', phase: 'POST_DAMAGE', value: 1, description: '기절 1턴' },
  ],
  HANDLE_LEGEND: [
    { type: 'DAMAGE_MULTIPLIER', phase: 'PRE_DAMAGE', value: 150, description: '피해 1.5배' },
    { type: 'DODGE_NEXT', phase: 'POST_DAMAGE', description: '다음 공격 회피' },
    { type: 'LIFESTEAL', phase: 'ON_HIT', percentage: 75, description: '생명력 흡수 75%' },
  ],

  // Head effects (피해 카드)
  HEAD_COMMON: [
    { type: 'APPLY_BLEED', phase: 'POST_DAMAGE', value: 3, description: '출혈 3 부여' },
    { type: 'APPLY_WEAK', phase: 'POST_DAMAGE', value: 1, description: '약화 1 부여' },
    { type: 'DRAW_NEXT_TURN', phase: 'POST_DAMAGE', value: 1, description: '다음 턴 카드 +1' },
  ],
  HEAD_RARE: [
    { type: 'APPLY_BURN', phase: 'POST_DAMAGE', value: 3, description: '화상 3 부여' },
    { type: 'APPLY_STUN', phase: 'POST_DAMAGE', value: 1, description: '기절 1턴' },
    { type: 'GAIN_ENERGY', phase: 'POST_DAMAGE', value: 1, description: '에너지 회복 1' },
    { type: 'SELF_DAMAGE', phase: 'SELF_DAMAGE', value: 4, description: '자신에게 피해 4' },
  ],
  HEAD_LEGEND: [
    { type: 'EXECUTE', phase: 'POST_DAMAGE', percentage: 20, description: '처형 (20% 이하)' },
    { type: 'SKIP_INTENT', phase: 'POST_DAMAGE', description: '의도 건너뛰기' },
    { type: 'APPLY_BURN', phase: 'POST_DAMAGE', value: 5, description: '화상 5 부여' },
  ],

  // Deco effects (보조 카드)
  DECO_COMMON: [
    { type: 'APPLY_POISON', phase: 'POST_DAMAGE', value: 4, description: '독 4 부여' },
    { type: 'GAIN_BLOCK', phase: 'PRE_DAMAGE', value: 3, description: '방어력 +3' },
    { type: 'DRAW_CARDS', phase: 'POST_DAMAGE', value: 1, description: '카드 1장 뽑기' },
  ],
  DECO_RARE: [
    { type: 'GAIN_ENERGY', phase: 'POST_DAMAGE', value: 1, description: '에너지 회복 1' },
    { type: 'APPLY_BLEED', phase: 'POST_DAMAGE', value: 2, description: '출혈 2 부여' },
    { type: 'APPLY_WEAK', phase: 'POST_DAMAGE', value: 1, description: '약화 1 부여' },
    { type: 'DAMAGE_BONUS', phase: 'PRE_DAMAGE', value: 3, condition: 'hasEnergy', description: '에너지 남으면 피해 +3' },
  ],
  DECO_LEGEND: [
    { type: 'CREATE_REPLICA', phase: 'POST_DAMAGE', description: '무기 복제' },
    { type: 'GROW_CRYSTAL', phase: 'POST_DAMAGE', value: 2, percentage: 16, description: '영구 피해 +2 (최대 16)' },
    { type: 'DAMAGE_MULTIPLIER', phase: 'PRE_DAMAGE', value: 200, description: '피해 2배' },
  ],
};

/**
 * Get effect options for AI based on card type and rarity
 */
export function getEffectOptionsForAI(
  cardType: 'Handle' | 'Head' | 'Deco',
  rarity: 'Common' | 'Rare' | 'Legend'
): string {
  const key = `${cardType.toUpperCase()}_${rarity.toUpperCase()}` as keyof typeof AI_EFFECT_CATALOG;
  const effects = AI_EFFECT_CATALOG[key] || [];

  return effects
    .map((e, i) => `${i + 1}. ${e.description} (type: "${e.type}", phase: "${e.phase}", value: ${e.value || e.percentage || 0})`)
    .join('\n');
}
