# 혼돈의 대장간 (Forged in Chaos)

손잡이, 머리, 장식 카드를 조합해 매 턴 무기를 제작하는 한국어 roguelike deckbuilder입니다.

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
npm run test:balance
npm run test:readiness
npm run test:logic
npm audit --audit-level=moderate
npx playwright install chromium # first time only
npm run test:e2e
```

The game is designed to run fully offline from the bundled card and enemy databases. The readiness gate checks playable card count, archetype coverage, enemy pools, map/reward/event data, sprite coverage, save/onboarding/package files, and CI gates.
