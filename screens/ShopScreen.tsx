import React, { useState } from 'react';
import { Store, Coins, Flame, Heart, Sparkles, Zap, ArrowLeft, X, Check } from 'lucide-react';

export type ShopItem = 'HEAL' | 'REMOVE' | 'RARE' | 'ENERGY';

interface ShopItemInfo {
  id: ShopItem;
  name: string;
  desc: string;
  price: number;
  icon: React.ReactNode;
  color: string;
}

const SHOP_ITEMS: ShopItemInfo[] = [
  { id: 'REMOVE', name: '카드 정화', desc: '카드 1장 제거', price: 50, icon: <Flame size={28} />, color: 'red' },
  { id: 'HEAL', name: '긴급 수리', desc: '체력 50% 회복', price: 40, icon: <Heart size={28} fill="currentColor" />, color: 'green' },
  { id: 'RARE', name: '희귀 도면', desc: '무작위 희귀 카드', price: 75, icon: <Sparkles size={28} />, color: 'purple' },
  { id: 'ENERGY', name: '마나 수정', desc: '최대 에너지 +1', price: 200, icon: <Zap size={28} fill="currentColor" />, color: 'yellow' },
];

interface ShopScreenProps {
  gold: number;
  onBuyItem: (item: ShopItem) => void;
  onExit: () => void;
}

const ShopScreen: React.FC<ShopScreenProps> = ({ gold, onBuyItem, onExit }) => {
  const [selectedItem, setSelectedItem] = useState<ShopItemInfo | null>(null);

  const handleItemClick = (item: ShopItemInfo) => {
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

  const getColorClasses = (color: string, type: 'border' | 'bg' | 'text') => {
    const colors: Record<string, Record<string, string>> = {
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
                  {selectedItem.icon}
                </div>
              </div>
              <div className="text-center">
                <div className="font-pixel-kr font-bold text-base">{selectedItem.name}</div>
                <div className="font-pixel-kr text-xs text-stone-400 mt-1">{selectedItem.desc}</div>
              </div>
              <div className="flex items-center gap-2 bg-black/40 px-4 py-2 pixel-border border-2 border-yellow-600">
                <Coins className="text-yellow-400" size={16} />
                <span className="font-pixel text-base text-yellow-300">{selectedItem.price} G</span>
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
        <h2 className="text-lg md:text-xl font-pixel flex items-center gap-2 text-yellow-400" style={{ textShadow: '0 0 10px rgba(250,204,21,0.5)' }}>
          <Store size={20} /> BLACK MARKET
        </h2>
        <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 pixel-border border-2 border-yellow-600">
          <Coins className="text-yellow-400" size={14} />
          <span className="font-pixel text-sm text-yellow-300">{gold}</span>
        </div>
      </div>

      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {/* Card Removal */}
          <button
            onClick={() => handleItemClick(SHOP_ITEMS[0])}
            className={`aspect-square bg-gradient-to-b from-stone-700 to-stone-800
              pixel-border border-4 border-stone-600
              flex flex-col items-center justify-center p-2
              transition-all group active:translate-y-1
              ${gold >= 50 ? 'hover:border-red-500 hover:from-stone-600 hover:to-stone-700 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
            style={{ boxShadow: '0 4px 0 0 #1c1917' }}
            disabled={gold < 50}
          >
            <div className="p-2 pixel-border border-2 bg-red-900/40 border-red-700 mb-2 group-hover:bg-red-800/50">
              <Flame size={28} className="text-red-400 group-hover:text-red-300 transition-colors" />
            </div>
            <div className="font-pixel-kr text-xs font-bold">카드 정화</div>
            <div className="text-[8px] text-stone-400 font-pixel-kr text-center mb-1">카드 1장 제거</div>
            <div className={`font-pixel text-xs ${gold >= 50 ? 'text-yellow-400' : 'text-red-500'}`}>50 G</div>
          </button>

          {/* Heal */}
          <button
            onClick={() => handleItemClick(SHOP_ITEMS[1])}
            className={`aspect-square bg-gradient-to-b from-stone-700 to-stone-800
              pixel-border border-4 border-stone-600
              flex flex-col items-center justify-center p-2
              transition-all group active:translate-y-1
              ${gold >= 40 ? 'hover:border-green-500 hover:from-stone-600 hover:to-stone-700 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
            style={{ boxShadow: '0 4px 0 0 #1c1917' }}
            disabled={gold < 40}
          >
            <div className="p-2 pixel-border border-2 bg-green-900/40 border-green-700 mb-2 group-hover:bg-green-800/50">
              <Heart size={28} className="text-green-400 group-hover:text-green-300 transition-colors" fill="currentColor" />
            </div>
            <div className="font-pixel-kr text-xs font-bold">긴급 수리</div>
            <div className="text-[8px] text-stone-400 font-pixel-kr text-center mb-1">체력 50% 회복</div>
            <div className={`font-pixel text-xs ${gold >= 40 ? 'text-yellow-400' : 'text-red-500'}`}>40 G</div>
          </button>

          {/* Rare Card */}
          <button
            onClick={() => handleItemClick(SHOP_ITEMS[2])}
            className={`aspect-square bg-gradient-to-b from-stone-700 to-stone-800
              pixel-border border-4 border-stone-600
              flex flex-col items-center justify-center p-2
              transition-all group active:translate-y-1
              ${gold >= 75 ? 'hover:border-purple-500 hover:from-stone-600 hover:to-stone-700 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
            style={{ boxShadow: '0 4px 0 0 #1c1917' }}
            disabled={gold < 75}
          >
            <div className="p-2 pixel-border border-2 bg-purple-900/40 border-purple-700 mb-2 group-hover:bg-purple-800/50">
              <Sparkles size={28} className="text-purple-400 group-hover:text-purple-300 transition-colors" />
            </div>
            <div className="font-pixel-kr text-xs font-bold">희귀 도면</div>
            <div className="text-[8px] text-stone-400 font-pixel-kr text-center mb-1">무작위 희귀</div>
            <div className={`font-pixel text-xs ${gold >= 75 ? 'text-yellow-400' : 'text-red-500'}`}>75 G</div>
          </button>

          {/* Max Energy (Expensive) */}
          <button
            onClick={() => handleItemClick(SHOP_ITEMS[3])}
            className={`aspect-square bg-gradient-to-b from-stone-700 to-stone-800
              pixel-border border-4 border-stone-600
              flex flex-col items-center justify-center p-2
              transition-all group relative overflow-hidden active:translate-y-1
              ${gold >= 200 ? 'hover:border-yellow-400 hover:from-stone-600 hover:to-stone-700 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
            style={{ boxShadow: '0 4px 0 0 #1c1917' }}
            disabled={gold < 200}
          >
            <div className="absolute top-0 right-0 bg-yellow-600 font-pixel text-[7px] px-1.5 py-0.5 text-white pixel-border border-l-2 border-b-2 border-yellow-400">LIMITED</div>
            <div className="p-2 pixel-border border-2 bg-yellow-900/40 border-yellow-700 mb-2 group-hover:bg-yellow-800/50">
              <Zap size={28} className="text-yellow-400 group-hover:text-yellow-300 transition-colors" fill="currentColor" />
            </div>
            <div className="font-pixel-kr text-xs font-bold">마나 수정</div>
            <div className="text-[8px] text-stone-400 font-pixel-kr text-center mb-1">에너지 +1</div>
            <div className={`font-pixel text-xs ${gold >= 200 ? 'text-yellow-400' : 'text-red-500'}`}>200 G</div>
          </button>
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
