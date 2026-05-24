import React from 'react';
import { ArrowRight, Coins, Droplets, Gem, Hammer, Heart, Skull } from 'lucide-react';
import { EventOption, GameEvent } from '@/types';

interface EventScreenProps {
  event: GameEvent;
  gold: number;
  hp: number;
  onSelectOption: (option: EventOption) => void;
}

const EVENT_ICONS: Record<string, React.ReactNode> = {
  droplets: <Droplets size={30} />,
  skull: <Skull size={30} />,
  gem: <Gem size={30} />,
  hammer: <Hammer size={30} />
};

const canPayOption = (option: EventOption, gold: number, hp: number): boolean => {
  if (!option.cost || !option.costResource) return true;
  if (option.costResource === 'GOLD') return gold >= option.cost;
  return hp > option.cost;
};

const costLabel = (option: EventOption): string | null => {
  if (!option.cost || !option.costResource) return null;
  return option.costResource === 'GOLD' ? `${option.cost} 골드` : `체력 ${option.cost}`;
};

const EventScreen: React.FC<EventScreenProps> = ({ event, gold, hp, onSelectOption }) => {
  return (
    <div className="w-full h-screen-safe flex flex-col bg-pixel-bg-dark text-stone-100 overflow-y-auto">
      <div className="p-4 md:p-6 bg-pixel-bg-mid pixel-border border-b-4 border-stone-700 flex justify-between items-center">
        <h2 className="text-lg md:text-xl font-pixel-kr font-bold flex items-center gap-2 text-cyan-300" style={{ textShadow: '0 0 10px rgba(103,232,249,0.45)' }}>
          {EVENT_ICONS[event.icon] || <Gem size={30} />} 사건
        </h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 pixel-border border-2 border-red-700">
            <Heart className="text-red-400" size={14} fill="currentColor" />
            <span className="font-pixel text-sm text-red-300">{hp}</span>
          </div>
          <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 pixel-border border-2 border-yellow-600">
            <Coins className="text-yellow-400" size={14} />
            <span className="font-pixel text-sm text-yellow-300">{gold}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-3xl">
          <div className="mb-8 text-center">
            <div className="inline-flex p-4 mb-5 pixel-border border-4 border-cyan-700 bg-cyan-950/40 text-cyan-300">
              {EVENT_ICONS[event.icon] || <Gem size={36} />}
            </div>
            <h3 className="font-pixel-kr text-2xl md:text-3xl text-cyan-200 mb-4">{event.title}</h3>
            <p className="font-pixel-kr text-sm md:text-base text-stone-300 leading-7">{event.description}</p>
          </div>

          <div className="grid gap-3">
            {event.options.map(option => {
              const payable = canPayOption(option, gold, hp);
              const cost = costLabel(option);

              return (
                <button
                  key={`${event.id}-${option.label}`}
                  onClick={() => onSelectOption(option)}
                  disabled={!payable}
                  className={`w-full p-4 pixel-border border-4 text-left transition-all active:translate-y-1
                    ${payable
                      ? 'bg-gradient-to-b from-stone-700 to-stone-800 border-stone-500 hover:border-cyan-400 hover:from-stone-600 hover:to-stone-700'
                      : 'bg-stone-900 border-stone-800 opacity-50 cursor-not-allowed'}`}
                  style={{ boxShadow: payable ? '0 4px 0 0 #1c1917' : 'none' }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-pixel-kr text-base font-bold text-stone-100 mb-1">{option.label}</div>
                      <div className="font-pixel-kr text-xs text-stone-400 leading-5">{option.description}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {cost && (
                        <span className={`font-pixel text-[10px] ${payable ? 'text-yellow-300' : 'text-red-400'}`}>
                          {cost}
                        </span>
                      )}
                      <ArrowRight size={16} className={payable ? 'text-cyan-300' : 'text-stone-600'} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventScreen;
