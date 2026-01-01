
import { CardData, CardRarity, CardType, EnemyData, IntentType, EnemyTrait, EnemyTier, GameEvent } from './types';

// --- Card Database ---

export const CARD_DATABASE: CardData[] = [
  // Starter
  { id: 101, name: '낡은 나무 손잡이', type: CardType.HANDLE, cost: 1, value: 1, rarity: CardRarity.STARTER, description: '기본 공격' },
  { id: 102, name: '패링 가드', type: CardType.HANDLE, cost: 1, value: 1, rarity: CardRarity.STARTER, description: '[방어] 머리의 공격력을 방어도로 전환' },
  { id: 103, name: '녹슨 철 칼날', type: CardType.HEAD, cost: 1, value: 6, rarity: CardRarity.STARTER, description: '피해 6' },
  { id: 104, name: '냄비 뚜껑', type: CardType.HEAD, cost: 1, value: 5, rarity: CardRarity.STARTER, description: '방어도 5 (방어형 머리)' },
{ id: 105, name: '거친 숫돌', type: CardType.DECO, cost: 0, value: 3, rarity: CardRarity.STARTER, description: '피해량 +3' },
  { id: 106, name: '낡은 끈', type: CardType.DECO, cost: 0, value: 0, rarity: CardRarity.STARTER, description: '다음 턴 카드 1장 추가 드로우' },

  // Common
  { id: 201, name: '날렵한 단검 자루', type: CardType.HANDLE, cost: 0, value: 1, rarity: CardRarity.COMMON, description: '약화 1 부여. 비용 0.' },
  { id: 202, name: '강철 롱소드', type: CardType.HEAD, cost: 1, value: 9, rarity: CardRarity.COMMON, description: '피해 9' },
  { id: 203, name: '톱날', type: CardType.HEAD, cost: 1, value: 3, rarity: CardRarity.COMMON, description: '피해 3, 출혈 3 부여 (적 공격 시 피해)' },
  { id: 204, name: '가벼운 깃털', type: CardType.DECO, cost: 0, value: 0, rarity: CardRarity.COMMON, description: '다음 턴에 카드 1장 추가 뽑기' },
  { id: 205, name: '독 묻은 헝겊', type: CardType.DECO, cost: 1, value: 0, rarity: CardRarity.COMMON, description: '독 4 부여' },
  
// New Common
  { id: 206, name: '뼈 손잡이', type: CardType.HANDLE, cost: 1, value: 1, rarity: CardRarity.COMMON, description: '취약 2 부여 (받는 피해 50% 증가)' },
  { id: 207, name: '철갑 가시', type: CardType.DECO, cost: 1, value: 0, rarity: CardRarity.RARE, description: '현재 방어도만큼 추가 피해.' },
  { id: 208, name: '충전된 보석', type: CardType.DECO, cost: 0, value: 0, rarity: CardRarity.COMMON, description: '에너지 1 회복' },

  // Balance Patch v1.0 - New Common
  { id: 209, name: '톱니 바퀴', type: CardType.HEAD, cost: 1, value: 5, rarity: CardRarity.COMMON, description: '피해 5. 출혈 스택당 +1 피해.' },
  { id: 210, name: '가시 문양', type: CardType.DECO, cost: 0, value: 0, rarity: CardRarity.COMMON, description: '현재 방어도의 50%를 추가 피해로 전환.' },
  { id: 211, name: '축전지', type: CardType.DECO, cost: 0, value: 0, rarity: CardRarity.COMMON, description: '남은 에너지 1당 +4 피해.' },
  { id: 212, name: '경량 손잡이', type: CardType.HANDLE, cost: 0, value: 1, rarity: CardRarity.COMMON, description: '총 비용 1 이하 시 카드 1장 드로우.' },
  { id: 213, name: '독침', type: CardType.HEAD, cost: 1, value: 3, rarity: CardRarity.COMMON, description: '피해 3. 적 독 스택만큼 추가 피해.' },
  { id: 214, name: '무딘 곤봉', type: CardType.HEAD, cost: 1, value: 8, rarity: CardRarity.COMMON, description: '피해 8. 약화 1 부여.' },

  // Balance Patch v1.1 - New Common
  { id: 215, name: '민첩한 칼날', type: CardType.HEAD, cost: 1, value: 6, rarity: CardRarity.COMMON, description: '피해 6. 다음 턴 드로우 +1.' },
  { id: 218, name: '가벼운 자루', type: CardType.HANDLE, cost: 0, value: 0.75, rarity: CardRarity.COMMON, description: '피해량 75%. 비용 0.' },
  { id: 219, name: '쇠약의 문양', type: CardType.DECO, cost: 0, value: 0, rarity: CardRarity.COMMON, description: '적에게 약화 1 부여.' },

  // Rare
  { id: 301, name: '쌍둥이 손잡이', type: CardType.HANDLE, cost: 2, value: 2, rarity: CardRarity.RARE, description: '머리 효과 2회 발동 (피해량 2배 아님)' },
  { id: 302, name: '흡혈 덩굴', type: CardType.HANDLE, cost: 2, value: 1, rarity: CardRarity.RARE, description: '입힌 피해의 50% 회복' },
  { id: 303, name: '화염 방사기', type: CardType.HEAD, cost: 2, value: 8, rarity: CardRarity.RARE, description: '피해 8. 화상 3 부여.' },
  { id: 304, name: '육중한 전쟁망치', type: CardType.HEAD, cost: 2, value: 18, rarity: CardRarity.RARE, description: '피해 18. 방어도 -5 (부족 시 HP 감소).' },
  { id: 305, name: '복제의 거울', type: CardType.DECO, cost: 2, value: 0, rarity: CardRarity.RARE, description: '완성된 무기(머리)를 덱 맨 위로 복제 (비용 0)' },

// New Rare
  { id: 306, name: '쌍둥이 송곳니', type: CardType.HEAD, cost: 1, value: 4, rarity: CardRarity.RARE, description: '피해 4, 2회 공격' },
  { id: 307, name: '마이더스의 손', type: CardType.HANDLE, cost: 1, value: 1, rarity: CardRarity.RARE, description: '피해량 100%. 적중 시 5골드 획득.' },

  // Balance Patch v1.0 - New Rare
  { id: 308, name: '용광로 코어', type: CardType.HEAD, cost: 1, value: 15, rarity: CardRarity.RARE, description: '피해 15. 과열 1 (다음 턴 에너지 -1).' },
  { id: 309, name: '도박사의 손잡이', type: CardType.HANDLE, cost: 1, value: 0, rarity: CardRarity.RARE, description: '배율 1~3 (무작위).' },
  { id: 310, name: '연속 타격', type: CardType.HEAD, cost: 0, value: 4, rarity: CardRarity.RARE, description: '피해 4. 이번 턴 사용한 무기 수 x2 추가 피해.' },
  { id: 311, name: '강철 도금', type: CardType.DECO, cost: 1, value: 0, rarity: CardRarity.RARE, description: '이 무기의 방어도 2배.' },
  { id: 312, name: '용암 칼날', type: CardType.HEAD, cost: 2, value: 10, rarity: CardRarity.RARE, description: '피해 10. 화상 4 부여.' },

  // Balance Patch v1.1 - New Rare
  { id: 313, name: '마력 칼날', type: CardType.HEAD, cost: 1, value: 4, rarity: CardRarity.RARE, description: '피해 4. 에너지 1 회복.' },
  { id: 314, name: '광기의 칼날', type: CardType.HEAD, cost: 1, value: 12, rarity: CardRarity.RARE, description: '피해 12. 자해 4.' },
  { id: 317, name: '관통 자루', type: CardType.HANDLE, cost: 1, value: 1, rarity: CardRarity.RARE, description: '적 방어도 무시.' },
  { id: 318, name: '피의 자루', type: CardType.HANDLE, cost: 0, value: 1, rarity: CardRarity.RARE, description: '비용 0. 자해 4.' },
  { id: 319, name: '피의 숫돌', type: CardType.DECO, cost: 0, value: 2, rarity: CardRarity.RARE, description: '피해량 +2. 출혈 2 부여.' },
  { id: 320, name: '광전사의 룬', type: CardType.DECO, cost: 0, value: 0, rarity: CardRarity.RARE, description: '이번 턴 자해량만큼 추가 피해.' },

  // Legend
  { id: 401, name: '거인의 악력', type: CardType.HANDLE, cost: 3, value: 3, rarity: CardRarity.LEGEND, description: '피해량 3배. 적 기절.' },
  { id: 402, name: '공허의 수정', type: CardType.HEAD, cost: 3, value: 30, rarity: CardRarity.LEGEND, description: '피해 30. 소멸.' },
  { id: 403, name: '현자의 돌', type: CardType.DECO, cost: 0, value: 0, rarity: CardRarity.LEGEND, description: '무기 비용을 0으로 설정' },
  
// New Legend (Balance Patch v1.1: 40->30 damage, 5->6 self-damage)
  { id: 404, name: '운석 파편', type: CardType.HEAD, cost: 2, value: 30, rarity: CardRarity.LEGEND, description: '피해 30. 자해 6.' },

  // Balance Patch v1.0 - New Legend
  { id: 405, name: '무한 회귀', type: CardType.HANDLE, cost: 2, value: 1, rarity: CardRarity.LEGEND, description: '사용 후 손으로 귀환. 턴당 1회.' },
  { id: 406, name: '시간의 톱니', type: CardType.HEAD, cost: 2, value: 0, rarity: CardRarity.LEGEND, description: '적 기절 1. 다음 의도 건너뜀.' },
  { id: 407, name: '성장하는 결정', type: CardType.DECO, cost: 0, value: 2, rarity: CardRarity.LEGEND, description: '영구 피해 +2. 전투 중 중첩 (최대 16).' },

  // Balance Patch v1.1 - New Legend
  { id: 408, name: '서리 칼날', type: CardType.HEAD, cost: 2, value: 8, rarity: CardRarity.LEGEND, description: '피해 8. 적 기절.' },
  { id: 409, name: '처형자의 칼날', type: CardType.HEAD, cost: 2, value: 5, rarity: CardRarity.LEGEND, description: '피해 5. 빈사 상태(HP 20% 이하) 적 처형.' },
  { id: 412, name: '회피의 자루', type: CardType.HANDLE, cost: 2, value: 1, rarity: CardRarity.LEGEND, description: '적의 다음 공격 회피.' },
  { id: 413, name: '용의 문장', type: CardType.DECO, cost: 1, value: 0, rarity: CardRarity.LEGEND, description: '피해량 2배.' },

  // Special / Generated
  { id: 801, name: '그림자 무기', type: CardType.HEAD, cost: 0, value: 0, rarity: CardRarity.SPECIAL, description: '복제된 무기의 힘을 담은 그림자입니다.' },

  // Junk (Enemy Generated)
  { id: 901, name: '녹슨 덩어리', type: CardType.JUNK, cost: 1, value: 0, rarity: CardRarity.JUNK, description: '사용 불가. 손패를 차지합니다.', unplayable: true },
];

