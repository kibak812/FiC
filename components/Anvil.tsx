import React, { useState } from 'react';
import { CardInstance, CardType } from '../types';
import CardComponent from './CardComponent';
import { Hammer, Shield, Zap, RotateCcw } from 'lucide-react';

interface AnvilProps {
  slots: {
    handle: CardInstance | null;
    head: CardInstance | null;
    deco: CardInstance | null;
  };
  onRemove: (type: CardType) => void;
  onCraft: () => void;
  onDropCard: (cardId: string, targetType: CardType) => void;
  onClear: () => void;
  canCraft: boolean;
  prediction: {
    damage: number;
    cost: number;
    block: number;
    isBlock: boolean;
  };
  playerEnergy: number;
  // Pass touch handlers for cards inside Anvil
  touchHandlers?: {
    onTouchDragStart: (card: CardInstance, x: number, y: number) => void;
    onTouchDragMove: (x: number, y: number) => void;
    onTouchDragEnd: (x: number, y: number) => void;
  }
}

const SlotPlaceholder: React.FC<{ type: string; label: string; isOver: boolean }> = ({ type, label, isOver }) => (
  <div className={`
    w-24 h-36 md:w-32 md:h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center 
    text-stone-500 transition-colors duration-200
    ${isOver ? 'border-orange-400 bg-orange-900/30' : 'border-stone-600 bg-black/20'}
  `}>
    <span className="text-2xl opacity-50 font-bold mb-2">{type[0]}</span>
    <span className="text-sm uppercase tracking-widest">{label}</span>
  </div>
);

const Anvil: React.FC<AnvilProps> = ({ slots, onRemove, onCraft, onDropCard, onClear, canCraft, prediction, playerEnergy, touchHandlers }) => {
  const [dragOverType, setDragOverType] = useState<CardType | null>(null);

  const handleDragOver = (e: React.DragEvent, type: CardType) => {
    e.preventDefault();
    if (dragOverType !== type) setDragOverType(type);
  };

  const handleDragLeave = () => {
    setDragOverType(null);
  };

  const handleDrop = (e: React.DragEvent, type: CardType) => {
    e.preventDefault();
    setDragOverType(null);
    const cardId = e.dataTransfer.getData('cardInstanceId');
    if (cardId) {
        onDropCard(cardId, type);
    }
  };

  const hasCards = !!(slots.handle || slots.head || slots.deco);

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-2 md:p-4 bg-stone-800/80 rounded-xl border border-stone-600 shadow-2xl relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-30 pointer-events-none"></div>

      <div className="flex flex-wrap justify-center items-end gap-2 md:gap-4 mb-4 md:mb-6 z-10 min-h-[160px] md:min-h-[220px]">
        {/* Handle Slot */}
        <div 
            className="relative group"
            data-drop-zone={CardType.HANDLE}
            onDragOver={(e) => handleDragOver(e, CardType.HANDLE)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, CardType.HANDLE)}
        >
           {slots.handle ? (
             <CardComponent 
                card={slots.handle} 
                onClick={() => onRemove(CardType.HANDLE)} 
                {...touchHandlers}
             />
           ) : (
             <SlotPlaceholder type="H" label="손잡이" isOver={dragOverType === CardType.HANDLE} />
           )}
           <div className="absolute -bottom-5 md:-bottom-6 w-full text-center text-[10px] text-stone-400 uppercase pointer-events-none">배율 (필수)</div>
        </div>

        {/* Plus Sign */}
        <div className="text-stone-500 text-xl md:text-2xl font-bold pb-16 md:pb-20 hidden sm:block">+</div>

        {/* Head Slot */}
        <div 
            className="relative group"
            data-drop-zone={CardType.HEAD}
            onDragOver={(e) => handleDragOver(e, CardType.HEAD)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, CardType.HEAD)}
        >
          {slots.head ? (
            <CardComponent 
                card={slots.head} 
                onClick={() => onRemove(CardType.HEAD)}
                {...touchHandlers}
             />
          ) : (
             <SlotPlaceholder type="H" label="머리" isOver={dragOverType === CardType.HEAD} />
          )}
          <div className="absolute -bottom-5 md:-bottom-6 w-full text-center text-[10px] text-stone-400 uppercase pointer-events-none">기본 (필수)</div>
        </div>

        {/* Plus Sign */}
        <div className="text-stone-500 text-xl md:text-2xl font-bold pb-16 md:pb-20 hidden sm:block">+</div>

        {/* Deco Slot */}
        <div 
            className="relative group"
            data-drop-zone={CardType.DECO}
            onDragOver={(e) => handleDragOver(e, CardType.DECO)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, CardType.DECO)}
        >
          {slots.deco ? (
            <CardComponent 
                card={slots.deco} 
                onClick={() => onRemove(CardType.DECO)}
                {...touchHandlers}
             />
          ) : (
             <SlotPlaceholder type="D" label="장식" isOver={dragOverType === CardType.DECO} />
          )}
           <div className="absolute -bottom-5 md:-bottom-6 w-full text-center text-[10px] text-stone-400 uppercase pointer-events-none">보너스 (선택)</div>
        </div>
      </div>

      {/* Craft Button & Preview */}
      <div className="flex items-center gap-2 md:gap-6 z-10 w-full justify-center border-t border-stone-600 pt-3 md:pt-4 mt-1 md:mt-2">
        
        {/* Prediction Stats */}
        <div className="flex flex-col gap-1 text-right min-w-[80px] md:min-w-[100px]">
          <div className={`flex items-center justify-end gap-1 md:gap-2 font-mono text-lg md:text-xl ${prediction.isBlock ? 'text-blue-400' : 'text-red-400'}`}>
            {prediction.isBlock ? <Shield size={16} className="md:w-5 md:h-5" /> : <Hammer size={16} className="md:w-5 md:h-5" />}
            <span className="font-bold">{prediction.isBlock ? prediction.block : prediction.damage}</span>
          </div>
          <div className={`flex items-center justify-end gap-1 md:gap-2 text-xs md:text-sm ${prediction.cost > playerEnergy ? 'text-red-500' : 'text-blue-300'}`}>
             <Zap size={12} className="md:w-[14px]" />
             <span>비용: {prediction.cost}</span>
          </div>
        </div>

        {/* Clear Button */}
        <button
            onClick={onClear}
            disabled={!hasCards}
            className={`
                h-12 w-12 flex items-center justify-center rounded-lg border border-stone-600 transition-all
                ${hasCards ? 'bg-stone-700 hover:bg-stone-600 text-stone-300' : 'bg-stone-800 text-stone-600 cursor-not-allowed'}
            `}
            title="초기화"
        >
            <RotateCcw size={20} />
        </button>

        {/* Craft Button */}
        <button
          onClick={onCraft}
          disabled={!canCraft}
          className={`
            flex-1 max-w-xs
            px-4 md:px-12 py-3 md:py-4 rounded-lg font-black text-sm md:text-lg tracking-widest uppercase transition-all
            flex items-center justify-center gap-2 md:gap-3 shadow-lg
            ${canCraft 
              ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white translate-y-0 shadow-orange-900/50' 
              : 'bg-stone-700 text-stone-500 cursor-not-allowed shadow-none'}
          `}
        >
          <span>제작 및 공격</span>
          {canCraft && <Hammer className="animate-bounce w-4 h-4 md:w-5 md:h-5" />}
        </button>
      </div>

    </div>
  );
};

export default Anvil;