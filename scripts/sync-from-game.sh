#!/usr/bin/env bash
# Re-copy the game's engine, tile artwork, styles and film from a checkout of
# ClemL/mahjong, so the tutorial keeps teaching exactly what the game plays.
#
#   scripts/sync-from-game.sh ../mahjong
#
# Then run the four checks. A failing tutorial test after a sync means a rule
# changed in the game and a lesson, quiz or example needs to follow it.
set -euo pipefail
GAME="${1:-../mahjong}"
HERE="$(cd "$(dirname "$0")/.." && pwd)"
[ -f "$GAME/src/game/engine.ts" ] || { echo "No mahjong checkout at $GAME" >&2; exit 1; }

ENGINE="tiles melds rng winning scoring rules engine shanten ai plan controller waits helper sets patternTiles appearance sound"
ENGINE_TESTS="tiles winning scoring shanten claims engine limits waits helper sets patternTiles plan ai appearance wall"
COMPONENTS="TileView TilePips TraditionalPips TraditionalFlower Choice Modal FilmPlayer"
STYLES="base tiles themes appearance controls film animations"

for f in $ENGINE; do cp "$GAME/src/game/$f.ts" "$HERE/src/game/"; done
for f in $ENGINE_TESTS; do cp "$GAME/src/game/__tests__/$f.test.ts" "$HERE/src/game/__tests__/"; done
for f in $COMPONENTS; do cp "$GAME/src/components/$f.tsx" "$HERE/src/components/"; done
for f in $STYLES; do cp "$GAME/src/app/styles/$f.css" "$HERE/src/app/styles/"; done
cp "$GAME"/src/film/*.ts "$HERE/src/film/"
cp "$GAME/src/hooks/useAppearance.ts" "$HERE/src/hooks/"
sed 's#from "./TileView"#from "@/components/TileView"#' "$GAME/src/components/MeldRow.tsx" > "$HERE/src/components/game/MeldRow.tsx"
echo "Copied from $(git -C "$GAME" rev-parse --short HEAD 2>/dev/null || echo "$GAME")"
