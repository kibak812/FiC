import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  CardInstance, CardType, CombatState, PlayerStats, EnemyData, 
  IntentType, CraftedWeapon, CardRarity, EnemyTrait, EnemyTier
} from './types';
import { CARD_DATABASE, INITIAL_DECK_IDS, ENEMIES, ENEMY_POOLS } from './constants';
import CardComponent from './components/CardComponent';
import Anvil from './components/Anvil';
import { getMonsterSprite } from './components/PixelSprites';
import { Heart, Shield, Zap, RefreshCw, Skull, Trophy, Map as MapIcon, Hammer, Flame, Ban, ArrowLeft, Check, Layers, Archive, Droplets, Activity, Star, Lock, Swords, Percent, Store, Coins, Sparkles, ChevronRight } from 'lucide-react';

// --- Utils ---

const generateId = () => Math.random().toString(36).substr(2, 9);

const createCardInstance = (id: number): CardInstance => {
  const data = CARD_DATABASE.find(c => c.id === id);
  if (!data) throw new Error(`Card ${id} not found`);
  return { ...data, instanceId: generateId() };
};

const shuffle = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

// --- Main App ---

type GameState = 'MENU' | 'PLAYING' | 'REWARD' | 'BOSS_REWARD' | 'REST' | 'SHOP' | 'REMOVE_CARD' | 'WIN' | 'LOSE';

const ACT_LENGTH = 15;

