# FiC 프로젝트 개발 기록

## 목차
- [기능 구현](#기능-구현)
- [에러 해결 기록](#에러-해결-기록)

---

## 기능 구현

### 2026-01-01: 밸런스 패치 v1.1 - 신규 카드 13장 및 새로운 메커니즘

#### 개요
자해 빌드, 방어무시, 회피, 처형 등 새로운 전략적 선택지를 제공하는 카드 13장 추가

#### 핵심 변경사항

##### 1. 새로운 메커니즘

| 메커니즘 | 설명 | 적용 카드 |
|---------|------|----------|
| 방어력 무시 (Armor Piercing) | 적의 방어도를 무시하고 직접 HP에 피해 | 317 관통 자루 |
| 회피 (Dodge) | 적의 다음 공격 1회를 완전히 회피 | 412 회피의 자루 |
| 처형 (Execute) | 피해 적용 후 적 HP가 최대의 20% 이하면 즉사 | 409 처형자의 칼날 |
| 자해 트래킹 (Self-Damage) | 이번 턴 자해량을 추적하여 보너스 피해 | 320 광전사의 룬 |

##### 2. 신규 카드 13장

**Common (3장)**

| ID | 이름 | 타입 | 코스트 | 효과 |
|----|------|------|--------|------|
| 215 | 민첩한 칼날 | Head | 1 | 피해 6. 다음 턴 드로우 +1. |
| 218 | 가벼운 자루 | Handle | 0 | 피해량 75%. 비용 0. |
| 219 | 쇠약의 문양 | Deco | 0 | 적에게 약화 1 부여. |

**Rare (6장)**

| ID | 이름 | 타입 | 코스트 | 효과 |
|----|------|------|--------|------|
| 313 | 마력 칼날 | Head | 1 | 피해 4. 에너지 1 회복. |
| 314 | 광기의 칼날 | Head | 1 | 피해 12. 자해 4. |
| 317 | 관통 자루 | Handle | 1 | 적 방어도 무시. |
| 318 | 피의 자루 | Handle | 0 | 비용 0. 자해 4. |
| 319 | 피의 숫돌 | Deco | 0 | 피해량 +2. 출혈 2 부여. |
| 320 | 광전사의 룬 | Deco | 0 | 이번 턴 자해량만큼 추가 피해. |

**Legend (4장)**

| ID | 이름 | 타입 | 코스트 | 효과 |
|----|------|------|--------|------|
| 408 | 서리 칼날 | Head | 2 | 피해 8. 적 기절. |
| 409 | 처형자의 칼날 | Head | 2 | 피해 5. HP 20% 이하 적 즉사. |
| 412 | 회피의 자루 | Handle | 2 | 적의 다음 공격 회피. |
| 413 | 용의 문장 | Deco | 1 | 피해량 2배. |

##### 3. 기존 카드 밸런스 조정

| ID | 카드명 | 변경 내용 |
|----|--------|----------|
| 404 | 운석 파편 | 피해 40->30, 자해 5->6 (자해 빌드 시너지 고려) |

##### 4. PlayerStats 확장

```typescript
interface PlayerStats {
  // ... 기존 필드
  dodgeNextAttack: boolean;    // 회피 상태
  selfDamageThisTurn: number;  // 이번 턴 자해량
}
```

##### 5. 자해 빌드 시너지

- 314 광기의 칼날 (자해 4) + 318 피의 자루 (자해 4) + 320 광전사의 룬
- 최대 시너지: 자해 8 = 추가 피해 8
- 404 운석 파편과 조합 시 자해 6 추가

#### 구현 파일
- `types.ts`: PlayerStats에 dodgeNextAttack, selfDamageThisTurn 필드 추가
- `constants.ts`: 신규 카드 13장, 404 밸런스 조정
- `App.tsx`: 새로운 메커니즘 로직 (방어무시, 회피, 처형, 자해 트래킹)
- `components/PixelSprites.tsx`: 신규 카드 스프라이트 13장

---

### 2026-01-01: 화상/과열 시스템 및 밸런스 패치

#### 개요
새로운 상태이상(화상, 과열) 추가 및 14장의 신규 카드 구현, 몬스터 밸런싱

#### 핵심 변경사항

##### 1. 새로운 상태이상

| 상태이상 | 효과 | 감소 |
|---------|------|------|
| 화상(burn) | 매 턴 종료 시 스택 수만큼 피해 | 감소 안 함 (영구) |
| 과열(overheat) | 다음 턴 에너지 -N | 턴 시작 시 소모 |

##### 2. 기존 카드 수정

| ID | 카드명 | 변경 내용 |
|----|--------|----------|
| 201 | 날렵한 단검 자루 | 피해 -2 -> 약화 1 부여 |
| 205 | 독 묻은 헝겊 | 독 3->4, 독 캡 제거 |
| 303 | 화염 방사기 | effectId 추가, 화상 부여 구현 |
| 106 | 가벼운 깃털 (스타터) | effectId 추가 |

##### 3. 신규 카드 14장

**손잡이 (Handle)**
- 501: 연소 손잡이 (비용1, x1, 사용 시 과열+1)
- 502: 열 전도 손잡이 (비용1, x2, 적 화상 스택만큼 추가 피해)

**머리 (Head)**
- 503: 화염 도끼 (비용1, 4dmg, 화상2)
- 504: 용암 망치 (비용2, 8dmg, 화상3, 자해2)
- 505: 열폭탄 (비용2, 적 화상x2 피해, 화상 소모)
- 506: 과열 철퇴 (비용1, 6dmg, 과열+1)
- 507: 열기 방패 (비용1, 6blk, 화상1)
- 508: 자폭 장치 (비용3, 15dmg, 자해5, 과열+2)

**장식 (Deco)**
- 509: 화염석 (비용0, +2, 화상1)
- 510: 용의 숨결 (비용1, +4, 화상2)
- 511: 마그마핵 (비용2, +6, 화상3, 자해1)
- 512: 불꽃 심장 (비용1, +3, 적 화상 수치의 50% 추가 피해)
- 513: 열 축전기 (비용0, +1, 과열 스택당 +3 피해)
- 514: 폭풍의 핵 (비용2, +5, 모든 상태이상 +1)

##### 4. 몬스터 밸런싱

- 전체 HP 및 공격력 조정
- 의도(Intent) 값 세부 조정

##### 5. UI 개선

- 상태이상 툴팁 시스템 추가
- 화상/과열 아이콘 및 설명 표시

#### 구현 파일
- `types.ts`: burn, overheat 필드 추가
- `constants.ts`: 신규 카드 14장, 기존 카드 수정
- `App.tsx`: 화상/과열 로직, 신규 효과 처리

---

### 2026-01-01: 모바일 UX 개선

#### 개요
모바일 플레이 경험 향상을 위한 레이아웃 및 애니메이션 개선

#### 변경사항

##### 1. 적 영역 레이아웃 개선
- 기존: 세로 배치 (의도 → 스프라이트 → HP → 이름 → 상태이상)
- 개선: 가로 배치 (좌: 의도 | 중앙: 스프라이트+HP+이름 | 우: 상태이상)
- 높이 35% → 28%로 축소, 가로 공간 활용

##### 2. 적 의도 상세보기 (모바일)
- 탭 또는 롱프레스(400ms)로 의도 상세 모달 표시
- Portal을 사용하여 전체 화면 모달 렌더링
- 의도 타입, 수치, 상세 설명 표시

##### 3. 토스트 메시지 큐 시스템
- 기존: 새 메시지가 이전 메시지를 즉시 덮어씀
- 개선: 큐 기반 순차 표시 (1.2초 간격)
- 배경색 개선: 노란색/주황색 그라데이션으로 가시성 향상

##### 4. 차등화된 애니메이션

| 상황 | 애니메이션 |
|------|-----------|
| 플레이어 피격 | HP바 깜빡임 + 화면 테두리 빨간 플래시 |
| 적 공격 시 | 적 스프라이트 앞으로 돌진 |
| 방어 성공/획득 | 방어바 파란색 펄스 |
| 체력 회복 | HP바 녹색 글로우 |
| 적 독 피해 | 적 스프라이트 녹색 펄스 |
| 적 화상 피해 | 적 스프라이트 주황색 플리커 |
| 적 출혈 피해 | 적 스프라이트 빨간색 드립 |

##### 5. 토스트 메시지 색상 (플레이어 관점)

| 유형 | 색상 | 위치 | 예시 |
|-----|-----|-----|-----|
| 좋은 일 (good) | 파란색 | 상단 30% | 피해, 방어, 회복, 드로우, 골드 획득, 상태이상 부여 |
| 나쁜 일 (bad) | 빨간색 | 하단 | 피격, 반동, 과열, 무장해제, 적 강화/회복 |

#### 구현 파일
- `App.tsx`: 레이아웃 변경, 의도 모달, 토스트 큐 (good/bad), 애니메이션 상태
- `index.html`: 신규 CSS 애니메이션 (toast-pop, player-hit, hp-flash, enemy-attack, poison-pulse, burn-flicker, bleed-pulse, heal-glow, block-gain)

---

### 2026-01-01: 픽셀 아트 스프라이트 시스템

#### 개요
몬스터와 카드에 개성있는 도트 이미지를 추가하여 시각적 차별화 구현

#### 구현 파일
- `components/PixelSprites.tsx` - 모든 스프라이트 정의

#### 몬스터 스프라이트 (14종)

| 층 | 몬스터 | ID | 특징 |
|---|--------|-----|------|
| 1층 | 녹슨 슬라임 | `rust_slime` | 녹색 슬라임 + 녹 반점 |
| 1층 | 코볼트 수집가 | `kobold_scrapper` | 갈색 몸체 + 배낭 |
| 1층 | 해골 전사 | `skeleton_warrior` | 흰색 해골 + 녹슨 검 |
| 1층 | 바위 분쇄기 (정예) | `rock_crusher` | 회색 바위 + 금관 |
| 1층 | 고철의 왕 (보스) | `junk_king` | 금속 몸체 + 자석 오라 |
| 2층 | 화염의 위습 | `ember_wisp` | 주황/노랑 불꽃 |
| 2층 | 망치 머리 고블린 | `hammerhead` | 망치 모양 헬멧 |
| 2층 | 도굴꾼 고블린 | `loot_goblin` | 녹색 + 돈주머니 |
| 2층 | 흉내쟁이 모루 (정예) | `mimic_anvil` | 모루 + 숨겨진 이빨 |
| 2층 | 타락한 대장장이 (보스) | `corrupted_smith` | 보라색 부패 + 망치 |
| 3층 | 자동화 방패병 | `automaton_defender` | 기계 + 방패 + 기어 |
| 3층 | 그림자 암살자 (정예) | `shadow_assassin` | 어두운 후드 + 단검 |
| 3층 | 키메라 엔진 (정예) | `chimera_engine` | 3개 머리 + 개틀링 |
| 3층 | 데우스 엑스 마키나 (보스) | `deus_ex_machina` | 황금 프레임 + 눈 |

#### 카드 스프라이트 (22종)

| 등급 | 카드명 | ID | 타입 |
|------|--------|-----|------|
| 스타터 | 낡은 나무 손잡이 | 101 | Handle |
| 스타터 | 패링 가드 | 102 | Handle |
| 스타터 | 녹슨 철 칼날 | 103 | Head |
| 스타터 | 냄비 뚜껑 | 104 | Head |
| 스타터 | 거친 숫돌 | 105 | Deco |
| 커먼 | 날렵한 단검 자루 | 201 | Handle |
| 커먼 | 강철 롱소드 | 202 | Head |
| 커먼 | 톱날 | 203 | Head |
| 커먼 | 가벼운 깃털 | 204 | Deco |
| 커먼 | 독 묻은 헝겊 | 205 | Deco |
| 커먼 | 뼈 손잡이 | 206 | Handle |
| 커먼 | 스파이크 쉴드 | 207 | Head |
| 커먼 | 충전된 보석 | 208 | Deco |
| 레어 | 쌍둥이 손잡이 | 301 | Handle |
| 레어 | 흡혈 덩굴 | 302 | Handle |
| 레어 | 화염 방사기 | 303 | Head |
| 레어 | 육중한 전쟁망치 | 304 | Head |
| 레어 | 복제의 거울 | 305 | Deco |
| 레어 | 쌍둥이 송곳니 | 306 | Head |
| 레어 | 마이더스의 손 | 307 | Handle |
| 레전드 | 거인의 악력 | 401 | Handle |
| 레전드 | 공허의 수정 | 402 | Head |
| 레전드 | 현자의 돌 | 403 | Deco |
| 레전드 | 운석 파편 | 404 | Head |
| 스페셜 | 그림자 무기 | 801 | Head |
| 정크 | 녹슨 덩어리 | 901 | Junk |

#### 사용법

```tsx
// 몬스터 스프라이트
import { getMonsterSprite } from './components/PixelSprites';
const MonsterSprite = getMonsterSprite(enemy.id);
<MonsterSprite className="w-24 h-24" />

// 카드 스프라이트
import { getCardSprite } from './components/PixelSprites';
const CardSprite = getCardSprite(card.id, card.type);
<CardSprite className="w-12 h-12" />
```

---

### 2026-01-01: 모바일 카드 상세보기 기능

#### 개요
모바일에서 카드가 너무 작아 효과 확인이 어려운 문제 해결

#### 구현 방식
- **롱프레스 (0.5초)**: 카드 상세 모달 표시
- **React Portal**: `document.body`에 모달 렌더링 (overflow 문제 해결)
- **닫기 방법**: X 버튼 또는 배경 탭

#### 핵심 코드

```tsx
// 롱프레스 감지
const handleTouchStart = (e: React.TouchEvent) => {
  if (disabled || showDetail) return;
  longPressTimer.current = setTimeout(() => {
    setShowDetail(true);
  }, 500);
};

// Portal로 모달 렌더링
{showDetail && createPortal(
  <div className="fixed inset-0 z-[9999] ...">
    {/* 모달 내용 */}
  </div>,
  document.body
)}
```

#### 주의사항
- `showDetail`이 true일 때 롱프레스 차단 (무한 재오픈 방지)
- 배경 터치 시 `preventDefault()` + `stopPropagation()` 필수

---

## 에러 해결 기록

### 2026-01-01: Import 누락으로 인한 빈 화면 오류

**증상**: 대장간 입장 시 아무것도 표시되지 않음

**원인**:
- `App.tsx`에서 `getMonsterSprite` import 추가 시 기존 `Skull` import를 실수로 제거
- `Skull` 아이콘은 여전히 코드 내에서 사용 중 (공격 의도 표시, 게임오버 화면)
- TypeScript 컴파일 에러로 인해 앱이 렌더링되지 않음

**해결방법**:
```tsx
// Before (잘못된 코드)
import { Heart, Shield, Zap, RefreshCw, Trophy, ... } from 'lucide-react';

// After (수정된 코드)
import { Heart, Shield, Zap, RefreshCw, Skull, Trophy, ... } from 'lucide-react';
```

**교훈**:
- import 수정 시 기존 사용 중인 항목을 제거하지 않도록 주의
- 빌드 전에 `npx tsc --noEmit`으로 타입 체크 수행 권장
- lucide-react 아이콘 추가/제거 시 실제 사용처 확인 필요

---

### 2026-01-01: 모달이 카드 내부에서만 표시되는 문제

**증상**: 롱프레스 상세보기가 카드 테두리 안에서만 커짐

**원인**:
- 모달이 카드 컴포넌트 내부에 렌더링됨
- 카드의 `overflow: hidden` 속성으로 인해 모달이 잘림

**해결방법**:
```tsx
import { createPortal } from 'react-dom';

// Portal을 사용하여 document.body에 렌더링
{showDetail && createPortal(
  <div className="fixed inset-0 z-[9999] ...">
    {/* 모달 내용 */}
  </div>,
  document.body
)}
```

---

### 2026-01-01: 배경 탭 시 모달이 무한 재오픈되는 문제

**증상**: 모달 배경을 탭하면 닫혔다가 바로 다시 열림

**원인**:
- 배경 탭 → `setShowDetail(false)` 호출
- 동시에 카드 컴포넌트의 터치 이벤트도 발생
- 롱프레스 타이머가 다시 시작되어 모달 재오픈

**해결방법**:
```tsx
// 1. 모달이 열려있을 때 롱프레스 차단
const handleTouchStart = (e: React.TouchEvent) => {
  if (disabled || showDetail) return; // showDetail 체크 추가
  // ...
};

// 2. 배경 터치 시 이벤트 전파 차단
onTouchStart={(e) => {
  e.preventDefault();
  e.stopPropagation();
  setShowDetail(false);
}}
```

---

### 2026-01-02: 토스트 알림이 첫 번째만 표시되는 문제

**증상**: 게임 시작 후 첫 토스트만 표시되고, 이후 액션의 토스트가 전혀 표시되지 않음

**원인**:
- `useToast` 훅에서 useEffect의 cleanup 함수가 의존성 변경 시마다 실행됨
- 새 토스트가 큐에 추가될 때 `goodToastQueue`가 변경되어 useEffect 재실행
- cleanup에서 `clearTimeout(timer)`가 실행되어 기존 타이머 취소
- `currentGoodToast`가 null로 돌아가지 않아 다음 토스트 처리 불가

**문제 코드**:
```typescript
useEffect(() => {
  if (goodToastQueue.length > 0 && currentGoodToast === null) {
    // ...
    const timer = setTimeout(() => setCurrentGoodToast(null), 1200);
    return () => clearTimeout(timer); // 의존성 변경 시마다 타이머 취소됨!
  }
}, [goodToastQueue, currentGoodToast]);
```

**해결방법**:
```typescript
// useRef로 타이머 관리
const goodTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

useEffect(() => {
  if (goodToastQueue.length > 0 && currentGoodToast === null) {
    // ...
    if (goodTimerRef.current) clearTimeout(goodTimerRef.current);
    goodTimerRef.current = setTimeout(() => {
      setCurrentGoodToast(null);
      goodTimerRef.current = null;
    }, 1200);
  }
}, [goodToastQueue, currentGoodToast]);

// cleanup은 unmount 시에만
useEffect(() => {
  return () => {
    if (goodTimerRef.current) clearTimeout(goodTimerRef.current);
  };
}, []);
```

**교훈**:
- useEffect의 cleanup은 의존성 변경 시마다 실행됨을 인지해야 함
- setTimeout/setInterval은 useRef로 관리하는 것이 더 안전함
- 복잡한 타이머 로직은 cleanup과 의존성 배열의 상호작용을 주의깊게 고려

