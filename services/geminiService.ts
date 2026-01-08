/**
 * Gemini Service - AI Content Generation for WWM Imagination Layer
 *
 * This service connects to Google's Gemini API to generate:
 * - Cards (with balance validation)
 * - Enemies (with tier constraints)
 * - SVG Sprites (pixel art style)
 *
 * All generated content MUST pass through the balance validation system
 * before being accepted into the game.
 */

import { CardData, CardType, CardRarity, EnemyData, EnemyTier, IntentType, EnemyTrait, EnemyIntent } from '../types';
import { validateCardBalance, validateEnemyBalance } from '../utils/balanceValidator';
import {
  SLOT_CONSTRAINTS,
  EFFECT_BOUNDS,
  ENEMY_TIER_CONSTRAINTS,
  POWER_BUDGET,
  FORBIDDEN_COMBINATIONS,
  EffectCategory
} from '../utils/balanceSystem';

// ============================================================
// CONFIGURATION
// ============================================================

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const DEFAULT_MODEL = 'gemini-2.0-flash';
const IMAGE_MODEL = 'gemini-2.0-flash-exp';  // For image generation

interface GeminiConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

// ============================================================
// SCHEMA DEFINITIONS FOR STRUCTURED OUTPUT
// ============================================================

const CARD_GENERATION_SCHEMA = {
  type: "object",
  properties: {
    name: { type: "string", description: "Card name in Korean (max 10 chars)" },
    nameEn: { type: "string", description: "Card name in English (for internal use)" },
    type: { type: "string", enum: ["Handle", "Head", "Deco"], description: "Card slot type" },
    cost: { type: "integer", minimum: 0, maximum: 3, description: "Energy cost" },
    value: { type: "number", description: "Primary value (multiplier for Handle, damage for Head, bonus for Deco)" },
    rarity: { type: "string", enum: ["Common", "Rare", "Legend"], description: "Card rarity" },
    description: { type: "string", description: "Card effect description in Korean (max 50 chars)" },
    effects: {
      type: "array",
      items: {
        type: "object",
        properties: {
          category: { type: "string", description: "Effect category from allowed list" },
          amount: { type: "number", description: "Effect amount" }
        },
        required: ["category", "amount"]
      },
      description: "List of card effects"
    },
    hasDownside: { type: "boolean", description: "Whether card has a downside effect" },
    downsideType: { type: "string", enum: ["SELF_DAMAGE", "EXHAUST", "OVERHEAT", "NONE"], description: "Type of downside" },
    downsideAmount: { type: "number", description: "Downside amount if applicable" }
  },
  required: ["name", "type", "cost", "value", "rarity", "description", "effects"]
};

const ENEMY_GENERATION_SCHEMA = {
  type: "object",
  properties: {
    id: { type: "string", description: "Snake_case enemy ID" },
    name: { type: "string", description: "Enemy name in Korean" },
    nameEn: { type: "string", description: "Enemy name in English" },
    tier: { type: "string", enum: ["Common", "Elite", "Boss"], description: "Enemy difficulty tier" },
    maxHp: { type: "integer", description: "Maximum HP" },
    intents: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["ATTACK", "DEFEND", "BUFF", "DEBUFF", "SPECIAL", "WAIT"] },
          value: { type: "integer", description: "Damage or effect value" },
          description: { type: "string", description: "Intent description in Korean" }
        },
        required: ["type", "value", "description"]
      }
    },
    traits: {
      type: "array",
      items: { type: "string", enum: ["NONE", "DAMAGE_CAP_15", "THORNS_5", "RESURRECT", "THIEVERY"] }
    },
    themeDescription: { type: "string", description: "Visual theme description for sprite generation" }
  },
  required: ["id", "name", "tier", "maxHp", "intents", "traits", "themeDescription"]
};

// ============================================================
// PROMPT TEMPLATES
// ============================================================