export default function App() {
  // Game State
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [floor, setFloor] = useState(1);
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
  const [bossRewards, setBossRewards] = useState<{id: string, name: string, desc: string, icon: React.ReactNode}[]>([]);

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

// Visuals
  const [shake, setShake] = useState(false);
  const [shieldEffect, setShieldEffect] = useState(false); // New state for defense visual
  // Toast messages - split by sentiment (good vs bad for player)
  const [goodToastQueue, setGoodToastQueue] = useState<string[]>([]);
  const [badToastQueue, setBadToastQueue] = useState<string[]>([]);
  const [currentGoodToast, setCurrentGoodToast] = useState<string | null>(null);
  const [currentBadToast, setCurrentBadToast] = useState<string | null>(null);
  const [discardingCardIds, setDiscardingCardIds] = useState<Set<string>>(new Set());
  
  // Animation states for differentiated effects
  const [playerHit, setPlayerHit] = useState(false);
  const [enemyPoisoned, setEnemyPoisoned] = useState(false);
  const [enemyBurning, setEnemyBurning] = useState(false);
  const [enemyBleeding, setEnemyBleeding] = useState(false);
  const [playerHealing, setPlayerHealing] = useState(false);
  const [playerBlocking, setPlayerBlocking] = useState(false);
  const [enemyAttacking, setEnemyAttacking] = useState(false);

  // Balance Patch v1.0 - New card states
  const [growingCrystalBonus, setGrowingCrystalBonus] = useState(0); // 407: Permanent damage bonus per combat
  const [infiniteLoopUsed, setInfiniteLoopUsed] = useState(false); // 405: Once per turn

  // Intent detail modal (long-press on mobile)
  const [showIntentDetail, setShowIntentDetail] = useState(false);
  const intentLongPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Touch Drag State ---
  const [dragState, setDragState] = useState<{
    card: CardInstance;
    x: number;
    y: number;
    startX: number;
    startY: number;
  } | null>(null);

  // --- Helpers ---

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const triggerShieldEffect = () => {
    setShieldEffect(true);
    setTimeout(() => setShieldEffect(false), 600);
  };

  const triggerPlayerHit = () => {
    setPlayerHit(true);
    setTimeout(() => setPlayerHit(false), 400);
  };

  const triggerEnemyPoison = () => {
    setEnemyPoisoned(true);
    setTimeout(() => setEnemyPoisoned(false), 600);
  };

  const triggerEnemyBurn = () => {
    setEnemyBurning(true);
    setTimeout(() => setEnemyBurning(false), 500);
  };

  const triggerEnemyBleed = () => {
    setEnemyBleeding(true);
    setTimeout(() => setEnemyBleeding(false), 500);
  };

  const triggerPlayerHeal = () => {
    setPlayerHealing(true);
    setTimeout(() => setPlayerHealing(false), 600);
  };

  const triggerPlayerBlock = () => {
    setPlayerBlocking(true);
    setTimeout(() => setPlayerBlocking(false), 400);
  };

  const triggerEnemyAttack = () => {
    setEnemyAttacking(true);
    setTimeout(() => setEnemyAttacking(false), 400);
  };

  // Show feedback - 'good' for positive effects (blue), 'bad' for negative effects (red)
  const showFeedback = (text: string, sentiment: 'good' | 'bad' = 'good') => {
    if (sentiment === 'good') {
      setGoodToastQueue(prev => [...prev, text]);
    } else {
      setBadToastQueue(prev => [...prev, text]);
    }
  };

  // Process good toast queue (blue - player benefits)
  useEffect(() => {
    if (goodToastQueue.length > 0 && currentGoodToast === null) {
      const [next, ...rest] = goodToastQueue;
      setCurrentGoodToast(next);
      setGoodToastQueue(rest);
      setTimeout(() => setCurrentGoodToast(null), 1200);
    }
  }, [goodToastQueue, currentGoodToast]);

  // Process bad toast queue (red - player suffers)
  useEffect(() => {
    if (badToastQueue.length > 0 && currentBadToast === null) {
      const [next, ...rest] = badToastQueue;
      setCurrentBadToast(next);
      setBadToastQueue(rest);
      setTimeout(() => setCurrentBadToast(null), 1200);
    }
  }, [badToastQueue, currentBadToast]);

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
  };

  const advanceGame = () => {
      let nextFloor = floor + 1;
      let nextAct = act;
      let isActChange = false;

      // Check Act Completion
      if (nextFloor > ACT_LENGTH) {
          nextAct++;
          nextFloor = 1;
          isActChange = true;
          
          if (nextAct > 3) {
              setGameState('WIN');
              return;
          }
          
          setAct(nextAct);
          showFeedback(`ACT ${nextAct} 시작!`);
      }

      setFloor(nextFloor);

      // --- Fixed Level Structure ---
      // Floor 15: Boss
      if (nextFloor === ACT_LENGTH) {
          const boss = ENEMY_POOLS[nextAct as 1|2|3][EnemyTier.BOSS];
          startCombat(JSON.parse(JSON.stringify(boss)));
          return;
      }
      
      // Removed Dedicated Rest Floors [5, 10, 14] as Rest is now every turn

      // Floor 8: Elite
      if (nextFloor === 8) {
          const pool = ENEMY_POOLS[nextAct as 1|2|3][EnemyTier.ELITE];
          const enemy = pool[Math.floor(Math.random() * pool.length)];
          startCombat(JSON.parse(JSON.stringify(enemy)));
          return;
      }

      // Default: Common Enemy
      const pool = ENEMY_POOLS[nextAct as 1|2|3][EnemyTier.COMMON];
      const enemy = pool[Math.floor(Math.random() * pool.length)];
      startCombat(JSON.parse(JSON.stringify(enemy)));
  };

  // --- Game Loop Methods ---

  const startGame = () => {
    const newDeck = INITIAL_DECK_IDS.map(id => createCardInstance(id));
    setDeck(shuffle(newDeck));
    setHand([]);
    setDiscardPile([]);
    
    setPlayer({ hp: 50, maxHp: 50, energy: 3, maxEnergy: 3, block: 0, gold: 0, costLimit: null, disarmed: false, nextTurnDraw: 0, overheat: 0, weaponsUsedThisTurn: 0, dodgeNextAttack: false, selfDamageThisTurn: 0 });
    
    setFloor(1);
    setAct(1);
    
    // Start Floor 1 Combat immediately
    const tier1Pool = ENEMY_POOLS[1][EnemyTier.COMMON];
    const starterEnemy = JSON.parse(JSON.stringify(tier1Pool[Math.floor(Math.random() * tier1Pool.length)]));
    startCombat(starterEnemy);
  };

  const handleWinCombat = () => {
      cleanAndConsolidateDeck();
      
      // Rewards
      const isEliteOrBoss = enemy.tier === EnemyTier.ELITE || enemy.tier === EnemyTier.BOSS;
      const goldReward = Math.floor(Math.random() * 20) + (isEliteOrBoss ? 30 : 15);
      setPlayer(prev => ({...prev, gold: prev.gold + goldReward}));

      const pool = CARD_DATABASE.filter(c => 
          c.rarity !== CardRarity.JUNK && 
          c.rarity !== CardRarity.STARTER && 
          c.rarity !== CardRarity.SPECIAL
      );
      
      const shuffled = shuffle(pool);
      const count = isEliteOrBoss ? 4 : 3;
      const options = shuffled.slice(0, count).map(data => ({...data, instanceId: generateId()}));
      setRewardOptions(options);

      showFeedback(`승리! ${goldReward} 골드 획득`);
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
      if (enemy.tier === EnemyTier.BOSS && act < 4) {
          setupBossReward();
          setGameState('BOSS_REWARD');
      } else {
          setHasRested(false); // Reset rest status for new floor
          setGameState('REST');
      }
  };

  const setupBossReward = () => {
      setBossRewards([
          { id: 'MAX_ENERGY', name: '확장 풀무', desc: '최대 에너지 +1', icon: <Zap size={32} className="text-yellow-400" /> },
          { id: 'DRAW_BONUS', name: '자동 망치', desc: '매 턴 시작 시 드로우 +1', icon: <Layers size={32} className="text-blue-400" /> },
          { id: 'START_BLOCK', name: '미스릴 모루', desc: '전투 시작 시 방어도 15 획득', icon: <Shield size={32} className="text-stone-300" /> },
      ]);
  };

  const handleSelectBossReward = (rewardId: string) => {
      if (rewardId === 'MAX_ENERGY') {
          setPlayer(prev => ({ ...prev, maxEnergy: prev.maxEnergy + 1 }));
          showFeedback("최대 에너지 증가!");
      } else if (rewardId === 'DRAW_BONUS') {
          setPlayer(prev => ({ ...prev, nextTurnDraw: prev.nextTurnDraw + 1 })); 
      } else if (rewardId === 'START_BLOCK') {
          // Handled in startCombat
      }
      
      if (rewardId !== 'MAX_ENERGY') {
         setPlayer(prev => ({ ...prev, maxHp: prev.maxHp + 20, hp: prev.hp + 20 }));
         showFeedback("최대 체력 증가!");
      }

      setHasRested(false); // Reset rest status
      setGameState('REST');
  };
  
  const confirmBossReward = (type: 'ENERGY' | 'DRAW' | 'BLOCK') => {
      if (type === 'ENERGY') {
          setPlayer(prev => ({ ...prev, maxEnergy: prev.maxEnergy + 1 }));
          showFeedback("대장간 개조: 에너지 +1");
      } else if (type === 'DRAW') {
          setPlayer(prev => ({ ...prev, maxHp: prev.maxHp + 30, hp: prev.hp + 30 }));
          showFeedback("대장간 확장: 최대 체력 +30");
      } else {
          setPlayer(prev => ({ ...prev, gold: prev.gold + 200 }));
          showFeedback("대장간 지원금: +200 골드");
      }
      setHasRested(false); // Reset rest status
      setGameState('REST');
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
          setSelectedCardId(null); 
          setGameState('REMOVE_CARD');
      }
  };

  // Shop Logic
  const handleShopBuy = (item: 'HEAL' | 'REMOVE' | 'RARE' | 'ENERGY') => {
      const PRICES = { HEAL: 40, REMOVE: 50, RARE: 75, ENERGY: 200 };
      
      if (player.gold < PRICES[item]) {
          showFeedback("골드가 부족합니다!");
          return;
      }

      if (item === 'HEAL') {
          setPlayer(prev => ({ ...prev, gold: prev.gold - PRICES.HEAL, hp: Math.min(prev.maxHp, prev.hp + Math.floor(prev.maxHp * 0.5)) }));
          showFeedback("체력 회복!");
      } else if (item === 'REMOVE') {
          setPlayer(prev => ({ ...prev, gold: prev.gold - PRICES.REMOVE }));
          setSelectedCardId(null);
          setGameState('REMOVE_CARD'); // Go to remove screen
      } else if (item === 'RARE') {
          const rares = CARD_DATABASE.filter(c => c.rarity === CardRarity.RARE);
          const randomRare = rares[Math.floor(Math.random() * rares.length)];
          const newCard = { ...randomRare, instanceId: generateId() };
          setDeck(prev => [...prev, newCard]);
          setPlayer(prev => ({ ...prev, gold: prev.gold - PRICES.RARE }));
          // showFeedback(`${randomRare.name} 획득!`); // Replaced with modal
          setAcquiredCard(newCard); // Trigger Modal
      } else if (item === 'ENERGY') {
          setPlayer(prev => ({ ...prev, gold: prev.gold - PRICES.ENERGY, maxEnergy: prev.maxEnergy + 1 }));
          showFeedback("최대 에너지 +1 증가!");
      }
  };

  const handleConfirmRemoval = () => {
      if (!selectedCardId) return;
      
      setDeck(prev => prev.filter(c => c.instanceId !== selectedCardId));
      showFeedback("카드 제거 완료!");
      
      if (!isShopRemoval) {
          setHasRested(true);
      }
      setIsShopRemoval(false);
      setGameState('REST');
  };

  const [isShopRemoval, setIsShopRemoval] = useState(false);

  // Updated Shop Buy to track source
  const handleShopBuyWithFlag = (item: 'HEAL' | 'REMOVE' | 'RARE' | 'ENERGY') => {
      if (item === 'REMOVE') {
         if (player.gold < 50) {
             showFeedback("골드가 부족합니다!");
             return;
         }
         setPlayer(prev => ({ ...prev, gold: prev.gold - 50 }));
         setIsShopRemoval(true);
         setSelectedCardId(null);
         setGameState('REMOVE_CARD');
      } else {
          handleShopBuy(item);
      }
  }

  const handleCancelRemoval = () => {
      setIsShopRemoval(false);
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

const calculateWeaponStats = (): CraftedWeapon => {
    const { handle, head, deco } = slots;
    if (!handle || !head) return { totalCost: 0, damage: 0, block: 0, effects: [], hitCount: 1 };

    let totalCost = handle.cost + head.cost + (deco ? deco.cost : 0);
    
    // PRD: (Head + Deco) * Handle
    let baseValue = head.value;
    if (deco) baseValue += deco.value;

    // 309: Gambler's Handle - Random multiplier 1~3 (show average x2 for prediction)
    let handleMultiplier = handle.value;
    if (handle.id === 309) {
        handleMultiplier = 2; // Average for display, actual random in handleForgeAndAttack
    }
    // 218: Lightweight Handle - 0.75 multiplier (already in value)

    let finalValue = Math.floor(baseValue * handleMultiplier);

    // Handle "Cost 0" effect from Philosopher's Stone (ID 403)
    if (deco?.id === 403) totalCost = 0;

    let damage = finalValue;
    let block = 0;
    let hitCount = 1;

    // Logic for Spiked Shield (207) - Damage equals Block
    if (head.id === 207) {
        damage = player.block;
    }

    // Logic for Parrying Guard (102) OR Pot Lid (104) acting as Head
    if (handle.id === 102 || head.id === 104) {
      block = finalValue;
      if (head.id !== 207) damage = 0; // Spiked Shield retains damage
    }

    // Logic for Swift Dagger Hilt (201) -> Now applies Weak instead of -2 damage
    // Effect is applied in handleForgeAndAttack

    // Logic for Twin Fangs (306) -> Hit Count 2
    if (head.id === 306) {
        hitCount = 2;
    }

    // === Balance Patch v1.0 - New Card Effects ===

    // 209: Cogwheel - +1 damage per bleed stack
    if (head.id === 209) {
        damage += (enemy.statuses.bleed || 0);
    }

    // 210: Thorn Sigil (Deco) - Add 50% of current block as damage
    if (deco?.id === 210) {
        damage += Math.floor(player.block * 0.5);
    }

    // 211: Capacitor (Deco) - +4 damage per remaining energy (calculated at forge time)
    // This is handled in handleForgeAndAttack since we need remaining energy after cost

    // 213: Poison Needle - +damage equal to enemy poison stacks
    if (head.id === 213) {
        damage += (enemy.statuses.poison || 0);
    }

    // 310: Combo Strike - +2 damage per weapon used this turn
    if (head.id === 310) {
        damage += player.weaponsUsedThisTurn * 2;
    }

    // 311: Steel Plating (Deco) - Double block
    if (deco?.id === 311 && block > 0) {
        block *= 2;
    }

    // 406: Time Cog - No damage, just stun (handled in effects)
    if (head.id === 406) {
        damage = 0;
    }

    // 407: Growing Crystal - Add permanent bonus damage
    if (deco?.id === 407) {
        damage += growingCrystalBonus;
    }

    return { totalCost, damage, block, effects: [], hitCount };
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

  const handleForgeAndAttack = async () => {
    const stats = calculateWeaponStats();
    
    if (player.costLimit !== null && stats.totalCost > player.costLimit) {
        showFeedback(`과부하! 비용 ${player.costLimit} 이하만 가능!`);
        return;
    }

    if (stats.totalCost > player.energy) {
      showFeedback("기력이 부족합니다!");
      return;
    }

const effectMultiplier = slots.handle?.id === 301 ? 2 : 1;
    const isRareUsed = [slots.handle, slots.head, slots.deco].some(c => c?.rarity === CardRarity.RARE);

    // Calculate remaining energy after cost for 211 (Capacitor)
    const remainingEnergyAfterCost = player.energy - stats.totalCost;

    setPlayer(prev => ({ ...prev, energy: prev.energy - stats.totalCost, weaponsUsedThisTurn: prev.weaponsUsedThisTurn + 1 }));
    
    // === Balance Patch v1.0 - Pre-damage calculations ===
    let finalDamage = stats.damage;
    let finalBlock = stats.block;
    let ignoreBlock = false; // For 317 Piercing Handle
    let currentSelfDamage = player.selfDamageThisTurn; // Track self damage this weapon

    // 309: Gambler's Handle - Random multiplier 1~3
    if (slots.handle?.id === 309) {
        const randomMultiplier = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3
        const { head, deco } = slots;
        let baseValue = head!.value + (deco ? deco.value : 0);
        finalDamage = Math.floor(baseValue * randomMultiplier);
        showFeedback(`도박! x${randomMultiplier} 배율!`);
    }

    // 211: Capacitor - +4 damage per remaining energy
    if (slots.deco?.id === 211) {
        const bonusDmg = remainingEnergyAfterCost * 4;
        finalDamage += bonusDmg;
        if (bonusDmg > 0) showFeedback(`축전지 보너스 +${bonusDmg}!`, 'good');
    }

    // 317: Piercing Handle - Ignore enemy block
    if (slots.handle?.id === 317) {
        ignoreBlock = true;
    }

    // === Balance Patch v1.1 - Self-damage cards (applied before 320 bonus) ===
    // 318: Blood Handle - Self damage 4
    if (slots.handle?.id === 318) {
        const selfDmg = 4;
        setPlayer(prev => ({ ...prev, hp: Math.max(0, prev.hp - selfDmg), selfDamageThisTurn: prev.selfDamageThisTurn + selfDmg }));
        currentSelfDamage += selfDmg;
        showFeedback(`피의 자루! 자해 ${selfDmg}`, 'bad');
    }

    // 314: Frenzy Blade - Self damage 4
    if (slots.head?.id === 314) {
        const selfDmg = 4;
        setPlayer(prev => ({ ...prev, hp: Math.max(0, prev.hp - selfDmg), selfDamageThisTurn: prev.selfDamageThisTurn + selfDmg }));
        currentSelfDamage += selfDmg;
        showFeedback(`광기의 칼날! 자해 ${selfDmg}`, 'bad');
    }

    // 320: Berserker Rune - Add self damage taken this turn as bonus damage
    if (slots.deco?.id === 320) {
        const bonusDmg = currentSelfDamage;
        if (bonusDmg > 0) {
            finalDamage += bonusDmg;
            showFeedback(`광전사 보너스! +${bonusDmg}`, 'good');
        }
    }

    // 413: Dragon Sigil - Double final damage
    if (slots.deco?.id === 413) {
        finalDamage *= 2;
        showFeedback(`용의 문장! 피해 2배!`, 'good');
    }

    if (finalDamage > 0) {
        triggerShake();
    } else if (finalBlock > 0) {
        triggerShieldEffect();
    }
    
    // --- DAMAGE LOGIC (Multi-hit Support) ---
    if (finalDamage > 0) {
      let loops = stats.hitCount;
      if (slots.handle?.id === 301) loops *= 2; // Twin Handle effect

      for (let i = 0; i < loops; i++) {
          let actualDmg = finalDamage;

          // Vulnerable Calculation
          if (enemy.statuses.vulnerable > 0) {
              actualDmg = Math.floor(actualDmg * 1.5);
          }

          if (enemy.traits.includes(EnemyTrait.DAMAGE_CAP_15)) {
              if (actualDmg > 15) {
                  actualDmg = 15;
                  showFeedback("방어막: 피해 15로 제한!");
              }
          }

          if (enemy.traits.includes(EnemyTrait.THORNS_5)) {
              setPlayer(prev => ({ ...prev, hp: Math.max(0, prev.hp - 5) }));
              showFeedback("가시 반사! -5 HP", 'bad');
          }
          
          if (enemy.traits.includes(EnemyTrait.REACTIVE_RARE) && isRareUsed) {
              setEnemy(prev => ({
                  ...prev,
                  intents: prev.intents.map(i => i.type === IntentType.ATTACK ? { ...i, value: i.value + 2 } : i)
              }));
              showFeedback("코볼트가 희귀 카드를 보고 격분!");
          }

          // Apply Damage to Block First (unless ignoreBlock)
          let damageDealt = actualDmg;
          if (damageDealt > 0 && enemy.block > 0 && !ignoreBlock) {
              const blockDamage = Math.min(enemy.block, damageDealt);
              damageDealt -= blockDamage;
              setEnemy(prev => ({ ...prev, block: prev.block - blockDamage }));
              if (blockDamage > 0) showFeedback("방어도에 막힘!");
          } else if (ignoreBlock && enemy.block > 0) {
              showFeedback("관통! 방어도 무시!");
          }

          // Apply remaining damage to HP
          if (damageDealt > 0) {
              setEnemy(prev => {
                const newHp = Math.max(0, prev.currentHp - damageDealt);
                return { 
                    ...prev, 
                    currentHp: newHp,
                    damageTakenThisTurn: prev.damageTakenThisTurn + damageDealt 
                };
              });
              showFeedback(`${i > 0 ? '연타!' : ''} -${damageDealt} 피해!`);
          }

          // Midas Touch (307)
          if (slots.handle?.id === 307 && damageDealt > 0) {
              setPlayer(prev => ({ ...prev, gold: prev.gold + 5 }));
              showFeedback("+5 골드", 'good');
          }
          
          // Small delay between hits for visual feedback
          if (loops > 1) await new Promise(r => setTimeout(r, 200));
      }
    }

if (finalBlock > 0) {
      setPlayer(prev => ({ ...prev, block: prev.block + finalBlock }));
      triggerPlayerBlock();
      showFeedback(`+${finalBlock} 방어도`, 'good');
    }

    // --- EFFECT LOGIC ---

// 201: Swift Dagger Hilt - Apply Weak (reworked from -2 damage)
    if (slots.handle?.id === 201) {
        setEnemy(prev => ({
            ...prev,
            statuses: { ...prev.statuses, weak: (prev.statuses.weak || 0) + 1 }
        }));
        showFeedback("약화 부여!");
    }

    // 206: Bone Handle - Apply Vulnerable
    if (slots.handle?.id === 206) {
        setEnemy(prev => ({
            ...prev,
            statuses: { ...prev.statuses, vulnerable: (prev.statuses.vulnerable || 0) + 2 }
        }));
        showFeedback("취약 부여!");
    }

    // 208: Charged Gem - Restore Energy
    if (slots.deco?.id === 208) {
        setPlayer(prev => ({ ...prev, energy: Math.min(prev.maxEnergy, prev.energy + 1) }));
        showFeedback("에너지 +1", 'good');
    }

    // 404: Meteor Shard - Self Damage 6 (Balance Patch v1.1: 5->6)
    if (slots.head?.id === 404) {
        const selfDmg = 6;
        setPlayer(prev => ({ ...prev, hp: Math.max(0, prev.hp - selfDmg), selfDamageThisTurn: prev.selfDamageThisTurn + selfDmg }));
        showFeedback(`반동 피해 -${selfDmg} HP`, 'bad');
    }

if (slots.head?.id === 203 && stats.damage > 0) {
        const bleedAmt = 3 * effectMultiplier;
        setEnemy(prev => ({
            ...prev,
            statuses: { ...prev.statuses, bleed: (prev.statuses.bleed || 0) + bleedAmt }
        }));
        showFeedback(`출혈 ${bleedAmt} 부여!`);
    }

    // 303: Flamethrower - Apply Burn (reworked from unimplemented AoE)
    if (slots.head?.id === 303) {
        const burnAmt = 3 * effectMultiplier;
        setEnemy(prev => ({
            ...prev,
            statuses: { ...prev.statuses, burn: (prev.statuses.burn || 0) + burnAmt }
        }));
        showFeedback(`화상 ${burnAmt} 부여!`);
    }

if (slots.deco?.id === 205) {
        const POISON_AMT = 4; // Buffed from 3 to 4, cap removed
        setEnemy(prev => {
            const current = prev.statuses.poison || 0;
            return {
                ...prev,
                statuses: { ...prev.statuses, poison: current + POISON_AMT }
            };
        });
        showFeedback(`독 ${POISON_AMT} 부여!`);
    }

if (slots.handle?.id === 302 && finalDamage > 0) {
        const heal = Math.floor(finalDamage * 0.5);
        setPlayer(prev => ({...prev, hp: Math.min(prev.maxHp, prev.hp + heal)}));
        triggerPlayerHeal();
        showFeedback(`흡혈! +${heal} HP`, 'good');
    }

    if (slots.head?.id === 304) {
        const debuff = 5 * effectMultiplier;
        setPlayer(prev => {
            const remainingBlock = prev.block - debuff;
            if (remainingBlock < 0) {
                const damageTaken = Math.abs(remainingBlock);
                return {
                    ...prev,
                    block: 0,
                    hp: Math.max(0, prev.hp - damageTaken)
                };
            }
            return {
                ...prev,
                block: remainingBlock
            };
        });
        showFeedback(`방어도 -${debuff} (부족 시 반동)`, 'bad');
    }

if (slots.handle?.id === 401 && finalDamage > 0) {
        setEnemy(prev => ({
            ...prev,
            statuses: { ...prev.statuses, stunned: 1 } // Stun for 1 turn
        }));
        showFeedback("적 기절!");
    }

if (slots.deco?.id === 204 || slots.deco?.id === 106) {
        setPlayer(prev => ({ ...prev, nextTurnDraw: prev.nextTurnDraw + 1 }));
        showFeedback("다음 턴 드로우 +1 예약!", 'good');
    }

if (slots.deco?.id === 305) {
        const replica = createCardInstance(801); 
        replica.value = finalDamage;
        replica.description = `복제된 무기. 피해량 ${finalDamage}. 비용 0.`;
        setDeck(prev => [...prev, replica]);
        showFeedback("덱 맨 위로 복제!", 'good');
    }

    // === Balance Patch v1.0 - New Card Effects ===

    // 212: Lightweight Handle - Draw 1 if total cost <= 1
    if (slots.handle?.id === 212 && stats.totalCost <= 1) {
        drawCards(1);
        showFeedback("경량 보너스: 카드 1장 드로우!", 'good');
    }

    // 214: Blunt Club - Apply Weak 1
    if (slots.head?.id === 214) {
        setEnemy(prev => ({
            ...prev,
            statuses: { ...prev.statuses, weak: (prev.statuses.weak || 0) + 1 }
        }));
        showFeedback("약화 부여!");
    }

    // 308: Furnace Core - Apply Overheat 1
    if (slots.head?.id === 308) {
        setPlayer(prev => ({ ...prev, overheat: prev.overheat + 1 }));
        showFeedback("과열 1 획득! (다음 턴 에너지 -1)", 'bad');
    }

    // 312: Lava Blade - Apply Burn 4
    if (slots.head?.id === 312) {
        const burnAmt = 4 * effectMultiplier;
        setEnemy(prev => ({
            ...prev,
            statuses: { ...prev.statuses, burn: (prev.statuses.burn || 0) + burnAmt }
        }));
        showFeedback(`화상 ${burnAmt} 부여!`);
    }

    // === Balance Patch v1.1 - New Card Effects ===

    // 215: Agile Blade - Draw +1 next turn
    if (slots.head?.id === 215) {
        setPlayer(prev => ({ ...prev, nextTurnDraw: prev.nextTurnDraw + 1 }));
        showFeedback("다음 턴 드로우 +1!", 'good');
    }

    // 219: Weakening Sigil - Apply Weak 1
    if (slots.deco?.id === 219) {
        setEnemy(prev => ({
            ...prev,
            statuses: { ...prev.statuses, weak: (prev.statuses.weak || 0) + 1 }
        }));
        showFeedback("쇠약 부여!");
    }

    // 313: Mana Blade - Restore 1 energy
    if (slots.head?.id === 313) {
        setPlayer(prev => ({ ...prev, energy: Math.min(prev.maxEnergy, prev.energy + 1) }));
        showFeedback("에너지 +1!", 'good');
    }

    // 319: Blood Whetstone - Apply Bleed 2
    if (slots.deco?.id === 319) {
        const bleedAmt = 2 * effectMultiplier;
        setEnemy(prev => ({
            ...prev,
            statuses: { ...prev.statuses, bleed: (prev.statuses.bleed || 0) + bleedAmt }
        }));
        showFeedback(`출혈 ${bleedAmt} 부여!`);
    }

    // 408: Frost Blade - Stun 1
    if (slots.head?.id === 408) {
        setEnemy(prev => ({
            ...prev,
            statuses: { ...prev.statuses, stunned: 1 }
        }));
        showFeedback("적 기절!");
    }

    // 409: Executioner's Blade - Execute if enemy HP <= 20% max
    if (slots.head?.id === 409) {
        // Check after damage is applied
        setTimeout(() => {
            setEnemy(prev => {
                if (prev.currentHp > 0 && prev.currentHp <= prev.maxHp * 0.2) {
                    showFeedback("처형!");
                    return { ...prev, currentHp: 0 };
                }
                return prev;
            });
        }, 100);
    }

    // 412: Evasion Handle - Dodge next enemy attack
    if (slots.handle?.id === 412) {
        setPlayer(prev => ({ ...prev, dodgeNextAttack: true }));
        showFeedback("회피 준비!", 'good');
    }

    // 406: Time Cog - Stun 1 + Skip next intent
    if (slots.head?.id === 406) {
        setEnemy(prev => ({
            ...prev,
            statuses: { ...prev.statuses, stunned: 1 },
            currentIntentIndex: (prev.currentIntentIndex + 1) % prev.intents.length // Skip intent
        }));
        showFeedback("시간 정지! 적 기절 + 의도 스킵!");
    }

    // 407: Growing Crystal - Add permanent +2 damage bonus (max 16)
    if (slots.deco?.id === 407) {
        if (growingCrystalBonus < 16) {
            setGrowingCrystalBonus(prev => Math.min(16, prev + 2));
            showFeedback(`결정 성장! 영구 피해 +2 (현재: ${Math.min(16, growingCrystalBonus + 2)})`);
        }
    }

const isExhaust = slots.head?.id === 402;
    if (isExhaust) {
        showFeedback("공허의 수정 소멸!");
    }

    // 405: Infinite Loop - Return to hand (once per turn)
    let infiniteLoopCard: CardInstance | null = null;
    if (slots.handle?.id === 405 && !infiniteLoopUsed) {
        infiniteLoopCard = slots.handle;
        setInfiniteLoopUsed(true);
        showFeedback("무한 회귀: 손으로 귀환!", 'good');
    }

    const usedCards = [slots.handle, slots.head, slots.deco]
        .filter(c => c && c.id !== 402 && c.id !== 405) as CardInstance[];

    // Handle 405 returning to hand
    if (infiniteLoopCard) {
        setHand(prev => [...prev, infiniteLoopCard!]);
    }

    setDiscardPile(prev => [...prev, ...usedCards]);
    setSlots({ handle: null, head: null, deco: null });
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
          
          // Debuff Decrement Phase
          if (enemy.statuses.vulnerable > 0) {
              setEnemy(prev => ({ ...prev, statuses: { ...prev.statuses, vulnerable: prev.statuses.vulnerable - 1 } }));
          }
          if (enemy.statuses.weak > 0) {
              setEnemy(prev => ({ ...prev, statuses: { ...prev.statuses, weak: prev.statuses.weak - 1 } }));
          }

          if (enemy.statuses.stunned > 0) {
              setEnemy(prev => ({
                  ...prev,
                  statuses: { ...prev.statuses, stunned: Math.max(0, prev.statuses.stunned - 1) }
              }));
              showFeedback("적이 기절하여 행동 불가!");
              await new Promise(r => setTimeout(r, 1000));
              setCombatState(prev => ({ ...prev, turn: prev.turn + 1, phase: 'PLAYER_DRAW' }));
              return;
          }

if (enemy.statuses.poison > 0) {
              const pDmg = enemy.statuses.poison;
              setEnemy(prev => ({
                  ...prev,
                  currentHp: Math.max(0, prev.currentHp - pDmg),
                  statuses: { ...prev.statuses, poison: Math.max(0, prev.statuses.poison - 1) }
              }));
              triggerEnemyPoison();
              showFeedback(`독 피해 ${pDmg}!`);
              await new Promise(r => setTimeout(r, 800));
          }

          // Burn damage (does NOT decay unlike poison)
          if (enemy.statuses.burn > 0) {
              const burnDmg = enemy.statuses.burn;
              setEnemy(prev => ({
                  ...prev,
                  currentHp: Math.max(0, prev.currentHp - burnDmg)
                  // burn does NOT decrease
              }));
              triggerEnemyBurn();
              showFeedback(`화상 피해 ${burnDmg}!`);
              await new Promise(r => setTimeout(r, 800));
          }

          if (enemy.currentHp <= 0) return;

          const intent = enemy.intents[enemy.currentIntentIndex];
          let dmg = 0;

          if (enemy.id === 'hammerhead' && intent.type === IntentType.DEBUFF) {
             const allHandles = [...deck, ...discardPile].filter(c => c.type === CardType.HANDLE);
             if (allHandles.length > 0) {
                 const target = allHandles[Math.floor(Math.random() * allHandles.length)];
                 target.cost += 1;
                 showFeedback(`[${target.name}] 비용 +1`, 'bad');
             }
          }

          if (enemy.id === 'deus_ex_machina' && intent.description.includes('코스트 제한')) {
             setPlayer(prev => ({ ...prev, costLimit: 2 }));
             showFeedback("과부하: 다음 턴 비용 제한 2", 'bad');
          }

          if (enemy.id === 'corrupted_smith' && intent.type === IntentType.SPECIAL) {
             setPlayer(prev => ({ ...prev, disarmed: true }));
             showFeedback("무장 해제: 다음 턴 머리 사용 불가", 'bad');
          }

          if (enemy.id === 'mimic_anvil' && intent.description.includes('반사')) {
              dmg = enemy.damageTakenThisTurn;
          } else if (intent.type === IntentType.ATTACK) {
              dmg = intent.value;
          }

          if (intent.type === IntentType.ATTACK && enemy.statuses.strength > 0) {
             dmg += enemy.statuses.strength;
          }

          // Weak Status Logic
          if (intent.type === IntentType.ATTACK && enemy.statuses.weak > 0) {
              dmg = Math.floor(dmg * 0.75); // 25% damage reduction
          }

          const attackCount = intent.description.includes('(x3)') ? 3 : 1;

          if (intent.type === IntentType.ATTACK || (enemy.id === 'mimic_anvil' && intent.description.includes('반사'))) {
             triggerEnemyAttack();
             for (let i = 0; i < attackCount; i++) {
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

                 const unblockedDmg = Math.max(0, dmg - player.block);
                 setPlayer(p => ({ ...p, hp: Math.max(0, p.hp - unblockedDmg), block: Math.max(0, p.block - dmg) }));
                 
                  // Thievery Logic
                  if (enemy.traits.includes(EnemyTrait.THIEVERY) && unblockedDmg > 0) {
                      const stolen = Math.min(player.gold, 5);
                      if (stolen > 0) {
                          setPlayer(p => ({ ...p, gold: p.gold - stolen }));
                          showFeedback(`-${stolen} 골드 강탈!`, 'bad');
                      }
                  }

                  if (unblockedDmg > 0) {
                    triggerPlayerHit();
                    showFeedback(`${unblockedDmg} 피해!`, 'bad');
                  } else {
                    triggerPlayerBlock();
                    showFeedback("방어 성공!", 'good');
                  }
                 
                 if (i < attackCount - 1) await new Promise(r => setTimeout(r, 400));
             }

             if (enemy.statuses.strength > 0) {
                 setEnemy(prev => ({
                     ...prev,
                     statuses: { ...prev.statuses, strength: 0 }
                 }));
             }
          } 
          
          if (enemy.currentHp <= 0) return;

          if (intent.type === IntentType.BUFF) {
             if (intent.description.includes('공격력')) {
                 let gain = intent.value;
                 if (enemy.id === 'kobold_scrapper') {
                     gain = Math.floor(Math.random() * 3) + 1;
                 }
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
          } else if (intent.type === IntentType.DEBUFF && enemy.id !== 'hammerhead' && enemy.id !== 'deus_ex_machina') {
             const count = intent.value || 1;
             const junkCards: CardInstance[] = Array(count).fill(null).map(() => createCardInstance(901));
             setDiscardPile(prev => [...prev, ...junkCards]);
             showFeedback(`녹슨 덩어리 ${count}장 추가!`, 'bad');
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
  const weaponPrediction = calculateWeaponStats();
  const canCraft = !!(slots.handle && slots.head);

  // --- Render Sub-Screens ---

  if (gameState === 'MENU') {
    return (
      <div className="w-full h-screen-safe flex flex-col items-center justify-center bg-pixel-bg-dark text-stone-100 px-4 text-center relative overflow-hidden">
        {/* Animated Background Sparks */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-orange-500 animate-pulse opacity-50" />
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-yellow-500 animate-ping opacity-30" />
          <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-red-500 animate-pulse opacity-40" style={{ animationDelay: '0.5s' }} />
          <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-orange-400 animate-ping opacity-40" style={{ animationDelay: '1s' }} />
        </div>

        {/* Forge Glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-orange-600/20 blur-3xl pointer-events-none" />

        {/* Title */}
        <h1 className="font-pixel text-2xl md:text-4xl mb-2 text-orange-500 animate-pulse"
            style={{ textShadow: '4px 4px 0 #7c2d12, 0 0 20px rgba(249,115,22,0.5)' }}>
          FORGED IN CHAOS
        </h1>
        <h2 className="font-pixel-kr text-3xl md:text-5xl font-bold mb-6 text-orange-400"
            style={{ textShadow: '3px 3px 0 #431407' }}>
          혼돈의 대장간
        </h2>

        <p className="mb-10 text-base md:text-lg text-stone-400 font-pixel-kr">
          무기를 직접 제작하여 던전에서 살아남으세요.
        </p>

        {/* Start Button - 3D Pixel Style */}
        <button
          onClick={startGame}
          className="
            px-8 md:px-12 py-3 md:py-4
            pixel-border border-4 border-orange-400
            bg-gradient-to-b from-orange-500 to-orange-700
            font-pixel-kr text-lg md:text-xl font-bold text-white
            hover:from-orange-400 hover:to-orange-600
            active:translate-y-1
            transition-all
          "
          style={{
            boxShadow: '0 6px 0 0 #9a3412, 0 8px 10px rgba(0,0,0,0.5)',
          }}
        >
          대장간 입장
        </button>

        {/* Version */}
        <div className="absolute bottom-4 right-4 text-xs text-stone-600 font-pixel">
          v0.1
        </div>
      </div>
    );
  }

  if (gameState === 'WIN' || gameState === 'LOSE') {
    return (
      <div className="w-full h-screen-safe flex flex-col items-center justify-center bg-pixel-bg-dark text-stone-100 z-50 absolute inset-0">
        {/* Icon */}
        <div className={`
          p-6 pixel-border border-4 mb-6
          ${gameState === 'WIN' ? 'border-yellow-400 bg-yellow-900/50' : 'border-red-500 bg-red-900/50'}
        `}>
          {gameState === 'WIN'
            ? <Trophy size={64} className="text-yellow-400" />
            : <Skull size={64} className="text-red-400" />
          }
        </div>

        {/* Title */}
        <h2 className={`
          font-pixel text-2xl md:text-4xl mb-4
          ${gameState === 'WIN' ? 'text-yellow-400' : 'text-red-400'}
        `}
        style={{ textShadow: '3px 3px 0 #000' }}>
          {gameState === 'WIN' ? 'VICTORY!' : 'GAME OVER'}
        </h2>

        <p className="mb-2 font-pixel-kr text-xl md:text-2xl text-stone-300">
          {gameState === 'WIN' ? '최종 승리!' : '패배'}
        </p>

        <p className="mb-8 text-stone-500 font-pixel-kr">
          {gameState === 'WIN'
            ? '대장간의 전설이 되셨습니다.'
            : `Act ${act} - Floor ${floor} 에서 쓰러졌습니다.`}
        </p>

        {/* Stats Box */}
        <div className="pixel-border border-2 border-stone-600 bg-stone-900/80 p-4 mb-8 min-w-[200px]">
          <div className="flex justify-between gap-8 font-pixel-kr text-sm mb-2">
            <span className="text-stone-500">획득 골드:</span>
            <span className="text-yellow-400">{player.gold} G</span>
          </div>
          <div className="flex justify-between gap-8 font-pixel-kr text-sm">
            <span className="text-stone-500">도달 층:</span>
            <span className="text-stone-300">Act {act} - {floor}F</span>
          </div>
        </div>

        {/* Retry Button */}
        <button
          onClick={startGame}
          className="
            px-8 py-3
            pixel-border border-4 border-stone-500
            bg-gradient-to-b from-stone-600 to-stone-800
            font-pixel-kr text-base font-bold text-white
            hover:from-stone-500 hover:to-stone-700
            active:translate-y-1
            transition-all
          "
          style={{ boxShadow: '0 4px 0 0 #1c1917' }}
        >
          다시 하기
        </button>
      </div>
    );
  }

  // --- Boss Reward Screen (Forge Upgrade) ---
  if (gameState === 'BOSS_REWARD') {
      return (
        <div className="w-full h-screen-safe flex flex-col items-center justify-center bg-pixel-bg-dark text-stone-100 p-4">
            <h2 className="text-xl md:text-2xl font-pixel mb-3 text-yellow-400 flex items-center gap-3" style={{ textShadow: '0 0 15px rgba(250,204,21,0.5)' }}>
                <Hammer size={24} /> FORGE UPGRADE
            </h2>
            <p className="text-stone-400 font-pixel-kr text-sm mb-8 text-center">보스를 물리쳤습니다! 대장간을 업그레이드할 기회입니다.</p>

            <div className="flex flex-col md:flex-row gap-4 md:gap-6 mb-8">
                {/* Max Energy Option */}
                <button
                    onClick={() => confirmBossReward('ENERGY')}
                    className="w-full md:w-56 p-5
                      bg-gradient-to-b from-stone-700 to-stone-800
                      pixel-border border-4 border-yellow-700
                      flex flex-col items-center gap-3
                      hover:border-yellow-500 hover:from-stone-600 hover:to-stone-700
                      transition-all active:translate-y-1"
                    style={{ boxShadow: '0 4px 0 0 #1c1917' }}
                >
                    <div className="p-3 pixel-border border-2 bg-yellow-900/50 border-yellow-600 text-yellow-400">
                        <Zap size={32} fill="currentColor" />
                    </div>
                    <div className="text-center">
                        <h3 className="font-pixel-kr text-base font-bold text-yellow-400">확장 풀무</h3>
                        <p className="text-xs text-stone-400 font-pixel-kr mt-2">에너지 <span className="text-white font-pixel">+1</span></p>
                    </div>
                </button>

                {/* Max HP Option */}
                <button
                    onClick={() => confirmBossReward('DRAW')}
                    className="w-full md:w-56 p-5
                      bg-gradient-to-b from-stone-700 to-stone-800
                      pixel-border border-4 border-blue-700
                      flex flex-col items-center gap-3
                      hover:border-blue-500 hover:from-stone-600 hover:to-stone-700
                      transition-all active:translate-y-1"
                    style={{ boxShadow: '0 4px 0 0 #1c1917' }}
                >
                    <div className="p-3 pixel-border border-2 bg-blue-900/50 border-blue-600 text-blue-400">
                        <Heart size={32} fill="currentColor" />
                    </div>
                    <div className="text-center">
                        <h3 className="font-pixel-kr text-base font-bold text-blue-400">생명석 강화</h3>
                        <p className="text-xs text-stone-400 font-pixel-kr mt-2">최대 HP <span className="text-white font-pixel">+30</span></p>
                    </div>
                </button>

                {/* Gold Option */}
                <button
                    onClick={() => confirmBossReward('BLOCK')}
                    className="w-full md:w-56 p-5
                      bg-gradient-to-b from-stone-700 to-stone-800
                      pixel-border border-4 border-stone-600
                      flex flex-col items-center gap-3
                      hover:border-stone-400 hover:from-stone-600 hover:to-stone-700
                      transition-all active:translate-y-1"
                    style={{ boxShadow: '0 4px 0 0 #1c1917' }}
                >
                    <div className="p-3 pixel-border border-2 bg-stone-800 border-stone-500 text-stone-200">
                        <Coins size={32} />
                    </div>
                    <div className="text-center">
                        <h3 className="font-pixel-kr text-base font-bold text-stone-200">지원금</h3>
                        <p className="text-xs text-stone-400 font-pixel-kr mt-2">골드 <span className="text-yellow-400 font-pixel">+200</span></p>
                    </div>
                </button>
            </div>
        </div>
      );
  }

  // --- Shop Screen ---
  if (gameState === 'SHOP') {
      return (
          <div className="w-full h-screen-safe flex flex-col bg-pixel-bg-dark text-stone-100">
             <div className="p-4 md:p-6 bg-pixel-bg-mid pixel-border border-b-4 border-stone-700 flex justify-between items-center">
                 <h2 className="text-lg md:text-xl font-pixel flex items-center gap-2 text-yellow-400" style={{ textShadow: '0 0 10px rgba(250,204,21,0.5)' }}>
                     <Store size={20} /> BLACK MARKET
                 </h2>
                 <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 pixel-border border-2 border-yellow-600">
                     <Coins className="text-yellow-400" size={14} />
                     <span className="font-pixel text-sm text-yellow-300">{player.gold}</span>
                 </div>
             </div>

             <div className="flex-1 p-4 md:p-8 overflow-y-auto">
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                    {/* Card Removal */}
                    <button
                        onClick={() => handleShopBuyWithFlag('REMOVE')}
                        className="aspect-square bg-gradient-to-b from-stone-700 to-stone-800
                          pixel-border border-4 border-stone-600
                          flex flex-col items-center justify-center p-2
                          hover:border-red-500 hover:from-stone-600 hover:to-stone-700
                          transition-all group active:translate-y-1"
                        style={{ boxShadow: '0 4px 0 0 #1c1917' }}
                    >
                        <div className="p-2 pixel-border border-2 bg-red-900/40 border-red-700 mb-2 group-hover:bg-red-800/50">
                          <Flame size={28} className="text-red-400 group-hover:text-red-300 transition-colors" />
                        </div>
                        <div className="font-pixel-kr text-xs font-bold">카드 정화</div>
                        <div className="text-[8px] text-stone-400 font-pixel-kr text-center mb-1">카드 1장 제거</div>
                        <div className={`font-pixel text-xs ${player.gold >= 50 ? 'text-yellow-400' : 'text-red-500'}`}>50 G</div>
                    </button>

                    {/* Heal */}
                    <button
                        onClick={() => handleShopBuyWithFlag('HEAL')}
                        className="aspect-square bg-gradient-to-b from-stone-700 to-stone-800
                          pixel-border border-4 border-stone-600
                          flex flex-col items-center justify-center p-2
                          hover:border-green-500 hover:from-stone-600 hover:to-stone-700
                          transition-all group active:translate-y-1"
                        style={{ boxShadow: '0 4px 0 0 #1c1917' }}
                    >
                        <div className="p-2 pixel-border border-2 bg-green-900/40 border-green-700 mb-2 group-hover:bg-green-800/50">
                          <Heart size={28} className="text-green-400 group-hover:text-green-300 transition-colors" fill="currentColor" />
                        </div>
                        <div className="font-pixel-kr text-xs font-bold">긴급 수리</div>
                        <div className="text-[8px] text-stone-400 font-pixel-kr text-center mb-1">체력 50% 회복</div>
                        <div className={`font-pixel text-xs ${player.gold >= 40 ? 'text-yellow-400' : 'text-red-500'}`}>40 G</div>
                    </button>

                    {/* Rare Card */}
                    <button
                        onClick={() => handleShopBuyWithFlag('RARE')}
                        className="aspect-square bg-gradient-to-b from-stone-700 to-stone-800
                          pixel-border border-4 border-stone-600
                          flex flex-col items-center justify-center p-2
                          hover:border-purple-500 hover:from-stone-600 hover:to-stone-700
                          transition-all group active:translate-y-1"
                        style={{ boxShadow: '0 4px 0 0 #1c1917' }}
                    >
                        <div className="p-2 pixel-border border-2 bg-purple-900/40 border-purple-700 mb-2 group-hover:bg-purple-800/50">
                          <Sparkles size={28} className="text-purple-400 group-hover:text-purple-300 transition-colors" />
                        </div>
                        <div className="font-pixel-kr text-xs font-bold">희귀 도면</div>
                        <div className="text-[8px] text-stone-400 font-pixel-kr text-center mb-1">무작위 희귀</div>
                        <div className={`font-pixel text-xs ${player.gold >= 75 ? 'text-yellow-400' : 'text-red-500'}`}>75 G</div>
                    </button>

                    {/* Max Energy (Expensive) */}
                    <button
                        onClick={() => handleShopBuyWithFlag('ENERGY')}
                        className="aspect-square bg-gradient-to-b from-stone-700 to-stone-800
                          pixel-border border-4 border-stone-600
                          flex flex-col items-center justify-center p-2
                          hover:border-yellow-400 hover:from-stone-600 hover:to-stone-700
                          transition-all group relative overflow-hidden active:translate-y-1"
                        style={{ boxShadow: '0 4px 0 0 #1c1917' }}
                    >
                        <div className="absolute top-0 right-0 bg-yellow-600 font-pixel text-[7px] px-1.5 py-0.5 text-white pixel-border border-l-2 border-b-2 border-yellow-400">LIMITED</div>
                        <div className="p-2 pixel-border border-2 bg-yellow-900/40 border-yellow-700 mb-2 group-hover:bg-yellow-800/50">
                          <Zap size={28} className="text-yellow-400 group-hover:text-yellow-300 transition-colors" fill="currentColor" />
                        </div>
                        <div className="font-pixel-kr text-xs font-bold">마나 수정</div>
                        <div className="text-[8px] text-stone-400 font-pixel-kr text-center mb-1">에너지 +1</div>
                        <div className={`font-pixel text-xs ${player.gold >= 200 ? 'text-yellow-400' : 'text-red-500'}`}>200 G</div>
                    </button>
                 </div>
             </div>

             <div className="p-4 pixel-border border-t-4 border-stone-700 flex justify-end bg-pixel-bg-mid">
                 <button
                    onClick={() => setGameState('REST')}
                    className="px-5 py-2.5
                      bg-gradient-to-b from-stone-600 to-stone-700
                      pixel-border border-4 border-stone-500
                      font-pixel-kr text-sm font-bold text-stone-200
                      hover:from-stone-500 hover:to-stone-600
                      transition-all active:translate-y-1
                      flex items-center gap-2"
                    style={{ boxShadow: '0 4px 0 0 #1c1917' }}
                 >
                    <ArrowLeft size={16} /> 나가기
                 </button>
             </div>
          </div>
      )
  }

  // --- Reward Screen (Pixel Style) ---
  if (gameState === 'REWARD') {
      return (
        <div className="w-full h-screen-safe flex flex-col items-center justify-center bg-pixel-bg-dark text-stone-100 p-4">
            <h2 className="text-xl md:text-2xl font-pixel mb-8 text-yellow-400 flex items-center gap-3" style={{ textShadow: '0 0 15px rgba(250,204,21,0.5)' }}>
                <Trophy size={24} /> LOOT!
            </h2>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-10">
                {rewardOptions.map(card => (
                    <CardComponent
                        key={card.instanceId}
                        card={card}
                        onClick={() => handleSelectReward(card)}
                        className="hover:scale-110 hover:-translate-y-2 transition-transform cursor-pointer"
                    />
                ))}
            </div>
            <button
                onClick={() => handleSelectReward(null)}
                className="px-5 py-2
                  pixel-border border-4 border-stone-600
                  bg-gradient-to-b from-stone-700 to-stone-800
                  text-stone-400 hover:text-stone-200
                  font-pixel-kr text-sm
                  hover:from-stone-600 hover:to-stone-700
                  transition-all active:translate-y-1"
                style={{ boxShadow: '0 4px 0 0 #1c1917' }}
            >
                건너뛰기
            </button>
        </div>
      );
  }

  // --- Rest Screen (Refactored for Responsiveness & Logic) ---
  if (gameState === 'REST') {
      return (
        <div className="w-full h-screen-safe flex flex-col items-center justify-center bg-pixel-bg-dark text-stone-100 p-4 relative overflow-y-auto">
            {/* Header info - Pixel Style */}
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 px-3 py-1.5 pixel-border border-2 border-yellow-600 z-10">
                <Coins className="text-yellow-400" size={16} />
                <span className="font-pixel text-sm text-yellow-300">{player.gold}</span>
            </div>

            <div className="flex-shrink-0 mb-8 text-center mt-16 md:mt-0">
                <h2 className="text-xl md:text-2xl font-pixel mb-3 text-orange-400" style={{ textShadow: '0 0 10px rgba(251,146,60,0.5)' }}>
                  REST STOP
                </h2>
                <p className="text-stone-400 font-pixel-kr text-sm">다음 전투를 준비하세요.</p>
                {hasRested && <p className="text-red-400 font-pixel-kr text-xs mt-2">* 정비를 완료했습니다.</p>}
            </div>

            <div className="flex flex-wrap gap-4 w-full max-w-3xl justify-center items-center px-4 mb-8">
                {/* Repair Option - Pixel Style */}
                <button
                    onClick={() => handleRestAction('REPAIR')}
                    disabled={hasRested}
                    className={`
                        group relative w-32 h-44 md:w-40 md:h-56
                        pixel-border border-4
                        flex flex-col items-center justify-center
                        transition-all
                        ${hasRested
                            ? 'bg-stone-800 border-stone-700 opacity-50 grayscale cursor-not-allowed'
                            : 'bg-gradient-to-b from-stone-700 to-stone-800 border-stone-500 hover:border-green-500 hover:from-stone-600 hover:to-stone-700 active:translate-y-1'}
                    `}
                    style={{
                      boxShadow: hasRested ? 'none' : '0 4px 0 0 #1c1917'
                    }}
                >
                    <div className={`p-3 pixel-border border-2 mb-3 ${hasRested ? 'bg-stone-700 border-stone-600' : 'bg-green-900/50 border-green-700 group-hover:bg-green-800/50'}`}>
                      <Hammer size={28} className={`transition-colors ${hasRested ? 'text-stone-600' : 'text-green-400 group-hover:text-green-300'}`} />
                    </div>
                    <h3 className="font-pixel-kr text-base font-bold mb-1">수리</h3>
                    <p className="text-stone-400 font-pixel-kr text-[9px] px-2 text-center">체력 30% 회복</p>
                    <div className={`mt-2 font-pixel text-xs flex items-center gap-1 ${hasRested ? 'text-stone-600' : 'text-green-400'}`}>
                        <Heart size={12} fill="currentColor" /> +{Math.floor(player.maxHp * 0.3)}
                    </div>
                </button>

                {/* Smelt Option - Pixel Style */}
                <button
                    onClick={() => handleRestAction('SMELT')}
                    disabled={hasRested}
                    className={`
                        group relative w-32 h-44 md:w-40 md:h-56
                        pixel-border border-4
                        flex flex-col items-center justify-center
                        transition-all
                        ${hasRested
                            ? 'bg-stone-800 border-stone-700 opacity-50 grayscale cursor-not-allowed'
                            : 'bg-gradient-to-b from-stone-700 to-stone-800 border-stone-500 hover:border-red-500 hover:from-stone-600 hover:to-stone-700 active:translate-y-1'}
                    `}
                    style={{
                      boxShadow: hasRested ? 'none' : '0 4px 0 0 #1c1917'
                    }}
                >
                    <div className={`p-3 pixel-border border-2 mb-3 ${hasRested ? 'bg-stone-700 border-stone-600' : 'bg-red-900/50 border-red-700 group-hover:bg-red-800/50'}`}>
                      <Flame size={28} className={`transition-colors ${hasRested ? 'text-stone-600' : 'text-red-400 group-hover:text-red-300'}`} />
                    </div>
                    <h3 className="font-pixel-kr text-base font-bold mb-1">제련</h3>
                    <p className="text-stone-400 font-pixel-kr text-[9px] px-2 text-center">카드 1장 제거</p>
                    <div className={`mt-2 font-pixel text-xs flex items-center gap-1 ${hasRested ? 'text-stone-600' : 'text-red-400'}`}>
                        <Ban size={12} /> REMOVE
                    </div>
                </button>

                 {/* Shop Option - Pixel Style */}
                 <button
                    onClick={() => handleRestAction('SHOP')}
                    className="group relative w-32 h-44 md:w-40 md:h-56
                        pixel-border border-4
                        bg-gradient-to-b from-stone-700 to-stone-800 border-stone-500
                        flex flex-col items-center justify-center
                        hover:border-yellow-500 hover:from-stone-600 hover:to-stone-700
                        transition-all active:translate-y-1"
                    style={{
                      boxShadow: '0 4px 0 0 #1c1917'
                    }}
                >
                    <div className="p-3 pixel-border border-2 mb-3 bg-yellow-900/50 border-yellow-700 group-hover:bg-yellow-800/50">
                      <Store size={28} className="text-yellow-400 group-hover:text-yellow-300 transition-colors" />
                    </div>
                    <h3 className="font-pixel-kr text-base font-bold mb-1">상점</h3>
                    <p className="text-stone-400 font-pixel-kr text-[9px] px-2 text-center">아이템 구매</p>
                    <div className="mt-2 text-yellow-400 font-pixel text-xs flex items-center gap-1">
                        <Coins size={12} /> ENTER
                    </div>
                </button>
            </div>

            <div className="flex-shrink-0 pb-8">
                 <button
                    onClick={advanceGame}
                    className="flex items-center gap-2 px-6 py-2.5
                      bg-gradient-to-b from-stone-600 to-stone-700
                      pixel-border border-4 border-stone-500
                      text-stone-200 font-pixel-kr text-sm font-bold
                      hover:from-stone-500 hover:to-stone-600
                      transition-all active:translate-y-1"
                    style={{
                      boxShadow: '0 4px 0 0 #1c1917'
                    }}
                 >
                     다음 층으로 이동 <ChevronRight size={18} />
                 </button>
            </div>
        </div>
      );
  }

  // --- Remove Card Screen (Pixel Style) ---
  if (gameState === 'REMOVE_CARD') {
    const allCards = [...deck].sort((a,b) => a.cost - b.cost || a.type.localeCompare(b.type));
    const selectedName = allCards.find(c => c.instanceId === selectedCardId)?.name;

    return (
        <div className="w-full h-screen-safe flex flex-col bg-pixel-bg-dark text-stone-100 overflow-hidden">
            <div className="flex-shrink-0 text-center p-4 bg-pixel-bg-mid pixel-border border-b-4 border-stone-700 z-10">
                <h2 className="text-lg md:text-xl font-pixel text-red-400 mb-2 flex items-center justify-center gap-2" style={{ textShadow: '0 0 10px rgba(248,113,113,0.5)' }}>
                    <Flame size={20} /> SMELT CARD
                </h2>
                <p className="text-stone-400 font-pixel-kr text-xs">제거할 카드를 선택한 후 확인 버튼을 누르세요.</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-pixel-bg-dark">
                <div className="flex flex-wrap justify-center gap-4 pb-24">
                    {allCards.map(card => (
                        <div key={card.instanceId} className="relative group">
                            <CardComponent
                                card={card}
                                onClick={handleCardClick}
                                selected={selectedCardId === card.instanceId}
                                className={`cursor-pointer transition-all ${selectedCardId === card.instanceId ? 'ring-4 ring-red-500 scale-105 z-10' : 'hover:scale-105 opacity-80 hover:opacity-100'}`}
                            />
                            {selectedCardId === card.instanceId && (
                                <div className="absolute -top-2 -right-2 bg-red-500 text-white pixel-border border-2 border-red-300 p-1 z-20">
                                    <Check size={14} strokeWidth={4} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex-shrink-0 p-4 bg-pixel-bg-mid pixel-border border-t-4 border-stone-700 flex items-center justify-between gap-4 safe-area-bottom">
                <button
                    onClick={handleCancelRemoval}
                    className="flex items-center gap-2 px-4 py-2.5
                      pixel-border border-4 border-stone-600
                      bg-gradient-to-b from-stone-700 to-stone-800
                      text-stone-400 hover:text-white hover:from-stone-600 hover:to-stone-700
                      font-pixel-kr text-sm font-bold
                      transition-all active:translate-y-1"
                    style={{ boxShadow: '0 4px 0 0 #1c1917' }}
                >
                    <ArrowLeft size={16} /> 취소
                </button>

                <button
                    onClick={handleConfirmRemoval}
                    disabled={!selectedCardId}
                    className={`
                        flex-1 flex items-center justify-center gap-2 px-4 py-2.5
                        pixel-border border-4 font-pixel-kr text-sm font-bold
                        transition-all
                        ${selectedCardId
                            ? 'bg-gradient-to-b from-red-600 to-red-700 border-red-400 text-white hover:from-red-500 hover:to-red-600 active:translate-y-1'
                            : 'bg-stone-800 border-stone-700 text-stone-600 cursor-not-allowed'}
                    `}
                    style={{ boxShadow: selectedCardId ? '0 4px 0 0 #7f1d1d, 0 0 15px rgba(220,38,38,0.4)' : 'none' }}
                >
                    {selectedCardId ? `'${selectedName}' 제거` : '카드 선택 필요'} <Ban size={16} />
                </button>
            </div>
        </div>
    );
  }

  // --- Main Gameplay Screen ---
  return (
    <div className={`w-full h-screen-safe flex flex-col bg-stone-950 text-stone-200 overflow-hidden relative ${shake ? 'animate-shake' : ''} ${shieldEffect ? 'animate-shield-pulse' : ''} ${playerHit ? 'animate-player-hit' : ''}`}>
      
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
      {showIntentDetail && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85"
          onClick={() => setShowIntentDetail(false)}
          onTouchStart={(e) => { e.preventDefault(); setShowIntentDetail(false); }}
        >
          <div
            className={`
              relative p-5 max-w-xs w-[90%]
              pixel-border border-4
              ${enemy.intents[enemy.currentIntentIndex].type === IntentType.ATTACK ? 'bg-red-900 border-red-500' :
                enemy.intents[enemy.currentIntentIndex].type === IntentType.BUFF ? 'bg-green-900 border-green-500' :
                enemy.intents[enemy.currentIntentIndex].type === IntentType.DEBUFF ? 'bg-purple-900 border-purple-500' :
                enemy.intents[enemy.currentIntentIndex].type === IntentType.DEFEND ? 'bg-blue-900 border-blue-500' :
                'bg-stone-800 border-stone-500'}
            `}
            style={{ boxShadow: '6px 6px 0 0 rgba(0,0,0,0.6)' }}
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`
                pixel-border border-3 p-3 flex items-center justify-center
                ${enemy.intents[enemy.currentIntentIndex].type === IntentType.ATTACK ? 'bg-red-800 border-red-400' :
                  enemy.intents[enemy.currentIntentIndex].type === IntentType.BUFF ? 'bg-green-800 border-green-400' :
                  enemy.intents[enemy.currentIntentIndex].type === IntentType.DEBUFF ? 'bg-purple-800 border-purple-400' :
                  'bg-blue-800 border-blue-400'}
              `}>
                {enemy.intents[enemy.currentIntentIndex].type === IntentType.ATTACK ? <Skull size={32} className="text-red-300" /> :
                 enemy.intents[enemy.currentIntentIndex].type === IntentType.BUFF ? <RefreshCw size={32} className="text-green-300" /> :
                 enemy.intents[enemy.currentIntentIndex].type === IntentType.DEBUFF ? <Zap size={32} className="text-purple-300" /> :
                 <Shield size={32} className="text-blue-300" />}
              </div>
              <div>
                <h3 className="font-pixel-kr text-lg font-bold text-white" style={{ textShadow: '2px 2px 0 #000' }}>
                  {enemy.intents[enemy.currentIntentIndex].type === IntentType.ATTACK ? '공격' :
                   enemy.intents[enemy.currentIntentIndex].type === IntentType.DEFEND ? '방어' :
                   enemy.intents[enemy.currentIntentIndex].type === IntentType.BUFF ? '강화' :
                   enemy.intents[enemy.currentIntentIndex].type === IntentType.DEBUFF ? '약화' : '특수'}
                </h3>
                {enemy.intents[enemy.currentIntentIndex].value > 0 && (
                  <p className="font-pixel text-xl text-yellow-300">
                    {enemy.intents[enemy.currentIntentIndex].value}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-black/40 pixel-border border-2 border-black/50 p-3">
              <p className="font-pixel-kr text-sm text-stone-200 leading-relaxed">
                {enemy.intents[enemy.currentIntentIndex].description}
              </p>
            </div>

            {/* Close hint */}
            <p className="text-center mt-4 text-[10px] font-pixel-kr text-stone-400">
              화면을 터치하여 닫기
            </p>
          </div>
        </div>,
        document.body
      )}

      {/* --- Top: Enemy Section (Horizontal Layout) --- */}
      <div className="flex-[0_0_auto] h-[28%] min-h-[180px] flex justify-center items-center relative border-b border-stone-800 bg-stone-900/50 px-2">
        
        {/* Stage Indicator - Pixel Style */}
        <div className="absolute top-2 left-2 font-pixel text-[10px] text-stone-400 flex items-center gap-1 bg-black/50 px-2 py-1 pixel-border border-2 border-stone-700 z-10">
            <MapIcon size={12} />
            {act}-{floor}
        </div>

        {/* Gold Indicator - Pixel Style */}
        <div className="absolute top-2 right-2 flex items-center gap-1 font-pixel text-[10px] text-yellow-400 bg-black/60 px-2 py-1 pixel-border border-2 border-yellow-700 z-10">
            <Coins size={12} />
            {player.gold}
        </div>

        {/* Horizontal Enemy Layout */}
        <div className="flex items-center justify-center gap-3 md:gap-6 w-full max-w-xl mt-6">
          
          {/* Left: Intent (with long-press for mobile) */}
          <div 
            className="flex flex-col items-center animate-intent-drop flex-shrink-0 cursor-help"
            onTouchStart={(e) => {
              if (showIntentDetail) return;
              intentLongPressTimer.current = setTimeout(() => {
                setShowIntentDetail(true);
              }, 400);
            }}
            onTouchMove={() => {
              if (intentLongPressTimer.current) {
                clearTimeout(intentLongPressTimer.current);
                intentLongPressTimer.current = null;
              }
            }}
            onTouchEnd={() => {
              if (intentLongPressTimer.current) {
                clearTimeout(intentLongPressTimer.current);
                intentLongPressTimer.current = null;
              }
            }}
            onClick={() => setShowIntentDetail(true)}
          >
            <div className={`
              pixel-border border-3 p-2 flex items-center justify-center
              ${enemy.intents[enemy.currentIntentIndex].type === IntentType.ATTACK ? 'bg-red-900/80 border-red-500' :
                enemy.intents[enemy.currentIntentIndex].type === IntentType.BUFF ? 'bg-green-900/80 border-green-500' :
                enemy.intents[enemy.currentIntentIndex].type === IntentType.DEBUFF ? 'bg-purple-900/80 border-purple-500' :
                'bg-blue-900/80 border-blue-500'}
            `}>
              {enemy.intents[enemy.currentIntentIndex].type === IntentType.ATTACK ? <Skull size={24} className="text-red-400" /> :
               enemy.intents[enemy.currentIntentIndex].type === IntentType.BUFF ? <RefreshCw size={24} className="text-green-400" /> :
               enemy.intents[enemy.currentIntentIndex].type === IntentType.DEBUFF ? <Zap size={24} className="text-purple-400" /> :
               <Shield size={24} className="text-blue-400" />}
            </div>
            <div 
              className={`
                mt-1 px-2 py-0.5 pixel-border border-2 font-pixel text-xs flex items-center gap-1
                ${enemy.intents[enemy.currentIntentIndex].type === IntentType.ATTACK ? 'bg-red-800 border-red-400 text-red-200' :
                  enemy.intents[enemy.currentIntentIndex].type === IntentType.DEFEND ? 'bg-blue-800 border-blue-400 text-blue-200' :
                  enemy.intents[enemy.currentIntentIndex].type === IntentType.BUFF ? 'bg-green-800 border-green-400 text-green-200' :
                  enemy.intents[enemy.currentIntentIndex].type === IntentType.DEBUFF ? 'bg-purple-800 border-purple-400 text-purple-200' :
                  'bg-stone-800 border-stone-500 text-stone-200'}
              `}
            >
              {enemy.intents[enemy.currentIntentIndex].value > 0 && (
                <span className="font-bold">{enemy.intents[enemy.currentIntentIndex].value}</span>
              )}
            </div>
            {/* Hint for tap */}
            <div className="text-[7px] text-stone-500 mt-0.5 font-pixel-kr">TAP</div>
          </div>

          {/* Center: Sprite + HP + Name */}
          <div className={`flex flex-col items-center flex-shrink-0 ${enemyAttacking ? 'animate-enemy-attack' : ''}`}>
            {/* Enemy Sprite */}
            <div className={`
              w-24 h-24 md:w-32 md:h-32
              pixel-border border-3
              flex items-center justify-center
              relative overflow-hidden
              transition-all duration-150
              ${shake ? 'border-red-500 animate-hit-flash animate-knockback bg-red-900/30' : 
                enemyPoisoned ? 'border-green-500 animate-poison bg-green-900/30' :
                enemyBurning ? 'border-orange-500 animate-burn bg-orange-900/30' :
                enemyBleeding ? 'border-red-600 animate-bleed bg-red-900/30' :
                'border-stone-600 bg-stone-800'}
            `}>
              {React.createElement(getMonsterSprite(enemy.id), { className: 'w-20 h-20 md:w-28 md:h-28' })}
              
              {/* Block indicator on sprite */}
              {enemy.block > 0 && (
                <div className="absolute top-0 right-0 flex items-center gap-0.5 bg-blue-900 border-2 border-blue-400 text-blue-200 px-1 py-0.5 pixel-border text-[10px] font-pixel">
                    <Shield size={10} fill="currentColor" /> {enemy.block}
                </div>
              )}
            </div>
            
            {/* HP Bar - Compact */}
            <div className="w-28 md:w-36 relative mt-1">
              <div className="h-4 bg-stone-900 pixel-border border-2 border-stone-600 overflow-hidden relative flex">
                {Array.from({ length: 10 }).map((_, i) => {
                  const segmentPercent = (i + 1) * 10;
                  const hpPercent = (enemy.currentHp / enemy.maxHp) * 100;
                  const isFilled = hpPercent >= segmentPercent - 5;
                  return (
                    <div
                      key={i}
                      className={`flex-1 border-r border-black/30 last:border-r-0 transition-colors duration-150 ${
                        isFilled ? 'bg-gradient-to-b from-red-400 via-red-600 to-red-800' : 'bg-stone-800'
                      }`}
                    />
                  );
                })}
                <div className="absolute inset-0 flex items-center justify-center font-pixel text-[9px] text-white" style={{ textShadow: '1px 1px 0 #000' }}>
                  {enemy.currentHp}/{enemy.maxHp}
                </div>
              </div>
            </div>

            {/* Name + Traits inline */}
            <div className="mt-1 flex items-center gap-1 flex-wrap justify-center">
              <span className="font-pixel-kr font-bold text-stone-200 text-xs bg-black/50 px-1.5 py-0.5 pixel-border border border-stone-600">{enemy.name}</span>
              {enemy.traits.includes(EnemyTrait.THORNS_5) && (
                <span className="text-[8px] bg-green-900 border border-green-600 px-1 pixel-border font-pixel-kr text-green-300">가시</span>
              )}
              {enemy.traits.includes(EnemyTrait.DAMAGE_CAP_15) && (
                <span className="text-[8px] bg-stone-700 border border-stone-500 px-1 pixel-border font-pixel-kr text-stone-300">MAX15</span>
              )}
              {enemy.traits.includes(EnemyTrait.THIEVERY) && (
                <span className="text-[8px] bg-yellow-900 border border-yellow-600 px-1 pixel-border font-pixel-kr text-yellow-300">탐욕</span>
              )}
            </div>
          </div>

          {/* Right: Status Effects (Vertical) */}
          <div className="flex flex-col gap-1 flex-shrink-0">
            {enemy.statuses?.poison > 0 && (
              <div className="flex items-center gap-1 bg-green-900/60 pixel-border border-2 border-green-600 px-1.5 py-0.5 text-[9px] text-green-400 font-pixel">
                <Droplets size={10} fill="currentColor" /> {enemy.statuses.poison}
              </div>
            )}
            {enemy.statuses?.bleed > 0 && (
              <div className="flex items-center gap-1 bg-red-900/60 pixel-border border-2 border-red-600 px-1.5 py-0.5 text-[9px] text-red-400 font-pixel">
                <Activity size={10} /> {enemy.statuses.bleed}
              </div>
            )}
            {enemy.statuses?.burn > 0 && (
              <div className="flex items-center gap-1 bg-orange-900/60 pixel-border border-2 border-orange-600 px-1.5 py-0.5 text-[9px] text-orange-400 font-pixel">
                <Flame size={10} /> {enemy.statuses.burn}
              </div>
            )}
            {enemy.statuses?.stunned > 0 && (
              <div className="flex items-center gap-1 bg-yellow-900/60 pixel-border border-2 border-yellow-600 px-1.5 py-0.5 text-[9px] text-yellow-400 font-pixel">
                <Star size={10} fill="currentColor" /> {enemy.statuses.stunned}
              </div>
            )}
            {enemy.statuses?.strength > 0 && (
              <div className="flex items-center gap-1 bg-red-900/60 pixel-border border-2 border-red-600 px-1.5 py-0.5 text-[9px] text-red-400 font-pixel">
                <Swords size={10} /> +{enemy.statuses.strength}
              </div>
            )}
            {enemy.statuses?.vulnerable > 0 && (
              <div className="flex items-center gap-1 bg-purple-900/60 pixel-border border-2 border-purple-600 px-1.5 py-0.5 text-[9px] text-purple-400 font-pixel">
                <Percent size={10} /> {enemy.statuses.vulnerable}
              </div>
            )}
            {enemy.statuses?.weak > 0 && (
              <div className="flex items-center gap-1 bg-stone-700/60 pixel-border border-2 border-stone-500 px-1.5 py-0.5 text-[9px] text-stone-300 font-pixel">
                <ArrowLeft size={10} className="rotate-[-45deg]" /> {enemy.statuses.weak}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- Middle: Anvil / Crafting --- */}
      <div className="flex-1 relative flex flex-col justify-center items-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-stone-800 to-stone-950 px-2 md:px-4 overflow-y-auto">

        {/* Player Stats HUD - Pixel Style */}
        <div className="absolute left-2 top-2 md:left-4 md:top-4 flex flex-col gap-1 md:gap-2 z-20 pointer-events-none">
           <div className={`flex items-center gap-2 font-pixel text-sm md:text-base text-pixel-hp bg-black/50 px-2 py-1 pixel-border border-2 border-red-800 transition-all ${playerHealing ? 'animate-heal' : ''} ${playerHit ? 'animate-hp-flash border-red-400' : ''}`}>
              <Heart className={`w-4 h-4 md:w-5 md:h-5 fill-current ${playerHit ? 'animate-pulse' : ''}`} /> {player.hp}
           </div>
           <div className={`flex items-center gap-2 font-pixel text-sm md:text-base text-pixel-block bg-black/50 px-2 py-1 pixel-border border-2 border-blue-800 transition-all ${playerBlocking ? 'animate-block-gain' : ''}`}>
              <Shield className="w-4 h-4 md:w-5 md:h-5 fill-current" /> {player.block}
           </div>
           <div className="flex items-center gap-2 font-pixel text-xs md:text-sm text-pixel-energy bg-black/50 px-2 py-1 pixel-border border-2 border-yellow-800">
              <div className="flex gap-0.5">
                {Array.from({ length: player.maxEnergy }).map((_, i) => (
                  <div key={i} className={`w-2.5 h-2.5 md:w-3 md:h-3 pixel-border border border-yellow-600 ${i < player.energy ? 'bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,0.7)]' : 'bg-stone-800'}`} />
                ))}
              </div>
           </div>
           {/* Debuff Indicators */}
           <div className="flex flex-col gap-1 mt-2">
               {player.disarmed && (
                   <div className="flex items-center gap-1 text-red-400 font-pixel text-[8px] bg-black/60 px-2 py-1 pixel-border border-2 border-red-600">
                       <Ban size={10} /> DISARM
                   </div>
               )}
               {player.costLimit !== null && (
                   <div className="flex items-center gap-1 text-purple-400 font-pixel text-[8px] bg-black/60 px-2 py-1 pixel-border border-2 border-purple-600">
                       <Lock size={10} /> LIMIT:{player.costLimit}
                   </div>
               )}
           </div>
        </div>

        {/* Deck/Discard HUD - Pixel Style */}
        <div className="absolute right-2 top-2 md:right-4 md:top-4 flex flex-col gap-1 md:gap-2 z-20 pointer-events-none items-end">
          <div className="flex items-center gap-2 text-stone-300 font-pixel text-[9px] md:text-[10px] bg-black/60 px-2 py-1 pixel-border border-2 border-stone-600">
             <Layers size={12} />
             <span>DECK</span>
             <span className="text-white">{deck.length}</span>
          </div>
          <div className="flex items-center gap-2 text-stone-400 font-pixel text-[9px] md:text-[10px] bg-black/60 px-2 py-1 pixel-border border-2 border-stone-700">
             <Archive size={12} />
             <span>DISC</span>
             <span className="text-stone-300">{discardPile.length}</span>
          </div>
        </div>

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