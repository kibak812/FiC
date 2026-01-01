import React from 'react';
import { createPortal } from 'react-dom';
import { Droplets, Activity, Flame, Star, Swords, Percent, ArrowLeft } from 'lucide-react';
import { STATUS_DESCRIPTIONS } from '@/utils/statusDescriptions';
import { EnemyStatus } from '@/types';

interface StatusDetailModalProps {
  statusKey: string;
  statusValue: number;
  onClose: () => void;
}

const StatusDetailModal: React.FC<StatusDetailModalProps> = ({ statusKey, statusValue, onClose }) => {
  const statusInfo = STATUS_DESCRIPTIONS[statusKey];
  
  if (!statusInfo) return null;

  const getStatusIcon = () => {
    switch (statusKey) {
      case 'poison':
        return <Droplets size={32} className={statusInfo.color} fill="currentColor" />;
      case 'bleed':
        return <Activity size={32} className={statusInfo.color} />;
      case 'burn':
        return <Flame size={32} className={statusInfo.color} />;
      case 'stunned':
        return <Star size={32} className={statusInfo.color} fill="currentColor" />;
      case 'strength':
        return <Swords size={32} className={statusInfo.color} />;
      case 'vulnerable':
        return <Percent size={32} className={statusInfo.color} />;
      case 'weak':
        return <ArrowLeft size={32} className={`${statusInfo.color} rotate-[-45deg]`} />;
      default:
        return null;
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85"
      onClick={onClose}
      onTouchStart={(e) => { e.preventDefault(); onClose(); }}
    >
      <div
        className={`relative p-5 max-w-xs w-[90%] pixel-border border-4 ${statusInfo.bgColor} ${statusInfo.borderColor}`}
        style={{ boxShadow: '6px 6px 0 0 rgba(0,0,0,0.6)' }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`pixel-border border-3 p-3 flex items-center justify-center ${statusInfo.bgColor} ${statusInfo.borderColor}`}>
            {getStatusIcon()}
          </div>
          <div>
            <h3 className="font-pixel-kr text-lg font-bold text-white" style={{ textShadow: '2px 2px 0 #000' }}>
              {statusInfo.name}
            </h3>
            {statusValue > 0 && (
              <p className="font-pixel text-xl text-yellow-300">
                {statusValue}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="bg-black/40 pixel-border border-2 border-black/50 p-3">
          <p className="font-pixel-kr text-sm text-stone-200 leading-relaxed">
            {statusInfo.description}
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

export default StatusDetailModal;
