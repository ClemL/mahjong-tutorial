/**
 * What the practice coach says, worked out from the engine: how far the hand
 * is from ready, the discard the computer's own Normal player would make, and
 * which tiles a ready hand is waiting on.
 */
import { greedyAi } from "@/game/ai";
import { type ClaimOption, type GameState } from "@/game/engine";
import { createRng } from "@/game/rng";
import { acceptance, handShanten, seenCounts } from "@/game/shanten";
import { type Seat, type Tile, type TileCode, isFlower } from "@/game/tiles";
import { standingWaits, type Wait } from "@/game/waits";
import { countsFromCodes } from "@/game/winning";

export function stepsText(shanten: number): string {
  if (shanten < 0) return "Your hand is complete.";
  if (shanten === 0) return "You are ready: one tile from winning.";
  if (shanten === 1) return "One tile away from ready.";
  return `${shanten} tiles away from ready.`;
}

function seen(state: GameState, seat: Seat) {
  const own = state.players[seat]!.hand.filter((t) => !isFlower(t.code)).map((t) => t.code);
  return seenCounts(
    own,
    state.players.flatMap((p) => p.melds.map((m) => m.tiles.map((t) => t.code))),
    state.players.map((p) => p.discards.map((t) => t.code)),
  );
}

export interface DiscardAdvice {
  tile: Tile;
  /** Steps from ready after this discard. */
  shanten: number;
  /** Tiles still unseen that would bring the hand closer. */
  improving: number;
  improvingKinds: TileCode[];
}

/** The discard the computer's Normal player would make from your seat, and what it leaves. */
export function adviseDiscard(state: GameState, seat: Seat): DiscardAdvice | null {
  const decision = greedyAi.chooseTurnAction(state, seat, createRng(state.logSeq + 7));
  if (decision.type !== "discard") return null;
  const p = state.players[seat]!;
  const tile = p.hand.find((t) => t.id === decision.tileId);
  if (!tile) return null;
  const rest = p.hand.filter((t) => t.id !== tile.id && !isFlower(t.code)).map((t) => t.code);
  const counts = countsFromCodes(rest);
  const visible = seen(state, seat);
  const acc = acceptance(counts, p.melds, visible);
  return { tile, shanten: handShanten(counts, p.melds), improving: acc.count, improvingKinds: acc.tiles };
}

/** Steps from ready for the hand as it is held between turns (13 tiles, give or take sets). */
export function standingShanten(state: GameState, seat: Seat): number {
  const p = state.players[seat]!;
  return handShanten(countsFromCodes(p.hand.filter((t) => !isFlower(t.code)).map((t) => t.code)), p.melds);
}

/** Steps from ready after your best discard, on your turn. */
export function turnShanten(state: GameState, seat: Seat): number {
  const p = state.players[seat]!;
  const codes = p.hand.filter((t) => !isFlower(t.code)).map((t) => t.code);
  let best = 99;
  for (const code of new Set(codes)) {
    const rest = [...codes];
    rest.splice(rest.indexOf(code), 1);
    best = Math.min(best, handShanten(countsFromCodes(rest), p.melds));
  }
  return best;
}

export function waitsFor(state: GameState, seat: Seat): Wait[] {
  const p = state.players[seat]!;
  return standingWaits(p.hand, p.melds, state.players);
}

/** The claim the computer's Normal player would make, or null to pass. */
export function adviseClaim(state: GameState, seat: Seat, options: ClaimOption[]): ClaimOption | null {
  return greedyAi.chooseClaim(state, seat, options, createRng(state.logSeq + 11));
}
