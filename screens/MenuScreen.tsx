import React from 'react';
import { Check, Play, RotateCcw, Settings, X } from 'lucide-react';
import type { GameSettings } from '@/types';
import type { SavedRunSummary } from '@/utils/saveUtils';

interface MenuScreenProps {
  onStartGame: () => void;
  onContinueRun: () => void;
  savedRunSummary: SavedRunSummary | null;
  settings: GameSettings;
  onSettingsChange: (settings: GameSettings) => void;
}

const MenuScreen: React.FC<MenuScreenProps> = ({
  onStartGame,
  onContinueRun,
  savedRunSummary,
  settings,
  onSettingsChange
}) => {
  const [showNewRunConfirm, setShowNewRunConfirm] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);

  const hasSavedRun = Boolean(savedRunSummary);
  const savedAtLabel = savedRunSummary
    ? new Date(savedRunSummary.savedAt).toLocaleString('ko-KR', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    : '';

  const requestStartGame = () => {
    if (hasSavedRun) {
      setShowNewRunConfirm(true);
      return;
    }
    onStartGame();
  };

  const confirmStartGame = () => {
    setShowNewRunConfirm(false);
    onStartGame();
  };

  const updateSetting = (key: keyof GameSettings, value: boolean) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="w-full h-screen-safe flex flex-col items-center justify-center bg-pixel-bg-dark text-stone-100 px-4 text-center relative overflow-hidden">
      {showNewRunConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="w-full max-w-sm bg-gradient-to-b from-stone-700 to-stone-800 pixel-border border-4 border-orange-500 p-5"
               style={{ boxShadow: '0 8px 0 0 #7c2d12' }}>
            <h3 className="font-pixel-kr text-lg text-orange-300 mb-3">새 런 시작</h3>
            <p className="font-pixel-kr text-sm text-stone-300 mb-5 leading-relaxed">
              저장된 런을 삭제하고 처음부터 시작할까요?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowNewRunConfirm(false)}
                className="flex-1 px-4 py-3 pixel-border border-4 border-stone-500 bg-gradient-to-b from-stone-600 to-stone-700 font-pixel-kr text-sm font-bold text-stone-200 flex items-center justify-center gap-2 active:translate-y-1"
                style={{ boxShadow: '0 4px 0 0 #1c1917' }}
              >
                <X size={16} /> 취소
              </button>
              <button
                onClick={confirmStartGame}
                className="flex-1 px-4 py-3 pixel-border border-4 border-red-500 bg-gradient-to-b from-red-600 to-red-800 font-pixel-kr text-sm font-bold text-white flex items-center justify-center gap-2 active:translate-y-1"
                style={{ boxShadow: '0 4px 0 0 #7f1d1d' }}
              >
                <Check size={16} /> 시작
              </button>
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="w-full max-w-sm bg-gradient-to-b from-stone-700 to-stone-800 pixel-border border-4 border-stone-500 p-5"
               style={{ boxShadow: '0 8px 0 0 #1c1917' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-pixel-kr text-lg text-stone-100">설정</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="w-9 h-9 pixel-border border-2 border-stone-500 bg-stone-800 flex items-center justify-center text-stone-300"
                aria-label="설정 닫기"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => updateSetting('animationsEnabled', !settings.animationsEnabled)}
                className="w-full px-4 py-3 pixel-border border-2 border-stone-500 bg-black/40 flex items-center justify-between font-pixel-kr text-sm"
              >
                <span>전투 애니메이션</span>
                <span className={`px-3 py-1 pixel-border border-2 font-pixel text-[10px] ${settings.animationsEnabled ? 'border-green-500 bg-green-900/50 text-green-300' : 'border-stone-600 bg-stone-900 text-stone-500'}`}>
                  {settings.animationsEnabled ? 'ON' : 'OFF'}
                </span>
              </button>
              <button
                onClick={() => updateSetting('screenShake', !settings.screenShake)}
                className="w-full px-4 py-3 pixel-border border-2 border-stone-500 bg-black/40 flex items-center justify-between font-pixel-kr text-sm"
              >
                <span>화면 흔들림</span>
                <span className={`px-3 py-1 pixel-border border-2 font-pixel text-[10px] ${settings.screenShake ? 'border-green-500 bg-green-900/50 text-green-300' : 'border-stone-600 bg-stone-900 text-stone-500'}`}>
                  {settings.screenShake ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animated Background Sparks */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-orange-500 animate-pulse opacity-50" />
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-yellow-500 animate-ping opacity-30" />
        <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-red-500 animate-pulse opacity-40" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-orange-400 animate-ping opacity-40" style={{ animationDelay: '1s' }} />
      </div>

      {/* Forge Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-orange-600/20 blur-3xl pointer-events-none" />

      {/* Title */}
      <h1 className="font-pixel text-2xl md:text-4xl mb-2 text-orange-500 animate-pulse"
          style={{ textShadow: '4px 4px 0 #7c2d12, 0 0 20px rgba(249,115,22,0.5)' }}>
        FORGED IN CHAOS
      </h1>
      <h2 className="font-pixel-kr text-3xl md:text-5xl font-bold mb-6 text-orange-400"
          style={{ textShadow: '3px 3px 0 #431407' }}>
        혼돈의 대장간
      </h2>

      <p className="mb-6 text-base md:text-lg text-stone-400 font-pixel-kr">
        무기를 직접 제작하여 던전에서 살아남으세요.
      </p>

      <div className="flex flex-col items-center gap-3">
        {savedRunSummary && (
          <div className="pixel-border border-2 border-stone-700 bg-black/50 px-4 py-2 font-pixel-kr text-xs text-stone-300">
            Act {savedRunSummary.act} - {savedRunSummary.floor}F · {savedRunSummary.hp}/{savedRunSummary.maxHp} HP · {savedRunSummary.gold} G · {savedAtLabel}
          </div>
        )}

        {savedRunSummary && (
          <button
            onClick={onContinueRun}
            className="
              px-8 md:px-12 py-3 md:py-4
              pixel-border border-4 border-green-400
              bg-gradient-to-b from-green-500 to-green-700
              font-pixel-kr text-lg md:text-xl font-bold text-white
              hover:from-green-400 hover:to-green-600
              active:translate-y-1
              transition-all flex items-center gap-3
            "
            style={{
              boxShadow: '0 6px 0 0 #166534, 0 8px 10px rgba(0,0,0,0.5)',
            }}
          >
            <Play size={20} fill="currentColor" /> 이어하기
          </button>
        )}

        <button
          onClick={requestStartGame}
          className="
            px-8 md:px-12 py-3 md:py-4
            pixel-border border-4 border-orange-400
            bg-gradient-to-b from-orange-500 to-orange-700
            font-pixel-kr text-lg md:text-xl font-bold text-white
            hover:from-orange-400 hover:to-orange-600
            active:translate-y-1
            transition-all flex items-center gap-3
          "
          style={{
            boxShadow: '0 6px 0 0 #9a3412, 0 8px 10px rgba(0,0,0,0.5)',
          }}
        >
          {savedRunSummary ? <RotateCcw size={20} /> : <Play size={20} fill="currentColor" />} {savedRunSummary ? '새 런' : '대장간 입장'}
        </button>

        <button
          onClick={() => setShowSettings(true)}
          className="mt-1 px-5 py-2 pixel-border border-2 border-stone-600 bg-black/40 font-pixel-kr text-sm text-stone-300 hover:border-stone-400 flex items-center gap-2"
        >
          <Settings size={16} /> 설정
        </button>
      </div>

      {/* Version */}
      <div className="absolute bottom-4 right-4 text-xs text-stone-600 font-pixel">
        v1.8.0
      </div>
    </div>
  );
};

export default MenuScreen;
