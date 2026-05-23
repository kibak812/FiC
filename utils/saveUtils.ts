import {
  CardInstance,
  CombatState,
  EnemyData,
  EventOption,
  GameEvent,
  GameSettings,
  GameState,
  MapNode,
  PlayerStats,
  RemovalContext
} from '@/types';

const RUN_SAVE_KEY = 'fic.runSave';
const SETTINGS_SAVE_KEY = 'fic.settings';
const CURRENT_RUN_SAVE_VERSION = 2;
const CURRENT_SETTINGS_VERSION = 1;

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  animationsEnabled: true,
  screenShake: true
};

export interface SaveSlots {
  handle: CardInstance | null;
  head: CardInstance | null;
  deco: CardInstance | null;
}

export interface SavedRunData {
  version: number;
  savedAt: string;
  gameState: GameState;
  floor: number;
  act: number;
  hasRested: boolean;
  player: PlayerStats;
  enemy: EnemyData;
  deck: CardInstance[];
  hand: CardInstance[];
  discardPile: CardInstance[];
  rewardOptions: CardInstance[];
  selectedCardId: string | null;
  removalContext: RemovalContext;
  currentEvent: GameEvent | null;
  pendingEventRemovalOption: EventOption | null;
  mapNodes: MapNode[];
  currentMapNodeId: string | null;
  completedMapNodeIds: string[];
  activeMapNode: MapNode | null;
  slots: SaveSlots;
  combatState: CombatState;
  growingCrystalBonus: number;
  infiniteLoopUsed: boolean;
}

export interface SavedRunSummary {
  savedAt: string;
  act: number;
  floor: number;
  gameState: GameState;
  hp: number;
  maxHp: number;
  gold: number;
}

interface SavedSettingsData {
  version: number;
  settings: GameSettings;
}

type LegacySavedRunData = Partial<SavedRunData> & {
  version?: number;
};

type LegacySettingsData = Partial<SavedSettingsData> & Partial<GameSettings>;

const storageAvailable = (): boolean => typeof window !== 'undefined' && Boolean(window.localStorage);

const parseStoredJson = (key: string): unknown | null => {
  if (!storageAvailable()) return null;

  const rawValue = window.localStorage.getItem(key);
  if (!rawValue) return null;

  try {
    return JSON.parse(rawValue) as unknown;
  } catch {
    window.localStorage.removeItem(key);
    return null;
  }
};

const isObjectRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const migrateRunSave = (value: unknown): SavedRunData | null => {
  if (!isObjectRecord(value)) return null;

  const legacy = value as LegacySavedRunData;
  const version = typeof legacy.version === 'number' ? legacy.version : 0;

  if (version > CURRENT_RUN_SAVE_VERSION) return null;
  if (!legacy.gameState || !legacy.player || !legacy.enemy || !legacy.combatState) return null;

  const migrated: SavedRunData = {
    version: CURRENT_RUN_SAVE_VERSION,
    savedAt: typeof legacy.savedAt === 'string' ? legacy.savedAt : new Date().toISOString(),
    gameState: legacy.gameState,
    floor: typeof legacy.floor === 'number' ? legacy.floor : 0,
    act: typeof legacy.act === 'number' ? legacy.act : 1,
    hasRested: Boolean(legacy.hasRested),
    player: legacy.player,
    enemy: legacy.enemy,
    deck: Array.isArray(legacy.deck) ? legacy.deck : [],
    hand: Array.isArray(legacy.hand) ? legacy.hand : [],
    discardPile: Array.isArray(legacy.discardPile) ? legacy.discardPile : [],
    rewardOptions: Array.isArray(legacy.rewardOptions) ? legacy.rewardOptions : [],
    selectedCardId: typeof legacy.selectedCardId === 'string' ? legacy.selectedCardId : null,
    removalContext: legacy.removalContext || null,
    currentEvent: legacy.currentEvent || null,
    pendingEventRemovalOption: legacy.pendingEventRemovalOption || null,
    mapNodes: Array.isArray(legacy.mapNodes) ? legacy.mapNodes : [],
    currentMapNodeId: typeof legacy.currentMapNodeId === 'string' ? legacy.currentMapNodeId : null,
    completedMapNodeIds: Array.isArray(legacy.completedMapNodeIds) ? legacy.completedMapNodeIds : [],
    activeMapNode: legacy.activeMapNode || null,
    slots: legacy.slots || { handle: null, head: null, deco: null },
    combatState: legacy.combatState,
    growingCrystalBonus: typeof legacy.growingCrystalBonus === 'number' ? legacy.growingCrystalBonus : 0,
    infiniteLoopUsed: Boolean(legacy.infiniteLoopUsed)
  };

  if (migrated.gameState === 'PLAYING' && migrated.combatState.phase !== 'PLAYER_ACTION') {
    migrated.combatState = { ...migrated.combatState, phase: 'PLAYER_ACTION' };
  }

  return migrated;
};

