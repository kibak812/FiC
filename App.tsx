import React, { useState, useEffect, useRef } from 'react';
import { 
  CardInstance, CardType, CombatState, PlayerStats, EnemyData, 
  IntentType, CraftedWeapon, CardRarity, EnemyTrait, EnemyTier
} from './types';
import { CARD_DATABASE, INITIAL_DECK_IDS, ENEMIES, ENEMY_POOLS } from './constants';
import CardComponent from './components/CardComponent';
import Anvil from './components/Anvil';
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
    hp: 50, maxHp: 50, energy: 3, maxEnergy: 3, block: 0, gold: 0, costLimit: null, disarmed: false, nextTurnDraw: 0
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
  const [feedback, setFeedback] = useState<string | null>(null);

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

  const showFeedback = (text: string) => {
    setFeedback(text);
    setTimeout(() => setFeedback(null), 1500);
  };

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
    setPlayer(prev => ({...prev, energy: prev.maxEnergy, block: 0, costLimit: null, disarmed: false, nextTurnDraw: 0}));
    setGameState('PLAYING');
    setCombatState({ turn: 1, phase: 'PLAYER_DRAW' });
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
    
    setPlayer({ hp: 50, maxHp: 50, energy: 3, maxEnergy: 3, block: 0, gold: 0, costLimit: null, disarmed: false, nextTurnDraw: 0 });
    
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

    let finalValue = baseValue * handle.value;

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

    // Logic for Swift Dagger Hilt (201) -> DMG -2 (min 0)
    if (handle.id === 201 && damage > 0) {
        damage = Math.max(0, damage - 2);
    }

    // Logic for Twin Fangs (306) -> Hit Count 2
    if (head.id === 306) {
        hitCount = 2;
    }

    // Logic for Twin Handle (301) -> Handle Multiplier was applied, but effect might double hit count?
    // "Head effect triggers twice". For damage heads, usually means dmg x2 (already calc in value) OR hits twice.
    // Let's interpret it as hits twice if it's an attack, or value x2 if simple. 
    // Current simple logic: value x2 (handled by handle.value). 
    // But description says "Effect triggers twice". 
    // Let's make it simple: if Handle 301 is used, hitCount +1
    // (Wait, logic in existing code was `effectMultiplier`... let's keep consistent)

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

    setPlayer(prev => ({ ...prev, energy: prev.energy - stats.totalCost }));
    
    if (stats.damage > 0) {
        triggerShake();
    } else if (stats.block > 0) {
        triggerShieldEffect();
    }
    
    // --- DAMAGE LOGIC (Multi-hit Support) ---
    if (stats.damage > 0) {
      let loops = stats.hitCount;
      if (slots.handle?.id === 301) loops *= 2; // Twin Handle effect

      for (let i = 0; i < loops; i++) {
          let actualDmg = stats.damage;

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
              showFeedback("가시 반사! -5 HP");
          }
          
          if (enemy.traits.includes(EnemyTrait.REACTIVE_RARE) && isRareUsed) {
              setEnemy(prev => ({
                  ...prev,
                  intents: prev.intents.map(i => i.type === IntentType.ATTACK ? { ...i, value: i.value + 2 } : i)
              }));
              showFeedback("코볼트가 희귀 카드를 보고 격분!");
          }

          // Apply Damage to Block First
          let damageDealt = actualDmg;
          if (damageDealt > 0 && enemy.block > 0) {
              const blockDamage = Math.min(enemy.block, damageDealt);
              damageDealt -= blockDamage;
              setEnemy(prev => ({ ...prev, block: prev.block - blockDamage }));
              if (blockDamage > 0) showFeedback("방어도에 막힘!");
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
              showFeedback("+5 골드");
          }
          
          // Small delay between hits for visual feedback
          if (loops > 1) await new Promise(r => setTimeout(r, 200));
      }
    }

    if (stats.block > 0) {
      setPlayer(prev => ({ ...prev, block: prev.block + stats.block }));
      showFeedback(`+${stats.block} 방어도`);
    }

    // --- EFFECT LOGIC ---

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
        showFeedback("에너지 +1");
    }

    // 404: Meteor Shard - Self Damage
    if (slots.head?.id === 404) {
        setPlayer(prev => ({ ...prev, hp: Math.max(0, prev.hp - 5) }));
        showFeedback("반동 피해 -5 HP");
    }

    if (slots.head?.id === 203 && stats.damage > 0) {
        const bleedAmt = 3 * effectMultiplier;
        setEnemy(prev => ({
            ...prev,
            statuses: { ...prev.statuses, bleed: (prev.statuses.bleed || 0) + bleedAmt }
        }));
        showFeedback(`출혈 ${bleedAmt} 부여!`);
    }

    if (slots.deco?.id === 205) {
        const POISON_AMT = 3;
        const POISON_CAP = 6;
        setEnemy(prev => {
            const current = prev.statuses.poison || 0;
            const next = Math.min(current + POISON_AMT, POISON_CAP);
            return {
                ...prev,
                statuses: { ...prev.statuses, poison: next }
            };
        });
        showFeedback(`독 ${POISON_AMT} 부여!`);
    }

    if (slots.handle?.id === 302 && stats.damage > 0) {
        const heal = Math.floor(stats.damage * 0.5);
        setPlayer(prev => ({...prev, hp: Math.min(prev.maxHp, prev.hp + heal)}));
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
        showFeedback(`방어도 -${debuff} (부족 시 반동)`);
    }

    if (slots.handle?.id === 401 && stats.damage > 0) {
        setEnemy(prev => ({
            ...prev,
            statuses: { ...prev.statuses, stunned: 1 } // Stun for 1 turn
        }));
        showFeedback("적 기절!");
    }

    if (slots.deco?.id === 204) {
        setPlayer(prev => ({ ...prev, nextTurnDraw: prev.nextTurnDraw + 1 }));
        showFeedback("다음 턴 드로우 +1 예약!");
    }

    if (slots.deco?.id === 305) {
        const replica = createCardInstance(801); 
        replica.value = stats.damage;
        replica.description = `복제된 무기. 피해량 ${stats.damage}. 비용 0.`;
        setDeck(prev => [...prev, replica]);
        showFeedback("덱 맨 위로 복제!");
    }

    const isExhaust = slots.head?.id === 402;
    if (isExhaust) {
        showFeedback("공허의 수정 소멸!");
    }

    const usedCards = [slots.handle, slots.head, slots.deco]
        .filter(c => c && c.id !== 402) as CardInstance[];

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
          setPlayer(p => ({ 
              ...p, 
              energy: p.maxEnergy, 
              block: 0,
              nextTurnDraw: 0 
          })); 
          setEnemy(prev => ({ ...prev, damageTakenThisTurn: 0 })); 
          drawCards(drawCount);
          if (drawCount > 5) showFeedback(`추가 드로우 +${drawCount - 5}!`);
          setCombatState(prev => ({ ...prev, phase: 'PLAYER_ACTION' }));
          break;

        case 'PLAYER_DISCARD':
          setPlayer(prev => ({ ...prev, costLimit: null, disarmed: false }));
          const allRemaining = [...hand, slots.handle, slots.head, slots.deco].filter(Boolean) as CardInstance[];
          setDiscardPile(prev => [...prev, ...allRemaining]);
          setHand([]);
          setSlots({ handle: null, head: null, deco: null });
          setCombatState(prev => ({ ...prev, phase: 'ENEMY_TURN' }));
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
              triggerShake();
              showFeedback(`독 피해 ${pDmg}!`);
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
                 showFeedback(`[${target.name}] 비용 +1`);
             }
          }

          if (enemy.id === 'deus_ex_machina' && intent.description.includes('코스트 제한')) {
             setPlayer(prev => ({ ...prev, costLimit: 2 }));
             showFeedback("과부하: 다음 턴 비용 제한 2");
          }

          if (enemy.id === 'corrupted_smith' && intent.type === IntentType.SPECIAL) {
             setPlayer(prev => ({ ...prev, disarmed: true }));
             showFeedback("무장 해제: 다음 턴 머리 사용 불가");
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
             for (let i = 0; i < attackCount; i++) {
                 if (enemy.statuses.bleed > 0) {
                     const bDmg = enemy.statuses.bleed;
                     setEnemy(prev => ({
                        ...prev,
                        currentHp: Math.max(0, prev.currentHp - bDmg),
                        statuses: { ...prev.statuses, bleed: Math.max(0, prev.statuses.bleed - 1) }
                     }));
                     showFeedback(`출혈 피해 ${bDmg}!`);
                     await new Promise(r => setTimeout(r, 400));
                 }
                 if (enemy.currentHp <= 0) break;

                 const unblockedDmg = Math.max(0, dmg - player.block);
                 setPlayer(p => ({ ...p, hp: Math.max(0, p.hp - unblockedDmg), block: Math.max(0, p.block - dmg) }));
                 
                 // Thievery Logic
                 if (enemy.traits.includes(EnemyTrait.THIEVERY) && unblockedDmg > 0) {
                     const stolen = Math.min(player.gold, 5);
                     if (stolen > 0) {
                         setPlayer(p => ({ ...p, gold: p.gold - stolen }));
                         showFeedback(`-${stolen} 골드 강탈!`);
                     }
                 }

                 if (unblockedDmg > 0) {
                   triggerShake();
                   showFeedback(`${unblockedDmg} 피해!`);
                 } else {
                   showFeedback("방어 성공!");
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
                     showFeedback(`칼날 연마!`);
                 } else {
                     setEnemy(prev => ({
                         ...prev,
                         statuses: { ...prev.statuses, strength: (prev.statuses.strength || 0) + gain }
                     }));
                 }
                 
                 if (enemy.id === 'kobold_scrapper') {
                     showFeedback(`일시적 공격력 +${gain} 증가!`);
                 } else if (enemy.id !== 'shadow_assassin') {
                     showFeedback(`공격력 +${gain} 증가!`);
                 }
             } else {
                 setEnemy(e => ({ ...e, currentHp: Math.min(e.maxHp, e.currentHp + intent.value) }));
                 showFeedback(`적 회복 +${intent.value} HP`);
             }
          } else if (intent.type === IntentType.DEBUFF && enemy.id !== 'hammerhead' && enemy.id !== 'deus_ex_machina') {
             const count = intent.value || 1;
             const junkCards: CardInstance[] = Array(count).fill(null).map(() => createCardInstance(901));
             setDiscardPile(prev => [...prev, ...junkCards]);
             showFeedback(`녹슨 덩어리 ${count}장 추가!`);
          } else if (intent.type === IntentType.DEFEND) {
             // Basic enemy logic doesn't support enemy block visually yet, but we can simulate intent success
             setEnemy(prev => ({ ...prev, block: (prev.block || 0) + intent.value }));
             showFeedback(`적 방어 +${intent.value}`);
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
      <div className="w-full h-screen flex flex-col items-center justify-center bg-stone-900 text-stone-100 font-serif px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter text-orange-500 uppercase drop-shadow-lg">혼돈의 대장간</h1>
        <p className="mb-12 text-lg md:text-xl text-stone-400">무기를 직접 제작하여 던전에서 살아남으세요.</p>
        <button 
          onClick={startGame}
          className="px-8 py-4 bg-orange-600 hover:bg-orange-500 rounded text-xl font-bold transition-all shadow-lg hover:shadow-orange-500/50"
        >
          대장간 입장
        </button>
      </div>
    );
  }

  if (gameState === 'WIN' || gameState === 'LOSE') {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-black/90 text-stone-100 z-50 absolute inset-0">
        {gameState === 'WIN' ? <Trophy size={64} className="text-yellow-500 mb-4" /> : <Skull size={64} className="text-red-500 mb-4" />}
        <h2 className="text-5xl font-bold mb-4">{gameState === 'WIN' ? '최종 승리!' : '패배'}</h2>
        <p className="mb-8 text-stone-400">{gameState === 'WIN' ? '대장간의 전설이 되셨습니다.' : `Act ${act} - Floor ${floor} 에서 쓰러졌습니다.`}</p>
        <button 
          onClick={startGame}
          className="px-6 py-3 border border-stone-500 hover:bg-stone-800 rounded mt-8"
        >
          다시 하기
        </button>
      </div>
    );
  }

  // --- Boss Reward Screen (Forge Upgrade) ---
  if (gameState === 'BOSS_REWARD') {
      return (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-stone-950 text-stone-100 p-4">
            <h2 className="text-3xl font-bold mb-2 text-yellow-500 flex items-center gap-2">
                <Hammer /> 대장간 개조
            </h2>
            <p className="text-stone-400 mb-10 text-center">보스를 물리쳤습니다! 대장간을 업그레이드할 기회입니다.</p>
            
            <div className="flex flex-col md:flex-row gap-6 mb-8">
                {/* Max Energy Option */}
                <button 
                    onClick={() => confirmBossReward('ENERGY')}
                    className="w-full md:w-64 p-6 bg-stone-900 border-2 border-yellow-600/50 hover:border-yellow-500 hover:bg-stone-800 rounded-xl flex flex-col items-center gap-4 transition-all hover:scale-105"
                >
                    <div className="p-4 rounded-full bg-yellow-900/30 text-yellow-400">
                        <Zap size={40} fill="currentColor" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-xl font-bold text-yellow-400">확장 풀무</h3>
                        <p className="text-sm text-stone-400 mt-2">최대 에너지가 <span className="text-white font-bold">+1</span> 증가합니다.</p>
                    </div>
                </button>

                {/* Max HP Option */}
                <button 
                    onClick={() => confirmBossReward('DRAW')}
                    className="w-full md:w-64 p-6 bg-stone-900 border-2 border-blue-600/50 hover:border-blue-500 hover:bg-stone-800 rounded-xl flex flex-col items-center gap-4 transition-all hover:scale-105"
                >
                    <div className="p-4 rounded-full bg-blue-900/30 text-blue-400">
                        <Heart size={40} fill="currentColor" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-xl font-bold text-blue-400">생명석 강화</h3>
                        <p className="text-sm text-stone-400 mt-2">최대 체력이 <span className="text-white font-bold">+30</span> 증가합니다.</p>
                    </div>
                </button>

                {/* Gold Option */}
                <button 
                    onClick={() => confirmBossReward('BLOCK')}
                    className="w-full md:w-64 p-6 bg-stone-900 border-2 border-stone-600 hover:border-stone-400 hover:bg-stone-800 rounded-xl flex flex-col items-center gap-4 transition-all hover:scale-105"
                >
                    <div className="p-4 rounded-full bg-stone-800 text-stone-200">
                        <Coins size={40} />
                    </div>
                    <div className="text-center">
                        <h3 className="text-xl font-bold text-stone-200">대장간 지원금</h3>
                        <p className="text-sm text-stone-400 mt-2">즉시 <span className="text-white font-bold">200 골드</span>를 획득합니다.</p>
                    </div>
                </button>
            </div>
        </div>
      );
  }

  // --- Shop Screen ---
  if (gameState === 'SHOP') {
      return (
          <div className="w-full h-screen flex flex-col bg-stone-950 text-stone-100">
             <div className="p-4 md:p-6 bg-stone-900 border-b border-stone-800 flex justify-between items-center">
                 <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 text-yellow-500">
                     <Store /> 암시장
                 </h2>
                 <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-stone-700">
                     <Coins className="text-yellow-400" size={16} />
                     <span className="font-bold text-lg">{player.gold} G</span>
                 </div>
             </div>
             
             <div className="flex-1 p-4 md:p-8 overflow-y-auto">
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                    {/* Card Removal */}
                    <button 
                        onClick={() => handleShopBuyWithFlag('REMOVE')}
                        className="aspect-square bg-stone-900 border border-stone-700 rounded-lg flex flex-col items-center justify-center p-2 hover:border-red-500 hover:bg-stone-800 transition-all group"
                    >
                        <Flame size={32} className="text-stone-500 group-hover:text-red-500 transition-colors mb-2" />
                        <div className="text-sm md:text-base font-bold">카드 정화</div>
                        <div className="text-[10px] text-stone-400 text-center mb-2">카드 1장 제거</div>
                        <div className={`font-bold text-sm ${player.gold >= 50 ? 'text-yellow-400' : 'text-red-500'}`}>50 G</div>
                    </button>

                    {/* Heal */}
                    <button 
                        onClick={() => handleShopBuyWithFlag('HEAL')}
                        className="aspect-square bg-stone-900 border border-stone-700 rounded-lg flex flex-col items-center justify-center p-2 hover:border-green-500 hover:bg-stone-800 transition-all group"
                    >
                        <Heart size={32} className="text-stone-500 group-hover:text-green-500 transition-colors mb-2" fill="currentColor" />
                        <div className="text-sm md:text-base font-bold">긴급 수리</div>
                        <div className="text-[10px] text-stone-400 text-center mb-2">최대 체력 50% 회복</div>
                        <div className={`font-bold text-sm ${player.gold >= 40 ? 'text-yellow-400' : 'text-red-500'}`}>40 G</div>
                    </button>

                    {/* Rare Card */}
                    <button 
                        onClick={() => handleShopBuyWithFlag('RARE')}
                        className="aspect-square bg-stone-900 border border-stone-700 rounded-lg flex flex-col items-center justify-center p-2 hover:border-purple-500 hover:bg-stone-800 transition-all group"
                    >
                        <Sparkles size={32} className="text-stone-500 group-hover:text-purple-500 transition-colors mb-2" />
                        <div className="text-sm md:text-base font-bold">희귀 도면</div>
                        <div className="text-[10px] text-stone-400 text-center mb-2">무작위 희귀 카드</div>
                        <div className={`font-bold text-sm ${player.gold >= 75 ? 'text-yellow-400' : 'text-red-500'}`}>75 G</div>
                    </button>

                    {/* Max Energy (Expensive) */}
                    <button 
                        onClick={() => handleShopBuyWithFlag('ENERGY')}
                        className="aspect-square bg-stone-900 border border-stone-700 rounded-lg flex flex-col items-center justify-center p-2 hover:border-yellow-400 hover:bg-stone-800 transition-all group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 bg-yellow-600 text-[8px] font-bold px-1.5 py-0.5 text-white">LIMITED</div>
                        <Zap size={32} className="text-stone-500 group-hover:text-yellow-400 transition-colors mb-2" fill="currentColor" />
                        <div className="text-sm md:text-base font-bold">마나 수정</div>
                        <div className="text-[10px] text-stone-400 text-center mb-2">최대 에너지 +1</div>
                        <div className={`font-bold text-sm ${player.gold >= 200 ? 'text-yellow-400' : 'text-red-500'}`}>200 G</div>
                    </button>
                 </div>
             </div>

             <div className="p-4 border-t border-stone-800 flex justify-end">
                 <button 
                    onClick={() => setGameState('REST')}
                    className="px-6 py-3 bg-stone-800 hover:bg-stone-700 rounded-lg font-bold text-stone-200 flex items-center gap-2"
                 >
                    <ArrowLeft size={20} /> 나가기
                 </button>
             </div>
          </div>
      )
  }

  // --- Reward Screen ---
  if (gameState === 'REWARD') {
      return (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-stone-950 text-stone-100 p-4">
            <h2 className="text-3xl font-bold mb-8 text-yellow-500 flex items-center gap-2">
                <Trophy /> 전리품 획득
            </h2>
            <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-12">
                {rewardOptions.map(card => (
                    <CardComponent 
                        key={card.instanceId} 
                        card={card} 
                        onClick={() => handleSelectReward(card)}
                        className="scale-110 hover:scale-125 transition-transform cursor-pointer" 
                    />
                ))}
            </div>
            <button 
                onClick={() => handleSelectReward(null)}
                className="px-6 py-2 text-stone-400 border border-stone-600 rounded hover:bg-stone-800"
            >
                건너뛰기
            </button>
        </div>
      );
  }

  // --- Rest Screen (Refactored for Responsiveness & Logic) ---
  if (gameState === 'REST') {
      return (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-stone-900 text-stone-100 p-4 relative overflow-y-auto">
            {/* Header info */}
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full border border-stone-700 z-10">
                <Coins className="text-yellow-400" size={20} />
                <span className="font-bold text-xl">{player.gold} G</span>
            </div>

            <div className="flex-shrink-0 mb-8 text-center mt-16 md:mt-0">
                <h2 className="text-3xl font-bold mb-2 text-orange-400">정비 단계</h2>
                <p className="text-stone-400">다음 전투를 준비하세요.</p>
                {hasRested && <p className="text-red-400 text-xs mt-2">※ 정비를 완료했습니다.</p>}
            </div>
            
            <div className="flex flex-wrap gap-4 w-full max-w-3xl justify-center items-center px-4 mb-8">
                {/* Repair Option */}
                <button 
                    onClick={() => handleRestAction('REPAIR')}
                    disabled={hasRested}
                    className={`
                        group relative w-32 h-44 md:w-40 md:h-56 bg-stone-800 border-2 rounded-xl flex flex-col items-center justify-center transition-all shadow-lg
                        ${hasRested 
                            ? 'border-stone-700 opacity-50 grayscale cursor-not-allowed' 
                            : 'border-stone-600 hover:border-green-500 hover:bg-stone-700'}
                    `}
                >
                    <Hammer size={32} className={`mb-4 transition-colors ${hasRested ? 'text-stone-600' : 'text-stone-500 group-hover:text-green-500'}`} />
                    <h3 className="text-lg font-bold mb-1">수리</h3>
                    <p className="text-stone-400 text-[10px] px-2 text-center">체력 30% 회복</p>
                    <div className={`mt-2 font-bold flex items-center gap-1 text-sm ${hasRested ? 'text-stone-600' : 'text-green-500'}`}>
                        <Heart size={14} fill="currentColor" /> +{Math.floor(player.maxHp * 0.3)}
                    </div>
                </button>

                {/* Smelt Option */}
                <button 
                    onClick={() => handleRestAction('SMELT')}
                    disabled={hasRested}
                    className={`
                        group relative w-32 h-44 md:w-40 md:h-56 bg-stone-800 border-2 rounded-xl flex flex-col items-center justify-center transition-all shadow-lg
                        ${hasRested 
                            ? 'border-stone-700 opacity-50 grayscale cursor-not-allowed' 
                            : 'border-stone-600 hover:border-red-500 hover:bg-stone-700'}
                    `}
                >
                    <Flame size={32} className={`mb-4 transition-colors ${hasRested ? 'text-stone-600' : 'text-stone-500 group-hover:text-red-500'}`} />
                    <h3 className="text-lg font-bold mb-1">제련</h3>
                    <p className="text-stone-400 text-[10px] px-2 text-center">카드 1장 제거</p>
                    <div className={`mt-2 font-bold flex items-center gap-1 text-sm ${hasRested ? 'text-stone-600' : 'text-red-400'}`}>
                        <Ban size={14} /> 제거
                    </div>
                </button>

                 {/* Shop Option (New) */}
                 <button 
                    onClick={() => handleRestAction('SHOP')}
                    className="group relative w-32 h-44 md:w-40 md:h-56 bg-stone-800 border-2 border-stone-600 rounded-xl flex flex-col items-center justify-center hover:border-yellow-500 hover:bg-stone-700 transition-all shadow-lg"
                >
                    <Store size={32} className="text-stone-500 group-hover:text-yellow-500 mb-4 transition-colors" />
                    <h3 className="text-lg font-bold mb-1">상점</h3>
                    <p className="text-stone-400 text-[10px] px-2 text-center">아이템 구매</p>
                    <div className="mt-2 text-yellow-400 font-bold flex items-center gap-1 text-sm">
                        <Coins size={14} /> 입장
                    </div>
                </button>
            </div>

            <div className="flex-shrink-0 pb-8">
                 <button 
                    onClick={advanceGame}
                    className="flex items-center gap-2 px-8 py-3 bg-stone-800 hover:bg-stone-700 border border-stone-600 rounded-lg text-stone-300 font-bold uppercase tracking-widest transition-colors shadow-md"
                 >
                     다음 층으로 이동 <ChevronRight size={20} />
                 </button>
            </div>
        </div>
      );
  }

  // --- Remove Card Screen (UI Improved) ---
  if (gameState === 'REMOVE_CARD') {
    const allCards = [...deck].sort((a,b) => a.cost - b.cost || a.type.localeCompare(b.type));
    const selectedName = allCards.find(c => c.instanceId === selectedCardId)?.name;

    return (
        <div className="w-full h-screen flex flex-col bg-stone-950 text-stone-100 overflow-hidden">
            <div className="flex-shrink-0 text-center p-4 bg-stone-900 shadow-md z-10">
                <h2 className="text-2xl font-bold text-red-500 mb-1 flex items-center justify-center gap-2">
                    <Flame /> 카드 제련
                </h2>
                <p className="text-stone-400 text-sm">제거할 카드를 선택한 후 확인 버튼을 누르세요.</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 bg-stone-950">
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
                                <div className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 shadow-lg z-20">
                                    <Check size={16} strokeWidth={4} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex-shrink-0 p-4 bg-stone-900 border-t border-stone-800 flex items-center justify-between gap-4 safe-area-bottom">
                <button 
                    onClick={handleCancelRemoval}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg border border-stone-600 text-stone-400 hover:bg-stone-800 hover:text-white transition-colors font-bold"
                >
                    <ArrowLeft size={20} /> 취소
                </button>
                
                <button 
                    onClick={handleConfirmRemoval}
                    disabled={!selectedCardId}
                    className={`
                        flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-black text-lg uppercase tracking-widest transition-all
                        ${selectedCardId 
                            ? 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]' 
                            : 'bg-stone-800 text-stone-600 cursor-not-allowed'}
                    `}
                >
                    {selectedCardId ? `'${selectedName}' 제거` : '카드 선택 필요'} <Ban size={20} />
                </button>
            </div>
        </div>
    );
  }

  // --- Main Gameplay Screen ---
  return (
    <div className={`w-full h-screen flex flex-col bg-stone-950 text-stone-200 overflow-hidden relative ${shake ? 'animate-shake' : ''} ${shieldEffect ? 'animate-shield-pulse' : ''}`}>
      
      {/* Acquired Card Overlay (NEW) */}
      {acquiredCard && (
        <div className="absolute inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4">
            <h2 className="text-3xl md:text-4xl font-black text-yellow-500 mb-8 animate-bounce drop-shadow-lg">
                희귀 도면 획득!
            </h2>
            <div className="scale-125 md:scale-150 mb-12">
                <CardComponent 
                  card={acquiredCard} 
                  onClick={() => {}} 
                  className="shadow-[0_0_50px_rgba(168,85,247,0.5)] border-purple-400"
                />
            </div>
            <button 
                onClick={() => setAcquiredCard(null)}
                className="px-10 py-4 bg-stone-800 hover:bg-stone-700 rounded-xl text-stone-200 font-bold text-xl border border-stone-600 transition-all shadow-lg active:scale-95"
            >
                확인
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

      {/* Feedback Toast */}
      {feedback && (
        <div className="absolute top-[35%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full text-center pointer-events-none px-4">
          <span className="text-2xl md:text-3xl font-black text-white stroke-black drop-shadow-[0_4px_4px_rgba(0,0,0,1)] animate-bounce block">
            {feedback}
          </span>
        </div>
      )}

      {/* --- Top: Enemy Section --- */}
      <div className="flex-[0_0_auto] h-[30%] min-h-[180px] flex justify-center items-center relative border-b border-stone-800 bg-stone-900/50">
        
        {/* Stage Indicator */}
        <div className="absolute top-2 left-2 md:top-4 md:left-4 text-xs md:text-sm font-bold text-stone-500 flex items-center gap-1">
            <MapIcon size={14} />
            Act {act} - Floor {floor}
        </div>

        {/* Gold Indicator */}
        <div className="absolute top-2 right-2 md:top-4 md:right-4 flex items-center gap-1 text-xs md:text-sm font-bold text-yellow-500 bg-black/40 px-3 py-1 rounded-full border border-yellow-900/50">
            <Coins size={14} />
            {player.gold} G
        </div>

        <div className="relative flex flex-col items-center scale-90 md:scale-100">
           {/* Intent Icon */}
           <div className="mb-1 md:mb-2 flex items-center gap-2 bg-stone-800 px-3 py-1 rounded-full border border-stone-600">
             {enemy.intents[enemy.currentIntentIndex].type === IntentType.ATTACK ? <Skull size={18} className="text-red-400" /> : 
              enemy.intents[enemy.currentIntentIndex].type === IntentType.BUFF ? <RefreshCw size={18} className="text-green-400" /> :
              enemy.intents[enemy.currentIntentIndex].type === IntentType.DEBUFF ? <Zap size={18} className="text-purple-400" /> :
              <Shield size={18} className="text-blue-400" />}
             <span className="font-bold text-lg">{enemy.intents[enemy.currentIntentIndex].value > 0 ? enemy.intents[enemy.currentIntentIndex].value : ''}</span>
             <span className="text-xs text-stone-400 uppercase tracking-widest">{enemy.intents[enemy.currentIntentIndex].description}</span>
           </div>

           {/* Enemy Sprite */}
           <div className={`w-32 h-32 md:w-48 md:h-48 bg-stone-800 rounded-lg flex items-center justify-center border-4 ${shake ? 'border-red-500' : 'border-stone-600'} shadow-2xl relative overflow-hidden`}>
              {/* Simple visual based on Enemy Name/Trait */}
              <Skull size={48} className={`md:w-16 md:h-16 ${enemy.traits.includes(EnemyTrait.THORNS_5) ? 'text-green-600' : enemy.traits.includes(EnemyTrait.DAMAGE_CAP_15) ? 'text-stone-400' : 'text-stone-600'}`} />
              {enemy.traits.includes(EnemyTrait.THORNS_5) && <div className="absolute bottom-1 right-1 text-[10px] bg-green-900 px-1 rounded">가시</div>}
              {enemy.traits.includes(EnemyTrait.DAMAGE_CAP_15) && <div className="absolute bottom-1 right-1 text-[10px] bg-stone-700 px-1 rounded">단단함 (MAX 15)</div>}
              {enemy.traits.includes(EnemyTrait.THIEVERY) && <div className="absolute bottom-1 right-1 text-[10px] bg-yellow-900 px-1 rounded text-yellow-200">탐욕</div>}
           </div>
           
           {/* Enemy HP & Block */}
           <div className="w-48 md:w-64 relative mt-2 md:mt-4">
              {enemy.block > 0 && (
                <div className="absolute -top-3 -right-2 flex items-center gap-1 bg-blue-900 border border-blue-500 text-blue-200 px-2 py-0.5 rounded-full z-10 text-xs font-bold shadow-lg">
                    <Shield size={12} fill="currentColor" /> {enemy.block}
                </div>
              )}
              <div className="h-4 bg-stone-800 rounded-full border border-stone-600 overflow-hidden relative">
                <div 
                  className="h-full bg-red-700 transition-all duration-300" 
                  style={{ width: `${(enemy.currentHp / enemy.maxHp) * 100}%` }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white shadow-black drop-shadow-sm">
                  {enemy.currentHp} / {enemy.maxHp}
                </div>
              </div>
           </div>

           <h2 className="mt-1 font-bold text-stone-400 text-base md:text-lg mb-1">{enemy.name}</h2>
           
           {/* Status Effects Row */}
           <div className="flex items-center justify-center gap-2">
               {enemy.statuses?.poison > 0 && (
                   <div className="flex items-center gap-1 bg-green-900/50 border border-green-700 px-1.5 py-0.5 rounded text-[10px] md:text-xs text-green-400 font-bold" title="턴 시작 시 피해">
                       <Droplets size={12} fill="currentColor" /> {enemy.statuses.poison}
                   </div>
               )}
               {enemy.statuses?.bleed > 0 && (
                   <div className="flex items-center gap-1 bg-red-900/50 border border-red-700 px-1.5 py-0.5 rounded text-[10px] md:text-xs text-red-400 font-bold" title="공격 시 피해">
                       <Activity size={12} /> {enemy.statuses.bleed}
                   </div>
               )}
               {enemy.statuses?.stunned > 0 && (
                   <div className="flex items-center gap-1 bg-yellow-900/50 border border-yellow-700 px-1.5 py-0.5 rounded text-[10px] md:text-xs text-yellow-400 font-bold" title="기절">
                       <Star size={12} fill="currentColor" /> {enemy.statuses.stunned}
                   </div>
               )}
               {enemy.statuses?.strength > 0 && (
                   <div className="flex items-center gap-1 bg-red-900/50 border border-red-500 px-1.5 py-0.5 rounded text-[10px] md:text-xs text-red-400 font-bold" title="공격력 증가">
                       <Swords size={12} /> +{enemy.statuses.strength}
                   </div>
               )}
               {enemy.statuses?.vulnerable > 0 && (
                   <div className="flex items-center gap-1 bg-purple-900/50 border border-purple-500 px-1.5 py-0.5 rounded text-[10px] md:text-xs text-purple-400 font-bold" title="취약: 받는 피해 50% 증가">
                       <Percent size={12} /> 취약 {enemy.statuses.vulnerable}
                   </div>
               )}
               {enemy.statuses?.weak > 0 && (
                   <div className="flex items-center gap-1 bg-stone-700/50 border border-stone-500 px-1.5 py-0.5 rounded text-[10px] md:text-xs text-stone-300 font-bold" title="약화: 주는 피해 25% 감소">
                       <ArrowLeft size={12} className="rotate-[-45deg]" /> 약화 {enemy.statuses.weak}
                   </div>
               )}
           </div>
        </div>
      </div>

      {/* --- Middle: Anvil / Crafting --- */}
      <div className="flex-1 relative flex flex-col justify-center items-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-stone-800 to-stone-950 px-2 md:px-4 overflow-y-auto">
        
        {/* Player Stats HUD (Sticky Left) */}
        <div className="absolute left-2 top-2 md:left-4 md:top-4 flex flex-col gap-1 md:gap-3 z-20 pointer-events-none">
           <div className="flex items-center gap-2 md:gap-3 text-lg md:text-xl font-black text-red-500">
              <Heart className="w-5 h-5 md:w-6 md:h-6 fill-current" /> {player.hp}
           </div>
           <div className="flex items-center gap-2 md:gap-3 text-lg md:text-xl font-black text-blue-400">
              <Shield className="w-5 h-5 md:w-6 md:h-6 fill-current" /> {player.block}
           </div>
           <div className="flex items-center gap-2 md:gap-3 text-lg md:text-xl font-black text-yellow-500">
              <div className="flex gap-1">
                {Array.from({ length: player.maxEnergy }).map((_, i) => (
                  <div key={i} className={`w-3 h-3 md:w-4 md:h-4 rounded-full border border-yellow-600 ${i < player.energy ? 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]' : 'bg-stone-800'}`} />
                ))}
              </div>
           </div>
           {/* Debuff Indicators */}
           <div className="flex flex-col gap-1 mt-2">
               {player.disarmed && (
                   <div className="flex items-center gap-1 text-red-400 text-xs font-bold bg-black/50 px-2 py-1 rounded border border-red-500/50">
                       <Ban size={12} /> 무장해제
                   </div>
               )}
               {player.costLimit !== null && (
                   <div className="flex items-center gap-1 text-purple-400 text-xs font-bold bg-black/50 px-2 py-1 rounded border border-purple-500/50">
                       <Lock size={12} /> 과부하({player.costLimit})
                   </div>
               )}
           </div>
        </div>

        {/* Deck/Discard HUD (Sticky Right) - IMPROVED */}
        <div className="absolute right-2 top-2 md:right-4 md:top-4 flex flex-col gap-1 md:gap-2 z-20 pointer-events-none items-end">
          <div className="flex items-center gap-2 text-stone-400 text-xs md:text-sm font-bold bg-black/40 px-3 py-1.5 rounded-full border border-stone-700 backdrop-blur-sm">
             <Layers size={14} className="md:w-4 md:h-4" />
             <span>남은 덱:</span>
             <span className="text-white text-sm md:text-base">{deck.length}</span>
          </div>
          <div className="flex items-center gap-2 text-stone-500 text-xs md:text-sm font-bold bg-black/40 px-3 py-1.5 rounded-full border border-stone-800 backdrop-blur-sm">
             <Archive size={14} className="md:w-4 md:h-4" />
             <span>버린 카드:</span>
             <span className="text-stone-300 text-sm md:text-base">{discardPile.length}</span>
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
            />
        </div>

        {/* Turn Control */}
        <div className="absolute right-4 bottom-4 z-20">
           <button 
             onClick={endTurn}
             disabled={combatState.phase !== 'PLAYER_ACTION'}
             className="bg-stone-800 hover:bg-stone-700 text-stone-200 px-4 py-2 md:px-6 md:py-3 rounded-lg border border-stone-600 text-sm md:text-base font-bold uppercase tracking-widest disabled:opacity-50"
           >
             턴 종료
           </button>
        </div>

      </div>

      {/* --- Bottom: Hand --- */}
      <div className="h-40 md:h-64 bg-stone-900 border-t border-stone-800 flex items-center justify-center relative z-30">
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