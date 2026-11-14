# CLAUDE.md

Guidance for Claude Code (and anyone else) working in this repository.

## Working agreements

* **Start a new branch for each request**, named `claude/<short-description>`; never commit to `main`.
* **Open a pull request** against `main` when the work is done.
* **Verify before the PR** — CI (`.github/workflows/ci.yml`) runs the same four:
  `npm run typecheck`, `npm test`, `npm run build`, `npm run test:e2e`.
* **Comments explain *why*, not *what*.**

## What this is

A tutorial for the Hong Kong Mahjong game (ClemL/mahjong): lessons with exercises, a scripted example hand,
a practice table, scoring, a page for table players and a history page. Static Next.js on Vercel.

Unlike the game, this site reads upright on a phone: it is a page to scroll, not a table to play round.
Every page must fit a phone held upright with no sideways scroll (the e2e suite checks).

## Layout

```
src/game/            VENDORED from ClemL/mahjong — do not edit; re-copy with scripts/sync-from-game.sh
src/film/            VENDORED — the explainer film
src/components/      TileView, TilePips, TraditionalPips, TraditionalFlower, Choice, Modal, FilmPlayer: VENDORED
src/components/game  The table view, the guided hand, the practice table
src/components/lessons, scoring, site   The tutorial's own components
src/tutorial/        Pure tutorial logic: table builder, the scripted hand, quizzes, scoring examples, coach
src/app/styles/      base, tiles, themes, appearance, controls, animations, film: VENDORED; the rest are ours
e2e/                 Playwright smoke tests, desktop and phone
```

## Conventions

* **The engine decides.** Quiz answers, waits, claims and scores come from `src/game/`, not from text. A new
  exercise or example needs a test in `src/tutorial/__tests__/` that checks it against the engine.
* **Build positions with `buildTable`** (`src/tutorial/table.ts`): it deals from one 144-tile set, so no tile
  is ever in two places.
* **Facts about the game** (timers, settings, defaults) on the Table players page come from the game's code;
  check them there after a sync. History claims need a source in the page's list.
* **Accessibility:** right and wrong are said in words as well as color, animations respect
  `prefers-reduced-motion`, hover effects are gated on `(hover: hover) and (pointer: fine)`.
