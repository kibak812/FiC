import React from 'react';

// Monster Sprites - Each enemy has unique pixel art
export const MonsterSprites: Record<string, React.FC<{ className?: string }>> = {
  // Floor 1: Abandoned Mine
  rust_slime: ({ className }) => (
    <svg viewBox="0 0 32 32" className={className} style={{ imageRendering: 'pixelated' }}>
      {/* Green slime body */}
      <rect x="8" y="18" width="16" height="10" fill="#5B8C5A"/>
      <rect x="6" y="20" width="2" height="6" fill="#5B8C5A"/>
      <rect x="24" y="20" width="2" height="6" fill="#5B8C5A"/>
      <rect x="10" y="16" width="12" height="2" fill="#5B8C5A"/>
      {/* Rust spots */}
      <rect x="10" y="20" width="2" height="2" fill="#8B4513"/>
      <rect x="16" y="22" width="2" height="2" fill="#8B4513"/>
      <rect x="20" y="20" width="2" height="2" fill="#A0522D"/>
      {/* Eyes */}
      <rect x="11" y="22" width="3" height="3" fill="#000"/>
      <rect x="18" y="22" width="3" height="3" fill="#000"/>
      <rect x="12" y="23" width="1" height="1" fill="#fff"/>
      <rect x="19" y="23" width="1" height="1" fill="#fff"/>
      {/* Highlight */}
      <rect x="12" y="18" width="3" height="2" fill="#7CFC7C"/>
    </svg>
  ),

  kobold_scrapper: ({ className }) => (
    <svg viewBox="0 0 32 32" className={className} style={{ imageRendering: 'pixelated' }}>
      {/* Body */}
      <rect x="12" y="14" width="8" height="12" fill="#8B7355"/>
      <rect x="10" y="16" width="2" height="8" fill="#8B7355"/>
      <rect x="20" y="16" width="2" height="8" fill="#8B7355"/>
      {/* Head */}
      <rect x="10" y="6" width="12" height="10" fill="#A08060"/>
      <rect x="8" y="4" width="4" height="6" fill="#A08060"/>
      <rect x="20" y="4" width="4" height="6" fill="#A08060"/>
      {/* Snout */}
      <rect x="13" y="12" width="6" height="4" fill="#C0A080"/>
      {/* Eyes */}
      <rect x="11" y="8" width="3" height="3" fill="#FFFF00"/>
      <rect x="18" y="8" width="3" height="3" fill="#FFFF00"/>
      <rect x="12" y="9" width="1" height="1" fill="#000"/>
      <rect x="19" y="9" width="1" height="1" fill="#000"/>
      {/* Backpack */}
      <rect x="6" y="14" width="4" height="8" fill="#654321"/>
      <rect x="7" y="15" width="2" height="2" fill="#8B4513"/>
    </svg>
  ),

  skeleton_warrior: ({ className }) => (
    <svg viewBox="0 0 32 32" className={className} style={{ imageRendering: 'pixelated' }}>
      {/* Skull */}
      <rect x="10" y="4" width="12" height="10" fill="#E8E8DC"/>
      <rect x="12" y="14" width="8" height="2" fill="#E8E8DC"/>
      {/* Eye sockets */}
      <rect x="11" y="6" width="4" height="4" fill="#2D1B00"/>
      <rect x="17" y="6" width="4" height="4" fill="#2D1B00"/>
      <rect x="12" y="7" width="2" height="2" fill="#FF3300"/>
      <rect x="18" y="7" width="2" height="2" fill="#FF3300"/>
      {/* Nose hole */}
      <rect x="15" y="10" width="2" height="2" fill="#2D1B00"/>
      {/* Jaw */}
      <rect x="12" y="12" width="8" height="2" fill="#D0D0C0"/>
      {/* Spine/Body */}
      <rect x="14" y="16" width="4" height="8" fill="#E8E8DC"/>
      {/* Ribs */}
      <rect x="10" y="16" width="12" height="2" fill="#D0D0C0"/>
      <rect x="10" y="19" width="12" height="2" fill="#D0D0C0"/>
      {/* Arms */}
      <rect x="6" y="16" width="4" height="2" fill="#E8E8DC"/>
      <rect x="22" y="16" width="4" height="2" fill="#E8E8DC"/>
      {/* Rusty sword */}
      <rect x="24" y="8" width="2" height="14" fill="#8B4513"/>
      <rect x="22" y="14" width="6" height="2" fill="#654321"/>
    </svg>
  ),

  rock_crusher: ({ className }) => (
    <svg viewBox="0 0 32 32" className={className} style={{ imageRendering: 'pixelated' }}>
      {/* Large rocky body */}
      <rect x="6" y="10" width="20" height="18" fill="#696969"/>
      <rect x="4" y="14" width="4" height="10" fill="#696969"/>
      <rect x="24" y="14" width="4" height="10" fill="#696969"/>
      {/* Rocky texture */}
      <rect x="8" y="12" width="4" height="4" fill="#808080"/>
      <rect x="16" y="14" width="4" height="4" fill="#808080"/>
      <rect x="10" y="20" width="4" height="4" fill="#808080"/>
      <rect x="20" y="18" width="4" height="4" fill="#505050"/>
      {/* Glowing eyes */}
      <rect x="10" y="16" width="4" height="4" fill="#FF4400"/>
      <rect x="18" y="16" width="4" height="4" fill="#FF4400"/>
      <rect x="11" y="17" width="2" height="2" fill="#FFFF00"/>
      <rect x="19" y="17" width="2" height="2" fill="#FFFF00"/>
      {/* Crown/Elite marker */}
      <rect x="10" y="6" width="12" height="4" fill="#FFD700"/>
      <rect x="8" y="8" width="2" height="4" fill="#FFD700"/>
      <rect x="22" y="8" width="2" height="4" fill="#FFD700"/>
    </svg>
  ),

  junk_king: ({ className }) => (
    <svg viewBox="0 0 32 32" className={className} style={{ imageRendering: 'pixelated' }}>
      {/* Metallic body made of junk */}
      <rect x="8" y="12" width="16" height="16" fill="#4A4A4A"/>
      <rect x="6" y="16" width="4" height="8" fill="#5A5A5A"/>
      <rect x="22" y="16" width="4" height="8" fill="#5A5A5A"/>
      {/* Rust patches */}
      <rect x="10" y="14" width="4" height="4" fill="#8B4513"/>
      <rect x="18" y="18" width="4" height="4" fill="#A0522D"/>
      <rect x="12" y="22" width="4" height="4" fill="#CD853F"/>
      {/* Crown of scraps */}
      <rect x="10" y="4" width="12" height="4" fill="#B8860B"/>
      <rect x="8" y="6" width="4" height="6" fill="#8B4513"/>
      <rect x="20" y="6" width="4" height="6" fill="#8B4513"/>
      <rect x="14" y="2" width="4" height="4" fill="#DAA520"/>
      {/* Glowing red eyes */}
      <rect x="11" y="14" width="4" height="4" fill="#330000"/>
      <rect x="17" y="14" width="4" height="4" fill="#330000"/>
      <rect x="12" y="15" width="2" height="2" fill="#FF0000"/>
      <rect x="18" y="15" width="2" height="2" fill="#FF0000"/>
      {/* Magnetic aura */}
      <rect x="4" y="12" width="2" height="2" fill="#6666FF"/>
      <rect x="26" y="12" width="2" height="2" fill="#6666FF"/>
    </svg>
  ),

  // Floor 2: Molten Forge
  ember_wisp: ({ className }) => (
    <svg viewBox="0 0 32 32" className={className} style={{ imageRendering: 'pixelated' }}>
      {/* Fiery core */}
      <rect x="12" y="12" width="8" height="8" fill="#FF6600"/>
      <rect x="10" y="14" width="2" height="4" fill="#FF6600"/>
      <rect x="20" y="14" width="2" height="4" fill="#FF6600"/>
      {/* Flame tendrils */}
      <rect x="14" y="8" width="4" height="4" fill="#FF9900"/>
      <rect x="12" y="6" width="2" height="4" fill="#FFCC00"/>
      <rect x="18" y="6" width="2" height="4" fill="#FFCC00"/>
      <rect x="10" y="20" width="4" height="4" fill="#FF4400"/>
      <rect x="18" y="20" width="4" height="4" fill="#FF4400"/>
      {/* Bright center */}
      <rect x="14" y="14" width="4" height="4" fill="#FFFF00"/>
      <rect x="15" y="15" width="2" height="2" fill="#FFFFFF"/>
      {/* Sparks */}
      <rect x="8" y="10" width="2" height="2" fill="#FFFF66"/>
      <rect x="22" y="10" width="2" height="2" fill="#FFFF66"/>
      <rect x="6" y="18" width="2" height="2" fill="#FF6600"/>
      <rect x="24" y="18" width="2" height="2" fill="#FF6600"/>
    </svg>
  ),

  hammerhead: ({ className }) => (
    <svg viewBox="0 0 32 32" className={className} style={{ imageRendering: 'pixelated' }}>
      {/* Goblin body */}
      <rect x="12" y="16" width="8" height="10" fill="#4A7C3F"/>
      <rect x="10" y="18" width="2" height="6" fill="#4A7C3F"/>
      <rect x="20" y="18" width="2" height="6" fill="#4A7C3F"/>
      {/* Head with hammer shape */}
      <rect x="4" y="8" width="24" height="8" fill="#555555"/>
      <rect x="10" y="10" width="12" height="6" fill="#4A7C3F"/>
      {/* Face */}
      <rect x="12" y="10" width="3" height="3" fill="#FFFF00"/>
      <rect x="17" y="10" width="3" height="3" fill="#FFFF00"/>
      <rect x="13" y="11" width="1" height="1" fill="#000"/>
      <rect x="18" y="11" width="1" height="1" fill="#000"/>
      {/* Hammer helmet details */}
      <rect x="4" y="10" width="6" height="4" fill="#444444"/>
      <rect x="22" y="10" width="6" height="4" fill="#444444"/>
      <rect x="6" y="8" width="4" height="2" fill="#666666"/>
      <rect x="22" y="8" width="4" height="2" fill="#666666"/>
      {/* Teeth */}
      <rect x="14" y="14" width="2" height="2" fill="#FFFFFF"/>
      <rect x="16" y="14" width="2" height="2" fill="#FFFFFF"/>
    </svg>
  ),

  loot_goblin: ({ className }) => (
    <svg viewBox="0 0 32 32" className={className} style={{ imageRendering: 'pixelated' }}>
      {/* Body */}
      <rect x="12" y="14" width="8" height="10" fill="#3D6B35"/>
      {/* Head */}
      <rect x="10" y="6" width="12" height="10" fill="#4A8040"/>
      {/* Big ears */}
      <rect x="6" y="6" width="4" height="8" fill="#4A8040"/>
      <rect x="22" y="6" width="4" height="8" fill="#4A8040"/>
      {/* Greedy eyes */}
      <rect x="11" y="8" width="4" height="4" fill="#FFD700"/>
      <rect x="17" y="8" width="4" height="4" fill="#FFD700"/>
      <rect x="12" y="9" width="2" height="2" fill="#000"/>
      <rect x="18" y="9" width="2" height="2" fill="#000"/>
      {/* Money bag */}
      <rect x="20" y="12" width="8" height="10" fill="#8B7355"/>
      <rect x="22" y="10" width="4" height="2" fill="#6B5344"/>
      <rect x="22" y="14" width="4" height="2" fill="#FFD700"/>
      {/* $ symbol */}
      <rect x="23" y="16" width="2" height="4" fill="#FFD700"/>
      {/* Sneaky smile */}
      <rect x="13" y="12" width="6" height="2" fill="#2D1B00"/>
      <rect x="12" y="12" width="1" height="1" fill="#2D1B00"/>
      <rect x="19" y="12" width="1" height="1" fill="#2D1B00"/>
    </svg>
  ),

  mimic_anvil: ({ className }) => (
    <svg viewBox="0 0 32 32" className={className} style={{ imageRendering: 'pixelated' }}>
      {/* Anvil body */}
      <rect x="6" y="16" width="20" height="10" fill="#444444"/>
      <rect x="8" y="14" width="16" height="4" fill="#555555"/>
      <rect x="10" y="12" width="12" height="4" fill="#666666"/>
      {/* Horn (anvil side) */}
      <rect x="2" y="18" width="6" height="4" fill="#555555"/>
      {/* Hidden eyes (revealed) */}
      <rect x="12" y="16" width="4" height="3" fill="#FF0000"/>
      <rect x="18" y="16" width="4" height="3" fill="#FF0000"/>
      <rect x="13" y="17" width="2" height="1" fill="#FFFF00"/>
      <rect x="19" y="17" width="2" height="1" fill="#FFFF00"/>
      {/* Hidden mouth with teeth */}
      <rect x="10" y="20" width="12" height="4" fill="#220000"/>
      <rect x="11" y="20" width="2" height="2" fill="#FFFFFF"/>
      <rect x="15" y="20" width="2" height="2" fill="#FFFFFF"/>
      <rect x="19" y="20" width="2" height="2" fill="#FFFFFF"/>
      {/* Elite crown */}
      <rect x="12" y="8" width="8" height="4" fill="#FFD700"/>
      <rect x="10" y="10" width="2" height="4" fill="#FFD700"/>
      <rect x="20" y="10" width="2" height="4" fill="#FFD700"/>
    </svg>
  ),

  corrupted_smith: ({ className }) => (
    <svg viewBox="0 0 32 32" className={className} style={{ imageRendering: 'pixelated' }}>
      {/* Large body */}
      <rect x="8" y="14" width="16" height="14" fill="#3D3D3D"/>
      <rect x="4" y="18" width="6" height="8" fill="#4D4D4D"/>
      <rect x="22" y="18" width="6" height="8" fill="#4D4D4D"/>
      {/* Corrupted purple veins */}
      <rect x="10" y="16" width="2" height="6" fill="#8B00FF"/>
      <rect x="16" y="18" width="2" height="4" fill="#9400D3"/>
      <rect x="20" y="16" width="2" height="6" fill="#8B00FF"/>
      {/* Head with smith mask */}
      <rect x="10" y="4" width="12" height="10" fill="#2D2D2D"/>
      <rect x="12" y="8" width="8" height="6" fill="#1D1D1D"/>
      {/* Glowing purple eyes */}
      <rect x="12" y="8" width="3" height="3" fill="#9400D3"/>
      <rect x="17" y="8" width="3" height="3" fill="#9400D3"/>
      <rect x="13" y="9" width="1" height="1" fill="#FF00FF"/>
      <rect x="18" y="9" width="1" height="1" fill="#FF00FF"/>
      {/* Corrupted hammer */}
      <rect x="24" y="6" width="6" height="8" fill="#4D4D4D"/>
      <rect x="26" y="14" width="2" height="10" fill="#3D3D3D"/>
      <rect x="25" y="8" width="4" height="4" fill="#8B00FF"/>
      {/* Boss aura */}
      <rect x="2" y="8" width="2" height="2" fill="#9400D3"/>
      <rect x="4" y="4" width="2" height="2" fill="#8B00FF"/>
    </svg>
  ),

  // Floor 3: Clockwork Sanctuary
  automaton_defender: ({ className }) => (
    <svg viewBox="0 0 32 32" className={className} style={{ imageRendering: 'pixelated' }}>
      {/* Metal body */}
      <rect x="10" y="14" width="12" height="12" fill="#708090"/>
      <rect x="8" y="16" width="4" height="8" fill="#607080"/>
      <rect x="20" y="16" width="4" height="8" fill="#607080"/>
      {/* Head */}
      <rect x="12" y="6" width="8" height="8" fill="#A0B0C0"/>
      {/* Visor/eyes */}
      <rect x="12" y="8" width="8" height="4" fill="#003366"/>
      <rect x="13" y="9" width="2" height="2" fill="#00FFFF"/>
      <rect x="17" y="9" width="2" height="2" fill="#00FFFF"/>
      {/* Shield */}
      <rect x="2" y="14" width="8" height="12" fill="#4682B4"/>
      <rect x="4" y="16" width="4" height="8" fill="#5A9BD4"/>
      <rect x="5" y="18" width="2" height="4" fill="#87CEEB"/>
      {/* Gears */}
      <rect x="14" y="18" width="4" height="4" fill="#B8860B"/>
      <rect x="15" y="19" width="2" height="2" fill="#DAA520"/>
      {/* Thorns indicator */}
      <rect x="26" y="14" width="2" height="2" fill="#00FF00"/>
      <rect x="28" y="16" width="2" height="2" fill="#00FF00"/>
      <rect x="26" y="18" width="2" height="2" fill="#00FF00"/>
    </svg>
  ),

  shadow_assassin: ({ className }) => (
    <svg viewBox="0 0 32 32" className={className} style={{ imageRendering: 'pixelated' }}>
      {/* Shadowy body */}
      <rect x="12" y="12" width="8" height="14" fill="#1A1A2E"/>
      <rect x="10" y="14" width="2" height="10" fill="#1A1A2E"/>
      <rect x="20" y="14" width="2" height="10" fill="#1A1A2E"/>
      {/* Hood */}
      <rect x="10" y="4" width="12" height="10" fill="#16213E"/>
      <rect x="8" y="6" width="2" height="8" fill="#16213E"/>
      <rect x="22" y="6" width="2" height="8" fill="#16213E"/>
      {/* Glowing eyes */}
      <rect x="12" y="8" width="3" height="2" fill="#E94560"/>
      <rect x="17" y="8" width="3" height="2" fill="#E94560"/>
      {/* Daggers */}
      <rect x="4" y="16" width="6" height="2" fill="#C0C0C0"/>
      <rect x="2" y="15" width="2" height="4" fill="#808080"/>
      <rect x="22" y="16" width="6" height="2" fill="#C0C0C0"/>
      <rect x="28" y="15" width="2" height="4" fill="#808080"/>
      {/* Elite marker */}
      <rect x="14" y="2" width="4" height="2" fill="#FFD700"/>
      {/* Shadow wisps */}
      <rect x="6" y="20" width="2" height="2" fill="#0F0F23"/>
      <rect x="24" y="22" width="2" height="2" fill="#0F0F23"/>
    </svg>
  ),

  chimera_engine: ({ className }) => (
    <svg viewBox="0 0 32 32" className={className} style={{ imageRendering: 'pixelated' }}>
      {/* Machine body */}
      <rect x="8" y="12" width="16" height="14" fill="#4A4A4A"/>
      {/* Three heads */}
      <rect x="4" y="6" width="8" height="8" fill="#8B0000"/>
      <rect x="12" y="4" width="8" height="8" fill="#556B2F"/>
      <rect x="20" y="6" width="8" height="8" fill="#4169E1"/>
      {/* Eyes for each head */}
      <rect x="6" y="8" width="2" height="2" fill="#FF0000"/>
      <rect x="8" y="8" width="2" height="2" fill="#FF0000"/>
      <rect x="14" y="6" width="2" height="2" fill="#00FF00"/>
      <rect x="16" y="6" width="2" height="2" fill="#00FF00"/>
      <rect x="22" y="8" width="2" height="2" fill="#00BFFF"/>
      <rect x="24" y="8" width="2" height="2" fill="#00BFFF"/>
      {/* Gatling guns */}
      <rect x="2" y="18" width="6" height="4" fill="#2F2F2F"/>
      <rect x="0" y="19" width="2" height="2" fill="#1F1F1F"/>
      <rect x="24" y="18" width="6" height="4" fill="#2F2F2F"/>
      <rect x="30" y="19" width="2" height="2" fill="#1F1F1F"/>
      {/* Gears and pipes */}
      <rect x="12" y="16" width="4" height="4" fill="#B8860B"/>
      <rect x="16" y="18" width="4" height="4" fill="#B8860B"/>
      {/* Elite crown */}
      <rect x="14" y="0" width="4" height="4" fill="#FFD700"/>
    </svg>
  ),

  deus_ex_machina: ({ className }) => (
    <svg viewBox="0 0 32 32" className={className} style={{ imageRendering: 'pixelated' }}>
      {/* Divine machine core */}
      <rect x="10" y="10" width="12" height="12" fill="#2C2C54"/>
      <rect x="8" y="12" width="2" height="8" fill="#2C2C54"/>
      <rect x="22" y="12" width="2" height="8" fill="#2C2C54"/>
      {/* Golden frame */}
      <rect x="8" y="8" width="16" height="2" fill="#FFD700"/>
      <rect x="8" y="22" width="16" height="2" fill="#FFD700"/>
      <rect x="6" y="10" width="2" height="12" fill="#FFD700"/>
      <rect x="24" y="10" width="2" height="12" fill="#FFD700"/>
      {/* All-seeing eye */}
      <rect x="12" y="12" width="8" height="8" fill="#E8E8E8"/>
      <rect x="14" y="14" width="4" height="4" fill="#4169E1"/>
      <rect x="15" y="15" width="2" height="2" fill="#000080"/>
      {/* Divine light rays */}
      <rect x="14" y="4" width="4" height="4" fill="#FFFF00"/>
      <rect x="4" y="14" width="4" height="4" fill="#FFFF00"/>
      <rect x="24" y="14" width="4" height="4" fill="#FFFF00"/>
      <rect x="14" y="24" width="4" height="4" fill="#FFFF00"/>
      {/* Halo */}
      <rect x="12" y="2" width="8" height="2" fill="#FFD700"/>
      <rect x="10" y="4" width="2" height="2" fill="#FFD700"/>
      <rect x="20" y="4" width="2" height="2" fill="#FFD700"/>
      {/* Boss aura particles */}
      <rect x="2" y="6" width="2" height="2" fill="#9400D3"/>
      <rect x="28" y="6" width="2" height="2" fill="#9400D3"/>
      <rect x="0" y="16" width="2" height="2" fill="#4169E1"/>
      <rect x="30" y="16" width="2" height="2" fill="#4169E1"/>
    </svg>
  ),
};

