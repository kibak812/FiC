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
  207: ({ className }) => ( // Spike shield
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
      <rect x="6" y="6" width="12" height="14" fill="#4682B4"/>
      <rect x="8" y="8" width="8" height="10" fill="#5A9BD4"/>
      <rect x="4" y="10" width="2" height="2" fill="#C0C0C0"/>
      <rect x="18" y="10" width="2" height="2" fill="#C0C0C0"/>
      <rect x="4" y="14" width="2" height="2" fill="#C0C0C0"/>
      <rect x="18" y="14" width="2" height="2" fill="#C0C0C0"/>
      <rect x="11" y="2" width="2" height="4" fill="#C0C0C0"/>
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
