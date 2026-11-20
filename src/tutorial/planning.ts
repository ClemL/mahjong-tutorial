/**
 * Puzzles for playing to the faan minimum: which discard keeps a hand worth
 * declaring, and which of a ready hand's winning tiles it may actually win on.
 * The answers are the engine's: the route planner and `scoreHand`.
 */
import { DEFAULT_RULES } from "@/game/rules";
import type { Meld } from "@/game/melds";
import { type Seat, type TileCode } from "@/game/tiles";
import { waitingTiles } from "@/game/winning";
import { type MeldSpec, TilePool } from "./table";
import { bestDiscards } from "./quizzes";
import { type RouteRow, routeRows, seatingFor, valueDiscards } from "./routes";
import { scoreExample } from "./scoring";

/** The table these puzzles are set at: the app's rules with the Hong Kong 3-faan minimum. */
export const THREE_FAAN = { ...DEFAULT_RULES, minFaan: 3 };

export interface SpeedPuzzle {
  hand: TileCode[];
  seat: Seat;
  roundWind: TileCode;
  flowers: TileCode[];
  explain: string;
}

export const SPEED_PUZZLES: SpeedPuzzle[] = [
  {
    hand: ["p1", "p2", "p3", "p5", "p6", "p7", "p8", "p9", "wn", "wn", "m4", "m5", "dw", "dw"],
    seat: 1,
    roundWind: "we",
    flowers: ["f1"],
    explain:
      "Breaking a pair is quickest, but every quick finish is worth 1 or 2 faan — not enough at this table. " +
      "Throw a Characters tile instead: the hand stays just as close to ready along a Dots half flush, worth 4.",
  },
  {
    hand: ["s2", "s3", "s4", "s6", "s7", "m5", "m6", "we", "we", "we", "p2", "p3", "s9", "dg"],
    seat: 0,
    roundWind: "we",
    flowers: [],
    explain:
      "Here speed and value agree. Sitting East in the East round, your East triplet already scores twice, and " +
      "with no flowers and a concealed hand you have 4 faan before you finish. Play fast: the lone 9 Bamboo or " +
      "Green Dragon goes.",
  },
];

export function speedSeating(p: SpeedPuzzle) {
  return seatingFor(p.seat, p.roundWind, p.flowers, THREE_FAAN);
}

/** The discards that keep the best route to the minimum: the answer. */
export function speedAnswer(p: SpeedPuzzle): TileCode[] {
  return valueDiscards(p.hand, [], speedSeating(p));
}

/** The discards that are quickest on tile count alone, ignoring faan: the trap, where it differs. */
export function speedOnly(p: SpeedPuzzle): TileCode[] {
  return bestDiscards(p.hand);
}

export function routesAfter(p: SpeedPuzzle, code: TileCode): RouteRow[] {
  const rest = [...p.hand];
  rest.splice(rest.indexOf(code), 1);
  return routeRows(rest, [], speedSeating(p));
}

// ------------------------------------------------- which winning tiles count

export interface DeclarePuzzle {
  /** Sets already claimed. */
  melds?: MeldSpec[];
  hand: TileCode[];
  seat: Seat;
  roundWind: TileCode;
  flowers: TileCode[];
  explain: string;
}

export const DECLARE_PUZZLES: DeclarePuzzle[] = [
  {
    hand: ["m2", "m3", "m4", "p6", "p7", "p8", "s5", "s6", "s7", "we", "we", "s9", "s9"],
    seat: 0,
    roundWind: "we",
    flowers: ["f2"],
    explain:
      "Two pairs, so either can become the triplet. The East wind makes a triplet of your seat and round wind — " +
      "2 faan, 3 with the concealed hand. The 9 Bamboo leaves only the concealed hand: 1 faan, so you would have " +
      "to let it go by.",
  },
  {
    melds: [{ type: "pung", codes: ["wn", "wn", "wn"] }],
    hand: ["dr", "dr", "dr", "s7", "s8", "s9", "p3", "p4", "m5", "m5"],
    seat: 3,
    roundWind: "we",
    flowers: ["f1"],
    explain:
      "Ready on 2 or 5 Dots, worth your North triplet and the Red Dragons either way: 2 faan, so you cannot " +
      "declare it off a discard. Draw the tile yourself and self-draw adds the third. A fully concealed hand would " +
      "not gain this way: in this app self-draw replaces the concealed-hand faan rather than adding to it.",
  },
  {
    hand: ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9", "dg", "dg", "s5", "s5"],
    seat: 1,
    roundWind: "we",
    flowers: ["f1"],
    explain:
      "A Bamboo half flush is 3 faan whichever tile completes it, plus 1 for a concealed hand. The Green Dragon " +
      "adds a dragon triplet on top. Both can be declared.",
  },
];

export interface WinningTile {
  code: TileCode;
  faan: number;
  selfDrawnFaan: number;
  declarable: boolean;
}

/** Every tile a puzzle's hand wins on, and what each is worth off a discard and drawn. */
function meldsOf(specs: MeldSpec[]): Meld[] {
  const pool = new TilePool(true);
  return specs.map((m) => ({ type: m.type, tiles: pool.takeAll(m.codes), concealed: m.concealed ?? false }));
}

export function winningTiles(p: DeclarePuzzle): WinningTile[] {
  return waitingTiles(p.hand, meldsOf(p.melds ?? [])).map((code) => {
    const base = {
      melds: p.melds ?? [],
      concealed: [...p.hand, code],
      winning: code,
      seat: p.seat,
      roundWind: p.roundWind,
      flowers: p.flowers,
    };
    const faan = scoreExample(base, THREE_FAAN).faan;
    return {
      code,
      faan,
      selfDrawnFaan: scoreExample({ ...base, selfDrawn: true }, THREE_FAAN).faan,
      declarable: faan >= THREE_FAAN.minFaan,
    };
  });
}

/** Measured by the game itself: Normal computer players at each minimum, 300 hands a row (game README, October 2026). */
export const MINIMUM_MEASURED = [
  { minFaan: 0, won: 100, washedOut: 0, avgFaan: 1.58 },
  { minFaan: 3, won: 82.7, washedOut: 17.3, avgFaan: 3.4 },
  { minFaan: 5, won: 22, washedOut: 78, avgFaan: 5.59 },
];
