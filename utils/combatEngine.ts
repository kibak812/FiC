import {
  CardInstance,
  CraftedWeapon,
  EnemyData,
  EnemyIntent,
  EnemyStatus,
  EnemyTrait,
  IntentType,
  PlayerStats
} from '@/types';
import type { EffectAction, EffectModifiers, WeaponSlots } from './cardEffects';

const DEFENSIVE_HANDLE_IDS = new Set([102, 217, 322, 415]);
const DEFENSIVE_HEAD_IDS = new Set([104, 227, 330, 419]);

const HEAD_HIT_COUNTS: Record<number, number> = {
  249: 2,
  233: 3,
  306: 2,
  335: 3,
  421: 4
};

const HEAD_BLEED_SCALING: Record<number, number> = {
  209: 1
};

const HEAD_POISON_SCALING: Record<number, number> = {
  213: 1,
  235: 1
};

const HEAD_WEAPON_SCALING: Record<number, number> = {
  234: 1,
  310: 2
};

const BLOCK_TO_DAMAGE_RATIO_BY_DECO_ID: Record<number, number> = {
  207: 1,
  210: 0.5,
  237: 0.4,
  338: 1,
  423: 1.5
};

const BLOCK_MULTIPLIER_BY_DECO_ID: Record<number, number> = {
  311: 2,
  338: 2,
  423: 2
};

const MULTI_HIT_DAMAGE_BONUS_BY_DECO_ID: Record<number, number> = {
  243: 4,
  344: 6
};

const DECO_DAMAGE_MULTIPLIER_BY_ID: Record<number, number> = {
  343: 1.5
};

export interface WeaponStatsInput {
  slots: WeaponSlots;
  playerBlock: number;
  weaponsUsedThisTurn: number;
  enemyStatuses: EnemyStatus;
  growingCrystalBonus: number;
  gamblerPreviewMultiplier?: number;
}

export interface EnemyTurnStartStatusResult {
  statuses: EnemyStatus;
  isStunned: boolean;
  poisonDamage: number;
  burnDamage: number;
}

export interface EnemyIntentPlan {
  intent: EnemyIntent;
  handleCostIncrease: number;
  costLimit: number | null;
  disarmsHead: boolean;
  isAttack: boolean;
  attackDamage: number;
  attackCount: number;
  blockCounterBonus: number;
  weaponCounterBonus: number;
  defendBlock: number;
  healAmount: number;
  junkCount: number;
  statusCleanseStrengthGain: number;
}

export type EnemyTurnEvent =
  | { type: 'STUNNED' }
  | { type: 'POISON_DAMAGE'; amount: number }
  | { type: 'BURN_DAMAGE'; amount: number }
  | { type: 'COST_LIMIT'; limit: number }
  | { type: 'DISARM_HEAD' }
  | { type: 'BLOCK_COUNTER'; amount: number }
  | { type: 'WEAPON_COUNTER'; amount: number }
  | { type: 'BLEED_DAMAGE'; amount: number }
  | { type: 'DODGE_ATTACK' }
  | { type: 'ATTACK_HIT'; damage: number; blocked: boolean; stolenGold: number }
  | { type: 'STRENGTH_RESET' }
  | { type: 'ENEMY_DEFEND'; amount: number }
  | { type: 'ENEMY_GAIN_STRENGTH'; amount: number }
  | { type: 'ENEMY_HEAL'; amount: number }
  | { type: 'ENEMY_CLEANSE_STRENGTH'; amount: number }
  | { type: 'ENEMY_CLEANSE_FAILED' };

export type EnemyTurnSideEffect =
  | { type: 'INCREASE_RANDOM_HANDLE_COST'; amount: number }
  | { type: 'ADD_JUNK'; count: number };

export interface EnemyTurnResult {
  player: PlayerStats;
  enemy: EnemyData;
  turnStart: EnemyTurnStartStatusResult;
  plan: EnemyIntentPlan | null;
  events: EnemyTurnEvent[];
  sideEffects: EnemyTurnSideEffect[];
}

