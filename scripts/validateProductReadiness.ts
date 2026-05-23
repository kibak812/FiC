import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import {
  BOSS_REWARDS,
  CARD_ARCHETYPES,
  CARD_DATABASE,
  COMBAT_REWARD_RULES,
  ENEMIES,
  ENEMY_POOLS,
  GAME_EVENTS,
  INITIAL_DECK_IDS,
  MAP_NODE_LAYOUTS,
  SHOP_ITEMS
} from '../constants';
import { CardSprites, HAND_DRAWN_CARD_SPRITE_IDS, MonsterSprites } from '../components/PixelSprites';
import {
  CardRarity,
  CardType,
  EnemyTier,
  IntentType,
  NodeType
} from '../types';
import type {
  CardArchetypeId,
  CardData,
  EnemyData,
  EventOptionType,
  GameSettings,
  ShopItemId,
  BossRewardId
} from '../types';
import { DEFAULT_GAME_SETTINGS } from '../utils/saveUtils';

type Act = 1 | 2 | 3;
type ResultSection = {
  name: string;
  checks: number;
};

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sections: ResultSection[] = [];
const errors: string[] = [];
const warnings: string[] = [];
let activeSection: ResultSection | null = null;

const section = (name: string, validate: () => void): void => {
  const nextSection = { name, checks: 0 };
  sections.push(nextSection);
  activeSection = nextSection;
  validate();
  activeSection = null;
};

const requireReady = (condition: boolean, message: string): void => {
  if (!activeSection) throw new Error('Readiness check executed outside a section');
  activeSection.checks++;
  if (!condition) errors.push(`[${activeSection.name}] ${message}`);
};

const warnReady = (condition: boolean, message: string): void => {
  if (!activeSection) throw new Error('Readiness warning executed outside a section');
  activeSection.checks++;
  if (!condition) warnings.push(`[${activeSection.name}] ${message}`);
};

const readText = (relativePath: string): string => {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
};

