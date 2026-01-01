# FiC 프로젝트 개발 기록

## 목차
- [기능 구현](#기능-구현)
- [에러 해결 기록](#에러-해결-기록)

---

## 기능 구현

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
