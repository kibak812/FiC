# Changelog

All notable changes to FiC (Forged in Chaos) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.11.8] - 2026-05-23

### Added
- Regression coverage for combat cleanup restoring temporary card cost debuffs while preserving card instance identity and generated-card payloads.

### Changed
- Combat victory cleanup, combat start, seeded simulation, and run-save migration now reset combat-only card cost modifiers and remove temporary junk before the next fight.
- Product readiness now checks that runtime, saves, and simulation clear combat-only card debuffs.
- Menu version updated to v1.11.8.

### Fixed
- Enemy cost-increase debuffs could permanently raise card costs after combat, carrying the debuff into later fights.

---

## [1.11.7] - 2026-05-23

### Added
- Hand-drawn pixel sprites for 14 generated legendary payoff cards: infinite-return, growth, self-damage, defense-conversion, draw-loop, multi-hit, status, energy, and heavy-build finishers.

### Changed
- Generated card sprite composition now removes the inner square panel, renders large theme motifs behind item silhouettes, and keeps handle grips visually dominant.
- Product readiness now treats the recent common additions and these legendary payoff cards as hand-reviewed sprites, with minimum pixel-detail and color-separation checks.
- Menu version updated to v1.11.7.

### Design Notes
- The late-game reward cards carry archetype identity, so their icons now use bespoke silhouettes and motifs instead of relying on the shared generated-card template.

---

## [1.11.6] - 2026-05-23

### Added
- UI-free enemy turn resolver that applies status ticks, bleed, dodge, block damage, thievery, healing, defending, cleansing, cost pressure, disarm, and deck pollution as inspectable state transitions.
- Core combat tests for enemy turn attack resolution, thievery, cost-pressure side effects, junk side effects, and status cleanse conversion.

### Changed
- Runtime combat and seeded simulation now both use the shared enemy turn resolver instead of duplicating enemy turn calculations.
- Product readiness now checks that App.tsx routes enemy turns through the shared resolver.
- Menu version updated to v1.11.6.

### Design Notes
- This moves another high-risk section out of App.tsx while preserving enemy identity: counter, pollution, cost, and status-response patterns are now testable without rendering the UI.

---

## [1.11.5] - 2026-05-23

### Added
- UI-free combat effect reducer for applying card effect actions to player/enemy state with explicit deck side effects.
- Core combat test coverage for effect action reduction, capped energy recovery, execute thresholds, crystal growth, and replica/draw side effects.

### Changed
- Seeded run simulation now uses the shared combat effect reducer, keeping card effect behavior aligned with runtime combat.
- Product readiness now checks that the combat engine exposes this UI-free reducer.
- Menu version updated to v1.11.5.

### Design Notes
- This continues the App.tsx combat-engine split by moving card effect state mutation into inspectable pure logic instead of leaving it hidden inside UI handlers.

---

## [1.11.4] - 2026-05-23

### Changed
- 균형추 손잡이 and 쌍갈고리 송곳 now use hand-drawn pixel sprites instead of generated motif-only art.
- Product readiness now checks that recently added cards keep hand-reviewed pixel sprites.
- Menu version updated to v1.11.4.

### Design Notes
- The new common cards are meant to teach draw-loop and multi-hit entry points, so their silhouettes now show that intent directly: balance weights and draw ribbons for the handle, paired hooked awls and two hit sparks for the head.

---

## [1.11.3] - 2026-05-23

### Changed
- Seeded run simulation now enforces a 5% minimum win-rate gate, up from 1%.
- Simulation combat scoring now evaluates real card effects, block piercing, thorns risk, lethal risk, event choices, shop purchases, and boss reward timing more deliberately.
- Cave Heart, Corrupted Smith, and Molten Overseer received narrow endurance and burst reductions while keeping their status cleanse, disarm, cost pressure, and block-counter identities intact.
- Menu version updated to v1.11.3.

### Design Notes
- This pass raises the automated run from a bare survivability smoke test into a stronger balance guard without flattening enemy patterns. The boss changes target overlong attrition points, while the simulator changes better reflect a careful player choosing around card effects.

---

## [1.11.2] - 2026-05-23

### Added
- Seeded run simulation now enforces a minimum 1% win-rate sanity gate so future balance changes cannot silently return to unwinnable runs.
- Shared initial player stat helper used by both runtime and simulation.

### Changed
- Player starts at 80 HP and 4 energy to better fit the multi-card weapon forging economy.
- Rest repair now heals 50% of max HP.
- Act 1 early combat nodes use onboarding-safe enemies before introducing counter-pattern enemies.
- Boss HP and burst damage were rescaled by act, and act transitions now fully repair the player after choosing a boss reward.
- Simulation card rewards now value slot balance, playable cost, and energy progression instead of raw rarity alone.
- Menu version updated to v1.11.2.

### Design Notes
- The goal of this pass is not to make the game easy; it ensures a conservative automated player can occasionally complete a full run, which is a stronger product signal than terminal losses alone.