export const INITIAL_DECK_IDS = [101, 101, 102, 103, 103, 104, 105, 106];

const DEFAULT_STATUS = { poison: 0, bleed: 0, stunned: 0, strength: 0, vulnerable: 0, weak: 0, burn: 0 };

// --- Enemies ---

export const ENEMIES: Record<string, EnemyData> = {
  // Floor 1: The Abandoned Mine
RUST_SLIME: { // Balance Patch v1.0: Debuff moved to 3rd intent for better new player experience
    id: 'rust_slime', name: '녹슨 슬라임', tier: EnemyTier.COMMON, maxHp: 30, currentHp: 30, block: 0, currentIntentIndex: 0, traits: [], statuses: { ...DEFAULT_STATUS },
    damageTakenThisTurn: 0,
    intents: [
      { type: IntentType.ATTACK, value: 5, description: '몸통 박치기' },
      { type: IntentType.ATTACK, value: 7, description: '녹슨 돌진' },
      { type: IntentType.DEBUFF, value: 1, description: '덱에 [녹슨 덩어리] 추가' },
    ]
  },
  KOBOLD_SCRAPPER: {
    id: 'kobold_scrapper', name: '코볼트 수집가', tier: EnemyTier.COMMON, maxHp: 45, currentHp: 45, block: 0, currentIntentIndex: 0, traits: [EnemyTrait.REACTIVE_RARE], statuses: { ...DEFAULT_STATUS },
    damageTakenThisTurn: 0,
    intents: [
      { type: IntentType.ATTACK, value: 5, description: '할퀴기' },
      { type: IntentType.ATTACK, value: 5, description: '할퀴기' },
      { type: IntentType.BUFF, value: 0, description: '가방 뒤적이기 (일시적 공격력 1~3 증가)' },
    ]
  },
  SKELETON_WARRIOR: { // NERFED: HP 40->32, DMG 8->6, 10->8
    id: 'skeleton_warrior', name: '해골 전사', tier: EnemyTier.COMMON, maxHp: 32, currentHp: 32, block: 0, currentIntentIndex: 0, traits: [], statuses: { ...DEFAULT_STATUS },
    damageTakenThisTurn: 0,
    intents: [
      { type: IntentType.ATTACK, value: 6, description: '낡은 검' },
      { type: IntentType.DEFEND, value: 5, description: '방어 태세' },
      { type: IntentType.ATTACK, value: 8, description: '강하게 베기' },
    ]
  },
  ROCK_CRUSHER: { // Elite
    id: 'rock_crusher', name: '바위 분쇄기 (정예)', tier: EnemyTier.ELITE, maxHp: 80, currentHp: 80, block: 0, currentIntentIndex: 0, traits: [EnemyTrait.DAMAGE_CAP_15], statuses: { ...DEFAULT_STATUS },
    damageTakenThisTurn: 0,
    intents: [
      { type: IntentType.ATTACK, value: 12, description: '육중한 강타' },
      { type: IntentType.DEFEND, value: 15, description: '바위 숨기' },
      { type: IntentType.ATTACK, value: 8, description: '지진' },
    ]
  },
  JUNK_KING: { // Boss 1
    id: 'junk_king', name: '고철의 왕 (보스)', tier: EnemyTier.BOSS, maxHp: 150, currentHp: 150, block: 0, currentIntentIndex: 0, traits: [], statuses: { ...DEFAULT_STATUS },
    damageTakenThisTurn: 0,
    intents: [
      { type: IntentType.ATTACK, value: 10, description: '자석 펀치' },
      { type: IntentType.DEBUFF, value: 3, description: '[녹슨 덩어리] 3장 추가' },
      { type: IntentType.ATTACK, value: 15, description: '폐품 투척' },
    ]
  },

  // Floor 2: The Molten Forge
  EMBER_WISP: {
    id: 'ember_wisp', name: '화염의 위습', tier: EnemyTier.COMMON, maxHp: 50, currentHp: 50, block: 0, currentIntentIndex: 0, traits: [], statuses: { ...DEFAULT_STATUS },
    damageTakenThisTurn: 0,
    intents: [
      { type: IntentType.ATTACK, value: 4, description: '불씨' },
      { type: IntentType.ATTACK, value: 4, description: '불씨' },
      { type: IntentType.ATTACK, value: 4, description: '불씨' }, // Multi-hit punishes no-block
    ]
  },
  HAMMERHEAD: {
    id: 'hammerhead', name: '망치 머리 고블린', tier: EnemyTier.COMMON, maxHp: 65, currentHp: 65, block: 0, currentIntentIndex: 0, traits: [], statuses: { ...DEFAULT_STATUS },
    damageTakenThisTurn: 0,
    intents: [
      { type: IntentType.ATTACK, value: 12, description: '내려찍기' },
      { type: IntentType.DEBUFF, value: 0, description: '무작위 손잡이 비용 +1' },
    ]
  },
  LOOT_GOBLIN: { // New Common (Floor 2)
    id: 'loot_goblin', name: '도굴꾼 고블린', tier: EnemyTier.COMMON, maxHp: 55, currentHp: 55, block: 0, currentIntentIndex: 0, traits: [EnemyTrait.THIEVERY], statuses: { ...DEFAULT_STATUS },
    damageTakenThisTurn: 0,
    intents: [
        { type: IntentType.ATTACK, value: 5, description: '소매치기 (골드 강탈)' },
        { type: IntentType.DEBUFF, value: 0, description: '모래 뿌리기 (덱에 [녹슨 덩어리])' },
        { type: IntentType.DEFEND, value: 10, description: '도주 준비' }
    ]
  },
  MIMIC_ANVIL: { // Elite
    id: 'mimic_anvil', name: '흉내쟁이 모루 (정예)', tier: EnemyTier.ELITE, maxHp: 100, currentHp: 100, block: 0, currentIntentIndex: 0, traits: [], statuses: { ...DEFAULT_STATUS },
    damageTakenThisTurn: 0,
    intents: [
      { type: IntentType.DEFEND, value: 20, description: '단단해지기' },
      { type: IntentType.ATTACK, value: 0, description: '받은 피해 반사' },
    ]
  },
CORRUPTED_SMITH: { // Boss 2 - Balance Patch v1.0: HP 250 -> 220
    id: 'corrupted_smith', name: '타락한 대장장이 (보스)', tier: EnemyTier.BOSS, maxHp: 220, currentHp: 220, block: 0, currentIntentIndex: 0, traits: [], statuses: { ...DEFAULT_STATUS },
    damageTakenThisTurn: 0,
    intents: [
      { type: IntentType.ATTACK, value: 20, description: '달궈진 망치' },
      { type: IntentType.SPECIAL, value: 0, description: '다음 턴 무기 파괴' },
      { type: IntentType.ATTACK, value: 30, description: '대멸종' },
    ]
  },

  // Floor 3: Clockwork Sanctuary
  AUTOMATON_DEFENDER: {
    id: 'automaton_defender', name: '자동화 방패병', tier: EnemyTier.COMMON, maxHp: 80, currentHp: 80, block: 0, currentIntentIndex: 0, traits: [EnemyTrait.THORNS_5], statuses: { ...DEFAULT_STATUS },
    damageTakenThisTurn: 0,
    intents: [
      { type: IntentType.DEFEND, value: 15, description: '방패 전개' },
      { type: IntentType.ATTACK, value: 10, description: '방패 밀치기' },
      { type: IntentType.BUFF, value: 15, description: '긴급 수리 (HP 15 회복)' },
    ]
  },
  SHADOW_ASSASSIN: { // New Elite (Floor 3)
      id: 'shadow_assassin', name: '그림자 암살자 (정예)', tier: EnemyTier.ELITE, maxHp: 120, currentHp: 120, block: 0, currentIntentIndex: 0, traits: [], statuses: { ...DEFAULT_STATUS },
      damageTakenThisTurn: 0,
      intents: [
          { type: IntentType.ATTACK, value: 25, description: '급소 찌르기' },
          { type: IntentType.DEFEND, value: 30, description: '그림자 숨기 (높은 방어도)' },
          { type: IntentType.BUFF, value: 5, description: '칼날 연마 (공격력 +5)' }
      ]
  },
CHIMERA_ENGINE: { // Elite - Balance Patch v1.0: HP 180 -> 150
    id: 'chimera_engine', name: '키메라 엔진 (정예)', tier: EnemyTier.ELITE, maxHp: 150, currentHp: 150, block: 0, currentIntentIndex: 0, traits: [], statuses: { ...DEFAULT_STATUS },
    damageTakenThisTurn: 0,
    intents: [
      { type: IntentType.ATTACK, value: 5, description: '기관총 (x3)' },
      { type: IntentType.ATTACK, value: 5, description: '기관총 (x3)' },
      { type: IntentType.ATTACK, value: 5, description: '기관총 (x3)' },
    ]
  },
DEUS_EX_MACHINA: { // Final Boss - Balance Patch v1.0: HP 500 -> 400
    id: 'deus_ex_machina', name: '데우스 엑스 마키나', tier: EnemyTier.BOSS, maxHp: 400, currentHp: 400, block: 0, currentIntentIndex: 0, traits: [], statuses: { ...DEFAULT_STATUS },
    damageTakenThisTurn: 0,
    intents: [
      { type: IntentType.ATTACK, value: 10, description: '창조의 모방' },
      { type: IntentType.ATTACK, value: 15, description: '창조의 모방' },
      { type: IntentType.DEBUFF, value: 0, description: '코스트 제한 (MAX 2)' },
      { type: IntentType.ATTACK, value: 50, description: '최후의 심판' },
    ]
  },
};

