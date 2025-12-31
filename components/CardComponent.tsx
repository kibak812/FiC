import React, { useRef } from 'react';
import { CardInstance, CardType, CardRarity } from '../types';
import { Sword, Gem, ArrowUpCircle } from 'lucide-react';

interface CardProps {
  card: CardInstance;
  onClick: (card: CardInstance) => void;
  disabled?: boolean;
  selected?: boolean;
  // Touch Drag Props
  onTouchDragStart?: (card: CardInstance, x: number, y: number) => void;
  onTouchDragMove?: (x: number, y: number) => void;
  onTouchDragEnd?: (x: number, y: number) => void;
  className?: string; // Allow external override for positioning (e.g., drag ghost)
}

const CardComponent: React.FC<CardProps> = ({ 
  card, 
  onClick, 
  disabled, 
  selected,
  onTouchDragStart,
  onTouchDragMove,
  onTouchDragEnd,
  className
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  
  // Refs for tracking touch movement delta
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);

  const getBorderColor = () => {
    switch (card.rarity) {
      case CardRarity.LEGEND: return 'border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]';
      case CardRarity.RARE: return 'border-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.4)]';
      case CardRarity.COMMON: return 'border-blue-400';
      default: return 'border-stone-500';
    }
  };

  const getBgColor = () => {
    switch (card.type) {
      case CardType.HANDLE: return 'bg-amber-900/90';
      case CardType.HEAD: return 'bg-slate-800/90';
      case CardType.DECO: return 'bg-emerald-900/90';
    }
  };

  const getTypeName = () => {
    switch (card.type) {
        case CardType.HANDLE: return '손잡이';
        case CardType.HEAD: return '머리';
        case CardType.DECO: return '장식';
        default: return card.type;
    }
  }

  const getIcon = () => {
    switch (card.type) {
      case CardType.HANDLE: return <ArrowUpCircle className="w-3 h-3 md:w-4 md:h-4" />;
      case CardType.HEAD: return <Sword className="w-3 h-3 md:w-4 md:h-4" />;
      case CardType.DECO: return <Gem className="w-3 h-3 md:w-4 md:h-4" />;
    }
  };

  // HTML5 Drag (Desktop)
  const handleDragStart = (e: React.DragEvent) => {
    if (disabled) {
        e.preventDefault();
        return;
    }
    e.dataTransfer.setData('cardInstanceId', card.instanceId);
    e.dataTransfer.setData('cardType', card.type);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Touch Drag (Mobile)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || !onTouchDragStart) return;
    const touch = e.touches[0];
    // Record start position but do NOT start drag yet
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    isDraggingRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled || !onTouchDragMove || !touchStartRef.current) return;
    
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;

    // Logic to detect if this is a vertical drag intent or a horizontal scroll intent
    if (!isDraggingRef.current) {
        // Threshold: 10px movement
        // Direction: Vertical movement must be greater than horizontal movement
        if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) {
            isDraggingRef.current = true;
            // Now we officially start the drag in the parent
            if (onTouchDragStart) {
                onTouchDragStart(card, touch.clientX, touch.clientY);
            }
        }
    }

    // If we are in dragging mode, update position and prevent default browser scrolling
    if (isDraggingRef.current) {
        if (e.cancelable) e.preventDefault();
        onTouchDragMove(touch.clientX, touch.clientY);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (disabled || !onTouchDragEnd) return;

    if (isDraggingRef.current) {
        const touch = e.changedTouches[0];
        onTouchDragEnd(touch.clientX, touch.clientY);
        // Prevent ghost clicks if we were dragging
        if (e.cancelable) e.preventDefault();
    }
    
    // Reset state
    touchStartRef.current = null;
    isDraggingRef.current = false;
  };

  return (
    <div
      ref={elementRef}
      draggable={!disabled}
      onDragStart={handleDragStart}
      onClick={() => !disabled && onClick(card)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`
        relative flex flex-col justify-between select-none
        w-24 h-36 md:w-32 md:h-48
        rounded-lg border-2 p-1.5 md:p-2 
        transition-all duration-200
        touch-pan-x
        ${getBorderColor()}
        ${getBgColor()}
        ${disabled ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-grab active:cursor-grabbing hover:scale-105 active:scale-95'}
        ${selected ? 'ring-4 ring-orange-500 translate-y-[-10px]' : ''}
        ${className || ''}
      `}
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <span className={`text-[8px] md:text-[10px] uppercase font-bold tracking-tighter px-1 rounded text-white bg-black/40`}>
          {getTypeName()}
        </span>
        <div className="flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full bg-blue-500 text-white font-bold text-xs md:text-sm border border-blue-300">
          {card.cost}
        </div>
      </div>

      {/* Image / Icon Placeholder */}
      <div className="flex-grow flex items-center justify-center py-1 md:py-2 text-stone-300">
         <div className="p-2 md:p-3 rounded-full bg-black/30 border border-white/10">
            {getIcon()}
         </div>
      </div>

      {/* Content */}
      <div className="text-center w-full px-1 flex flex-col items-center">
        <h3 className="text-[10px] md:text-xs font-bold leading-tight mb-1 text-white shadow-black drop-shadow-md break-keep line-clamp-1 md:line-clamp-2">
            {card.name}
        </h3>
        <p className="text-[8px] md:text-[10px] text-stone-300 leading-tight min-h-[40px] md:min-h-[48px] flex items-center justify-center bg-black/20 rounded whitespace-normal break-words text-center p-0.5 w-full">
          {card.description}
        </p>
      </div>

      {/* Value Badge */}
      <div className="absolute -bottom-2 -right-2 w-6 h-6 md:w-8 md:h-8 bg-stone-800 border-2 border-stone-600 rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold shadow-lg z-10">
        {card.type === CardType.HANDLE ? `x${card.value}` : card.value}
      </div>
    </div>
  );
};

export default CardComponent;