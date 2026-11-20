/**
 * Speed against value: the routes a hand can still take to a win, from the
 * game's own planner (`plan.ts`) — the one its computer players choose their
 * discards with. A route is a way of getting the faan: any finished hand, a
 * flush, all triplets, all runs. Each comes with how far the hand is from
 * ready along it and the faan it should be worth.
 */
import type { GameState } from "@/game/engine";
import type { Meld } from "@/game/melds";
import { type Route, type RoutePlan, type Seating, bestPlan, comparePlans, routes } from "@/game/plan";
import type { RuleConfig } from "@/game/rules";
import { type Seat, type TileCode, isFlower } from "@/game/tiles";
import { countsFromCodes } from "@/game/winning";

const SUIT_NAME = { m: "Characters", p: "Dots", s: "Bamboo" } as const;

export function routeLabel(route: Route): string {
  switch (route.kind) {
    case "any":
      return "Any finished hand";
    case "flush":
      return `Flush in ${SUIT_NAME[route.suit]}`;
    case "pungs":
      return "All triplets";
    case "chows":
      return "All runs";
  }
}

export function routeKey(route: Route): string {
  return route.kind === "flush" ? `flush-${route.suit}` : route.kind;
}

export interface RouteRow {
  key: string;
  label: string;
  /** Tiles from ready: 0 is ready, -1 is a finished hand. */
  shanten: number;
  faan: number;
  declarable: boolean;
  /** The route the computer would play for. */
  best: boolean;
}

/** Every open route for a hand, the one to play for first, then the rest from quickest to slowest. */
export function routeRows(codes: TileCode[], melds: Meld[], seating: Seating): RouteRow[] {
  const plans = routes(countsFromCodes(codes.filter((c) => !isFlower(c))), melds, seating);
  const minFaan = seating.config.minFaan;
  const top = bestPlan(plans, minFaan);
  return [...plans]
    .sort((a, b) => comparePlans(a, b, minFaan))
    .map((plan) => ({
      key: routeKey(plan.route),
      label: routeLabel(plan.route),
      shanten: plan.shanten,
      faan: plan.faan,
      declarable: plan.faan >= minFaan,
      best: plan === top,
    }));
}

export function seatingOf(state: GameState, seat: Seat): Seating {
  return {
    seat,
    roundWind: state.roundWind,
    flowers: state.players[seat]!.flowers.map((t) => t.code),
    config: state.config,
  };
}

/** A seat's routes as its hand stands, or as it would stand after throwing one tile. */
export function routesFor(state: GameState, seat: Seat, withoutTileId?: string | null): RouteRow[] {
  const p = state.players[seat]!;
  const codes = p.hand.filter((t) => t.id !== withoutTileId).map((t) => t.code);
  return routeRows(codes, p.melds, seatingOf(state, seat));
}

/** The plan a hand would play for after throwing `code`. */
export function planAfterDiscard(codes: TileCode[], code: TileCode, melds: Meld[], seating: Seating): RoutePlan {
  const rest = [...codes];
  rest.splice(rest.indexOf(code), 1);
  return bestPlan(routes(countsFromCodes(rest.filter((c) => !isFlower(c))), melds, seating), seating.config.minFaan);
}

/**
 * The discards that leave the best plan to play for at the table's minimum:
 * a route that reaches it, as quick as possible, as rich as possible.
 */
export function valueDiscards(codes: TileCode[], melds: Meld[], seating: Seating): TileCode[] {
  const minFaan = seating.config.minFaan;
  let best: RoutePlan | null = null;
  let found: TileCode[] = [];
  for (const code of [...new Set(codes.filter((c) => !isFlower(c)))]) {
    const plan = planAfterDiscard(codes, code, melds, seating);
    const order = best ? comparePlans(plan, best, minFaan) : -1;
    if (order < 0) {
      best = plan;
      found = [code];
    } else if (order === 0) {
      found.push(code);
    }
  }
  return found;
}

/** A seating for puzzles: who sits where, which flowers they hold, and the table's rules. */
export function seatingFor(seat: Seat, roundWind: TileCode, flowers: TileCode[], config: RuleConfig): Seating {
  return { seat, roundWind, flowers, config };
}