export const isRunStateSaveable = (gameState: GameState, combatState: CombatState): boolean => {
  if (gameState === 'MENU' || gameState === 'WIN' || gameState === 'LOSE') return false;
  if (gameState !== 'PLAYING') return true;
  return combatState.phase === 'PLAYER_ACTION';
};

export const createSavedRunSummary = (saveData: SavedRunData): SavedRunSummary => ({
  savedAt: saveData.savedAt,
  act: saveData.act,
  floor: saveData.floor,
  gameState: saveData.gameState,
  hp: saveData.player.hp,
  maxHp: saveData.player.maxHp,
  gold: saveData.player.gold
});

export const loadSavedRun = (): SavedRunData | null => {
  const migrated = migrateRunSave(parseStoredJson(RUN_SAVE_KEY));
  if (!migrated) return null;

  if (storageAvailable()) {
    window.localStorage.setItem(RUN_SAVE_KEY, JSON.stringify(migrated));
  }

  return migrated;
};

export const saveRun = (saveData: Omit<SavedRunData, 'version' | 'savedAt'>): SavedRunData | null => {
  if (!storageAvailable()) return null;

  const nextSave: SavedRunData = {
    ...saveData,
    version: CURRENT_RUN_SAVE_VERSION,
    savedAt: new Date().toISOString()
  };

  window.localStorage.setItem(RUN_SAVE_KEY, JSON.stringify(nextSave));
  return nextSave;
};

export const clearSavedRun = (): void => {
  if (!storageAvailable()) return;
  window.localStorage.removeItem(RUN_SAVE_KEY);
};

export const loadSavedRunSummary = (): SavedRunSummary | null => {
  const savedRun = loadSavedRun();
  return savedRun ? createSavedRunSummary(savedRun) : null;
};

const migrateSettings = (value: unknown): SavedSettingsData => {
  if (!isObjectRecord(value)) {
    return { version: CURRENT_SETTINGS_VERSION, settings: DEFAULT_GAME_SETTINGS };
  }

  const legacy = value as LegacySettingsData;
  const rawSettings = isObjectRecord(legacy.settings) ? legacy.settings as Partial<GameSettings> : legacy;

  return {
    version: CURRENT_SETTINGS_VERSION,
    settings: {
      animationsEnabled: typeof rawSettings.animationsEnabled === 'boolean'
        ? rawSettings.animationsEnabled
        : DEFAULT_GAME_SETTINGS.animationsEnabled,
      screenShake: typeof rawSettings.screenShake === 'boolean'
        ? rawSettings.screenShake
        : DEFAULT_GAME_SETTINGS.screenShake
    }
  };
};

export const loadGameSettings = (): GameSettings => {
  const migrated = migrateSettings(parseStoredJson(SETTINGS_SAVE_KEY));

  if (storageAvailable()) {
    window.localStorage.setItem(SETTINGS_SAVE_KEY, JSON.stringify(migrated));
  }

  return migrated.settings;
};

export const saveGameSettings = (settings: GameSettings): void => {
  if (!storageAvailable()) return;
  window.localStorage.setItem(SETTINGS_SAVE_KEY, JSON.stringify({
    version: CURRENT_SETTINGS_VERSION,
    settings
  }));
};
