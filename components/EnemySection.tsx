import React, { useRef } from 'react';
import { Shield, Zap, RefreshCw, Skull, Map as MapIcon, Flame, ArrowLeft, Droplets, Activity, Star, Swords, Percent, Coins } from 'lucide-react';
import { EnemyData, IntentType, EnemyTrait } from '@/types';
import { getMonsterSprite } from './PixelSprites';

interface EnemySectionProps {
  enemy: EnemyData;
  act: number;
  floor: number;
  playerGold: number;
  // Animation states
  shake: boolean;
  enemyPoisoned: boolean;
  enemyBurning: boolean;
  enemyBleeding: boolean;
  enemyAttacking: boolean;
  // Callbacks
  onIntentClick: () => void;
  onStatusClick: (status: string) => void;
}

const EnemySection: React.FC<EnemySectionProps> = ({
  enemy,
  act,
  floor,
  playerGold,
  shake,
  enemyPoisoned,
  enemyBurning,
  enemyBleeding,
  enemyAttacking,
  onIntentClick,
  onStatusClick
}) => {
  const intentLongPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleIntentTouchStart = () => {
    intentLongPressTimer.current = setTimeout(() => {
      onIntentClick();
    }, 400);
  };

  const handleIntentTouchMove = () => {
    if (intentLongPressTimer.current) {
      clearTimeout(intentLongPressTimer.current);
      intentLongPressTimer.current = null;
    }
  };

  const handleIntentTouchEnd = () => {
    if (intentLongPressTimer.current) {
      clearTimeout(intentLongPressTimer.current);
      intentLongPressTimer.current = null;
    }
  };

  const currentIntent = enemy.intents[enemy.currentIntentIndex];

  return (
    <div className="flex-[0_0_auto] h-[28%] min-h-[180px] flex justify-center items-center relative border-b border-stone-800 bg-stone-900/50 px-2">
      
      {/* Stage Indicator - Pixel Style */}
      <div className="absolute top-2 left-2 font-pixel text-[10px] text-stone-400 flex items-center gap-1 bg-black/50 px-2 py-1 pixel-border border-2 border-stone-700 z-10">
        <MapIcon size={12} />
        {act}-{floor}
      </div>

      {/* Gold Indicator - Pixel Style */}
      <div className="absolute top-2 right-2 flex items-center gap-1 font-pixel text-[10px] text-yellow-400 bg-black/60 px-2 py-1 pixel-border border-2 border-yellow-700 z-10">
        <Coins size={12} />
        {playerGold}
      </div>

      {/* Horizontal Enemy Layout */}
      <div className="flex items-center justify-center gap-3 md:gap-6 w-full max-w-xl mt-6">
        
        {/* Left: Intent (with long-press for mobile) */}
        <div 
          className="flex flex-col items-center animate-intent-drop flex-shrink-0 cursor-help"
          onTouchStart={handleIntentTouchStart}
          onTouchMove={handleIntentTouchMove}
          onTouchEnd={handleIntentTouchEnd}
          onClick={onIntentClick}
        >
          <div className={`
            pixel-border border-3 p-2 flex items-center justify-center
            ${currentIntent.type === IntentType.ATTACK ? 'bg-red-900/80 border-red-500' :
              currentIntent.type === IntentType.BUFF ? 'bg-green-900/80 border-green-500' :
              currentIntent.type === IntentType.DEBUFF ? 'bg-purple-900/80 border-purple-500' :
              'bg-blue-900/80 border-blue-500'}
          `}>
            {currentIntent.type === IntentType.ATTACK ? <Skull size={24} className="text-red-400" /> :
             currentIntent.type === IntentType.BUFF ? <RefreshCw size={24} className="text-green-400" /> :
             currentIntent.type === IntentType.DEBUFF ? <Zap size={24} className="text-purple-400" /> :
             <Shield size={24} className="text-blue-400" />}
          </div>
          <div 
            className={`
              mt-1 px-2 py-0.5 pixel-border border-2 font-pixel text-xs flex items-center gap-1
              ${currentIntent.type === IntentType.ATTACK ? 'bg-red-800 border-red-400 text-red-200' :
                currentIntent.type === IntentType.DEFEND ? 'bg-blue-800 border-blue-400 text-blue-200' :
                currentIntent.type === IntentType.BUFF ? 'bg-green-800 border-green-400 text-green-200' :
                currentIntent.type === IntentType.DEBUFF ? 'bg-purple-800 border-purple-400 text-purple-200' :
                'bg-stone-800 border-stone-500 text-stone-200'}
            `}
          >
            {currentIntent.value > 0 && (
              <span className="font-bold">{currentIntent.value}</span>
            )}
          </div>
          {/* Hint for tap */}
          <div className="text-[7px] text-stone-500 mt-0.5 font-pixel-kr">TAP</div>
        </div>

        {/* Center: Sprite + HP + Name */}
        <div className={`flex flex-col items-center flex-shrink-0 ${enemyAttacking ? 'animate-enemy-attack' : ''}`}>
          {/* Enemy Sprite */}
          <div className={`
            w-24 h-24 md:w-32 md:h-32
            pixel-border border-3
            flex items-center justify-center
            relative overflow-hidden
            transition-all duration-150
            ${shake ? 'border-red-500 animate-hit-flash animate-knockback bg-red-900/30' : 
              enemyPoisoned ? 'border-green-500 animate-poison bg-green-900/30' :
              enemyBurning ? 'border-orange-500 animate-burn bg-orange-900/30' :
              enemyBleeding ? 'border-red-600 animate-bleed bg-red-900/30' :
              'border-stone-600 bg-stone-800'}
          `}>
            {React.createElement(getMonsterSprite(enemy.id), { className: 'w-20 h-20 md:w-28 md:h-28' })}
            
            {/* Block indicator on sprite */}
            {enemy.block > 0 && (
              <div className="absolute top-0 right-0 flex items-center gap-0.5 bg-blue-900 border-2 border-blue-400 text-blue-200 px-1 py-0.5 pixel-border text-[10px] font-pixel">
                <Shield size={10} fill="currentColor" /> {enemy.block}
              </div>
            )}
          </div>
          
          {/* HP Bar - Compact */}
          <div className="w-28 md:w-36 relative mt-1">
            <div className="h-4 bg-stone-900 pixel-border border-2 border-stone-600 overflow-hidden relative flex">
              {Array.from({ length: 10 }).map((_, i) => {
                const segmentPercent = (i + 1) * 10;
                const hpPercent = (enemy.currentHp / enemy.maxHp) * 100;
                const isFilled = hpPercent >= segmentPercent - 5;
                return (
                  <div
                    key={i}
                    className={`flex-1 border-r border-black/30 last:border-r-0 transition-colors duration-150 ${
                      isFilled ? 'bg-gradient-to-b from-red-400 via-red-600 to-red-800' : 'bg-stone-800'
                    }`}
                  />
                );
              })}
              <div className="absolute inset-0 flex items-center justify-center font-pixel text-[9px] text-white" style={{ textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0 0 4px #000' }}>
                {enemy.currentHp}/{enemy.maxHp}
              </div>
            </div>
          </div>

          {/* Name + Traits inline */}
          <div className="mt-1 flex items-center gap-1 flex-wrap justify-center">
            <span className="font-pixel-kr font-bold text-stone-200 text-xs bg-black/50 px-1.5 py-0.5 pixel-border border border-stone-600">{enemy.name}</span>
            {enemy.traits.includes(EnemyTrait.THORNS_5) && (
              <span className="text-[8px] bg-green-900 border border-green-600 px-1 pixel-border font-pixel-kr text-green-300">{'\uAC00\uC2DC'}</span>
            )}
            {enemy.traits.includes(EnemyTrait.DAMAGE_CAP_15) && (
              <span className="text-[8px] bg-stone-700 border border-stone-500 px-1 pixel-border font-pixel-kr text-stone-300">MAX15</span>
            )}
            {enemy.traits.includes(EnemyTrait.THIEVERY) && (
              <span className="text-[8px] bg-yellow-900 border border-yellow-600 px-1 pixel-border font-pixel-kr text-yellow-300">{'\uD0D0\uC695'}</span>
            )}
          </div>
        </div>

        {/* Right: Status Effects (Vertical) - Clickable for details */}
        <div className="flex flex-col gap-1 flex-shrink-0">
          {enemy.statuses?.poison > 0 && (
            <div 
              className="flex items-center gap-1 bg-green-900/60 pixel-border border-2 border-green-600 px-1.5 py-0.5 text-[9px] text-green-400 font-pixel cursor-help hover:bg-green-800/80 transition-colors"
              onClick={() => onStatusClick('poison')}
            >
              <Droplets size={10} fill="currentColor" /> {enemy.statuses.poison}
            </div>
          )}
          {enemy.statuses?.bleed > 0 && (
            <div 
              className="flex items-center gap-1 bg-red-900/60 pixel-border border-2 border-red-600 px-1.5 py-0.5 text-[9px] text-red-400 font-pixel cursor-help hover:bg-red-800/80 transition-colors"
              onClick={() => onStatusClick('bleed')}
            >
              <Activity size={10} /> {enemy.statuses.bleed}
            </div>
          )}
          {enemy.statuses?.burn > 0 && (
            <div 
              className="flex items-center gap-1 bg-orange-900/60 pixel-border border-2 border-orange-600 px-1.5 py-0.5 text-[9px] text-orange-400 font-pixel cursor-help hover:bg-orange-800/80 transition-colors"
              onClick={() => onStatusClick('burn')}
            >
              <Flame size={10} /> {enemy.statuses.burn}
            </div>
          )}
          {enemy.statuses?.stunned > 0 && (
            <div 
              className="flex items-center gap-1 bg-yellow-900/60 pixel-border border-2 border-yellow-600 px-1.5 py-0.5 text-[9px] text-yellow-400 font-pixel cursor-help hover:bg-yellow-800/80 transition-colors"
              onClick={() => onStatusClick('stunned')}
            >
              <Star size={10} fill="currentColor" /> {enemy.statuses.stunned}
            </div>
          )}
          {enemy.statuses?.strength > 0 && (
            <div 
              className="flex items-center gap-1 bg-red-900/60 pixel-border border-2 border-red-600 px-1.5 py-0.5 text-[9px] text-red-400 font-pixel cursor-help hover:bg-red-800/80 transition-colors"
              onClick={() => onStatusClick('strength')}
            >
              <Swords size={10} /> +{enemy.statuses.strength}
            </div>
          )}
          {enemy.statuses?.vulnerable > 0 && (
            <div 
              className="flex items-center gap-1 bg-purple-900/60 pixel-border border-2 border-purple-600 px-1.5 py-0.5 text-[9px] text-purple-400 font-pixel cursor-help hover:bg-purple-800/80 transition-colors"
              onClick={() => onStatusClick('vulnerable')}
            >
              <Percent size={10} /> {enemy.statuses.vulnerable}
            </div>
          )}
          {enemy.statuses?.weak > 0 && (
            <div 
              className="flex items-center gap-1 bg-stone-700/60 pixel-border border-2 border-stone-500 px-1.5 py-0.5 text-[9px] text-stone-300 font-pixel cursor-help hover:bg-stone-600/80 transition-colors"
              onClick={() => onStatusClick('weak')}
            >
              <ArrowLeft size={10} className="rotate-[-45deg]" /> {enemy.statuses.weak}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnemySection;
