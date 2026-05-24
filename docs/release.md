# Release Checklist

This document is the release gate for a packaged FiC build.

## Required Commands

Run these from the repository root before tagging or pushing a release commit:

```bash
npm ci
npx tsc --noEmit
npm run test:readiness
npm run test:balance
npm run test:logic
npm run test:e2e
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

- Push to `main` triggers CI and a GitHub Pages deployment that repeats the required verification gates before publishing.
- Confirm both workflows complete successfully before announcing a build.
- The settings menu must expose sound, music, motion, contrast, text size, and tutorial reset controls.
- Save migrations must preserve old settings and clamp volume values to `0..1`.

## Manual Smoke Test

1. Open the packaged build.
2. Start a new run and confirm the map appears.
3. Enter a combat node and verify the first-combat tutorial walks through handle, head, craft, and enemy intent inspection.
4. Open the combat help dictionary and close it.
5. Place a handle and head on the anvil, craft, and end the turn.
6. Choose or skip a combat reward, then confirm the route advances.
7. Return to menu after a reload and confirm the saved run can continue.
8. Toggle sound/music/accessibility settings and tutorial reset, then reload to confirm they persist.
9. Check 1280x720 and 390x844 combat viewports: enemy, anvil, hand, craft button, and turn-end button must all remain visible and clickable.
10. Confirm the browser console has no relevant errors or warnings.
