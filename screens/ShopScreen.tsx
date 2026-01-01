import React from 'react';
import { Store, Coins, Flame, Heart, Sparkles, Zap, ArrowLeft } from 'lucide-react';

export type ShopItem = 'HEAL' | 'REMOVE' | 'RARE' | 'ENERGY';

interface ShopScreenProps {
  gold: number;
  onBuyItem: (item: ShopItem) => void;
  onExit: () => void;
}

const ShopScreen: React.FC<ShopScreenProps> = ({ gold, onBuyItem, onExit }) => {
  return (
    <div className="w-full h-screen-safe flex flex-col bg-pixel-bg-dark text-stone-100">
      <div className="p-4 md:p-6 bg-pixel-bg-mid pixel-border border-b-4 border-stone-700 flex justify-between items-center">
        <h2 className="text-lg md:text-xl font-pixel flex items-center gap-2 text-yellow-400" style={{ textShadow: '0 0 10px rgba(250,204,21,0.5)' }}>
          <Store size={20} /> BLACK MARKET
        </h2>
        <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 pixel-border border-2 border-yellow-600">
          <Coins className="text-yellow-400" size={14} />
          <span className="font-pixel text-sm text-yellow-300">{gold}</span>
        </div>
      </div>

      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {/* Card Removal */}
          <button
            onClick={() => onBuyItem('REMOVE')}
            className="aspect-square bg-gradient-to-b from-stone-700 to-stone-800
              pixel-border border-4 border-stone-600
              flex flex-col items-center justify-center p-2
              hover:border-red-500 hover:from-stone-600 hover:to-stone-700
              transition-all group active:translate-y-1"
            style={{ boxShadow: '0 4px 0 0 #1c1917' }}
          >
            <div className="p-2 pixel-border border-2 bg-red-900/40 border-red-700 mb-2 group-hover:bg-red-800/50">
              <Flame size={28} className="text-red-400 group-hover:text-red-300 transition-colors" />
            </div>
            <div className="font-pixel-kr text-xs font-bold">카드 정화</div>
            <div className="text-[8px] text-stone-400 font-pixel-kr text-center mb-1">카드 1장 제거</div>
            <div className={`font-pixel text-xs ${gold >= 50 ? 'text-yellow-400' : 'text-red-500'}`}>50 G</div>
          </button>

          {/* Heal */}
          <button
            onClick={() => onBuyItem('HEAL')}
            className="aspect-square bg-gradient-to-b from-stone-700 to-stone-800
              pixel-border border-4 border-stone-600
              flex flex-col items-center justify-center p-2
              hover:border-green-500 hover:from-stone-600 hover:to-stone-700
              transition-all group active:translate-y-1"
            style={{ boxShadow: '0 4px 0 0 #1c1917' }}
          >
            <div className="p-2 pixel-border border-2 bg-green-900/40 border-green-700 mb-2 group-hover:bg-green-800/50">
              <Heart size={28} className="text-green-400 group-hover:text-green-300 transition-colors" fill="currentColor" />
            </div>
            <div className="font-pixel-kr text-xs font-bold">긴급 수리</div>
            <div className="text-[8px] text-stone-400 font-pixel-kr text-center mb-1">체력 50% 회복</div>
            <div className={`font-pixel text-xs ${gold >= 40 ? 'text-yellow-400' : 'text-red-500'}`}>40 G</div>
          </button>

          {/* Rare Card */}
          <button
            onClick={() => onBuyItem('RARE')}
            className="aspect-square bg-gradient-to-b from-stone-700 to-stone-800
              pixel-border border-4 border-stone-600
              flex flex-col items-center justify-center p-2
              hover:border-purple-500 hover:from-stone-600 hover:to-stone-700
              transition-all group active:translate-y-1"
            style={{ boxShadow: '0 4px 0 0 #1c1917' }}
          >
            <div className="p-2 pixel-border border-2 bg-purple-900/40 border-purple-700 mb-2 group-hover:bg-purple-800/50">
              <Sparkles size={28} className="text-purple-400 group-hover:text-purple-300 transition-colors" />
            </div>
            <div className="font-pixel-kr text-xs font-bold">희귀 도면</div>
            <div className="text-[8px] text-stone-400 font-pixel-kr text-center mb-1">무작위 희귀</div>
            <div className={`font-pixel text-xs ${gold >= 75 ? 'text-yellow-400' : 'text-red-500'}`}>75 G</div>
          </button>

          {/* Max Energy (Expensive) */}
          <button
            onClick={() => onBuyItem('ENERGY')}
            className="aspect-square bg-gradient-to-b from-stone-700 to-stone-800
              pixel-border border-4 border-stone-600
              flex flex-col items-center justify-center p-2
              hover:border-yellow-400 hover:from-stone-600 hover:to-stone-700
              transition-all group relative overflow-hidden active:translate-y-1"
            style={{ boxShadow: '0 4px 0 0 #1c1917' }}
          >
            <div className="absolute top-0 right-0 bg-yellow-600 font-pixel text-[7px] px-1.5 py-0.5 text-white pixel-border border-l-2 border-b-2 border-yellow-400">LIMITED</div>
            <div className="p-2 pixel-border border-2 bg-yellow-900/40 border-yellow-700 mb-2 group-hover:bg-yellow-800/50">
              <Zap size={28} className="text-yellow-400 group-hover:text-yellow-300 transition-colors" fill="currentColor" />
            </div>
            <div className="font-pixel-kr text-xs font-bold">마나 수정</div>
            <div className="text-[8px] text-stone-400 font-pixel-kr text-center mb-1">에너지 +1</div>
            <div className={`font-pixel text-xs ${gold >= 200 ? 'text-yellow-400' : 'text-red-500'}`}>200 G</div>
          </button>
        </div>
      </div>

      <div className="p-4 pixel-border border-t-4 border-stone-700 flex justify-end bg-pixel-bg-mid">
        <button
          onClick={onExit}
          className="px-5 py-2.5
            bg-gradient-to-b from-stone-600 to-stone-700
            pixel-border border-4 border-stone-500
            font-pixel-kr text-sm font-bold text-stone-200
            hover:from-stone-500 hover:to-stone-600
            transition-all active:translate-y-1
            flex items-center gap-2"
          style={{ boxShadow: '0 4px 0 0 #1c1917' }}
        >
          <ArrowLeft size={16} /> 나가기
        </button>
      </div>
    </div>
  );
};

export default ShopScreen;
