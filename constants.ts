
import {
  BossRewardDefinition,
  CardArchetypeDefinition,
  CardData,
  CardRarity,
  CardType,
  CombatRewardId,
  CombatRewardRule,
  EnemyData,
  IntentType,
  EnemyTrait,
  EnemyTier,
  GameEvent,
  NodeType,
  ShopItemDefinition
} from './types';

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
  { id: 204, name: '가벼운 깃털', type: CardType.DECO, cost: 0, value: 0, rarity: CardRarity.COMMON, description: '카드 1장 즉시 드로우' },
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
  { id: 218, name: '가벼운 자루', type: CardType.HANDLE, cost: 0, value: 0.8, rarity: CardRarity.COMMON, description: '피해량 80%. 비용 0.' },
  { id: 219, name: '쇠약의 문양', type: CardType.DECO, cost: 0, value: 0, rarity: CardRarity.COMMON, description: '적에게 약화 1 부여.' },
  { id: 216, name: '핏빛 자루', type: CardType.HANDLE, cost: 0, value: 1, rarity: CardRarity.COMMON, description: '비용 0. 자해 2.' },
  { id: 217, name: '방패 손잡이', type: CardType.HANDLE, cost: 1, value: 1, rarity: CardRarity.COMMON, description: '[방어] 머리의 공격력을 방어도로 전환.' },
  { id: 220, name: '독성 코일 자루', type: CardType.HANDLE, cost: 1, value: 1, rarity: CardRarity.COMMON, description: '독 2 부여.' },
  { id: 221, name: '불씨 감은 자루', type: CardType.HANDLE, cost: 1, value: 1, rarity: CardRarity.COMMON, description: '화상 2 부여.' },
  { id: 222, name: '전도성 자루', type: CardType.HANDLE, cost: 1, value: 1, rarity: CardRarity.COMMON, description: '에너지 1 회복.' },
  { id: 223, name: '속기 자루', type: CardType.HANDLE, cost: 1, value: 1, rarity: CardRarity.COMMON, description: '카드 1장 드로우.' },
  { id: 224, name: '대형 자루', type: CardType.HANDLE, cost: 2, value: 1.5, rarity: CardRarity.COMMON, description: '피해량 150%.' },
  { id: 225, name: '분할 자루', type: CardType.HANDLE, cost: 1, value: 0.6, rarity: CardRarity.COMMON, description: '피해량 60%. 머리 효과 2회 발동.' },
  { id: 226, name: '상처 갈퀴', type: CardType.HEAD, cost: 1, value: 7, rarity: CardRarity.COMMON, description: '피해 7. 자해 2.' },
  { id: 227, name: '경비병 도끼', type: CardType.HEAD, cost: 1, value: 6, rarity: CardRarity.COMMON, description: '방어도 6 (방어형 머리).' },
  { id: 228, name: '맹독 바늘검', type: CardType.HEAD, cost: 1, value: 4, rarity: CardRarity.COMMON, description: '피해 4. 독 3 부여.' },
  { id: 229, name: '화덕 검날', type: CardType.HEAD, cost: 1, value: 5, rarity: CardRarity.COMMON, description: '피해 5. 화상 2 부여.' },
  { id: 230, name: '전류 단검', type: CardType.HEAD, cost: 1, value: 4, rarity: CardRarity.COMMON, description: '피해 4. 에너지 1 회복.' },
  { id: 231, name: '서기 칼날', type: CardType.HEAD, cost: 1, value: 5, rarity: CardRarity.COMMON, description: '피해 5. 카드 1장 드로우.' },
  { id: 232, name: '도살 대검', type: CardType.HEAD, cost: 2, value: 14, rarity: CardRarity.COMMON, description: '피해 14.' },
  { id: 233, name: '세 갈래 송곳', type: CardType.HEAD, cost: 1, value: 2, rarity: CardRarity.COMMON, description: '피해 2, 3회 공격.' },
  { id: 234, name: '연계 톱날', type: CardType.HEAD, cost: 1, value: 4, rarity: CardRarity.COMMON, description: '피해 4. 이번 턴 사용한 무기 수만큼 추가 피해.' },
  { id: 235, name: '부식 톱니', type: CardType.HEAD, cost: 1, value: 3, rarity: CardRarity.COMMON, description: '피해 3. 적 독 스택만큼 추가 피해.' },
  { id: 236, name: '핏방울 부적', type: CardType.DECO, cost: 0, value: 2, rarity: CardRarity.COMMON, description: '피해량 +2. 자해 2.' },
  { id: 237, name: '방패 파편', type: CardType.DECO, cost: 0, value: 0, rarity: CardRarity.COMMON, description: '현재 방어도의 40%를 추가 피해로 전환.' },
  { id: 238, name: '독가루 주머니', type: CardType.DECO, cost: 0, value: 0, rarity: CardRarity.COMMON, description: '독 2 부여.' },
  { id: 239, name: '잿불 장식', type: CardType.DECO, cost: 0, value: 0, rarity: CardRarity.COMMON, description: '화상 2 부여.' },
  { id: 240, name: '동력 스프링', type: CardType.DECO, cost: 0, value: 0, rarity: CardRarity.COMMON, description: '에너지 1 회복.' },
  { id: 241, name: '기록 리본', type: CardType.DECO, cost: 0, value: 0, rarity: CardRarity.COMMON, description: '다음 턴 카드 1장 추가 드로우.' },
  { id: 242, name: '무거운 추', type: CardType.DECO, cost: 1, value: 5, rarity: CardRarity.COMMON, description: '피해량 +5.' },
  { id: 243, name: '쌍침 장식', type: CardType.DECO, cost: 0, value: 1, rarity: CardRarity.COMMON, description: '피해량 +1. 다단히트 무기면 추가 피해 +4.' },
  { id: 244, name: '둔화 가루', type: CardType.DECO, cost: 0, value: 0, rarity: CardRarity.COMMON, description: '약화 1 부여.' },
  { id: 245, name: '예열 부싯돌', type: CardType.DECO, cost: 0, value: 3, rarity: CardRarity.COMMON, description: '피해량 +3.' },
  { id: 246, name: '훈련용 철퇴', type: CardType.HEAD, cost: 1, value: 7, rarity: CardRarity.COMMON, description: '피해 7.' },
  { id: 247, name: '압축 숫돌', type: CardType.DECO, cost: 1, value: 6, rarity: CardRarity.COMMON, description: '피해량 +6.' },
  { id: 248, name: '균형추 손잡이', type: CardType.HANDLE, cost: 1, value: 1.25, rarity: CardRarity.COMMON, description: '피해량 125%. 이번 턴 첫 무기라면 카드 1장 드로우.' },
  { id: 249, name: '쌍갈고리 송곳', type: CardType.HEAD, cost: 1, value: 3, rarity: CardRarity.COMMON, description: '피해 3, 2회 공격.' },

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
  { id: 321, name: '혈서 손잡이', type: CardType.HANDLE, cost: 1, value: 1.4, rarity: CardRarity.RARE, description: '피해량 140%. 자해 4.' },
  { id: 322, name: '성벽 손잡이', type: CardType.HANDLE, cost: 2, value: 1.5, rarity: CardRarity.RARE, description: '[방어] 피해량 150%. 머리의 공격력을 방어도로 전환.' },
  { id: 323, name: '역병 손잡이', type: CardType.HANDLE, cost: 1, value: 1, rarity: CardRarity.RARE, description: '독 4 부여.' },
  { id: 324, name: '발화 손잡이', type: CardType.HANDLE, cost: 1, value: 1, rarity: CardRarity.RARE, description: '화상 3 부여.' },
  { id: 325, name: '발전 손잡이', type: CardType.HANDLE, cost: 1, value: 1, rarity: CardRarity.RARE, description: '에너지 1 회복.' },
  { id: 326, name: '순환 손잡이', type: CardType.HANDLE, cost: 1, value: 1, rarity: CardRarity.RARE, description: '카드 1장 드로우.' },
  { id: 327, name: '거인 자루', type: CardType.HANDLE, cost: 2, value: 2.2, rarity: CardRarity.RARE, description: '피해량 220%.' },
  { id: 328, name: '분신 손잡이', type: CardType.HANDLE, cost: 2, value: 1.2, rarity: CardRarity.RARE, description: '피해량 120%. 머리 효과 2회 발동.' },
  { id: 329, name: '피의 톱날', type: CardType.HEAD, cost: 1, value: 10, rarity: CardRarity.RARE, description: '피해 10. 자해 4.' },
  { id: 330, name: '성채 머리', type: CardType.HEAD, cost: 2, value: 12, rarity: CardRarity.RARE, description: '방어도 12 (방어형 머리).' },
  { id: 331, name: '역병 낫', type: CardType.HEAD, cost: 2, value: 8, rarity: CardRarity.RARE, description: '피해 8. 독 5 부여.' },
  { id: 332, name: '불꽃 톱', type: CardType.HEAD, cost: 2, value: 9, rarity: CardRarity.RARE, description: '피해 9. 화상 5 부여.' },
  { id: 333, name: '마력 톱날', type: CardType.HEAD, cost: 1, value: 6, rarity: CardRarity.RARE, description: '피해 6. 에너지 1 회복.' },
  { id: 334, name: '비술 서슬', type: CardType.HEAD, cost: 1, value: 5, rarity: CardRarity.RARE, description: '피해 5. 카드 1장 드로우.' },
  { id: 335, name: '폭풍 삼지창', type: CardType.HEAD, cost: 2, value: 5, rarity: CardRarity.RARE, description: '피해 5, 3회 공격.' },
  { id: 336, name: '공성추 머리', type: CardType.HEAD, cost: 3, value: 24, rarity: CardRarity.RARE, description: '피해 24.' },
  { id: 337, name: '혈석 룬', type: CardType.DECO, cost: 0, value: 0, rarity: CardRarity.RARE, description: '자해 3. 이번 턴 자해량만큼 추가 피해.' },
  { id: 338, name: '방벽 렌즈', type: CardType.DECO, cost: 1, value: 0, rarity: CardRarity.RARE, description: '이 무기의 방어도 2배. 현재 방어도만큼 추가 피해.' },
  { id: 339, name: '맹독 렌즈', type: CardType.DECO, cost: 1, value: 0, rarity: CardRarity.RARE, description: '독 5 부여.' },
  { id: 340, name: '화염 렌즈', type: CardType.DECO, cost: 1, value: 0, rarity: CardRarity.RARE, description: '화상 4 부여.' },
  { id: 341, name: '과충전 코일', type: CardType.DECO, cost: 0, value: 0, rarity: CardRarity.RARE, description: '에너지 1 회복.' },
  { id: 342, name: '흐름의 깃', type: CardType.DECO, cost: 0, value: 0, rarity: CardRarity.RARE, description: '카드 1장 드로우.' },
  { id: 343, name: '거대화 문장', type: CardType.DECO, cost: 2, value: 0, rarity: CardRarity.RARE, description: '피해량 1.5배.' },
  { id: 344, name: '연타 공명석', type: CardType.DECO, cost: 1, value: 0, rarity: CardRarity.RARE, description: '다단히트 무기면 추가 피해 +6.' },

  // Legend
  { id: 401, name: '거인의 악력', type: CardType.HANDLE, cost: 3, value: 3, rarity: CardRarity.LEGEND, description: '피해량 3배. 적 기절.' },
  { id: 402, name: '공허의 수정', type: CardType.HEAD, cost: 3, value: 30, rarity: CardRarity.LEGEND, description: '피해 30. 소멸.' },
  { id: 403, name: '현자의 돌', type: CardType.DECO, cost: 0, value: 0, rarity: CardRarity.LEGEND, description: '무기 비용을 0으로 설정' },
  
