/**
 * Looking back over a practice hand: each decision you made, set beside the
 * one the game's Normal computer player would have made from the same seat,
 * and what the difference cost. Only differences that changed something —
 * a win missed, a step further from ready, a hand left without the faan to
 * win — count as mistakes; the rest are shown only on request, so a beginner
 * is not buried in near-ties.
 */
import { greedyAi } from "@/game/ai";
import { type ClaimOption, type GameState, claimTurn } from "@/game/engine";
import type { Meld } from "@/game/melds";
import { type RoutePlan, bestPlan, comparePlans, routes } from "@/game/plan";
import { createRng } from "@/game/rng";
import { acceptance, handShanten, seenCounts } from "@/game/shanten";
import { type Seat, type Tile, type TileCode, isFlower, tileName } from "@/game/tiles";
import { countsFromCodes } from "@/game/winning";
import { routeLabel, seatingOf } from "./routes";

export type Decision =
  | { kind: "discard"; before: GameState; tileId: string }
  | { kind: "claim"; before: GameState; optionId: string | null };

export type Verdict =
  /** The same move the coach would make. */
  | "match"
  /** Different, but no worse by any measure shown. */
  | "fine"
  /** Fewer tiles would now improve the hand. A near-tie: shown only on request. */
  | "narrower"
  /** A step further from ready. */
  | "slower"
  /** No route left that reaches the table's minimum. */
  | "cheaper"
  /** A claim the hand was better off without, or one it needed. */
  | "claim"
  /** A win was there to take. */
  | "missedWin";

export const MISTAKES: Verdict[] = ["missedWin", "cheaper", "slower", "claim"];

export interface Shape {
  /** Tiles from ready after the move: 0 is ready. */
  shanten: number;
  /** Unseen tiles that would bring the hand a step closer. */
  improving: number;
  plan: RoutePlan;
}

export interface Review {
  index: number;
  kind: Decision["kind"];
  verdict: Verdict;
  /** The hand as it stood, for showing. */
  hand: TileCode[];
  yours: string;
  coach: string;
  yourCode: TileCode | null;
  coachCode: TileCode | null;
  why: string;
  yourShape?: Shape;
  coachShape?: Shape;
}

function visible(state: GameState, seat: Seat) {
  const own = state.players[seat]!.hand.filter((t) => !isFlower(t.code)).map((t) => t.code);
  return seenCounts(
    own,
    state.players.flatMap((p) => p.melds.map((m) => m.tiles.map((t) => t.code))),
    state.players.map((p) => p.discards.map((t) => t.code)),
  );
}

function shapeAfter(state: GameState, seat: Seat, codes: TileCode[], melds: Meld[]): Shape {
  const counts = countsFromCodes(codes.filter((c) => !isFlower(c)));
  return {
    shanten: handShanten(counts, melds),
    improving: acceptance(counts, melds, visible(state, seat)).count,
    plan: bestPlan(routes(counts, melds, seatingOf(state, seat)), state.config.minFaan),
  };
}

function without(hand: Tile[], id: string): TileCode[] {
  return hand.filter((t) => t.id !== id).map((t) => t.code);
}

function stepsText(shanten: number): string {
  if (shanten < 0) return "complete";
  if (shanten === 0) return "ready";
  return `${shanten} from ready`;
}

export function describeShape(s: Shape): string {
  return `${stepsText(s.shanten)}, ${s.improving} tiles help`;
}

function compareShapes(yours: Shape, coach: Shape, minFaan: number): Verdict {
  const yoursOk = yours.plan.faan >= minFaan;
  const coachOk = coach.plan.faan >= minFaan;
  if (!yoursOk && coachOk) return "cheaper";
  if (yours.shanten > coach.shanten) return "slower";
  if (comparePlans(yours.plan, coach.plan, minFaan) > 0 && yours.plan.shanten > coach.plan.shanten) return "slower";
  if (yours.improving + 4 <= coach.improving) return "narrower";
  return "fine";
}

function sortedHand(state: GameState, seat: Seat): TileCode[] {
  return state.players[seat]!.hand.map((t) => t.code).filter((c) => !isFlower(c));
}

