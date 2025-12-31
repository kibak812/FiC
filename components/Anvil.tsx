import React, { useState, useCallback } from 'react';
import { CardInstance, CardType } from '../types';
import CardComponent from './CardComponent';
import { Hammer, Shield, Zap, RotateCcw } from 'lucide-react';
import { SparkParticle } from './SparkParticle';

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
  touchHandlers?: {
    onTouchDragStart: (card: CardInstance, x: number, y: number) => void;
    onTouchDragMove: (x: number, y: number) => void;
    onTouchDragEnd: (x: number, y: number) => void;
  };
  discardingCardIds?: Set<string>;
}

interface SlotPlaceholderProps {
  type: string;
  label: string;
  subLabel: string;
  isOver: boolean;
}

const SlotPlaceholder: React.FC<SlotPlaceholderProps> = ({ type, label, subLabel, isOver }) => (
  <div className={`
    w-24 h-36 md:w-32 md:h-48
    border-4 border-dashed pixel-border
    flex flex-col items-center justify-center
    transition-all duration-150
    ${isOver
      ? 'border-orange-400 bg-orange-900/40 scale-105'
      : 'border-stone-600 bg-black/30'}
  `}>
    <span className={`
      font-pixel text-2xl md:text-3xl mb-2 opacity-60
      ${isOver ? 'text-orange-300' : 'text-stone-500'}
    `}>{type}</span>
    <span className="font-pixel-kr text-xs md:text-sm text-stone-400">{label}</span>
    <span className="font-pixel-kr text-[10px] text-stone-500 mt-1">{subLabel}</span>
  </div>
);

// Pixel Plus Sign
const PixelPlus: React.FC = () => (
  <div className="text-stone-500 font-pixel text-xl md:text-2xl pb-16 md:pb-20 hidden sm:block opacity-50">
    +
  </div>
);

