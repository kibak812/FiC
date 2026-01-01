import React from 'react';
import { Flame, ArrowLeft, Ban, Check } from 'lucide-react';
import { CardInstance } from '@/types';
import CardComponent from '@/components/CardComponent';

interface RemoveCardScreenProps {
  deck: CardInstance[];
  selectedCardId: string | null;
  onCardClick: (card: CardInstance) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

const RemoveCardScreen: React.FC<RemoveCardScreenProps> = ({
  deck,
  selectedCardId,
  onCardClick,
  onCancel,
  onConfirm
}) => {
  const allCards = [...deck].sort((a, b) => a.cost - b.cost || a.type.localeCompare(b.type));
  const selectedName = allCards.find(c => c.instanceId === selectedCardId)?.name;

  return (
    <div className="w-full h-screen-safe flex flex-col bg-pixel-bg-dark text-stone-100 overflow-hidden">
      <div className="flex-shrink-0 text-center p-4 bg-pixel-bg-mid pixel-border border-b-4 border-stone-700 z-10">
        <h2 className="text-lg md:text-xl font-pixel text-red-400 mb-2 flex items-center justify-center gap-2" style={{ textShadow: '0 0 10px rgba(248,113,113,0.5)' }}>
          <Flame size={20} /> SMELT CARD
        </h2>
        <p className="text-stone-400 font-pixel-kr text-xs">제거할 카드를 선택한 후 확인 버튼을 누르세요.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-pixel-bg-dark">
        <div className="flex flex-wrap justify-center gap-4 pb-24">
          {allCards.map(card => (
            <div key={card.instanceId} className="relative group">
              <CardComponent
                card={card}
                onClick={onCardClick}
                selected={selectedCardId === card.instanceId}
                className={`cursor-pointer transition-all ${selectedCardId === card.instanceId ? 'ring-4 ring-red-500 scale-105 z-10' : 'hover:scale-105 opacity-80 hover:opacity-100'}`}
              />
              {selectedCardId === card.instanceId && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white pixel-border border-2 border-red-300 p-1 z-20">
                  <Check size={14} strokeWidth={4} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-shrink-0 p-4 bg-pixel-bg-mid pixel-border border-t-4 border-stone-700 flex items-center justify-between gap-4 safe-area-bottom">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2.5
            pixel-border border-4 border-stone-600
            bg-gradient-to-b from-stone-700 to-stone-800
            text-stone-400 hover:text-white hover:from-stone-600 hover:to-stone-700
            font-pixel-kr text-sm font-bold
            transition-all active:translate-y-1"
          style={{ boxShadow: '0 4px 0 0 #1c1917' }}
        >
          <ArrowLeft size={16} /> 취소
        </button>

        <button
          onClick={onConfirm}
          disabled={!selectedCardId}
          className={`
            flex-1 flex items-center justify-center gap-2 px-4 py-2.5
            pixel-border border-4 font-pixel-kr text-sm font-bold
            transition-all
            ${selectedCardId
              ? 'bg-gradient-to-b from-red-600 to-red-700 border-red-400 text-white hover:from-red-500 hover:to-red-600 active:translate-y-1'
              : 'bg-stone-800 border-stone-700 text-stone-600 cursor-not-allowed'}
          `}
          style={{ boxShadow: selectedCardId ? '0 4px 0 0 #7f1d1d, 0 0 15px rgba(220,38,38,0.4)' : 'none' }}
        >
          {selectedCardId ? `'${selectedName}' 제거` : '카드 선택 필요'} <Ban size={16} />
        </button>
      </div>
    </div>
  );
};

export default RemoveCardScreen;
