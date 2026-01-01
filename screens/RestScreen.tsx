import React from 'react';
import { Coins, Hammer, Flame, Ban, Store, Heart, ChevronRight } from 'lucide-react';

export type RestAction = 'REPAIR' | 'SMELT' | 'SHOP';

interface RestScreenProps {
  gold: number;
  maxHp: number;
  hasRested: boolean;
  onRestAction: (action: RestAction) => void;
  onAdvance: () => void;
}

const RestScreen: React.FC<RestScreenProps> = ({ gold, maxHp, hasRested, onRestAction, onAdvance }) => {
  const healAmount = Math.floor(maxHp * 0.3);

  return (
    <div className="w-full h-screen-safe flex flex-col items-center justify-center bg-pixel-bg-dark text-stone-100 p-4 relative overflow-y-auto">
      {/* Header info - Pixel Style */}
      <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 px-3 py-1.5 pixel-border border-2 border-yellow-600 z-10">
        <Coins className="text-yellow-400" size={16} />
        <span className="font-pixel text-sm text-yellow-300">{gold}</span>
      </div>

      <div className="flex-shrink-0 mb-8 text-center mt-16 md:mt-0">
        <h2 className="text-xl md:text-2xl font-pixel mb-3 text-orange-400" style={{ textShadow: '0 0 10px rgba(251,146,60,0.5)' }}>
          REST STOP
        </h2>
        <p className="text-stone-400 font-pixel-kr text-sm">다음 전투를 준비하세요.</p>
        {hasRested && <p className="text-red-400 font-pixel-kr text-xs mt-2">* 정비를 완료했습니다.</p>}
      </div>

      <div className="flex flex-wrap gap-4 w-full max-w-3xl justify-center items-center px-4 mb-8">
        {/* Repair Option - Pixel Style */}
        <button
          onClick={() => onRestAction('REPAIR')}
          disabled={hasRested}
          className={`
            group relative w-32 h-44 md:w-40 md:h-56
            pixel-border border-4
            flex flex-col items-center justify-center
            transition-all
            ${hasRested
              ? 'bg-stone-800 border-stone-700 opacity-50 grayscale cursor-not-allowed'
              : 'bg-gradient-to-b from-stone-700 to-stone-800 border-stone-500 hover:border-green-500 hover:from-stone-600 hover:to-stone-700 active:translate-y-1'}
          `}
          style={{
            boxShadow: hasRested ? 'none' : '0 4px 0 0 #1c1917'
          }}
        >
          <div className={`p-3 pixel-border border-2 mb-3 ${hasRested ? 'bg-stone-700 border-stone-600' : 'bg-green-900/50 border-green-700 group-hover:bg-green-800/50'}`}>
            <Hammer size={28} className={`transition-colors ${hasRested ? 'text-stone-600' : 'text-green-400 group-hover:text-green-300'}`} />
          </div>
          <h3 className="font-pixel-kr text-base font-bold mb-1">수리</h3>
          <p className="text-stone-400 font-pixel-kr text-[9px] px-2 text-center">체력 30% 회복</p>
          <div className={`mt-2 font-pixel text-xs flex items-center gap-1 ${hasRested ? 'text-stone-600' : 'text-green-400'}`}>
            <Heart size={12} fill="currentColor" /> +{healAmount}
          </div>
        </button>

        {/* Smelt Option - Pixel Style */}
        <button
          onClick={() => onRestAction('SMELT')}
          disabled={hasRested}
          className={`
            group relative w-32 h-44 md:w-40 md:h-56
            pixel-border border-4
            flex flex-col items-center justify-center
            transition-all
            ${hasRested
              ? 'bg-stone-800 border-stone-700 opacity-50 grayscale cursor-not-allowed'
              : 'bg-gradient-to-b from-stone-700 to-stone-800 border-stone-500 hover:border-red-500 hover:from-stone-600 hover:to-stone-700 active:translate-y-1'}
          `}
          style={{
            boxShadow: hasRested ? 'none' : '0 4px 0 0 #1c1917'
          }}
        >
          <div className={`p-3 pixel-border border-2 mb-3 ${hasRested ? 'bg-stone-700 border-stone-600' : 'bg-red-900/50 border-red-700 group-hover:bg-red-800/50'}`}>
            <Flame size={28} className={`transition-colors ${hasRested ? 'text-stone-600' : 'text-red-400 group-hover:text-red-300'}`} />
          </div>
          <h3 className="font-pixel-kr text-base font-bold mb-1">제련</h3>
          <p className="text-stone-400 font-pixel-kr text-[9px] px-2 text-center">카드 1장 제거</p>
          <div className={`mt-2 font-pixel text-xs flex items-center gap-1 ${hasRested ? 'text-stone-600' : 'text-red-400'}`}>
            <Ban size={12} /> REMOVE
          </div>
        </button>

        {/* Shop Option - Pixel Style */}
        <button
          onClick={() => onRestAction('SHOP')}
          className="group relative w-32 h-44 md:w-40 md:h-56
            pixel-border border-4
            bg-gradient-to-b from-stone-700 to-stone-800 border-stone-500
            flex flex-col items-center justify-center
            hover:border-yellow-500 hover:from-stone-600 hover:to-stone-700
            transition-all active:translate-y-1"
          style={{
            boxShadow: '0 4px 0 0 #1c1917'
          }}
        >
          <div className="p-3 pixel-border border-2 mb-3 bg-yellow-900/50 border-yellow-700 group-hover:bg-yellow-800/50">
            <Store size={28} className="text-yellow-400 group-hover:text-yellow-300 transition-colors" />
          </div>
          <h3 className="font-pixel-kr text-base font-bold mb-1">상점</h3>
          <p className="text-stone-400 font-pixel-kr text-[9px] px-2 text-center">아이템 구매</p>
          <div className="mt-2 text-yellow-400 font-pixel text-xs flex items-center gap-1">
            <Coins size={12} /> ENTER
          </div>
        </button>
      </div>

      <div className="flex-shrink-0 pb-8">
        <button
          onClick={onAdvance}
          className="flex items-center gap-2 px-6 py-2.5
            bg-gradient-to-b from-stone-600 to-stone-700
            pixel-border border-4 border-stone-500
            text-stone-200 font-pixel-kr text-sm font-bold
            hover:from-stone-500 hover:to-stone-600
            transition-all active:translate-y-1"
          style={{
            boxShadow: '0 4px 0 0 #1c1917'
          }}
        >
          다음 층으로 이동 <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default RestScreen;
