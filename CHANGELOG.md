# Changelog

All notable changes to FiC (Forged in Chaos) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.3.0] - 2026-01-01

### Architecture Refactoring

Major internal refactoring to improve code maintainability. App.tsx reduced from ~2,400 lines to ~1,400 lines.

#### New Directory Structure
```
FiC/
  components/           # UI Components
    Anvil.tsx          # Crafting station
    CardComponent.tsx  # Card display with drag/touch
    DamageNumber.tsx   # Damage popup
    DeckHUD.tsx        # Deck/discard counter
    EnemySection.tsx   # Enemy display with intents
    IntentDetailModal.tsx
    PlayerHUD.tsx      # HP/energy/block display
    PixelSprites.tsx   # SVG pixel art
    SparkParticle.tsx  # Visual effects
    StatusDetailModal.tsx
  hooks/               # Custom React Hooks
    useAnimations.ts   # Combat animation state
    useToast.ts        # Toast notification queue
  screens/             # Full-screen views
    BossRewardScreen.tsx
    GameOverScreen.tsx
    MenuScreen.tsx
    RemoveCardScreen.tsx
    RestScreen.tsx
    RewardScreen.tsx
    ShopScreen.tsx
  utils/               # Utilities
    cardEffects.ts     # Effect registry system
    cardUtils.ts       # Card creation helpers
    statusDescriptions.ts
```

#### Card Effect Registry System

New declarative effect system replaces inline conditionals:

```typescript
// Before (scattered in handleForgeAndAttack)
if (slots.handle?.id === 318) {
  // Blood Handle logic
}

// After (utils/cardEffects.ts)
registerEffect({
  cardId: 318,
  slot: 'handle',
  phase: 'SELF_DAMAGE',
  execute: (ctx) => [{ type: 'PLAYER_SELF_DAMAGE', amount: 4 }]
});
```

Effect phases:
- `SELF_DAMAGE`: Self-damage effects (processed first)
- `PRE_DAMAGE`: Damage modifiers (Berserker Rune, Gambler, etc.)
- `ON_HIT`: Per-hit effects (Lifesteal, Gold gain)
- `POST_DAMAGE`: Status effects, draw, etc.

### Fixed
- **Berserker Rune + Blood Handle combo**: Fixed timing issue where self-damage wasn't counted for Berserker Rune's bonus when used on the same weapon
  - Root cause: All PRE_DAMAGE conditions were evaluated before self-damage actions were processed
  - Fix: Added SELF_DAMAGE phase that runs before PRE_DAMAGE

### Technical Improvements
- Removed unused `intentLongPressTimer` ref
- Added timeout cleanup in `useToast` hook to prevent memory leaks on unmount

---

## [1.2.1] - 2026-01-01

### Added
- **Status Effect Tooltips**: Click/tap on any status effect icon to see detailed explanation
  - Shows status name (Korean), current stack count, and full description
  - Modal UI consistent with existing Intent Detail modal
  - Supported statuses: Poison, Bleed, Burn, Stun, Strength, Vulnerable, Weak

### Changed
- **Kobold Scrapper**: HP 45 -> 36 (was too high for Floor 1 enemies)
  - For reference: Rust Slime has 30 HP, Skeleton Warrior has 32 HP

### Removed
- **REACTIVE_RARE trait**: Removed from Kobold Scrapper and codebase
  - Was too complex for Floor 1 (triggered when player used Rare cards, permanently buffed enemy attacks)
  - Poor discoverability (no UI indicator, confusing for new players)

### Design Notes
- Status effect tooltips improve new player experience by explaining mechanics on-demand
- Kobold Scrapper's HP was ~40% higher than other Floor 1 enemies with similar damage output

---

## [1.2.0] - 2026-01-01

### Changed
- **Iron Spikes (207)**: Redesigned from HEAD to DECO type
  - Renamed: "스파이크 쉴드" -> "철갑 가시"
  - Type: HEAD -> DECO
  - Cost: 0 -> 1
  - Rarity: Common -> Rare
  - Effect: Now adds 100% of current block as bonus damage (works with defense weapons)
  - New sprite: Metal plate with 4-directional spikes

### Design Notes
- Iron Spikes was unusable as a HEAD because you couldn't gain block and use it in the same turn
- As a DECO, it now combos with Parrying Guard + any HEAD for attack + defense synergy
- Cost 1 and Rare rarity for balance (prevents being strictly better than Thorn Sigil)

---

## [1.1.0] - Balance Patch v1.1

### Added
- **New Common Cards**:
  - 215 Agile Blade (민첩한 칼날): 6 damage, +1 draw next turn
  - 218 Lightweight Handle (가벼운 자루): 75% damage multiplier, cost 0
  - 219 Weakening Sigil (쇠약의 문양): Apply 1 Weak to enemy

- **New Rare Cards**:
  - 313 Mana Blade (마력 칼날): 4 damage, restore 1 energy
  - 314 Frenzy Blade (광기의 칼날): 12 damage, 4 self-damage
  - 317 Piercing Handle (관통 자루): Ignores enemy block
  - 318 Blood Handle (피의 자루): Cost 0, 4 self-damage
  - 319 Blood Whetstone (피의 숫돌): +2 damage, apply 2 bleed
  - 320 Berserker Rune (광전사의 룬): Bonus damage equal to self-damage this turn

