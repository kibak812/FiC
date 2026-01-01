import React from 'react';
import { Heart, Shield, Ban, Lock } from 'lucide-react';

interface PlayerHUDProps {
  hp: number;
  block: number;
  energy: number;
  maxEnergy: number;
  disarmed: boolean;
  costLimit: number | null;
  playerHealing: boolean;
  playerHit: boolean;
  playerBlocking: boolean;
}

const PlayerHUD: React.FC<PlayerHUDProps> = ({
  hp,
  block,
  energy,
  maxEnergy,
  disarmed,
  costLimit,
  playerHealing,
  playerHit,
  playerBlocking
}) => {
  return (
    <div className="absolute left-2 top-2 md:left-4 md:top-4 flex flex-col gap-1 md:gap-2 z-20 pointer-events-none">
      <div className={`flex items-center gap-2 font-pixel text-sm md:text-base text-pixel-hp bg-black/50 px-2 py-1 pixel-border border-2 border-red-800 transition-all ${playerHealing ? 'animate-heal' : ''} ${playerHit ? 'animate-hp-flash border-red-400' : ''}`}>
        <Heart className={`w-4 h-4 md:w-5 md:h-5 fill-current ${playerHit ? 'animate-pulse' : ''}`} /> {hp}
      </div>
      <div className={`flex items-center gap-2 font-pixel text-sm md:text-base text-pixel-block bg-black/50 px-2 py-1 pixel-border border-2 border-blue-800 transition-all ${playerBlocking ? 'animate-block-gain' : ''}`}>
        <Shield className="w-4 h-4 md:w-5 md:h-5 fill-current" /> {block}
      </div>
      <div className="flex items-center gap-2 font-pixel text-xs md:text-sm text-pixel-energy bg-black/50 px-2 py-1 pixel-border border-2 border-yellow-800">
        <div className="flex gap-0.5">
          {Array.from({ length: maxEnergy }).map((_, i) => (
            <div key={i} className={`w-2.5 h-2.5 md:w-3 md:h-3 pixel-border border border-yellow-600 ${i < energy ? 'bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,0.7)]' : 'bg-stone-800'}`} />
          ))}
        </div>
      </div>
      {/* Debuff Indicators */}
      <div className="flex flex-col gap-1 mt-2">
        {disarmed && (
          <div className="flex items-center gap-1 text-red-400 font-pixel text-[8px] bg-black/60 px-2 py-1 pixel-border border-2 border-red-600">
            <Ban size={10} /> DISARM
          </div>
        )}
        {costLimit !== null && (
          <div className="flex items-center gap-1 text-purple-400 font-pixel text-[8px] bg-black/60 px-2 py-1 pixel-border border-2 border-purple-600">
            <Lock size={10} /> LIMIT:{costLimit}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerHUD;
