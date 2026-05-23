export type RunLearningFocus =
  | 'VICTORY'
  | 'OPENING_CRAFT'
  | 'DECK_POLLUTION'
  | 'ENERGY_PRESSURE'
  | 'DECK_BLOAT'
  | 'CARD_QUALITY'
  | 'FINISHING_DAMAGE'
  | 'MIDGAME_COUNTERS'
  | 'SURVIVAL';

export interface RunLearningSnapshot {
  isWin: boolean;
  act: number;
  floor: number;
  gold: number;
  playerHp: number;
  playerMaxHp: number;
  maxEnergy: number;
  deckSize: number;
  junkCount: number;
  starterCount: number;
  rareOrLegendCount: number;
  enemyName: string;
  enemyHp: number;
  enemyMaxHp: number;
}

export interface RunLearningFeedback {
  focus: RunLearningFocus;
  title: string;
  primaryTip: string;
  details: string[];
}

export const createRunLearningFeedback = (snapshot: RunLearningSnapshot): RunLearningFeedback => {
  const enemyHpRatio = snapshot.enemyMaxHp > 0 ? snapshot.enemyHp / snapshot.enemyMaxHp : 0;

  if (snapshot.isWin) {
    return {
      focus: 'VICTORY',
      title: '승리 후 다음 목표',
      primaryTip: '다음 런에서는 더 위험한 경로와 정예 전투를 골라 빌드 한계를 시험해 보세요.',
      details: [
        `최종 골드 ${snapshot.gold}G`,
        `덱 ${snapshot.deckSize}장 / 희귀 이상 ${snapshot.rareOrLegendCount}장`
      ]
    };
  }

  if (snapshot.floor <= 2) {
    return {
      focus: 'OPENING_CRAFT',
      title: '초반 제작 순서',
      primaryTip: '첫 전투는 손잡이와 머리를 먼저 맞춘 뒤 제작 예측값을 보고 공격하거나 방어하는 흐름을 익히는 구간입니다.',
      details: [
        '손잡이 + 머리만으로도 제작할 수 있습니다.',
        '장식은 세 번째 슬롯 보너스라 에너지가 남을 때 얹는 편이 안정적입니다.'
      ]
    };
  }

  if (snapshot.junkCount >= 3) {
    return {
      focus: 'DECK_POLLUTION',
      title: '덱 오염 관리',
      primaryTip: '녹슨 덩어리가 많이 쌓이면 손잡이와 머리가 같이 잡히지 않아 제작 턴이 무너집니다.',
      details: [
        `현재 오염 카드 ${snapshot.junkCount}장`,
        '휴식의 제련, 상점 정화, 드로우 카드로 막힌 손패를 풀어야 합니다.'
      ]
    };
  }

  if (snapshot.maxEnergy <= 4 && (snapshot.act >= 2 || snapshot.floor >= 8)) {
    return {
      focus: 'ENERGY_PRESSURE',
      title: '에너지 병목',
      primaryTip: '중반 이후에는 4 에너지로 방어와 공격을 모두 처리하기 어렵습니다.',
      details: [
        `현재 최대 에너지 ${snapshot.maxEnergy}`,
        '보스 보상이나 상점 수정으로 최대 에너지를 늘리거나, 0 비용 손잡이와 에너지 회복 장식을 챙기세요.'
      ]
    };
  }

  if (snapshot.deckSize >= 25 && snapshot.rareOrLegendCount < 6) {
    return {
      focus: 'DECK_BLOAT',
      title: '덱 압축 부족',
      primaryTip: '카드가 많아질수록 핵심 손잡이와 머리를 같은 턴에 잡을 확률이 낮아집니다.',
      details: [
        `현재 덱 ${snapshot.deckSize}장 / 희귀 이상 ${snapshot.rareOrLegendCount}장`,
        '보상은 빌드 축에 맞는 카드만 고르고, 약한 시작 카드는 정화하세요.'
      ]
    };
  }

  if (snapshot.starterCount >= 5 && snapshot.floor >= 6) {
    return {
      focus: 'CARD_QUALITY',
      title: '시작 카드 의존',
      primaryTip: '시작 카드가 많이 남아 있으면 적의 방어, 카운터, 방해 패턴을 뚫을 힘이 부족합니다.',
      details: [
        `남은 시작 카드 ${snapshot.starterCount}장`,
        '초반 보상에서 빌드 진입 카드를 잡고 휴식/상점에서 낮은 가치 카드를 덜어내세요.'
      ]
    };
  }

  if (snapshot.enemyHp > 0 && enemyHpRatio <= 0.25) {
    return {
      focus: 'FINISHING_DAMAGE',
      title: '마무리 피해 부족',
      primaryTip: '적을 거의 쓰러뜨렸다면 다음 런에서는 마지막 한 턴을 줄이는 폭발 피해나 다단히트 보강이 중요합니다.',
      details: [
        `${snapshot.enemyName} 남은 HP ${snapshot.enemyHp}/${snapshot.enemyMaxHp}`,
        '취약, 고비용 머리, 장식 피해 보너스, 연속 제작 보상을 마무리 카드로 연결하세요.'
      ]
    };
  }

  if (snapshot.act >= 2) {
    return {
      focus: 'MIDGAME_COUNTERS',
      title: '중반 카운터 대응',
      primaryTip: '중반 이후 적은 비용 제한, 덱 오염, 방어 카운터처럼 특정 빌드를 노리는 패턴을 씁니다.',
      details: [
        '드로우와 에너지 순환을 한두 장 섞어 막힌 턴을 줄이세요.',
        '상태이상이나 방어 전환처럼 긴 전투에서 버티는 축도 함께 챙기면 안정적입니다.'
      ]
    };
  }

  return {
    focus: 'SURVIVAL',
    title: '생존 턴 설계',
    primaryTip: '패배 직전의 적 의도를 확인하고, 공격 턴에는 피해보다 방어 제작을 우선하는 판단이 런을 살립니다.',
    details: [
      `도달 지점 Act ${snapshot.act} - ${snapshot.floor}F`,
      '방어형 손잡이/머리와 상태이상 카드를 섞어 한 턴 더 버틸 여지를 만드세요.'
    ]
  };
};
