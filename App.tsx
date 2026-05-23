import React, { useState, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';
import { 
  CardInstance, CardType, CombatState, PlayerStats, EnemyData, 
  IntentType, EnemyTrait, EnemyTier, BossRewardId, ShopItemId,
  GameEvent, EventOption, CardRarity, MapNode, NodeType, GameState, RemovalContext, GameSettings
} from './types';
import { INITIAL_DECK_IDS, ENEMIES, GAME_EVENTS } from './constants';
import CardComponent from './components/CardComponent';
import Anvil from './components/Anvil';

// --- Utilities ---
import { createCardInstance, shuffle } from './utils/cardUtils';
import {
  createCombatCardRewards,
  createRandomCardReward,
  getBossRewardDefinition,
  getCombatRewardRule,
  getShopItemDefinition,
  rollGoldReward
} from './utils/rewardUtils';
import { createActMap, getAvailableMapNodeIds } from './utils/mapUtils';
import {
  CardEffectContext, EffectModifiers, EffectAction,
  executeEffectsForPhase, applyModifierActions,
  isExhaustCard, isInfiniteLoopCard, isTwinHandle
} from './utils/cardEffects';
import {
  clearSavedRun,
  loadGameSettings,
  loadSavedRun,
  loadSavedRunSummary,
  saveGameSettings,
  saveRun,
  isRunStateSaveable
} from './utils/saveUtils';
import type { SavedRunData, SavedRunSummary } from './utils/saveUtils';
import {
  calculateBlockedDamage,
  calculateEnemyIntentPlan,
  calculateEnemyStrengthGain,
  calculateWeaponStats,
  resolveEnemyTurnStartStatuses
} from './utils/combatEngine';

// --- Hooks ---
import { useAnimations } from './hooks/useAnimations';
import { useToast } from './hooks/useToast';

// --- Screens ---
import MenuScreen from './screens/MenuScreen';
import GameOverScreen from './screens/GameOverScreen';
import BossRewardScreen from './screens/BossRewardScreen';
import RewardScreen from './screens/RewardScreen';
import ShopScreen from './screens/ShopScreen';
import RestScreen from './screens/RestScreen';
import RemoveCardScreen from './screens/RemoveCardScreen';
import EventScreen from './screens/EventScreen';
import MapScreen from './screens/MapScreen';
import DeckHUD from './components/DeckHUD';
import PlayerHUD from './components/PlayerHUD';
import EnemySection from './components/EnemySection';
import IntentDetailModal from './components/IntentDetailModal';
import StatusDetailModal from './components/StatusDetailModal';
import CombatHelpModal from './components/CombatHelpModal';
import TutorialOverlay, { TUTORIAL_STEP_COUNT } from './components/TutorialOverlay';

// --- Main App ---

export default function App() {
  // Game State
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [savedRunSummary, setSavedRunSummary] = useState<SavedRunSummary | null>(() => loadSavedRunSummary());
  const [settings, setSettings] = useState<GameSettings>(() => loadGameSettings());
  const [floor, setFloor] = useState(0);
  const [act, setAct] = useState(1);
  const [hasRested, setHasRested] = useState(false); // New state to track if player used Heal/Smelt this rest
  const [acquiredCard, setAcquiredCard] = useState<CardInstance | null>(null); // New state for Shop feedback
  
  // Entities
const [player, setPlayer] = useState<PlayerStats>({
    hp: 50, maxHp: 50, energy: 3, maxEnergy: 3, block: 0, gold: 0, costLimit: null, disarmed: false, nextTurnDraw: 0, overheat: 0, weaponsUsedThisTurn: 0, dodgeNextAttack: false, selfDamageThisTurn: 0
  });
  
  const [enemy, setEnemy] = useState<EnemyData>(JSON.parse(JSON.stringify(ENEMIES.RUST_SLIME))); // Init with weak enemy

  // Deck State
  const [deck, setDeck] = useState<CardInstance[]>([]);
  const [hand, setHand] = useState<CardInstance[]>([]);
  const [discardPile, setDiscardPile] = useState<CardInstance[]>([]);
  
  // Reward & Interaction State
  const [rewardOptions, setRewardOptions] = useState<CardInstance[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null); // For removal/selection
  const [removalContext, setRemovalContext] = useState<RemovalContext>(null);
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [pendingEventRemovalOption, setPendingEventRemovalOption] = useState<EventOption | null>(null);
  const [mapNodes, setMapNodes] = useState<MapNode[]>([]);
  const [currentMapNodeId, setCurrentMapNodeId] = useState<string | null>(null);
  const [completedMapNodeIds, setCompletedMapNodeIds] = useState<string[]>([]);
  const [activeMapNode, setActiveMapNode] = useState<MapNode | null>(null);

  // Crafting Slots
  const [slots, setSlots] = useState<{
    handle: CardInstance | null;
    head: CardInstance | null;
    deco: CardInstance | null;
  }>({ handle: null, head: null, deco: null });

  // Combat Flow
  const [combatState, setCombatState] = useState<CombatState>({
    turn: 1,
    phase: 'PLAYER_DRAW'
  });

// Visuals - Animation hook
  const [animations, animationTriggers] = useAnimations();
  
  // Toast messages - using useToast hook
  const { showFeedback, currentGoodToast, currentBadToast } = useToast();
  
  const [discardingCardIds, setDiscardingCardIds] = useState<Set<string>>(new Set());

  // Balance Patch v1.0 - New card states
  const [growingCrystalBonus, setGrowingCrystalBonus] = useState(0); // 407: Permanent damage bonus per combat
  const [infiniteLoopUsed, setInfiniteLoopUsed] = useState(false); // 405: Once per turn
  const [isResolvingAction, setIsResolvingAction] = useState(false);

  // Intent detail modal (long-press on mobile)
  const [showIntentDetail, setShowIntentDetail] = useState(false);

  // Status effect detail modal
  const [showStatusDetail, setShowStatusDetail] = useState<string | null>(null); // Status key or null
  const [showCombatHelp, setShowCombatHelp] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  // --- Touch Drag State ---
  const [dragState, setDragState] = useState<{
    card: CardInstance;
    x: number;
    y: number;
    startX: number;
    startY: number;
  } | null>(null);

// --- Helpers ---

  // Animation triggers extracted from useAnimations hook
  const { 
    triggerShake, 
    triggerShieldEffect, 
    triggerPlayerHit, 
    triggerEnemyPoison, 
    triggerEnemyBurn, 
    triggerEnemyBleed, 
    triggerPlayerHeal, 
    triggerPlayerBlock, 
    triggerEnemyAttack 
  } = animationTriggers;

  // Animation states extracted from useAnimations hook
  const { 
    shake, 
    shieldEffect, 
    playerHit, 
    enemyPoisoned, 
    enemyBurning, 
    enemyBleeding, 
    playerHealing, 
    playerBlocking, 
    enemyAttacking 
  } = animations;

  // Helper to gather all cards and strip junk
  const cleanAndConsolidateDeck = () => {
    const allCards = [
        ...deck, 
        ...hand, 
        ...discardPile, 
        slots.handle, 
        slots.head, 
        slots.deco
    ].filter(Boolean) as CardInstance[];

    // Remove JUNK immediately
    const cleanCards = allCards.filter(c => c.type !== CardType.JUNK);
    
    setDeck(cleanCards);
    setHand([]);
    setDiscardPile([]);
    setSlots({ handle: null, head: null, deco: null });
    
    return cleanCards;
  };

  const applySavedRun = (savedRun: SavedRunData) => {
    setGameState(savedRun.gameState);
    setFloor(savedRun.floor);
    setAct(savedRun.act);
    setHasRested(savedRun.hasRested);
    setPlayer(savedRun.player);
    setEnemy(savedRun.enemy);
    setDeck(savedRun.deck);
    setHand(savedRun.hand);
    setDiscardPile(savedRun.discardPile);
    setRewardOptions(savedRun.rewardOptions);
    setSelectedCardId(savedRun.selectedCardId);
    setRemovalContext(savedRun.removalContext);
    setCurrentEvent(savedRun.currentEvent);
    setPendingEventRemovalOption(savedRun.pendingEventRemovalOption);
    setMapNodes(savedRun.mapNodes);
    setCurrentMapNodeId(savedRun.currentMapNodeId);
    setCompletedMapNodeIds(savedRun.completedMapNodeIds);
    setActiveMapNode(savedRun.activeMapNode);
    setSlots(savedRun.slots);
    setCombatState(savedRun.combatState);
    setGrowingCrystalBonus(savedRun.growingCrystalBonus);
    setInfiniteLoopUsed(savedRun.infiniteLoopUsed);
    setIsResolvingAction(false);
    setAcquiredCard(null);
    setDiscardingCardIds(new Set());
    setShowIntentDetail(false);
    setShowStatusDetail(null);
    setDragState(null);
  };

  // --- Progression Logic (Replaces Map) ---

const startCombat = (enemyData: EnemyData) => {
    // Reset Enemy Block to 0
    setEnemy({ ...enemyData, block: 0 });
    setDeck(prev => shuffle(prev));
    setHand([]);
    setDiscardPile([]);
    setSlots({ handle: null, head: null, deco: null });
    setPlayer(prev => ({...prev, energy: prev.maxEnergy, block: 0, costLimit: null, disarmed: false, nextTurnDraw: 0, overheat: 0, weaponsUsedThisTurn: 0, dodgeNextAttack: false, selfDamageThisTurn: 0}));
    setGameState('PLAYING');
    setCombatState({ turn: 1, phase: 'PLAYER_DRAW' });
    // Reset combat-specific states
    setGrowingCrystalBonus(0);
    setInfiniteLoopUsed(false);
    setIsResolvingAction(false);
  };

  const startEvent = (eventId?: string) => {
      const event = GAME_EVENTS.find(candidate => candidate.id === eventId) ||
        GAME_EVENTS[Math.floor(Math.random() * GAME_EVENTS.length)];
      setCurrentEvent(event);
      setSelectedCardId(null);
      setPendingEventRemovalOption(null);
      setGameState('EVENT');
  };

  const completeActiveMapNode = () => {
      if (!activeMapNode) {
          setGameState('MAP');
          return;
      }

      setCompletedMapNodeIds(prev => prev.includes(activeMapNode.id) ? prev : [...prev, activeMapNode.id]);
      setCurrentMapNodeId(activeMapNode.id);
      setActiveMapNode(null);
      setGameState('MAP');
  };

  const startNextActMap = () => {
      const nextAct = (act + 1) as 1 | 2 | 3;
      setAct(nextAct);
      setFloor(0);
      setMapNodes(createActMap(nextAct));
      setCurrentMapNodeId(null);
      setCompletedMapNodeIds([]);
      setActiveMapNode(null);
      setHasRested(false);
      showFeedback(`ACT ${nextAct} 시작!`);
      setGameState('MAP');
  };

  const handleSelectMapNode = (node: MapNode) => {
      const availableNodeIds = getAvailableMapNodeIds(mapNodes, currentMapNodeId);
      if (!availableNodeIds.includes(node.id)) {
          showFeedback("아직 갈 수 없는 경로입니다.");
          return;
      }

      setActiveMapNode(node);
      setAct(node.act);
      setFloor(node.floor);
      setHasRested(false);

      if (node.type === NodeType.COMBAT || node.type === NodeType.ELITE || node.type === NodeType.BOSS) {
          const enemyData = node.enemyId ? Object.values(ENEMIES).find(candidate => candidate.id === node.enemyId) : null;
          if (!enemyData) {
              throw new Error(`Map enemy ${node.enemyId} not found`);
          }
          startCombat(JSON.parse(JSON.stringify(enemyData)));
          return;
      }

      if (node.type === NodeType.EVENT) {
          startEvent(node.eventId);
          return;
      }

      if (node.type === NodeType.SHOP) {
          setGameState('SHOP');
          return;
      }

      setGameState('REST');
  };

  // --- Game Loop Methods ---

  const startGame = () => {
    const newDeck = INITIAL_DECK_IDS.map(id => createCardInstance(id));
    const firstActMap = createActMap(1);

    clearSavedRun();
    setSavedRunSummary(null);
    setDeck(shuffle(newDeck));
    setHand([]);
    setDiscardPile([]);
    setRewardOptions([]);
    setSelectedCardId(null);
    setCurrentEvent(null);
    setPendingEventRemovalOption(null);
    setRemovalContext(null);
    setMapNodes(firstActMap);
    setCurrentMapNodeId(null);
    setCompletedMapNodeIds([]);
    setActiveMapNode(null);
    setSlots({ handle: null, head: null, deco: null });
    setCombatState({ turn: 1, phase: 'PLAYER_DRAW' });
    setGrowingCrystalBonus(0);
    setInfiniteLoopUsed(false);
    setIsResolvingAction(false);
    setAcquiredCard(null);
    setDiscardingCardIds(new Set());
    
    setPlayer({ hp: 50, maxHp: 50, energy: 3, maxEnergy: 3, block: 0, gold: 0, costLimit: null, disarmed: false, nextTurnDraw: 0, overheat: 0, weaponsUsedThisTurn: 0, dodgeNextAttack: false, selfDamageThisTurn: 0 });
    
    setFloor(0);
    setAct(1);
    setHasRested(false);
    setGameState('MAP');
  };

  const continueSavedRun = () => {
      const savedRun = loadSavedRun();
      if (!savedRun) {
          setSavedRunSummary(null);
          showFeedback("이어할 저장 파일이 없습니다.");
          return;
      }

      applySavedRun(savedRun);
      setSavedRunSummary({
          savedAt: savedRun.savedAt,
          act: savedRun.act,
          floor: savedRun.floor,
          gameState: savedRun.gameState,
          hp: savedRun.player.hp,
          maxHp: savedRun.player.maxHp,
          gold: savedRun.player.gold
      });
      showFeedback("저장된 런을 불러왔습니다.");
  };

  const completeTutorial = () => {
      setTutorialStep(0);
      setSettings(prev => ({ ...prev, tutorialCompleted: true }));
  };

  const advanceTutorial = () => {
      if (tutorialStep >= TUTORIAL_STEP_COUNT - 1) {
          completeTutorial();
          return;
      }

      setTutorialStep(prev => prev + 1);
  };

  useEffect(() => {
      saveGameSettings(settings);
  }, [settings]);

  useEffect(() => {
      if (gameState === 'WIN' || gameState === 'LOSE') {
          clearSavedRun();
          setSavedRunSummary(null);
          return;
      }

      if (!isRunStateSaveable(gameState, combatState) || isResolvingAction) return;

      const savedRun = saveRun({
          gameState,
          floor,
          act,
          hasRested,
          player,
          enemy,
          deck,
          hand,
          discardPile,
          rewardOptions,
          selectedCardId,
          removalContext,
          currentEvent,
          pendingEventRemovalOption,
          mapNodes,
          currentMapNodeId,
          completedMapNodeIds,
          activeMapNode,
          slots,
          combatState,
          growingCrystalBonus,
          infiniteLoopUsed
      });

      if (savedRun) {
          setSavedRunSummary({
              savedAt: savedRun.savedAt,
              act: savedRun.act,
              floor: savedRun.floor,
              gameState: savedRun.gameState,
              hp: savedRun.player.hp,
              maxHp: savedRun.player.maxHp,
              gold: savedRun.player.gold
          });
      }
  }, [
      gameState,
      floor,
      act,
      hasRested,
      player,
      enemy,
      deck,
      hand,
      discardPile,
      rewardOptions,
      selectedCardId,
      removalContext,
      currentEvent,
      pendingEventRemovalOption,
      mapNodes,
      currentMapNodeId,
      completedMapNodeIds,
      activeMapNode,
      slots,
      combatState,
      growingCrystalBonus,
      infiniteLoopUsed,
      isResolvingAction
  ]);

  const handleWinCombat = () => {
      cleanAndConsolidateDeck();

      const rewardRule = getCombatRewardRule(enemy.tier);
      const goldReward = rollGoldReward(rewardRule);
      setPlayer(prev => ({...prev, gold: prev.gold + goldReward}));

      const options = createCombatCardRewards(rewardRule);
      showFeedback(`승리! ${goldReward} 골드 획득`);

      setRewardOptions(options);
      setGameState('REWARD');
  };

  const handleSelectReward = (card: CardInstance | null) => {
      if (card) {
          setDeck(prev => [...prev, card]);
          showFeedback(`${card.name} 획득!`);
      } else {
          showFeedback("보상 건너뛰기");
      }

      // Check if Boss was defeated
      if (enemy.tier === EnemyTier.BOSS && act < 3) {
          setGameState('BOSS_REWARD');
      } else if (enemy.tier === EnemyTier.BOSS) {
          setGameState('WIN');
      } else {
          setHasRested(false);
          completeActiveMapNode();
      }
  };

  const confirmBossReward = (rewardId: BossRewardId) => {
      const reward = getBossRewardDefinition(rewardId);

      switch (reward.effect.type) {
          case 'MAX_ENERGY':
              setPlayer(prev => ({ ...prev, maxEnergy: prev.maxEnergy + reward.effect.amount }));
              break;
          case 'MAX_HP':
              setPlayer(prev => ({
                  ...prev,
                  maxHp: prev.maxHp + reward.effect.amount,
                  hp: prev.hp + reward.effect.amount
              }));
              break;
          case 'GAIN_GOLD':
              setPlayer(prev => ({ ...prev, gold: prev.gold + reward.effect.amount }));
              break;
      }

      showFeedback(reward.feedback);
      startNextActMap();
  };


  const handleRestAction = (action: 'REPAIR' | 'SMELT' | 'SHOP') => {
      if (action === 'SHOP') {
          setGameState('SHOP');
          return;
      }
      
      // If already rested, block these actions
      if (hasRested) {
          showFeedback("이미 정비를 마쳤습니다.");
          return;
      }

      if (action === 'REPAIR') {
          const healAmount = Math.floor(player.maxHp * 0.3);
          setPlayer(prev => ({ ...prev, hp: Math.min(prev.maxHp, prev.hp + healAmount) }));
          showFeedback(`수리 완료! +${healAmount} HP`);
          setHasRested(true); // Mark as rested
      } else {
          setRemovalContext('REST');
          setSelectedCardId(null); 
          setGameState('REMOVE_CARD');
      }
  };

  // Shop Logic
  const handleShopBuy = (itemId: ShopItemId) => {
      const item = getShopItemDefinition(itemId);

      if (player.gold < item.price) {
          showFeedback("골드가 부족합니다!");
          return;
      }

      switch (item.effect.type) {
          case 'HEAL_PERCENT': {
              const { percent } = item.effect;
              setPlayer(prev => ({
                  ...prev,
                  gold: prev.gold - item.price,
                  hp: Math.min(prev.maxHp, prev.hp + Math.floor(prev.maxHp * percent))
              }));
              showFeedback("체력 회복!");
              break;
          }
          case 'REMOVE_CARD':
              setPlayer(prev => ({ ...prev, gold: prev.gold - item.price }));
              setRemovalContext('SHOP');
              setSelectedCardId(null);
              setGameState('REMOVE_CARD'); // Go to remove screen
              break;
          case 'GAIN_RANDOM_CARD': {
              const newCard = createRandomCardReward(item.effect.rarity);
              setPlayer(prev => ({ ...prev, gold: prev.gold - item.price }));
              showFeedback('희귀 설계도 획득!');
              setDeck(prev => [...prev, newCard]);
              setAcquiredCard(newCard); // Trigger Modal
              break;
          }
          case 'MAX_ENERGY': {
              const { amount } = item.effect;
              setPlayer(prev => ({
                  ...prev,
                  gold: prev.gold - item.price,
                  maxEnergy: prev.maxEnergy + amount
              }));
              showFeedback("최대 에너지 +1 증가!");
              break;
          }
      }
  };

  const handleShopExit = () => {
      if (activeMapNode?.type === NodeType.SHOP) {
          completeActiveMapNode();
          return;
      }

      setGameState('REST');
  };

  const canPayEventOption = (option: EventOption): boolean => {
      if (!option.cost || !option.costResource) return true;
      if (option.costResource === 'GOLD') return player.gold >= option.cost;
      return player.hp > option.cost;
  };

  const payEventCost = (option: EventOption) => {
      if (!option.cost || !option.costResource) return;

      if (option.costResource === 'GOLD') {
          setPlayer(prev => ({ ...prev, gold: Math.max(0, prev.gold - option.cost!) }));
      } else {
          setPlayer(prev => ({ ...prev, hp: Math.max(1, prev.hp - option.cost!) }));
          triggerPlayerHit();
      }
  };

  const finishEvent = () => {
      setCurrentEvent(null);
      setPendingEventRemovalOption(null);
      setRemovalContext(null);
      setSelectedCardId(null);
      setHasRested(false);
      completeActiveMapNode();
  };

  const upgradeRandomDeckCard = () => {
      const candidates = deck.filter(card =>
          card.rarity !== CardRarity.RARE &&
          card.rarity !== CardRarity.LEGEND &&
          card.rarity !== CardRarity.JUNK &&
          card.rarity !== CardRarity.SPECIAL
      );

      if (candidates.length === 0) {
          showFeedback("강화할 카드가 없습니다.");
          return;
      }

      const target = candidates[Math.floor(Math.random() * candidates.length)];
      const upgradedCard = {
          ...createRandomCardReward(CardRarity.RARE, target.type),
          instanceId: target.instanceId
      };

      setDeck(prev => prev.map(card => card.instanceId === target.instanceId ? upgradedCard : card));
      showFeedback(`${target.name} 강화: ${upgradedCard.name}`);
  };

  const handleEventOption = (option: EventOption) => {
      if (!canPayEventOption(option)) {
          showFeedback("조건을 충족하지 못했습니다.");
          return;
      }

      if (option.type === 'REMOVE_CARD') {
          setRemovalContext('EVENT');
          setPendingEventRemovalOption(option);
          setSelectedCardId(null);
          setGameState('REMOVE_CARD');
          return;
      }

      payEventCost(option);

      switch (option.type) {
          case 'HEAL':
              setPlayer(prev => ({ ...prev, hp: Math.min(prev.maxHp, prev.hp + (option.value || 0)) }));
              showFeedback(`체력 +${option.value || 0}`);
              break;
          case 'DAMAGE': {
              const damage = option.value || 0;
              const nextHp = player.hp - damage;
              setPlayer(prev => ({ ...prev, hp: Math.max(0, prev.hp - damage) }));
              triggerPlayerHit();
              showFeedback(`체력 -${damage}`, 'bad');
              if (nextHp <= 0) {
                  setGameState('LOSE');
                  return;
              }
              break;
          }
          case 'GAIN_CARD_RARE': {
              const newCard = createRandomCardReward(CardRarity.RARE);
              setDeck(prev => [...prev, newCard]);
              showFeedback(`${newCard.name} 획득!`);
              break;
          }
          case 'GAIN_GOLD':
              setPlayer(prev => ({ ...prev, gold: prev.gold + (option.value || 0) }));
              showFeedback(`${option.value || 0} 골드 획득`);
              break;
          case 'LOSE_GOLD':
              setPlayer(prev => ({ ...prev, gold: Math.max(0, prev.gold - (option.value || 0)) }));
              showFeedback(`${option.value || 0} 골드 상실`, 'bad');
              break;
          case 'FULL_HEAL':
              setPlayer(prev => ({ ...prev, hp: prev.maxHp }));
              showFeedback("체력 완전 회복!");
              break;
          case 'RANDOM_UPGRADE':
              upgradeRandomDeckCard();
              break;
          case 'LEAVE':
              showFeedback("아무 일도 일어나지 않았습니다.");
              break;
      }

      finishEvent();
  };

  const handleConfirmRemoval = () => {
      if (!selectedCardId) return;
      
      if (removalContext === 'EVENT' && pendingEventRemovalOption) {
          if (!canPayEventOption(pendingEventRemovalOption)) {
              showFeedback("조건을 충족하지 못했습니다.");
              return;
          }
          payEventCost(pendingEventRemovalOption);
      }

      setDeck(prev => prev.filter(c => c.instanceId !== selectedCardId));
      showFeedback("카드 제거 완료!");
      
      if (removalContext === 'REST') {
          setHasRested(true);
      }
      if (removalContext === 'EVENT') {
          finishEvent();
          return;
      }
      if (removalContext === 'SHOP' && activeMapNode?.type === NodeType.SHOP) {
          setRemovalContext(null);
          setGameState('SHOP');
          return;
      }
      setRemovalContext(null);
      setGameState('REST');
  };

  const handleCancelRemoval = () => {
      if (removalContext === 'EVENT' && currentEvent) {
          setPendingEventRemovalOption(null);
          setRemovalContext(null);
          setSelectedCardId(null);
          setGameState('EVENT');
          return;
      }
      if (removalContext === 'SHOP' && activeMapNode?.type === NodeType.SHOP) {
          setRemovalContext(null);
          setSelectedCardId(null);
          setGameState('SHOP');
          return;
      }
      setRemovalContext(null);
      setGameState('REST');
  };

  const drawCards = (count: number) => {
    let currentDeck = [...deck];
    let currentDiscard = [...discardPile];
    const drawn: CardInstance[] = [];

    for (let i = 0; i < count; i++) {
      if (currentDeck.length === 0) {
        if (currentDiscard.length === 0) break; // Empty deck
        currentDeck = shuffle(currentDiscard);
        currentDiscard = [];
      }
      const card = currentDeck.pop();
      if (card) drawn.push(card);
    }

    setDeck(currentDeck);
    setDiscardPile(currentDiscard);
    setHand(prev => [...prev, ...drawn]);
  };

  const calculateCurrentWeaponStats = () => {
    return calculateWeaponStats({
      slots,
      playerBlock: player.block,
      weaponsUsedThisTurn: player.weaponsUsedThisTurn,
      enemyStatuses: enemy.statuses,
      growingCrystalBonus
    });
  };

  // --- Interaction Handlers ---

  const handleCardMoveToSlot = (card: CardInstance, targetType?: CardType) => {
    const slotType = targetType || card.type;

    if (card.unplayable) {
        showFeedback("사용 불가 카드입니다!");
        return;
    }

    if (card.type !== slotType) {
        if (card.type !== CardType.JUNK) showFeedback("타입 불일치!");
        return;
    }
    
    if (slotType === CardType.HEAD && player.disarmed) {
        showFeedback("무장 해제됨! 머리 장착 불가");
        return;
    }

    const newSlots = { ...slots };
    let returnedCard: CardInstance | null = null;

    if (slotType === CardType.HANDLE) {
      if (newSlots.handle) returnedCard = newSlots.handle;
      newSlots.handle = card;
    } else if (slotType === CardType.HEAD) {
      if (newSlots.head) returnedCard = newSlots.head;
      newSlots.head = card;
    } else if (slotType === CardType.DECO) {
      if (newSlots.deco) returnedCard = newSlots.deco;
      newSlots.deco = card;
    }

    setSlots(newSlots);
    
    const wasInHand = hand.some(c => c.instanceId === card.instanceId);
    if (wasInHand) {
        setHand(prev => prev.filter(c => c.instanceId !== card.instanceId));
    } else {
        if (slots.handle?.instanceId === card.instanceId && slotType !== CardType.HANDLE) setSlots(p => ({...p, handle: null}));
        if (slots.head?.instanceId === card.instanceId && slotType !== CardType.HEAD) setSlots(p => ({...p, head: null}));
        if (slots.deco?.instanceId === card.instanceId && slotType !== CardType.DECO) setSlots(p => ({...p, deco: null}));
    }

    if (returnedCard) setHand(prev => [...prev, returnedCard!]);
  };

  const handleCardClick = (card: CardInstance) => {
    if (gameState === 'REMOVE_CARD') {
        setSelectedCardId(prev => prev === card.instanceId ? null : card.instanceId);
        return;
    }
    handleCardMoveToSlot(card);
  };

  const handleCardDrop = (cardId: string, targetType: CardType) => {
      const card = hand.find(c => c.instanceId === cardId);
      if (card) {
          handleCardMoveToSlot(card, targetType);
      }
  };

  const handleSlotRemove = (type: CardType) => {
    const card = type === CardType.HANDLE ? slots.handle : type === CardType.HEAD ? slots.head : slots.deco;
    if (!card) return;

    setSlots(prev => ({
      ...prev,
      [type === CardType.HANDLE ? 'handle' : type === CardType.HEAD ? 'head' : 'deco']: null
    }));
    setHand(prev => [...prev, card]);
  };

  const handleClearSlots = () => {
    const cardsToReturn = [slots.handle, slots.head, slots.deco].filter(Boolean) as CardInstance[];
    if (cardsToReturn.length === 0) return;

    setHand(prev => [...prev, ...cardsToReturn]);
    setSlots({ handle: null, head: null, deco: null });
  };

  // --- Touch Drag Handlers ---

  const handleTouchDragStart = (card: CardInstance, x: number, y: number) => {
    setDragState({
        card,
        x,
        y,
        startX: x,
        startY: y
    });
  };

  const handleTouchDragMove = (x: number, y: number) => {
    if (!dragState) return;
    setDragState(prev => prev ? { ...prev, x, y } : null);
  };

  const handleTouchDragEnd = (x: number, y: number) => {
    if (!dragState) return;
    
    const elements = document.elementsFromPoint(x, y);
    const dropZone = elements.find(el => el.getAttribute('data-drop-zone'));
    
    if (dropZone) {
        const targetType = dropZone.getAttribute('data-drop-zone') as CardType;
        handleCardMoveToSlot(dragState.card, targetType);
    } 

    setDragState(null);
  };

  // --- Action Processor for Effect System ---
  const processEffectActions = (actions: EffectAction[], modifiers: EffectModifiers) => {
    for (const action of actions) {
      switch (action.type) {
        case 'PLAYER_SELF_DAMAGE':
          setPlayer(prev => ({ 
            ...prev, 
            hp: Math.max(0, prev.hp - action.amount),
            selfDamageThisTurn: prev.selfDamageThisTurn + action.amount 
          }));
          break;
        case 'PLAYER_HEAL':
          setPlayer(prev => ({ ...prev, hp: Math.min(prev.maxHp, prev.hp + action.amount) }));
          triggerPlayerHeal();
          break;
        case 'PLAYER_GAIN_ENERGY':
          setPlayer(prev => ({ ...prev, energy: Math.min(prev.maxEnergy, prev.energy + action.amount) }));
          showFeedback(`에너지 +${action.amount}`, 'good');
          break;
        case 'PLAYER_GAIN_BLOCK':
          setPlayer(prev => ({ ...prev, block: prev.block + action.amount }));
          break;
        case 'PLAYER_REDUCE_BLOCK':
          setPlayer(prev => {
            const remaining = prev.block - action.amount;
            if (remaining < 0) {
              return { ...prev, block: 0, hp: Math.max(0, prev.hp + remaining) };
            }
            return { ...prev, block: remaining };
          });
          showFeedback(`방어도 -${action.amount}`, 'bad');
          break;
        case 'PLAYER_GAIN_GOLD':
          setPlayer(prev => ({ ...prev, gold: prev.gold + action.amount }));
          showFeedback(`+${action.amount} 골드`, 'good');
          break;
        case 'PLAYER_SET_DODGE':
          setPlayer(prev => ({ ...prev, dodgeNextAttack: action.value }));
          showFeedback('회피 준비!', 'good');
          break;
        case 'PLAYER_OVERHEAT':
          setPlayer(prev => ({ ...prev, overheat: prev.overheat + action.amount }));
          showFeedback('과열! (다음 턴 에너지 -1)', 'bad');
          break;
        case 'PLAYER_NEXT_TURN_DRAW':
          setPlayer(prev => ({ ...prev, nextTurnDraw: prev.nextTurnDraw + action.amount }));
          showFeedback('다음 턴 드로우 +1!', 'good');
          break;
        case 'ENEMY_APPLY_STATUS':
          setEnemy(prev => ({
            ...prev,
            statuses: { ...prev.statuses, [action.status]: (prev.statuses[action.status] || 0) + action.amount }
          }));
          const statusNames: Record<string, string> = {
            weak: '약화', vulnerable: '취약', bleed: '출혈', 
            burn: '화상', poison: '독', stunned: '기절'
          };
          showFeedback(`${statusNames[action.status] || action.status} ${action.amount > 1 ? action.amount + ' ' : ''}부여!`);
          break;
        case 'ENEMY_SKIP_INTENT':
          setEnemy(prev => ({
            ...prev,
            currentIntentIndex: (prev.currentIntentIndex + 1) % prev.intents.length
          }));
          break;
        case 'ENEMY_EXECUTE_THRESHOLD':
          setTimeout(() => {
            setEnemy(prev => {
              if (prev.currentHp > 0 && prev.currentHp <= prev.maxHp * action.threshold) {
                showFeedback('처형!');
                return { ...prev, currentHp: 0 };
              }
              return prev;
            });
          }, 100);
          break;
        case 'DRAW_CARDS':
          drawCards(action.count);
          showFeedback(`카드 ${action.count}장 드로우!`, 'good');
          break;
        case 'CREATE_REPLICA':
          const replica = createCardInstance(801);
          replica.value = action.baseDamage;
          replica.description = `복제된 무기. 피해량 ${action.baseDamage}. 비용 0.`;
          setDeck(prev => [...prev, replica]);
          showFeedback('덱에 복제!', 'good');
          break;
        case 'GROW_CRYSTAL':
          if (growingCrystalBonus < action.max) {
            setGrowingCrystalBonus(prev => Math.min(action.max, prev + action.amount));
            showFeedback(`결정 성장! +${action.amount} (현재: ${Math.min(action.max, growingCrystalBonus + action.amount)})`);
          }
          break;
      }
    }
  };

  const handleForgeAndAttack = async () => {
    const stats = calculateCurrentWeaponStats();
    
    if (player.costLimit !== null && stats.totalCost > player.costLimit) {
      showFeedback(`과부하! 비용 ${player.costLimit} 이하만 가능!`);
      return;
    }

    if (stats.totalCost > player.energy) {
      showFeedback('기력이 부족합니다!');
      return;
    }

    setIsResolvingAction(true);

    try {
    const effectMultiplier = isTwinHandle(slots.handle?.id || 0) ? 2 : 1;
    const remainingEnergyAfterCost = player.energy - stats.totalCost;

    setPlayer(prev => ({ 
      ...prev, 
      energy: prev.energy - stats.totalCost, 
      weaponsUsedThisTurn: prev.weaponsUsedThisTurn + 1 
    }));

    // Build effect context
    const effectContext: CardEffectContext = {
      slots, stats, player, enemy,
      effectMultiplier,
      remainingEnergyAfterCost,
      growingCrystalBonus,
      showFeedback
    };

    // Initialize modifiers
    let modifiers: EffectModifiers = {
      finalDamage: stats.damage,
      finalBlock: stats.block,
      ignoreBlock: false,
      selfDamage: player.selfDamageThisTurn
    };

    // === SELF-DAMAGE PHASE (runs before PRE_DAMAGE) ===
    // Process self-damage effects first so Berserker Rune can see the updated selfDamage value
    const selfDamageActions = executeEffectsForPhase(effectContext, modifiers, 'SELF_DAMAGE');
    for (const action of selfDamageActions) {
      if (action.type === 'PLAYER_SELF_DAMAGE') {
        setPlayer(prev => ({ 
          ...prev, 
          hp: Math.max(0, prev.hp - action.amount),
          selfDamageThisTurn: prev.selfDamageThisTurn + action.amount 
        }));
        modifiers.selfDamage += action.amount;
      }
    }

    // === PRE-DAMAGE PHASE ===
    // Now Berserker Rune (320) can correctly see selfDamage from Blood Handle/Frenzy Blade
    const preDamageActions = executeEffectsForPhase(effectContext, modifiers, 'PRE_DAMAGE');
    
    // Apply modifier changes (damage, block, ignoreBlock)
    modifiers = applyModifierActions(modifiers, preDamageActions);

    const { finalDamage, finalBlock, ignoreBlock } = modifiers;

    // Trigger animations
    if (finalDamage > 0) {
      triggerShake();
    } else if (finalBlock > 0) {
      triggerShieldEffect();
    }

    // === DAMAGE LOOP ===
    if (finalDamage > 0) {
      let loops = stats.hitCount;
      if (isTwinHandle(slots.handle?.id || 0)) loops *= 2;

      for (let i = 0; i < loops; i++) {
        let actualDmg = finalDamage;

        // Vulnerable calculation
        if (enemy.statuses.vulnerable > 0) {
          actualDmg = Math.floor(actualDmg * 1.5);
        }

        // Enemy traits
        if (enemy.traits.includes(EnemyTrait.DAMAGE_CAP_15) && actualDmg > 15) {
          actualDmg = 15;
          showFeedback('방어막: 피해 15로 제한!');
        }

        if (enemy.traits.includes(EnemyTrait.THORNS_5)) {
          setPlayer(prev => ({ ...prev, hp: Math.max(0, prev.hp - 5) }));
          showFeedback('가시 반사! -5 HP', 'bad');
        }

        // Apply damage to block first (unless ignoreBlock)
        let damageDealt = actualDmg;
        if (damageDealt > 0 && enemy.block > 0 && !ignoreBlock) {
          const blockDamage = Math.min(enemy.block, damageDealt);
          damageDealt -= blockDamage;
          setEnemy(prev => ({ ...prev, block: prev.block - blockDamage }));
          if (blockDamage > 0) showFeedback('방어도에 막힘!');
        } else if (ignoreBlock && enemy.block > 0) {
          showFeedback('관통! 방어도 무시!');
        }

        // Apply remaining damage to HP
        if (damageDealt > 0) {
          setEnemy(prev => ({
            ...prev,
            currentHp: Math.max(0, prev.currentHp - damageDealt),
            damageTakenThisTurn: prev.damageTakenThisTurn + damageDealt
          }));
          showFeedback(`${i > 0 ? '연타!' : ''} -${damageDealt} 피해!`);
        }

        // ON-HIT effects (Midas Touch, Vampiric)
        if (damageDealt > 0) {
          const onHitActions = executeEffectsForPhase(effectContext, modifiers, 'ON_HIT');
          processEffectActions(onHitActions, modifiers);
        }

        // Delay between hits
        if (loops > 1) await new Promise(r => setTimeout(r, 200));
      }
    }

    // Apply block gain
    if (finalBlock > 0) {
      setPlayer(prev => ({ ...prev, block: prev.block + finalBlock }));
      triggerPlayerBlock();
      showFeedback(`+${finalBlock} 방어도`, 'good');
    }

    // === POST-DAMAGE PHASE ===
    const postDamageActions = executeEffectsForPhase(effectContext, modifiers, 'POST_DAMAGE');
    processEffectActions(postDamageActions, modifiers);

    // === CARD DISPOSAL ===
    const headExhausts = isExhaustCard(slots.head?.id || 0);
    if (headExhausts) {
      showFeedback('공허의 수정 소멸!');
    }

    // Infinite Loop - Return to hand (once per turn)
    let infiniteLoopCard: CardInstance | null = null;
    if (isInfiniteLoopCard(slots.handle?.id || 0) && !infiniteLoopUsed) {
      infiniteLoopCard = slots.handle;
      setInfiniteLoopUsed(true);
      showFeedback('무한 회귀: 손으로 귀환!', 'good');
    }

    const usedCards = [slots.handle, slots.head, slots.deco]
      .filter(c => c && !isExhaustCard(c.id) && !isInfiniteLoopCard(c.id)) as CardInstance[];

    if (infiniteLoopCard) {
      setHand(prev => [...prev, infiniteLoopCard!]);
    }

    setDiscardPile(prev => [...prev, ...usedCards]);
    setSlots({ handle: null, head: null, deco: null });
    } finally {
      setIsResolvingAction(false);
    }
  };

  const endTurn = () => {
    setCombatState(prev => ({ ...prev, phase: 'PLAYER_DISCARD' }));
  };

  // --- Effects / State Machine ---

  useEffect(() => {
    if (enemy.currentHp <= 0 && gameState === 'PLAYING') {
      setTimeout(() => {
          handleWinCombat();
      }, 1000);
    }
  }, [enemy.currentHp, gameState]);

  useEffect(() => {
    if (player.hp <= 0 && gameState === 'PLAYING') {
      setGameState('LOSE');
    }
  }, [player.hp, gameState]);

  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const runPhase = async () => {
      switch (combatState.phase) {
case 'PLAYER_DRAW':
          const drawCount = 5 + player.nextTurnDraw;
          const overheatPenalty = player.overheat;
          const actualEnergy = Math.max(0, player.maxEnergy - overheatPenalty);
          
          setPlayer(p => ({ 
              ...p, 
              energy: actualEnergy, 
              block: 0,
              nextTurnDraw: 0,
              overheat: 0,
              weaponsUsedThisTurn: 0,
              selfDamageThisTurn: 0 // Reset self damage counter for new turn
          })); 
          setEnemy(prev => ({ ...prev, damageTakenThisTurn: 0 })); 
          setInfiniteLoopUsed(false); // Reset 405 usage
          drawCards(drawCount);
          if (overheatPenalty > 0) showFeedback(`과열! 에너지 -${overheatPenalty}`, 'bad');
          else if (drawCount > 5) showFeedback(`추가 드로우 +${drawCount - 5}!`, 'good');
          setCombatState(prev => ({ ...prev, phase: 'PLAYER_ACTION' }));
          break;

        case 'PLAYER_DISCARD':
          setPlayer(prev => ({ ...prev, costLimit: null, disarmed: false }));
          const allRemaining = [...hand, slots.handle, slots.head, slots.deco].filter(Boolean) as CardInstance[];

          // Trigger sequential discard animation
          if (allRemaining.length > 0) {
            allRemaining.forEach((card, i) => {
              setTimeout(() => {
                setDiscardingCardIds(prev => new Set([...prev, card.instanceId]));
              }, i * 60); // Stagger by 60ms
            });

            // After all animations complete, actually discard
            setTimeout(() => {
              setDiscardPile(prev => [...prev, ...allRemaining]);
              setHand([]);
              setSlots({ handle: null, head: null, deco: null });
              setDiscardingCardIds(new Set());
              setCombatState(prev => ({ ...prev, phase: 'ENEMY_TURN' }));
            }, allRemaining.length * 60 + 400); // Wait for stagger + animation duration
          } else {
            setCombatState(prev => ({ ...prev, phase: 'ENEMY_TURN' }));
          }
          break;

        case 'ENEMY_TURN':
          // Reset Enemy Block at the start of their turn (or end of player turn, effectively here)
          setEnemy(prev => ({ ...prev, block: 0 }));
          
          await new Promise(r => setTimeout(r, 800));
          
          const turnStartStatus = resolveEnemyTurnStartStatuses(enemy.statuses);
          setEnemy(prev => ({ ...prev, statuses: turnStartStatus.statuses }));

          if (turnStartStatus.isStunned) {
              showFeedback("적이 기절하여 행동 불가!");
              await new Promise(r => setTimeout(r, 1000));
              setCombatState(prev => ({ ...prev, turn: prev.turn + 1, phase: 'PLAYER_DRAW' }));
              return;
          }

          if (turnStartStatus.poisonDamage > 0) {
              setEnemy(prev => ({
                  ...prev,
                  currentHp: Math.max(0, prev.currentHp - turnStartStatus.poisonDamage)
              }));
              triggerEnemyPoison();
              showFeedback(`독 피해 ${turnStartStatus.poisonDamage}!`);
              await new Promise(r => setTimeout(r, 800));
          }

          if (turnStartStatus.burnDamage > 0) {
              setEnemy(prev => ({
                  ...prev,
                  currentHp: Math.max(0, prev.currentHp - turnStartStatus.burnDamage)
              }));
              triggerEnemyBurn();
              showFeedback(`화상 피해 ${turnStartStatus.burnDamage}!`);
              await new Promise(r => setTimeout(r, 800));
          }

          const projectedEnemyHp = enemy.currentHp - turnStartStatus.poisonDamage - turnStartStatus.burnDamage;
          if (projectedEnemyHp <= 0) return;

          const intentPlan = calculateEnemyIntentPlan(enemy, player);
          const intent = intentPlan.intent;

          if (intentPlan.handleCostIncrease > 0) {
             const allHandles = [...deck, ...discardPile].filter(c => c.type === CardType.HANDLE);
             if (allHandles.length > 0) {
                 const target = allHandles[Math.floor(Math.random() * allHandles.length)];
                 target.cost += intentPlan.handleCostIncrease;
                 showFeedback(`[${target.name}] 비용 +${intentPlan.handleCostIncrease}`, 'bad');
             }
          }

          if (intentPlan.costLimit !== null) {
             setPlayer(prev => ({ ...prev, costLimit: intentPlan.costLimit }));
             showFeedback(`과부하: 다음 턴 비용 제한 ${intentPlan.costLimit}`, 'bad');
          }

          if (intentPlan.disarmsHead) {
             setPlayer(prev => ({ ...prev, disarmed: true }));
             showFeedback("무장 해제: 다음 턴 머리 사용 불가", 'bad');
          }

          if (intentPlan.blockCounterBonus > 0) {
              showFeedback(`방어 카운터 +${intentPlan.blockCounterBonus} 피해`, 'bad');
          }

          if (intentPlan.weaponCounterBonus > 0) {
              showFeedback(`연속 제작 카운터 +${intentPlan.weaponCounterBonus} 피해`, 'bad');
          }

          if (intentPlan.isAttack) {
             triggerEnemyAttack();
             for (let i = 0; i < intentPlan.attackCount; i++) {
                  if (enemy.statuses.bleed > 0) {
                      const bDmg = enemy.statuses.bleed;
                      setEnemy(prev => ({
                         ...prev,
                         currentHp: Math.max(0, prev.currentHp - bDmg),
                         statuses: { ...prev.statuses, bleed: Math.max(0, prev.statuses.bleed - 1) }
                      }));
                      triggerEnemyBleed();
                      showFeedback(`출혈 피해 ${bDmg}!`);
                     await new Promise(r => setTimeout(r, 400));
                  }
                 if (enemy.currentHp <= 0) break;

                 // 412: Evasion Handle - Dodge one attack
                 if (player.dodgeNextAttack) {
                     setPlayer(p => ({ ...p, dodgeNextAttack: false }));
                     showFeedback("회피 성공!", 'good');
                     await new Promise(r => setTimeout(r, 400));
                     continue; // Skip this attack hit
                 }

                 const { unblockedDamage } = calculateBlockedDamage(intentPlan.attackDamage, player.block);
                 setPlayer(p => ({
                   ...p,
                   hp: Math.max(0, p.hp - unblockedDamage),
                   block: Math.max(0, p.block - intentPlan.attackDamage)
                 }));
                 
                  // Thievery Logic
                  if (enemy.traits.includes(EnemyTrait.THIEVERY) && unblockedDamage > 0) {
                      const stolen = Math.min(player.gold, 5);
                      if (stolen > 0) {
                          setPlayer(p => ({ ...p, gold: p.gold - stolen }));
                          showFeedback(`-${stolen} 골드 강탈!`, 'bad');
                      }
                  }

                  if (unblockedDamage > 0) {
                    triggerPlayerHit();
                    showFeedback(`${unblockedDamage} 피해!`, 'bad');
                  } else {
                    triggerPlayerBlock();
                    showFeedback("방어 성공!", 'good');
                  }
                 
                 if (i < intentPlan.attackCount - 1) await new Promise(r => setTimeout(r, 400));
             }

             if (enemy.statuses.strength > 0) {
                 setEnemy(prev => ({
                     ...prev,
                     statuses: { ...prev.statuses, strength: 0 }
                 }));
             }
          } 
          
          if (enemy.currentHp <= 0) return;

          // DEFEND intent - enemy gains block
          if (intentPlan.defendBlock > 0) {
             const blockGain = intentPlan.defendBlock;
             setEnemy(prev => ({ ...prev, block: prev.block + blockGain }));
             showFeedback(`적 방어 태세! +${blockGain} 방어도`, 'bad');
          } else if (intent.effect?.type === 'GAIN_STRENGTH') {
             const gain = calculateEnemyStrengthGain(enemy, intent);
             setEnemy(prev => ({
                 ...prev,
                 statuses: { ...prev.statuses, strength: (prev.statuses.strength || 0) + gain }
             }));
             showFeedback(`적 공격력 +${gain} 증가!`, 'bad');
          } else if (intentPlan.healAmount > 0) {
             setEnemy(e => ({ ...e, currentHp: Math.min(e.maxHp, e.currentHp + intentPlan.healAmount) }));
             showFeedback(`적 회복 +${intentPlan.healAmount} HP`, 'bad');
          } else if (intent.effect?.type === 'CLEANSE_STATUSES_GAIN_STRENGTH') {
             if (intentPlan.statusCleanseStrengthGain > 0) {
                 setEnemy(prev => ({
                     ...prev,
                     statuses: {
                         ...prev.statuses,
                         poison: 0,
                         bleed: 0,
                         burn: 0,
                         vulnerable: 0,
                         weak: 0,
                         stunned: 0,
                         strength: (prev.statuses.strength || 0) + intentPlan.statusCleanseStrengthGain
                     }
                 }));
                 showFeedback(`상태이상 정화! 공격력 +${intentPlan.statusCleanseStrengthGain}`, 'bad');
             } else {
                 showFeedback('상태이상 정화 실패', 'good');
             }
          } else if (intentPlan.junkCount > 0) {
             const junkCards: CardInstance[] = Array(intentPlan.junkCount).fill(null).map(() => createCardInstance(901));
             setDiscardPile(prev => [...prev, ...junkCards]);
             showFeedback(`녹슨 덩어리 ${intentPlan.junkCount}장 추가!`, 'bad');
          } else if (intent.type === IntentType.BUFF) {
             if (intent.description.includes('공격력')) {
                 const gain = calculateEnemyStrengthGain(enemy, intent);
                 if (enemy.id === 'shadow_assassin') {
                     // Assassin stacks block too
                     setEnemy(e => ({ ...e, statuses: { ...e.statuses, strength: (e.statuses.strength || 0) + gain } }));
                     showFeedback(`적 칼날 연마!`, 'bad');
                 } else {
                     setEnemy(prev => ({
                         ...prev,
                         statuses: { ...prev.statuses, strength: (prev.statuses.strength || 0) + gain }
                     }));
                 }
                 
                 if (enemy.id === 'kobold_scrapper') {
                     showFeedback(`적 공격력 +${gain} 증가!`, 'bad');
                 } else if (enemy.id !== 'shadow_assassin') {
                     showFeedback(`적 공격력 +${gain} 증가!`, 'bad');
                 }
             } else {
                 setEnemy(e => ({ ...e, currentHp: Math.min(e.maxHp, e.currentHp + intent.value) }));
                 showFeedback(`적 회복 +${intent.value} HP`, 'bad');
             }
          }

          setEnemy(prev => ({
             ...prev,
             currentIntentIndex: (prev.currentIntentIndex + 1) % prev.intents.length
          }));

          setCombatState(prev => ({ ...prev, turn: prev.turn + 1, phase: 'PLAYER_DRAW' }));
          break;
      }
    };

    runPhase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combatState.phase, gameState]);

  // Derived state for Anvil
  const weaponPrediction = calculateCurrentWeaponStats();
  const canCraft = !!(slots.handle && slots.head);
  const availableMapNodeIds = getAvailableMapNodeIds(mapNodes, currentMapNodeId);
  const shouldShowFirstCombatTutorial =
    gameState === 'PLAYING' &&
    combatState.phase === 'PLAYER_ACTION' &&
    act === 1 &&
    floor === 1 &&
    !settings.tutorialCompleted;

  // --- Render Sub-Screens ---

  if (gameState === 'MENU') {
    return (
      <MenuScreen
        onStartGame={startGame}
        onContinueRun={continueSavedRun}
        savedRunSummary={savedRunSummary}
        settings={settings}
        onSettingsChange={setSettings}
      />
    );
  }

  if (gameState === 'WIN' || gameState === 'LOSE') {
    return (
      <GameOverScreen
        isWin={gameState === 'WIN'}
        act={act}
        floor={floor}
        gold={player.gold}
        onRestart={startGame}
      />
    );
  }

  if (gameState === 'MAP') {
    return (
      <MapScreen
        act={act}
        floor={floor}
        gold={player.gold}
        hp={player.hp}
        maxHp={player.maxHp}
        nodes={mapNodes}
        completedNodeIds={completedMapNodeIds}
        availableNodeIds={availableMapNodeIds}
        onSelectNode={handleSelectMapNode}
      />
    );
  }

  if (gameState === 'BOSS_REWARD') {
    return <BossRewardScreen onSelectReward={confirmBossReward} />;
  }

  if (gameState === 'SHOP') {
    return (
      <ShopScreen
        gold={player.gold}
        onBuyItem={handleShopBuy}
        onExit={handleShopExit}
      />
    );
  }

  if (gameState === 'EVENT' && currentEvent) {
    return (
      <EventScreen
        event={currentEvent}
        gold={player.gold}
        hp={player.hp}
        onSelectOption={handleEventOption}
      />
    );
  }

  if (gameState === 'REWARD') {
    return (
      <RewardScreen
        rewardOptions={rewardOptions}
        onSelectReward={handleSelectReward}
      />
    );
  }

  if (gameState === 'REST') {
    return (
      <RestScreen
        gold={player.gold}
        maxHp={player.maxHp}
        hasRested={hasRested}
        onRestAction={handleRestAction}
        onAdvance={completeActiveMapNode}
      />
    );
  }

  if (gameState === 'REMOVE_CARD') {
    return (
      <RemoveCardScreen
        deck={deck}
        selectedCardId={selectedCardId}
        onCardClick={handleCardClick}
        onCancel={handleCancelRemoval}
        onConfirm={handleConfirmRemoval}
      />
    );
  }

  // --- Main Gameplay Screen ---
  return (
    <div className={`w-full h-screen-safe flex flex-col bg-stone-950 text-stone-200 overflow-hidden relative ${settings.screenShake && shake ? 'animate-shake' : ''} ${settings.animationsEnabled && shieldEffect ? 'animate-shield-pulse' : ''} ${settings.animationsEnabled && playerHit ? 'animate-player-hit' : ''}`}>
      
      {/* Acquired Card Overlay - Pixel Style */}
      {acquiredCard && (
        <div className="absolute inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4">
            <h2 className="text-xl md:text-2xl font-pixel text-yellow-400 mb-8 animate-pulse" style={{ textShadow: '0 0 20px rgba(250,204,21,0.6)' }}>
                RARE BLUEPRINT!
            </h2>
            <div className="scale-110 md:scale-125 mb-10">
                <CardComponent
                  card={acquiredCard}
                  onClick={() => {}}
                  className="shadow-[0_0_40px_rgba(168,85,247,0.6)]"
                />
            </div>
            <button
                onClick={() => setAcquiredCard(null)}
                className="px-8 py-3
                  bg-gradient-to-b from-stone-600 to-stone-700
                  pixel-border border-4 border-stone-500
                  text-stone-200 font-pixel text-sm
                  hover:from-stone-500 hover:to-stone-600
                  transition-all active:translate-y-1"
                style={{ boxShadow: '0 4px 0 0 #1c1917' }}
            >
                OK
            </button>
        </div>
      )}

      {/* Touch Drag Overlay (Ghost Card) */}
      {dragState && (
        <div
            className="fixed z-[100] pointer-events-none transform -translate-x-1/2 -translate-y-1/2 opacity-90"
            style={{ left: dragState.x, top: dragState.y }}
        >
            <CardComponent card={dragState.card} onClick={() => {}} className="shadow-2xl scale-110" />
        </div>
      )}

      {/* Good Toast - Blue (player benefits: damage dealt, heal, block, etc.) */}
      {currentGoodToast && (
        <div className="absolute top-[30%] left-1/2 transform -translate-x-1/2 z-50 max-w-[90%] text-center pointer-events-none">
          <span
            className="inline-block px-5 py-2.5 bg-gradient-to-b from-blue-600 to-cyan-700 pixel-border border-4 border-blue-400 text-sm md:text-base font-pixel-kr text-white animate-toast-pop"
            style={{ textShadow: '2px 2px 0 #000', boxShadow: '0 4px 0 0 #0e7490, 0 0 20px rgba(59,130,246,0.5)' }}
          >
            {currentGoodToast}
          </span>
        </div>
      )}

      {/* Bad Toast - Red (player suffers: damage taken, debuffs, etc.) */}
      {currentBadToast && (
        <div className="absolute bottom-44 md:bottom-72 left-1/2 transform -translate-x-1/2 z-50 max-w-[90%] text-center pointer-events-none">
          <span
            className="inline-block px-5 py-2.5 bg-gradient-to-b from-red-600 to-orange-700 pixel-border border-4 border-red-400 text-sm md:text-base font-pixel-kr text-white animate-toast-pop"
            style={{ textShadow: '2px 2px 0 #000', boxShadow: '0 4px 0 0 #7c2d12, 0 0 20px rgba(239,68,68,0.5)' }}
          >
            {currentBadToast}
          </span>
        </div>
      )}

      {/* Intent Detail Modal */}
      {showIntentDetail && (
        <IntentDetailModal
          intent={enemy.intents[enemy.currentIntentIndex]}
          onClose={() => setShowIntentDetail(false)}
        />
      )}

      {/* Status Effect Detail Modal */}
      {showStatusDetail && (
        <StatusDetailModal
          statusKey={showStatusDetail}
          statusValue={enemy.statuses?.[showStatusDetail as keyof typeof enemy.statuses] || 0}
          onClose={() => setShowStatusDetail(null)}
        />
      )}

      {showCombatHelp && (
        <CombatHelpModal onClose={() => setShowCombatHelp(false)} />
      )}

      {shouldShowFirstCombatTutorial && (
        <TutorialOverlay
          step={tutorialStep}
          totalSteps={TUTORIAL_STEP_COUNT}
          onNext={advanceTutorial}
          onSkip={completeTutorial}
        />
      )}

      <button
        onClick={() => setShowCombatHelp(true)}
        className="absolute top-2 left-1/2 -translate-x-1/2 z-40 px-2.5 py-1.5 pixel-border border-2 border-cyan-500 bg-cyan-950/80 text-cyan-200 font-pixel-kr text-[10px] flex items-center gap-1.5 hover:bg-cyan-900/90"
        aria-label="전투 사전 열기"
      >
        <HelpCircle size={14} /> 도움
      </button>

      {/* Enemy Section */}
      <EnemySection
        enemy={enemy}
        act={act}
        floor={floor}
        playerGold={player.gold}
        shake={settings.screenShake && shake}
        enemyPoisoned={settings.animationsEnabled && enemyPoisoned}
        enemyBurning={settings.animationsEnabled && enemyBurning}
        enemyBleeding={settings.animationsEnabled && enemyBleeding}
        enemyAttacking={settings.animationsEnabled && enemyAttacking}
        onIntentClick={() => setShowIntentDetail(true)}
        onStatusClick={(status) => setShowStatusDetail(status)}
      />

      {/* --- Middle: Anvil / Crafting --- */}
      <div className="flex-1 relative flex flex-col justify-center items-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-stone-800 to-stone-950 px-2 md:px-4 overflow-y-auto">

        {/* Player Stats HUD */}
        <PlayerHUD
          hp={player.hp}
          block={player.block}
          energy={player.energy}
          maxEnergy={player.maxEnergy}
          disarmed={player.disarmed}
          costLimit={player.costLimit}
          playerHealing={settings.animationsEnabled && playerHealing}
          playerHit={settings.animationsEnabled && playerHit}
          playerBlocking={settings.animationsEnabled && playerBlocking}
        />

        {/* Deck/Discard HUD */}
        <DeckHUD deckCount={deck.length} discardCount={discardPile.length} />

        {/* THE ANVIL */}
        <div className="w-full h-full flex items-center justify-center p-2">
            <Anvil
                slots={slots}
                onRemove={handleSlotRemove}
                onCraft={handleForgeAndAttack}
                onDropCard={handleCardDrop}
                onClear={handleClearSlots}
                canCraft={canCraft}
                prediction={{
                    damage: weaponPrediction.damage,
                    cost: weaponPrediction.totalCost,
                    block: weaponPrediction.block,
                    isBlock: weaponPrediction.block > 0
                }}
                playerEnergy={player.energy}
                touchHandlers={{
                    onTouchDragStart: handleTouchDragStart,
                    onTouchDragMove: handleTouchDragMove,
                    onTouchDragEnd: handleTouchDragEnd
                }}
                discardingCardIds={discardingCardIds}
            />
        </div>

        {/* Turn Control - Pixel Style */}
        <div className="absolute right-4 bottom-4 z-20">
           <button
             onClick={endTurn}
             disabled={combatState.phase !== 'PLAYER_ACTION'}
             className={`
               px-4 py-2 md:px-5 md:py-2.5
               pixel-border border-4
               font-pixel text-xs md:text-sm
               transition-all
               ${combatState.phase === 'PLAYER_ACTION'
                 ? 'bg-gradient-to-b from-stone-600 to-stone-700 border-stone-500 text-stone-200 hover:from-stone-500 hover:to-stone-600 active:translate-y-1'
                 : 'bg-stone-800 border-stone-700 text-stone-600 cursor-not-allowed'}
             `}
             style={{ boxShadow: combatState.phase === 'PLAYER_ACTION' ? '0 4px 0 0 #1c1917' : 'none' }}
           >
             END
           </button>
        </div>

      </div>

      {/* --- Bottom: Hand --- */}
      <div className="h-40 md:h-64 bg-pixel-bg-mid pixel-border border-t-4 border-stone-700 flex items-center justify-center relative z-30">
        <div className="flex items-center justify-start md:justify-center gap-2 pb-2 px-4 overflow-x-auto w-full h-full no-scrollbar whitespace-nowrap">
          {hand.map((card, index) => {
            // Simplified layout for mobile: No overlap, simple horizontal scroll
            const isMobile = window.innerWidth < 768;
            const rotation = isMobile ? 0 : (index - (hand.length - 1) / 2) * 5;
            const translateY = isMobile ? 0 : Math.abs(index - (hand.length - 1) / 2) * 10;
            
            return (
              <div 
                key={card.instanceId} 
                style={{ 
                  transform: `rotate(${rotation}deg) translateY(${translateY}px)`,
                  zIndex: index 
                }}
                className={`
                    transition-transform duration-200 
                    ${isMobile ? '' : 'mx-[-30px] hover:z-50 hover:scale-110 hover:-translate-y-16'}
                    inline-block flex-shrink-0
                `}
              >
                <CardComponent
                  card={card}
                  onClick={handleCardClick}
                  disabled={combatState.phase !== 'PLAYER_ACTION'}
                  isDiscarding={discardingCardIds.has(card.instanceId)}
                  onTouchDragStart={handleTouchDragStart}
                  onTouchDragMove={handleTouchDragMove}
                  onTouchDragEnd={handleTouchDragEnd}
                />
              </div>
            );
          })}
          {/* Padding for right side scroll */}
          <div className="w-4 flex-shrink-0 md:hidden"></div>
        </div>
      </div>

    </div>
  );
}
