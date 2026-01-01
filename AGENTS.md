# AGENTS.md - AI Agent Guidelines for FiC (Forged in Chaos)

## Project Overview

Korean roguelike deckbuilder game with a weapon crafting system. Built with React 19 + TypeScript + Vite. Features pixel art aesthetic with custom CSS animations and Korean/English UI.

---

## Build & Development Commands

```bash
# Development server (port 3000)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Type checking (REQUIRED before commits)
npx tsc --noEmit
```

**CI Pipeline**: Runs `npx tsc --noEmit` and `npm run build` on push/PR to main.

**No test framework configured** - manual testing only.

---

## Project Structure

```
FiC/
  App.tsx              # Main game component (~1800 lines)
  types.ts             # Type definitions and enums
  constants.ts         # Card database, enemies, events
  index.tsx            # React entry point
  index.html           # HTML with Tailwind config & CSS
  components/
    CardComponent.tsx  # Card UI with drag/touch support
    Anvil.tsx          # Crafting station component
    PixelSprites.tsx   # SVG pixel art sprites
    SparkParticle.tsx  # Visual effect component
    DamageNumber.tsx   # Damage popup component
```

**No `src/` folder** - source files are at project root.

---

## TypeScript Configuration

- **Target**: ES2022
- **Module**: ESNext with bundler resolution
- **Path Alias**: `@/*` maps to `./*` (project root)
- **JSX**: react-jsx
- **Strict**: Not enabled, but avoid `any`

```typescript
// Path alias usage
import { CardType } from '@/types';
import CardComponent from '@/components/CardComponent';
```

---

## Code Style Guidelines

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `CardComponent`, `Anvil` |
| Functions | camelCase | `handleCardClick`, `calculateWeaponStats` |
| Types/Interfaces | PascalCase | `CardInstance`, `PlayerStats` |
| Enums | PascalCase + SCREAMING_SNAKE values | `CardType.HANDLE`, `EnemyTier.BOSS` |
| Constants | SCREAMING_SNAKE_CASE | `CARD_DATABASE`, `INITIAL_DECK_IDS` |
| Files | Match primary export | `CardComponent.tsx`, `types.ts` |

### Enums (Preferred Pattern)

Use TypeScript enums for fixed sets of values:

```typescript
export enum CardType {
  HANDLE = 'Handle',
  HEAD = 'Head',
  DECO = 'Deco',
  JUNK = 'Junk'
}

export enum CardRarity {
  STARTER = 'Starter',
  COMMON = 'Common',
  RARE = 'Rare',
  LEGEND = 'Legend',
  JUNK = 'Junk',
  SPECIAL = 'Special'
}
```

### Interfaces

Define all interfaces in `types.ts`:

```typescript
export interface CardData {
  id: number;
  name: string;
  type: CardType;
  cost: number;
  value: number;
  rarity: CardRarity;
  description: string;
  effectId?: string;
  unplayable?: boolean;
}

export interface CardInstance extends CardData {
  instanceId: string;
}
```

---

## React Patterns

### Component Structure

```typescript
interface ComponentProps {
  card: CardInstance;
  onClick: (card: CardInstance) => void;
  disabled?: boolean;
  className?: string;
}

const Component: React.FC<ComponentProps> = ({
  card,
  onClick,
  disabled,
  className
}) => {
  const [state, setState] = useState<StateType>(initialValue);
  const ref = useRef<HTMLDivElement>(null);

  // Event handlers
  const handleClick = () => { /* ... */ };

  // Effects
  useEffect(() => { /* ... */ }, [dependencies]);

  return (
    <div className={`base-classes ${className || ''}`}>
      {/* JSX */}
    </div>
  );
};

export default Component;
```

### State Management

- Game state uses `useState` hooks in `App.tsx`
- No external state management library
- State is passed down via props

---

## Styling Guidelines

### Tailwind CSS

Tailwind is loaded via CDN with custom config in `index.html`.