export interface BlockedDamageResult {
  unblockedDamage: number;
  nextBlock: number;
}

export type CombatEffectSideEffect =
  | { type: 'DRAW_CARDS'; count: number }
  | { type: 'CREATE_REPLICA'; baseDamage: number };

export interface CombatEffectState {
  player: PlayerStats;
  enemy: EnemyData;
  modifiers: EffectModifiers;
  growingCrystalBonus: number;
}

export interface CombatEffectApplyResult extends CombatEffectState {
  sideEffects: CombatEffectSideEffect[];
}

export const isDefensiveWeapon = (handle: CardInstance, head: CardInstance): boolean => {
  return DEFENSIVE_HANDLE_IDS.has(handle.id) || DEFENSIVE_HEAD_IDS.has(head.id);
};

export const getHeadHitCount = (headId: number): number => {
  return HEAD_HIT_COUNTS[headId] || 1;
};

export const calculateWeaponStats = ({
  slots,
  playerBlock,
  weaponsUsedThisTurn,
  enemyStatuses,
  growingCrystalBonus,
  gamblerPreviewMultiplier = 2
}: WeaponStatsInput): CraftedWeapon => {
  const { handle, head, deco } = slots;
  if (!handle || !head) return { totalCost: 0, damage: 0, block: 0, effects: [], hitCount: 1 };

  let totalCost = handle.cost + head.cost + (deco ? deco.cost : 0);
  let baseValue = head.value + (deco ? deco.value : 0);
  let handleMultiplier = handle.value;

  if (handle.id === 309) {
    handleMultiplier = gamblerPreviewMultiplier;
  }

  const finalValue = Math.floor(baseValue * handleMultiplier);

  if (deco?.id === 403) totalCost = 0;

  let damage = finalValue;
  let block = 0;
  const hitCount = getHeadHitCount(head.id);

  if (isDefensiveWeapon(handle, head)) {
    block = finalValue;
    damage = 0;
  }

  damage += (enemyStatuses.bleed || 0) * (HEAD_BLEED_SCALING[head.id] || 0);

  if (deco && BLOCK_TO_DAMAGE_RATIO_BY_DECO_ID[deco.id]) {
    damage += Math.floor(playerBlock * BLOCK_TO_DAMAGE_RATIO_BY_DECO_ID[deco.id]);
  }

  damage += (enemyStatuses.poison || 0) * (HEAD_POISON_SCALING[head.id] || 0);
  damage += weaponsUsedThisTurn * (HEAD_WEAPON_SCALING[head.id] || 0);

  if (deco && MULTI_HIT_DAMAGE_BONUS_BY_DECO_ID[deco.id] && hitCount > 1) {
    damage += MULTI_HIT_DAMAGE_BONUS_BY_DECO_ID[deco.id];
  }

  if (deco && BLOCK_MULTIPLIER_BY_DECO_ID[deco.id] && block > 0) {
    block *= BLOCK_MULTIPLIER_BY_DECO_ID[deco.id];
  }

  if (deco && DECO_DAMAGE_MULTIPLIER_BY_ID[deco.id] && damage > 0) {
    damage = Math.floor(damage * DECO_DAMAGE_MULTIPLIER_BY_ID[deco.id]);
  }

  if (head.id === 406) {
    damage = 0;
  }

  if (deco?.id === 407) {
    damage += growingCrystalBonus;
  }

  return { totalCost, damage, block, effects: [], hitCount };
};

