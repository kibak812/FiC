import React from 'react';
import { Hammer, Zap, Heart, Coins } from 'lucide-react';

export type BossRewardType = 'ENERGY' | 'DRAW' | 'BLOCK';

interface BossRewardScreenProps {
  onSelectReward: (type: BossRewardType) => void;
}

const BossRewardScreen: React.FC<BossRewardScreenProps> = ({ onSelectReward }) => {
  return (
    <div className="w-full h-screen-safe flex flex-col items-center justify-center bg-pixel-bg-dark text-stone-100 p-4">
      <h2 className="text-xl md:text-2xl font-pixel mb-3 text-yellow-400 flex items-center gap-3" style={{ textShadow: '0 0 15px rgba(250,204,21,0.5)' }}>
        <Hammer size={24} /> FORGE UPGRADE
      </h2>
      <p className="text-stone-400 font-pixel-kr text-sm mb-8 text-center">보스를 물리쳤습니다! 대장간을 업그레이드할 기회입니다.</p>

      <div className="flex flex-col md:flex-row gap-4 md:gap-6 mb-8">
        {/* Max Energy Option */}
        <button
          onClick={() => onSelectReward('ENERGY')}
          className="w-full md:w-56 p-5
            bg-gradient-to-b from-stone-700 to-stone-800
            pixel-border border-4 border-yellow-700
            flex flex-col items-center gap-3
            hover:border-yellow-500 hover:from-stone-600 hover:to-stone-700
            transition-all active:translate-y-1"
          style={{ boxShadow: '0 4px 0 0 #1c1917' }}
        >
          <div className="p-3 pixel-border border-2 bg-yellow-900/50 border-yellow-600 text-yellow-400">
            <Zap size={32} fill="currentColor" />
          </div>
          <div className="text-center">
            <h3 className="font-pixel-kr text-base font-bold text-yellow-400">확장 풀무</h3>
            <p className="text-xs text-stone-400 font-pixel-kr mt-2">에너지 <span className="text-white font-pixel">+1</span></p>
          </div>
        </button>

        {/* Max HP Option */}
        <button
          onClick={() => onSelectReward('DRAW')}
          className="w-full md:w-56 p-5
            bg-gradient-to-b from-stone-700 to-stone-800
            pixel-border border-4 border-blue-700
            flex flex-col items-center gap-3
            hover:border-blue-500 hover:from-stone-600 hover:to-stone-700
            transition-all active:translate-y-1"
          style={{ boxShadow: '0 4px 0 0 #1c1917' }}
        >
          <div className="p-3 pixel-border border-2 bg-blue-900/50 border-blue-600 text-blue-400">
            <Heart size={32} fill="currentColor" />
          </div>
          <div className="text-center">
            <h3 className="font-pixel-kr text-base font-bold text-blue-400">생명석 강화</h3>
            <p className="text-xs text-stone-400 font-pixel-kr mt-2">최대 HP <span className="text-white font-pixel">+30</span></p>
          </div>
        </button>

        {/* Gold Option */}
        <button
          onClick={() => onSelectReward('BLOCK')}
          className="w-full md:w-56 p-5
            bg-gradient-to-b from-stone-700 to-stone-800
            pixel-border border-4 border-stone-600
            flex flex-col items-center gap-3
            hover:border-stone-400 hover:from-stone-600 hover:to-stone-700
            transition-all active:translate-y-1"
          style={{ boxShadow: '0 4px 0 0 #1c1917' }}
        >
          <div className="p-3 pixel-border border-2 bg-stone-800 border-stone-500 text-stone-200">
            <Coins size={32} />
          </div>
          <div className="text-center">
            <h3 className="font-pixel-kr text-base font-bold text-stone-200">지원금</h3>
            <p className="text-xs text-stone-400 font-pixel-kr mt-2">골드 <span className="text-yellow-400 font-pixel">+200</span></p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default BossRewardScreen;
