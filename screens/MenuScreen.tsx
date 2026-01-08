import React, { useState, useEffect } from 'react';
import { Sparkles, Key, X, Check } from 'lucide-react';
import { saveApiKey, clearApiKey, getApiKeyStatus, isGeminiAvailable } from '../services/geminiService';

interface MenuScreenProps {
  onStartGame: () => void;
}

const MenuScreen: React.FC<MenuScreenProps> = ({ onStartGame }) => {
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [apiKeyStatus, setApiKeyStatus] = useState<{ hasKey: boolean; maskedKey?: string }>({ hasKey: false });

  useEffect(() => {
    // Check API key status on mount
    setApiKeyStatus(getApiKeyStatus());
  }, []);

  const handleSaveApiKey = () => {
    if (apiKeyInput.trim()) {
      saveApiKey(apiKeyInput.trim());
      setApiKeyStatus(getApiKeyStatus());
      setApiKeyInput('');
      setShowApiKeyInput(false);
    }
  };

  const handleClearApiKey = () => {
    clearApiKey();
    setApiKeyStatus({ hasKey: false });
  };

  return (
    <div className="w-full h-screen-safe flex flex-col items-center justify-center bg-pixel-bg-dark text-stone-100 px-4 text-center relative overflow-hidden">
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

      {/* AI Status Indicator */}
      <div className="mb-6 flex flex-col items-center gap-2">
        {apiKeyStatus.hasKey ? (
          <div className="flex items-center gap-2 text-sm text-green-400 font-pixel-kr">
            <Sparkles size={16} className="text-purple-400" />
            <span>AI 기능 활성화됨</span>
            <span className="text-stone-500">({apiKeyStatus.maskedKey})</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-stone-500 font-pixel-kr">
            <Sparkles size={16} className="opacity-50" />
            <span>AI 기능 비활성화</span>
          </div>
        )}

        {/* API Key Toggle Button */}
        <button
          onClick={() => setShowApiKeyInput(!showApiKeyInput)}
          className="flex items-center gap-1 px-3 py-1 text-xs font-pixel-kr text-stone-400 hover:text-orange-400 transition-colors"
        >
          <Key size={12} />
          {apiKeyStatus.hasKey ? 'API 키 변경' : 'API 키 입력'}
        </button>
      </div>

      {/* API Key Input Panel */}
      {showApiKeyInput && (
        <div className="mb-6 p-4 bg-stone-800/80 border-2 border-stone-600 rounded-lg max-w-md w-full">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-pixel-kr text-stone-300">Gemini API 키</span>
            <button
              onClick={() => setShowApiKeyInput(false)}
              className="text-stone-500 hover:text-stone-300"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex gap-2 mb-2">
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="API 키를 입력하세요..."
              className="flex-1 px-3 py-2 bg-stone-900 border border-stone-600 rounded text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-orange-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveApiKey();
              }}
            />
            <button
              onClick={handleSaveApiKey}
              disabled={!apiKeyInput.trim()}
              className="px-3 py-2 bg-orange-600 hover:bg-orange-500 disabled:bg-stone-700 disabled:text-stone-500 rounded text-white transition-colors"
            >
              <Check size={16} />
            </button>
          </div>

          {apiKeyStatus.hasKey && (
            <button
              onClick={handleClearApiKey}
              className="text-xs text-red-400 hover:text-red-300 font-pixel-kr"
            >
              키 삭제
            </button>
          )}

          <p className="mt-2 text-xs text-stone-500 font-pixel-kr">
            AI 카드 생성 기능을 사용하려면 Google AI Studio에서<br/>
            Gemini API 키를 발급받아 입력하세요.
          </p>
        </div>
      )}

      {/* Start Button - 3D Pixel Style */}
      <button
        onClick={onStartGame}
        className="
          px-8 md:px-12 py-3 md:py-4
          pixel-border border-4 border-orange-400
          bg-gradient-to-b from-orange-500 to-orange-700
          font-pixel-kr text-lg md:text-xl font-bold text-white
          hover:from-orange-400 hover:to-orange-600
          active:translate-y-1
          transition-all
        "
        style={{
          boxShadow: '0 6px 0 0 #9a3412, 0 8px 10px rgba(0,0,0,0.5)',
        }}
      >
        대장간 입장
      </button>

      {/* Version */}
      <div className="absolute bottom-4 right-4 text-xs text-stone-600 font-pixel">
        v0.1
      </div>
    </div>
  );
};

export default MenuScreen;
