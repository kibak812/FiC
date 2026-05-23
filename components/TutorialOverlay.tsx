import React from 'react';
import { createPortal } from 'react-dom';
import { Anvil, ArrowRight, Check, Hammer, Shapes, Sparkles, X } from 'lucide-react';

interface TutorialOverlayProps {
  step: number;
  totalSteps: number;
  onNext: () => void;
  onSkip: () => void;
}

const TUTORIAL_STEPS = [
  {
    title: '무기는 두 조각부터',
    icon: Hammer,
    body: '손잡이는 배율과 특수 효과를, 머리는 기본 피해나 방어 값을 정합니다. 첫 턴에는 손잡이 1장과 머리 1장을 모루에 올리세요.',
    cue: '손잡이 + 머리 = 제작 가능'
  },
  {
    title: '장식은 선택 보너스',
    icon: Sparkles,
    body: '장식은 피해 추가, 드로우, 에너지, 상태이상처럼 빌드 방향을 바꿉니다. 없어도 제작할 수 있지만 좋은 장식은 런의 축이 됩니다.',
    cue: '장식은 세 번째 슬롯'
  },
  {
    title: '예측값을 보고 결정',
    icon: Anvil,
    body: '모루 아래 숫자는 이번 제작의 피해, 방어, 비용입니다. 에너지가 부족하거나 비용 제한에 걸리면 제작할 수 없습니다.',
    cue: '피해/방어/비용 확인'
  },
  {
    title: '적 의도를 먼저 읽기',
    icon: Shapes,
    body: '적 왼쪽의 아이콘을 누르면 다음 행동을 볼 수 있습니다. 공격이 크면 방어형 손잡이나 머리로 버티고, 상태 아이콘은 눌러 효과를 확인하세요.',
    cue: '의도와 상태는 탭으로 확인'
  }
];

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ step, totalSteps, onNext, onSkip }) => {
  const currentStep = TUTORIAL_STEPS[Math.min(step, TUTORIAL_STEPS.length - 1)];
  const Icon = currentStep.icon;
  const isLastStep = step >= totalSteps - 1;

  return createPortal(
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/80 px-4">
      <div
        className="w-full max-w-md pixel-border border-4 border-orange-500 bg-gradient-to-b from-stone-800 to-stone-900 p-5"
        style={{ boxShadow: '0 8px 0 0 #7c2d12' }}
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 pixel-border border-2 border-orange-400 bg-orange-950/70 flex items-center justify-center text-orange-300">
              <Icon size={24} />
            </div>
            <div>
              <p className="font-pixel text-[10px] text-orange-300 mb-1">
                {step + 1}/{totalSteps}
              </p>
              <h3 className="font-pixel-kr text-lg text-white font-bold">
                {currentStep.title}
              </h3>
            </div>
          </div>
          <button
            onClick={onSkip}
            className="w-9 h-9 pixel-border border-2 border-stone-500 bg-black/50 text-stone-300 flex items-center justify-center"
            aria-label="튜토리얼 닫기"
          >
            <X size={18} />
          </button>
        </div>

        <p className="font-pixel-kr text-sm leading-relaxed text-stone-200 mb-4">
          {currentStep.body}
        </p>

        <div className="pixel-border border-2 border-yellow-600 bg-yellow-950/40 px-3 py-2 font-pixel-kr text-xs text-yellow-200 mb-5">
          {currentStep.cue}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onSkip}
            className="flex-1 px-4 py-3 pixel-border border-4 border-stone-600 bg-gradient-to-b from-stone-700 to-stone-800 font-pixel-kr text-sm text-stone-200 active:translate-y-1"
            style={{ boxShadow: '0 4px 0 0 #1c1917' }}
          >
            건너뛰기
          </button>
          <button
            onClick={onNext}
            className="flex-1 px-4 py-3 pixel-border border-4 border-orange-400 bg-gradient-to-b from-orange-500 to-orange-700 font-pixel-kr text-sm font-bold text-white flex items-center justify-center gap-2 active:translate-y-1"
            style={{ boxShadow: '0 4px 0 0 #9a3412' }}
          >
            {isLastStep ? <Check size={16} /> : <ArrowRight size={16} />}
            {isLastStep ? '시작' : '다음'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export const TUTORIAL_STEP_COUNT = TUTORIAL_STEPS.length;

export default TutorialOverlay;
