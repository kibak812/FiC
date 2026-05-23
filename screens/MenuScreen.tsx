import React from 'react';
import { Check, Contrast, Music, Play, RotateCcw, Settings, Type, Volume2, VolumeX, X, ZapOff } from 'lucide-react';
import type { GameSettings } from '@/types';
import type { SavedRunSummary } from '@/utils/saveUtils';

interface MenuScreenProps {
  onStartGame: () => void;
  onContinueRun: () => void;
  savedRunSummary: SavedRunSummary | null;
  settings: GameSettings;
  onSettingsChange: (settings: GameSettings) => void;
}

interface SettingsToggleProps {
  label: string;
  active: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
  accent?: 'green' | 'orange' | 'cyan';
}

interface SettingsSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const toggleAccentClasses = {
  green: 'border-green-500 bg-green-900/50 text-green-300',
  orange: 'border-orange-500 bg-orange-900/50 text-orange-200',
  cyan: 'border-cyan-500 bg-cyan-900/50 text-cyan-200'
};

const SettingsToggle: React.FC<SettingsToggleProps> = ({
  label,
  active,
  onToggle,
  icon,
  accent = 'green'
}) => (
  <button
    onClick={onToggle}
    className="w-full px-4 py-3 pixel-border border-2 border-stone-500 bg-black/40 flex items-center justify-between gap-3 font-pixel-kr text-sm"
    aria-pressed={active}
  >
    <span className="flex items-center gap-2 text-left">
      {icon}
      {label}
    </span>
    <span className={`px-3 py-1 pixel-border border-2 font-pixel text-[10px] ${active ? toggleAccentClasses[accent] : 'border-stone-600 bg-stone-900 text-stone-500'}`}>
      {active ? 'ON' : 'OFF'}
    </span>
  </button>
);

const SettingsSlider: React.FC<SettingsSliderProps> = ({ label, value, onChange, disabled }) => (
  <label className={`block w-full px-4 py-3 pixel-border border-2 border-stone-500 bg-black/40 font-pixel-kr text-sm ${disabled ? 'opacity-50' : ''}`}>
    <span className="flex items-center justify-between gap-3 mb-2">
      <span>{label}</span>
      <span className="font-pixel text-[10px] text-stone-300">{Math.round(value * 100)}%</span>
    </span>
    <input
      type="range"
      min="0"
      max="1"
      step="0.05"
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(Number(event.target.value))}
      className="w-full accent-orange-500"
      aria-label={label}
    />
  </label>
);

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

  const updateSetting = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
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
          <div className="w-full max-w-md max-h-[88vh] overflow-y-auto bg-gradient-to-b from-stone-700 to-stone-800 pixel-border border-4 border-stone-500 p-5"
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

            <div className="space-y-4">
              <div className="space-y-3">
                <p className="font-pixel-kr text-xs text-stone-400 text-left">표현</p>
                <SettingsToggle
                  label="전투 애니메이션"
                  active={settings.animationsEnabled}
                  onToggle={() => updateSetting('animationsEnabled', !settings.animationsEnabled)}
                  icon={<ZapOff size={16} className="text-stone-300" />}
                />
                <SettingsToggle
                  label="화면 흔들림"
                  active={settings.screenShake}
                  onToggle={() => updateSetting('screenShake', !settings.screenShake)}
                  icon={<ZapOff size={16} className="text-stone-300" />}
                />
              </div>

              <div className="space-y-3">
                <p className="font-pixel-kr text-xs text-stone-400 text-left">사운드</p>
                <SettingsToggle
                  label="전체 음향"
                  active={settings.soundEnabled}
                  onToggle={() => updateSetting('soundEnabled', !settings.soundEnabled)}
                  icon={settings.soundEnabled ? <Volume2 size={16} className="text-stone-300" /> : <VolumeX size={16} className="text-stone-300" />}
                  accent="cyan"
                />
                <SettingsToggle
                  label="배경 음악"
                  active={settings.musicEnabled}
                  onToggle={() => updateSetting('musicEnabled', !settings.musicEnabled)}
                  icon={<Music size={16} className="text-stone-300" />}
                  accent="cyan"
                />
                <SettingsSlider
                  label="마스터 볼륨"
                  value={settings.masterVolume}
                  onChange={(value) => updateSetting('masterVolume', value)}
                  disabled={!settings.soundEnabled}
                />
                <SettingsSlider
                  label="효과음"
                  value={settings.sfxVolume}
                  onChange={(value) => updateSetting('sfxVolume', value)}
                  disabled={!settings.soundEnabled}
                />
                <SettingsSlider
                  label="음악"
                  value={settings.musicVolume}
                  onChange={(value) => updateSetting('musicVolume', value)}
                  disabled={!settings.soundEnabled || !settings.musicEnabled}
                />
              </div>

              <div className="space-y-3">
                <p className="font-pixel-kr text-xs text-stone-400 text-left">접근성</p>
                <SettingsToggle
                  label="움직임 줄이기"
                  active={settings.reduceMotion}
                  onToggle={() => updateSetting('reduceMotion', !settings.reduceMotion)}
                  icon={<ZapOff size={16} className="text-stone-300" />}
                  accent="orange"
                />
                <SettingsToggle
                  label="고대비"
                  active={settings.highContrast}
                  onToggle={() => updateSetting('highContrast', !settings.highContrast)}
                  icon={<Contrast size={16} className="text-stone-300" />}
                  accent="orange"
                />
                <SettingsToggle
                  label="큰 글자"
                  active={settings.largeText}
                  onToggle={() => updateSetting('largeText', !settings.largeText)}
                  icon={<Type size={16} className="text-stone-300" />}
                  accent="orange"
                />
              </div>

              <button
                onClick={() => updateSetting('tutorialCompleted', false)}
                className="w-full px-4 py-3 pixel-border border-2 border-orange-600 bg-orange-950/40 flex items-center justify-between font-pixel-kr text-sm"
              >
                <span>첫 전투 튜토리얼</span>
                <span className="px-3 py-1 pixel-border border-2 border-orange-500 bg-orange-900/50 text-orange-200 font-pixel text-[10px]">
                  RESET
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
        v1.11.16
      </div>
    </div>
  );
};

export default MenuScreen;
