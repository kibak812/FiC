import React from 'react';
import { Trophy, Sparkles } from 'lucide-react';
import { CardInstance } from '@/types';
import CardComponent from '@/components/CardComponent';

interface RewardScreenProps {
  rewardOptions: CardInstance[];
  onSelectReward: (card: CardInstance | null) => void;
  aiGeneratedCardId?: string; // ID of AI-generated card to highlight
  isLoading?: boolean;
}

const RewardScreen: React.FC<RewardScreenProps> = ({ rewardOptions, onSelectReward, aiGeneratedCardId, isLoading }) => {
  if (isLoading) {
    return (
      <div className="w-full h-screen-safe flex flex-col items-center justify-center bg-pixel-bg-dark text-stone-100 p-4">
        <div className="animate-pulse">
          <Sparkles size={48} className="text-purple-400 mb-4 mx-auto animate-spin" />
          <p className="font-pixel-kr text-purple-300">AI가 새로운 카드를 생성 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen-safe flex flex-col items-center justify-center bg-pixel-bg-dark text-stone-100 p-4">
      <h2 className="text-xl md:text-2xl font-pixel mb-8 text-yellow-400 flex items-center gap-3" style={{ textShadow: '0 0 15px rgba(250,204,21,0.5)' }}>
        <Trophy size={24} /> LOOT!
      </h2>
      <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-10">
        {rewardOptions.map(card => {
          const isAiGenerated = aiGeneratedCardId === card.instanceId;
          return (
            <div key={card.instanceId} className="relative">
              {isAiGenerated && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 bg-purple-600 px-2 py-0.5 rounded text-xs font-pixel text-white whitespace-nowrap">
                  <Sparkles size={12} /> AI 생성
                </div>
              )}
              <CardComponent
                card={card}
                onClick={() => onSelectReward(card)}
                className={`hover:scale-110 hover:-translate-y-2 transition-transform cursor-pointer ${isAiGenerated ? 'ring-2 ring-purple-400 ring-offset-2 ring-offset-stone-900' : ''}`}
              />
            </div>
          );
        })}
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
