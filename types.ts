export enum CardType {
  HANDLE = 'Handle',
  HEAD = 'Head',
  DECO = 'Deco',
  JUNK = 'Junk' // New type for interference cards
}

export enum CardRarity {
  STARTER = 'Starter',
  COMMON = 'Common',
  RARE = 'Rare',
  LEGEND = 'Legend',
  JUNK = 'Junk',
  SPECIAL = 'Special' // For created cards
}

export interface CardData {
  id: number;
  name: string;
  type: CardType;
  cost: number;
  value: number; // Damage for Head, Multiplier for Handle, Additive for Deco
  rarity: CardRarity;
  description: string;
  unplayable?: boolean; // New flag for Rust cards
}

export interface CardInstance extends CardData {
  instanceId: string; // Unique ID for runtime tracking
}

export type GameState = 'MENU' | 'MAP' | 'PLAYING' | 'REWARD' | 'BOSS_REWARD' | 'REST' | 'SHOP' | 'EVENT' | 'REMOVE_CARD' | 'WIN' | 'LOSE';
export type RemovalContext = 'REST' | 'SHOP' | 'EVENT' | null;

export interface GameSettings {
  animationsEnabled: boolean;
  screenShake: boolean;
  tutorialCompleted: boolean;
  soundEnabled: boolean;
  musicEnabled: boolean;
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  reduceMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
}

export type CardArchetypeId =
  | 'SELF_DAMAGE'
  | 'DEFENSE_CONVERSION'
  | 'STATUS_DAMAGE'
  | 'ENERGY_LOOP'
  | 'DRAW_LOOP'
  | 'HEAVY_STRIKE'
  | 'MULTI_HIT';

export interface CardArchetypeDefinition {
  id: CardArchetypeId;
  name: string;
  description: string;
  entryCardIds: number[];
  midCardIds: number[];
  lateCardIds: number[];
  slotCardIds: Record<CardType.HANDLE | CardType.HEAD | CardType.DECO, number[]>;
}

export enum IntentType {
  ATTACK = 'ATTACK',
  DEFEND = 'DEFEND',
  BUFF = 'BUFF',
  DEBUFF = 'DEBUFF',
  WAIT = 'WAIT',
  SPECIAL = 'SPECIAL'
}

export type EnemyIntentEffect =
  | { type: 'ADD_JUNK'; count: number }
  | { type: 'INCREASE_RANDOM_HANDLE_COST'; amount: number }
  | { type: 'SET_PLAYER_COST_LIMIT'; limit: number }
  | { type: 'DISARM_HEAD' }
  | { type: 'REFLECT_DAMAGE_TAKEN' }
  | { type: 'ATTACK_FROM_PLAYER_BLOCK'; multiplier: number; minimumBonus?: number }
  | { type: 'ATTACK_FROM_WEAPONS_USED'; perWeapon: number }
  | { type: 'CLEANSE_STATUSES_GAIN_STRENGTH'; amountPerStatus: number; minGain?: number; maxGain?: number }
  | { type: 'GAIN_STRENGTH'; amount: number; randomMax?: number }
  | { type: 'HEAL_SELF'; amount: number };

export interface EnemyIntent {
  type: IntentType;
  value: number;
  description: string;
  hits?: number;
  effect?: EnemyIntentEffect;
}

export enum EnemyTrait {
  NONE = 'NONE',
  DAMAGE_CAP_15 = 'DAMAGE_CAP_15', // Rock Crusher
  THORNS_5 = 'THORNS_5', // Automaton
  RESURRECT = 'RESURRECT', // Phoenix/Machine
  THIEVERY = 'THIEVERY' // Goblin: Steals gold on hit
}

export enum EnemyTier {
  COMMON = 'Common',
  ELITE = 'Elite',
  BOSS = 'Boss'
}

export interface EnemyStatus {
    poison: number;
    bleed: number;
    stunned: number;
    strength: number;
    vulnerable: number; // Takes 50% more damage
    weak: number; // Deals 25% less damage
    burn: number; // Burn: damage at turn end, does NOT decay
}

export interface EnemyData {
  id: string;
  name: string;
  tier: EnemyTier; // For categorization
  maxHp: number;
  currentHp: number;
  block: number; // Current Block amount
  intents: EnemyIntent[];
  currentIntentIndex: number;
  traits: EnemyTrait[]; // Passive abilities
  statuses: EnemyStatus; // Active debuffs
  image?: string; // Placeholder for visual variety
  damageTakenThisTurn: number; // For Mimic Anvil logic
}