export function reviewDiscard(before: GameState, seat: Seat, tileId: string, index = 0): Review {
  const p = before.players[seat]!;
  const mine = p.hand.find((t) => t.id === tileId)!;
  const decision = greedyAi.chooseTurnAction(before, seat, createRng(before.logSeq + 7));
  const hand = sortedHand(before, seat);
  const yourShape = shapeAfter(before, seat, without(p.hand, tileId), p.melds);
  const yours = `You threw the ${tileName(mine.code)}`;

  if (decision.type === "win") {
    return {
      index, kind: "discard", verdict: "missedWin", hand, yourCode: mine.code, coachCode: null, yourShape,
      yours, coach: "Win 自摸",
      why: "The tile you drew completed your hand at enough faan to win. Look for the Win button before throwing.",
    };
  }
  if (decision.type === "kong") {
    return {
      index, kind: "discard", verdict: "fine", hand, yourCode: mine.code, coachCode: decision.option.code, yourShape,
      yours, coach: `Kong of ${tileName(decision.option.code)}`,
      why: "The coach would have declared a kong first and drawn a replacement. Not a mistake, but a free tile.",
    };
  }
  const theirs = p.hand.find((t) => t.id === decision.tileId)!;
  if (theirs.code === mine.code) {
    return {
      index, kind: "discard", verdict: "match", hand, yourCode: mine.code, coachCode: theirs.code, yourShape,
      coachShape: yourShape, yours, coach: "The same", why: "The same tile the coach would throw.",
    };
  }
  const coachShape = shapeAfter(before, seat, without(p.hand, theirs.id), p.melds);
  const verdict = compareShapes(yourShape, coachShape, before.config.minFaan);
  const min = before.config.minFaan;
  const why =
    verdict === "cheaper"
      ? `After your discard no route reaches the ${min}-faan minimum. The coach's keeps ${routeLabel(coachShape.plan.route).toLowerCase()} open, worth about ${coachShape.plan.faan}.`
      : verdict === "slower"
        ? `Your discard left the hand ${stepsText(yourShape.shanten)}; the coach's would have left it ${stepsText(coachShape.shanten)}.`
        : verdict === "narrower"
          ? `Just as close to ready, but ${coachShape.improving - yourShape.improving} fewer tiles would help.`
          : "About as good either way.";
  return {
    index, kind: "discard", verdict, hand, yourCode: mine.code, coachCode: theirs.code, yourShape, coachShape,
    yours, coach: `Throw the ${tileName(theirs.code)}`, why,
  };
}

function optionName(o: ClaimOption | null): string {
  if (!o) return "Pass";
  return o.type === "win" ? "Win 食糊" : o.type[0]!.toUpperCase() + o.type.slice(1);
}

export function reviewClaim(before: GameState, seat: Seat, optionId: string | null, index = 0): Review {
  const options = claimTurn(before)?.options ?? [];
  const mine = options.find((o) => o.id === optionId) ?? null;
  const coach = greedyAi.chooseClaim(before, seat, options, createRng(before.logSeq + 11));
  const hand = sortedHand(before, seat);
  const tile = before.lastDiscard?.tile.code ?? null;
  const base = { index, kind: "claim" as const, hand, yourCode: tile, coachCode: tile, yours: optionName(mine), coach: optionName(coach) };

  if ((mine?.type ?? null) === (coach?.type ?? null)) {
    return { ...base, verdict: "match", why: "The same call the coach would make." };
  }
  if (coach?.type === "win") {
    return { ...base, verdict: "missedWin", why: `The ${tile ? tileName(tile) : "tile"} completed your hand, worth ${coach.score?.faan ?? 0} faan. Always check for Win first.` };
  }
  const p = before.players[seat]!;
  const now = bestPlan(routes(countsFromCodes(hand), p.melds, seatingOf(before, seat)), before.config.minFaan);
  const nowText = `${routeLabel(now.route).toLowerCase()}, ${stepsText(now.shanten)}, about ${now.faan} faan`;
  return {
    ...base,
    verdict: "claim",
    why: mine
      ? `The coach would pass. Without the claim you were playing for ${nowText}; the coach judged the ${mine.type} not worth opening your hand for.`
      : `The coach would ${coach!.type}. You were playing for ${nowText}, and the claim gets a hand worth declaring there sooner.`,
  };
}

export function reviewDecisions(decisions: Decision[], seat: Seat): Review[] {
  return decisions.map((d, i) =>
    d.kind === "discard" ? reviewDiscard(d.before, seat, d.tileId, i) : reviewClaim(d.before, seat, d.optionId, i),
  );
}
