import React, { useState } from 'react';
import { Store, Coins, Flame, Heart, Sparkles, Zap, ArrowLeft, X, Check } from 'lucide-react';
import { SHOP_ITEMS } from '@/constants';
import { ShopColorKey, ShopIconKey, ShopItemDefinition, ShopItemId } from '@/types';

const SHOP_ITEM_ICONS: Record<ShopIconKey, React.ReactNode> = {
  flame: <Flame size={28} />,
  heart: <Heart size={28} fill="currentColor" />,
  sparkles: <Sparkles size={28} />,
  zap: <Zap size={28} fill="currentColor" />
};

interface ShopScreenProps {
  gold: number;
  onBuyItem: (item: ShopItemId) => void;
  onExit: () => void;
}

const ShopScreen: React.FC<ShopScreenProps> = ({ gold, onBuyItem, onExit }) => {
  const [selectedItem, setSelectedItem] = useState<ShopItemDefinition | null>(null);

  const handleItemClick = (item: ShopItemDefinition) => {
    if (gold < item.price) return;
    setSelectedItem(item);
  };

  const handleConfirmPurchase = () => {
    if (selectedItem) {
      onBuyItem(selectedItem.id);
      setSelectedItem(null);
    }
  };

  const handleCancelPurchase = () => {
    setSelectedItem(null);
  };

  const getColorClasses = (color: ShopColorKey, type: 'border' | 'bg' | 'text') => {
    const colors: Record<ShopColorKey, Record<string, string>> = {
      red: { border: 'border-red-500', bg: 'bg-red-900/40', text: 'text-red-400' },
      green: { border: 'border-green-500', bg: 'bg-green-900/40', text: 'text-green-400' },
      purple: { border: 'border-purple-500', bg: 'bg-purple-900/40', text: 'text-purple-400' },
      yellow: { border: 'border-yellow-400', bg: 'bg-yellow-900/40', text: 'text-yellow-400' },
    };
    return colors[color]?.[type] || '';
  };

  return (
    <div className="w-full h-screen-safe flex flex-col bg-pixel-bg-dark text-stone-100">
      {/* Confirmation Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-gradient-to-b from-stone-700 to-stone-800 pixel-border border-4 border-stone-500 p-6 max-w-sm w-full mx-4"
               style={{ boxShadow: '0 8px 0 0 #1c1917' }}>
            <h3 className="font-pixel-kr text-lg text-center mb-4 text-yellow-400">구매 확인</h3>
            
            <div className="flex flex-col items-center gap-3 mb-6">
              <div className={`p-3 pixel-border border-2 ${getColorClasses(selectedItem.color, 'bg')} ${getColorClasses(selectedItem.color, 'border')}`}>
                <div className={getColorClasses(selectedItem.color, 'text')}>
                  {SHOP_ITEM_ICONS[selectedItem.icon]}
                </div>
              </div>
              <div className="text-center">
                <div className="font-pixel-kr font-bold text-base">{selectedItem.name}</div>
                <div className="font-pixel-kr text-xs text-stone-400 mt-1">{selectedItem.description}</div>
              </div>
              <div className="flex items-center gap-2 bg-black/40 px-4 py-2 pixel-border border-2 border-yellow-600">
                <Coins className="text-yellow-400" size={16} />
                <span className="font-pixel-kr text-sm text-yellow-300">{selectedItem.price} 골드</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelPurchase}
                className="flex-1 px-4 py-3
                  bg-gradient-to-b from-stone-600 to-stone-700
                  pixel-border border-4 border-stone-500
                  font-pixel-kr text-sm font-bold text-stone-300
                  hover:from-stone-500 hover:to-stone-600
                  transition-all active:translate-y-1
                  flex items-center justify-center gap-2"
                style={{ boxShadow: '0 4px 0 0 #1c1917' }}
              >
                <X size={16} /> 취소
              </button>
              <button
                onClick={handleConfirmPurchase}
                className="flex-1 px-4 py-3
                  bg-gradient-to-b from-green-600 to-green-700
                  pixel-border border-4 border-green-500
                  font-pixel-kr text-sm font-bold text-white
                  hover:from-green-500 hover:to-green-600
                  transition-all active:translate-y-1
                  flex items-center justify-center gap-2"
                style={{ boxShadow: '0 4px 0 0 #14532d' }}
              >
                <Check size={16} /> 구매
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 md:p-6 bg-pixel-bg-mid pixel-border border-b-4 border-stone-700 flex justify-between items-center">
        <h2 className="text-lg md:text-xl font-pixel-kr font-bold flex items-center gap-2 text-yellow-400" style={{ textShadow: '0 0 10px rgba(250,204,21,0.5)' }}>
          <Store size={20} /> 암시장
        </h2>
        <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 pixel-border border-2 border-yellow-600">
          <Coins className="text-yellow-400" size={14} />
          <span className="font-pixel text-sm text-yellow-300">{gold}</span>
        </div>
      </div>

      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {SHOP_ITEMS.map(item => {
            const canAfford = gold >= item.price;

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`aspect-square bg-gradient-to-b from-stone-700 to-stone-800
                  pixel-border border-4 border-stone-600
                  flex flex-col items-center justify-center p-2
                  transition-all group relative overflow-hidden active:translate-y-1
                  ${canAfford ? 'hover:from-stone-600 hover:to-stone-700 cursor-pointer' : 'opacity-50 cursor-not-allowed'}
                  ${item.color === 'red' && canAfford ? 'hover:border-red-500' : ''}
                  ${item.color === 'green' && canAfford ? 'hover:border-green-500' : ''}
                  ${item.color === 'purple' && canAfford ? 'hover:border-purple-500' : ''}
                  ${item.color === 'yellow' && canAfford ? 'hover:border-yellow-400' : ''}`}
                style={{ boxShadow: '0 4px 0 0 #1c1917' }}
                disabled={!canAfford}
              >
                {item.id === 'ENERGY' && (
                  <div className="absolute top-0 right-0 bg-yellow-600 font-pixel text-[7px] px-1.5 py-0.5 text-white pixel-border border-l-2 border-b-2 border-yellow-400">
                    1회
                  </div>
                )}
                <div className={`p-2 pixel-border border-2 mb-2 ${getColorClasses(item.color, 'bg')} ${getColorClasses(item.color, 'border')} ${getColorClasses(item.color, 'text')}`}>
                  {SHOP_ITEM_ICONS[item.icon]}
                </div>
                <div className="font-pixel-kr text-xs font-bold">{item.name}</div>
                <div className="text-[8px] text-stone-400 font-pixel-kr text-center mb-1">{item.description}</div>
                <div className={`font-pixel text-xs ${canAfford ? 'text-yellow-400' : 'text-red-500'}`}>
                  {item.price} 골드
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 pixel-border border-t-4 border-stone-700 flex justify-end bg-pixel-bg-mid">
        <button
          onClick={onExit}
          className="px-5 py-2.5
            bg-gradient-to-b from-stone-600 to-stone-700
            pixel-border border-4 border-stone-500
            font-pixel-kr text-sm font-bold text-stone-200
            hover:from-stone-500 hover:to-stone-600
            transition-all active:translate-y-1
            flex items-center gap-2"
          style={{ boxShadow: '0 4px 0 0 #1c1917' }}
        >
          <ArrowLeft size={16} /> 나가기
        </button>
      </div>
    </div>
  );
};

export default ShopScreen;
