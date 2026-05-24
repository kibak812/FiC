import React from 'react';
import { createPortal } from 'react-dom';
import { Activity, ArrowLeft, Droplets, Flame, Hammer, Percent, Shield, Skull, Sparkles, Star, Swords, X, Zap } from 'lucide-react';
import { IntentType } from '@/types';
import { STATUS_DESCRIPTIONS } from '@/utils/statusDescriptions';

interface CombatHelpModalProps {
  onClose: () => void;
}

const statusIcons: Record<string, React.ReactNode> = {
  poison: <Droplets size={16} className="text-green-300" fill="currentColor" />,
  bleed: <Activity size={16} className="text-red-300" />,
  burn: <Flame size={16} className="text-orange-300" />,
  stunned: <Star size={16} className="text-yellow-300" fill="currentColor" />,
  strength: <Swords size={16} className="text-red-300" />,
  vulnerable: <Percent size={16} className="text-purple-300" />,
  weak: <ArrowLeft size={16} className="text-stone-300 rotate-[-45deg]" />
};

const intentRows = [
  { type: IntentType.ATTACK, icon: <Skull size={16} className="text-red-300" />, name: '공격', text: '표시된 수치만큼 피해를 줍니다. 방어도로 먼저 막습니다.' },
  { type: IntentType.DEFEND, icon: <Shield size={16} className="text-blue-300" />, name: '방어', text: '적이 방어도를 얻습니다. 다음 공격 전에 방어도를 깎아야 합니다.' },
  { type: IntentType.BUFF, icon: <Swords size={16} className="text-green-300" />, name: '강화', text: '힘, 회복, 상태 정화처럼 적 자신을 유리하게 만듭니다.' },
  { type: IntentType.DEBUFF, icon: <Zap size={16} className="text-purple-300" />, name: '방해', text: '카드 오염, 비용 제한, 손잡이 비용 증가 같은 압박을 줍니다.' }
];

const CombatHelpModal: React.FC<CombatHelpModalProps> = ({ onClose }) => {
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 px-3" onClick={onClose}>
      <div
        className="w-full max-w-2xl max-h-[88vh] overflow-y-auto pixel-border border-4 border-cyan-500 bg-gradient-to-b from-stone-800 to-stone-950 p-4 md:p-5"
        style={{ boxShadow: '0 8px 0 0 #164e63' }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <p className="font-pixel-kr text-xs text-cyan-300 mb-1">도움말</p>
            <h3 className="font-pixel-kr text-xl text-white font-bold">전투 사전</h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 pixel-border border-2 border-stone-500 bg-black/50 text-stone-300 flex items-center justify-center"
            aria-label="전투 사전 닫기"
          >
            <X size={18} />
          </button>
        </div>

        <section className="mb-5">
          <h4 className="font-pixel-kr text-sm text-orange-300 mb-2 flex items-center gap-2">
            <Hammer size={16} /> 카드 타입
          </h4>
          <div className="grid md:grid-cols-3 gap-2">
            <div className="pixel-border border-2 border-amber-600 bg-amber-950/40 p-3">
              <p className="font-pixel-kr text-sm text-amber-200 mb-1">손잡이</p>
              <p className="font-pixel-kr text-xs text-stone-300 leading-relaxed">배율, 비용, 특수 효과를 정합니다.</p>
            </div>
            <div className="pixel-border border-2 border-red-600 bg-red-950/40 p-3">
              <p className="font-pixel-kr text-sm text-red-200 mb-1">머리</p>
              <p className="font-pixel-kr text-xs text-stone-300 leading-relaxed">피해, 방어, 공격 횟수의 중심입니다.</p>
            </div>
            <div className="pixel-border border-2 border-blue-600 bg-blue-950/40 p-3">
              <p className="font-pixel-kr text-sm text-blue-200 mb-1">장식</p>
              <p className="font-pixel-kr text-xs text-stone-300 leading-relaxed">상태이상, 드로우, 에너지, 보너스를 더합니다.</p>
            </div>
          </div>
        </section>

        <section className="mb-5">
          <h4 className="font-pixel-kr text-sm text-cyan-300 mb-2 flex items-center gap-2">
            <Sparkles size={16} /> 적 의도
          </h4>
          <div className="space-y-2">
            {intentRows.map(row => (
              <div key={row.type} className="flex gap-2 pixel-border border-2 border-stone-600 bg-black/35 p-2">
                <div className="w-8 h-8 pixel-border border-2 border-stone-600 bg-stone-900 flex items-center justify-center flex-shrink-0">
                  {row.icon}
                </div>
                <div>
                  <p className="font-pixel-kr text-xs text-white mb-0.5">{row.name}</p>
                  <p className="font-pixel-kr text-[11px] text-stone-300 leading-relaxed">{row.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h4 className="font-pixel-kr text-sm text-green-300 mb-2 flex items-center gap-2">
            <Droplets size={16} /> 상태이상
          </h4>
          <div className="grid md:grid-cols-2 gap-2">
            {Object.entries(STATUS_DESCRIPTIONS).map(([key, status]) => (
              <div key={key} className={`pixel-border border-2 ${status.borderColor} ${status.bgColor} p-2`}>
                <div className="flex items-center gap-2 mb-1">
                  {statusIcons[key]}
                  <p className="font-pixel-kr text-xs text-white">{status.name}</p>
                </div>
                <p className="font-pixel-kr text-[11px] text-stone-200 leading-relaxed">{status.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>,
    document.body
  );
};

export default CombatHelpModal;