type GeneratedCardKind = 'handle' | 'head' | 'deco';
type GeneratedCardTheme =
  | 'blood'
  | 'guard'
  | 'poison'
  | 'fire'
  | 'energy'
  | 'draw'
  | 'heavy'
  | 'multi'
  | 'pierce'
  | 'gold'
  | 'frost'
  | 'time'
  | 'growth'
  | 'void'
  | 'rage';
type GeneratedCardRarity = 'common' | 'rare' | 'legend' | 'starter' | 'special';

interface GeneratedCardSpriteConfig {
  kind: GeneratedCardKind;
  theme: GeneratedCardTheme;
  rarity: GeneratedCardRarity;
  variant?: number;
}

const THEME_PALETTES: Record<GeneratedCardTheme, { dark: string; base: string; light: string; spark: string }> = {
  blood: { dark: '#4A0000', base: '#8B0000', light: '#D22A2A', spark: '#FF6B6B' },
  guard: { dark: '#23415C', base: '#4682B4', light: '#87CEEB', spark: '#D7F4FF' },
  poison: { dark: '#0E4A26', base: '#2E8B57', light: '#7CFC7C', spark: '#D8FFD8' },
  fire: { dark: '#7A1E00', base: '#FF4500', light: '#FFB000', spark: '#FFFF66' },
  energy: { dark: '#172A7A', base: '#4169E1', light: '#00FFFF', spark: '#FFFFFF' },
  draw: { dark: '#35505E', base: '#7DAFC2', light: '#E8F7FF', spark: '#FFFFFF' },
  heavy: { dark: '#353535', base: '#696969', light: '#C0C0C0', spark: '#FFD700' },
  multi: { dark: '#3A225C', base: '#7D4ACF', light: '#D49CFF', spark: '#FFFFFF' },
  pierce: { dark: '#3F4650', base: '#708090', light: '#DCE6F0', spark: '#FFFFFF' },
  gold: { dark: '#7A4D00', base: '#D4A017', light: '#FFD700', spark: '#FFFFAA' },
  frost: { dark: '#1D5C78', base: '#5AA9C9', light: '#D9FFFF', spark: '#FFFFFF' },
  time: { dark: '#3E3366', base: '#7C6BC4', light: '#D9D0FF', spark: '#FFF4A8' },
  growth: { dark: '#244D24', base: '#3B8C3B', light: '#8FE58F', spark: '#E8FFE8' },
  void: { dark: '#130B2A', base: '#4B0082', light: '#9A45FF', spark: '#F2D6FF' },
  rage: { dark: '#6B1300', base: '#B22222', light: '#FF6600', spark: '#FFFF00' }
};

