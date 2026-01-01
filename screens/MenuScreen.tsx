import React from 'react';

interface MenuScreenProps {
  onStartGame: () => void;
}

const MenuScreen: React.FC<MenuScreenProps> = ({ onStartGame }) => {
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

      <p className="mb-10 text-base md:text-lg text-stone-400 font-pixel-kr">
        무기를 직접 제작하여 던전에서 살아남으세요.
      </p>

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