// New Legend (Balance Patch v1.1: 40->30 damage, 5->6 self-damage)
  { id: 404, name: '운석 파편', type: CardType.HEAD, cost: 2, value: 30, rarity: CardRarity.LEGEND, description: '피해 30. 자해 6.' },

  // Balance Patch v1.0 - New Legend
  { id: 405, name: '무한 회귀', type: CardType.HANDLE, cost: 2, value: 1, rarity: CardRarity.LEGEND, description: '사용 후 손으로 귀환. 턴당 1회.' },
  { id: 406, name: '시간의 톱니', type: CardType.HEAD, cost: 2, value: 0, rarity: CardRarity.LEGEND, description: '적 기절 1. 다음 의도 건너뜀.' },
  { id: 407, name: '성장하는 결정', type: CardType.DECO, cost: 1, value: 2, rarity: CardRarity.LEGEND, description: '영구 피해 +2. 전투 중 중첩 (최대 16).' },

  // Balance Patch v1.1 - New Legend
  { id: 408, name: '서리 칼날', type: CardType.HEAD, cost: 2, value: 8, rarity: CardRarity.LEGEND, description: '피해 8. 적 기절.' },
  { id: 409, name: '처형자의 칼날', type: CardType.HEAD, cost: 2, value: 5, rarity: CardRarity.LEGEND, description: '피해 5. 빈사 상태(HP 20% 이하) 적 처형.' },
  { id: 412, name: '회피의 자루', type: CardType.HANDLE, cost: 2, value: 1, rarity: CardRarity.LEGEND, description: '적의 다음 공격 회피.' },
  { id: 413, name: '용의 문장', type: CardType.DECO, cost: 1, value: 0, rarity: CardRarity.LEGEND, description: '피해량 2배.' },
  { id: 414, name: '피의 계약', type: CardType.HANDLE, cost: 1, value: 1.8, rarity: CardRarity.LEGEND, description: '피해량 180%. 자해 8.' },
  { id: 415, name: '영원 방패 손잡이', type: CardType.HANDLE, cost: 2, value: 2, rarity: CardRarity.LEGEND, description: '[방어] 피해량 200%. 머리의 공격력을 방어도로 전환.' },
  { id: 416, name: '무한 필사 자루', type: CardType.HANDLE, cost: 2, value: 1, rarity: CardRarity.LEGEND, description: '사용 후 손으로 귀환. 카드 1장 드로우. 턴당 1회.' },
  { id: 417, name: '백수 손잡이', type: CardType.HANDLE, cost: 3, value: 1.5, rarity: CardRarity.LEGEND, description: '피해량 150%. 머리 효과 2회 발동.' },
  { id: 418, name: '혈월 대검', type: CardType.HEAD, cost: 2, value: 24, rarity: CardRarity.LEGEND, description: '피해 24. 자해 8.' },
  { id: 419, name: '천공 방벽', type: CardType.HEAD, cost: 3, value: 25, rarity: CardRarity.LEGEND, description: '방어도 25 (방어형 머리).' },
  { id: 420, name: '종말 역병', type: CardType.HEAD, cost: 3, value: 12, rarity: CardRarity.LEGEND, description: '피해 12. 독 8, 화상 6 부여.' },
  { id: 421, name: '유성 군집', type: CardType.HEAD, cost: 3, value: 8, rarity: CardRarity.LEGEND, description: '피해 8, 4회 공격. 소멸.' },
  { id: 422, name: '심장 파편', type: CardType.DECO, cost: 1, value: 0, rarity: CardRarity.LEGEND, description: '자해 4. 이번 턴 자해량의 2배만큼 추가 피해.' },
  { id: 423, name: '영원한 성벽', type: CardType.DECO, cost: 2, value: 0, rarity: CardRarity.LEGEND, description: '이 무기의 방어도 2배. 현재 방어도의 150%를 추가 피해로 전환.' },
  { id: 424, name: '무한 전지', type: CardType.DECO, cost: 1, value: 0, rarity: CardRarity.LEGEND, description: '에너지 2 회복.' },
  { id: 425, name: '별자리 도면', type: CardType.DECO, cost: 1, value: 0, rarity: CardRarity.LEGEND, description: '카드 2장 드로우. 다음 턴 드로우 +1.' },

  // Special / Generated
  { id: 801, name: '그림자 무기', type: CardType.HEAD, cost: 0, value: 0, rarity: CardRarity.SPECIAL, description: '복제된 무기의 힘을 담은 그림자입니다.' },

  // Junk (Enemy Generated)
  { id: 901, name: '녹슨 덩어리', type: CardType.JUNK, cost: 1, value: 0, rarity: CardRarity.JUNK, description: '사용 불가. 손패를 차지합니다.', unplayable: true },
];

