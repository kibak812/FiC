import React from 'react';
import { Trophy, Skull, Lightbulb } from 'lucide-react';

interface GameOverScreenProps {
  isWin: boolean;
  act: number;
  floor: number;
  gold: number;
  onRestart: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({
  isWin,
  act,
  floor,
  gold,
  onRestart
}) => {
  const getLearningTip = () => {
    if (isWin) return '다음 목표는 더 위험한 경로와 정예 전투를 골라 빌드 한계를 시험하는 것입니다.';
    if (floor <= 2) return '손잡이와 머리를 먼저 맞춘 뒤 제작하세요. 장식은 선택이지만, 비용과 피해 예측값을 보고 올리는 편이 좋습니다.';
    if (floor <= 6) return '공격 의도가 큰 턴에는 방어형 손잡이나 방어형 머리로 피해를 막고, 상태이상 카드는 오래 버티는 적에게 먼저 쌓아두세요.';
    if (act >= 2) return '중반 이후 적은 비용 제한, 덱 오염, 방어 카운터를 씁니다. 드로우/에너지 카드와 카드 제거로 손패가 막히지 않게 관리하세요.';
    return '패배 직전의 적 의도를 확인하세요. 공격, 방어, 방해 패턴에 맞춰 한 턴을 쉬거나 방어 무기를 만드는 선택이 런을 살립니다.';
  };

  return (
    <div className="w-full h-screen-safe overflow-y-auto flex flex-col items-center justify-start md:justify-center bg-pixel-bg-dark text-stone-100 z-50 absolute inset-0 px-4 py-6">
      {/* Icon */}
      <div className={`
        p-6 pixel-border border-4 mb-6
        ${isWin ? 'border-yellow-400 bg-yellow-900/50' : 'border-red-500 bg-red-900/50'}
      `}>
        {isWin
          ? <Trophy size={64} className="text-yellow-400" />
          : <Skull size={64} className="text-red-400" />
        }
      </div>

      {/* Title */}
      <h2 className={`
        font-pixel text-2xl md:text-4xl mb-4
        ${isWin ? 'text-yellow-400' : 'text-red-400'}
      `}
      style={{ textShadow: '3px 3px 0 #000' }}>
        {isWin ? 'VICTORY!' : 'GAME OVER'}
      </h2>

      <p className="mb-2 font-pixel-kr text-xl md:text-2xl text-stone-300">
        {isWin ? '최종 승리!' : '패배'}
      </p>

      <p className="mb-8 text-stone-500 font-pixel-kr">
        {isWin
          ? '대장간의 전설이 되셨습니다.'
          : `Act ${act} - Floor ${floor} 에서 쓰러졌습니다.`}
      </p>

      {/* Stats Box */}
      <div className="pixel-border border-2 border-stone-600 bg-stone-900/80 p-4 mb-8 min-w-[200px]">
        <div className="flex justify-between gap-8 font-pixel-kr text-sm mb-2">
          <span className="text-stone-500">획득 골드:</span>
          <span className="text-yellow-400">{gold} G</span>
        </div>
        <div className="flex justify-between gap-8 font-pixel-kr text-sm">
          <span className="text-stone-500">도달 층:</span>
          <span className="text-stone-300">Act {act} - {floor}F</span>
        </div>
      </div>

      <div className="pixel-border border-2 border-yellow-700 bg-yellow-950/40 p-4 mb-8 max-w-md mx-4">
        <div className="flex items-start gap-3">
          <Lightbulb size={22} className="text-yellow-300 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-pixel-kr text-sm text-yellow-200 mb-1">다음 런 힌트</p>
            <p className="font-pixel-kr text-xs text-stone-200 leading-relaxed">
              {getLearningTip()}
            </p>
          </div>
        </div>
      </div>

      {/* Retry Button */}
      <button
        onClick={onRestart}
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
};

export default GameOverScreen;