function buildCardGenerationPrompt(context: CardGenerationContext): string {
  const slotConstraints = SLOT_CONSTRAINTS[context.targetType as CardType];
  const rarityBudget = POWER_BUDGET[context.targetRarity as CardRarity];

  return `You are a game designer for a Slay the Spire-like card game called "Forged in Chaos" (혼돈의 대장간).

GAME CONTEXT:
- Players craft weapons by combining Handle (배율), Head (피해), and Deco (보조) cards
- Final damage = Head.value × Handle.value + Deco.value
- Each card costs 0-3 energy to use

GENERATION REQUEST:
Create a ${context.targetRarity} ${context.targetType} card.
${context.theme ? `Theme/Concept: ${context.theme}` : ''}
${context.currentDeckContext ? `Current deck style: ${context.currentDeckContext}` : ''}

SLOT CONSTRAINTS FOR ${context.targetType.toUpperCase()}:
- Allowed effects: ${slotConstraints.allowedEffects.join(', ')}
- Forbidden effects: ${slotConstraints.forbiddenEffects.join(', ')}
- Value range: ${slotConstraints.valueBounds.min} to ${slotConstraints.valueBounds.max}

POWER BUDGET FOR ${context.targetRarity.toUpperCase()}:
- Power per energy: ${rarityBudget.perEnergy}
- Zero cost max power: ${rarityBudget.zeroCostMax}
- Max effects: ${rarityBudget.maxEffects}

EFFECT CATEGORIES AND BOUNDS:
- DAMAGE_MULT: 0.5 to 3.0 (Handle)
- DAMAGE_ADD: 1 to 10 (Deco)
- STATUS_APPLY: weak(1-3), vulnerable(1-3), poison(2-8), bleed(2-6), burn(2-6)
- STUN: 1-2 turns
- ENERGY_GAIN: 1-2
- DRAW_CARD: 1-3 cards
- LIFESTEAL: 25-75%
- SELF_DAMAGE: 2-10 HP (downside)

FORBIDDEN COMBINATIONS:
${FORBIDDEN_COMBINATIONS.map(f => `- ${f.name}: ${f.description}`).join('\n')}

IMPORTANT:
1. Card name MUST be in Korean, max 10 characters
2. Description MUST be in Korean, max 50 characters
3. Balance the card - don't make it too weak or too strong
4. ${context.targetRarity === 'Legend' ? 'Legend cards should have a downside or high cost (2+)' : ''}

Generate the card as a JSON object following the schema.`;
}

function buildEnemyGenerationPrompt(context: EnemyGenerationContext): string {
  const tierConstraints = ENEMY_TIER_CONSTRAINTS[context.targetTier as EnemyTier];

  return `You are a game designer for a Slay the Spire-like card game called "Forged in Chaos" (혼돈의 대장간).

GAME CONTEXT:
- Enemies cycle through a fixed intent pattern
- Each intent is either ATTACK (damage), DEFEND (block), BUFF (self), DEBUFF (player), SPECIAL, or WAIT

GENERATION REQUEST:
Create a ${context.targetTier} enemy for Act ${context.act}.
${context.theme ? `Theme/Concept: ${context.theme}` : ''}

TIER CONSTRAINTS FOR ${context.targetTier.toUpperCase()}:
- HP range: ${tierConstraints.hpRange.min} to ${tierConstraints.hpRange.max}
- Damage range: ${tierConstraints.damageRange.min} to ${tierConstraints.damageRange.max}
- Block range: ${tierConstraints.blockRange.min} to ${tierConstraints.blockRange.max}
- Intent count: ${tierConstraints.intentCount.min} to ${tierConstraints.intentCount.max}
- Allowed traits: ${tierConstraints.allowedTraits.join(', ')}
- Max traits: ${tierConstraints.maxTraits}
- Expected damage/turn: ${tierConstraints.difficultyRating.min} to ${tierConstraints.difficultyRating.max}

ACT ${context.act} SCALING:
- HP multiplier: ${context.act === 1 ? '1.0x' : context.act === 2 ? '1.3x' : '1.6x'}
- Damage multiplier: ${context.act === 1 ? '1.0x' : context.act === 2 ? '1.2x' : '1.4x'}

INTENT PATTERN RULES:
- Max 4 consecutive attacks
- Bosses should have variety (not all attacks)
- Include at least one non-attack intent

IMPORTANT:
1. Enemy name MUST be in Korean
2. Intent descriptions MUST be in Korean
3. Provide a theme description for sprite generation
4. Make the enemy feel unique and interesting

Generate the enemy as a JSON object following the schema.`;
}

