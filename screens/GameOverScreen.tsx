import React from 'react';
import { Trophy, Skull } from 'lucide-react';

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
  return (
    <div className="w-full h-screen-safe flex flex-col items-center justify-center bg-pixel-bg-dark text-stone-100 z-50 absolute inset-0">
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