export const INITIAL_DECK_IDS = [101, 101, 102, 103, 103, 104, 105, 106];

export const CARD_ARCHETYPES: CardArchetypeDefinition[] = [
  {
    id: 'SELF_DAMAGE',
    name: '자해',
    description: 'HP를 비용으로 빠른 피해와 자해량 보너스를 누적합니다.',
    entryCardIds: [216, 226, 236],
    midCardIds: [318, 329, 337],
    lateCardIds: [414, 418, 422],
    slotCardIds: {
      [CardType.HANDLE]: [216, 318, 321, 414],
      [CardType.HEAD]: [226, 314, 329, 418],
      [CardType.DECO]: [236, 320, 337, 422]
    }
  },
  {
    id: 'DEFENSE_CONVERSION',
    name: '방어 전환',
    description: '방어도와 방어형 머리를 피해 또는 생존력으로 전환합니다.',
    entryCardIds: [217, 227, 237],
    midCardIds: [207, 311, 338],
    lateCardIds: [415, 419, 423],
    slotCardIds: {
      [CardType.HANDLE]: [102, 217, 322, 415],
      [CardType.HEAD]: [104, 227, 330, 419],
      [CardType.DECO]: [210, 207, 311, 338, 423]
    }
  },
  {
    id: 'STATUS_DAMAGE',
    name: '독/출혈/화상',
    description: '지속 피해를 쌓고 상태 스택을 직접 피해로 다시 회수합니다.',
    entryCardIds: [220, 228, 238],
    midCardIds: [319, 331, 340],
    lateCardIds: [401, 420, 407],
    slotCardIds: {
      [CardType.HANDLE]: [201, 206, 220, 221, 323, 324, 401],
      [CardType.HEAD]: [203, 213, 228, 229, 235, 331, 332, 420],
      [CardType.DECO]: [205, 219, 238, 239, 319, 339, 340, 407]
    }
  },
  {
    id: 'ENERGY_LOOP',
    name: '에너지 순환',
    description: '무기 비용을 지불한 뒤 에너지를 되돌려 한 턴 행동 수를 늘립니다.',
    entryCardIds: [222, 230, 240],
    midCardIds: [313, 325, 341],
    lateCardIds: [403, 424],
    slotCardIds: {
      [CardType.HANDLE]: [222, 325],
      [CardType.HEAD]: [230, 313, 333],
      [CardType.DECO]: [208, 211, 240, 341, 403, 424]
    }
  },
  {
    id: 'DRAW_LOOP',
    name: '드로우 순환',
    description: '카드 드로우와 손패 귀환으로 조합 탐색 빈도를 높입니다.',
    entryCardIds: [204, 223, 231, 248],
    midCardIds: [305, 326, 342],
    lateCardIds: [405, 416, 425],
    slotCardIds: {
      [CardType.HANDLE]: [212, 223, 248, 326, 405, 416],
      [CardType.HEAD]: [215, 231, 334, 406],
      [CardType.DECO]: [106, 204, 241, 305, 342, 425]
    }
  },
  {
    id: 'HEAVY_STRIKE',
    name: '고비용 한방',
    description: '높은 비용과 큰 계수를 감수하고 단발 피해를 크게 압축합니다.',
    entryCardIds: [224, 232, 242, 246, 247],
    midCardIds: [304, 327, 336],
    lateCardIds: [402, 404, 413],
    slotCardIds: {
      [CardType.HANDLE]: [224, 327, 401],
      [CardType.HEAD]: [232, 246, 304, 336, 402, 404],
      [CardType.DECO]: [242, 247, 343, 413]
    }
  },
  {
    id: 'MULTI_HIT',
    name: '다단히트',
    description: '낮은 피해를 여러 번 넣어 적중 효과와 상태 부여를 증폭합니다.',
    entryCardIds: [225, 233, 243, 249],
    midCardIds: [301, 335, 344],
    lateCardIds: [417, 421, 425],
    slotCardIds: {
      [CardType.HANDLE]: [225, 301, 328, 417],
      [CardType.HEAD]: [306, 233, 249, 335, 421],
      [CardType.DECO]: [243, 344, 425]
    }
  }
];