const RARITY_FRAME: Record<GeneratedCardRarity, string> = {
  starter: '#8B7355',
  common: '#5588CC',
  rare: '#AA55CC',
  legend: '#D4AF37',
  special: '#E94560'
};

const generatedCardSprite = ({ kind, theme, rarity, variant = 0 }: GeneratedCardSpriteConfig): React.FC<{ className?: string }> => {
  const palette = THEME_PALETTES[theme];
  const frame = RARITY_FRAME[rarity];
  const leftSparkY = 4 + (variant % 4);
  const rightSparkY = 17 - (variant % 5);
  const centerShift = variant % 3;

  return ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
      <rect x="3" y="3" width="18" height="18" fill="#17131A"/>
      <rect x="4" y="4" width="16" height="16" fill={palette.dark}/>
      <rect x="5" y="5" width="14" height="1" fill={frame}/>
      <rect x="5" y="18" width="14" height="1" fill={frame}/>
      <rect x="5" y="5" width="1" height="14" fill={frame}/>
      <rect x="18" y="5" width="1" height="14" fill={frame}/>

      {kind === 'handle' && (
        <>
          <rect x="10" y="5" width="4" height="13" fill={palette.base}/>
          <rect x="9" y="7" width="1" height="8" fill={palette.light}/>
          <rect x="14" y="7" width="1" height="8" fill={palette.dark}/>
          <rect x="7" y="8" width="3" height="2" fill={palette.base}/>
          <rect x="14" y="8" width="3" height="2" fill={palette.base}/>
          <rect x="9" y="17" width="6" height="3" fill={palette.dark}/>
          <rect x="11" y="6" width="2" height="2" fill={palette.spark}/>
        </>
      )}

      {kind === 'head' && (
        <>
          <rect x="11" y="3" width="2" height="13" fill={palette.light}/>
          <rect x="10" y="5" width="1" height="9" fill={palette.spark}/>
          <rect x="13" y="5" width="1" height="9" fill={palette.base}/>
          <rect x="8" y="15" width="8" height="2" fill={frame}/>
          <rect x="10" y="17" width="4" height="4" fill={palette.dark}/>
          <rect x={7 + centerShift} y="7" width="2" height="2" fill={palette.base}/>
          <rect x={15 - centerShift} y="10" width="2" height="2" fill={palette.base}/>
        </>
      )}

      {kind === 'deco' && (
        <>
          <rect x="8" y="8" width="8" height="8" fill={palette.base}/>
          <rect x="10" y="6" width="4" height="2" fill={palette.light}/>
          <rect x="10" y="16" width="4" height="2" fill={palette.dark}/>
          <rect x="6" y="10" width="2" height="4" fill={palette.dark}/>
          <rect x="16" y="10" width="2" height="4" fill={palette.light}/>
          <rect x="10" y="10" width="4" height="4" fill={palette.spark}/>
          <rect x="11" y="11" width="2" height="2" fill={palette.dark}/>
        </>
      )}

      {theme === 'blood' && (
        <>
          <rect x="6" y={leftSparkY + 8} width="2" height="3" fill="#FF0000"/>
          <rect x="17" y={rightSparkY} width="1" height="3" fill="#B00000"/>
          <rect x="8" y="18" width="2" height="1" fill="#FF6B6B"/>
        </>
      )}
      {theme === 'guard' && (
        <>
          <rect x="7" y="9" width="10" height="7" fill="#2F5F8F" opacity="0.85"/>
          <rect x="9" y="11" width="6" height="3" fill={palette.light}/>
          <rect x="11" y="10" width="2" height="5" fill={palette.spark}/>
        </>
      )}
      {theme === 'poison' && (
        <>
          <rect x="6" y="15" width="2" height="2" fill={palette.light}/>
          <rect x="16" y="6" width="2" height="2" fill={palette.light}/>
          <rect x="14" y="16" width="1" height="1" fill={palette.spark}/>
        </>
      )}
      {theme === 'fire' && (
        <>
          <rect x="7" y="13" width="2" height="4" fill={palette.light}/>
          <rect x="15" y="7" width="2" height="5" fill={palette.base}/>
          <rect x="11" y="5" width="2" height="3" fill={palette.spark}/>
        </>
      )}
      {theme === 'energy' && (
        <>
          <rect x="13" y="5" width="2" height="4" fill={palette.spark}/>
          <rect x="11" y="9" width="2" height="4" fill={palette.light}/>
          <rect x="9" y="13" width="2" height="4" fill={palette.spark}/>
        </>
      )}
      {theme === 'draw' && (
        <>
          <rect x="7" y="7" width="5" height="2" fill={palette.light}/>
          <rect x="6" y="10" width="7" height="2" fill={palette.spark}/>
          <rect x="13" y="13" width="5" height="2" fill={palette.light}/>
        </>
      )}
      {theme === 'heavy' && (
        <>
          <rect x="5" y="8" width="14" height="4" fill={palette.base}/>
          <rect x="7" y="10" width="10" height="5" fill={palette.dark}/>
          <rect x="9" y="9" width="6" height="2" fill={palette.light}/>
        </>
      )}
      {theme === 'multi' && (
        <>
          <rect x="6" y="6" width="3" height="9" fill={palette.light}/>
          <rect x="11" y="5" width="3" height="10" fill={palette.spark}/>
          <rect x="16" y="7" width="2" height="8" fill={palette.light}/>
        </>
      )}
      {theme === 'pierce' && (
        <>
          <rect x="5" y="11" width="14" height="2" fill={palette.light}/>
          <rect x="18" y="10" width="2" height="4" fill={palette.spark}/>
        </>
      )}
      {theme === 'gold' && (
        <>
          <rect x="7" y="14" width="4" height="4" fill={palette.light}/>
          <rect x="13" y="8" width="4" height="4" fill={palette.light}/>
          <rect x="8" y="15" width="2" height="2" fill={palette.spark}/>
          <rect x="14" y="9" width="2" height="2" fill={palette.spark}/>
        </>
      )}
      {theme === 'frost' && (
        <>
          <rect x="6" y="6" width="2" height="2" fill={palette.spark}/>
          <rect x="16" y="8" width="2" height="2" fill={palette.spark}/>
          <rect x="8" y="16" width="8" height="1" fill={palette.light}/>
        </>
      )}
      {theme === 'time' && (
        <>
          <rect x="8" y="8" width="8" height="8" fill={palette.base}/>
          <rect x="10" y="10" width="4" height="4" fill="#17131A"/>
          <rect x="12" y="9" width="1" height="4" fill={palette.spark}/>
          <rect x="12" y="12" width="3" height="1" fill={palette.spark}/>
        </>
      )}
      {theme === 'growth' && (
        <>
          <rect x="9" y="15" width="2" height="4" fill="#244D24"/>
          <rect x="11" y="11" width="2" height="6" fill={palette.base}/>
          <rect x="8" y="10" width="4" height="2" fill={palette.light}/>
          <rect x="13" y="8" width="4" height="2" fill={palette.light}/>
        </>
      )}
      {theme === 'void' && (
        <>
          <rect x="8" y="8" width="8" height="8" fill={palette.light}/>
          <rect x="10" y="10" width="4" height="4" fill="#000000"/>
          <rect x="6" y="6" width="2" height="2" fill={palette.spark}/>
          <rect x="16" y="16" width="2" height="2" fill={palette.spark}/>
        </>
      )}
      {theme === 'rage' && (
        <>
          <rect x="9" y="7" width="2" height="2" fill={palette.spark}/>
          <rect x="13" y="7" width="2" height="2" fill={palette.spark}/>
          <rect x="10" y="14" width="4" height="2" fill={palette.light}/>
        </>
      )}

      <rect x="5" y="5" width="2" height="1" fill="#FFFFFF" opacity="0.55"/>
      <rect x="17" y="18" width="1" height="1" fill={frame}/>
    </svg>
  );
};

