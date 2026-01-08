import React, { useState, useEffect } from 'react';
import { 
  CardInstance, CardType, CombatState, PlayerStats, EnemyData, 
  IntentType, CraftedWeapon, CardRarity, EnemyTrait, EnemyTier
} from './types';
import { CARD_DATABASE, INITIAL_DECK_IDS, ENEMIES, ENEMY_POOLS } from './constants';
import CardComponent from './components/CardComponent';
import Anvil from './components/Anvil';
import { Shield, Zap, Layers } from 'lucide-react';

// --- Utilities ---
import { generateId, createCardInstance, shuffle } from './utils/cardUtils';
import {
  CardEffectContext, EffectModifiers, EffectAction,
  executeEffectsForPhase, applyModifierActions,
  isExhaustCard, isInfiniteLoopCard, isTwinHandle
} from './utils/cardEffects';

// --- WWM AI Generation Service ---
import {
  isGeminiAvailable,
  generateCardWithFallback,
  generateEnemyWithFallback,
  CardGenerationContext,
  EnemyGenerationContext
} from './services/geminiService';

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
import DeckHUD from './components/DeckHUD';
import PlayerHUD from './components/PlayerHUD';
import EnemySection from './components/EnemySection';
import IntentDetailModal from './components/IntentDetailModal';
import StatusDetailModal from './components/StatusDetailModal';

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