- **New Legend Cards**:
  - 408 Frost Blade (서리 칼날): 8 damage, stun enemy
  - 409 Executioner's Blade (처형자의 칼날): 5 damage, execute enemies below 20% HP
  - 412 Evasion Handle (회피의 자루): Dodge next enemy attack
  - 413 Dragon Sigil (용의 문장): 2x damage multiplier

### Changed
- **Meteor Fragment (404)**: 40 -> 30 damage, 5 -> 6 self-damage (nerf)

### New Mechanics
- **Piercing**: Attacks ignore enemy block
- **Evasion**: Dodge next incoming attack
- **Execute**: Instantly kill enemies below HP threshold

---

## [1.0.0] - Balance Patch v1.0

### Added
- **Burn/Overheat System**: New status effects for fire-themed cards
  - Burn: Damage per turn (does NOT decay)
  - Overheat: Reduces energy next turn

- **New Common Cards**:
  - 209 Cogwheel (톱니 바퀴): 5 damage, +1 per bleed stack
  - 210 Thorn Sigil (가시 문양): Add 50% of block as damage
  - 211 Capacitor (축전지): +4 damage per remaining energy
  - 212 Lightweight Handle (경량 손잡이): Draw 1 if total cost <= 1
  - 213 Poison Needle (독침): 3 damage + enemy poison stacks
  - 214 Blunt Club (무딘 곤봉): 8 damage, apply 1 weak

- **New Rare Cards**:
  - 308 Furnace Core (용광로 코어): 15 damage, 1 overheat
  - 309 Gambler's Handle (도박사의 손잡이): 1-3x random multiplier
  - 310 Combo Strike (연속 타격): 4 damage + 2 per weapon used this turn
  - 311 Steel Plating (강철 도금): Double block on this weapon
  - 312 Lava Blade (용암 칼날): 10 damage, apply 4 burn

- **New Legend Cards**:
  - 405 Infinite Regression (무한 회귀): Returns to hand after use (once per turn)
  - 406 Time Cog (시간의 톱니): Stun enemy, skip next intent
  - 407 Growing Crystal (성장하는 결정): Permanent +2 damage (stacks, max 16)

- **New Enemy**:
  - Shadow Assassin (그림자 암살자): Floor 3 Elite

### Changed
- **Rust Slime**: Debuff moved from 2nd to 3rd intent (better new player experience)
- **Skeleton Warrior**: HP 40 -> 32, damage 8/10 -> 6/8 (nerf)
- **Corrupted Smith**: HP 250 -> 220 (nerf)
- **Chimera Engine**: HP 180 -> 150 (nerf)
- **Deus Ex Machina**: HP 500 -> 400 (nerf)

---

## [0.9.0] - Initial Release

### Core Systems
- Weapon crafting system (Handle + Head + optional Deco)
- 3 floors with unique enemies and bosses
- Card reward and shop systems
- Rest and event encounters

### Starter Cards
- 101 Old Wooden Handle (낡은 나무 손잡이)
- 102 Parrying Guard (패링 가드)
- 103 Rusty Iron Blade (녹슨 철 칼날)
- 104 Pot Lid (냄비 뚜껑)
- 105 Rough Whetstone (거친 숫돌)
- 106 Old Strap (낡은 끈)

### Original Common Cards
- 201 Swift Dagger Handle (날렵한 단검 자루)
- 202 Steel Longsword (강철 롱소드)
- 203 Sawblade (톱날)
- 204 Light Feather (가벼운 깃털)
- 205 Poison Cloth (독 묻은 헝겊)
- 206 Bone Handle (뼈 손잡이)
- 208 Charged Gem (충전된 보석)

### Original Rare Cards
- 301 Twin Handle (쌍둥이 손잡이)
- 302 Vampire Vine (흡혈 덩굴)
- 303 Flamethrower (화염 방사기)
- 304 Heavy Warhammer (육중한 전쟁망치)
- 305 Mirror of Duplication (복제의 거울)
- 306 Twin Fangs (쌍둥이 송곳니)
- 307 Midas Touch (마이더스의 손)

### Original Legend Cards
- 401 Giant's Grip (거인의 악력)
- 402 Void Crystal (공허의 수정)
- 403 Philosopher's Stone (현자의 돌)
- 404 Meteor Fragment (운석 파편)

### Status Effects
- Poison: Damage per turn, decays by 1
- Bleed: Damage when enemy attacks, decays by 1
- Vulnerable: Take 50% more damage
- Weak: Deal 25% less damage
- Stun: Skip turn

### Enemies
- **Floor 1**: Rust Slime, Kobold Scrapper, Skeleton Warrior
- **Floor 1 Elite**: Rock Crusher
- **Floor 1 Boss**: Junk King
- **Floor 2**: Ember Wisp, Hammerhead, Loot Goblin
- **Floor 2 Elite**: Mimic Anvil
- **Floor 2 Boss**: Corrupted Smith
- **Floor 3**: Automaton Defender
- **Floor 3 Elite**: Chimera Engine
- **Floor 3 Boss**: Deus Ex Machina