export interface PlayerStats {
  hp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
  block: number;
  gold: number;
  costLimit: number | null; // For Deus Ex Machina logic
  disarmed: boolean; // For Corrupted Smith logic (Cannot slot Head)
  nextTurnDraw: number; // Stores extra draw count for the next turn
  overheat: number; // Overheat: reduces energy next turn
  weaponsUsedThisTurn: number; // Counter for combo cards like 310
  dodgeNextAttack: boolean; // For 412 Evasion Handle - dodge next enemy attack
  selfDamageThisTurn: number; // For 320 Berserker Rune - tracks self damage for bonus
}

export interface CombatState {
  turn: number;
  phase: 'PLAYER_DRAW' | 'PLAYER_ACTION' | 'PLAYER_DISCARD' | 'ENEMY_TURN' | 'GAME_OVER_WIN' | 'GAME_OVER_LOSS';
}

export interface CraftedWeapon {
  totalCost: number;
  damage: number;
  block: number;
  hitCount: number; // For multi-hit weapons
  effects: string[];
}

// --- Static Reward Data ---

export type CombatRewardId = 'COMMON' | 'ELITE' | 'BOSS';

export interface CombatRewardRule {
  id: CombatRewardId;
  gold: {
    min: number;
    max: number;
  };
  cardOptionCount: number;
  cardRarities: CardRarity[];
  rarityWeights: Partial<Record<CardRarity, number>>;
  legendUnlockFloor: number;
}

export interface CombatRewardContext {
  act: 1 | 2 | 3;
  floor: number;
  deck: CardInstance[];
}

export type ShopItemId = 'REMOVE' | 'HEAL' | 'RARE' | 'ENERGY';
export type ShopIconKey = 'flame' | 'heart' | 'sparkles' | 'zap';
export type ShopColorKey = 'red' | 'green' | 'purple' | 'yellow';

export type ShopItemEffect =
  | { type: 'REMOVE_CARD' }
  | { type: 'HEAL_PERCENT'; percent: number }
  | { type: 'GAIN_RANDOM_CARD'; rarity: CardRarity }
  | { type: 'MAX_ENERGY'; amount: number };

export interface ShopItemDefinition {
  id: ShopItemId;
  name: string;
  description: string;
  price: number;
  icon: ShopIconKey;
  color: ShopColorKey;
  effect: ShopItemEffect;
}

export type BossRewardId = 'ENERGY' | 'MAX_HP' | 'GOLD';
export type BossRewardIconKey = 'zap' | 'heart' | 'coins';
export type BossRewardColorKey = 'yellow' | 'blue' | 'stone';

export type BossRewardEffect =
  | { type: 'MAX_ENERGY'; amount: number }
  | { type: 'MAX_HP'; amount: number }
  | { type: 'GAIN_GOLD'; amount: number };

export interface BossRewardDefinition {
  id: BossRewardId;
  name: string;
  description: string;
  icon: BossRewardIconKey;
  color: BossRewardColorKey;
  effect: BossRewardEffect;
  feedback: string;
}

export enum NodeType {
  COMBAT = 'COMBAT',
  ELITE = 'ELITE',
  REST = 'REST',
  SHOP = 'SHOP',
  EVENT = 'EVENT',
  BOSS = 'BOSS'
}

export interface MapNode {
  id: string;
  act: 1 | 2 | 3;
  floor: number;
  row: number;
  type: NodeType;
  name: string;
  description: string;
  icon: string;
  enemyId?: string; // If combat, specific enemy (optional)
  eventId?: string;
  nextNodeIds: string[];
}

// --- Event System ---

export type EventOptionType = 'HEAL' | 'DAMAGE' | 'GAIN_CARD_RARE' | 'REMOVE_CARD' | 'GAIN_GOLD' | 'LOSE_GOLD' | 'FULL_HEAL' | 'RANDOM_UPGRADE' | 'LEAVE';
export type EventCostResource = 'GOLD' | 'HP';

export interface EventOption {
    label: string;
    description: string;
    type: EventOptionType;
    value?: number; // Amount
    cost?: number; // Gold/HP cost if any
    costResource?: EventCostResource;
}

export interface GameEvent {
    id: string;
    title: string;
    description: string;
    icon: string; // Lucide icon identifier
    options: EventOption[];
}