function buildSpriteGenerationPrompt(context: SpriteGenerationContext): string {
  const isCard = context.type === 'card';

  return `Generate SVG pixel art for a ${isCard ? 'card' : 'monster'} in a roguelike deck-builder game.

${isCard ? `CARD INFO:
- Type: ${context.cardType}
- Name: ${context.name}
- Theme: ${context.themeDescription}
- Viewbox: 24x24 pixels` : `MONSTER INFO:
- Tier: ${context.enemyTier}
- Name: ${context.name}
- Theme: ${context.themeDescription}
- Viewbox: 32x32 pixels`}

STYLE REQUIREMENTS:
1. Use only <rect> elements for pixel art effect
2. Use style={{ imageRendering: 'pixelated' }}
3. Keep design simple and recognizable at small size
4. Use colors that fit the theme
5. ${isCard ? 'Cards should have clear silhouettes related to their function' : 'Monsters should look threatening and distinct'}

EXISTING STYLE EXAMPLES:
- Handles use warm browns (#8B4513, #654321)
- Heads use metallic grays (#808080, #C0C0C0)
- Decos use gem-like colors (#4169E1, #9932CC)
- Fire enemies use oranges/yellows (#FF6600, #FFD700)
- Undead use bone colors (#E8E8DC, #D0D0C0)
- Elite/Boss have golden accents (#FFD700)

Return ONLY the SVG code, no explanation. The SVG should be a complete, valid SVG element.`;
}

// ============================================================
// API INTERFACE
// ============================================================

export interface CardGenerationContext {
  targetType: 'Handle' | 'Head' | 'Deco';
  targetRarity: 'Common' | 'Rare' | 'Legend';
  theme?: string;
  currentDeckContext?: string;
}

export interface EnemyGenerationContext {
  targetTier: 'Common' | 'Elite' | 'Boss';
  act: 1 | 2 | 3;
  theme?: string;
}

export interface SpriteGenerationContext {
  type: 'card' | 'enemy';
  name: string;
  themeDescription: string;
  cardType?: 'Handle' | 'Head' | 'Deco';
  enemyTier?: 'Common' | 'Elite' | 'Boss';
}

export interface GeneratedCard {
  card: CardData;
  validationResult: ReturnType<typeof validateCardBalance>;
  sprite?: string;
  isAiGenerated: boolean;  // true if actually generated by AI, false if fallback from database
}

export interface GeneratedEnemy {
  enemy: EnemyData;
  validationResult: ReturnType<typeof validateEnemyBalance>;
  sprite?: string;
  isAiGenerated: boolean;  // true if actually generated by AI, false if fallback from database
}

// ============================================================
// GEMINI API CLIENT
// ============================================================

class GeminiService {
  private apiKey: string;
  private model: string;
  private temperature: number;
  private maxTokens: number;

  constructor(config: GeminiConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model || DEFAULT_MODEL;
    this.temperature = config.temperature || 0.8;
    this.maxTokens = config.maxTokens || 2048;
  }