export const resolveEnemyTurnStartStatuses = (statuses: EnemyStatus): EnemyTurnStartStatusResult => {
  const nextStatuses: EnemyStatus = {
    ...statuses,
    vulnerable: Math.max(0, statuses.vulnerable - 1),
    weak: Math.max(0, statuses.weak - 1)
  };

  const isStunned = nextStatuses.stunned > 0;
  if (isStunned) {
    nextStatuses.stunned = Math.max(0, nextStatuses.stunned - 1);
    return {
      statuses: nextStatuses,
      isStunned: true,
      poisonDamage: 0,
      burnDamage: 0
    };
  }

  const poisonDamage = nextStatuses.poison;
  if (poisonDamage > 0) {
    nextStatuses.poison = Math.max(0, nextStatuses.poison - 1);
  }

  return {
    statuses: nextStatuses,
    isStunned: false,
    poisonDamage,
    burnDamage: nextStatuses.burn
  };
};

export const calculateBlockedDamage = (incomingDamage: number, currentBlock: number): BlockedDamageResult => {
  return {
    unblockedDamage: Math.max(0, incomingDamage - currentBlock),
    nextBlock: Math.max(0, currentBlock - incomingDamage)
  };
};

export const applyCombatEffectAction = (
  state: CombatEffectState,
  action: EffectAction
): CombatEffectApplyResult => {
  const player: PlayerStats = { ...state.player };
  const enemy: EnemyData = {
    ...state.enemy,
    statuses: { ...state.enemy.statuses }
  };
  const modifiers: EffectModifiers = { ...state.modifiers };
  let growingCrystalBonus = state.growingCrystalBonus;
  const sideEffects: CombatEffectSideEffect[] = [];

  switch (action.type) {
    case 'MODIFY_DAMAGE':
      if (action.mode === 'add') {
        modifiers.finalDamage += action.amount;
      } else if (action.mode === 'multiply') {
        modifiers.finalDamage = Math.floor(modifiers.finalDamage * action.amount);
      } else {
        modifiers.finalDamage = action.amount;
      }
      break;
    case 'MODIFY_BLOCK':
      if (action.mode === 'add') {
        modifiers.finalBlock += action.amount;
      } else {
        modifiers.finalBlock = Math.floor(modifiers.finalBlock * action.amount);
      }
      break;
    case 'SET_IGNORE_BLOCK':
      modifiers.ignoreBlock = action.value;
      break;
    case 'PLAYER_SELF_DAMAGE':
      player.hp = Math.max(0, player.hp - action.amount);
      player.selfDamageThisTurn += action.amount;
      modifiers.selfDamage += action.amount;
      break;
    case 'PLAYER_HEAL':
      player.hp = Math.min(player.maxHp, player.hp + action.amount);
      break;
    case 'PLAYER_GAIN_ENERGY':
      player.energy = Math.min(player.maxEnergy, player.energy + action.amount);
      break;
    case 'PLAYER_GAIN_BLOCK':
      player.block += action.amount;
      break;
    case 'PLAYER_REDUCE_BLOCK': {
      const hpDamage = Math.max(0, action.amount - player.block);
      player.block = Math.max(0, player.block - action.amount);
      player.hp = Math.max(0, player.hp - hpDamage);
      break;
    }
    case 'PLAYER_GAIN_GOLD':
      player.gold += action.amount;
      break;
    case 'PLAYER_SET_DODGE':
      player.dodgeNextAttack = action.value;
      break;
    case 'PLAYER_OVERHEAT':
      player.overheat += action.amount;
      break;
    case 'PLAYER_NEXT_TURN_DRAW':
      player.nextTurnDraw += action.amount;
      break;
    case 'ENEMY_APPLY_STATUS':
      enemy.statuses[action.status] += action.amount;
      break;
    case 'ENEMY_SKIP_INTENT':
      enemy.currentIntentIndex = (enemy.currentIntentIndex + 1) % enemy.intents.length;
      break;
    case 'ENEMY_EXECUTE_THRESHOLD':
      if (enemy.currentHp > 0 && enemy.currentHp <= enemy.maxHp * action.threshold) {
        enemy.currentHp = 0;
      }
      break;
    case 'DRAW_CARDS':
      sideEffects.push({ type: 'DRAW_CARDS', count: action.count });
      break;
    case 'CREATE_REPLICA':
      sideEffects.push({ type: 'CREATE_REPLICA', baseDamage: action.baseDamage });
      break;
    case 'GROW_CRYSTAL':
      growingCrystalBonus = Math.min(action.max, growingCrystalBonus + action.amount);
      break;
  }

  return {
    player,
    enemy,
    modifiers,
    growingCrystalBonus,
    sideEffects
  };
};