const DEFAULT_STATUS = { poison: 0, bleed: 0, stunned: 0, strength: 0, vulnerable: 0, weak: 0, burn: 0 };

// --- Enemies ---

const defineEnemy = (
  id: string,
  name: string,
  tier: EnemyTier,
  maxHp: number,
  intents: EnemyData['intents'],
  traits: EnemyTrait[] = []
): EnemyData => ({
  id,
  name,
  tier,
  maxHp,
  currentHp: maxHp,
  block: 0,
  currentIntentIndex: 0,
  traits,
  statuses: { ...DEFAULT_STATUS },
  damageTakenThisTurn: 0,
  intents
});

export const ENEMIES: Record<string, EnemyData> = {
  // Floor 1: The Abandoned Mine
	RUST_SLIME: defineEnemy(
    'rust_slime',
    '녹슨 슬라임',
    EnemyTier.COMMON,
    30,
    [
      { type: IntentType.ATTACK, value: 5, description: '몸통 박치기' },
      { type: IntentType.ATTACK, value: 7, description: '녹슨 돌진' },
      { type: IntentType.DEBUFF, value: 1, description: '덱에 [녹슨 덩어리] 추가' },
    ]
  ),
  KOBOLD_SCRAPPER: defineEnemy(
    'kobold_scrapper',
    '코볼트 수집가',
    EnemyTier.COMMON,
    36,
    [
      { type: IntentType.ATTACK, value: 5, description: '할퀴기' },
      { type: IntentType.ATTACK, value: 5, description: '할퀴기' },
      { type: IntentType.BUFF, value: 0, description: '가방 뒤적이기 (일시적 공격력 1~3 증가)' },
    ]
  ),
  SKELETON_WARRIOR: defineEnemy(
    'skeleton_warrior',
    '해골 전사',
    EnemyTier.COMMON,
    32,
    [
      { type: IntentType.ATTACK, value: 6, description: '낡은 검' },
      { type: IntentType.DEFEND, value: 5, description: '방어 태세' },
      { type: IntentType.ATTACK, value: 8, description: '강하게 베기' },
    ]
  ),
  MINE_BAT: defineEnemy(
    'mine_bat',
    '광산 박쥐',
    EnemyTier.COMMON,
    28,
    [
      { type: IntentType.ATTACK, value: 4, hits: 2, description: '쪼아대기 (x2)' },
      { type: IntentType.DEFEND, value: 4, description: '천장 매달리기' },
      { type: IntentType.ATTACK, value: 6, description: '급강하' },
    ]
  ),
  SPORE_TOTEM: defineEnemy(
    'spore_totem',
    '포자 토템',
    EnemyTier.COMMON,
    42,
    [
      { type: IntentType.ATTACK, value: 8, description: '독포자 침' },
      { type: IntentType.BUFF, value: 0, description: '상태이상 흡수', effect: { type: 'CLEANSE_STATUSES_GAIN_STRENGTH', amountPerStatus: 1, minGain: 2, maxGain: 6 } },
    ]
  ),
  SHIELD_MITE: defineEnemy(
    'shield_mite',
    '방패 진드기',
    EnemyTier.COMMON,
    38,
    [
      { type: IntentType.DEFEND, value: 8, description: '껍질 세우기' },
      { type: IntentType.ATTACK, value: 5, description: '방패 물기 (플레이어 방어도 반영)', effect: { type: 'ATTACK_FROM_PLAYER_BLOCK', multiplier: 0.5 } },
      { type: IntentType.ATTACK, value: 7, description: '틈새 물어뜯기' },
    ]
  ),
  COPPER_TINKER: defineEnemy(
    'copper_tinker',
    '구리 땜장이',
    EnemyTier.COMMON,
    44,
    [
      { type: IntentType.DEBUFF, value: 0, description: '손잡이 나사 조이기', effect: { type: 'INCREASE_RANDOM_HANDLE_COST', amount: 1 } },
      { type: IntentType.ATTACK, value: 8, description: '렌치 타격' },
    ]
  ),
  ROCK_CRUSHER: defineEnemy(
    'rock_crusher',
    '바위 분쇄기 (정예)',
    EnemyTier.ELITE,
    80,
    [
      { type: IntentType.ATTACK, value: 12, description: '육중한 강타' },
      { type: IntentType.DEFEND, value: 15, description: '바위 숨기' },
      { type: IntentType.ATTACK, value: 8, description: '지진' },
    ],
    [EnemyTrait.DAMAGE_CAP_15]
  ),
  BARBED_MINE: defineEnemy(
    'barbed_mine',
    '가시 광맥 (정예)',
    EnemyTier.ELITE,
    76,
    [
      { type: IntentType.DEFEND, value: 12, description: '가시 결정화' },
      { type: IntentType.ATTACK, value: 7, hits: 2, description: '파편 폭발 (x2)' },
      { type: IntentType.ATTACK, value: 10, description: '날카로운 돌진' },
    ],
    [EnemyTrait.THORNS_5]
  ),
  ORE_WARDEN: defineEnemy(
    'ore_warden',
    '광맥 파수꾼 (정예)',
    EnemyTier.ELITE,
    92,
    [
      { type: IntentType.DEFEND, value: 15, description: '철벽 태세' },
      { type: IntentType.ATTACK, value: 10, description: '방어 균열 추적', effect: { type: 'ATTACK_FROM_PLAYER_BLOCK', multiplier: 0.75 } },
      { type: IntentType.BUFF, value: 0, description: '광맥 공명', effect: { type: 'GAIN_STRENGTH', amount: 2 } },
      { type: IntentType.ATTACK, value: 14, description: '수호자의 강타' },
    ]
  ),
  JUNK_KING: defineEnemy(
    'junk_king',
    '고철의 왕 (보스)',
    EnemyTier.BOSS,
    150,
    [
      { type: IntentType.ATTACK, value: 10, description: '자석 펀치' },
      { type: IntentType.DEBUFF, value: 0, description: '[녹슨 덩어리] 3장 추가', effect: { type: 'ADD_JUNK', count: 3 } },
      { type: IntentType.ATTACK, value: 15, description: '폐품 투척' },
    ]
  ),
  CAVE_HEART: defineEnemy(
    'cave_heart',
    '광산의 심장 (보스)',
    EnemyTier.BOSS,
    168,
    [
      { type: IntentType.ATTACK, value: 12, description: '맥동 충격' },
      { type: IntentType.BUFF, value: 0, description: '오염 정화', effect: { type: 'CLEANSE_STATUSES_GAIN_STRENGTH', amountPerStatus: 1, minGain: 2, maxGain: 8 } },
      { type: IntentType.DEBUFF, value: 0, description: '폐석 붕괴', effect: { type: 'ADD_JUNK', count: 2 } },
      { type: IntentType.ATTACK, value: 22, description: '방어 파쇄 맥동', effect: { type: 'ATTACK_FROM_PLAYER_BLOCK', multiplier: 0.5 } },
    ]
  ),

  // Floor 2: The Molten Forge
  EMBER_WISP: defineEnemy(
    'ember_wisp',
    '화염의 위습',
    EnemyTier.COMMON,
    50,
    [
      { type: IntentType.ATTACK, value: 5, hits: 2, description: '불씨 난사 (x2)' },
      { type: IntentType.ATTACK, value: 8, description: '응축 화염' },
    ]
  ),
  HAMMERHEAD: defineEnemy(
    'hammerhead',
    '망치 머리 고블린',
    EnemyTier.COMMON,
    65,
    [
      { type: IntentType.ATTACK, value: 12, description: '내려찍기' },
      { type: IntentType.DEBUFF, value: 0, description: '무작위 손잡이 비용 +1' },
    ]
  ),
  LOOT_GOBLIN: defineEnemy(
    'loot_goblin',
    '도굴꾼 고블린',
    EnemyTier.COMMON,
    55,
    [
        { type: IntentType.ATTACK, value: 10, description: '소매치기 (골드 강탈)' },
        { type: IntentType.DEBUFF, value: 0, description: '모래 뿌리기', effect: { type: 'ADD_JUNK', count: 1 } },
        { type: IntentType.DEFEND, value: 10, description: '도주 준비' }
    ],
    [EnemyTrait.THIEVERY]
  ),
  ASH_LEECH: defineEnemy(
    'ash_leech',
    '잿불 거머리',
    EnemyTier.COMMON,
    58,
    [
      { type: IntentType.ATTACK, value: 6, hits: 2, description: '흡열 물기 (x2)' },
      { type: IntentType.BUFF, value: 0, description: '불순물 흡수', effect: { type: 'CLEANSE_STATUSES_GAIN_STRENGTH', amountPerStatus: 1, minGain: 2, maxGain: 8 } },
      { type: IntentType.ATTACK, value: 10, description: '달궈진 흡혈' },
    ]
  ),
  FURNACE_SENTRY: defineEnemy(
    'furnace_sentry',
    '용광로 보초',
    EnemyTier.COMMON,
    75,
    [
      { type: IntentType.DEFEND, value: 12, description: '내열 방패' },
      { type: IntentType.ATTACK, value: 8, description: '방패 열반응', effect: { type: 'ATTACK_FROM_PLAYER_BLOCK', multiplier: 0.5 } },
      { type: IntentType.ATTACK, value: 12, description: '과열 베기' },
    ]
  ),
  COAL_IMP: defineEnemy(
    'coal_imp',
    '석탄 임프',
    EnemyTier.COMMON,
    50,
    [
      { type: IntentType.DEBUFF, value: 0, description: '끈적한 그을음', effect: { type: 'INCREASE_RANDOM_HANDLE_COST', amount: 1 } },
      { type: IntentType.ATTACK, value: 9, description: '숯검댕 찌르기' },
      { type: IntentType.ATTACK, value: 6, hits: 2, description: '불똥 튀기기 (x2)' },
    ]
  ),
  CINDER_RAT: defineEnemy(
    'cinder_rat',
    '그을음 쥐',
    EnemyTier.COMMON,
    54,
    [
      { type: IntentType.DEBUFF, value: 0, description: '재 더미 흩뿌리기', effect: { type: 'ADD_JUNK', count: 2 } },
      { type: IntentType.ATTACK, value: 10, description: '타다 남은 이빨' },
      { type: IntentType.DEFEND, value: 8, description: '연기 속 숨기' },
    ]
  ),
  MIMIC_ANVIL: defineEnemy(
    'mimic_anvil',
    '흉내쟁이 모루 (정예)',
    EnemyTier.ELITE,
    100,
    [
      { type: IntentType.DEFEND, value: 20, description: '단단해지기' },
      { type: IntentType.ATTACK, value: 0, description: '받은 피해 반사', effect: { type: 'REFLECT_DAMAGE_TAKEN' } },
    ]
  ),
  GLASS_GOLEM: defineEnemy(
    'glass_golem',
    '유리 골렘 (정예)',
    EnemyTier.ELITE,
    115,
    [
      { type: IntentType.ATTACK, value: 14, description: '깨지는 주먹' },
      { type: IntentType.DEFEND, value: 20, description: '결정 방벽' },
      { type: IntentType.ATTACK, value: 10, hits: 2, description: '파편 난사 (x2)' },
    ],
    [EnemyTrait.DAMAGE_CAP_15]
  ),
  CINDER_ARCHIVIST: defineEnemy(
    'cinder_archivist',
    '잿빛 기록관 (정예)',
    EnemyTier.ELITE,
    105,
    [
      { type: IntentType.DEBUFF, value: 0, description: '불탄 설계도 삽입', effect: { type: 'ADD_JUNK', count: 3 } },
      { type: IntentType.ATTACK, value: 15, description: '잉걸불 낙인' },
      { type: IntentType.DEBUFF, value: 0, description: '용광로 규칙 강제', effect: { type: 'SET_PLAYER_COST_LIMIT', limit: 2 } },
      { type: IntentType.ATTACK, value: 12, description: '재갈퀴' },
    ]
  ),
	CORRUPTED_SMITH: defineEnemy(
    'corrupted_smith',
    '타락한 대장장이 (보스)',
    EnemyTier.BOSS,
    220,
    [
      { type: IntentType.ATTACK, value: 20, description: '달궈진 망치' },
      { type: IntentType.SPECIAL, value: 0, description: '다음 턴 무기 파괴', effect: { type: 'DISARM_HEAD' } },
      { type: IntentType.ATTACK, value: 30, description: '대멸종' },
    ]
  ),
  MOLTEN_OVERSEER: defineEnemy(
    'molten_overseer',
    '용광로 감독관 (보스)',
    EnemyTier.BOSS,
    260,
    [
      { type: IntentType.ATTACK, value: 18, hits: 2, description: '쌍망치 압연 (x2)' },
      { type: IntentType.DEBUFF, value: 0, description: '공정 지연', effect: { type: 'INCREASE_RANDOM_HANDLE_COST', amount: 1 } },
      { type: IntentType.BUFF, value: 0, description: '슬래그 정화', effect: { type: 'CLEANSE_STATUSES_GAIN_STRENGTH', amountPerStatus: 1, minGain: 3, maxGain: 10 } },
      { type: IntentType.ATTACK, value: 28, description: '용융 강타' },
      { type: IntentType.DEFEND, value: 30, description: '강철 장벽' },
    ]
  ),

  // Floor 3: Clockwork Sanctuary
  AUTOMATON_DEFENDER: defineEnemy(
    'automaton_defender',
    '자동화 방패병',
    EnemyTier.COMMON,
    80,
    [
      { type: IntentType.DEFEND, value: 15, description: '방패 전개' },
      { type: IntentType.ATTACK, value: 10, description: '방패 밀치기' },
      { type: IntentType.BUFF, value: 0, description: '긴급 수리', effect: { type: 'HEAL_SELF', amount: 15 } },
    ],
    [EnemyTrait.THORNS_5]
  ),
  NULL_PRIEST: defineEnemy(
    'null_priest',
    '무효 사제',
    EnemyTier.COMMON,
    86,
    [
      { type: IntentType.BUFF, value: 0, description: '상태 코드 삭제', effect: { type: 'CLEANSE_STATUSES_GAIN_STRENGTH', amountPerStatus: 1, minGain: 3, maxGain: 12 } },
      { type: IntentType.ATTACK, value: 12, description: '영점 충격' },
      { type: IntentType.DEBUFF, value: 0, description: '오류 조각 삽입', effect: { type: 'ADD_JUNK', count: 2 } },
    ]
  ),
  TAX_CLOCK: defineEnemy(
    'tax_clock',
    '세금 시계',
    EnemyTier.COMMON,
    78,
    [
      { type: IntentType.DEBUFF, value: 0, description: '시간세 징수', effect: { type: 'SET_PLAYER_COST_LIMIT', limit: 2 } },
      { type: IntentType.ATTACK, value: 14, description: '분침 찌르기' },
      { type: IntentType.ATTACK, value: 8, hits: 2, description: '초침 난타 (x2)' },
    ]
  ),
  SCRAP_DRONE_SWARM: defineEnemy(
    'scrap_drone_swarm',
    '폐품 드론떼',
    EnemyTier.COMMON,
    72,
    [
      { type: IntentType.ATTACK, value: 6, hits: 3, description: '드론 난사 (x3)' },
      { type: IntentType.DEFEND, value: 10, description: '편대 재정렬' },
      { type: IntentType.ATTACK, value: 10, description: '전기톱 돌입' },
    ],
    [EnemyTrait.THORNS_5]
  ),
  LEDGER_WRAITH: defineEnemy(
    'ledger_wraith',
    '원장 망령',
    EnemyTier.COMMON,
    88,
    [
      { type: IntentType.DEBUFF, value: 0, description: '부채 기록 추가', effect: { type: 'ADD_JUNK', count: 2 } },
      { type: IntentType.ATTACK, value: 13, description: '채무 독촉' },
      { type: IntentType.BUFF, value: 0, description: '이자 누적', effect: { type: 'GAIN_STRENGTH', amount: 3 } },
    ]
  ),
  BULWARK_SENTINEL: defineEnemy(
    'bulwark_sentinel',
    '보루 파수기',
    EnemyTier.COMMON,
    98,
    [
      { type: IntentType.DEFEND, value: 15, description: '보루 전개' },
      { type: IntentType.ATTACK, value: 10, description: '방어도 역류', effect: { type: 'ATTACK_FROM_PLAYER_BLOCK', multiplier: 0.75 } },
      { type: IntentType.ATTACK, value: 15, description: '압축 충돌' },
    ]
  ),
  GEAR_LEECH: defineEnemy(
    'gear_leech',
    '톱니 거머리',
    EnemyTier.COMMON,
    82,
    [
      { type: IntentType.ATTACK, value: 8, hits: 2, description: '맞물림 절단 (x2)' },
      { type: IntentType.BUFF, value: 0, description: '부품 흡수', effect: { type: 'HEAL_SELF', amount: 15 } },
      { type: IntentType.ATTACK, value: 12, description: '기어 물어뜯기' },
    ]
  ),
  SHADOW_ASSASSIN: defineEnemy(
      'shadow_assassin',
      '그림자 암살자 (정예)',
      EnemyTier.ELITE,
      120,
      [
          { type: IntentType.ATTACK, value: 25, description: '급소 찌르기' },
          { type: IntentType.DEFEND, value: 30, description: '그림자 숨기 (높은 방어도)' },
          { type: IntentType.BUFF, value: 5, description: '칼날 연마 (공격력 +5)' }
      ]
  ),
	CHIMERA_ENGINE: defineEnemy(
    'chimera_engine',
    '키메라 엔진 (정예)',
    EnemyTier.ELITE,
    150,
    [
      { type: IntentType.ATTACK, value: 7, hits: 3, description: '기관총 (x3)' },
      { type: IntentType.DEFEND, value: 20, description: '장갑판 재배열' },
      { type: IntentType.ATTACK, value: 7, hits: 3, description: '기관총 (x3)' },
      { type: IntentType.BUFF, value: 0, description: '엔진 가속', effect: { type: 'GAIN_STRENGTH', amount: 2 } },
    ]
  ),
  PARADOX_JAILER: defineEnemy(
    'paradox_jailer',
    '역설 간수 (정예)',
    EnemyTier.ELITE,
    150,
    [
      { type: IntentType.DEBUFF, value: 0, description: '시간 감옥', effect: { type: 'SET_PLAYER_COST_LIMIT', limit: 1 } },
      { type: IntentType.ATTACK, value: 20, description: '제작 횟수 처벌', effect: { type: 'ATTACK_FROM_WEAPONS_USED', perWeapon: 2 } },
      { type: IntentType.DEBUFF, value: 0, description: '역설 파편 삽입', effect: { type: 'ADD_JUNK', count: 3 } },
      { type: IntentType.DEFEND, value: 25, description: '폐쇄 루프' },
    ]
  ),
	DEUS_EX_MACHINA: defineEnemy(
    'deus_ex_machina',
    '데우스 엑스 마키나',
    EnemyTier.BOSS,
    400,
    [
      { type: IntentType.ATTACK, value: 14, description: '창조의 모방' },
      { type: IntentType.ATTACK, value: 15, description: '창조의 모방' },
      { type: IntentType.DEBUFF, value: 0, description: '코스트 제한 (MAX 2)', effect: { type: 'SET_PLAYER_COST_LIMIT', limit: 2 } },
      { type: IntentType.ATTACK, value: 50, description: '최후의 심판' },
    ]
  ),
  CLOCKWORK_SERAPH: defineEnemy(
    'clockwork_seraph',
    '시계장치 세라프 (보스)',
    EnemyTier.BOSS,
    420,
    [
      { type: IntentType.ATTACK, value: 18, hits: 2, description: '쌍익 절단 (x2)' },
      { type: IntentType.BUFF, value: 0, description: '오류 정화', effect: { type: 'CLEANSE_STATUSES_GAIN_STRENGTH', amountPerStatus: 1, minGain: 4, maxGain: 14 } },
      { type: IntentType.ATTACK, value: 35, description: '방어 알고리즘 역산', effect: { type: 'ATTACK_FROM_PLAYER_BLOCK', multiplier: 0.5 } },
      { type: IntentType.DEBUFF, value: 0, description: '시간세 부과', effect: { type: 'SET_PLAYER_COST_LIMIT', limit: 2 } },
      { type: IntentType.DEFEND, value: 40, description: '천상 기어 방벽' },
    ]
  ),
};