**Custom Colors** (pixel theme):
- `bg-pixel-bg-dark` - #0f0a12
- `bg-pixel-bg-mid` - #2d2137
- `text-pixel-hp` - #cc3333
- `text-pixel-block` - #3388cc
- `text-pixel-energy` - #ccaa33
- `border-pixel-common` - #5588cc
- `border-pixel-rare` - #aa55cc

**Custom Fonts**:
- `font-pixel` - Press Start 2P (English)
- `font-pixel-kr` - NeoDunggeunmo (Korean)

### Pixel Art CSS Classes

```css
.pixel-border    /* No border-radius, pixelated rendering */
.pixel-shadow    /* 4px offset shadow */
.pixel-shadow-sm /* 2px offset shadow */
```

### Animation Classes

```css
.animate-shake           /* Screen shake on hit */
.animate-shield-pulse    /* Defense activation */
.animate-rare-glow       /* Rare card glow */
.animate-legend-shimmer  /* Legend card shimmer */
.animate-hit-flash       /* Enemy hit flash */
.animate-slot-snap       /* Card slot snap */
.card-discarding         /* Card discard animation */
```

---

## Icon Usage

Use `lucide-react` for all icons:

```typescript
import { Heart, Shield, Zap, Skull, Trophy } from 'lucide-react';

<Heart size={16} className="text-red-400" fill="currentColor" />
<Shield size={20} className="w-5 h-5" />
```

---

## Important Constraints

### NO Emojis in Code
Per CLAUDE.md: Never use emojis in code files.

### Import Safety
From `method.md`: When modifying imports, verify existing imports are not accidentally removed. The game won't render if imports are missing.

```typescript
// BEFORE modifying, check all usages
import { Heart, Shield, Zap, Skull, Trophy } from 'lucide-react';
//                          ^^^^^ Don't remove if still used
```

### Type Safety
- Never use `as any` or `@ts-ignore`
- Run `npx tsc --noEmit` before commits
- Define interfaces for all props and state

---

## Error Handling Pattern

```typescript
const createCardInstance = (id: number): CardInstance => {
  const data = CARD_DATABASE.find(c => c.id === id);
  if (!data) throw new Error(`Card ${id} not found`);
  return { ...data, instanceId: generateId() };
};
```

---

## SVG Pixel Sprites

SVG sprites use `imageRendering: 'pixelated'` and 32x32 viewBox:

```typescript
const MonsterSprite: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 32 32" className={className} style={{ imageRendering: 'pixelated' }}>
    <rect x="8" y="8" width="16" height="16" fill="#696969"/>
    {/* Pixel rectangles */}
  </svg>
);
```

---

## Testing Checklist

Before submitting changes:

1. Run `npx tsc --noEmit` - fix all type errors
2. Run `npm run build` - ensure production build succeeds
3. Test in browser:
   - Menu screen loads
   - Combat starts correctly
   - Cards can be dragged to anvil
   - Crafting and attacking works
   - Rest/Shop screens function

---

## Known Gotchas

1. **App.tsx is massive** (~1800 lines) - be careful with partial reads
2. **No HMR for CSS** - changes in `<style>` require page refresh
3. **Korean text** - UI strings are in Korean, preserve them
4. **Mobile touch** - drag/drop has separate touch handlers
5. **Import maps** - Dependencies loaded via ESM from esm.sh

---

## Changelog Management

**IMPORTANT**: Update `CHANGELOG.md` for every gameplay-related change.

### When to Update
- Adding/removing/modifying cards
- Changing card stats (cost, damage, effects)
- Adding/modifying enemies or bosses
- Adding new mechanics or status effects
- Balance changes

### Format
```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- New features, cards, enemies

### Changed
- Modifications to existing content

### Fixed
- Bug fixes

### Removed
- Removed features

### Design Notes
- Explain WHY changes were made (optional but recommended)
```

### Version Numbering
- **Major (X)**: Large content updates, new floors
- **Minor (Y)**: New cards, enemies, mechanics
- **Patch (Z)**: Balance tweaks, bug fixes

---

## Git Workflow

- CI runs on push to main/master
- Type check + build must pass
- Co-author: Claude (noreply@anthropic.com)
