import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CardInstance, CardType, CardRarity } from '../types';
import { getCardSprite } from './PixelSprites';

interface CardProps {
  card: CardInstance;
  onClick: (card: CardInstance) => void;
  disabled?: boolean;
  selected?: boolean;
  isDiscarding?: boolean;
  onTouchDragStart?: (card: CardInstance, x: number, y: number) => void;
  onTouchDragMove?: (x: number, y: number) => void;
  onTouchDragEnd?: (x: number, y: number) => void;
  className?: string;
}

const CardComponent: React.FC<CardProps> = ({
  card,
  onClick,
  disabled,
  selected,
  isDiscarding,
  onTouchDragStart,
  onTouchDragMove,
  onTouchDragEnd,
  className
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);
  const [showDetail, setShowDetail] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pixel border colors by rarity
  const getBorderStyle = () => {
    switch (card.rarity) {
      case CardRarity.LEGEND:
        return 'border-yellow-400 animate-legend-shimmer';
      case CardRarity.RARE:
        return 'border-purple-400 animate-rare-glow';
      case CardRarity.COMMON:
        return 'border-pixel-common';
      case CardRarity.STARTER:
        return 'border-pixel-starter';
      default:
        return 'border-stone-600';
    }
  };

  // Type-based background colors (pixel palette)
  const getBgColor = () => {
    switch (card.type) {
      case CardType.HANDLE:
        return 'bg-gradient-to-b from-pixel-handle to-pixel-handle-dark';
      case CardType.HEAD:
        return 'bg-gradient-to-b from-pixel-head to-pixel-head-dark';
      case CardType.DECO:
        return 'bg-gradient-to-b from-pixel-deco to-pixel-deco-dark';
      default:
        return 'bg-stone-800';
    }
  };

  const getTypeName = () => {
    switch (card.type) {
      case CardType.HANDLE: return '\uc190\uc7a1\uc774';
      case CardType.HEAD: return '\uba38\ub9ac';
      case CardType.DECO: return '\uc7a5\uc2dd';
      default: return card.type;
    }
  };

  const getTypeColor = () => {
    switch (card.type) {
      case CardType.HANDLE: return 'bg-amber-700 border-amber-500';
      case CardType.HEAD: return 'bg-slate-600 border-slate-400';
      case CardType.DECO: return 'bg-emerald-700 border-emerald-500';
      default: return 'bg-stone-700 border-stone-500';
    }
  };

  // Get unique card sprite
  const CardSprite = getCardSprite(card.id, card.type);

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

  // Touch Drag (Mobile) with Long Press for Detail
  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || showDetail) return; // Don't start new long press if modal is open
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    isDraggingRef.current = false;

    // Start long press timer for detail view
    longPressTimer.current = setTimeout(() => {
      setShowDetail(true);
      isDraggingRef.current = false;
    }, 500);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Cancel long press on move
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (disabled || !onTouchDragMove || !touchStartRef.current) return;

    const touch = e.touches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;

    if (!isDraggingRef.current) {
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) {
        isDraggingRef.current = true;
        if (onTouchDragStart) {
          onTouchDragStart(card, touch.clientX, touch.clientY);
        }
      }
    }

    if (isDraggingRef.current) {
      if (e.cancelable) e.preventDefault();
      onTouchDragMove(touch.clientX, touch.clientY);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    // Cancel long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (disabled) return;

    if (isDraggingRef.current && onTouchDragEnd) {
      const touch = e.changedTouches[0];
      onTouchDragEnd(touch.clientX, touch.clientY);
      if (e.cancelable) e.preventDefault();
    }

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
        relative flex flex-col justify-between select-none overflow-hidden
        w-24 h-36 md:w-32 md:h-48
        pixel-border border-4 p-1 md:p-1.5
        transition-all duration-150
        touch-pan-x
        ${getBorderStyle()}
        ${getBgColor()}
        ${disabled ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-grab active:cursor-grabbing hover:scale-105 hover:-translate-y-1 active:scale-95'}
        ${selected ? 'ring-4 ring-orange-500 -translate-y-3 scale-105' : ''}
        ${isDiscarding ? 'card-discarding' : ''}
        ${className || ''}
      `}
      style={{
        boxShadow: disabled ? 'none' : '3px 3px 0 0 rgba(0,0,0,0.5)'
      }}
    >
      {/* Header - Type Badge & Cost */}
      <div className="flex justify-between items-start">
        <span className={`
          text-[7px] md:text-[9px] font-pixel-kr font-bold
          px-1 py-0.5 pixel-border border
          ${getTypeColor()}
        `}>
          {getTypeName()}
        </span>
        <div className={`
          flex items-center justify-center
          w-5 h-5 md:w-6 md:h-6
          pixel-border border-2
          bg-blue-600 border-blue-300
          font-pixel text-[10px] md:text-xs text-white
        `}>
          {card.cost}
        </div>
      </div>

      {/* Icon Area - Unique Pixel Art */}
      <div className="flex-grow flex items-center justify-center py-1">
        <div className={`
          pixel-border border-2
          bg-black/40 border-white/20
          overflow-hidden
        `}>
          <CardSprite className="w-10 h-10 md:w-12 md:h-12" />
        </div>
      </div>

      {/* Card Name & Description */}
      <div className="text-center w-full flex flex-col items-center gap-0.5 overflow-hidden">
        <h3 className="text-[8px] md:text-[10px] font-pixel-kr font-bold leading-tight text-white truncate w-full px-0.5"
            style={{ textShadow: '1px 1px 0 #000' }}>
          {card.name}
        </h3>
        <p className={`
          text-[6px] md:text-[8px] font-pixel-kr
          text-stone-300 leading-tight
          h-[28px] md:h-[36px]
          flex items-center justify-center text-center
          bg-black/30 pixel-border border border-black/50
          p-0.5 w-full overflow-hidden
        `}>
          <span className="line-clamp-2">{card.description}</span>
        </p>
      </div>

      {/* Value Badge - Pixel Style */}
      <div className={`
        absolute -bottom-2 -right-2
        w-7 h-7 md:w-8 md:h-8
        pixel-border border-2
        flex items-center justify-center
        font-pixel text-[9px] md:text-[11px]
        z-10
        ${card.type === CardType.HANDLE
          ? 'bg-amber-600 border-amber-400 text-amber-100'
          : card.type === CardType.HEAD
          ? 'bg-slate-600 border-slate-400 text-slate-100'
          : 'bg-emerald-600 border-emerald-400 text-emerald-100'
        }
      `}>
        {card.type === CardType.HANDLE ? `x${card.value}` : card.value}
      </div>

      {/* Rarity Indicator for Legend/Rare */}
      {card.rarity === CardRarity.LEGEND && (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden pixel-border">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent animate-pulse" />
        </div>
      )}

      {/* Mobile Detail Modal (Long Press) - Rendered via Portal */}
      {showDetail && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80"
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setShowDetail(false); }}
          onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); setShowDetail(false); }}
        >
          <div
            className={`
              relative flex flex-col items-center
              w-56 h-80 p-4
              pixel-border border-4
              ${getBorderStyle()}
              ${getBgColor()}
            `}
            style={{ boxShadow: '8px 8px 0 0 rgba(0,0,0,0.7)' }}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              className="absolute -top-4 -right-4 w-10 h-10 pixel-border border-2 bg-red-600 border-red-400 text-white font-pixel text-lg flex items-center justify-center hover:bg-red-500 active:bg-red-700"
              onMouseDown={(e) => { e.stopPropagation(); setShowDetail(false); }}
              onTouchStart={(e) => { e.stopPropagation(); setShowDetail(false); }}
            >
              X
            </button>
            {/* Type & Cost */}
            <div className="flex justify-between items-center w-full mb-3">
              <span className={`
                text-sm font-pixel-kr font-bold
                px-2 py-1 pixel-border border
                ${getTypeColor()}
              `}>
                {getTypeName()}
              </span>
              <div className="flex items-center justify-center w-10 h-10 pixel-border border-2 bg-blue-600 border-blue-300 font-pixel text-base text-white">
                {card.cost}
              </div>
            </div>

            {/* Large Card Art */}
            <div className="pixel-border border-2 bg-black/40 border-white/20 p-3 mb-3">
              <CardSprite className="w-24 h-24" />
            </div>

            {/* Card Name */}
            <h3 className="text-base font-pixel-kr font-bold text-white text-center mb-2"
                style={{ textShadow: '2px 2px 0 #000' }}>
              {card.name}
            </h3>

            {/* Full Description */}
            <div className="flex-grow w-full bg-black/40 pixel-border border border-black/50 p-3 overflow-auto">
              <p className="text-sm font-pixel-kr text-stone-200 leading-relaxed text-center">
                {card.description}
              </p>
            </div>

            {/* Value Badge */}
            <div className={`
              absolute -bottom-4 -right-4
              w-12 h-12
              pixel-border border-2
              flex items-center justify-center
              font-pixel text-base
              ${card.type === CardType.HANDLE
                ? 'bg-amber-600 border-amber-400 text-amber-100'
                : card.type === CardType.HEAD
                ? 'bg-slate-600 border-slate-400 text-slate-100'
                : 'bg-emerald-600 border-emerald-400 text-emerald-100'
              }
            `}>
              {card.type === CardType.HANDLE ? `x${card.value}` : card.value}
            </div>

          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default CardComponent;