export const ENEMY_POOLS: Record<1 | 2 | 3, Record<EnemyTier, EnemyData[]>> = {
  1: {
    [EnemyTier.COMMON]: [ENEMIES.RUST_SLIME, ENEMIES.KOBOLD_SCRAPPER, ENEMIES.SKELETON_WARRIOR, ENEMIES.MINE_BAT, ENEMIES.SPORE_TOTEM, ENEMIES.SHIELD_MITE, ENEMIES.COPPER_TINKER],
    [EnemyTier.ELITE]: [ENEMIES.ROCK_CRUSHER, ENEMIES.BARBED_MINE, ENEMIES.ORE_WARDEN],
    [EnemyTier.BOSS]: [ENEMIES.JUNK_KING, ENEMIES.CAVE_HEART]
  },
  2: {
    [EnemyTier.COMMON]: [ENEMIES.EMBER_WISP, ENEMIES.HAMMERHEAD, ENEMIES.LOOT_GOBLIN, ENEMIES.ASH_LEECH, ENEMIES.FURNACE_SENTRY, ENEMIES.COAL_IMP, ENEMIES.CINDER_RAT],
    [EnemyTier.ELITE]: [ENEMIES.MIMIC_ANVIL, ENEMIES.GLASS_GOLEM, ENEMIES.CINDER_ARCHIVIST],
    [EnemyTier.BOSS]: [ENEMIES.CORRUPTED_SMITH, ENEMIES.MOLTEN_OVERSEER]
  },
  3: {
    [EnemyTier.COMMON]: [ENEMIES.AUTOMATON_DEFENDER, ENEMIES.NULL_PRIEST, ENEMIES.TAX_CLOCK, ENEMIES.SCRAP_DRONE_SWARM, ENEMIES.LEDGER_WRAITH, ENEMIES.BULWARK_SENTINEL, ENEMIES.GEAR_LEECH],
    [EnemyTier.ELITE]: [ENEMIES.CHIMERA_ENGINE, ENEMIES.SHADOW_ASSASSIN, ENEMIES.PARADOX_JAILER],
    [EnemyTier.BOSS]: [ENEMIES.DEUS_EX_MACHINA, ENEMIES.CLOCKWORK_SERAPH]
  }
};