// Visuals - Animation hook
  const [animations, animationTriggers] = useAnimations();
  
  // Toast messages - using useToast hook
  const { showFeedback, currentGoodToast, currentBadToast } = useToast();
  
  const [discardingCardIds, setDiscardingCardIds] = useState<Set<string>>(new Set());

  // Balance Patch v1.0 - New card states
  const [growingCrystalBonus, setGrowingCrystalBonus] = useState(0); // 407: Permanent damage bonus per combat
  const [infiniteLoopUsed, setInfiniteLoopUsed] = useState(false); // 405: Once per turn

  // Intent detail modal (long-press on mobile)
  const [showIntentDetail, setShowIntentDetail] = useState(false);

  // Status effect detail modal
  const [showStatusDetail, setShowStatusDetail] = useState<string | null>(null); // Status key or null

  // WWM AI Generation State
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [aiGeneratedCard, setAiGeneratedCard] = useState<CardInstance | null>(null); // Track AI-generated card in rewards

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

  const advanceGame = async () => {
      let nextFloor = floor + 1;
      let nextAct = act;

      // Check Act Completion
      if (nextFloor > ACT_LENGTH) {
          nextAct++;
          nextFloor = 1;

          if (nextAct > 3) {
              setGameState('WIN');
              return;
          }

          setAct(nextAct);
          showFeedback(`ACT ${nextAct} 시작!`);
      }

      setFloor(nextFloor);

      // --- Fixed Level Structure ---
      // Floor 15: Boss - Always use predefined boss
      if (nextFloor === ACT_LENGTH) {
          const boss = ENEMY_POOLS[nextAct as 1|2|3][EnemyTier.BOSS];
          startCombat(JSON.parse(JSON.stringify(boss)));
          return;
      }

      // Floor 8: Elite - Try AI generation
      if (nextFloor === 8) {
          setIsGeneratingContent(true);
          try {
            // 100% AI-generated elite for testing
            if (isGeminiAvailable()) {
              const aiContext: EnemyGenerationContext = {
                targetTier: 'Elite',
                act: nextAct as 1 | 2 | 3,
                theme: '강력한 정예 몬스터'
              };
              const result = await generateEnemyWithFallback(aiContext);
              if (result.validationResult.valid) {
                showFeedback('⚔️ AI가 새로운 적을 생성했습니다!', 'good');
                startCombat(JSON.parse(JSON.stringify(result.enemy)));
                setIsGeneratingContent(false);
                return;
              }
            }
          } catch (error) {
            console.error('AI elite generation failed:', error);
          }
          setIsGeneratingContent(false);

          // Fallback to pool
          const pool = ENEMY_POOLS[nextAct as 1|2|3][EnemyTier.ELITE];
          const enemy = pool[Math.floor(Math.random() * pool.length)];
          startCombat(JSON.parse(JSON.stringify(enemy)));
          return;
      }

      // Default: Common Enemy - Try AI generation
      setIsGeneratingContent(true);
      try {
        // 100% AI-generated common enemy for testing
        if (isGeminiAvailable()) {
          const aiContext: EnemyGenerationContext = {
            targetTier: 'Common',
            act: nextAct as 1 | 2 | 3
          };
          const result = await generateEnemyWithFallback(aiContext);
          if (result.validationResult.valid) {
            showFeedback('🎲 새로운 적이 나타났습니다!', 'good');
            startCombat(JSON.parse(JSON.stringify(result.enemy)));
            setIsGeneratingContent(false);
            return;
          }
        }
      } catch (error) {
        console.error('AI enemy generation failed:', error);
      }
      setIsGeneratingContent(false);

      // Fallback to pool
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

  const handleWinCombat = async () => {
      cleanAndConsolidateDeck();

      // Rewards
      const isEliteOrBoss = enemy.tier === EnemyTier.ELITE || enemy.tier === EnemyTier.BOSS;
      const goldReward = Math.floor(Math.random() * 20) + (isEliteOrBoss ? 30 : 15);
      setPlayer(prev => ({...prev, gold: prev.gold + goldReward}));

      // Base pool from database
      const pool = CARD_DATABASE.filter(c =>
          c.rarity !== CardRarity.JUNK &&
          c.rarity !== CardRarity.STARTER &&
          c.rarity !== CardRarity.SPECIAL
      );

      const shuffled = shuffle(pool);
      const count = isEliteOrBoss ? 4 : 3;
      let options = shuffled.slice(0, count - 1).map(data => ({...data, instanceId: generateId()}));

      // WWM AI Generation: Try to add one AI-generated card to rewards
      setIsGeneratingContent(true);
      showFeedback(`승리! ${goldReward} 골드 획득`);

      try {
        // Determine AI card parameters based on act progression
        const rarityOptions: ('Common' | 'Rare' | 'Legend')[] =
          act === 1 ? ['Common', 'Rare'] :
          act === 2 ? ['Common', 'Rare', 'Legend'] :
          ['Rare', 'Legend'];
        const typeOptions: ('Handle' | 'Head' | 'Deco')[] = ['Handle', 'Head', 'Deco'];

        const aiContext: CardGenerationContext = {
          targetType: typeOptions[Math.floor(Math.random() * typeOptions.length)],
          targetRarity: isEliteOrBoss
            ? rarityOptions[Math.floor(Math.random() * rarityOptions.length)]
            : rarityOptions[0], // Common for normal enemies
          theme: isEliteOrBoss ? '강력한 보스 전리품' : undefined
        };

        const result = await generateCardWithFallback(aiContext);
        const aiCard: CardInstance = {
          ...result.card,
          instanceId: generateId()
        };

        // Only mark as AI-generated if it was actually generated by AI (not fallback)
        if (result.isAiGenerated) {
          setAiGeneratedCard(aiCard);
          showFeedback('✨ AI가 새로운 카드를 생성했습니다!', 'good');
        }
        options.push(aiCard);
      } catch (error) {
        console.error('AI card generation failed:', error);
        // Fallback: add one more card from database
        const fallbackCard = shuffled[count - 1];
        if (fallbackCard) {
          options.push({...fallbackCard, instanceId: generateId()});
        }
      }

      setIsGeneratingContent(false);
      setRewardOptions(options);
      setGameState('REWARD');
  };

  const handleSelectReward = (card: CardInstance | null) => {
      if (card) {
          setDeck(prev => [...prev, card]);
          // Check if this was an AI-generated card
          if (aiGeneratedCard && card.instanceId === aiGeneratedCard.instanceId) {
            showFeedback(`✨ ${card.name} (AI 생성) 획득!`);
          } else {
            showFeedback(`${card.name} 획득!`);
          }
      } else {
          showFeedback("보상 건너뛰기");
      }

      // Reset AI card state
      setAiGeneratedCard(null);

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
  const handleShopBuy = async (item: 'HEAL' | 'REMOVE' | 'RARE' | 'ENERGY') => {
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
          setPlayer(prev => ({ ...prev, gold: prev.gold - PRICES.RARE }));
          setIsGeneratingContent(true);

          let newCard: CardInstance;

          try {
            // Try AI generation for rare card
            const typeOptions: ('Handle' | 'Head' | 'Deco')[] = ['Handle', 'Head', 'Deco'];
            const aiContext: CardGenerationContext = {
              targetType: typeOptions[Math.floor(Math.random() * typeOptions.length)],
              targetRarity: 'Rare',
              theme: '상점에서 판매하는 희귀한 설계도'
            };

            const result = await generateCardWithFallback(aiContext);
            newCard = { ...result.card, instanceId: generateId() };

            // Only show AI message if actually AI-generated
            if (result.isAiGenerated) {
              showFeedback('✨ AI가 희귀 설계도를 생성했습니다!', 'good');
            } else {
              showFeedback('희귀 설계도 획득!');
            }
          } catch (error) {
            console.error('AI shop card generation failed:', error);
            // Fallback to database
            const rares = CARD_DATABASE.filter(c => c.rarity === CardRarity.RARE);
            const randomRare = rares[Math.floor(Math.random() * rares.length)];
            newCard = { ...randomRare, instanceId: generateId() };
            showFeedback('희귀 설계도 획득!');
          }

          setIsGeneratingContent(false);
          setDeck(prev => [...prev, newCard]);
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

    // Logic for Parrying Guard (102) OR Pot Lid (104) acting as Head
    if (handle.id === 102 || head.id === 104) {
      block = finalValue;
      damage = 0;
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

    // 207: Spiked Armor (Deco) - Add 100% of current block as damage
    if (deco?.id === 207) {
        damage += player.block;
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
    const stats = calculateWeaponStats();
    
    if (player.costLimit !== null && stats.totalCost > player.costLimit) {
      showFeedback(`과부하! 비용 ${player.costLimit} 이하만 가능!`);
      return;
    }

    if (stats.totalCost > player.energy) {
      showFeedback('기력이 부족합니다!');
      return;
    }

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

          // DEFEND intent - enemy gains block
          if (intent.type === IntentType.DEFEND) {
             const blockGain = intent.value;
             setEnemy(prev => ({ ...prev, block: prev.block + blockGain }));
             showFeedback(`적 방어 태세! +${blockGain} 방어도`, 'bad');
          } else if (intent.type === IntentType.BUFF) {
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
    return <MenuScreen onStartGame={startGame} />;
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

  if (gameState === 'BOSS_REWARD') {
    return <BossRewardScreen onSelectReward={confirmBossReward} />;
  }

  if (gameState === 'SHOP') {
    return (
      <ShopScreen
        gold={player.gold}
        onBuyItem={handleShopBuyWithFlag}
        onExit={() => setGameState('REST')}
      />
    );
  }

  if (gameState === 'REWARD') {
    return (
      <RewardScreen
        rewardOptions={rewardOptions}
        onSelectReward={handleSelectReward}
        aiGeneratedCardId={aiGeneratedCard?.instanceId}
        isLoading={isGeneratingContent}
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
        onAdvance={advanceGame}
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

      {/* Enemy Section */}
      <EnemySection
        enemy={enemy}
        act={act}
        floor={floor}
        playerGold={player.gold}
        shake={shake}
        enemyPoisoned={enemyPoisoned}
        enemyBurning={enemyBurning}
        enemyBleeding={enemyBleeding}
        enemyAttacking={enemyAttacking}
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
          playerHealing={playerHealing}
          playerHit={playerHit}
          playerBlocking={playerBlocking}
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