export const applyCombatEffectActions = (
  state: CombatEffectState,
  actions: EffectAction[]
): CombatEffectApplyResult => {
  let current: CombatEffectApplyResult = {
    ...state,
    player: { ...state.player },
    enemy: { ...state.enemy, statuses: { ...state.enemy.statuses } },
    modifiers: { ...state.modifiers },
    sideEffects: []
  };

  for (const action of actions) {
    const next = applyCombatEffectAction(current, action);
    current = {
      ...next,
      sideEffects: [...current.sideEffects, ...next.sideEffects]
    };
  }

  return current;
};

export const calculateStatusCleanseStrengthGain = (enemy: EnemyData, intent: EnemyIntent): number => {
  if (intent.effect?.type !== 'CLEANSE_STATUSES_GAIN_STRENGTH') return 0;

  const statusStacks =
    enemy.statuses.poison +
    enemy.statuses.bleed +
    enemy.statuses.burn +
    enemy.statuses.vulnerable +
    enemy.statuses.weak +
    enemy.statuses.stunned;

  if (statusStacks <= 0) return 0;

  const rawGain = Math.max(
    intent.effect.minGain || 0,
    Math.floor(statusStacks * intent.effect.amountPerStatus)
  );

  return intent.effect.maxGain ? Math.min(intent.effect.maxGain, rawGain) : rawGain;
};

export const calculateEnemyStrengthGain = (
  enemy: EnemyData,
  intent: EnemyIntent,
  rng: () => number = Math.random
): number => {
  if (intent.effect?.type === 'GAIN_STRENGTH') {
    return intent.effect.randomMax
      ? Math.floor(rng() * intent.effect.randomMax) + intent.effect.amount
      : intent.effect.amount;
  }

  if (intent.type !== IntentType.BUFF || !intent.description.includes('공격력')) return 0;

  if (enemy.id === 'kobold_scrapper') {
    return Math.floor(rng() * 3) + 1;
  }

  return intent.value;
};