---

## [1.11.1] - 2026-05-23

### Added
- New common cards: 균형추 손잡이 and 쌍갈고리 송곳, bringing the real playable card pool to 120 cards without counting special or junk cards.
- Product readiness validation for card/archetype coverage, enemy pools, map/reward/event tables, pixel sprite coverage, save/onboarding/package files, and CI gates.

### Changed
- CI now runs the product readiness gate and a moderate-or-higher security audit.

### Design Notes
- The new cards deliberately reinforce early draw-loop and multi-hit decisions, and their dedicated pixel motifs are checked so new card art cannot silently fall back to generic sprites.

---

## [1.11.0] - 2026-05-23

### Added
- New static events: Collapsed Mine Cart and Cooling Trough.
- Logic tests now enforce enemy roster counts, act/tier enemy pools, map node coverage, static reward tables, shop items, boss rewards, and event table completeness.

### Changed
- Menu version updated to v1.11.0.

### Design Notes
- Event choices now include safer resource recovery, HP-for-gold risk, small healing, and paid card refinement so event paths feel less repetitive without adding online or generated content.

---

## [1.10.1] - 2026-05-23

### Added
- Bundled offline pixel fonts via `@fontsource/press-start-2p` and `galmuri`.

### Changed
- Korean UI font stack now prefers the bundled Galmuri font before system fallbacks.
- Release checklist now explicitly verifies bundled pixel fonts.
- Menu version updated to v1.10.1.

### Design Notes
- Font packaging now matches the offline styling goal with real bundled font files instead of relying only on system fallbacks.

---

## [1.10.0] - 2026-05-23

### Added
- Procedural Web Audio sound effects and background music loop with persisted sound settings.
- Accessibility settings for reduced motion, high contrast, and larger text.
- Local Tailwind build pipeline with `tailwind.config.cjs`, `postcss.config.cjs`, and `styles.css`.
- Store release checklist covering validation commands, offline packaging, deployment, and manual smoke testing.

### Changed
- Removed runtime CDN dependencies from `index.html`; fonts now use offline fallback stacks and styles build through Vite.
- Settings save data migrated to version 3 with volume clamping for older or malformed settings.
- Menu version updated to v1.10.0.

### Design Notes
- Audio uses generated cues rather than remote assets so packaged builds remain playable offline.

---

## [1.9.0] - 2026-05-23

### Added
- First-combat tutorial that explains handle, head, deco, forge prediction, enemy intent, and status inspection.
- Combat help modal with card type explanations, enemy intent guide, and a full status-effect dictionary.
- Failure feedback on the game-over screen with contextual next-run learning tips.
- Settings action to replay the first-combat tutorial.

### Changed
- Settings save data migrated to version 2 to persist tutorial completion.
- UI e2e smoke test now verifies the first-combat tutorial and combat help dictionary.

### Design Notes
- Onboarding now teaches the crafting rules inside the first real combat instead of front-loading a separate manual.

---

## [1.8.0] - 2026-05-23

### Added
- Automated core combat tests for weapon stat calculation, card effects, enemy status ticks, blocked damage, enemy intent planning, static reward determinism, and archetype coverage.
- Seed-based 1000-run simulation script that exercises map routing, combat, rewards, shops, events, rests, and boss rewards without UI.
- Playwright UI e2e smoke test for menu, map entry, first combat, card slotting, and forge attack resolution.

### Changed
- CI now runs balance validation, logic tests, seeded simulations, Playwright UI e2e, type checking, and production build before passing.
- Map generation and Gambler's Handle effect can now receive seeded RNG for deterministic testing while preserving default runtime randomness.

### Fixed
- Development dependency audit now reports 0 vulnerabilities after updating vulnerable transitive Vite/Rollup/PostCSS/Picomatch packages.

### Design Notes
- The simulation currently verifies that seeded runs close cleanly through win/loss terminal states and static data paths; win-rate tuning remains a later balance task.

---

## [1.7.0] - 2026-05-23

### Added
- UI 없이 호출 가능한 `utils/combatEngine.ts` for weapon stat calculation, enemy turn-start statuses, blocked damage, and enemy intent planning.
- Deterministic RNG injection for card instance creation, shuffling, gold rewards, combat card rewards, and random card rewards.

### Changed
- Combat weapon preview, forge resolution, enemy turn status ticks, and enemy intent effects now use shared pure calculation helpers instead of duplicating math in `App.tsx`.

### Design Notes
- This keeps existing card and enemy behavior grounded in the static data while preparing the combat layer for unit tests and seeded run simulations.

---

## [1.6.0] - 2026-05-23

### Added
- Run autosave with continue support across map, combat action, reward, shop, rest, event, boss reward, and card removal screens.
- New run confirmation when an existing save is present.
- Persistent settings for combat animation and screen shake preferences.
- Versioned save/settings migration helpers for future save format changes.

