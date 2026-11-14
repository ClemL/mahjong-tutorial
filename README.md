# Learn Hong Kong Mahjong

A tutorial for the [Hong Kong Mahjong table](https://clem-mahjong.vercel.app/)
([repo](https://github.com/ClemL/mahjong)): learn to play with interactive
lessons, play one hand with a coach, practice against the computer, and learn
the scoring from the first faan to the limit hands. Next.js, static, deployed to
Vercel.

## What is in it

| Section | What it does |
| --- | --- |
| **Learn** (`/learn`) | Seven lessons — tiles, sets, the winning hand, seats and turns, claims, being ready, first strategy — each with an exercise: a tile explorer, a set quiz, a hand to split into sets, a claims quiz, a waits quiz, a discard quiz. |
| **Example hand** (`/example`) | One hand on the real engine. The other three seats follow a script; a coach asks for each move (a discard, a chow, a pung, a claim to refuse, a self-drawn win), refuses a wrong one with a reason, and explains the right one. |
| **Practice** (`/practice`) | Whole hands against the game's own Easy, Normal or Hard computer players, with a coach that counts steps from ready, suggests a discard and lists your waits. |
| **Scoring** (`/scoring`) | The payout table, who pays, every faan pattern with an example hand, a scoring lab, reading a hand two ways, the fine print and a faan quiz. |
| **Table players** (`/table-players`) | For people who already play at a real table: how the app's tablet-and-phones setup, strict claim order and house rules differ. |
| **History** (`/history`) | A sourced timeline from Qing dynasty China to today, and the main variants. |

The game's hand-drawn explainer film opens from the home page.

## Built on the game's own code

`src/game/` (the rules engine), the tile artwork and theme components in
`src/components/`, the tile and theme stylesheets in `src/app/styles/` and the
film in `src/film/` are copied unchanged from `ClemL/mahjong`, along with the
engine's own tests. Nothing the tutorial says about the rules is typed in by
hand where the engine can say it:

* every quiz answer — which tiles a hand waits on, what a discard may be claimed
  for, the quickest discard — is computed by the engine, and the tests check
  the written explanations against it;
* every example hand on the scoring page is scored live by `scoreHand`, and a
  test asserts each one scores the pattern it illustrates;
* the example hand is a real deal on the engine, and a test plays the whole
  script and checks the final 3 faan and the payments.

To pick up a rule change from the game:

```bash
scripts/sync-from-game.sh ../mahjong
npm test
```

## Running it

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # engine + tutorial tests
npm run typecheck
npm run build
npm run test:e2e   # Playwright, desktop and phone, against the build
```

On a machine with a Chromium already installed, `PW_CHROMIUM_PATH=/path/to/chrome npm run test:e2e`
uses it instead of the browser this Playwright version downloads.

## Deploying

A stock Next.js app with no environment variables: import the repository at
[vercel.com/new](https://vercel.com/new) and keep the defaults. Every page is
prerendered static.
