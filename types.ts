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
  effectId?: string;
  unplayable?: boolean; // New flag for Rust cards
}

export interface CardInstance extends CardData {
  instanceId: string; // Unique ID for runtime tracking
}

export enum IntentType {
  ATTACK = 'ATTACK',
  DEFEND = 'DEFEND',
  BUFF = 'BUFF',
  DEBUFF = 'DEBUFF',
  WAIT = 'WAIT',
  SPECIAL = 'SPECIAL'
}

export interface EnemyIntent {
  type: IntentType;
  value: number;
  description: string;
}

export enum EnemyTrait {
  NONE = 'NONE',
  DAMAGE_CAP_15 = 'DAMAGE_CAP_15', // Rock Crusher
  THORNS_5 = 'THORNS_5', // Automaton
  RESURRECT = 'RESURRECT', // Phoenix/Machine
  REACTIVE_RARE = 'REACTIVE_RARE', // Kobold
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

export enum NodeType {
  COMBAT = 'COMBAT',
  ELITE = 'ELITE',
  REST = 'REST',
  EVENT = 'EVENT',
  BOSS = 'BOSS'
}

export interface MapNode {
  type: NodeType;
  name: string;
  description: string;
  icon: string;
  enemyId?: string; // If combat, specific enemy (optional)
}

// --- Event System ---

export type EventOptionType = 'HEAL' | 'DAMAGE' | 'GAIN_CARD_RARE' | 'REMOVE_CARD' | 'GAIN_GOLD' | 'LOSE_GOLD' | 'FULL_HEAL' | 'RANDOM_UPGRADE' | 'LEAVE';

export interface EventOption {
    label: string;
    description: string;
    type: EventOptionType;
    value?: number; // Amount
    cost?: number; // Gold/HP cost if any
}

export interface GameEvent {
    id: string;
    title: string;
    description: string;
    icon: string; // Lucide icon identifier
    options: EventOption[];
}