export const calculateEnemyIntentPlan = (enemy: EnemyData, player: PlayerStats): EnemyIntentPlan => {
  const intent = enemy.intents[enemy.currentIntentIndex];
  let handleCostIncrease = 0;

  if (intent.effect?.type === 'INCREASE_RANDOM_HANDLE_COST') {
    handleCostIncrease = intent.effect.amount;
  } else if (enemy.id === 'hammerhead' && intent.type === IntentType.DEBUFF) {
    handleCostIncrease = 1;
  }

  const costLimit = intent.effect?.type === 'SET_PLAYER_COST_LIMIT'
    ? intent.effect.limit
    : enemy.id === 'deus_ex_machina' && intent.description.includes('코스트 제한')
      ? 2
      : null;

  const disarmsHead = intent.effect?.type === 'DISARM_HEAD' ||
    (enemy.id === 'corrupted_smith' && intent.type === IntentType.SPECIAL);

  let attackDamage = 0;
  if (intent.effect?.type === 'REFLECT_DAMAGE_TAKEN' || (enemy.id === 'mimic_anvil' && intent.description.includes('반사'))) {
    attackDamage = enemy.damageTakenThisTurn;
  } else if (intent.type === IntentType.ATTACK) {
    attackDamage = intent.value;
  }

  let blockCounterBonus = 0;
  if (intent.effect?.type === 'ATTACK_FROM_PLAYER_BLOCK') {
    blockCounterBonus = Math.max(
      intent.effect.minimumBonus || 0,
      Math.floor(player.block * intent.effect.multiplier)
    );
    attackDamage += blockCounterBonus;
  }

  let weaponCounterBonus = 0;
  if (intent.effect?.type === 'ATTACK_FROM_WEAPONS_USED') {
    weaponCounterBonus = player.weaponsUsedThisTurn * intent.effect.perWeapon;
    attackDamage += weaponCounterBonus;
  }

  if (intent.type === IntentType.ATTACK && enemy.statuses.strength > 0) {
    attackDamage += enemy.statuses.strength;
  }

  if (intent.type === IntentType.ATTACK && enemy.statuses.weak > 0) {
    attackDamage = Math.floor(attackDamage * 0.75);
  }

  const isAttack = intent.type === IntentType.ATTACK ||
    (enemy.id === 'mimic_anvil' && intent.description.includes('반사'));

  return {
    intent,
    handleCostIncrease,
    costLimit,
    disarmsHead,
    isAttack,
    attackDamage,
    attackCount: intent.hits || (intent.description.includes('(x3)') ? 3 : 1),
    blockCounterBonus,
    weaponCounterBonus,
    defendBlock: intent.type === IntentType.DEFEND ? intent.value : 0,
    healAmount: intent.effect?.type === 'HEAL_SELF' ? intent.effect.amount : 0,
    junkCount: intent.effect?.type === 'ADD_JUNK'
      ? intent.effect.count
      : intent.type === IntentType.DEBUFF && !intent.effect && enemy.id !== 'hammerhead' && enemy.id !== 'deus_ex_machina'
        ? intent.value || 1
        : 0,
    statusCleanseStrengthGain: calculateStatusCleanseStrengthGain(enemy, intent)
  };
};