### Design Notes
- Combat autosaves only on stable player-action frames to avoid replaying draw, discard, or enemy-turn side effects after continue.

---

## [1.5.2] - 2026-05-23

### Changed
- Expanded generated card pixel art with per-card motifs so new cards read as distinct items instead of palette swaps.
- Added dedicated pixel sprites for the 22 expanded enemies that previously fell back to the default monster image.

### Design Notes
- Card and enemy art is treated as core gameplay readability: slot, archetype, rarity, and individual item identity should be visible at icon scale.

---

## [1.5.1] - 2026-05-23

### Changed
- Balance validation now separates intended warning exceptions from unexpected warnings.
- `scripts/validateBalance.ts` now fails on any validation error or unexpected warning, not only critical errors.

### Design Notes
- The current 57 card warnings are documented as intentional exceptions for tutorial simplicity, archetype enablers, conditional payoffs, and generated runtime cards.

---

## [1.5.0] - 2026-05-23

### Added
- Expanded the card database from 54 to 120 cards.
- Added static archetype definitions for self-damage, defense conversion, status damage, energy loop, draw loop, heavy strike, and multi-hit builds.
- Added common, rare, and legendary cards across Handle, Head, and Deco slots for the major build axes.
- Added generated pixel-art card sprites for every card that lacked bespoke art, including all newly added cards.

### Changed
- Weapon preview and combat effect processing now recognize the expanded defensive, status, energy, draw, heavy, and multi-hit card families.

### Design Notes
- New card art uses slot silhouettes, archetype palettes, rarity frames, and pixel symbols so expanded rewards are visually readable instead of falling back to generic icons.

---

## [1.4.0] - 2026-05-23

### Added
- Expanded the enemy roster from 14 to 36 static enemies across three acts.
- Each act now has at least 7 common enemies, 3 elite enemies, and 2 boss candidates in `ENEMY_POOLS`.
- Added structured enemy intent effects for junk injection, handle cost pressure, cost limits, disarm, reflect damage, defense counters, combo counters, status cleansing, strength gain, and self-healing.

### Changed
- Boss map nodes now choose from static boss pools instead of a single fixed boss per act.
- Enemy balance validation now infers enemy act placement from `ENEMY_POOLS` and accounts for multi-hit intent damage.

### Design Notes
- Enemy content now covers the requested counter pattern families per act: status counter, defense counter, multi-hit counter, cost pressure, and deck pollution.
- The new intent effect data keeps offline enemy behavior visible in static content definitions instead of hiding new patterns behind enemy-id conditionals.

---

## [1.3.2] - 2026-05-23

### Changed
- Combat rewards, shop stock, and boss rewards now use static data tables instead of inline UI/gameplay constants.
- Reward generation now reads gold ranges, card option counts, shop prices, and boss reward effects from offline definitions.
- GAME_EVENTS now appear during runs on static event floors and apply offline event outcomes for healing, rare cards, removal, gold costs, HP costs, full heals, and random rare upgrades.
- Fixed rail progression has been replaced with an act map made of connected combat, elite, rest, shop, event, and boss nodes.
- Growth Crystal (407) cost increased from 0 to 1 to bring permanent growth under the validator's legendary budget.

### Design Notes
- This closes the first offline-core slice for combat rewards, shop purchases, and boss rewards while preserving the current balance values.
- Event integration connects the existing static event database to moment-to-moment progression without adding online or generated content dependencies.
- Map generation chooses from static node layouts, enemy pools, and event data so runs remain offline while gaining route decisions.
- Pot Lid (104) is now validated as a defensive head instead of double-counting its value as both damage and block.

---

## [1.3.1] - 2026-01-02

### Fixed
- **Enemy DEFEND Intent Bug**: Enemies with "방어 태세" (Defend stance) now correctly gain block
  - Affected enemies: Skeleton Warrior, Rock Crusher, Automaton Defender, Shadow Assassin, Loot Goblin
  - Previously, DEFEND intents were displayed but had no effect
- **Toast Notification Bug**: Fixed toasts only showing once then stopping
  - Root cause: useEffect cleanup was clearing timers on every dependency change
  - Fix: Use useRef for timer management, cleanup only on unmount

### Changed
- **Light Feather (204)**: "다음 턴 드로우 +1" -> "카드 1장 즉시 드로우"
  - Differentiated from Old Strap (106) which keeps the delayed draw effect
- **Lightweight Handle (218)**: 0.75x -> 0.8x damage multiplier
  - Description updated: "피해량 75%" -> "피해량 80%"

### Improved
- **Enemy HP Bar**: Enhanced text visibility with stronger text-shadow outline
- **Shop Confirmation**: Added purchase confirmation modal before deducting gold
  - Shows item name, description, and price
  - Cancel/Confirm buttons prevent accidental purchases
- **Card Value Badge**: Adaptive width for decimal multipliers (e.g., x0.8)
  - Prevents text overflow on cards with non-integer values

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
