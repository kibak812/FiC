import React from 'react';
import { createPortal } from 'react-dom';
import { Anvil, ArrowRight, Check, Eye, Hammer, X } from 'lucide-react';

interface TutorialOverlayProps {
  step: number;
  totalSteps: number;
  onNext: () => void;
  onSkip: () => void;
}

const TUTORIAL_STEPS = [
  {
    title: '손잡이 선택',
    icon: Hammer,
    body: '손잡이는 무기의 배율과 특수 효과를 정합니다. 손패에서 손잡이 카드를 누르거나 손 슬롯으로 끌어오세요.',
    cue: '손잡이 슬롯은 필수입니다.'
  },
  {
    title: '머리 선택',
    icon: Anvil,
    body: '머리는 피해, 방어도, 공격 횟수의 중심입니다. 손잡이와 머리가 모두 올라가면 제작 조건이 채워집니다.',
    cue: '손잡이 + 머리 = 제작 가능'
  },
  {
    title: '제작 버튼',
    icon: Anvil,
    body: '모루 아래 예측값으로 피해 또는 방어도와 에너지 비용을 확인하세요. 조건이 안 맞으면 버튼에 이유가 표시됩니다.',
    cue: '피해/방어/비용 확인 후 제작'
  },
  {
    title: '적 의도 확인',
    icon: Eye,
    body: '적 왼쪽 의도 아이콘을 누르면 다음 행동을 자세히 볼 수 있습니다. 큰 공격이면 다음 턴에는 방어 조합을 우선하세요.',
    cue: '의도 아이콘을 눌러 마무리'
  }
];

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ step, totalSteps, onNext, onSkip }) => {
  const currentStep = TUTORIAL_STEPS[Math.min(step, TUTORIAL_STEPS.length - 1)];
  const Icon = currentStep.icon;
  const isLastStep = step >= totalSteps - 1;

  return createPortal(
    <div className="fixed inset-x-0 top-12 z-[9998] flex justify-center px-3 pointer-events-none" data-testid="first-combat-tutorial">
      <div
        className="w-full max-w-md pixel-border border-4 border-orange-500 bg-gradient-to-b from-stone-800/95 to-stone-900/95 p-3 md:p-4 pointer-events-none"
        style={{ boxShadow: '0 5px 0 0 #7c2d12' }}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 pixel-border border-2 border-orange-400 bg-orange-950/70 flex items-center justify-center text-orange-300 flex-shrink-0">
              <Icon size={20} />
            </div>
            <div>
              <p className="font-pixel text-[10px] text-orange-300 mb-1">
                {step + 1}/{totalSteps}
              </p>
              <h3 className="font-pixel-kr text-base md:text-lg text-white font-bold">
                {currentStep.title}
              </h3>
            </div>
          </div>
          <button
            onClick={onSkip}
            className="w-9 h-9 pixel-border border-2 border-stone-500 bg-black/50 text-stone-300 flex items-center justify-center pointer-events-auto"
            aria-label="튜토리얼 닫기"
          >
            <X size={18} />
          </button>
        </div>

        <p className="font-pixel-kr text-xs md:text-sm leading-relaxed text-stone-200 mb-3">
          {currentStep.body}
        </p>

        <div className="pixel-border border-2 border-yellow-600 bg-yellow-950/40 px-3 py-2 font-pixel-kr text-xs text-yellow-200 mb-3">
          {currentStep.cue}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onSkip}
            className="flex-1 px-4 py-2.5 pixel-border border-4 border-stone-600 bg-gradient-to-b from-stone-700 to-stone-800 font-pixel-kr text-sm text-stone-200 active:translate-y-1 pointer-events-auto"
            style={{ boxShadow: '0 3px 0 0 #1c1917' }}
          >
            건너뛰기
          </button>
          <button
            onClick={onNext}
            className="flex-1 px-4 py-2.5 pixel-border border-4 border-orange-400 bg-gradient-to-b from-orange-500 to-orange-700 font-pixel-kr text-sm font-bold text-white flex items-center justify-center gap-2 active:translate-y-1 pointer-events-auto"
            style={{ boxShadow: '0 3px 0 0 #9a3412' }}
          >
            {isLastStep ? <Check size={16} /> : <ArrowRight size={16} />}
            {isLastStep ? '완료' : '다음'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export const TUTORIAL_STEP_COUNT = TUTORIAL_STEPS.length;

export default TutorialOverlay;