const exists = (relativePath: string): boolean => {
  return fs.existsSync(path.join(repoRoot, relativePath));
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const readJsonRecord = (relativePath: string): Record<string, unknown> => {
  const parsed = JSON.parse(readText(relativePath)) as unknown;
  return isRecord(parsed) ? parsed : {};
};

const valuesEqual = <T extends string>(actual: Iterable<T>, expected: Iterable<T>): boolean => {
  return [...actual].sort().join('|') === [...expected].sort().join('|');
};

const cardById = new Map<number, CardData>(CARD_DATABASE.map(card => [card.id, card]));
const acts: Act[] = [1, 2, 3];
const requiredArchetypes: CardArchetypeId[] = [
  'SELF_DAMAGE',
  'DEFENSE_CONVERSION',
  'STATUS_DAMAGE',
  'ENERGY_LOOP',
  'DRAW_LOOP',
  'HEAVY_STRIKE',
  'MULTI_HIT'
];
const playerCardRarities = new Set<CardRarity>([
  CardRarity.STARTER,
  CardRarity.COMMON,
  CardRarity.RARE,
  CardRarity.LEGEND
]);
const rewardRarities = new Set<CardRarity>([
  CardRarity.COMMON,
  CardRarity.RARE,
  CardRarity.LEGEND
]);
const handReviewedCardSpriteIds = [
  248, 249,
  212, 216, 217, 218, 220, 221, 222, 223, 224, 225,
  405, 407,
  414, 415, 416, 417, 418, 419, 420, 421, 422, 423, 424, 425
];

const getCards = (ids: number[]): CardData[] => {
  return ids.map(id => cardById.get(id)).filter((card): card is CardData => Boolean(card));
};

const missingCardIds = (ids: number[]): number[] => {
  return ids.filter(id => !cardById.has(id));
};

const hasRarity = (ids: number[], rarity: CardRarity): boolean => {
  return getCards(ids).some(card => card.rarity === rarity);
};

const allEnemyPoolEnemies = (act: Act): EnemyData[] => {
  return [
    ...ENEMY_POOLS[act][EnemyTier.COMMON],
    ...ENEMY_POOLS[act][EnemyTier.ELITE],
    ...ENEMY_POOLS[act][EnemyTier.BOSS]
  ];
};

const countSpriteRects = (cardId: number): number => {
  const Sprite = CardSprites[cardId];
  if (!Sprite) return 0;
  return renderToStaticMarkup(React.createElement(Sprite)).match(/<rect\b/g)?.length || 0;
};

const countSpriteFillColors = (cardId: number): number => {
  const Sprite = CardSprites[cardId];
  if (!Sprite) return 0;
  const markup = renderToStaticMarkup(React.createElement(Sprite));
  return new Set([...markup.matchAll(/fill="([^"]+)"/g)].map(match => match[1])).size;
};

const hasEnemyFamily = (enemies: EnemyData[], family: string): boolean => {
  return enemies.some(enemy => enemy.intents.some(intent => {
    if (family === 'statusCounter') return intent.effect?.type === 'CLEANSE_STATUSES_GAIN_STRENGTH';
    if (family === 'defenseCounter') return intent.effect?.type === 'ATTACK_FROM_PLAYER_BLOCK';
    if (family === 'multiHitPressure') return (intent.hits || 1) > 1 || intent.description.includes('(x3)');
    if (family === 'costPressure') {
      return intent.effect?.type === 'SET_PLAYER_COST_LIMIT' ||
        intent.effect?.type === 'INCREASE_RANDOM_HANDLE_COST' ||
        (enemy.id === 'hammerhead' && intent.type === IntentType.DEBUFF);
    }
    if (family === 'deckPollution') {
      return intent.effect?.type === 'ADD_JUNK' ||
        (intent.type === IntentType.DEBUFF && !intent.effect && enemy.id !== 'hammerhead' && enemy.id !== 'deus_ex_machina');
    }
    return false;
  }));
};

section('Card pool and archetypes', () => {
  const cardIds = CARD_DATABASE.map(card => card.id);
  const cardNames = CARD_DATABASE.map(card => card.name);
  const playerCards = CARD_DATABASE.filter(card => playerCardRarities.has(card.rarity));
  const rewardCards = CARD_DATABASE.filter(card => rewardRarities.has(card.rarity));

  requireReady(new Set(cardIds).size === cardIds.length, 'Card ids must be unique.');
  requireReady(new Set(cardNames).size === cardNames.length, 'Card names must be unique.');
  requireReady(playerCards.length >= 120 && playerCards.length <= 160, `Playable card pool should be 120-160 cards, got ${playerCards.length}.`);
  requireReady(rewardCards.length >= 100, `Rewardable common/rare/legend pool should have at least 100 cards, got ${rewardCards.length}.`);
  requireReady(playerCards.every(card => card.type !== CardType.JUNK), 'Playable pool should not count junk cards.');
  requireReady(INITIAL_DECK_IDS.every(id => playerCardRarities.has(cardById.get(id)?.rarity || CardRarity.JUNK)), 'Initial deck should only use playable starter cards.');

  for (const type of [CardType.HANDLE, CardType.HEAD, CardType.DECO]) {
    requireReady(playerCards.some(card => card.type === type), `Playable pool should include ${type} cards.`);
  }

  requireReady(CARD_ARCHETYPES.length >= 6, `At least 6 build axes are required, got ${CARD_ARCHETYPES.length}.`);
  requireReady(valuesEqual(CARD_ARCHETYPES.map(archetype => archetype.id), requiredArchetypes), 'Required archetype ids should be present exactly once.');

  for (const archetype of CARD_ARCHETYPES) {
    const linkedIds = [
      ...archetype.entryCardIds,
      ...archetype.midCardIds,
      ...archetype.lateCardIds,
      ...archetype.slotCardIds[CardType.HANDLE],
      ...archetype.slotCardIds[CardType.HEAD],
      ...archetype.slotCardIds[CardType.DECO]
    ];
    const missingIds = missingCardIds(linkedIds);

    requireReady(missingIds.length === 0, `${archetype.name} references missing cards: ${missingIds.join(', ') || 'none'}.`);
    requireReady(archetype.entryCardIds.length > 0, `${archetype.name} needs entry cards.`);
    requireReady(archetype.midCardIds.length > 0, `${archetype.name} needs midgame cards.`);
    requireReady(archetype.lateCardIds.length > 0, `${archetype.name} needs lategame reward cards.`);
    requireReady(hasRarity(linkedIds, CardRarity.COMMON), `${archetype.name} needs at least one common card.`);
    requireReady(hasRarity(linkedIds, CardRarity.RARE), `${archetype.name} needs at least one rare card.`);
    requireReady(hasRarity(linkedIds, CardRarity.LEGEND), `${archetype.name} needs at least one legendary card.`);
    requireReady(hasRarity(archetype.entryCardIds, CardRarity.COMMON), `${archetype.name} entry should include common access.`);
    requireReady(hasRarity(archetype.midCardIds, CardRarity.RARE), `${archetype.name} midgame should include rare reinforcement.`);
    requireReady(hasRarity(archetype.lateCardIds, CardRarity.LEGEND), `${archetype.name} lategame should include a legendary payoff.`);
    requireReady(archetype.slotCardIds[CardType.HANDLE].length > 0, `${archetype.name} needs handle links.`);
    requireReady(archetype.slotCardIds[CardType.HEAD].length > 0, `${archetype.name} needs head links.`);
    requireReady(archetype.slotCardIds[CardType.DECO].length > 0, `${archetype.name} needs deco links.`);
  }
});

section('Card and enemy pixel art', () => {
  const pixelSource = readText('components/PixelSprites.tsx');
  const generatedFrameSource = pixelSource.slice(
    pixelSource.indexOf('const renderGeneratedFrame'),
    pixelSource.indexOf('const renderHandleSilhouette')
  );
  const generatedSpriteSource = pixelSource.slice(
    pixelSource.indexOf('const generatedCardSprite'),
    pixelSource.indexOf('export const HAND_DRAWN_CARD_SPRITE_IDS')
  );
  const handleMotifIndex = generatedSpriteSource.indexOf("kind === 'handle' && renderGeneratedCardMotif");
  const handleSilhouetteIndex = generatedSpriteSource.indexOf("kind === 'handle' && renderHandleSilhouette");
  const playerCards = CARD_DATABASE.filter(card => playerCardRarities.has(card.rarity));
  const missingCardSpriteIds = playerCards
    .filter(card => !CardSprites[card.id])
    .map(card => `${card.id}:${card.name}`);
  const missingHandReviewedSprites = handReviewedCardSpriteIds
    .filter(id => !HAND_DRAWN_CARD_SPRITE_IDS.has(id))
    .map(id => `${id}:${cardById.get(id)?.name || 'unknown'}`);
  const underDetailedHandReviewedSprites = handReviewedCardSpriteIds
    .filter(id => countSpriteRects(id) < 18 || countSpriteFillColors(id) < 8)
    .map(id => `${id}:${cardById.get(id)?.name || 'unknown'}`);
  const missingEnemySpriteIds = Object.values(ENEMIES)
    .filter(enemy => !MonsterSprites[enemy.id])
    .map(enemy => `${enemy.id}:${enemy.name}`);

  requireReady(missingCardSpriteIds.length === 0, `Every playable card needs a dedicated pixel sprite. Missing: ${missingCardSpriteIds.join(', ') || 'none'}.`);
  requireReady(missingHandReviewedSprites.length === 0, `Recently added cards need hand-reviewed pixel sprites. Missing: ${missingHandReviewedSprites.join(', ') || 'none'}.`);
  requireReady(underDetailedHandReviewedSprites.length === 0, `Hand-reviewed card sprites need enough pixel detail and color separation. Under-detailed: ${underDetailedHandReviewedSprites.join(', ') || 'none'}.`);
  requireReady(!/width="20" height="20"/.test(generatedFrameSource), 'Generated card sprites should avoid full square panel backgrounds that obscure item silhouettes.');
  requireReady(handleMotifIndex >= 0 && handleMotifIndex < handleSilhouetteIndex, 'Generated handle motifs should render behind the grip silhouette so handles read as handles.');
  requireReady(missingEnemySpriteIds.length === 0, `Every enemy needs a dedicated pixel sprite. Missing: ${missingEnemySpriteIds.join(', ') || 'none'}.`);
});

section('Enemy roster and patterns', () => {
  const enemies = Object.values(ENEMIES);
  const enemyIds = enemies.map(enemy => enemy.id);
  const staticEnemyObjects = new Set(enemies);
  const requiredFamilies = ['statusCounter', 'defenseCounter', 'multiHitPressure', 'costPressure', 'deckPollution'];

  requireReady(enemies.length >= 35 && enemies.length <= 45, `Enemy roster should be 35-45 enemies, got ${enemies.length}.`);
  requireReady(new Set(enemyIds).size === enemyIds.length, 'Enemy ids must be unique.');
  requireReady(enemies.every(enemy => enemy.name.length > 0 && enemy.intents.length >= 2), 'Every enemy should have a name and at least two intents.');

  for (const act of acts) {
    const common = ENEMY_POOLS[act][EnemyTier.COMMON];
    const elite = ENEMY_POOLS[act][EnemyTier.ELITE];
    const boss = ENEMY_POOLS[act][EnemyTier.BOSS];
    const actEnemies = allEnemyPoolEnemies(act);

    requireReady(common.length >= 6, `Act ${act} needs at least 6 common enemies.`);
    requireReady(elite.length >= 3, `Act ${act} needs at least 3 elite enemies.`);
    requireReady(boss.length >= 2, `Act ${act} needs at least 2 boss candidates.`);
    requireReady(new Set(actEnemies.map(enemy => enemy.id)).size === actEnemies.length, `Act ${act} enemy pool should not repeat candidates.`);
    requireReady(common.every(enemy => enemy.tier === EnemyTier.COMMON), `Act ${act} common pool should only use common enemies.`);
    requireReady(elite.every(enemy => enemy.tier === EnemyTier.ELITE), `Act ${act} elite pool should only use elite enemies.`);
    requireReady(boss.every(enemy => enemy.tier === EnemyTier.BOSS), `Act ${act} boss pool should only use boss enemies.`);
    requireReady(actEnemies.every(enemy => staticEnemyObjects.has(enemy)), `Act ${act} pools must only reference static ENEMIES entries.`);

    for (const family of requiredFamilies) {
      requireReady(hasEnemyFamily(actEnemies, family), `Act ${act} should include ${family}.`);
    }
  }
});

section('Map, rewards, shops, and events', () => {
  const requiredNodeTypes = [NodeType.COMBAT, NodeType.ELITE, NodeType.REST, NodeType.SHOP, NodeType.EVENT, NodeType.BOSS];
  const rewardIds = Object.keys(COMBAT_REWARD_RULES);
  const shopIds = SHOP_ITEMS.map(item => item.id);
  const bossRewardIds = BOSS_REWARDS.map(reward => reward.id);
  const validEventTypes: EventOptionType[] = ['HEAL', 'DAMAGE', 'GAIN_CARD_RARE', 'REMOVE_CARD', 'GAIN_GOLD', 'LOSE_GOLD', 'FULL_HEAL', 'RANDOM_UPGRADE', 'LEAVE'];
  const validShopIds: ShopItemId[] = ['REMOVE', 'HEAL', 'RARE', 'ENERGY'];
  const validBossRewardIds: BossRewardId[] = ['ENERGY', 'MAX_HP', 'GOLD'];

  for (const act of acts) {
    const rows = MAP_NODE_LAYOUTS[act];
    const nodeTypes = new Set(rows.flat());

    requireReady(rows.length === 15, `Act ${act} should have 15 map rows.`);
    requireReady(rows[rows.length - 1]?.length === 1 && rows[rows.length - 1]?.[0] === NodeType.BOSS, `Act ${act} final row should be a single boss node.`);
    for (const nodeType of requiredNodeTypes) {
      requireReady(nodeTypes.has(nodeType), `Act ${act} map should include ${nodeType}.`);
    }
  }

  requireReady(valuesEqual(rewardIds, ['COMMON', 'ELITE', 'BOSS']), 'Combat reward rules should cover common, elite, and boss tiers.');
  requireReady(Object.values(COMBAT_REWARD_RULES).every(rule => rule.gold.min > 0 && rule.gold.max >= rule.gold.min && rule.cardOptionCount >= 3), 'Combat reward rules should have valid gold ranges and card options.');
  requireReady(valuesEqual(shopIds, validShopIds), 'Shop items should expose remove, heal, rare card, and energy choices.');
  requireReady(SHOP_ITEMS.every(item => item.price > 0 && item.name.length > 0 && item.description.length > 0), 'Shop items need positive prices and display copy.');
  requireReady(valuesEqual(bossRewardIds, validBossRewardIds), 'Boss rewards should expose energy, max HP, and gold choices.');
  requireReady(BOSS_REWARDS.every(reward => reward.name.length > 0 && reward.description.length > 0 && reward.feedback.length > 0), 'Boss rewards need display copy and feedback.');

  requireReady(GAME_EVENTS.length >= 6, `Event pool should have at least 6 static events, got ${GAME_EVENTS.length}.`);
  requireReady(new Set(GAME_EVENTS.map(event => event.id)).size === GAME_EVENTS.length, 'Event ids must be unique.');
  for (const event of GAME_EVENTS) {
    requireReady(event.title.length > 0 && event.description.length > 0 && event.icon.length > 0, `${event.id} needs title, description, and icon.`);
    requireReady(event.options.length >= 2, `${event.id} should offer at least two choices.`);
    requireReady(event.options.some(option => option.type === 'LEAVE'), `${event.id} should include a leave option.`);
    for (const option of event.options) {
      requireReady(option.label.length > 0 && option.description.length > 0, `${event.id} options need labels and descriptions.`);
      requireReady(validEventTypes.includes(option.type), `${event.id} has unsupported option type ${option.type}.`);
      if (option.cost !== undefined) {
        requireReady(option.cost > 0 && Boolean(option.costResource), `${event.id} option costs need positive values and resources.`);
      }
    }
  }

  const mapSource = readText('utils/mapUtils.ts');
  const appSource = readText('App.tsx');
  requireReady(mapSource.includes('GAME_EVENTS') && mapSource.includes('eventId'), 'Map generation should attach static GAME_EVENTS to event nodes.');
  requireReady(appSource.includes('handleEventOption') && appSource.includes('currentEvent'), 'App should route event nodes into playable event handling.');
});

section('Save, onboarding, and packaging', () => {
  const saveSource = readText('utils/saveUtils.ts');
  const cardUtilsSource = readText('utils/cardUtils.ts');
  const appSource = readText('App.tsx');
  const menuSource = readText('screens/MenuScreen.tsx');
  const gameOverSource = readText('screens/GameOverScreen.tsx');
  const learningFeedbackSource = readText('utils/learningFeedback.ts');
  const simSource = readText('scripts/simulateRuns.ts');
  const playerSource = readText('utils/playerUtils.ts');
  const packageJson = readJsonRecord('package.json');
  const dependencies = isRecord(packageJson.dependencies) ? packageJson.dependencies : {};
  const devDependencies = isRecord(packageJson.devDependencies) ? packageJson.devDependencies : {};
  const requiredSettings: Array<keyof GameSettings> = [
    'animationsEnabled',
    'screenShake',
    'tutorialCompleted',
    'soundEnabled',
    'musicEnabled',
    'masterVolume',
    'sfxVolume',
    'musicVolume',
    'reduceMotion',
    'highContrast',
    'largeText'
  ];

  for (const key of requiredSettings) {
    requireReady(Object.prototype.hasOwnProperty.call(DEFAULT_GAME_SETTINGS, key), `Default settings should include ${key}.`);
  }
  requireReady(DEFAULT_GAME_SETTINGS.masterVolume >= 0 && DEFAULT_GAME_SETTINGS.masterVolume <= 1, 'Master volume should default inside 0-1.');
  requireReady(DEFAULT_GAME_SETTINGS.sfxVolume >= 0 && DEFAULT_GAME_SETTINGS.sfxVolume <= 1, 'SFX volume should default inside 0-1.');
  requireReady(DEFAULT_GAME_SETTINGS.musicVolume >= 0 && DEFAULT_GAME_SETTINGS.musicVolume <= 1, 'Music volume should default inside 0-1.');
  requireReady(saveSource.includes('CURRENT_RUN_SAVE_VERSION') && saveSource.includes('CURRENT_SETTINGS_VERSION'), 'Save and settings data should be versioned.');
  requireReady(saveSource.includes('migrateRunSave') && saveSource.includes('migrateSettings'), 'Save and settings migration helpers should exist.');
  requireReady(cardUtilsSource.includes('resetTemporaryDeckModifiers') && appSource.includes('resetTemporaryDeckModifiers(cleanJunkFromDeck(allCards))'), 'Combat cleanup should restore temporary card debuffs before the next fight.');
  requireReady(saveSource.includes('resetTemporaryDeckModifiers') && simSource.includes('cleanupCombatCards'), 'Save migration and seeded simulation should also clear combat-only card debuffs.');
  requireReady(playerSource.includes('INITIAL_PLAYER_MAX_HP = 80') && playerSource.includes('INITIAL_PLAYER_MAX_ENERGY = 4'), 'Initial player stats should match the tuned commercial baseline.');
  requireReady(appSource.includes('createInitialPlayerStats') && simSource.includes('createInitialPlayerStats'), 'Runtime and seeded simulation should share initial player stats.');
  requireReady(appSource.includes('saveRun({') && appSource.includes('loadSavedRun()') && appSource.includes('clearSavedRun()'), 'App should autosave, continue, and clear runs.');
  requireReady(menuSource.includes('confirmStartGame') && menuSource.includes('새 런 시작'), 'Menu should confirm new run start when a save exists.');

  requireReady(exists('components/TutorialOverlay.tsx'), 'First combat tutorial component should exist.');
  requireReady(exists('components/CombatHelpModal.tsx'), 'Combat help and card type dictionary should exist.');
  requireReady(exists('components/StatusDetailModal.tsx'), 'Status effect dictionary modal should exist.');
  requireReady(exists('screens/GameOverScreen.tsx'), 'Failure feedback screen should exist.');
  requireReady(learningFeedbackSource.includes('createRunLearningFeedback') && learningFeedbackSource.includes('DECK_POLLUTION') && learningFeedbackSource.includes('ENERGY_PRESSURE'), 'Failure feedback should classify concrete run lessons from the final run state.');
  requireReady(appSource.includes('learningSnapshot') && gameOverSource.includes('createRunLearningFeedback'), 'Game over screen should receive and render state-aware learning feedback.');

  requireReady(exists('hooks/useAudioEngine.ts'), 'Procedural sound/music engine should exist.');
  requireReady(Boolean(dependencies['@fontsource/press-start-2p']) && Boolean(dependencies.galmuri), 'Offline pixel font dependencies should be bundled.');
  requireReady(Boolean(devDependencies.tailwindcss) && Boolean(devDependencies.postcss) && Boolean(devDependencies.autoprefixer), 'Local Tailwind/PostCSS build dependencies should exist.');
  requireReady(exists('docs/release.md'), 'Store release checklist should exist.');

  for (const runtimeFile of ['index.html', 'styles.css', 'tailwind.config.cjs']) {
    requireReady(!/\bhttps?:\/\//.test(readText(runtimeFile)), `${runtimeFile} should not reference remote runtime URLs.`);
  }
});

section('Validation and CI gates', () => {
  const packageJson = readJsonRecord('package.json');
  const scripts = isRecord(packageJson.scripts) ? packageJson.scripts : {};
  const ciSource = readText('.github/workflows/ci.yml');
  const combatEngineSource = readText('utils/combatEngine.ts');
  const rewardUtilsSource = readText('utils/rewardUtils.ts');
  const eventUtilsSource = readText('utils/eventUtils.ts');
  const appSource = readText('App.tsx');
  const simSource = readText('scripts/simulateRuns.ts');

  requireReady(exists('scripts/validateBalance.ts'), 'Balance validator script should exist.');
  requireReady(exists('scripts/testCore.ts'), 'Core combat and static data tests should exist.');
  requireReady(exists('scripts/simulateRuns.ts'), 'Seeded run simulation should exist.');
  requireReady(exists('tests/e2e/run-smoke.spec.ts'), 'Main UI e2e smoke test should exist.');
  requireReady(combatEngineSource.includes('applyCombatEffectActions') && combatEngineSource.includes('CombatEffectSideEffect'), 'Combat engine should expose a UI-free effect action reducer and explicit deck side effects.');
  requireReady(combatEngineSource.includes('resolveEnemyTurn') && combatEngineSource.includes('EnemyTurnSideEffect'), 'Combat engine should expose UI-free enemy turn resolution with explicit deck side effects.');
  requireReady(combatEngineSource.includes('resolvePlayerWeaponAttack') && combatEngineSource.includes('PlayerWeaponHitEvent'), 'Combat engine should expose UI-free player weapon hit resolution with inspectable hit events.');
  requireReady(appSource.includes('resolveEnemyTurn(enemy, player)'), 'Runtime combat should use shared enemy turn resolution instead of duplicating enemy turn calculations in App.');
  requireReady(appSource.includes('resolvePlayerWeaponAttack({'), 'Runtime combat should use shared player weapon attack resolution instead of duplicating hit calculations in App.');
  requireReady(rewardUtilsSource.includes('createCombatRewardBundle') && rewardUtilsSource.includes('resolveShopPurchase') && rewardUtilsSource.includes('resolveBossReward'), 'Reward utilities should expose UI-free combat reward, shop, and boss reward resolution.');
  requireReady(appSource.includes('createCombatRewardBundle(enemy.tier)') && appSource.includes('resolveShopPurchase(player, itemId)') && appSource.includes('resolveBossReward(player, rewardId'), 'Runtime reward, shop, and boss reward flows should use shared static-data resolvers.');
  requireReady(simSource.includes('createCombatRewardBundle(enemyTier') && simSource.includes('resolveShopPurchase(state.player') && simSource.includes('resolveBossReward(state.player'), 'Seeded simulation should use the same reward, shop, and boss reward resolvers as runtime.');
  requireReady(eventUtilsSource.includes('resolveEventOption') && eventUtilsSource.includes('resolveEventCardRemoval') && eventUtilsSource.includes('canPayEventOption'), 'Event utilities should expose UI-free GAME_EVENTS option resolution and removal handling.');
  requireReady(appSource.includes('resolveEventOption(player, deck, option)') && appSource.includes('resolveEventCardRemoval(player, deck'), 'Runtime events should use shared static-data event resolvers.');
  requireReady(simSource.includes('resolveEventOption(state.player, state.deck, option') && simSource.includes('canPayEventOption(state.player, option)'), 'Seeded simulation should use the same static event option resolver as runtime.');
  requireReady(typeof scripts['test:balance'] === 'string', 'package.json should expose test:balance.');
  requireReady(typeof scripts['test:logic'] === 'string' && String(scripts['test:logic']).includes('simulateRuns.ts'), 'package.json should expose logic tests with seeded simulation.');
  requireReady(typeof scripts['test:e2e'] === 'string', 'package.json should expose e2e tests.');
  requireReady(typeof scripts['test:readiness'] === 'string', 'package.json should expose product readiness validation.');
  requireReady(ciSource.includes('npm run test:balance'), 'CI should run balance validation.');
  requireReady(ciSource.includes('npm run test:readiness'), 'CI should run product readiness validation.');
  requireReady(ciSource.includes('npm run test:logic'), 'CI should run logic and simulation tests.');
  requireReady(ciSource.includes('npm run test:e2e'), 'CI should run UI e2e tests.');
  requireReady(ciSource.includes('npm audit --audit-level=moderate'), 'CI should run a moderate-or-higher security audit.');

  warnReady(readText('scripts/simulateRuns.ts').includes('1000'), 'Seeded simulation script should keep the 1000-run target visible.');
  requireReady(readText('scripts/simulateRuns.ts').includes('SIM_MIN_WIN_RATE'), 'Seeded simulation should enforce a minimum win-rate sanity gate.');
});

const totalChecks = sections.reduce((sum, item) => sum + item.checks, 0);

console.log('\nFiC Product Readiness Validation');
console.log('--------------------------------');
for (const item of sections) {
  console.log(`${item.name}: ${item.checks} checks`);
}
console.log(`Total checks: ${totalChecks}`);

if (warnings.length > 0) {
  console.log('\nWarnings:');
  for (const warning of warnings) console.log(`- ${warning}`);
}

if (errors.length > 0) {
  console.log('\nErrors:');
  for (const error of errors) console.log(`- ${error}`);
  process.exit(1);
}

console.log('\nProduct readiness gate passed.');
process.exit(0);