// Card Sprites - Each card has unique pixel art icon
export const CardSprites: Record<number, React.FC<{ className?: string }>> = {
  // Starter cards
  101: ({ className }) => ( // Old wooden handle
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
      <rect x="10" y="4" width="4" height="16" fill="#8B4513"/>
      <rect x="8" y="6" width="2" height="4" fill="#A0522D"/>
      <rect x="14" y="6" width="2" height="4" fill="#A0522D"/>
      <rect x="9" y="18" width="6" height="2" fill="#654321"/>
      <rect x="11" y="8" width="2" height="2" fill="#654321"/>
    </svg>
  ),
  102: ({ className }) => ( // Parry guard
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
      <rect x="6" y="8" width="12" height="10" fill="#4682B4"/>
      <rect x="8" y="10" width="8" height="6" fill="#5A9BD4"/>
      <rect x="10" y="4" width="4" height="4" fill="#8B4513"/>
      <rect x="10" y="18" width="4" height="2" fill="#8B4513"/>
      <rect x="11" y="12" width="2" height="2" fill="#87CEEB"/>
    </svg>
  ),
  103: ({ className }) => ( // Rusty iron blade
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
      <rect x="11" y="2" width="2" height="14" fill="#808080"/>
      <rect x="10" y="4" width="1" height="10" fill="#A0A0A0"/>
      <rect x="13" y="4" width="1" height="10" fill="#606060"/>
      <rect x="8" y="16" width="8" height="2" fill="#8B4513"/>
      <rect x="10" y="18" width="4" height="4" fill="#654321"/>
      <rect x="11" y="6" width="2" height="2" fill="#8B4513"/>
    </svg>
  ),
  104: ({ className }) => ( // Pot lid
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
      <rect x="4" y="8" width="16" height="12" fill="#708090"/>
      <rect x="6" y="10" width="12" height="8" fill="#A0A0B0"/>
      <rect x="10" y="4" width="4" height="4" fill="#505050"/>
      <rect x="8" y="12" width="8" height="4" fill="#B0B0C0"/>
    </svg>
  ),
  105: ({ className }) => ( // Rough whetstone
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
      <rect x="4" y="10" width="16" height="8" fill="#696969"/>
      <rect x="6" y="8" width="12" height="2" fill="#808080"/>
      <rect x="6" y="18" width="12" height="2" fill="#505050"/>
      <rect x="8" y="12" width="4" height="4" fill="#A0A0A0"/>
      <rect x="14" y="12" width="2" height="2" fill="#787878"/>
    </svg>
  ),

  // Common cards
  201: ({ className }) => ( // Swift dagger handle
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
      <rect x="10" y="6" width="4" height="12" fill="#2F4F4F"/>
      <rect x="8" y="8" width="2" height="2" fill="#4A6A6A"/>
      <rect x="14" y="8" width="2" height="2" fill="#4A6A6A"/>
      <rect x="11" y="4" width="2" height="2" fill="#C0C0C0"/>
      <rect x="9" y="16" width="6" height="4" fill="#1F3F3F"/>
    </svg>
  ),
  202: ({ className }) => ( // Steel longsword
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
      <rect x="11" y="2" width="2" height="14" fill="#C0C0C0"/>
      <rect x="10" y="4" width="1" height="10" fill="#E0E0E0"/>
      <rect x="13" y="4" width="1" height="10" fill="#909090"/>
      <rect x="7" y="16" width="10" height="2" fill="#8B4513"/>
      <rect x="10" y="18" width="4" height="4" fill="#654321"/>
      <rect x="11" y="2" width="2" height="2" fill="#FFFFFF"/>
    </svg>
  ),
  203: ({ className }) => ( // Sawblade
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
      <rect x="10" y="4" width="4" height="12" fill="#808080"/>
      <rect x="8" y="6" width="2" height="2" fill="#A0A0A0"/>
      <rect x="14" y="6" width="2" height="2" fill="#A0A0A0"/>
      <rect x="8" y="10" width="2" height="2" fill="#A0A0A0"/>
      <rect x="14" y="10" width="2" height="2" fill="#A0A0A0"/>
      <rect x="8" y="14" width="2" height="2" fill="#A0A0A0"/>
      <rect x="14" y="14" width="2" height="2" fill="#A0A0A0"/>
      <rect x="10" y="16" width="4" height="4" fill="#8B4513"/>
      <rect x="11" y="8" width="2" height="2" fill="#FF0000"/>
    </svg>
  ),
  204: ({ className }) => ( // Light feather
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
      <rect x="11" y="4" width="2" height="16" fill="#E8E8E8"/>
      <rect x="8" y="6" width="3" height="2" fill="#F0F0F0"/>
      <rect x="13" y="6" width="3" height="2" fill="#D0D0D0"/>
      <rect x="7" y="10" width="4" height="2" fill="#F0F0F0"/>
      <rect x="13" y="10" width="4" height="2" fill="#D0D0D0"/>
      <rect x="6" y="14" width="5" height="2" fill="#E8E8E8"/>
      <rect x="13" y="14" width="5" height="2" fill="#C8C8C8"/>
    </svg>
  ),
  205: ({ className }) => ( // Poison cloth
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
      <rect x="6" y="6" width="12" height="12" fill="#2E8B57"/>
      <rect x="8" y="8" width="8" height="8" fill="#3CB371"/>
      <rect x="10" y="10" width="4" height="4" fill="#90EE90"/>
      <rect x="6" y="4" width="4" height="2" fill="#228B22"/>
      <rect x="14" y="4" width="4" height="2" fill="#228B22"/>
      <rect x="11" y="11" width="2" height="2" fill="#006400"/>
    </svg>
  ),
  206: ({ className }) => ( // Bone handle
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
      <rect x="10" y="4" width="4" height="14" fill="#E8E8DC"/>
      <rect x="8" y="6" width="2" height="4" fill="#D8D8CC"/>
      <rect x="14" y="6" width="2" height="4" fill="#D8D8CC"/>
      <rect x="8" y="14" width="2" height="4" fill="#D8D8CC"/>
      <rect x="14" y="14" width="2" height="4" fill="#D8D8CC"/>
      <rect x="11" y="8" width="2" height="2" fill="#C0C0B0"/>
    </svg>
  ),
  207: ({ className }) => ( // Spiked Armor (Deco)
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
      {/* Metal plate base */}
      <rect x="8" y="8" width="8" height="8" fill="#708090"/>
      <rect x="10" y="6" width="4" height="2" fill="#607080"/>
      <rect x="10" y="16" width="4" height="2" fill="#607080"/>
      <rect x="6" y="10" width="2" height="4" fill="#607080"/>
      <rect x="16" y="10" width="2" height="4" fill="#607080"/>
      {/* Spikes */}
      <rect x="11" y="3" width="2" height="3" fill="#C0C0C0"/>
      <rect x="4" y="11" width="3" height="2" fill="#C0C0C0"/>
      <rect x="17" y="11" width="3" height="2" fill="#C0C0C0"/>
      <rect x="11" y="18" width="2" height="3" fill="#C0C0C0"/>
      {/* Center emblem */}
      <rect x="10" y="10" width="4" height="4" fill="#A0A0B0"/>
      <rect x="11" y="11" width="2" height="2" fill="#E0E0E0"/>
    </svg>
  ),
  208: ({ className }) => ( // Charged gem
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
      <rect x="8" y="8" width="8" height="8" fill="#4169E1"/>
      <rect x="10" y="6" width="4" height="2" fill="#6495ED"/>
      <rect x="10" y="16" width="4" height="2" fill="#6495ED"/>
      <rect x="6" y="10" width="2" height="4" fill="#6495ED"/>
      <rect x="16" y="10" width="2" height="4" fill="#6495ED"/>
      <rect x="10" y="10" width="4" height="4" fill="#87CEEB"/>
      <rect x="11" y="11" width="2" height="2" fill="#FFFFFF"/>
    </svg>
  ),

  // Rare cards
  301: ({ className }) => ( // Twin handle
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
      <rect x="6" y="4" width="4" height="14" fill="#9932CC"/>
      <rect x="14" y="4" width="4" height="14" fill="#9932CC"/>
      <rect x="10" y="8" width="4" height="2" fill="#BA55D3"/>
      <rect x="10" y="12" width="4" height="2" fill="#BA55D3"/>
      <rect x="7" y="18" width="2" height="2" fill="#8B008B"/>
      <rect x="15" y="18" width="2" height="2" fill="#8B008B"/>
    </svg>
  ),
  302: ({ className }) => ( // Vampire vine
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
      <rect x="10" y="4" width="4" height="14" fill="#228B22"/>
      <rect x="6" y="8" width="4" height="2" fill="#32CD32"/>
      <rect x="14" y="8" width="4" height="2" fill="#32CD32"/>
      <rect x="8" y="12" width="2" height="4" fill="#2E8B57"/>
      <rect x="14" y="12" width="2" height="4" fill="#2E8B57"/>
      <rect x="11" y="6" width="2" height="2" fill="#8B0000"/>
      <rect x="11" y="10" width="2" height="2" fill="#8B0000"/>
    </svg>
  ),
  303: ({ className }) => ( // Flamethrower
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
      <rect x="10" y="10" width="4" height="10" fill="#404040"/>
      <rect x="8" y="4" width="8" height="6" fill="#FF4500"/>
      <rect x="10" y="2" width="4" height="4" fill="#FF6600"/>
      <rect x="6" y="6" width="2" height="4" fill="#FFD700"/>
      <rect x="16" y="6" width="2" height="4" fill="#FFD700"/>
      <rect x="11" y="4" width="2" height="2" fill="#FFFF00"/>
    </svg>
  ),
  304: ({ className }) => ( // Heavy warhammer
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
      <rect x="4" y="4" width="16" height="8" fill="#505050"/>
      <rect x="6" y="6" width="4" height="4" fill="#606060"/>
      <rect x="14" y="6" width="4" height="4" fill="#606060"/>
      <rect x="10" y="12" width="4" height="8" fill="#8B4513"/>
      <rect x="11" y="8" width="2" height="4" fill="#404040"/>
    </svg>
  ),
  305: ({ className }) => ( // Mirror of duplication
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
      <rect x="6" y="4" width="12" height="16" fill="#4169E1"/>
      <rect x="8" y="6" width="8" height="12" fill="#87CEEB"/>
      <rect x="10" y="8" width="4" height="8" fill="#E0FFFF"/>
      <rect x="6" y="4" width="2" height="16" fill="#FFD700"/>
      <rect x="16" y="4" width="2" height="16" fill="#FFD700"/>
      <rect x="6" y="4" width="12" height="2" fill="#FFD700"/>
      <rect x="6" y="18" width="12" height="2" fill="#FFD700"/>
    </svg>
  ),
  306: ({ className }) => ( // Twin fangs
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
      <rect x="6" y="4" width="4" height="12" fill="#E8E8DC"/>
      <rect x="14" y="4" width="4" height="12" fill="#E8E8DC"/>
      <rect x="7" y="2" width="2" height="2" fill="#FFFFFF"/>
      <rect x="15" y="2" width="2" height="2" fill="#FFFFFF"/>
      <rect x="8" y="14" width="2" height="2" fill="#8B0000"/>
      <rect x="14" y="14" width="2" height="2" fill="#8B0000"/>
      <rect x="10" y="16" width="4" height="4" fill="#8B4513"/>
    </svg>
  ),
  307: ({ className }) => ( // Midas touch
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
      <rect x="8" y="4" width="8" height="12" fill="#FFD700"/>
      <rect x="10" y="2" width="4" height="2" fill="#FFA500"/>
      <rect x="6" y="8" width="2" height="4" fill="#FFD700"/>
      <rect x="16" y="8" width="2" height="4" fill="#FFD700"/>
      <rect x="10" y="8" width="4" height="4" fill="#FFFF00"/>
      <rect x="10" y="16" width="4" height="4" fill="#8B4513"/>
    </svg>
  ),

  // Legend cards
  401: ({ className }) => ( // Giant's grip
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
      <rect x="6" y="4" width="12" height="16" fill="#8B4513"/>
      <rect x="4" y="8" width="4" height="8" fill="#A0522D"/>
      <rect x="16" y="8" width="4" height="8" fill="#A0522D"/>
      <rect x="8" y="6" width="8" height="12" fill="#654321"/>
      <rect x="10" y="8" width="4" height="8" fill="#FFD700"/>
    </svg>
  ),
  402: ({ className }) => ( // Void crystal
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
      <rect x="8" y="4" width="8" height="16" fill="#4B0082"/>
      <rect x="10" y="2" width="4" height="2" fill="#8B00FF"/>
      <rect x="10" y="20" width="4" height="2" fill="#8B00FF"/>
      <rect x="6" y="8" width="2" height="8" fill="#8B00FF"/>
      <rect x="16" y="8" width="2" height="8" fill="#8B00FF"/>
      <rect x="10" y="8" width="4" height="8" fill="#9400D3"/>
      <rect x="11" y="10" width="2" height="4" fill="#000000"/>
    </svg>
  ),
  403: ({ className }) => ( // Philosopher's stone
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
      <rect x="8" y="6" width="8" height="12" fill="#DC143C"/>
      <rect x="10" y="4" width="4" height="2" fill="#FF4500"/>
      <rect x="10" y="18" width="4" height="2" fill="#FF4500"/>
      <rect x="6" y="10" width="2" height="4" fill="#FF4500"/>
      <rect x="16" y="10" width="2" height="4" fill="#FF4500"/>
      <rect x="10" y="8" width="4" height="8" fill="#FFD700"/>
      <rect x="11" y="10" width="2" height="4" fill="#FFFFFF"/>
    </svg>
  ),
  404: ({ className }) => ( // Meteor fragment
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
      <rect x="8" y="8" width="8" height="8" fill="#8B0000"/>
      <rect x="6" y="10" width="2" height="4" fill="#A52A2A"/>
      <rect x="16" y="10" width="2" height="4" fill="#A52A2A"/>
      <rect x="10" y="6" width="4" height="2" fill="#A52A2A"/>
      <rect x="10" y="16" width="4" height="2" fill="#A52A2A"/>
      <rect x="10" y="10" width="4" height="4" fill="#FF4500"/>
      <rect x="11" y="11" width="2" height="2" fill="#FFD700"/>
      <rect x="4" y="4" width="2" height="2" fill="#FF6600"/>
      <rect x="18" y="18" width="2" height="2" fill="#FF6600"/>
    </svg>
  ),

  // Balance Patch v1.1 - New Common
  215: ({ className }) => ( // Agile blade
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
      <rect x="11" y="2" width="2" height="12" fill="#A0A0A0"/>
      <rect x="10" y="4" width="1" height="8" fill="#C0C0C0"/>
      <rect x="13" y="4" width="1" height="8" fill="#707070"/>
      <rect x="8" y="14" width="8" height="2" fill="#87CEEB"/>
      <rect x="10" y="16" width="4" height="4" fill="#654321"/>
      {/* Speed lines */}
      <rect x="6" y="6" width="2" height="1" fill="#ADD8E6"/>
      <rect x="5" y="9" width="3" height="1" fill="#ADD8E6"/>
      <rect x="16" y="7" width="2" height="1" fill="#ADD8E6"/>
    </svg>
  ),
  218: ({ className }) => ( // Lightweight handle
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
      <rect x="10" y="4" width="4" height="14" fill="#D2B48C"/>
      <rect x="8" y="6" width="2" height="3" fill="#C4A76C"/>
      <rect x="14" y="6" width="2" height="3" fill="#C4A76C"/>
      <rect x="9" y="16" width="6" height="4" fill="#A08060"/>
      {/* Feather decorations */}
      <rect x="6" y="8" width="2" height="4" fill="#E8E8E8"/>
      <rect x="16" y="8" width="2" height="4" fill="#E8E8E8"/>
    </svg>
  ),
  219: ({ className }) => ( // Weakening sigil
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
      <rect x="8" y="8" width="8" height="8" fill="#4A4A4A"/>
      <rect x="10" y="6" width="4" height="2" fill="#3A3A3A"/>
      <rect x="10" y="16" width="4" height="2" fill="#3A3A3A"/>
      <rect x="6" y="10" width="2" height="4" fill="#3A3A3A"/>
      <rect x="16" y="10" width="2" height="4" fill="#3A3A3A"/>
      {/* Skull symbol */}
      <rect x="10" y="10" width="4" height="3" fill="#808080"/>
      <rect x="11" y="10" width="1" height="1" fill="#2D2D2D"/>
      <rect x="12" y="10" width="1" height="1" fill="#2D2D2D"/>
      <rect x="11" y="13" width="2" height="1" fill="#606060"/>
    </svg>
  ),

  // Balance Patch v1.1 - New Rare
  313: ({ className }) => ( // Mana blade
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
      <rect x="11" y="2" width="2" height="12" fill="#4169E1"/>
      <rect x="10" y="4" width="1" height="8" fill="#6495ED"/>
      <rect x="13" y="4" width="1" height="8" fill="#27408B"/>
      <rect x="8" y="14" width="8" height="2" fill="#9400D3"/>
      <rect x="10" y="16" width="4" height="4" fill="#8B008B"/>
      {/* Magic sparkles */}
      <rect x="7" y="6" width="2" height="2" fill="#00FFFF"/>
      <rect x="15" y="8" width="2" height="2" fill="#00FFFF"/>
      <rect x="11" y="6" width="2" height="2" fill="#FFFFFF"/>
    </svg>
  ),
  314: ({ className }) => ( // Frenzy blade
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
      <rect x="11" y="2" width="2" height="12" fill="#8B0000"/>
      <rect x="10" y="4" width="1" height="8" fill="#A52A2A"/>
      <rect x="13" y="4" width="1" height="8" fill="#660000"/>
      <rect x="8" y="14" width="8" height="2" fill="#4A0000"/>
      <rect x="10" y="16" width="4" height="4" fill="#2D0000"/>
      {/* Blood drips */}
      <rect x="9" y="6" width="1" height="3" fill="#FF0000"/>
      <rect x="14" y="8" width="1" height="4" fill="#FF0000"/>
      <rect x="11" y="10" width="2" height="2" fill="#FF4444"/>
    </svg>
  ),
  317: ({ className }) => ( // Piercing handle
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
      <rect x="10" y="4" width="4" height="14" fill="#708090"/>
      <rect x="8" y="6" width="2" height="4" fill="#A0A0A0"/>
      <rect x="14" y="6" width="2" height="4" fill="#A0A0A0"/>
      <rect x="9" y="16" width="6" height="4" fill="#505050"/>
      {/* Sharp spike decorations */}
      <rect x="6" y="8" width="2" height="2" fill="#C0C0C0"/>
      <rect x="5" y="9" width="1" height="1" fill="#E0E0E0"/>
      <rect x="16" y="8" width="2" height="2" fill="#C0C0C0"/>
      <rect x="18" y="9" width="1" height="1" fill="#E0E0E0"/>
    </svg>
  ),
  318: ({ className }) => ( // Blood handle
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
      <rect x="10" y="4" width="4" height="14" fill="#8B4513"/>
      <rect x="8" y="6" width="2" height="4" fill="#A0522D"/>
      <rect x="14" y="6" width="2" height="4" fill="#A0522D"/>
      <rect x="9" y="16" width="6" height="4" fill="#654321"/>
      {/* Blood stains */}
      <rect x="11" y="6" width="2" height="3" fill="#8B0000"/>
      <rect x="10" y="10" width="1" height="2" fill="#B22222"/>
      <rect x="13" y="11" width="1" height="3" fill="#8B0000"/>
      <rect x="9" y="18" width="2" height="1" fill="#660000"/>
    </svg>
  ),
  319: ({ className }) => ( // Blood whetstone
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
      <rect x="4" y="10" width="16" height="8" fill="#8B0000"/>
      <rect x="6" y="8" width="12" height="2" fill="#A52A2A"/>
      <rect x="6" y="18" width="12" height="2" fill="#660000"/>
      <rect x="8" y="12" width="4" height="4" fill="#B22222"/>
      <rect x="14" y="12" width="2" height="2" fill="#FF4444"/>
      {/* Blood drops */}
      <rect x="10" y="6" width="1" height="2" fill="#FF0000"/>
      <rect x="14" y="5" width="1" height="3" fill="#FF0000"/>
    </svg>
  ),
  320: ({ className }) => ( // Berserker rune
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
      <rect x="8" y="8" width="8" height="8" fill="#8B0000"/>
      <rect x="10" y="6" width="4" height="2" fill="#A52A2A"/>
      <rect x="10" y="16" width="4" height="2" fill="#A52A2A"/>
      <rect x="6" y="10" width="2" height="4" fill="#A52A2A"/>
      <rect x="16" y="10" width="2" height="4" fill="#A52A2A"/>
      {/* Rage symbol */}
      <rect x="10" y="10" width="4" height="4" fill="#FF4500"/>
      <rect x="11" y="9" width="2" height="1" fill="#FF6600"/>
      <rect x="11" y="14" width="2" height="1" fill="#FF6600"/>
      <rect x="11" y="11" width="2" height="2" fill="#FFFF00"/>
    </svg>
  ),

  // Balance Patch v1.1 - New Legend
  408: ({ className }) => ( // Frost blade
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
      <rect x="11" y="2" width="2" height="12" fill="#87CEEB"/>
      <rect x="10" y="4" width="1" height="8" fill="#B0E0E6"/>
      <rect x="13" y="4" width="1" height="8" fill="#4682B4"/>
      <rect x="8" y="14" width="8" height="2" fill="#00CED1"/>
      <rect x="10" y="16" width="4" height="4" fill="#008B8B"/>
      {/* Ice crystals */}
      <rect x="7" y="5" width="2" height="2" fill="#E0FFFF"/>
      <rect x="15" y="7" width="2" height="2" fill="#E0FFFF"/>
      <rect x="6" y="10" width="1" height="3" fill="#AFEEEE"/>
      <rect x="17" y="9" width="1" height="3" fill="#AFEEEE"/>
      <rect x="11" y="4" width="2" height="2" fill="#FFFFFF"/>
    </svg>
  ),
  409: ({ className }) => ( // Executioner's blade
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
      <rect x="8" y="2" width="8" height="4" fill="#2F2F2F"/>
      <rect x="10" y="6" width="4" height="10" fill="#404040"/>
      <rect x="8" y="4" width="2" height="6" fill="#505050"/>
      <rect x="14" y="4" width="2" height="6" fill="#505050"/>
      <rect x="9" y="16" width="6" height="4" fill="#8B4513"/>
      {/* Blood on edge */}
      <rect x="7" y="6" width="1" height="4" fill="#8B0000"/>
      <rect x="16" y="5" width="1" height="5" fill="#8B0000"/>
      {/* Skull emblem */}
      <rect x="11" y="8" width="2" height="2" fill="#E8E8DC"/>
      <rect x="11" y="8" width="1" height="1" fill="#2D2D2D"/>
    </svg>
  ),
  412: ({ className }) => ( // Evasion handle
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
      <rect x="10" y="4" width="4" height="14" fill="#4A4A6A"/>
      <rect x="8" y="6" width="2" height="4" fill="#6A6A8A"/>
      <rect x="14" y="6" width="2" height="4" fill="#6A6A8A"/>
      <rect x="9" y="16" width="6" height="4" fill="#3A3A5A"/>
      {/* Wind/smoke trails */}
      <rect x="5" y="7" width="3" height="1" fill="#A0A0C0" opacity="0.7"/>
      <rect x="4" y="10" width="4" height="1" fill="#8080A0" opacity="0.6"/>
      <rect x="6" y="13" width="2" height="1" fill="#A0A0C0" opacity="0.5"/>
      <rect x="16" y="8" width="3" height="1" fill="#A0A0C0" opacity="0.7"/>
      <rect x="15" y="11" width="4" height="1" fill="#8080A0" opacity="0.6"/>
    </svg>
  ),
  413: ({ className }) => ( // Dragon sigil
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
      <rect x="8" y="6" width="8" height="12" fill="#8B0000"/>
      <rect x="10" y="4" width="4" height="2" fill="#A52A2A"/>
      <rect x="10" y="18" width="4" height="2" fill="#A52A2A"/>
      <rect x="6" y="8" width="2" height="8" fill="#A52A2A"/>
      <rect x="16" y="8" width="2" height="8" fill="#A52A2A"/>
      {/* Dragon eye */}
      <rect x="10" y="8" width="4" height="4" fill="#FFD700"/>
      <rect x="11" y="9" width="2" height="2" fill="#FF4500"/>
      <rect x="12" y="10" width="1" height="1" fill="#000000"/>
      {/* Dragon scales */}
      <rect x="9" y="13" width="2" height="2" fill="#B22222"/>
      <rect x="13" y="13" width="2" height="2" fill="#B22222"/>
      <rect x="11" y="15" width="2" height="2" fill="#B22222"/>
    </svg>
  ),

  // Special/Junk
  801: ({ className }) => ( // Shadow weapon
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
      <rect x="10" y="4" width="4" height="14" fill="#1A1A2E" opacity="0.7"/>
      <rect x="8" y="8" width="8" height="2" fill="#16213E" opacity="0.7"/>
      <rect x="11" y="6" width="2" height="2" fill="#E94560"/>
      <rect x="10" y="18" width="4" height="2" fill="#0F0F23"/>
    </svg>
  ),
  901: ({ className }) => ( // Rust chunk
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
      <rect x="6" y="8" width="12" height="10" fill="#8B4513"/>
      <rect x="8" y="6" width="8" height="2" fill="#A0522D"/>
      <rect x="8" y="10" width="4" height="4" fill="#CD853F"/>
      <rect x="14" y="12" width="2" height="2" fill="#D2691E"/>
      <rect x="10" y="14" width="2" height="2" fill="#8B0000"/>
    </svg>
  ),
};