const Anvil: React.FC<AnvilProps> = ({
  slots,
  onRemove,
  onCraft,
  onDropCard,
  onClear,
  canCraft,
  prediction,
  playerEnergy,
  touchHandlers,
  discardingCardIds = new Set()
}) => {
  const [dragOverType, setDragOverType] = useState<CardType | null>(null);
  const [sparkEffects, setSparkEffects] = useState<{ id: number; x: number; y: number }[]>([]);
  const [snappingSlot, setSnappingSlot] = useState<CardType | null>(null);

  const triggerSpark = useCallback((slotElement: HTMLElement) => {
    const rect = slotElement.getBoundingClientRect();
    const parentRect = slotElement.closest('.anvil-container')?.getBoundingClientRect();
    if (parentRect) {
      const x = rect.left - parentRect.left + rect.width / 2;
      const y = rect.top - parentRect.top + rect.height / 2;
      const id = Date.now();
      setSparkEffects(prev => [...prev, { id, x, y }]);
    }
  }, []);

  const removeSpark = useCallback((id: number) => {
    setSparkEffects(prev => prev.filter(s => s.id !== id));
  }, []);

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
      // Trigger spark effect
      triggerSpark(e.currentTarget as HTMLElement);
      // Trigger snap animation
      setSnappingSlot(type);
      setTimeout(() => setSnappingSlot(null), 250);
      onDropCard(cardId, type);
    }
  };

  const hasCards = !!(slots.handle || slots.head || slots.deco);
  const costExceeds = prediction.cost > playerEnergy;

  return (
    <div className="anvil-container relative flex flex-col items-center w-full max-w-4xl mx-auto p-3 md:p-5 bg-pixel-bg-mid pixel-border border-4 border-stone-600 pixel-shadow">

      {/* Spark Effects */}
      {sparkEffects.map(spark => (
        <SparkParticle
          key={spark.id}
          x={spark.x}
          y={spark.y}
          onComplete={() => removeSpark(spark.id)}
        />
      ))}

      {/* Forge Glow Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-orange-900/20 via-transparent to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-orange-600/10 blur-2xl pointer-events-none" />

      {/* Slots Container */}
      <div className="flex flex-wrap justify-center items-end gap-2 md:gap-4 mb-4 md:mb-6 z-10 min-h-[160px] md:min-h-[220px]">

        {/* Handle Slot */}
        <div
          className={`relative group ${snappingSlot === CardType.HANDLE ? 'animate-slot-snap' : ''}`}
          data-drop-zone={CardType.HANDLE}
          onDragOver={(e) => handleDragOver(e, CardType.HANDLE)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, CardType.HANDLE)}
        >
          {slots.handle ? (
            <CardComponent
              card={slots.handle}
              onClick={() => onRemove(CardType.HANDLE)}
              isDiscarding={discardingCardIds.has(slots.handle.instanceId)}
              {...touchHandlers}
            />
          ) : (
            <SlotPlaceholder
              type="H"
              label="손잡이"
              subLabel="배율"
              isOver={dragOverType === CardType.HANDLE}
            />
          )}
          <div className="absolute -bottom-5 md:-bottom-6 w-full text-center text-[9px] md:text-[10px] text-stone-500 font-pixel-kr pointer-events-none">
            필수
          </div>
        </div>

        <PixelPlus />

        {/* Head Slot */}
        <div
          className={`relative group ${snappingSlot === CardType.HEAD ? 'animate-slot-snap' : ''}`}
          data-drop-zone={CardType.HEAD}
          onDragOver={(e) => handleDragOver(e, CardType.HEAD)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, CardType.HEAD)}
        >
          {slots.head ? (
            <CardComponent
              card={slots.head}
              onClick={() => onRemove(CardType.HEAD)}
              isDiscarding={discardingCardIds.has(slots.head.instanceId)}
              {...touchHandlers}
            />
          ) : (
            <SlotPlaceholder
              type="H"
              label="머리"
              subLabel="기본"
              isOver={dragOverType === CardType.HEAD}
            />
          )}
          <div className="absolute -bottom-5 md:-bottom-6 w-full text-center text-[9px] md:text-[10px] text-stone-500 font-pixel-kr pointer-events-none">
            필수
          </div>
        </div>

        <PixelPlus />

        {/* Deco Slot */}
        <div
          className={`relative group ${snappingSlot === CardType.DECO ? 'animate-slot-snap' : ''}`}
          data-drop-zone={CardType.DECO}
          onDragOver={(e) => handleDragOver(e, CardType.DECO)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, CardType.DECO)}
        >
          {slots.deco ? (
            <CardComponent
              card={slots.deco}
              onClick={() => onRemove(CardType.DECO)}
              isDiscarding={discardingCardIds.has(slots.deco.instanceId)}
              {...touchHandlers}
            />
          ) : (
            <SlotPlaceholder
              type="D"
              label="장식"
              subLabel="보너스"
              isOver={dragOverType === CardType.DECO}
            />
          )}
          <div className="absolute -bottom-5 md:-bottom-6 w-full text-center text-[9px] md:text-[10px] text-stone-500 font-pixel-kr pointer-events-none">
            선택
          </div>
        </div>
      </div>

      {/* Craft Button & Preview */}
      <div className="flex items-center gap-2 md:gap-4 z-10 w-full justify-center border-t-4 border-stone-700 pt-3 md:pt-4 mt-1 md:mt-2">

        {/* Prediction Stats - Pixel Style */}
        <div className="flex flex-col gap-1 text-right min-w-[90px] md:min-w-[110px] bg-black/40 p-2 pixel-border border-2 border-stone-700">
          <div className={`flex items-center justify-end gap-2 font-pixel text-sm md:text-base ${prediction.isBlock ? 'text-pixel-block-light' : 'text-pixel-hp-light'}`}>
            {prediction.isBlock ? (
              <Shield size={14} className="md:w-4 md:h-4" />
            ) : (
              <Hammer size={14} className="md:w-4 md:h-4" />
            )}
            <span>{prediction.isBlock ? prediction.block : prediction.damage}</span>
          </div>
          <div className={`flex items-center justify-end gap-1 font-pixel text-[10px] md:text-xs ${costExceeds ? 'text-red-400 animate-pulse' : 'text-pixel-energy'}`}>
            <Zap size={10} className="md:w-3 md:h-3" />
            <span>{prediction.cost}</span>
          </div>
        </div>

        {/* Clear Button - Pixel Style */}
        <button
          onClick={onClear}
          disabled={!hasCards}
          className={`
            h-10 w-10 md:h-12 md:w-12
            flex items-center justify-center
            pixel-border border-4 transition-all
            ${hasCards
              ? 'bg-stone-700 border-stone-500 hover:bg-stone-600 text-stone-300 active:translate-y-1'
              : 'bg-stone-800 border-stone-700 text-stone-600 cursor-not-allowed'}
          `}
          style={{
            boxShadow: hasCards ? '0 4px 0 0 #1c1917' : 'none'
          }}
          title="초기화"
        >
          <RotateCcw size={18} className="md:w-5 md:h-5" />
        </button>

        {/* Craft Button - 3D Pixel Style */}
        <button
          onClick={onCraft}
          disabled={!canCraft}
          className={`
            flex-1 max-w-[200px] md:max-w-xs
            px-4 md:px-8 py-2 md:py-3
            pixel-border border-4
            font-pixel-kr text-sm md:text-base font-bold tracking-wide
            flex items-center justify-center gap-2
            transition-all
            ${canCraft
              ? 'bg-gradient-to-b from-orange-500 to-orange-700 border-orange-400 text-white hover:from-orange-400 hover:to-orange-600 active:translate-y-1 animate-craft-pulse'
              : 'bg-stone-700 border-stone-600 text-stone-500 cursor-not-allowed'}
          `}
          style={{
            boxShadow: canCraft
              ? '0 4px 0 0 #9a3412, inset 0 1px 0 0 rgba(255,255,255,0.2)'
              : '0 2px 0 0 #292524'
          }}
        >
          <span>{canCraft ? '제작!' : '---'}</span>
          {canCraft && <Hammer className="w-4 h-4 md:w-5 md:h-5" />}
        </button>
      </div>

    </div>
  );
};

export default Anvil;