// --- Rewards ---

export const COMBAT_REWARD_RULES: Record<CombatRewardId, CombatRewardRule> = {
  COMMON: {
    id: 'COMMON',
    gold: { min: 15, max: 34 },
    cardOptionCount: 3,
    cardRarities: [CardRarity.COMMON, CardRarity.RARE, CardRarity.LEGEND]
  },
  ELITE: {
    id: 'ELITE',
    gold: { min: 30, max: 49 },
    cardOptionCount: 4,
    cardRarities: [CardRarity.COMMON, CardRarity.RARE, CardRarity.LEGEND]
  },
  BOSS: {
    id: 'BOSS',
    gold: { min: 30, max: 49 },
    cardOptionCount: 4,
    cardRarities: [CardRarity.COMMON, CardRarity.RARE, CardRarity.LEGEND]
  }
};

export const SHOP_ITEMS: ShopItemDefinition[] = [
  {
    id: 'REMOVE',
    name: '카드 정화',
    description: '카드 1장 제거',
    price: 50,
    icon: 'flame',
    color: 'red',
    effect: { type: 'REMOVE_CARD' }
  },
  {
    id: 'HEAL',
    name: '긴급 수리',
    description: '체력 50% 회복',
    price: 40,
    icon: 'heart',
    color: 'green',
    effect: { type: 'HEAL_PERCENT', percent: 0.5 }
  },
  {
    id: 'RARE',
    name: '희귀 도면',
    description: '무작위 희귀 카드',
    price: 75,
    icon: 'sparkles',
    color: 'purple',
    effect: { type: 'GAIN_RANDOM_CARD', rarity: CardRarity.RARE }
  },
  {
    id: 'ENERGY',
    name: '마나 수정',
    description: '최대 에너지 +1',
    price: 200,
    icon: 'zap',
    color: 'yellow',
    effect: { type: 'MAX_ENERGY', amount: 1 }
  }
];

