import React from 'react';
import { Crown, Flame, Skull, Sparkles, Store, Swords, Tent, Coins, Heart } from 'lucide-react';
import { MapNode, NodeType } from '@/types';

interface MapScreenProps {
  act: number;
  floor: number;
  gold: number;
  hp: number;
  maxHp: number;
  nodes: MapNode[];
  completedNodeIds: string[];
  availableNodeIds: string[];
  onSelectNode: (node: MapNode) => void;
}

const NODE_ICONS: Record<NodeType, React.ReactNode> = {
  [NodeType.COMBAT]: <Swords size={22} />,
  [NodeType.ELITE]: <Skull size={22} />,
  [NodeType.REST]: <Tent size={22} />,
  [NodeType.SHOP]: <Store size={22} />,
  [NodeType.EVENT]: <Sparkles size={22} />,
  [NodeType.BOSS]: <Crown size={22} />
};

const NODE_CLASSES: Record<NodeType, { border: string; text: string; bg: string; hover: string }> = {
  [NodeType.COMBAT]: {
    border: 'border-stone-500',
    text: 'text-stone-100',
    bg: 'from-stone-700 to-stone-800',
    hover: 'hover:border-red-400'
  },
  [NodeType.ELITE]: {
    border: 'border-red-700',
    text: 'text-red-300',
    bg: 'from-red-950 to-stone-900',
    hover: 'hover:border-red-400'
  },
  [NodeType.REST]: {
    border: 'border-green-700',
    text: 'text-green-300',
    bg: 'from-green-950 to-stone-900',
    hover: 'hover:border-green-400'
  },
  [NodeType.SHOP]: {
    border: 'border-yellow-700',
    text: 'text-yellow-300',
    bg: 'from-yellow-950 to-stone-900',
    hover: 'hover:border-yellow-400'
  },
  [NodeType.EVENT]: {
    border: 'border-cyan-700',
    text: 'text-cyan-300',
    bg: 'from-cyan-950 to-stone-900',
    hover: 'hover:border-cyan-400'
  },
  [NodeType.BOSS]: {
    border: 'border-purple-700',
    text: 'text-purple-300',
    bg: 'from-purple-950 to-stone-950',
    hover: 'hover:border-purple-400'
  }
};

const MapScreen: React.FC<MapScreenProps> = ({
  act,
  floor,
  gold,
  hp,
  maxHp,
  nodes,
  completedNodeIds,
  availableNodeIds,
  onSelectNode
}) => {
  const floors = Array.from(new Set<number>(nodes.map(node => node.floor))).sort((a, b) => a - b);

  return (
    <div className="w-full h-screen-safe flex flex-col bg-pixel-bg-dark text-stone-100 overflow-hidden">
      <div className="p-4 md:p-5 bg-pixel-bg-mid pixel-border border-b-4 border-stone-700 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg md:text-xl font-pixel text-orange-400" style={{ textShadow: '0 0 10px rgba(251,146,60,0.45)' }}>
            ACT {act} MAP
          </h2>
          <p className="font-pixel-kr text-xs text-stone-400 mt-1">현재 층 {floor}</p>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex items-center gap-2 bg-black/60 px-2.5 py-1.5 pixel-border border-2 border-red-700">
            <Heart className="text-red-400" size={14} fill="currentColor" />
            <span className="font-pixel text-[11px] text-red-300">{hp}/{maxHp}</span>
          </div>
          <div className="flex items-center gap-2 bg-black/60 px-2.5 py-1.5 pixel-border border-2 border-yellow-600">
            <Coins className="text-yellow-400" size={14} />
            <span className="font-pixel text-[11px] text-yellow-300">{gold}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="min-w-max h-full flex items-center justify-start">
          <div className="flex items-center gap-5">
            {floors.map(mapFloor => {
              const floorNodes = nodes.filter(node => node.floor === mapFloor);

              return (
                <div key={mapFloor} className="flex flex-col items-center gap-4">
                  <div className="font-pixel text-[9px] text-stone-500">F{mapFloor}</div>
                  <div className="flex flex-col gap-4 justify-center min-h-[210px]">
                    {floorNodes.map(node => {
                      const available = availableNodeIds.includes(node.id);
                      const completed = completedNodeIds.includes(node.id);
                      const styles = NODE_CLASSES[node.type];

                      return (
                        <button
                          key={node.id}
                          onClick={() => onSelectNode(node)}
                          disabled={!available}
                          title={node.description}
                          className={`w-20 h-20 pixel-border border-4 flex flex-col items-center justify-center gap-1 transition-all
                            bg-gradient-to-b ${styles.bg} ${styles.border} ${styles.text}
                            ${available ? `${styles.hover} hover:-translate-y-1 cursor-pointer` : 'opacity-40 cursor-not-allowed'}
                            ${completed ? 'opacity-80 grayscale' : ''}`}
                          style={{ boxShadow: available ? '0 4px 0 0 #1c1917' : 'none' }}
                        >
                          {completed ? <Flame size={22} /> : NODE_ICONS[node.type]}
                          <span className="font-pixel-kr text-[10px] leading-none">{node.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapScreen;
