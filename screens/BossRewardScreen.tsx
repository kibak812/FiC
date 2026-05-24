import React from 'react';
import { Hammer, Zap, Heart, Coins } from 'lucide-react';
import { BOSS_REWARDS } from '@/constants';
import { BossRewardColorKey, BossRewardIconKey, BossRewardId } from '@/types';

const BOSS_REWARD_ICONS: Record<BossRewardIconKey, React.ReactNode> = {
  zap: <Zap size={32} fill="currentColor" />,
  heart: <Heart size={32} fill="currentColor" />,
  coins: <Coins size={32} />
};

const BOSS_REWARD_COLORS: Record<BossRewardColorKey, { border: string; hoverBorder: string; bg: string; text: string }> = {
  yellow: {
    border: 'border-yellow-700',
    hoverBorder: 'hover:border-yellow-500',
    bg: 'bg-yellow-900/50 border-yellow-600',
    text: 'text-yellow-400'
  },
  blue: {
    border: 'border-blue-700',
    hoverBorder: 'hover:border-blue-500',
    bg: 'bg-blue-900/50 border-blue-600',
    text: 'text-blue-400'
  },
  stone: {
    border: 'border-stone-600',
    hoverBorder: 'hover:border-stone-400',
    bg: 'bg-stone-800 border-stone-500',
    text: 'text-stone-200'
  }
};

interface BossRewardScreenProps {
  onSelectReward: (type: BossRewardId) => void;
}

const BossRewardScreen: React.FC<BossRewardScreenProps> = ({ onSelectReward }) => {
  return (
    <div className="w-full h-screen-safe flex flex-col items-center justify-center bg-pixel-bg-dark text-stone-100 p-4">
      <h2 className="text-xl md:text-2xl font-pixel-kr font-bold mb-3 text-yellow-400 flex items-center gap-3" style={{ textShadow: '0 0 15px rgba(250,204,21,0.5)' }}>
        <Hammer size={24} /> 대장간 강화
      </h2>
      <p className="text-stone-400 font-pixel-kr text-sm mb-8 text-center">보스를 물리쳤습니다! 대장간을 업그레이드할 기회입니다.</p>

      <div className="flex flex-col md:flex-row gap-4 md:gap-6 mb-8">
        {BOSS_REWARDS.map(reward => {
          const colors = BOSS_REWARD_COLORS[reward.color];

          return (
            <button
              key={reward.id}
              onClick={() => onSelectReward(reward.id)}
              className={`w-full md:w-56 p-5
                bg-gradient-to-b from-stone-700 to-stone-800
                pixel-border border-4 ${colors.border}
                flex flex-col items-center gap-3
                ${colors.hoverBorder} hover:from-stone-600 hover:to-stone-700
                transition-all active:translate-y-1`}
              style={{ boxShadow: '0 4px 0 0 #1c1917' }}
            >
              <div className={`p-3 pixel-border border-2 ${colors.bg} ${colors.text}`}>
                {BOSS_REWARD_ICONS[reward.icon]}
              </div>
              <div className="text-center">
                <h3 className={`font-pixel-kr text-base font-bold ${colors.text}`}>{reward.name}</h3>
                <p className="text-xs text-stone-400 font-pixel-kr mt-2">{reward.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BossRewardScreen;
