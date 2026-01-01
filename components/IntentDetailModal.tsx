import React from 'react';
import { createPortal } from 'react-dom';
import { Shield, Zap, RefreshCw, Skull } from 'lucide-react';
import { EnemyIntent, IntentType } from '@/types';

interface IntentDetailModalProps {
  intent: EnemyIntent;
  onClose: () => void;
}

const IntentDetailModal: React.FC<IntentDetailModalProps> = ({ intent, onClose }) => {
  const getIntentStyles = () => {
    switch (intent.type) {
      case IntentType.ATTACK:
        return { bg: 'bg-red-900', border: 'border-red-500', headerBg: 'bg-red-800', headerBorder: 'border-red-400' };
      case IntentType.BUFF:
        return { bg: 'bg-green-900', border: 'border-green-500', headerBg: 'bg-green-800', headerBorder: 'border-green-400' };
      case IntentType.DEBUFF:
        return { bg: 'bg-purple-900', border: 'border-purple-500', headerBg: 'bg-purple-800', headerBorder: 'border-purple-400' };
      case IntentType.DEFEND:
        return { bg: 'bg-blue-900', border: 'border-blue-500', headerBg: 'bg-blue-800', headerBorder: 'border-blue-400' };
      default:
        return { bg: 'bg-stone-800', border: 'border-stone-500', headerBg: 'bg-stone-700', headerBorder: 'border-stone-400' };
    }
  };

  const getIntentIcon = () => {
    switch (intent.type) {
      case IntentType.ATTACK:
        return <Skull size={32} className="text-red-300" />;
      case IntentType.BUFF:
        return <RefreshCw size={32} className="text-green-300" />;
      case IntentType.DEBUFF:
        return <Zap size={32} className="text-purple-300" />;
      default:
        return <Shield size={32} className="text-blue-300" />;
    }
  };

  const getIntentName = () => {
    switch (intent.type) {
      case IntentType.ATTACK:
        return '\uACF5\uACA9'; // 공격
      case IntentType.DEFEND:
        return '\uBC29\uC5B4'; // 방어
      case IntentType.BUFF:
        return '\uAC15\uD654'; // 강화
      case IntentType.DEBUFF:
        return '\uC57D\uD654'; // 약화
      default:
        return '\uD2B9\uC218'; // 특수
    }
  };

  const styles = getIntentStyles();

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85"
      onClick={onClose}
      onTouchStart={(e) => { e.preventDefault(); onClose(); }}
    >
      <div
        className={`relative p-5 max-w-xs w-[90%] pixel-border border-4 ${styles.bg} ${styles.border}`}
        style={{ boxShadow: '6px 6px 0 0 rgba(0,0,0,0.6)' }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`pixel-border border-3 p-3 flex items-center justify-center ${styles.headerBg} ${styles.headerBorder}`}>
            {getIntentIcon()}
          </div>
          <div>
            <h3 className="font-pixel-kr text-lg font-bold text-white" style={{ textShadow: '2px 2px 0 #000' }}>
              {getIntentName()}
            </h3>
            {intent.value > 0 && (
              <p className="font-pixel text-xl text-yellow-300">
                {intent.value}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="bg-black/40 pixel-border border-2 border-black/50 p-3">
          <p className="font-pixel-kr text-sm text-stone-200 leading-relaxed">
            {intent.description}
          </p>
        </div>

        {/* Close hint */}
        <p className="text-center mt-4 text-[10px] font-pixel-kr text-stone-400">
          {'\uD654\uBA74\uC744 \uD130\uCE58\uD558\uC5EC \uB2EB\uAE30'}
        </p>
      </div>
    </div>,
    document.body
  );
};

export default IntentDetailModal;
