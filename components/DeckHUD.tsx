import React from 'react';
import { Layers, Archive } from 'lucide-react';

interface DeckHUDProps {
  deckCount: number;
  discardCount: number;
}

const DeckHUD: React.FC<DeckHUDProps> = ({ deckCount, discardCount }) => {
  return (
    <div className="absolute right-2 top-2 md:right-4 md:top-4 flex flex-col gap-1 md:gap-2 z-20 pointer-events-none items-end">
      <div className="flex items-center gap-2 text-stone-300 font-pixel text-[9px] md:text-[10px] bg-black/60 px-2 py-1 pixel-border border-2 border-stone-600">
        <Layers size={12} />
        <span>DECK</span>
        <span className="text-white">{deckCount}</span>
      </div>
      <div className="flex items-center gap-2 text-stone-400 font-pixel text-[9px] md:text-[10px] bg-black/60 px-2 py-1 pixel-border border-2 border-stone-700">
        <Archive size={12} />
        <span>DISC</span>
        <span className="text-stone-300">{discardCount}</span>
      </div>
    </div>
  );
};

export default DeckHUD;