const generatedCardConfigs: Record<number, GeneratedCardSpriteConfig> = {
  106: { kind: 'deco', theme: 'draw', rarity: 'starter', variant: 6 },
  209: { kind: 'head', theme: 'blood', rarity: 'common', variant: 9 },
  210: { kind: 'deco', theme: 'guard', rarity: 'common', variant: 10 },
  211: { kind: 'deco', theme: 'energy', rarity: 'common', variant: 11 },
  212: { kind: 'handle', theme: 'draw', rarity: 'common', variant: 12 },
  213: { kind: 'head', theme: 'poison', rarity: 'common', variant: 13 },
  214: { kind: 'head', theme: 'guard', rarity: 'common', variant: 14 },
  216: { kind: 'handle', theme: 'blood', rarity: 'common', variant: 16 },
  217: { kind: 'handle', theme: 'guard', rarity: 'common', variant: 17 },
  220: { kind: 'handle', theme: 'poison', rarity: 'common', variant: 20 },
  221: { kind: 'handle', theme: 'fire', rarity: 'common', variant: 21 },
  222: { kind: 'handle', theme: 'energy', rarity: 'common', variant: 22 },
  223: { kind: 'handle', theme: 'draw', rarity: 'common', variant: 23 },
  224: { kind: 'handle', theme: 'heavy', rarity: 'common', variant: 24 },
  225: { kind: 'handle', theme: 'multi', rarity: 'common', variant: 25 },
  226: { kind: 'head', theme: 'blood', rarity: 'common', variant: 26 },
  227: { kind: 'head', theme: 'guard', rarity: 'common', variant: 27 },
  228: { kind: 'head', theme: 'poison', rarity: 'common', variant: 28 },
  229: { kind: 'head', theme: 'fire', rarity: 'common', variant: 29 },
  230: { kind: 'head', theme: 'energy', rarity: 'common', variant: 30 },
  231: { kind: 'head', theme: 'draw', rarity: 'common', variant: 31 },
  232: { kind: 'head', theme: 'heavy', rarity: 'common', variant: 32 },
  233: { kind: 'head', theme: 'multi', rarity: 'common', variant: 33 },
  234: { kind: 'head', theme: 'multi', rarity: 'common', variant: 34 },
  235: { kind: 'head', theme: 'poison', rarity: 'common', variant: 35 },
  236: { kind: 'deco', theme: 'blood', rarity: 'common', variant: 36 },
  237: { kind: 'deco', theme: 'guard', rarity: 'common', variant: 37 },
  238: { kind: 'deco', theme: 'poison', rarity: 'common', variant: 38 },
  239: { kind: 'deco', theme: 'fire', rarity: 'common', variant: 39 },
  240: { kind: 'deco', theme: 'energy', rarity: 'common', variant: 40 },
  241: { kind: 'deco', theme: 'draw', rarity: 'common', variant: 41 },
  242: { kind: 'deco', theme: 'heavy', rarity: 'common', variant: 42 },
  243: { kind: 'deco', theme: 'multi', rarity: 'common', variant: 43 },
  244: { kind: 'deco', theme: 'void', rarity: 'common', variant: 44 },
  245: { kind: 'deco', theme: 'fire', rarity: 'common', variant: 45 },
  246: { kind: 'head', theme: 'heavy', rarity: 'common', variant: 46 },
  247: { kind: 'deco', theme: 'heavy', rarity: 'common', variant: 47 },
  308: { kind: 'head', theme: 'energy', rarity: 'rare', variant: 8 },
  309: { kind: 'handle', theme: 'gold', rarity: 'rare', variant: 9 },
  310: { kind: 'head', theme: 'multi', rarity: 'rare', variant: 10 },
  311: { kind: 'deco', theme: 'guard', rarity: 'rare', variant: 11 },
  312: { kind: 'head', theme: 'fire', rarity: 'rare', variant: 12 },
  321: { kind: 'handle', theme: 'blood', rarity: 'rare', variant: 21 },
  322: { kind: 'handle', theme: 'guard', rarity: 'rare', variant: 22 },
  323: { kind: 'handle', theme: 'poison', rarity: 'rare', variant: 23 },
  324: { kind: 'handle', theme: 'fire', rarity: 'rare', variant: 24 },
  325: { kind: 'handle', theme: 'energy', rarity: 'rare', variant: 25 },
  326: { kind: 'handle', theme: 'draw', rarity: 'rare', variant: 26 },
  327: { kind: 'handle', theme: 'heavy', rarity: 'rare', variant: 27 },
  328: { kind: 'handle', theme: 'multi', rarity: 'rare', variant: 28 },
  329: { kind: 'head', theme: 'blood', rarity: 'rare', variant: 29 },
  330: { kind: 'head', theme: 'guard', rarity: 'rare', variant: 30 },
  331: { kind: 'head', theme: 'poison', rarity: 'rare', variant: 31 },
  332: { kind: 'head', theme: 'fire', rarity: 'rare', variant: 32 },
  333: { kind: 'head', theme: 'energy', rarity: 'rare', variant: 33 },
  334: { kind: 'head', theme: 'draw', rarity: 'rare', variant: 34 },
  335: { kind: 'head', theme: 'multi', rarity: 'rare', variant: 35 },
  336: { kind: 'head', theme: 'heavy', rarity: 'rare', variant: 36 },
  337: { kind: 'deco', theme: 'blood', rarity: 'rare', variant: 37 },
  338: { kind: 'deco', theme: 'guard', rarity: 'rare', variant: 38 },
  339: { kind: 'deco', theme: 'poison', rarity: 'rare', variant: 39 },
  340: { kind: 'deco', theme: 'fire', rarity: 'rare', variant: 40 },
  341: { kind: 'deco', theme: 'energy', rarity: 'rare', variant: 41 },
  342: { kind: 'deco', theme: 'draw', rarity: 'rare', variant: 42 },
  343: { kind: 'deco', theme: 'heavy', rarity: 'rare', variant: 43 },
  344: { kind: 'deco', theme: 'multi', rarity: 'rare', variant: 44 },
  405: { kind: 'handle', theme: 'time', rarity: 'legend', variant: 5 },
  406: { kind: 'head', theme: 'time', rarity: 'legend', variant: 6 },
  407: { kind: 'deco', theme: 'growth', rarity: 'legend', variant: 7 },
  414: { kind: 'handle', theme: 'blood', rarity: 'legend', variant: 14 },
  415: { kind: 'handle', theme: 'guard', rarity: 'legend', variant: 15 },
  416: { kind: 'handle', theme: 'draw', rarity: 'legend', variant: 16 },
  417: { kind: 'handle', theme: 'multi', rarity: 'legend', variant: 17 },
  418: { kind: 'head', theme: 'blood', rarity: 'legend', variant: 18 },
  419: { kind: 'head', theme: 'guard', rarity: 'legend', variant: 19 },
  420: { kind: 'head', theme: 'poison', rarity: 'legend', variant: 20 },
  421: { kind: 'head', theme: 'multi', rarity: 'legend', variant: 21 },
  422: { kind: 'deco', theme: 'rage', rarity: 'legend', variant: 22 },
  423: { kind: 'deco', theme: 'guard', rarity: 'legend', variant: 23 },
  424: { kind: 'deco', theme: 'energy', rarity: 'legend', variant: 24 },
  425: { kind: 'deco', theme: 'draw', rarity: 'legend', variant: 25 }
};

