# Release Checklist

This document is the release gate for a packaged FiC build.

## Required Commands

Run these from the repository root before tagging or pushing a release commit:

```bash
npm ci
npx tsc --noEmit
npm run test:balance
npm test
npm run build
npm audit --audit-level=moderate
```

## Offline Packaging

- `index.html` must not load runtime code, fonts, or CSS from an external CDN.
- Tailwind output is generated during `npm run build` from `styles.css`, `tailwind.config.cjs`, and `postcss.config.cjs`.
- Pixel fonts are bundled through npm packages: `@fontsource/press-start-2p` for English display text and `galmuri` for Korean UI text.
- Sound and music are procedural Web Audio cues, so no remote audio files are required.
- The production artifact is `dist/`; test it with `npm run preview` before release.

## Store Build Notes

- Push to `main` triggers CI and GitHub Pages deployment.
- Confirm both workflows complete successfully before announcing a build.
- The settings menu must expose sound, music, motion, contrast, text size, and tutorial reset controls.
- Save migrations must preserve old settings and clamp volume values to `0..1`.

## Manual Smoke Test

1. Open the packaged build.
2. Start a new run and confirm the map appears.
3. Enter a combat node and verify the first-combat tutorial can be skipped.
4. Open the combat help dictionary and close it.
5. Place a handle and head on the anvil, craft, and end the turn.
6. Return to menu after a reload and confirm the saved run can continue.
7. Toggle sound/music/accessibility settings and reload to confirm they persist.
