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

  mine_bat: ({ className }) => (
    <svg viewBox="0 0 32 32" className={className} style={{ imageRendering: 'pixelated' }}>
      {/* Wing span */}
      <rect x="2" y="10" width="8" height="4" fill="#2B2638"/>
      <rect x="22" y="10" width="8" height="4" fill="#2B2638"/>
      <rect x="4" y="14" width="6" height="4" fill="#1D1A28"/>
      <rect x="22" y="14" width="6" height="4" fill="#1D1A28"/>
      <rect x="8" y="8" width="4" height="12" fill="#332C44"/>
      <rect x="20" y="8" width="4" height="12" fill="#332C44"/>
      {/* Body and head */}
      <rect x="12" y="10" width="8" height="12" fill="#3C334D"/>
      <rect x="10" y="6" width="12" height="6" fill="#4B405F"/>
      <rect x="10" y="4" width="2" height="3" fill="#5B4F70"/>
      <rect x="20" y="4" width="2" height="3" fill="#5B4F70"/>
      {/* Mine dust and eyes */}
      <rect x="12" y="8" width="3" height="2" fill="#FF5555"/>
      <rect x="17" y="8" width="3" height="2" fill="#FF5555"/>
      <rect x="13" y="15" width="2" height="2" fill="#8B7355"/>
      <rect x="17" y="17" width="2" height="2" fill="#8B7355"/>
      <rect x="14" y="22" width="2" height="4" fill="#2B2638"/>
      <rect x="16" y="22" width="2" height="4" fill="#2B2638"/>
    </svg>
  ),

  spore_totem: ({ className }) => (
    <svg viewBox="0 0 32 32" className={className} style={{ imageRendering: 'pixelated' }}>
      {/* Wooden idol */}
      <rect x="10" y="9" width="12" height="18" fill="#6B4A2E"/>
      <rect x="8" y="13" width="16" height="4" fill="#7A5636"/>
      <rect x="12" y="6" width="8" height="5" fill="#8A6240"/>
      <rect x="12" y="18" width="8" height="3" fill="#4A301E"/>
      {/* Fungus caps */}
      <rect x="5" y="8" width="8" height="4" fill="#9A3D58"/>
      <rect x="19" y="7" width="8" height="5" fill="#B84E6D"/>
      <rect x="7" y="12" width="4" height="2" fill="#E6B3C2"/>
      <rect x="21" y="12" width="4" height="2" fill="#F4C7D2"/>
      {/* Face cuts */}
      <rect x="12" y="12" width="3" height="3" fill="#1C130B"/>
      <rect x="17" y="12" width="3" height="3" fill="#1C130B"/>
      <rect x="13" y="13" width="1" height="1" fill="#90EE90"/>
      <rect x="18" y="13" width="1" height="1" fill="#90EE90"/>
      {/* Spores */}
      <rect x="4" y="18" width="2" height="2" fill="#A8FF9A"/>
      <rect x="26" y="16" width="2" height="2" fill="#A8FF9A"/>
      <rect x="7" y="23" width="2" height="2" fill="#7CFC7C"/>
      <rect x="24" y="24" width="2" height="2" fill="#7CFC7C"/>
    </svg>
  ),

  shield_mite: ({ className }) => (
    <svg viewBox="0 0 32 32" className={className} style={{ imageRendering: 'pixelated' }}>
      {/* Shield shell */}
      <rect x="8" y="8" width="16" height="14" fill="#5A6F7A"/>
      <rect x="10" y="6" width="12" height="2" fill="#78909C"/>
      <rect x="6" y="12" width="2" height="8" fill="#455A64"/>
      <rect x="24" y="12" width="2" height="8" fill="#455A64"/>
      <rect x="10" y="10" width="12" height="8" fill="#90A4AE"/>
      <rect x="12" y="12" width="8" height="4" fill="#B0BEC5"/>
      <rect x="15" y="9" width="2" height="10" fill="#546E7A"/>
      {/* Small legs */}
      <rect x="5" y="20" width="5" height="2" fill="#263238"/>
      <rect x="22" y="20" width="5" height="2" fill="#263238"/>
      <rect x="7" y="23" width="4" height="2" fill="#263238"/>
      <rect x="21" y="23" width="4" height="2" fill="#263238"/>
      {/* Eyes under shell */}
      <rect x="11" y="18" width="3" height="2" fill="#FFCC33"/>
      <rect x="18" y="18" width="3" height="2" fill="#FFCC33"/>
    </svg>
  ),

  copper_tinker: ({ className }) => (
    <svg viewBox="0 0 32 32" className={className} style={{ imageRendering: 'pixelated' }}>
      {/* Coat and body */}
      <rect x="11" y="14" width="10" height="12" fill="#5B3A24"/>
      <rect x="9" y="17" width="3" height="7" fill="#6E472B"/>
      <rect x="20" y="17" width="3" height="7" fill="#6E472B"/>
      {/* Copper mask */}
      <rect x="10" y="6" width="12" height="9" fill="#B87333"/>
      <rect x="8" y="8" width="16" height="3" fill="#A4602A"/>
      <rect x="12" y="4" width="8" height="2" fill="#D08A42"/>
      <rect x="12" y="9" width="3" height="3" fill="#1C0F08"/>
      <rect x="17" y="9" width="3" height="3" fill="#1C0F08"/>
      <rect x="13" y="10" width="1" height="1" fill="#66E0FF"/>
      <rect x="18" y="10" width="1" height="1" fill="#66E0FF"/>
      {/* Wrench and screw bits */}
      <rect x="23" y="8" width="2" height="14" fill="#8C8C8C"/>
      <rect x="24" y="6" width="4" height="2" fill="#C0C0C0"/>
      <rect x="26" y="8" width="2" height="3" fill="#C0C0C0"/>
      <rect x="6" y="21" width="2" height="2" fill="#D4A017"/>
      <rect x="7" y="25" width="2" height="2" fill="#D4A017"/>
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

  barbed_mine: ({ className }) => (
    <svg viewBox="0 0 32 32" className={className} style={{ imageRendering: 'pixelated' }}>
      {/* Crystal ore body */}
      <rect x="8" y="10" width="16" height="16" fill="#5E6A7A"/>
      <rect x="10" y="8" width="12" height="4" fill="#78909C"/>
      <rect x="6" y="14" width="4" height="10" fill="#4E5966"/>
      <rect x="22" y="14" width="4" height="10" fill="#4E5966"/>
      <rect x="12" y="12" width="8" height="10" fill="#A7BAC8"/>
      <rect x="14" y="14" width="4" height="6" fill="#D6F1FF"/>
      {/* Barbs */}
      <rect x="14" y="3" width="4" height="5" fill="#DCE6F0"/>
      <rect x="3" y="16" width="5" height="3" fill="#DCE6F0"/>
      <rect x="24" y="16" width="5" height="3" fill="#DCE6F0"/>
      <rect x="8" y="25" width="4" height="4" fill="#C0C9D2"/>
      <rect x="20" y="25" width="4" height="4" fill="#C0C9D2"/>
      {/* Warning glow */}
      <rect x="12" y="17" width="2" height="2" fill="#FF4444"/>
      <rect x="18" y="17" width="2" height="2" fill="#FF4444"/>
    </svg>
  ),

  ore_warden: ({ className }) => (
    <svg viewBox="0 0 32 32" className={className} style={{ imageRendering: 'pixelated' }}>
      {/* Armored ore guardian */}
      <rect x="9" y="11" width="14" height="16" fill="#4D5863"/>
      <rect x="7" y="15" width="4" height="10" fill="#39434D"/>
      <rect x="21" y="15" width="4" height="10" fill="#39434D"/>
      <rect x="11" y="7" width="10" height="6" fill="#687785"/>
      <rect x="12" y="13" width="8" height="3" fill="#9AAAB6"/>
      <rect x="12" y="18" width="8" height="2" fill="#2E353C"/>
      {/* Ore veins */}
      <rect x="10" y="20" width="3" height="2" fill="#D4A017"/>
      <rect x="18" y="21" width="3" height="2" fill="#FFD45A"/>
      <rect x="15" y="10" width="2" height="2" fill="#FFD45A"/>
      {/* Broad shield */}
      <rect x="3" y="13" width="7" height="12" fill="#546E7A"/>
      <rect x="5" y="15" width="3" height="8" fill="#90A4AE"/>
      {/* Eye slit */}
      <rect x="13" y="9" width="6" height="2" fill="#1A0F00"/>
      <rect x="15" y="9" width="2" height="2" fill="#FFCC33"/>
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

  cave_heart: ({ className }) => (
    <svg viewBox="0 0 32 32" className={className} style={{ imageRendering: 'pixelated' }}>
      {/* Crystal heart core */}
      <rect x="10" y="8" width="5" height="5" fill="#8B1E3F"/>
      <rect x="17" y="8" width="5" height="5" fill="#8B1E3F"/>
      <rect x="8" y="12" width="16" height="8" fill="#B0305C"/>
      <rect x="10" y="20" width="12" height="4" fill="#7A1735"/>
      <rect x="12" y="24" width="8" height="3" fill="#4A0C20"/>
      <rect x="12" y="12" width="8" height="5" fill="#FF5C8A"/>
      <rect x="14" y="14" width="4" height="3" fill="#FFD1DC"/>
      {/* Stone ribs */}
      <rect x="4" y="10" width="5" height="3" fill="#606A70"/>
      <rect x="23" y="10" width="5" height="3" fill="#606A70"/>
      <rect x="3" y="18" width="6" height="3" fill="#4B555B"/>
      <rect x="23" y="18" width="6" height="3" fill="#4B555B"/>
      {/* Root veins */}
      <rect x="6" y="23" width="5" height="2" fill="#7A1735"/>
      <rect x="21" y="23" width="5" height="2" fill="#7A1735"/>
      <rect x="15" y="5" width="2" height="3" fill="#FF5C8A"/>
      <rect x="15" y="27" width="2" height="3" fill="#FF5C8A"/>
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

  ash_leech: ({ className }) => (
    <svg viewBox="0 0 32 32" className={className} style={{ imageRendering: 'pixelated' }}>
      {/* Soot body */}
      <rect x="7" y="15" width="18" height="8" fill="#2A2522"/>
      <rect x="5" y="17" width="4" height="4" fill="#1C1816"/>
      <rect x="23" y="17" width="4" height="4" fill="#1C1816"/>
      <rect x="9" y="12" width="14" height="5" fill="#40342F"/>
      <rect x="11" y="10" width="10" height="3" fill="#5A4035"/>
      {/* Heated belly */}
      <rect x="11" y="16" width="10" height="4" fill="#7A1E00"/>
      <rect x="13" y="17" width="6" height="2" fill="#FF6600"/>
      <rect x="15" y="17" width="2" height="1" fill="#FFFF66"/>
      {/* Mouth hooks */}
      <rect x="4" y="18" width="3" height="2" fill="#C0C0C0"/>
      <rect x="25" y="18" width="3" height="2" fill="#C0C0C0"/>
      <rect x="12" y="11" width="2" height="2" fill="#FFB000"/>
      <rect x="18" y="11" width="2" height="2" fill="#FFB000"/>
      {/* Ash flecks */}
      <rect x="8" y="7" width="2" height="2" fill="#8A7A70"/>
      <rect x="22" y="8" width="2" height="2" fill="#8A7A70"/>
      <rect x="16" y="25" width="2" height="2" fill="#5A504A"/>
    </svg>
  ),

  furnace_sentry: ({ className }) => (
    <svg viewBox="0 0 32 32" className={className} style={{ imageRendering: 'pixelated' }}>
      {/* Furnace armor */}
      <rect x="9" y="9" width="14" height="18" fill="#4D4D4D"/>
      <rect x="7" y="13" width="4" height="12" fill="#3A3A3A"/>
      <rect x="21" y="13" width="4" height="12" fill="#3A3A3A"/>
      <rect x="11" y="6" width="10" height="5" fill="#5C5C5C"/>
      <rect x="12" y="13" width="8" height="8" fill="#1F1710"/>
      {/* Furnace glow */}
      <rect x="13" y="14" width="6" height="5" fill="#FF4500"/>
      <rect x="15" y="15" width="2" height="3" fill="#FFFF66"/>
      <rect x="12" y="22" width="8" height="2" fill="#7A1E00"/>
      {/* Shield blade */}
      <rect x="3" y="12" width="6" height="13" fill="#7A4D38"/>
      <rect x="4" y="14" width="4" height="9" fill="#C46A3A"/>
      <rect x="5" y="16" width="2" height="5" fill="#FFB000"/>
      {/* Eye slit and steam */}
      <rect x="12" y="8" width="8" height="2" fill="#200A00"/>
      <rect x="14" y="8" width="4" height="2" fill="#FFB000"/>
      <rect x="24" y="6" width="2" height="2" fill="#CCCCCC"/>
      <rect x="26" y="4" width="2" height="2" fill="#AAAAAA"/>
    </svg>
  ),

  coal_imp: ({ className }) => (
    <svg viewBox="0 0 32 32" className={className} style={{ imageRendering: 'pixelated' }}>
      {/* Charcoal body */}
      <rect x="10" y="13" width="12" height="13" fill="#25201E"/>
      <rect x="8" y="16" width="4" height="8" fill="#1A1513"/>
      <rect x="20" y="16" width="4" height="8" fill="#1A1513"/>
      <rect x="11" y="6" width="10" height="9" fill="#302724"/>
      {/* Horns and soot grin */}
      <rect x="7" y="5" width="5" height="3" fill="#6B1300"/>
      <rect x="20" y="5" width="5" height="3" fill="#6B1300"/>
      <rect x="12" y="9" width="3" height="3" fill="#FF6600"/>
      <rect x="17" y="9" width="3" height="3" fill="#FF6600"/>
      <rect x="13" y="10" width="1" height="1" fill="#FFFF66"/>
      <rect x="18" y="10" width="1" height="1" fill="#FFFF66"/>
      <rect x="13" y="13" width="6" height="2" fill="#080604"/>
      {/* Burning cracks */}
      <rect x="12" y="17" width="2" height="5" fill="#FF4500"/>
      <rect x="18" y="18" width="2" height="4" fill="#B22222"/>
      <rect x="15" y="23" width="2" height="2" fill="#FFB000"/>
      <rect x="5" y="22" width="2" height="2" fill="#55504C"/>
      <rect x="25" y="21" width="2" height="2" fill="#55504C"/>
    </svg>
  ),

  cinder_rat: ({ className }) => (
    <svg viewBox="0 0 32 32" className={className} style={{ imageRendering: 'pixelated' }}>
      {/* Low cinder body */}
      <rect x="8" y="17" width="16" height="8" fill="#3A302A"/>
      <rect x="6" y="19" width="4" height="4" fill="#2A211D"/>
      <rect x="22" y="15" width="5" height="7" fill="#4B382E"/>
      <rect x="24" y="12" width="3" height="4" fill="#6B4A36"/>
      <rect x="12" y="14" width="10" height="4" fill="#4A3A31"/>
      {/* Ember spine */}
      <rect x="10" y="15" width="3" height="2" fill="#FF6600"/>
      <rect x="15" y="14" width="3" height="2" fill="#FFB000"/>
      <rect x="20" y="15" width="3" height="2" fill="#FF4500"/>
      {/* Eye, teeth, tail */}
      <rect x="24" y="16" width="2" height="2" fill="#FFFF66"/>
      <rect x="27" y="18" width="2" height="1" fill="#FFFFFF"/>
      <rect x="3" y="21" width="5" height="2" fill="#5A4035"/>
      <rect x="1" y="19" width="2" height="2" fill="#5A4035"/>
      <rect x="11" y="25" width="3" height="2" fill="#1C1714"/>
      <rect x="19" y="25" width="3" height="2" fill="#1C1714"/>
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

  glass_golem: ({ className }) => (
    <svg viewBox="0 0 32 32" className={className} style={{ imageRendering: 'pixelated' }}>
      {/* Glass shards body */}
      <rect x="9" y="10" width="14" height="16" fill="#77BFD6"/>
      <rect x="11" y="7" width="10" height="5" fill="#BFEFFF"/>
      <rect x="6" y="14" width="5" height="9" fill="#5AA9C9"/>
      <rect x="21" y="14" width="5" height="9" fill="#5AA9C9"/>
      <rect x="12" y="13" width="7" height="7" fill="#E8FFFF"/>
      <rect x="14" y="15" width="3" height="3" fill="#FFFFFF"/>
      {/* Jagged edges */}
      <rect x="8" y="6" width="3" height="3" fill="#D9FFFF"/>
      <rect x="21" y="8" width="3" height="3" fill="#D9FFFF"/>
      <rect x="5" y="23" width="4" height="3" fill="#BFEFFF"/>
      <rect x="23" y="23" width="4" height="3" fill="#BFEFFF"/>
      <rect x="13" y="25" width="6" height="3" fill="#458BA8"/>
      {/* Prism core */}
      <rect x="13" y="11" width="2" height="2" fill="#FF66CC"/>
      <rect x="17" y="11" width="2" height="2" fill="#66FFFF"/>
    </svg>
  ),

  cinder_archivist: ({ className }) => (
    <svg viewBox="0 0 32 32" className={className} style={{ imageRendering: 'pixelated' }}>
      {/* Robe and mask */}
      <rect x="10" y="12" width="12" height="15" fill="#342820"/>
      <rect x="8" y="16" width="4" height="9" fill="#2A201A"/>
      <rect x="20" y="16" width="4" height="9" fill="#2A201A"/>
      <rect x="11" y="5" width="10" height="8" fill="#5A4638"/>
      <rect x="12" y="7" width="8" height="5" fill="#1F1712"/>
      <rect x="13" y="8" width="2" height="2" fill="#FFB000"/>
      <rect x="17" y="8" width="2" height="2" fill="#FFB000"/>
      {/* Burning ledger */}
      <rect x="4" y="13" width="8" height="10" fill="#6B4A36"/>
      <rect x="5" y="14" width="6" height="8" fill="#D8C7A3"/>
      <rect x="6" y="16" width="4" height="1" fill="#5A4035"/>
      <rect x="6" y="18" width="3" height="1" fill="#5A4035"/>
      <rect x="4" y="11" width="2" height="3" fill="#FF6600"/>
      <rect x="6" y="10" width="2" height="2" fill="#FFFF66"/>
      {/* Ash pages */}
      <rect x="23" y="13" width="4" height="2" fill="#B0A090"/>
      <rect x="24" y="17" width="3" height="2" fill="#8A8078"/>
      <rect x="14" y="22" width="4" height="2" fill="#7A1E00"/>
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

  molten_overseer: ({ className }) => (
    <svg viewBox="0 0 32 32" className={className} style={{ imageRendering: 'pixelated' }}>
      {/* Overseer frame */}
      <rect x="8" y="9" width="16" height="18" fill="#4A2A20"/>
      <rect x="6" y="14" width="5" height="11" fill="#5A3424"/>
      <rect x="21" y="14" width="5" height="11" fill="#5A3424"/>
      <rect x="10" y="5" width="12" height="6" fill="#7A3C22"/>
      <rect x="12" y="12" width="8" height="9" fill="#1F0900"/>
      {/* Molten core */}
      <rect x="13" y="13" width="6" height="7" fill="#FF4500"/>
      <rect x="15" y="14" width="2" height="5" fill="#FFFF66"/>
      <rect x="10" y="22" width="12" height="3" fill="#7A1E00"/>
      {/* Dual hammers */}
      <rect x="2" y="10" width="7" height="5" fill="#686868"/>
      <rect x="5" y="15" width="2" height="10" fill="#8B4513"/>
      <rect x="23" y="10" width="7" height="5" fill="#686868"/>
      <rect x="25" y="15" width="2" height="10" fill="#8B4513"/>
      {/* Crown vents */}
      <rect x="12" y="2" width="2" height="3" fill="#FFB000"/>
      <rect x="18" y="2" width="2" height="3" fill="#FFB000"/>
      <rect x="13" y="7" width="2" height="2" fill="#FFFF66"/>
      <rect x="17" y="7" width="2" height="2" fill="#FFFF66"/>
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

  null_priest: ({ className }) => (
    <svg viewBox="0 0 32 32" className={className} style={{ imageRendering: 'pixelated' }}>
      {/* Null robes */}
      <rect x="10" y="11" width="12" height="16" fill="#211B33"/>
      <rect x="8" y="15" width="4" height="10" fill="#171225"/>
      <rect x="20" y="15" width="4" height="10" fill="#171225"/>
      <rect x="11" y="5" width="10" height="8" fill="#2E254A"/>
      <rect x="13" y="7" width="6" height="5" fill="#050308"/>
      {/* Void halo */}
      <rect x="9" y="2" width="14" height="2" fill="#7C6BC4"/>
      <rect x="7" y="4" width="2" height="2" fill="#D9D0FF"/>
      <rect x="23" y="4" width="2" height="2" fill="#D9D0FF"/>
      <rect x="14" y="9" width="4" height="2" fill="#9A45FF"/>
      {/* Data deletion staff */}
      <rect x="25" y="8" width="2" height="17" fill="#4B3B78"/>
      <rect x="23" y="7" width="6" height="2" fill="#9A45FF"/>
      <rect x="24" y="11" width="4" height="2" fill="#000000"/>
      {/* Null motes */}
      <rect x="4" y="10" width="2" height="2" fill="#9A45FF"/>
      <rect x="5" y="22" width="2" height="2" fill="#4B0082"/>
      <rect x="26" y="25" width="2" height="2" fill="#D9D0FF"/>
    </svg>
  ),

  tax_clock: ({ className }) => (
    <svg viewBox="0 0 32 32" className={className} style={{ imageRendering: 'pixelated' }}>
      {/* Clock body */}
      <rect x="8" y="7" width="16" height="16" fill="#6B5B3E"/>
      <rect x="10" y="5" width="12" height="2" fill="#D4A017"/>
      <rect x="10" y="23" width="12" height="2" fill="#3E3320"/>
      <rect x="6" y="11" width="2" height="8" fill="#D4A017"/>
      <rect x="24" y="11" width="2" height="8" fill="#D4A017"/>
      <rect x="10" y="9" width="12" height="12" fill="#E8D9A8"/>
      <rect x="12" y="11" width="8" height="8" fill="#2A2118"/>
      {/* Hands and tax mark */}
      <rect x="15" y="12" width="2" height="5" fill="#FFD700"/>
      <rect x="16" y="16" width="4" height="1" fill="#FFD700"/>
      <rect x="13" y="17" width="2" height="2" fill="#D4A017"/>
      <rect x="17" y="13" width="2" height="2" fill="#D4A017"/>
      <rect x="14" y="26" width="4" height="3" fill="#6B5B3E"/>
      <rect x="13" y="29" width="6" height="1" fill="#D4A017"/>
      {/* Ledger teeth */}
      <rect x="3" y="20" width="5" height="2" fill="#E8D9A8"/>
      <rect x="24" y="20" width="5" height="2" fill="#E8D9A8"/>
    </svg>
  ),

  scrap_drone_swarm: ({ className }) => (
    <svg viewBox="0 0 32 32" className={className} style={{ imageRendering: 'pixelated' }}>
      {/* Three small drones */}
      <rect x="4" y="9" width="7" height="6" fill="#4A4A4A"/>
      <rect x="13" y="6" width="7" height="6" fill="#5A5A5A"/>
      <rect x="22" y="11" width="7" height="6" fill="#4A4A4A"/>
      <rect x="6" y="11" width="3" height="2" fill="#00FFFF"/>
      <rect x="15" y="8" width="3" height="2" fill="#00FFFF"/>
      <rect x="24" y="13" width="3" height="2" fill="#00FFFF"/>
      {/* Rotors */}
      <rect x="2" y="7" width="11" height="1" fill="#A0A0A0"/>
      <rect x="11" y="4" width="11" height="1" fill="#A0A0A0"/>
      <rect x="20" y="9" width="11" height="1" fill="#A0A0A0"/>
      <rect x="7" y="15" width="2" height="4" fill="#2F2F2F"/>
      <rect x="16" y="12" width="2" height="4" fill="#2F2F2F"/>
      <rect x="25" y="17" width="2" height="4" fill="#2F2F2F"/>
      {/* Chain fire */}
      <rect x="7" y="22" width="2" height="2" fill="#FFD700"/>
      <rect x="16" y="19" width="2" height="2" fill="#FFD700"/>
      <rect x="25" y="24" width="2" height="2" fill="#FFD700"/>
    </svg>
  ),

  ledger_wraith: ({ className }) => (
    <svg viewBox="0 0 32 32" className={className} style={{ imageRendering: 'pixelated' }}>
      {/* Torn accounting robe */}
      <rect x="10" y="9" width="12" height="13" fill="#233043"/>
      <rect x="8" y="13" width="4" height="9" fill="#1A2433"/>
      <rect x="20" y="13" width="4" height="9" fill="#1A2433"/>
      <rect x="11" y="22" width="3" height="4" fill="#233043"/>
      <rect x="15" y="22" width="3" height="6" fill="#1A2433"/>
      <rect x="19" y="22" width="3" height="4" fill="#233043"/>
      {/* Ledger face */}
      <rect x="9" y="5" width="14" height="7" fill="#D8D0B0"/>
      <rect x="11" y="7" width="10" height="1" fill="#6B5B3E"/>
      <rect x="11" y="9" width="8" height="1" fill="#6B5B3E"/>
      <rect x="12" y="11" width="3" height="2" fill="#00FFFF"/>
      <rect x="17" y="11" width="3" height="2" fill="#00FFFF"/>
      {/* Debt chains */}
      <rect x="4" y="14" width="5" height="2" fill="#A0A0A0"/>
      <rect x="23" y="16" width="5" height="2" fill="#A0A0A0"/>
      <rect x="5" y="18" width="3" height="2" fill="#808080"/>
      <rect x="24" y="20" width="3" height="2" fill="#808080"/>
      <rect x="14" y="17" width="4" height="2" fill="#D4A017"/>
    </svg>
  ),

  bulwark_sentinel: ({ className }) => (
    <svg viewBox="0 0 32 32" className={className} style={{ imageRendering: 'pixelated' }}>
      {/* Massive shield body */}
      <rect x="7" y="6" width="18" height="20" fill="#3E5366"/>
      <rect x="9" y="8" width="14" height="16" fill="#5F7890"/>
      <rect x="11" y="10" width="10" height="12" fill="#9BB2C8"/>
      <rect x="15" y="7" width="2" height="17" fill="#DCE6F0"/>
      <rect x="10" y="15" width="12" height="2" fill="#DCE6F0"/>
      {/* Sentinel head behind shield */}
      <rect x="11" y="3" width="10" height="5" fill="#2E3A44"/>
      <rect x="13" y="5" width="6" height="2" fill="#00FFFF"/>
      {/* Anchor legs and spikes */}
      <rect x="9" y="26" width="4" height="3" fill="#2E3A44"/>
      <rect x="19" y="26" width="4" height="3" fill="#2E3A44"/>
      <rect x="4" y="12" width="3" height="3" fill="#DCE6F0"/>
      <rect x="25" y="12" width="3" height="3" fill="#DCE6F0"/>
      <rect x="4" y="20" width="3" height="3" fill="#DCE6F0"/>
      <rect x="25" y="20" width="3" height="3" fill="#DCE6F0"/>
    </svg>
  ),

  gear_leech: ({ className }) => (
    <svg viewBox="0 0 32 32" className={className} style={{ imageRendering: 'pixelated' }}>
      {/* Mechanical leech body */}
      <rect x="6" y="15" width="20" height="7" fill="#4C5660"/>
      <rect x="8" y="12" width="16" height="4" fill="#6A7480"/>
      <rect x="10" y="19" width="12" height="4" fill="#2E353C"/>
      <rect x="24" y="16" width="4" height="4" fill="#8A94A0"/>
      <rect x="4" y="17" width="4" height="3" fill="#2E353C"/>
      {/* Gear teeth */}
      <rect x="9" y="10" width="2" height="2" fill="#B8860B"/>
      <rect x="14" y="9" width="2" height="2" fill="#B8860B"/>
      <rect x="19" y="10" width="2" height="2" fill="#B8860B"/>
      <rect x="11" y="23" width="2" height="2" fill="#B8860B"/>
      <rect x="18" y="23" width="2" height="2" fill="#B8860B"/>
      {/* Drain lamp and mouth */}
      <rect x="25" y="15" width="2" height="2" fill="#00FFFF"/>
      <rect x="26" y="19" width="2" height="1" fill="#1A0F00"/>
      <rect x="13" y="15" width="2" height="5" fill="#00FFFF"/>
      <rect x="17" y="15" width="2" height="5" fill="#4169E1"/>
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

  paradox_jailer: ({ className }) => (
    <svg viewBox="0 0 32 32" className={className} style={{ imageRendering: 'pixelated' }}>
      {/* Clock cage */}
      <rect x="8" y="6" width="16" height="20" fill="#2D254A"/>
      <rect x="10" y="8" width="12" height="16" fill="#171225"/>
      <rect x="11" y="8" width="2" height="16" fill="#7C6BC4"/>
      <rect x="15" y="8" width="2" height="16" fill="#7C6BC4"/>
      <rect x="19" y="8" width="2" height="16" fill="#7C6BC4"/>
      <rect x="8" y="12" width="16" height="2" fill="#D4AF37"/>
      <rect x="8" y="20" width="16" height="2" fill="#D4AF37"/>
      {/* Prisoner eye in clock */}
      <rect x="12" y="14" width="8" height="6" fill="#D9D0FF"/>
      <rect x="14" y="15" width="4" height="4" fill="#4B0082"/>
      <rect x="15" y="16" width="2" height="2" fill="#000000"/>
      {/* Key and time tears */}
      <rect x="24" y="10" width="2" height="10" fill="#D4AF37"/>
      <rect x="23" y="9" width="4" height="3" fill="#FFF4A8"/>
      <rect x="26" y="19" width="2" height="2" fill="#D4AF37"/>
      <rect x="5" y="7" width="2" height="2" fill="#9A45FF"/>
      <rect x="4" y="24" width="2" height="2" fill="#D9D0FF"/>
      <rect x="26" y="25" width="2" height="2" fill="#9A45FF"/>
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

  clockwork_seraph: ({ className }) => (
    <svg viewBox="0 0 32 32" className={className} style={{ imageRendering: 'pixelated' }}>
      {/* Seraph machine body */}
      <rect x="11" y="10" width="10" height="14" fill="#F0DFA0"/>
      <rect x="9" y="13" width="14" height="9" fill="#D4AF37"/>
      <rect x="13" y="6" width="6" height="6" fill="#FFF4A8"/>
      <rect x="14" y="8" width="4" height="3" fill="#2C2C54"/>
      <rect x="15" y="9" width="2" height="1" fill="#00FFFF"/>
      {/* Gear wings */}
      <rect x="2" y="8" width="8" height="4" fill="#C0C0C0"/>
      <rect x="3" y="12" width="7" height="4" fill="#E8E8E8"/>
      <rect x="4" y="16" width="6" height="4" fill="#B0B0B0"/>
      <rect x="22" y="8" width="8" height="4" fill="#C0C0C0"/>
      <rect x="22" y="12" width="7" height="4" fill="#E8E8E8"/>
      <rect x="22" y="16" width="6" height="4" fill="#B0B0B0"/>
      <rect x="6" y="10" width="2" height="8" fill="#D4AF37"/>
      <rect x="24" y="10" width="2" height="8" fill="#D4AF37"/>
      {/* Halo and judgment core */}
      <rect x="11" y="2" width="10" height="2" fill="#FFD700"/>
      <rect x="9" y="4" width="2" height="2" fill="#FFD700"/>
      <rect x="21" y="4" width="2" height="2" fill="#FFD700"/>
      <rect x="14" y="14" width="4" height="4" fill="#FFFFFF"/>
      <rect x="15" y="15" width="2" height="2" fill="#4169E1"/>
      <rect x="13" y="24" width="2" height="4" fill="#D4AF37"/>
      <rect x="17" y="24" width="2" height="4" fill="#D4AF37"/>
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
  motif?: keyof typeof GENERATED_CARD_MOTIFS;
}

interface GeneratedThemePalette {
  dark: string;
  base: string;
  light: string;
  spark: string;
}

const THEME_PALETTES: Record<GeneratedCardTheme, GeneratedThemePalette> = {
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

type GeneratedMotifColor =
  | 'dark'
  | 'base'
  | 'light'
  | 'spark'
  | 'frame'
  | 'black'
  | 'white'
  | 'red'
  | 'gold'
  | 'steel'
  | 'paper'
  | 'green'
  | 'blue';
type GeneratedMotifRect = readonly [number, number, number, number, GeneratedMotifColor];

const GENERATED_CARD_MOTIFS: Record<string, readonly GeneratedMotifRect[]> = {
  frayedCord: [[7, 9, 10, 2, 'paper'], [8, 11, 8, 1, 'dark'], [9, 12, 2, 5, 'light'], [14, 12, 2, 4, 'light'], [6, 17, 2, 2, 'paper']],
  gearWheel: [[8, 8, 8, 8, 'steel'], [10, 6, 4, 2, 'steel'], [10, 16, 4, 2, 'steel'], [6, 10, 2, 4, 'steel'], [16, 10, 2, 4, 'steel'], [11, 11, 2, 2, 'dark']],
  thornMark: [[11, 5, 2, 12, 'steel'], [7, 11, 4, 2, 'steel'], [13, 11, 4, 2, 'steel'], [10, 8, 4, 1, 'green'], [10, 15, 4, 1, 'green']],
  batteryCell: [[8, 6, 8, 13, 'base'], [10, 4, 4, 2, 'frame'], [9, 8, 6, 2, 'light'], [9, 13, 6, 2, 'light'], [11, 9, 2, 6, 'spark']],
  lightGrip: [[9, 6, 6, 11, 'paper'], [8, 8, 1, 7, 'white'], [15, 8, 1, 7, 'steel'], [10, 17, 4, 2, 'dark'], [6, 11, 3, 1, 'spark']],
  poisonNeedle: [[12, 4, 2, 13, 'green'], [10, 7, 2, 8, 'base'], [14, 9, 1, 6, 'spark'], [9, 5, 2, 2, 'green'], [16, 16, 2, 2, 'green']],
  bluntClub: [[9, 4, 6, 12, 'base'], [8, 6, 8, 5, 'dark'], [10, 16, 4, 4, 'dark'], [11, 7, 2, 2, 'steel'], [14, 10, 2, 2, 'steel']],
  bloodGrip: [[10, 5, 4, 13, 'dark'], [9, 8, 1, 7, 'red'], [14, 9, 1, 6, 'red'], [11, 6, 2, 2, 'spark'], [9, 18, 6, 2, 'black']],
  shieldGrip: [[8, 7, 8, 9, 'base'], [9, 8, 6, 6, 'light'], [11, 6, 2, 11, 'frame'], [7, 10, 10, 2, 'frame'], [10, 17, 4, 2, 'dark']],
  venomCoil: [[8, 6, 8, 11, 'dark'], [10, 7, 5, 2, 'green'], [9, 10, 5, 2, 'green'], [10, 13, 5, 2, 'green'], [13, 16, 2, 2, 'spark']],
  emberWrap: [[9, 6, 6, 12, 'dark'], [10, 7, 4, 2, 'red'], [9, 11, 6, 2, 'gold'], [11, 14, 2, 3, 'spark'], [15, 6, 2, 5, 'red']],
  conductorGrip: [[10, 5, 4, 13, 'base'], [8, 8, 8, 2, 'blue'], [8, 14, 8, 2, 'blue'], [12, 6, 1, 10, 'spark'], [15, 12, 2, 2, 'white']],
  scribeGrip: [[8, 6, 8, 11, 'paper'], [9, 7, 6, 1, 'dark'], [9, 10, 5, 1, 'dark'], [9, 13, 6, 1, 'dark'], [15, 8, 2, 7, 'spark']],
  heavyGrip: [[7, 6, 10, 11, 'base'], [8, 8, 8, 7, 'dark'], [10, 5, 4, 2, 'steel'], [6, 11, 2, 3, 'steel'], [16, 11, 2, 3, 'steel']],
  splitGrip: [[7, 6, 4, 12, 'base'], [13, 6, 4, 12, 'base'], [11, 8, 2, 8, 'spark'], [8, 18, 8, 2, 'dark'], [9, 7, 1, 9, 'light']],
  woundRake: [[7, 5, 3, 12, 'steel'], [11, 4, 3, 13, 'steel'], [15, 6, 3, 11, 'steel'], [8, 15, 9, 2, 'red'], [10, 18, 4, 2, 'dark']],
  guardAxe: [[7, 6, 10, 7, 'steel'], [9, 8, 6, 3, 'light'], [11, 13, 2, 7, 'dark'], [6, 10, 3, 3, 'frame'], [15, 10, 3, 3, 'frame']],
  venomBlade: [[11, 4, 2, 12, 'green'], [10, 6, 1, 8, 'spark'], [13, 6, 1, 8, 'base'], [8, 13, 8, 2, 'frame'], [15, 4, 2, 2, 'green']],
  forgeBlade: [[10, 4, 4, 12, 'red'], [11, 5, 2, 8, 'gold'], [8, 15, 8, 2, 'frame'], [9, 7, 2, 3, 'spark'], [14, 10, 2, 4, 'base']],
  sparkDagger: [[12, 4, 2, 12, 'blue'], [10, 7, 2, 7, 'spark'], [8, 15, 8, 2, 'frame'], [16, 8, 2, 2, 'white'], [7, 11, 2, 2, 'blue']],
  scribeBlade: [[11, 4, 2, 12, 'paper'], [9, 7, 1, 7, 'spark'], [13, 6, 2, 8, 'base'], [8, 15, 8, 2, 'frame'], [15, 12, 3, 1, 'white']],
  cleaver: [[8, 4, 8, 11, 'steel'], [10, 5, 5, 8, 'light'], [8, 15, 8, 2, 'frame'], [10, 17, 4, 3, 'dark'], [7, 7, 2, 4, 'red']],
  trident: [[7, 5, 2, 11, 'steel'], [11, 4, 2, 12, 'steel'], [15, 5, 2, 11, 'steel'], [8, 15, 8, 2, 'frame'], [11, 7, 2, 2, 'spark']],
  chainSaw: [[7, 6, 10, 8, 'steel'], [8, 7, 8, 5, 'dark'], [7, 14, 10, 2, 'frame'], [8, 5, 2, 2, 'steel'], [14, 5, 2, 2, 'steel']],
  corrosionGear: [[8, 8, 8, 8, 'green'], [10, 6, 4, 2, 'steel'], [6, 10, 2, 4, 'steel'], [16, 10, 2, 4, 'steel'], [11, 11, 2, 2, 'black']],
  bloodCharm: [[9, 7, 6, 8, 'red'], [11, 5, 2, 3, 'spark'], [10, 15, 4, 3, 'dark'], [8, 10, 2, 2, 'red'], [14, 10, 2, 2, 'red']],
  shieldShard: [[7, 8, 10, 8, 'steel'], [9, 9, 6, 5, 'light'], [11, 7, 2, 10, 'frame'], [8, 16, 3, 2, 'dark'], [15, 14, 2, 3, 'dark']],
  poisonPouch: [[8, 9, 8, 8, 'green'], [10, 7, 4, 2, 'paper'], [9, 12, 6, 3, 'base'], [7, 16, 2, 2, 'green'], [16, 7, 2, 2, 'spark']],
  emberCharm: [[8, 8, 8, 9, 'red'], [10, 6, 4, 2, 'gold'], [10, 10, 4, 5, 'gold'], [11, 11, 2, 3, 'spark'], [7, 15, 2, 2, 'red']],
  spring: [[8, 7, 8, 2, 'steel'], [9, 10, 6, 2, 'blue'], [8, 13, 8, 2, 'steel'], [9, 16, 6, 2, 'blue'], [12, 8, 1, 9, 'spark']],
  recordRibbon: [[6, 8, 12, 2, 'paper'], [7, 11, 10, 2, 'light'], [8, 14, 8, 2, 'paper'], [16, 9, 2, 7, 'frame'], [9, 12, 5, 1, 'dark']],
  weight: [[8, 10, 8, 8, 'steel'], [10, 7, 4, 3, 'dark'], [9, 12, 6, 4, 'base'], [7, 18, 10, 2, 'dark'], [11, 11, 2, 2, 'light']],
  twinNeedle: [[8, 5, 2, 12, 'steel'], [14, 5, 2, 12, 'steel'], [7, 16, 10, 2, 'frame'], [9, 8, 1, 6, 'spark'], [15, 8, 1, 6, 'spark']],
  slowDust: [[8, 8, 8, 8, 'paper'], [9, 9, 2, 2, 'dark'], [13, 10, 2, 2, 'dark'], [10, 14, 5, 1, 'steel'], [6, 17, 2, 2, 'paper']],
  flint: [[8, 8, 9, 7, 'steel'], [9, 9, 6, 4, 'dark'], [13, 5, 2, 4, 'red'], [15, 6, 2, 3, 'gold'], [10, 15, 4, 2, 'frame']],
  mace: [[8, 5, 8, 8, 'steel'], [10, 3, 4, 2, 'steel'], [6, 8, 2, 3, 'steel'], [16, 8, 2, 3, 'steel'], [11, 13, 2, 7, 'dark']],
  pressedStone: [[5, 10, 14, 6, 'steel'], [7, 8, 10, 2, 'light'], [7, 16, 10, 2, 'dark'], [9, 12, 6, 2, 'spark'], [14, 14, 2, 2, 'base']],
  counterweightGrip: [[9, 5, 6, 12, 'paper'], [10, 7, 4, 7, 'base'], [6, 11, 3, 3, 'steel'], [15, 11, 3, 3, 'steel'], [11, 17, 2, 3, 'gold']],
  twinHookAwl: [[8, 5, 2, 10, 'steel'], [14, 5, 2, 10, 'steel'], [7, 4, 3, 2, 'light'], [14, 4, 4, 2, 'light'], [8, 15, 8, 2, 'frame'], [10, 17, 4, 3, 'dark']],
  furnaceCore: [[8, 7, 8, 10, 'red'], [9, 8, 6, 8, 'gold'], [11, 10, 2, 4, 'spark'], [7, 17, 10, 2, 'dark'], [16, 9, 2, 5, 'red']],
  gamblerDice: [[8, 8, 8, 8, 'white'], [9, 9, 2, 2, 'black'], [13, 13, 2, 2, 'black'], [6, 13, 3, 3, 'gold'], [15, 6, 3, 3, 'gold']],
  comboStrikes: [[6, 8, 12, 2, 'steel'], [7, 11, 11, 2, 'spark'], [8, 14, 10, 2, 'steel'], [5, 17, 6, 1, 'white'], [14, 6, 5, 1, 'white']],
  steelPlating: [[7, 7, 10, 10, 'steel'], [8, 8, 8, 3, 'light'], [8, 13, 8, 3, 'dark'], [11, 7, 2, 10, 'frame'], [6, 10, 2, 4, 'steel']],
  lavaBlade: [[10, 4, 4, 12, 'red'], [11, 5, 2, 10, 'gold'], [8, 15, 8, 2, 'frame'], [7, 8, 2, 3, 'red'], [15, 10, 2, 4, 'spark']],
  bloodBook: [[7, 7, 10, 10, 'paper'], [8, 8, 4, 8, 'red'], [13, 8, 3, 8, 'dark'], [9, 10, 5, 1, 'black'], [10, 13, 4, 1, 'black']],
  wallGrip: [[7, 6, 10, 12, 'steel'], [8, 7, 8, 3, 'light'], [8, 11, 8, 3, 'base'], [8, 15, 8, 3, 'dark'], [11, 6, 2, 12, 'frame']],
  plagueGrip: [[8, 6, 8, 12, 'green'], [10, 8, 4, 2, 'spark'], [9, 11, 6, 2, 'dark'], [11, 14, 2, 3, 'light'], [16, 7, 2, 2, 'green']],
  ignitionGrip: [[9, 5, 6, 13, 'red'], [10, 7, 4, 2, 'gold'], [10, 11, 4, 2, 'spark'], [8, 15, 8, 2, 'dark'], [15, 5, 2, 5, 'red']],
  dynamoGrip: [[8, 6, 8, 12, 'blue'], [9, 8, 6, 2, 'spark'], [9, 13, 6, 2, 'light'], [12, 6, 1, 12, 'white'], [16, 10, 2, 2, 'blue']],
  cycleGrip: [[8, 7, 8, 8, 'paper'], [9, 8, 6, 1, 'spark'], [9, 11, 5, 1, 'light'], [9, 14, 6, 1, 'spark'], [15, 7, 2, 9, 'frame']],
  cloneGrip: [[7, 6, 4, 12, 'light'], [13, 6, 4, 12, 'light'], [9, 8, 6, 2, 'spark'], [9, 14, 6, 2, 'base'], [11, 18, 2, 2, 'dark']],
  bloodSaw: [[7, 6, 10, 8, 'steel'], [8, 7, 8, 4, 'red'], [7, 14, 10, 2, 'frame'], [10, 5, 2, 2, 'steel'], [14, 5, 2, 2, 'steel']],
  fortressHead: [[7, 6, 10, 11, 'steel'], [8, 8, 8, 7, 'light'], [9, 5, 2, 3, 'frame'], [13, 5, 2, 3, 'frame'], [11, 11, 2, 6, 'dark']],
  plagueScythe: [[8, 5, 9, 5, 'green'], [12, 8, 2, 10, 'steel'], [7, 7, 3, 2, 'spark'], [14, 10, 3, 2, 'base'], [9, 16, 7, 2, 'frame']],
  flameSaw: [[7, 6, 10, 8, 'red'], [8, 7, 8, 4, 'gold'], [7, 14, 10, 2, 'frame'], [10, 5, 2, 2, 'spark'], [15, 9, 2, 4, 'red']],
  manaSaw: [[7, 6, 10, 8, 'blue'], [8, 7, 8, 4, 'spark'], [7, 14, 10, 2, 'frame'], [10, 5, 2, 2, 'white'], [15, 10, 2, 2, 'blue']],
  arcaneEdge: [[11, 4, 2, 12, 'spark'], [9, 7, 2, 7, 'paper'], [13, 7, 2, 7, 'blue'], [8, 15, 8, 2, 'frame'], [16, 5, 2, 2, 'white']],
  stormTrident: [[7, 5, 2, 11, 'blue'], [11, 4, 2, 12, 'spark'], [15, 5, 2, 11, 'blue'], [8, 16, 8, 2, 'frame'], [16, 8, 2, 2, 'white']],
  ramHead: [[5, 7, 14, 8, 'steel'], [7, 9, 10, 4, 'dark'], [11, 15, 2, 6, 'base'], [4, 10, 2, 3, 'frame'], [18, 10, 2, 3, 'frame']],
  bloodstoneRune: [[8, 8, 8, 8, 'red'], [10, 6, 4, 2, 'spark'], [10, 16, 4, 2, 'dark'], [11, 10, 2, 5, 'black'], [9, 12, 6, 1, 'gold']],
  bulwarkLens: [[7, 7, 10, 10, 'steel'], [9, 9, 6, 6, 'blue'], [11, 11, 2, 2, 'spark'], [11, 6, 2, 12, 'frame'], [6, 11, 12, 2, 'frame']],
  venomLens: [[7, 7, 10, 10, 'green'], [9, 9, 6, 6, 'spark'], [11, 11, 2, 2, 'black'], [6, 16, 2, 2, 'green'], [16, 6, 2, 2, 'green']],
  flameLens: [[7, 7, 10, 10, 'red'], [9, 9, 6, 6, 'gold'], [11, 11, 2, 2, 'spark'], [8, 6, 2, 3, 'red'], [15, 14, 2, 3, 'red']],
  overchargeCoil: [[7, 8, 10, 2, 'blue'], [8, 11, 8, 2, 'spark'], [7, 14, 10, 2, 'blue'], [12, 7, 1, 10, 'white'], [16, 11, 2, 2, 'spark']],
  flowFeather: [[11, 5, 2, 13, 'paper'], [8, 7, 3, 2, 'white'], [13, 8, 4, 2, 'light'], [7, 12, 4, 2, 'white'], [13, 14, 5, 2, 'light']],
  growthCrest: [[9, 15, 2, 4, 'green'], [11, 11, 2, 6, 'base'], [8, 10, 4, 2, 'light'], [13, 8, 4, 2, 'light'], [10, 6, 4, 2, 'spark']],
  resonanceStone: [[8, 8, 8, 8, 'base'], [10, 10, 4, 4, 'spark'], [6, 9, 2, 6, 'light'], [16, 9, 2, 6, 'light'], [9, 17, 6, 1, 'white']],
  infinityLoop: [[7, 10, 4, 4, 'spark'], [13, 10, 4, 4, 'spark'], [10, 11, 4, 2, 'frame'], [8, 11, 2, 2, 'dark'], [14, 11, 2, 2, 'dark']],
  timeGear: [[8, 8, 8, 8, 'frame'], [10, 10, 4, 4, 'dark'], [12, 8, 1, 6, 'spark'], [12, 12, 4, 1, 'spark'], [10, 6, 4, 2, 'frame']],
  growingCrystal: [[10, 5, 4, 13, 'green'], [8, 10, 2, 5, 'light'], [14, 8, 2, 7, 'light'], [11, 7, 2, 8, 'spark'], [10, 18, 4, 2, 'dark']],
  bloodPact: [[8, 7, 8, 10, 'paper'], [9, 8, 6, 2, 'red'], [10, 11, 4, 4, 'red'], [11, 12, 2, 2, 'black'], [15, 16, 2, 2, 'spark']],
  eternalShield: [[7, 6, 10, 12, 'steel'], [9, 8, 6, 8, 'light'], [11, 5, 2, 14, 'gold'], [6, 11, 12, 2, 'gold'], [10, 10, 4, 4, 'spark']],
  infiniteScript: [[7, 7, 10, 9, 'paper'], [8, 8, 8, 1, 'spark'], [8, 11, 7, 1, 'light'], [8, 14, 8, 1, 'spark'], [15, 7, 2, 10, 'gold']],
  hundredHands: [[6, 8, 12, 2, 'gold'], [7, 11, 10, 2, 'spark'], [6, 14, 12, 2, 'gold'], [8, 6, 2, 10, 'light'], [14, 6, 2, 10, 'light']],
  bloodMoon: [[8, 5, 8, 13, 'red'], [10, 7, 6, 9, 'dark'], [12, 6, 3, 8, 'spark'], [7, 14, 10, 2, 'frame'], [10, 18, 4, 2, 'black']],
  skyWall: [[7, 6, 10, 12, 'blue'], [8, 8, 8, 8, 'spark'], [11, 5, 2, 14, 'white'], [6, 11, 12, 2, 'white'], [10, 16, 4, 2, 'frame']],
  apocalypsePlague: [[7, 7, 10, 10, 'green'], [8, 8, 8, 4, 'red'], [10, 12, 4, 4, 'black'], [6, 16, 2, 2, 'green'], [16, 6, 2, 2, 'gold']],
  meteorCluster: [[6, 7, 4, 4, 'red'], [12, 5, 5, 5, 'gold'], [15, 12, 4, 4, 'red'], [8, 15, 3, 3, 'spark'], [10, 10, 2, 2, 'white']],
  heartShard: [[9, 7, 6, 8, 'red'], [8, 10, 8, 4, 'red'], [10, 15, 4, 3, 'dark'], [11, 10, 2, 5, 'spark'], [6, 16, 2, 2, 'red']],
  eternalWall: [[6, 7, 12, 10, 'steel'], [8, 9, 8, 6, 'light'], [10, 6, 4, 12, 'gold'], [6, 12, 12, 2, 'gold'], [10, 17, 4, 2, 'dark']],
  infiniteBattery: [[8, 6, 8, 12, 'blue'], [10, 4, 4, 2, 'gold'], [9, 9, 6, 2, 'spark'], [9, 14, 6, 2, 'spark'], [12, 7, 1, 11, 'white']],
  constellationBlueprint: [[6, 7, 12, 10, 'paper'], [8, 9, 2, 2, 'spark'], [13, 10, 2, 2, 'spark'], [16, 14, 2, 2, 'spark'], [9, 11, 8, 1, 'blue']]
};

const renderGeneratedCardMotif = (
  motif: keyof typeof GENERATED_CARD_MOTIFS | undefined,
  palette: GeneratedThemePalette,
  frame: string
): React.ReactNode => {
  if (!motif) return null;

  const rects = GENERATED_CARD_MOTIFS[motif];
  if (!rects) return null;

  const colors: Record<GeneratedMotifColor, string> = {
    dark: palette.dark,
    base: palette.base,
    light: palette.light,
    spark: palette.spark,
    frame,
    black: '#050308',
    white: '#FFFFFF',
    red: '#FF3A3A',
    gold: '#FFD700',
    steel: '#C0C0C0',
    paper: '#E8D9A8',
    green: '#90EE90',
    blue: '#00FFFF'
  };

  return (
    <>
      {rects.map(([x, y, width, height, color], index) => (
        <rect key={`${motif}-${index}`} x={x} y={y} width={width} height={height} fill={colors[color]}/>
      ))}
    </>
  );
};

const renderGeneratedFrame = (
  palette: GeneratedThemePalette,
  frame: string,
  rarity: GeneratedCardRarity,
  variant: number
): React.ReactNode => {
  const glintX = 6 + (variant % 5);

  return (
    <>
      <rect x="6" y="20" width="12" height="1" fill="#0B090D" opacity="0.55"/>
      <rect x="8" y="21" width="8" height="1" fill="#0B090D" opacity="0.35"/>
      <rect x={glintX} y="4" width="3" height="1" fill={frame} opacity="0.9"/>
      {rarity === 'rare' && (
        <>
          <rect x="5" y="6" width="2" height="1" fill={palette.light}/>
          <rect x="17" y="5" width="1" height="2" fill={palette.spark}/>
        </>
      )}
      {rarity === 'legend' && (
        <>
          <rect x="4" y="5" width="2" height="2" fill={frame}/>
          <rect x="18" y="5" width="2" height="2" fill={frame}/>
          <rect x="5" y="18" width="2" height="1" fill={palette.spark}/>
          <rect x="17" y="18" width="2" height="1" fill={palette.spark}/>
        </>
      )}
    </>
  );
};

const renderHandleSilhouette = (
  palette: GeneratedThemePalette,
  frame: string,
  theme: GeneratedCardTheme,
  rarity: GeneratedCardRarity,
  variant: number
): React.ReactNode => {
  const form = variant % 3;
  const wideGrip = theme === 'heavy' || theme === 'guard';
  const gripX = wideGrip ? 9 : 10;
  const gripW = wideGrip ? 6 : 4;
  const wrapY = 7 + (variant % 4);

  return (
    <>
      <rect x={gripX} y="5" width={gripW} height="14" fill={palette.base}/>
      <rect x={gripX + 1} y="4" width={Math.max(2, gripW - 2)} height="2" fill={palette.light}/>
      <rect x={gripX - 1} y="7" width="1" height="10" fill={palette.light}/>
      <rect x={gripX + gripW} y="7" width="1" height="10" fill={palette.dark}/>
      <rect x="7" y="12" width="10" height="2" fill={frame}/>
      <rect x="8" y="18" width="8" height="2" fill={palette.dark}/>
      <rect x="10" y="19" width="4" height="1" fill="#0B090D"/>
      {form === 0 && (
        <>
          <rect x="10" y={wrapY} width="4" height="1" fill={palette.spark}/>
          <rect x="10" y={wrapY + 3} width="4" height="1" fill={palette.light}/>
        </>
      )}
      {form === 1 && (
        <>
          <rect x="8" y="6" width="8" height="1" fill={palette.dark}/>
          <rect x="9" y="8" width="6" height="1" fill={palette.light}/>
          <rect x="11" y="10" width="2" height="6" fill={palette.spark}/>
        </>
      )}
      {form === 2 && (
        <>
          <rect x="8" y="8" width="2" height="8" fill={palette.dark}/>
          <rect x="14" y="8" width="2" height="8" fill={palette.light}/>
          <rect x="11" y="6" width="2" height="2" fill={palette.spark}/>
        </>
      )}
    </>
  );
};

const renderHeadSilhouette = (
  palette: GeneratedThemePalette,
  frame: string,
  theme: GeneratedCardTheme,
  rarity: GeneratedCardRarity,
  variant: number
): React.ReactNode => {
  const form = variant % 4;

  if (theme === 'heavy' || form === 1) {
    return (
      <>
        <rect x="5" y="5" width="14" height="6" fill={palette.base}/>
        <rect x="7" y="6" width="4" height="3" fill={palette.light}/>
        <rect x="13" y="7" width="5" height="3" fill={palette.dark}/>
        <rect x="11" y="11" width="3" height="8" fill={frame}/>
        <rect x="10" y="18" width="5" height="2" fill={palette.dark}/>
      </>
    );
  }

  if (theme === 'multi' || form === 2) {
    return (
      <>
        <rect x="7" y="4" width="2" height="12" fill={palette.light}/>
        <rect x="11" y="3" width="2" height="13" fill={palette.spark}/>
        <rect x="15" y="4" width="2" height="12" fill={palette.light}/>
        <rect x="6" y="6" width="3" height="2" fill={palette.base}/>
        <rect x="15" y="6" width="3" height="2" fill={palette.base}/>
        <rect x="8" y="16" width="8" height="2" fill={frame}/>
        <rect x="10" y="18" width="4" height="3" fill={palette.dark}/>
      </>
    );
  }

  if (theme === 'poison' || theme === 'pierce' || form === 3) {
    return (
      <>
        <rect x="12" y="3" width="2" height="13" fill={palette.light}/>
        <rect x="10" y="5" width="2" height="10" fill={palette.base}/>
        <rect x="14" y="7" width="1" height="8" fill={palette.spark}/>
        <rect x="8" y="15" width="8" height="2" fill={frame}/>
        <rect x="10" y="17" width="4" height="4" fill={palette.dark}/>
        <rect x="9" y="4" width="2" height="2" fill={palette.spark}/>
      </>
    );
  }

  return (
    <>
      <rect x="11" y="3" width="2" height="13" fill={palette.light}/>
      <rect x="10" y="5" width="1" height="9" fill={palette.spark}/>
      <rect x="13" y="5" width="1" height="9" fill={palette.base}/>
      <rect x="8" y="15" width="8" height="2" fill={frame}/>
      <rect x="10" y="17" width="4" height="4" fill={palette.dark}/>
      {rarity === 'legend' && <rect x="9" y="2" width="6" height="2" fill={palette.spark}/>}
    </>
  );
};

const renderDecoSilhouette = (
  palette: GeneratedThemePalette,
  frame: string,
  theme: GeneratedCardTheme,
  rarity: GeneratedCardRarity,
  variant: number
): React.ReactNode => {
  const form = variant % 4;

  if (theme === 'guard' || form === 1) {
    return (
      <>
        <rect x="7" y="7" width="10" height="9" fill={palette.base}/>
        <rect x="8" y="8" width="8" height="6" fill={palette.light}/>
        <rect x="10" y="10" width="4" height="3" fill={palette.spark}/>
        <rect x="9" y="16" width="6" height="2" fill={palette.dark}/>
        <rect x="11" y="7" width="2" height="10" fill={frame}/>
      </>
    );
  }

  if (theme === 'draw' || form === 2) {
    return (
      <>
        <rect x="6" y="8" width="12" height="9" fill={palette.light}/>
        <rect x="7" y="9" width="10" height="7" fill="#17212A"/>
        <rect x="8" y="10" width="8" height="1" fill={palette.spark}/>
        <rect x="8" y="12" width="6" height="1" fill={palette.light}/>
        <rect x="8" y="14" width="7" height="1" fill={palette.light}/>
        <rect x="16" y="7" width="2" height="10" fill={frame}/>
      </>
    );
  }

  if (theme === 'energy' || form === 3) {
    return (
      <>
        <rect x="8" y="6" width="8" height="12" fill={palette.base}/>
        <rect x="10" y="5" width="4" height="2" fill={frame}/>
        <rect x="9" y="8" width="6" height="2" fill={palette.light}/>
        <rect x="9" y="12" width="6" height="2" fill={palette.light}/>
        <rect x="11" y="9" width="2" height="6" fill={palette.spark}/>
        <rect x="7" y="18" width="10" height="1" fill={palette.dark}/>
      </>
    );
  }

  return (
    <>
      <rect x="8" y="8" width="8" height="8" fill={palette.base}/>
      <rect x="10" y="6" width="4" height="2" fill={palette.light}/>
      <rect x="10" y="16" width="4" height="2" fill={palette.dark}/>
      <rect x="6" y="10" width="2" height="4" fill={palette.dark}/>
      <rect x="16" y="10" width="2" height="4" fill={palette.light}/>
      <rect x="10" y="10" width="4" height="4" fill={palette.spark}/>
      <rect x="11" y="11" width="2" height="2" fill={palette.dark}/>
      {rarity === 'legend' && <rect x="8" y="5" width="8" height="1" fill={frame}/>}
    </>
  );
};

const renderThemeMotif = (
  kind: GeneratedCardKind,
  theme: GeneratedCardTheme,
  palette: GeneratedThemePalette,
  variant: number
): React.ReactNode => {
  const leftSparkY = 6 + (variant % 4);
  const rightSparkY = 16 - (variant % 5);

  switch (theme) {
    case 'blood':
      return (
        <>
          <rect x="6" y={leftSparkY + 5} width="2" height="3" fill="#FF0000"/>
          <rect x="17" y={rightSparkY} width="1" height="3" fill="#B00000"/>
          {kind === 'head' && <rect x="8" y="6" width="1" height="8" fill="#FF4A4A"/>}
          {kind === 'deco' && <rect x="10" y="8" width="4" height="5" fill="#D22A2A"/>}
        </>
      );
    case 'guard':
      if (kind === 'handle') {
        return (
          <>
            <rect x="6" y="10" width="2" height="6" fill="#2F5F8F" opacity="0.78"/>
            <rect x="16" y="10" width="2" height="6" fill="#2F5F8F" opacity="0.78"/>
            <rect x="6" y="12" width="12" height="1" fill={palette.light}/>
          </>
        );
      }
      if (kind === 'head') {
        return (
          <>
            <rect x="6" y="15" width="12" height="2" fill="#2F5F8F" opacity="0.82"/>
            <rect x="10" y="13" width="4" height="1" fill={palette.spark}/>
          </>
        );
      }
      return (
        <>
          <rect x="8" y="7" width="8" height="9" fill="#2F5F8F" opacity="0.82"/>
          <rect x="11" y="8" width="2" height="8" fill={palette.spark}/>
          <rect x="8" y="11" width="8" height="2" fill={palette.light}/>
        </>
      );
    case 'poison':
      return (
        <>
          <rect x="6" y="15" width="2" height="2" fill={palette.light}/>
          <rect x="16" y="6" width="2" height="2" fill={palette.light}/>
          <rect x="14" y="16" width="1" height="1" fill={palette.spark}/>
          {kind === 'head' && <rect x="13" y="4" width="1" height="3" fill="#D8FFD8"/>}
        </>
      );
    case 'fire':
      return (
        <>
          <rect x="7" y="13" width="2" height="4" fill={palette.light}/>
          <rect x="15" y="7" width="2" height="5" fill={palette.base}/>
          <rect x="11" y="5" width="2" height="3" fill={palette.spark}/>
          <rect x="10" y="10" width="4" height="3" fill="#FF7A00"/>
        </>
      );
    case 'energy':
      return (
        <>
          <rect x="13" y="5" width="2" height="4" fill={palette.spark}/>
          <rect x="11" y="9" width="2" height="4" fill={palette.light}/>
          <rect x="9" y="13" width="2" height="4" fill={palette.spark}/>
          <rect x="15" y="15" width="2" height="1" fill={palette.light}/>
        </>
      );
    case 'draw':
      return (
        <>
          <rect x="7" y="7" width="5" height="2" fill={palette.light}/>
          <rect x="6" y="10" width="7" height="2" fill={palette.spark}/>
          <rect x="13" y="13" width="5" height="2" fill={palette.light}/>
          {kind === 'handle' && <rect x="16" y="8" width="2" height="7" fill="#E8F7FF"/>}
        </>
      );
    case 'heavy':
      if (kind === 'handle') {
        return (
          <>
            <rect x="8" y="16" width="8" height="3" fill={palette.dark}/>
            <rect x="9" y="17" width="6" height="1" fill={palette.light}/>
            <rect x="5" y="18" width="2" height="2" fill={palette.spark}/>
          </>
        );
      }
      if (kind === 'head') {
        return (
          <>
            <rect x="5" y="7" width="14" height="4" fill={palette.base}/>
            <rect x="7" y="9" width="10" height="3" fill={palette.dark}/>
            <rect x="9" y="8" width="6" height="2" fill={palette.light}/>
          </>
        );
      }
      return (
        <>
          <rect x="8" y="12" width="8" height="5" fill={palette.dark}/>
          <rect x="9" y="11" width="6" height="2" fill={palette.light}/>
          <rect x="6" y="16" width="2" height="2" fill={palette.spark}/>
        </>
      );
    case 'multi':
      return (
        <>
          <rect x="6" y="6" width="3" height="9" fill={palette.light}/>
          <rect x="11" y="5" width="3" height="10" fill={palette.spark}/>
          <rect x="16" y="7" width="2" height="8" fill={palette.light}/>
          <rect x="8" y="17" width="8" height="1" fill={palette.spark}/>
        </>
      );
    case 'pierce':
      return (
        <>
          <rect x="5" y="11" width="14" height="2" fill={palette.light}/>
          <rect x="18" y="10" width="2" height="4" fill={palette.spark}/>
        </>
      );
    case 'gold':
      return (
        <>
          <rect x="7" y="14" width="4" height="4" fill={palette.light}/>
          <rect x="13" y="8" width="4" height="4" fill={palette.light}/>
          <rect x="8" y="15" width="2" height="2" fill={palette.spark}/>
          <rect x="14" y="9" width="2" height="2" fill={palette.spark}/>
        </>
      );
    case 'frost':
      return (
        <>
          <rect x="6" y="6" width="2" height="2" fill={palette.spark}/>
          <rect x="16" y="8" width="2" height="2" fill={palette.spark}/>
          <rect x="8" y="16" width="8" height="1" fill={palette.light}/>
        </>
      );
    case 'time':
      return (
        <>
          <rect x="8" y="7" width="8" height="2" fill={palette.base}/>
          <rect x="8" y="15" width="8" height="2" fill={palette.base}/>
          <rect x="10" y="9" width="4" height="6" fill="#17131A"/>
          <rect x="11" y="10" width="2" height="2" fill={palette.spark}/>
          <rect x="11" y="13" width="2" height="2" fill={palette.light}/>
        </>
      );
    case 'growth':
      return (
        <>
          <rect x="9" y="15" width="2" height="4" fill="#244D24"/>
          <rect x="11" y="11" width="2" height="6" fill={palette.base}/>
          <rect x="8" y="10" width="4" height="2" fill={palette.light}/>
          <rect x="13" y="8" width="4" height="2" fill={palette.light}/>
        </>
      );
    case 'void':
      return (
        <>
          <rect x="9" y="8" width="6" height="6" fill={palette.light}/>
          <rect x="10" y="9" width="4" height="4" fill="#000000"/>
          <rect x="6" y="6" width="2" height="2" fill={palette.spark}/>
          <rect x="16" y="16" width="2" height="2" fill={palette.spark}/>
        </>
      );
    case 'rage':
      return (
        <>
          <rect x="9" y="7" width="2" height="2" fill={palette.spark}/>
          <rect x="13" y="7" width="2" height="2" fill={palette.spark}/>
          <rect x="10" y="14" width="4" height="2" fill={palette.light}/>
        </>
      );
  }
};

const generatedCardSprite = ({ kind, theme, rarity, variant = 0, motif }: GeneratedCardSpriteConfig): React.FC<{ className?: string }> => {
  const palette = THEME_PALETTES[theme];
  const frame = RARITY_FRAME[rarity];

  return ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
      {renderGeneratedFrame(palette, frame, rarity, variant)}
      {renderThemeMotif(kind, theme, palette, variant)}
      {kind === 'handle' && renderGeneratedCardMotif(motif, palette, frame)}
      {kind === 'handle' && renderHandleSilhouette(palette, frame, theme, rarity, variant)}
      {kind === 'head' && renderHeadSilhouette(palette, frame, theme, rarity, variant)}
      {kind === 'deco' && renderDecoSilhouette(palette, frame, theme, rarity, variant)}
      {kind !== 'handle' && renderGeneratedCardMotif(motif, palette, frame)}
      <rect x="17" y="18" width="1" height="1" fill={frame}/>
    </svg>
  );
};

export const HAND_DRAWN_CARD_SPRITE_IDS = new Set<number>([
  101, 102, 103, 104, 105,
  248, 249,
  405, 407,
  414, 415, 416, 417, 418, 419, 420, 421, 422, 423, 424, 425
]);

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
  248: ({ className }) => ( // Counterweight Handle
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
      <rect x="2" y="2" width="20" height="20" fill="#0B090D"/>
      <rect x="3" y="3" width="18" height="18" fill="#2A2430"/>
      <rect x="4" y="4" width="16" height="1" fill="#5588CC"/>
      <rect x="4" y="19" width="16" height="1" fill="#5588CC"/>
      <rect x="4" y="4" width="1" height="16" fill="#5588CC"/>
      <rect x="19" y="4" width="1" height="16" fill="#5588CC"/>
      <rect x="11" y="5" width="2" height="14" fill="#C9A04A"/>
      <rect x="10" y="7" width="1" height="10" fill="#E8C76B"/>
      <rect x="13" y="7" width="1" height="10" fill="#7A5224"/>
      <rect x="8" y="8" width="8" height="2" fill="#8B7355"/>
      <rect x="5" y="10" width="4" height="4" fill="#C0C0C0"/>
      <rect x="15" y="10" width="4" height="4" fill="#C0C0C0"/>
      <rect x="6" y="11" width="2" height="2" fill="#FFD700"/>
      <rect x="16" y="11" width="2" height="2" fill="#FFD700"/>
      <rect x="8" y="14" width="8" height="1" fill="#7DAFC2"/>
      <rect x="7" y="16" width="4" height="2" fill="#E8F7FF"/>
      <rect x="13" y="16" width="4" height="2" fill="#E8F7FF"/>
      <rect x="8" y="17" width="2" height="1" fill="#35505E"/>
      <rect x="14" y="17" width="2" height="1" fill="#35505E"/>
    </svg>
  ),
  249: ({ className }) => ( // Twin Hook Awl
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
      <rect x="2" y="2" width="20" height="20" fill="#0B090D"/>
      <rect x="3" y="3" width="18" height="18" fill="#271E38"/>
      <rect x="4" y="4" width="16" height="1" fill="#5588CC"/>
      <rect x="4" y="19" width="16" height="1" fill="#5588CC"/>
      <rect x="4" y="4" width="1" height="16" fill="#5588CC"/>
      <rect x="19" y="4" width="1" height="16" fill="#5588CC"/>
      <rect x="7" y="5" width="2" height="10" fill="#DCE6F0"/>
      <rect x="15" y="5" width="2" height="10" fill="#DCE6F0"/>
      <rect x="8" y="4" width="3" height="2" fill="#FFFFFF"/>
      <rect x="13" y="4" width="3" height="2" fill="#FFFFFF"/>
      <rect x="6" y="6" width="2" height="2" fill="#C0C0C0"/>
      <rect x="16" y="6" width="2" height="2" fill="#C0C0C0"/>
      <rect x="6" y="13" width="4" height="2" fill="#AA55CC"/>
      <rect x="14" y="13" width="4" height="2" fill="#AA55CC"/>
      <rect x="10" y="15" width="4" height="4" fill="#654321"/>
      <rect x="9" y="16" width="6" height="2" fill="#8B4513"/>
      <rect x="5" y="10" width="2" height="1" fill="#FFFFFF"/>
      <rect x="17" y="10" width="2" height="1" fill="#FFFFFF"/>
      <rect x="5" y="17" width="2" height="2" fill="#D49CFF"/>
      <rect x="17" y="17" width="2" height="2" fill="#D49CFF"/>
    </svg>
  ),
};

const generatedCardConfigs: Record<number, GeneratedCardSpriteConfig> = {
  106: { kind: 'deco', theme: 'draw', rarity: 'starter', variant: 6, motif: 'frayedCord' },
  209: { kind: 'head', theme: 'blood', rarity: 'common', variant: 9, motif: 'gearWheel' },
  210: { kind: 'deco', theme: 'guard', rarity: 'common', variant: 10, motif: 'thornMark' },
  211: { kind: 'deco', theme: 'energy', rarity: 'common', variant: 11, motif: 'batteryCell' },
  212: { kind: 'handle', theme: 'draw', rarity: 'common', variant: 12, motif: 'lightGrip' },
  213: { kind: 'head', theme: 'poison', rarity: 'common', variant: 13, motif: 'poisonNeedle' },
  214: { kind: 'head', theme: 'guard', rarity: 'common', variant: 14, motif: 'bluntClub' },
  216: { kind: 'handle', theme: 'blood', rarity: 'common', variant: 16, motif: 'bloodGrip' },
  217: { kind: 'handle', theme: 'guard', rarity: 'common', variant: 17, motif: 'shieldGrip' },
  220: { kind: 'handle', theme: 'poison', rarity: 'common', variant: 20, motif: 'venomCoil' },
  221: { kind: 'handle', theme: 'fire', rarity: 'common', variant: 21, motif: 'emberWrap' },
  222: { kind: 'handle', theme: 'energy', rarity: 'common', variant: 22, motif: 'conductorGrip' },
  223: { kind: 'handle', theme: 'draw', rarity: 'common', variant: 23, motif: 'scribeGrip' },
  224: { kind: 'handle', theme: 'heavy', rarity: 'common', variant: 24, motif: 'heavyGrip' },
  225: { kind: 'handle', theme: 'multi', rarity: 'common', variant: 25, motif: 'splitGrip' },
  226: { kind: 'head', theme: 'blood', rarity: 'common', variant: 26, motif: 'woundRake' },
  227: { kind: 'head', theme: 'guard', rarity: 'common', variant: 27, motif: 'guardAxe' },
  228: { kind: 'head', theme: 'poison', rarity: 'common', variant: 28, motif: 'venomBlade' },
  229: { kind: 'head', theme: 'fire', rarity: 'common', variant: 29, motif: 'forgeBlade' },
  230: { kind: 'head', theme: 'energy', rarity: 'common', variant: 30, motif: 'sparkDagger' },
  231: { kind: 'head', theme: 'draw', rarity: 'common', variant: 31, motif: 'scribeBlade' },
  232: { kind: 'head', theme: 'heavy', rarity: 'common', variant: 32, motif: 'cleaver' },
  233: { kind: 'head', theme: 'multi', rarity: 'common', variant: 33, motif: 'trident' },
  234: { kind: 'head', theme: 'multi', rarity: 'common', variant: 34, motif: 'chainSaw' },
  235: { kind: 'head', theme: 'poison', rarity: 'common', variant: 35, motif: 'corrosionGear' },
  236: { kind: 'deco', theme: 'blood', rarity: 'common', variant: 36, motif: 'bloodCharm' },
  237: { kind: 'deco', theme: 'guard', rarity: 'common', variant: 37, motif: 'shieldShard' },
  238: { kind: 'deco', theme: 'poison', rarity: 'common', variant: 38, motif: 'poisonPouch' },
  239: { kind: 'deco', theme: 'fire', rarity: 'common', variant: 39, motif: 'emberCharm' },
  240: { kind: 'deco', theme: 'energy', rarity: 'common', variant: 40, motif: 'spring' },
  241: { kind: 'deco', theme: 'draw', rarity: 'common', variant: 41, motif: 'recordRibbon' },
  242: { kind: 'deco', theme: 'heavy', rarity: 'common', variant: 42, motif: 'weight' },
  243: { kind: 'deco', theme: 'multi', rarity: 'common', variant: 43, motif: 'twinNeedle' },
  244: { kind: 'deco', theme: 'void', rarity: 'common', variant: 44, motif: 'slowDust' },
  245: { kind: 'deco', theme: 'fire', rarity: 'common', variant: 45, motif: 'flint' },
  246: { kind: 'head', theme: 'heavy', rarity: 'common', variant: 46, motif: 'mace' },
  247: { kind: 'deco', theme: 'heavy', rarity: 'common', variant: 47, motif: 'pressedStone' },
  308: { kind: 'head', theme: 'energy', rarity: 'rare', variant: 8, motif: 'furnaceCore' },
  309: { kind: 'handle', theme: 'gold', rarity: 'rare', variant: 9, motif: 'gamblerDice' },
  310: { kind: 'head', theme: 'multi', rarity: 'rare', variant: 10, motif: 'comboStrikes' },
  311: { kind: 'deco', theme: 'guard', rarity: 'rare', variant: 11, motif: 'steelPlating' },
  312: { kind: 'head', theme: 'fire', rarity: 'rare', variant: 12, motif: 'lavaBlade' },
  321: { kind: 'handle', theme: 'blood', rarity: 'rare', variant: 21, motif: 'bloodBook' },
  322: { kind: 'handle', theme: 'guard', rarity: 'rare', variant: 22, motif: 'wallGrip' },
  323: { kind: 'handle', theme: 'poison', rarity: 'rare', variant: 23, motif: 'plagueGrip' },
  324: { kind: 'handle', theme: 'fire', rarity: 'rare', variant: 24, motif: 'ignitionGrip' },
  325: { kind: 'handle', theme: 'energy', rarity: 'rare', variant: 25, motif: 'dynamoGrip' },
  326: { kind: 'handle', theme: 'draw', rarity: 'rare', variant: 26, motif: 'cycleGrip' },
  327: { kind: 'handle', theme: 'heavy', rarity: 'rare', variant: 27, motif: 'heavyGrip' },
  328: { kind: 'handle', theme: 'multi', rarity: 'rare', variant: 28, motif: 'cloneGrip' },
  329: { kind: 'head', theme: 'blood', rarity: 'rare', variant: 29, motif: 'bloodSaw' },
  330: { kind: 'head', theme: 'guard', rarity: 'rare', variant: 30, motif: 'fortressHead' },
  331: { kind: 'head', theme: 'poison', rarity: 'rare', variant: 31, motif: 'plagueScythe' },
  332: { kind: 'head', theme: 'fire', rarity: 'rare', variant: 32, motif: 'flameSaw' },
  333: { kind: 'head', theme: 'energy', rarity: 'rare', variant: 33, motif: 'manaSaw' },
  334: { kind: 'head', theme: 'draw', rarity: 'rare', variant: 34, motif: 'arcaneEdge' },
  335: { kind: 'head', theme: 'multi', rarity: 'rare', variant: 35, motif: 'stormTrident' },
  336: { kind: 'head', theme: 'heavy', rarity: 'rare', variant: 36, motif: 'ramHead' },
  337: { kind: 'deco', theme: 'blood', rarity: 'rare', variant: 37, motif: 'bloodstoneRune' },
  338: { kind: 'deco', theme: 'guard', rarity: 'rare', variant: 38, motif: 'bulwarkLens' },
  339: { kind: 'deco', theme: 'poison', rarity: 'rare', variant: 39, motif: 'venomLens' },
  340: { kind: 'deco', theme: 'fire', rarity: 'rare', variant: 40, motif: 'flameLens' },
  341: { kind: 'deco', theme: 'energy', rarity: 'rare', variant: 41, motif: 'overchargeCoil' },
  342: { kind: 'deco', theme: 'draw', rarity: 'rare', variant: 42, motif: 'flowFeather' },
  343: { kind: 'deco', theme: 'heavy', rarity: 'rare', variant: 43, motif: 'growthCrest' },
  344: { kind: 'deco', theme: 'multi', rarity: 'rare', variant: 44, motif: 'resonanceStone' },
  405: { kind: 'handle', theme: 'time', rarity: 'legend', variant: 5, motif: 'infinityLoop' },
  406: { kind: 'head', theme: 'time', rarity: 'legend', variant: 6, motif: 'timeGear' },
  407: { kind: 'deco', theme: 'growth', rarity: 'legend', variant: 7, motif: 'growingCrystal' },
  414: { kind: 'handle', theme: 'blood', rarity: 'legend', variant: 14, motif: 'bloodPact' },
  415: { kind: 'handle', theme: 'guard', rarity: 'legend', variant: 15, motif: 'eternalShield' },
  416: { kind: 'handle', theme: 'draw', rarity: 'legend', variant: 16, motif: 'infiniteScript' },
  417: { kind: 'handle', theme: 'multi', rarity: 'legend', variant: 17, motif: 'hundredHands' },
  418: { kind: 'head', theme: 'blood', rarity: 'legend', variant: 18, motif: 'bloodMoon' },
  419: { kind: 'head', theme: 'guard', rarity: 'legend', variant: 19, motif: 'skyWall' },
  420: { kind: 'head', theme: 'poison', rarity: 'legend', variant: 20, motif: 'apocalypsePlague' },
  421: { kind: 'head', theme: 'multi', rarity: 'legend', variant: 21, motif: 'meteorCluster' },
  422: { kind: 'deco', theme: 'rage', rarity: 'legend', variant: 22, motif: 'heartShard' },
  423: { kind: 'deco', theme: 'guard', rarity: 'legend', variant: 23, motif: 'eternalWall' },
  424: { kind: 'deco', theme: 'energy', rarity: 'legend', variant: 24, motif: 'infiniteBattery' },
  425: { kind: 'deco', theme: 'draw', rarity: 'legend', variant: 25, motif: 'constellationBlueprint' }
};

Object.entries(generatedCardConfigs).forEach(([cardId, config]) => {
  CardSprites[Number(cardId)] = generatedCardSprite(config);
});

const renderLegendPayoffFrame = (accent: string) => (
  <>
    <rect x="6" y="20" width="12" height="1" fill="#09070D" opacity="0.55"/>
    <rect x="8" y="21" width="8" height="1" fill="#09070D" opacity="0.35"/>
    <rect x="4" y="5" width="2" height="2" fill={accent}/>
    <rect x="18" y="5" width="2" height="2" fill={accent}/>
    <rect x="5" y="18" width="2" height="1" fill="#FFF2A8"/>
    <rect x="17" y="18" width="2" height="1" fill="#7A5BC2"/>
  </>
);

const legendaryPayoffCardSprites: Record<number, React.FC<{ className?: string }>> = {
  405: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
      {renderLegendPayoffFrame("#D9A441")}
      <rect x="10" y="6" width="4" height="12" fill="#5C3A1E"/>
      <rect x="9" y="8" width="6" height="8" fill="#8A5C2A"/>
      <rect x="11" y="5" width="2" height="14" fill="#E0B96A"/>
      <rect x="7" y="8" width="4" height="2" fill="#6AD7FF"/>
      <rect x="13" y="8" width="4" height="2" fill="#6AD7FF"/>
      <rect x="6" y="10" width="2" height="3" fill="#8FF4FF"/>
      <rect x="16" y="10" width="2" height="3" fill="#8FF4FF"/>
      <rect x="8" y="13" width="3" height="2" fill="#6AD7FF"/>
      <rect x="13" y="13" width="3" height="2" fill="#6AD7FF"/>
      <rect x="11" y="11" width="2" height="2" fill="#FFFFFF"/>
      <rect x="5" y="16" width="3" height="1" fill="#D9A441"/>
      <rect x="16" y="6" width="3" height="1" fill="#D9A441"/>
      <rect x="6" y="15" width="1" height="3" fill="#D9A441"/>
      <rect x="18" y="5" width="1" height="3" fill="#D9A441"/>
    </svg>
  ),
  407: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
      {renderLegendPayoffFrame("#7CFC7C")}
      <rect x="11" y="6" width="3" height="12" fill="#69D7FF"/>
      <rect x="9" y="9" width="7" height="8" fill="#4DA5E6"/>
      <rect x="10" y="5" width="2" height="3" fill="#DFFFFF"/>
      <rect x="14" y="7" width="2" height="4" fill="#B7F6FF"/>
      <rect x="7" y="12" width="3" height="5" fill="#43C47A"/>
      <rect x="15" y="14" width="3" height="4" fill="#2E9A5A"/>
      <rect x="8" y="11" width="2" height="2" fill="#A8FF9A"/>
      <rect x="16" y="13" width="2" height="2" fill="#A8FF9A"/>
      <rect x="10" y="16" width="2" height="2" fill="#164C37"/>
      <rect x="13" y="10" width="1" height="5" fill="#FFFFFF"/>
      <rect x="6" y="18" width="12" height="1" fill="#5B7A46"/>
      <rect x="5" y="16" width="2" height="2" fill="#7CFC7C"/>
      <rect x="18" y="16" width="1" height="2" fill="#7CFC7C"/>
      <rect x="12" y="4" width="2" height="1" fill="#FFFFFF"/>
    </svg>
  ),
  414: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
      {renderLegendPayoffFrame("#D94A4A")}
      <rect x="10" y="5" width="4" height="13" fill="#4A1212"/>
      <rect x="9" y="8" width="6" height="8" fill="#8B1E2D"/>
      <rect x="11" y="6" width="2" height="12" fill="#D94A4A"/>
      <rect x="8" y="7" width="2" height="2" fill="#F2D48A"/>
      <rect x="14" y="7" width="2" height="2" fill="#F2D48A"/>
      <rect x="7" y="10" width="2" height="2" fill="#7B0F18"/>
      <rect x="15" y="10" width="2" height="2" fill="#7B0F18"/>
      <rect x="7" y="13" width="2" height="4" fill="#B21D2D"/>
      <rect x="15" y="13" width="2" height="4" fill="#B21D2D"/>
      <rect x="11" y="10" width="2" height="2" fill="#FFE0E0"/>
      <rect x="10" y="18" width="4" height="2" fill="#2A0909"/>
      <rect x="6" y="17" width="1" height="2" fill="#FF3A3A"/>
      <rect x="17" y="18" width="1" height="2" fill="#FF3A3A"/>
      <rect x="12" y="14" width="1" height="3" fill="#FF7777"/>
    </svg>
  ),
  415: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
      {renderLegendPayoffFrame("#7DB7FF")}
      <rect x="10" y="5" width="4" height="14" fill="#334B70"/>
      <rect x="8" y="7" width="8" height="10" fill="#5F86B8"/>
      <rect x="7" y="9" width="10" height="6" fill="#91C6F2"/>
      <rect x="9" y="8" width="6" height="8" fill="#D9F1FF"/>
      <rect x="11" y="6" width="2" height="11" fill="#F8FFFF"/>
      <rect x="9" y="17" width="6" height="2" fill="#1D2E4A"/>
      <rect x="6" y="10" width="2" height="4" fill="#D8B95E"/>
      <rect x="16" y="10" width="2" height="4" fill="#D8B95E"/>
      <rect x="8" y="5" width="2" height="2" fill="#FFFFFF"/>
      <rect x="14" y="5" width="2" height="2" fill="#FFFFFF"/>
      <rect x="10" y="10" width="4" height="1" fill="#57799C"/>
      <rect x="10" y="13" width="4" height="1" fill="#57799C"/>
      <rect x="12" y="9" width="1" height="6" fill="#57799C"/>
      <rect x="5" y="16" width="3" height="1" fill="#7DB7FF"/>
    </svg>
  ),
  416: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
      {renderLegendPayoffFrame("#CFA9FF")}
      <rect x="10" y="6" width="4" height="12" fill="#4B356F"/>
      <rect x="9" y="8" width="6" height="8" fill="#6F52A3"/>
      <rect x="11" y="5" width="2" height="14" fill="#E9D8FF"/>
      <rect x="6" y="7" width="5" height="2" fill="#F6E7C6"/>
      <rect x="13" y="7" width="5" height="2" fill="#F6E7C6"/>
      <rect x="5" y="9" width="2" height="5" fill="#D4B98A"/>
      <rect x="17" y="9" width="2" height="5" fill="#D4B98A"/>
      <rect x="7" y="10" width="3" height="1" fill="#3A2852"/>
      <rect x="14" y="10" width="3" height="1" fill="#3A2852"/>
      <rect x="8" y="12" width="2" height="1" fill="#3A2852"/>
      <rect x="14" y="12" width="2" height="1" fill="#3A2852"/>
      <rect x="12" y="13" width="1" height="2" fill="#FFFFFF"/>
      <rect x="5" y="16" width="4" height="1" fill="#CFA9FF"/>
      <rect x="15" y="16" width="4" height="1" fill="#CFA9FF"/>
    </svg>
  ),
  417: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
      {renderLegendPayoffFrame("#FFCC66")}
      <rect x="10" y="5" width="4" height="14" fill="#5B321A"/>
      <rect x="9" y="8" width="6" height="8" fill="#A06032"/>
      <rect x="11" y="6" width="2" height="12" fill="#F0B060"/>
      <rect x="5" y="7" width="3" height="5" fill="#C98245"/>
      <rect x="16" y="7" width="3" height="5" fill="#C98245"/>
      <rect x="6" y="6" width="2" height="2" fill="#F4C78B"/>
      <rect x="16" y="6" width="2" height="2" fill="#F4C78B"/>
      <rect x="5" y="14" width="4" height="3" fill="#B66E3B"/>
      <rect x="15" y="14" width="4" height="3" fill="#B66E3B"/>
      <rect x="4" y="15" width="2" height="1" fill="#F4C78B"/>
      <rect x="18" y="15" width="2" height="1" fill="#F4C78B"/>
      <rect x="8" y="4" width="2" height="3" fill="#8A4D2A"/>
      <rect x="14" y="4" width="2" height="3" fill="#8A4D2A"/>
      <rect x="11" y="11" width="2" height="2" fill="#FFF2A8"/>
    </svg>
  ),
  418: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
      {renderLegendPayoffFrame("#E04444")}
      <rect x="8" y="5" width="8" height="3" fill="#8B0000"/>
      <rect x="9" y="3" width="6" height="3" fill="#D02030"/>
      <rect x="11" y="7" width="2" height="10" fill="#D8D8E8"/>
      <rect x="9" y="8" width="2" height="8" fill="#A0A0B8"/>
      <rect x="13" y="8" width="2" height="8" fill="#606070"/>
      <rect x="8" y="12" width="2" height="4" fill="#F4F4FF"/>
      <rect x="14" y="12" width="2" height="4" fill="#383848"/>
      <rect x="7" y="16" width="10" height="2" fill="#4A1515"/>
      <rect x="10" y="18" width="4" height="2" fill="#261010"/>
      <rect x="8" y="7" width="2" height="1" fill="#FF6B6B"/>
      <rect x="14" y="7" width="2" height="1" fill="#FF6B6B"/>
      <rect x="10" y="10" width="1" height="4" fill="#FF3A3A"/>
      <rect x="15" y="13" width="1" height="3" fill="#FF3A3A"/>
      <rect x="5" y="5" width="2" height="2" fill="#E04444"/>
    </svg>
  ),
  419: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
      {renderLegendPayoffFrame("#AEE6FF")}
      <rect x="6" y="8" width="12" height="10" fill="#6EA4D8"/>
      <rect x="7" y="7" width="3" height="2" fill="#DDF8FF"/>
      <rect x="11" y="6" width="3" height="3" fill="#DDF8FF"/>
      <rect x="15" y="7" width="3" height="2" fill="#DDF8FF"/>
      <rect x="8" y="10" width="3" height="7" fill="#AEE6FF"/>
      <rect x="12" y="10" width="3" height="7" fill="#88C9F0"/>
      <rect x="16" y="10" width="2" height="7" fill="#4F7FB2"/>
      <rect x="6" y="12" width="12" height="1" fill="#F7FFFF"/>
      <rect x="10" y="8" width="1" height="10" fill="#F7FFFF"/>
      <rect x="14" y="9" width="1" height="9" fill="#F7FFFF"/>
      <rect x="5" y="18" width="14" height="1" fill="#D8B95E"/>
      <rect x="7" y="5" width="2" height="1" fill="#FFFFFF"/>
      <rect x="16" y="5" width="2" height="1" fill="#FFFFFF"/>
      <rect x="5" y="15" width="1" height="3" fill="#AEE6FF"/>
    </svg>
  ),
  420: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
      {renderLegendPayoffFrame("#7CFF6B")}
      <rect x="12" y="5" width="2" height="13" fill="#4B2D5F"/>
      <rect x="9" y="6" width="6" height="2" fill="#B9FF80"/>
      <rect x="7" y="8" width="3" height="4" fill="#7CFF6B"/>
      <rect x="14" y="8" width="3" height="4" fill="#56B74C"/>
      <rect x="6" y="11" width="2" height="4" fill="#A44DFF"/>
      <rect x="16" y="11" width="2" height="4" fill="#A44DFF"/>
      <rect x="8" y="15" width="8" height="2" fill="#3C253F"/>
      <rect x="10" y="17" width="4" height="2" fill="#25182A"/>
      <rect x="9" y="9" width="2" height="2" fill="#F0FFD6"/>
      <rect x="13" y="9" width="2" height="2" fill="#F0FFD6"/>
      <rect x="10" y="11" width="4" height="1" fill="#263A19"/>
      <rect x="5" y="6" width="2" height="2" fill="#7CFF6B"/>
      <rect x="17" y="5" width="2" height="2" fill="#D7FF55"/>
      <rect x="5" y="17" width="2" height="1" fill="#FF6B3A"/>
      <rect x="17" y="17" width="2" height="1" fill="#FF6B3A"/>
    </svg>
  ),
  421: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
      {renderLegendPayoffFrame("#FF9A3A")}
      <rect x="6" y="5" width="4" height="4" fill="#FF5A1F"/>
      <rect x="7" y="4" width="3" height="2" fill="#FFD166"/>
      <rect x="13" y="6" width="5" height="5" fill="#C94824"/>
      <rect x="14" y="5" width="4" height="2" fill="#FFB347"/>
      <rect x="9" y="12" width="4" height="4" fill="#FF6B3A"/>
      <rect x="10" y="11" width="3" height="2" fill="#FFE07A"/>
      <rect x="15" y="14" width="3" height="3" fill="#A83A21"/>
      <rect x="15" y="13" width="3" height="1" fill="#FFD166"/>
      <rect x="5" y="10" width="3" height="1" fill="#FFE0A3"/>
      <rect x="4" y="12" width="4" height="1" fill="#FF9A3A"/>
      <rect x="12" y="3" width="3" height="1" fill="#FFE0A3"/>
      <rect x="17" y="4" width="2" height="1" fill="#FF9A3A"/>
      <rect x="7" y="17" width="3" height="1" fill="#FFE0A3"/>
      <rect x="11" y="18" width="5" height="1" fill="#FF9A3A"/>
      <rect x="8" y="6" width="1" height="1" fill="#FFFFFF"/>
    </svg>
  ),
  422: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
      {renderLegendPayoffFrame("#F05A7A")}
      <rect x="8" y="7" width="4" height="4" fill="#B21D3A"/>
      <rect x="13" y="7" width="4" height="4" fill="#D42F52"/>
      <rect x="7" y="10" width="10" height="5" fill="#E84A6A"/>
      <rect x="9" y="15" width="6" height="3" fill="#8B1024"/>
      <rect x="11" y="18" width="2" height="2" fill="#5A0A18"/>
      <rect x="10" y="8" width="2" height="2" fill="#FF9DB0"/>
      <rect x="14" y="8" width="2" height="2" fill="#FFB3C1"/>
      <rect x="12" y="10" width="1" height="5" fill="#FFE0E8"/>
      <rect x="9" y="12" width="2" height="1" fill="#FFE0E8"/>
      <rect x="14" y="13" width="2" height="1" fill="#FFE0E8"/>
      <rect x="6" y="15" width="2" height="2" fill="#FF3344"/>
      <rect x="16" y="16" width="2" height="2" fill="#FF3344"/>
      <rect x="5" y="11" width="2" height="1" fill="#F05A7A"/>
      <rect x="18" y="11" width="1" height="2" fill="#F05A7A"/>
    </svg>
  ),
  423: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
      {renderLegendPayoffFrame("#D8C27A")}
      <rect x="5" y="8" width="14" height="10" fill="#6A5B46"/>
      <rect x="6" y="6" width="3" height="3" fill="#9E8A62"/>
      <rect x="11" y="6" width="3" height="3" fill="#B9A46F"/>
      <rect x="16" y="6" width="3" height="3" fill="#9E8A62"/>
      <rect x="7" y="10" width="3" height="7" fill="#CDBA7A"/>
      <rect x="11" y="10" width="3" height="7" fill="#A99562"/>
      <rect x="15" y="10" width="3" height="7" fill="#7C6848"/>
      <rect x="5" y="12" width="14" height="1" fill="#EEE1A6"/>
      <rect x="9" y="8" width="1" height="10" fill="#EEE1A6"/>
      <rect x="14" y="8" width="1" height="10" fill="#EEE1A6"/>
      <rect x="10" y="14" width="4" height="4" fill="#3A2E28"/>
      <rect x="11" y="15" width="2" height="3" fill="#1F1714"/>
      <rect x="6" y="18" width="12" height="1" fill="#D8C27A"/>
      <rect x="18" y="9" width="1" height="3" fill="#F8E9A0"/>
    </svg>
  ),
  424: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
      {renderLegendPayoffFrame("#6AD7FF")}
      <rect x="8" y="6" width="8" height="12" fill="#233A66"/>
      <rect x="9" y="5" width="6" height="2" fill="#9CEBFF"/>
      <rect x="9" y="17" width="6" height="2" fill="#9CEBFF"/>
      <rect x="10" y="8" width="4" height="8" fill="#2F65B0"/>
      <rect x="11" y="9" width="2" height="6" fill="#E8FFFF"/>
      <rect x="6" y="9" width="2" height="3" fill="#D8B95E"/>
      <rect x="16" y="9" width="2" height="3" fill="#D8B95E"/>
      <rect x="6" y="13" width="2" height="3" fill="#D8B95E"/>
      <rect x="16" y="13" width="2" height="3" fill="#D8B95E"/>
      <rect x="5" y="10" width="1" height="1" fill="#FFF2A8"/>
      <rect x="18" y="14" width="1" height="1" fill="#FFF2A8"/>
      <rect x="7" y="6" width="2" height="1" fill="#6AD7FF"/>
      <rect x="15" y="6" width="2" height="1" fill="#6AD7FF"/>
      <rect x="7" y="18" width="3" height="1" fill="#6AD7FF"/>
      <rect x="14" y="18" width="3" height="1" fill="#6AD7FF"/>
    </svg>
  ),
  425: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} style={{ imageRendering: 'pixelated' }}>
      {renderLegendPayoffFrame("#9AB7FF")}
      <rect x="6" y="7" width="12" height="10" fill="#223A66"/>
      <rect x="7" y="6" width="10" height="2" fill="#D7E4FF"/>
      <rect x="7" y="16" width="10" height="2" fill="#D7E4FF"/>
      <rect x="8" y="9" width="8" height="6" fill="#314F8C"/>
      <rect x="9" y="10" width="1" height="1" fill="#FFFFFF"/>
      <rect x="13" y="9" width="1" height="1" fill="#FFFFFF"/>
      <rect x="15" y="12" width="1" height="1" fill="#FFFFFF"/>
      <rect x="11" y="14" width="1" height="1" fill="#FFFFFF"/>
      <rect x="9" y="10" width="5" height="1" fill="#9AB7FF"/>
      <rect x="13" y="10" width="1" height="3" fill="#9AB7FF"/>
      <rect x="13" y="12" width="3" height="1" fill="#9AB7FF"/>
      <rect x="10" y="14" width="5" height="1" fill="#9AB7FF"/>
      <rect x="5" y="9" width="2" height="1" fill="#9AB7FF"/>
      <rect x="17" y="14" width="2" height="1" fill="#9AB7FF"/>
      <rect x="11" y="11" width="2" height="2" fill="#D8B95E"/>
    </svg>
  )
};

Object.assign(CardSprites, legendaryPayoffCardSprites);

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