export const BOSS_REWARDS: BossRewardDefinition[] = [
  {
    id: 'ENERGY',
    name: '확장 풀무',
    description: '에너지 +1',
    icon: 'zap',
    color: 'yellow',
    effect: { type: 'MAX_ENERGY', amount: 1 },
    feedback: '대장간 개조: 에너지 +1'
  },
  {
    id: 'MAX_HP',
    name: '생명석 강화',
    description: '최대 HP +30',
    icon: 'heart',
    color: 'blue',
    effect: { type: 'MAX_HP', amount: 30 },
    feedback: '대장간 확장: 최대 체력 +30'
  },
  {
    id: 'GOLD',
    name: '지원금',
    description: '골드 +200',
    icon: 'coins',
    color: 'stone',
    effect: { type: 'GAIN_GOLD', amount: 200 },
    feedback: '대장간 지원금: +200 골드'
  }
];

// --- Map ---

export const MAP_NODE_LAYOUTS: Record<1 | 2 | 3, NodeType[][]> = {
  1: [
    [NodeType.COMBAT],
    [NodeType.COMBAT, NodeType.EVENT],
    [NodeType.COMBAT, NodeType.SHOP],
    [NodeType.EVENT, NodeType.COMBAT],
    [NodeType.ELITE, NodeType.COMBAT],
    [NodeType.REST, NodeType.SHOP],
    [NodeType.COMBAT, NodeType.EVENT],
    [NodeType.ELITE, NodeType.REST],
    [NodeType.COMBAT, NodeType.SHOP],
    [NodeType.EVENT, NodeType.COMBAT],
    [NodeType.ELITE, NodeType.COMBAT],
    [NodeType.REST, NodeType.SHOP],
    [NodeType.COMBAT, NodeType.EVENT],
    [NodeType.ELITE, NodeType.REST],
    [NodeType.BOSS]
  ],
  2: [
    [NodeType.COMBAT],
    [NodeType.COMBAT, NodeType.EVENT],
    [NodeType.SHOP, NodeType.COMBAT],
    [NodeType.COMBAT, NodeType.EVENT],
    [NodeType.ELITE, NodeType.COMBAT],
    [NodeType.REST, NodeType.SHOP],
    [NodeType.COMBAT, NodeType.EVENT],
    [NodeType.ELITE, NodeType.REST],
    [NodeType.COMBAT, NodeType.SHOP],
    [NodeType.EVENT, NodeType.COMBAT],
    [NodeType.ELITE, NodeType.COMBAT],
    [NodeType.REST, NodeType.SHOP],
    [NodeType.COMBAT, NodeType.EVENT],
    [NodeType.ELITE, NodeType.REST],
    [NodeType.BOSS]
  ],
  3: [
    [NodeType.COMBAT],
    [NodeType.EVENT, NodeType.COMBAT],
    [NodeType.COMBAT, NodeType.SHOP],
    [NodeType.ELITE, NodeType.EVENT],
    [NodeType.COMBAT, NodeType.ELITE],
    [NodeType.REST, NodeType.SHOP],
    [NodeType.COMBAT, NodeType.EVENT],
    [NodeType.ELITE, NodeType.REST],
    [NodeType.COMBAT, NodeType.SHOP],
    [NodeType.EVENT, NodeType.COMBAT],
    [NodeType.ELITE, NodeType.COMBAT],
    [NodeType.REST, NodeType.SHOP],
    [NodeType.COMBAT, NodeType.EVENT],
    [NodeType.ELITE, NodeType.REST],
    [NodeType.BOSS]
  ]
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
            { label: '부품 줍기', description: '체력을 6 잃고, 희귀 카드를 획득합니다.', type: 'GAIN_CARD_RARE', cost: 6, costResource: 'HP' },
            { label: '무시하기', description: '조용히 지나갑니다.', type: 'LEAVE' }
        ]
    },
    {
        id: 'wandering_merchant',
        title: '떠돌이 상인',
        description: '커다란 배낭을 멘 상인이 잠시 쉬어가라고 손짓합니다. "좋은 물건이 있다네."',
        icon: 'gem',
        options: [
            { label: '카드 제거', description: '30 골드를 지불하고 카드 1장을 제거합니다.', type: 'REMOVE_CARD', cost: 30, costResource: 'GOLD' },
            { label: '물약 구매', description: '15 골드를 지불하고 체력을 모두 회복합니다.', type: 'FULL_HEAL', cost: 15, costResource: 'GOLD' },
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
            { label: '카드 제거', description: '체력을 5 소모하여 카드 1장을 제거합니다.', type: 'REMOVE_CARD', cost: 5, costResource: 'HP' },
            { label: '떠나기', description: '그냥 지나칩니다.', type: 'LEAVE' }
        ]
    },
    {
        id: 'collapsed_mine_cart',
        title: '무너진 광산 수레',
        description: '부서진 수레 아래로 아직 쓸 만한 광석과 오래된 주화가 흩어져 있습니다. 지지대는 금방이라도 내려앉을 듯 삐걱거립니다.',
        icon: 'gem',
        options: [
            { label: '조심히 회수', description: '35 골드를 획득합니다.', type: 'GAIN_GOLD', value: 35 },
            { label: '깊이 파헤치기', description: '체력을 8 잃고 70 골드를 획득합니다.', type: 'GAIN_GOLD', value: 70, cost: 8, costResource: 'HP' },
            { label: '떠나기', description: '불안한 갱도를 그대로 둡니다.', type: 'LEAVE' }
        ]
    },
    {
        id: 'cooling_trough',
        title: '식어가는 담금통',
        description: '희미한 푸른 김이 오르는 담금통이 있습니다. 물은 무기를 안정시키지만, 너무 오래 담그면 귀중한 재료가 녹아버릴 수 있습니다.',
        icon: 'droplets',
        options: [
            { label: '손을 식히기', description: '체력을 10 회복합니다.', type: 'HEAL', value: 10 },
            { label: '정밀 담금질', description: '20 골드를 지불하고 무작위 카드 1장을 희귀 등급으로 변환합니다.', type: 'RANDOM_UPGRADE', cost: 20, costResource: 'GOLD' },
            { label: '떠나기', description: '담금통의 온도가 더 내려가기 전에 지나칩니다.', type: 'LEAVE' }
        ]
    }
];