Object.entries(generatedCardConfigs).forEach(([cardId, config]) => {
  CardSprites[Number(cardId)] = generatedCardSprite(config);
});

// Default sprite for cards without specific art
export const DefaultCardSprite: React.FC<{ type: string; className?: string }> = ({ type, className }) => {
  switch (type) {
    case 'Handle':
      return (
        <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
          <rect x="10" y="4" width="4" height="14" fill="#C9A04A"/>
          <rect x="8" y="6" width="2" height="4" fill="#9E7A2C"/>
          <rect x="14" y="6" width="2" height="4" fill="#9E7A2C"/>
          <rect x="9" y="18" width="6" height="2" fill="#8B7355"/>
        </svg>
      );
    case 'Head':
      return (
        <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
          <rect x="11" y="2" width="2" height="14" fill="#5A5A7A"/>
          <rect x="10" y="4" width="1" height="10" fill="#7A7A9A"/>
          <rect x="13" y="4" width="1" height="10" fill="#3D3D5C"/>
          <rect x="8" y="16" width="8" height="2" fill="#8B4513"/>
          <rect x="10" y="18" width="4" height="4" fill="#654321"/>
        </svg>
      );
    case 'Deco':
      return (
        <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
          <rect x="8" y="8" width="8" height="8" fill="#2D6B4E"/>
          <rect x="10" y="6" width="4" height="2" fill="#1F4A35"/>
          <rect x="10" y="16" width="4" height="2" fill="#1F4A35"/>
          <rect x="6" y="10" width="2" height="4" fill="#1F4A35"/>
          <rect x="16" y="10" width="2" height="4" fill="#1F4A35"/>
          <rect x="10" y="10" width="4" height="4" fill="#4A9970"/>
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
          <rect x="8" y="8" width="8" height="8" fill="#696969"/>
          <rect x="10" y="10" width="4" height="4" fill="#808080"/>
        </svg>
      );
  }
};

// Helper to get monster sprite with fallback
export const getMonsterSprite = (enemyId: string): React.FC<{ className?: string }> => {
  return MonsterSprites[enemyId] || (({ className }) => (
    <svg viewBox="0 0 32 32" className={className} style={{ imageRendering: 'pixelated' }}>
      <rect x="8" y="8" width="16" height="16" fill="#696969"/>
      <rect x="10" y="10" width="4" height="4" fill="#FF0000"/>
      <rect x="18" y="10" width="4" height="4" fill="#FF0000"/>
      <rect x="12" y="18" width="8" height="2" fill="#2D2D2D"/>
    </svg>
  ));
};

// Helper to get card sprite with fallback
export const getCardSprite = (cardId: number, cardType: string): React.FC<{ className?: string }> => {
  return CardSprites[cardId] || (({ className }) => <DefaultCardSprite type={cardType} className={className} />);
};
