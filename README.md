# Forged in Chaos

Korean roguelike deckbuilder about forging weapons from card parts.

Players combine a Handle, Head, and optional Deco card to build a weapon each turn, then survive a fixed-act dungeon through combat rewards, rest stops, shops, and boss upgrades.

## Run Locally

Prerequisite: Node.js

```bash
npm install
npm run dev
```

## Validation

```bash
npx tsc --noEmit
npm run build
npx tsx scripts/validateBalance.ts
```

The game is designed to run fully offline from the bundled card and enemy databases.