  private async callGemini(prompt: string, useJson: boolean = true): Promise<string> {
    const url = `${GEMINI_API_BASE}/models/${this.model}:generateContent?key=${this.apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: this.temperature,
          maxOutputTokens: this.maxTokens,
          responseMimeType: useJson ? 'application/json' : 'text/plain'
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('No response from Gemini API');
    }

    return text;
  }

  /**
   * Generate a new card with balance validation
   */
  async generateCard(context: CardGenerationContext, maxRetries: number = 3): Promise<GeneratedCard> {
    const prompt = buildCardGenerationPrompt(context);
    console.log('[GeminiService] Starting card generation, max retries:', maxRetries);

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        console.log(`[GeminiService] Attempt ${attempt + 1}/${maxRetries} - calling Gemini API...`);
        const responseText = await this.callGemini(prompt);
        console.log('[GeminiService] Raw response received:', responseText.substring(0, 200) + '...');

        const generated = JSON.parse(responseText);
        console.log('[GeminiService] Parsed card data:', generated.name, generated.type, generated.rarity);

        // Convert to CardData format
        const card: CardData = {
          id: 1000 + Math.floor(Math.random() * 9000),  // Generated card ID range
          name: generated.name,
          type: generated.type as CardType,
          cost: generated.cost,
          value: generated.value,
          rarity: generated.rarity as CardRarity,
          description: generated.description,
          effectId: `generated_${generated.nameEn?.toLowerCase().replace(/\s+/g, '_') || 'card'}`
        };

        // Validate the generated card
        const validationResult = validateCardBalance(card);
        console.log('[GeminiService] Validation result:', validationResult.valid ? 'VALID' : 'INVALID');

        if (validationResult.valid || attempt === maxRetries - 1) {
          console.log('[GeminiService] Returning generated card:', card.name);
          return {
            card,
            validationResult,
            sprite: undefined,  // Sprite can be generated separately
            isAiGenerated: true
          };
        }

        // If invalid, log and retry
        console.log(`[GeminiService] Attempt ${attempt + 1} failed validation:`, validationResult.errors);

      } catch (error) {
        console.error(`[GeminiService] Attempt ${attempt + 1} error:`, error);
        if (attempt === maxRetries - 1) throw error;
      }
    }

    throw new Error('Failed to generate valid card after max retries');
  }

  /**
   * Generate a new enemy with balance validation
   */
  async generateEnemy(context: EnemyGenerationContext, maxRetries: number = 3): Promise<GeneratedEnemy> {
    const prompt = buildEnemyGenerationPrompt(context);

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const responseText = await this.callGemini(prompt);
        const generated = JSON.parse(responseText);

        // Convert to EnemyData format
        const enemy: EnemyData = {
          id: generated.id,
          name: generated.name,
          tier: generated.tier as EnemyTier,
          maxHp: generated.maxHp,
          currentHp: generated.maxHp,
          block: 0,
          intents: generated.intents.map((intent: { type: string; value: number; description: string }) => ({
            type: intent.type as IntentType,
            value: intent.value,
            description: intent.description
          })),
          currentIntentIndex: 0,
          traits: generated.traits.map((t: string) => t as EnemyTrait),
          statuses: {
            poison: 0,
            bleed: 0,
            stunned: 0,
            strength: 0,
            vulnerable: 0,
            weak: 0,
            burn: 0
          },
          damageTakenThisTurn: 0
        };

        // Validate the generated enemy
        const validationResult = validateEnemyBalance(enemy, context.act);

        if (validationResult.valid || attempt === maxRetries - 1) {
          return {
            enemy,
            validationResult,
            sprite: undefined,  // Sprite can be generated separately
            isAiGenerated: true
          };
        }

        console.log(`Enemy generation attempt ${attempt + 1} failed validation, retrying...`);

      } catch (error) {
        console.error(`Enemy generation attempt ${attempt + 1} error:`, error);
        if (attempt === maxRetries - 1) throw error;
      }
    }

    throw new Error('Failed to generate valid enemy after max retries');
  }

  /**
   * Generate SVG sprite for a card or enemy
   */
  async generateSprite(context: SpriteGenerationContext): Promise<string> {
    const prompt = buildSpriteGenerationPrompt(context);

    try {
      const svgCode = await this.callGemini(prompt, false);

      // Clean up the response - extract just the SVG
      const svgMatch = svgCode.match(/<svg[\s\S]*<\/svg>/i);
      if (svgMatch) {
        return svgMatch[0];
      }

      // If no SVG found, return a placeholder
      console.warn('No valid SVG in response, using placeholder');
      return context.type === 'card'
        ? `<svg viewBox="0 0 24 24" style="imageRendering: pixelated"><rect x="8" y="8" width="8" height="8" fill="#696969"/></svg>`
        : `<svg viewBox="0 0 32 32" style="imageRendering: pixelated"><rect x="8" y="8" width="16" height="16" fill="#696969"/></svg>`;

    } catch (error) {
      console.error('Sprite generation error:', error);
      throw error;
    }
  }

  /**
   * Generate a complete card with sprite
   */
  async generateCompleteCard(context: CardGenerationContext): Promise<GeneratedCard> {
    const result = await this.generateCard(context);

    try {
      const sprite = await this.generateSprite({
        type: 'card',
        name: result.card.name,
        themeDescription: result.card.description,
        cardType: result.card.type as 'Handle' | 'Head' | 'Deco'
      });
      result.sprite = sprite;
    } catch {
      // Sprite generation is optional
      console.warn('Could not generate sprite for card');
    }

    return result;
  }

  /**
   * Generate a complete enemy with sprite
   */
  async generateCompleteEnemy(context: EnemyGenerationContext): Promise<GeneratedEnemy> {
    const result = await this.generateEnemy(context);

    try {
      // Get theme description from the generated enemy
      const sprite = await this.generateSprite({
        type: 'enemy',
        name: result.enemy.name,
        themeDescription: `${result.enemy.tier} enemy: ${result.enemy.name}`,
        enemyTier: result.enemy.tier as 'Common' | 'Elite' | 'Boss'
      });
      result.sprite = sprite;
    } catch {
      console.warn('Could not generate sprite for enemy');
    }

    return result;
  }
}

// ============================================================
// FACTORY & EXPORTS
// ============================================================

let serviceInstance: GeminiService | null = null;

const STORAGE_KEY = 'fic_gemini_api_key';

/**
 * Get API key from localStorage
 */
function getApiKeyFromStorage(): string | undefined {
  if (typeof window !== 'undefined' && window.localStorage) {
    const key = localStorage.getItem(STORAGE_KEY);
    return key || undefined;
  }
  return undefined;
}

/**
 * Save API key to localStorage
 */
export function saveApiKey(apiKey: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(STORAGE_KEY, apiKey);
    // Reset service instance to use new key
    serviceInstance = null;
    console.log('[GeminiService] API key saved to localStorage');
  }
}

/**
 * Clear API key from localStorage
 */
export function clearApiKey(): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem(STORAGE_KEY);
    serviceInstance = null;
    console.log('[GeminiService] API key cleared from localStorage');
  }
}

/**
 * Get the current API key (for display purposes, masked)
 */
export function getApiKeyStatus(): { hasKey: boolean; maskedKey?: string } {
  const key = getApiKeyFromStorage() || getApiKeyFromEnv();
  if (key) {
    // Show first 4 and last 4 characters
    const masked = key.length > 8
      ? `${key.substring(0, 4)}...${key.substring(key.length - 4)}`
      : '****';
    return { hasKey: true, maskedKey: masked };
  }
  return { hasKey: false };
}

/**
 * Get API key from environment variable
 */
function getApiKeyFromEnv(): string | undefined {
  // Vite environment variable
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) {
    return (import.meta as any).env.VITE_GEMINI_API_KEY;
  }
  // Node.js environment variable
  if (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  }
  return undefined;
}

/**
 * Initialize the Gemini service with API key
 * If no API key provided, attempts to use environment variable
 */
export function initGeminiService(apiKey?: string, options?: Partial<GeminiConfig>): GeminiService {
  const key = apiKey || getApiKeyFromEnv();
  if (!key) {
    throw new Error('Gemini API key not provided. Set VITE_GEMINI_API_KEY environment variable or pass apiKey parameter.');
  }
  serviceInstance = new GeminiService({
    apiKey: key,
    ...options
  });
  return serviceInstance;
}

/**
 * Get the current Gemini service instance
 * Auto-initializes with localStorage or environment variable
 */
export function getGeminiService(): GeminiService | null {
  if (!serviceInstance) {
    // Priority: localStorage > environment variable
    const storageKey = getApiKeyFromStorage();
    const envKey = getApiKeyFromEnv();
    const apiKey = storageKey || envKey;

    if (apiKey) {
      const source = storageKey ? 'localStorage' : 'environment';
      console.log(`[GeminiService] API key found from ${source}, initializing service...`);
      serviceInstance = new GeminiService({ apiKey });
    } else {
      console.warn('[GeminiService] No API key found. Enter key in game menu or set VITE_GEMINI_API_KEY');
    }
  }
  return serviceInstance;
}

/**
 * Check if Gemini service is available
 */
export function isGeminiAvailable(): boolean {
  const available = getGeminiService() !== null;
  console.log('[GeminiService] isGeminiAvailable:', available);
  return available;
}

// ============================================================
// FALLBACK SYSTEM (Graceful Degradation)
// ============================================================

import { CARD_DATABASE, ENEMIES } from '../constants';

/**
 * Get a fallback card when AI generation fails
 */
export function getFallbackCard(context: CardGenerationContext): CardData {
  const matchingCards = CARD_DATABASE.filter(
    card => card.type === context.targetType && card.rarity === context.targetRarity
  );

  if (matchingCards.length === 0) {
    // Return any card of the target type
    const typeCards = CARD_DATABASE.filter(card => card.type === context.targetType);
    return typeCards[Math.floor(Math.random() * typeCards.length)];
  }

  return matchingCards[Math.floor(Math.random() * matchingCards.length)];
}

/**
 * Get a fallback enemy when AI generation fails
 */
export function getFallbackEnemy(context: EnemyGenerationContext): EnemyData {
  const tierMap: Record<string, EnemyTier> = {
    'Common': EnemyTier.COMMON,
    'Elite': EnemyTier.ELITE,
    'Boss': EnemyTier.BOSS
  };

  const tier = tierMap[context.targetTier];
  const matchingEnemies = Object.values(ENEMIES).filter(enemy => enemy.tier === tier);

  if (matchingEnemies.length === 0) {
    return Object.values(ENEMIES)[0];
  }

  return matchingEnemies[Math.floor(Math.random() * matchingEnemies.length)];
}

/**
 * Generate card with automatic fallback
 */
export async function generateCardWithFallback(context: CardGenerationContext): Promise<GeneratedCard> {
  const service = getGeminiService();

  if (!service) {
    console.warn('[AI Generation] Gemini service not available - API key missing?');
    console.warn('[AI Generation] Check VITE_GEMINI_API_KEY environment variable');
    const card = getFallbackCard(context);
    return {
      card,
      validationResult: validateCardBalance(card),
      sprite: undefined,
      isAiGenerated: false  // Fallback from database, not AI-generated
    };
  }

  try {
    console.log('[AI Generation] Attempting to generate card with Gemini API...');
    console.log('[AI Generation] Context:', JSON.stringify(context));
    const result = await service.generateCard(context);
    console.log('[AI Generation] Successfully generated card:', result.card.name);
    console.log('[AI Generation] Validation result:', result.validationResult.valid ? 'VALID' : 'INVALID');
    if (!result.validationResult.valid) {
      console.warn('[AI Generation] Validation errors:', result.validationResult.errors);
    }
    return result;
  } catch (error) {
    console.error('[AI Generation] Card generation failed:', error);
    console.error('[AI Generation] Falling back to database card');
    const card = getFallbackCard(context);
    return {
      card,
      validationResult: validateCardBalance(card),
      sprite: undefined,
      isAiGenerated: false  // Fallback from database, not AI-generated
    };
  }
}

/**
 * Generate enemy with automatic fallback
 */
export async function generateEnemyWithFallback(context: EnemyGenerationContext): Promise<GeneratedEnemy> {
  const service = getGeminiService();

  if (!service) {
    console.warn('Gemini service not available, using fallback');
    const enemy = getFallbackEnemy(context);
    return {
      enemy,
      validationResult: validateEnemyBalance(enemy, context.act),
      sprite: undefined,
      isAiGenerated: false  // Fallback from database, not AI-generated
    };
  }

  try {
    return await service.generateEnemy(context);
  } catch (error) {
    console.error('AI enemy generation failed, using fallback:', error);
    const enemy = getFallbackEnemy(context);
    return {
      enemy,
      validationResult: validateEnemyBalance(enemy, context.act),
      sprite: undefined,
      isAiGenerated: false  // Fallback from database, not AI-generated
    };
  }
}

export default GeminiService;