export const resolveEnemyTurn = (
  enemyInput: EnemyData,
  playerInput: PlayerStats,
  rng: () => number = Math.random
): EnemyTurnResult => {
  const player: PlayerStats = { ...playerInput };
  const enemy: EnemyData = {
    ...enemyInput,
    block: 0,
    statuses: { ...enemyInput.statuses }
  };
  const events: EnemyTurnEvent[] = [];
  const sideEffects: EnemyTurnSideEffect[] = [];

  const turnStart = resolveEnemyTurnStartStatuses(enemy.statuses);
  enemy.statuses = turnStart.statuses;

  if (turnStart.poisonDamage > 0) {
    events.push({ type: 'POISON_DAMAGE', amount: turnStart.poisonDamage });
  }

  if (turnStart.burnDamage > 0) {
    events.push({ type: 'BURN_DAMAGE', amount: turnStart.burnDamage });
  }

  if (turnStart.isStunned) {
    events.push({ type: 'STUNNED' });
    return { player, enemy, turnStart, plan: null, events, sideEffects };
  }

  enemy.currentHp = Math.max(0, enemy.currentHp - turnStart.poisonDamage - turnStart.burnDamage);
  if (enemy.currentHp <= 0) {
    return { player, enemy, turnStart, plan: null, events, sideEffects };
  }

  const plan = calculateEnemyIntentPlan(enemy, player);
  const intent = plan.intent;

  if (plan.handleCostIncrease > 0) {
    sideEffects.push({ type: 'INCREASE_RANDOM_HANDLE_COST', amount: plan.handleCostIncrease });
  }

  if (plan.costLimit !== null) {
    player.costLimit = plan.costLimit;
    events.push({ type: 'COST_LIMIT', limit: plan.costLimit });
  }

  if (plan.disarmsHead) {
    player.disarmed = true;
    events.push({ type: 'DISARM_HEAD' });
  }

  if (plan.blockCounterBonus > 0) {
    events.push({ type: 'BLOCK_COUNTER', amount: plan.blockCounterBonus });
  }

  if (plan.weaponCounterBonus > 0) {
    events.push({ type: 'WEAPON_COUNTER', amount: plan.weaponCounterBonus });
  }

  if (plan.isAttack) {
    for (let i = 0; i < plan.attackCount; i++) {
      if (enemy.statuses.bleed > 0) {
        const bleedDamage = enemy.statuses.bleed;
        enemy.currentHp = Math.max(0, enemy.currentHp - bleedDamage);
        enemy.statuses.bleed = Math.max(0, enemy.statuses.bleed - 1);
        events.push({ type: 'BLEED_DAMAGE', amount: bleedDamage });
      }

      if (enemy.currentHp <= 0) break;

      if (player.dodgeNextAttack) {
        player.dodgeNextAttack = false;
        events.push({ type: 'DODGE_ATTACK' });
        continue;
      }

      const { unblockedDamage, nextBlock } = calculateBlockedDamage(plan.attackDamage, player.block);
      player.hp = Math.max(0, player.hp - unblockedDamage);
      player.block = nextBlock;

      let stolenGold = 0;
      if (enemy.traits.includes(EnemyTrait.THIEVERY) && unblockedDamage > 0) {
        stolenGold = Math.min(player.gold, 5);
        player.gold -= stolenGold;
      }

      events.push({
        type: 'ATTACK_HIT',
        damage: unblockedDamage,
        blocked: unblockedDamage === 0,
        stolenGold
      });

      if (player.hp <= 0) break;
    }

    if (enemy.statuses.strength > 0) {
      enemy.statuses.strength = 0;
      events.push({ type: 'STRENGTH_RESET' });
    }
  }

  if (enemy.currentHp <= 0 || player.hp <= 0) {
    return { player, enemy, turnStart, plan, events, sideEffects };
  }

  if (plan.defendBlock > 0) {
    enemy.block += plan.defendBlock;
    events.push({ type: 'ENEMY_DEFEND', amount: plan.defendBlock });
  } else if (intent.effect?.type === 'GAIN_STRENGTH') {
    const gain = calculateEnemyStrengthGain(enemy, intent, rng);
    enemy.statuses.strength += gain;
    events.push({ type: 'ENEMY_GAIN_STRENGTH', amount: gain });
  } else if (plan.healAmount > 0) {
    const previousHp = enemy.currentHp;
    enemy.currentHp = Math.min(enemy.maxHp, enemy.currentHp + plan.healAmount);
    events.push({ type: 'ENEMY_HEAL', amount: enemy.currentHp - previousHp });
  } else if (intent.effect?.type === 'CLEANSE_STATUSES_GAIN_STRENGTH') {
    if (plan.statusCleanseStrengthGain > 0) {
      enemy.statuses.poison = 0;
      enemy.statuses.bleed = 0;
      enemy.statuses.burn = 0;
      enemy.statuses.vulnerable = 0;
      enemy.statuses.weak = 0;
      enemy.statuses.stunned = 0;
      enemy.statuses.strength += plan.statusCleanseStrengthGain;
      events.push({ type: 'ENEMY_CLEANSE_STRENGTH', amount: plan.statusCleanseStrengthGain });
    } else {
      events.push({ type: 'ENEMY_CLEANSE_FAILED' });
    }
  } else if (plan.junkCount > 0) {
    sideEffects.push({ type: 'ADD_JUNK', count: plan.junkCount });
  } else if (intent.type === IntentType.BUFF && intent.description.includes('공격력')) {
    const gain = calculateEnemyStrengthGain(enemy, intent, rng);
    enemy.statuses.strength += gain;
    events.push({ type: 'ENEMY_GAIN_STRENGTH', amount: gain });
  } else if (intent.type === IntentType.BUFF) {
    const previousHp = enemy.currentHp;
    enemy.currentHp = Math.min(enemy.maxHp, enemy.currentHp + intent.value);
    events.push({ type: 'ENEMY_HEAL', amount: enemy.currentHp - previousHp });
  }

  enemy.currentIntentIndex = (enemy.currentIntentIndex + 1) % enemy.intents.length;

  return { player, enemy, turnStart, plan, events, sideEffects };
};
