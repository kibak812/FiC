import React from 'react';
import { Trophy } from 'lucide-react';
import { CardInstance } from '@/types';
import CardComponent from '@/components/CardComponent';

interface RewardScreenProps {
  rewardOptions: CardInstance[];
  onSelectReward: (card: CardInstance | null) => void;
}

const RewardScreen: React.FC<RewardScreenProps> = ({ rewardOptions, onSelectReward }) => {
  return (
    <div className="w-full h-screen-safe flex flex-col items-center justify-center bg-pixel-bg-dark text-stone-100 p-4">
      <h2 className="text-xl md:text-2xl font-pixel mb-8 text-yellow-400 flex items-center gap-3" style={{ textShadow: '0 0 15px rgba(250,204,21,0.5)' }}>
        <Trophy size={24} /> LOOT!
      </h2>
      <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-10">
        {rewardOptions.map(card => (
          <CardComponent
            key={card.instanceId}
            card={card}
            onClick={() => onSelectReward(card)}
            className="hover:scale-110 hover:-translate-y-2 transition-transform cursor-pointer"
          />
        ))}
      </div>
      <button
        onClick={() => onSelectReward(null)}
        className="px-5 py-2
          pixel-border border-4 border-stone-600
          bg-gradient-to-b from-stone-700 to-stone-800
          text-stone-400 hover:text-stone-200
          font-pixel-kr text-sm
          hover:from-stone-600 hover:to-stone-700
          transition-all active:translate-y-1"
        style={{ boxShadow: '0 4px 0 0 #1c1917' }}
      >
        건너뛰기
      </button>
    </div>
  );
};

export default RewardScreen;