export const ENEMY_POOLS = {
  1: {
    [EnemyTier.COMMON]: [ENEMIES.RUST_SLIME, ENEMIES.KOBOLD_SCRAPPER, ENEMIES.SKELETON_WARRIOR],
    [EnemyTier.ELITE]: [ENEMIES.ROCK_CRUSHER],
    [EnemyTier.BOSS]: ENEMIES.JUNK_KING
  },
  2: {
    [EnemyTier.COMMON]: [ENEMIES.EMBER_WISP, ENEMIES.HAMMERHEAD, ENEMIES.LOOT_GOBLIN],
    [EnemyTier.ELITE]: [ENEMIES.MIMIC_ANVIL],
    [EnemyTier.BOSS]: ENEMIES.CORRUPTED_SMITH
  },
  3: {
    [EnemyTier.COMMON]: [ENEMIES.AUTOMATON_DEFENDER, ENEMIES.SKELETON_WARRIOR],
    [EnemyTier.ELITE]: [ENEMIES.CHIMERA_ENGINE, ENEMIES.SHADOW_ASSASSIN],
    [EnemyTier.BOSS]: ENEMIES.DEUS_EX_MACHINA
  }
};

// --- Events ---

export const GAME_EVENTS: GameEvent[] = [
    {
        id: 'healing_spring',
        title: '치유의 샘',
        description: '깊은 굴 속에 맑은 물이 솟아오르는 샘이 있습니다. 물은 신비로운 빛을 내뿜고 있습니다.',
        icon: 'droplets',
        options: [
            { label: '물 마시기', description: '체력을 15 회복합니다.', type: 'HEAL', value: 15 },
            { label: '떠나기', description: '아무 일도 일어나지 않습니다.', type: 'LEAVE' }
        ]
    },
    {
        id: 'cursed_statue',
        title: '저주받은 조각상',
        description: '기괴한 형태의 조각상이 당신을 노려보는 것 같습니다. 발치에는 희귀한 무기 부품이 떨어져 있습니다.',
        icon: 'skull',
        options: [
            { label: '부품 줍기', description: '체력을 6 잃고, 희귀 카드를 획득합니다.', type: 'GAIN_CARD_RARE', value: 6, cost: 6 },
            { label: '무시하기', description: '조용히 지나갑니다.', type: 'LEAVE' }
        ]
    },
    {
        id: 'wandering_merchant',
        title: '떠돌이 상인',
        description: '커다란 배낭을 멘 상인이 잠시 쉬어가라고 손짓합니다. "좋은 물건이 있다네."',
        icon: 'gem',
        options: [
            { label: '카드 제거', description: '30 골드를 지불하고 카드 1장을 제거합니다.', type: 'REMOVE_CARD', cost: 30 },
            { label: '물약 구매', description: '15 골드를 지불하고 체력을 모두 회복합니다.', type: 'FULL_HEAL', cost: 15 },
            { label: '떠나기', description: '상인에게 작별을 고합니다.', type: 'LEAVE' }
        ]
    },
    {
        id: 'ancient_forge',
        title: '고대의 모루',
        description: '아직 열기가 남아있는 낡은 모루를 발견했습니다. 무언가를 제련할 수 있을 것 같습니다.',
        icon: 'hammer',
        options: [
            { label: '카드 강화', description: '무작위 카드 1장을 희귀 등급으로 변환합니다.', type: 'RANDOM_UPGRADE' },
            { label: '카드 제거', description: '체력을 5 소모하여 카드 1장을 제거합니다.', type: 'REMOVE_CARD', cost: 5, value: 5 }, // Using cost field specifically for logic
            { label: '떠나기', description: '그냥 지나칩니다.', type: 'LEAVE' }
        ]
    }
];