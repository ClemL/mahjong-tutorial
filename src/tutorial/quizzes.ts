/**
 * The positions behind every exercise in the lessons. Answers that the rules
 * decide — which tiles a hand waits on, what a discard can be claimed for,
 * which discard keeps a hand quickest — are worked out by the engine, never
 * typed in, and the tests check the written explanations against them.
 */
import { claimOptionsFor, type ClaimOption } from "@/game/engine";
import { acceptance, handShanten } from "@/game/shanten";
import { type Seat, type TileCode, isSuited, rankOf, suitOf } from "@/game/tiles";
import { countsFromCodes, waitingTiles } from "@/game/winning";
import { buildTable } from "./table";

// ---------------------------------------------------------------- sets

export type SetKind = "chow" | "pung" | "kong" | "pair" | "none";

export const SET_KINDS: { value: SetKind; label: string }[] = [
  { value: "chow", label: "Chow 上" },
  { value: "pung", label: "Pung 碰" },
  { value: "kong", label: "Kong 槓" },
  { value: "pair", label: "Pair 眼" },
  { value: "none", label: "Not a set" },
];

/** What a group of tiles makes, by the rules. */
export function classifySet(codes: TileCode[]): SetKind {
  const same = codes.every((c) => c === codes[0]);
  if (same && codes.length === 2) return "pair";
  if (same && codes.length === 3) return "pung";
  if (same && codes.length === 4) return "kong";
  if (codes.length !== 3 || !codes.every(isSuited)) return "none";
  if (!codes.every((c) => suitOf(c) === suitOf(codes[0]!))) return "none";
  const ranks = codes.map(rankOf).sort((a, b) => a - b);
  return ranks[1] === ranks[0]! + 1 && ranks[2] === ranks[1]! + 1 ? "chow" : "none";
}

export interface SetItem {
  codes: TileCode[];
  explain: string;
}

export const SET_QUIZ: SetItem[] = [
  { codes: ["m3", "m4", "m5"], explain: "Three in a row in one suit: a chow (a run)." },
  { codes: ["dr", "dr", "dr"], explain: "Three of the same tile: a pung (a triplet). Dragons can only make pungs." },
  { codes: ["s2", "s3", "s5"], explain: "Not a run: the 4 is missing. Runs have no gaps." },
  { codes: ["we", "we"], explain: "Two of the same tile: a pair. Every winning hand needs exactly one." },
  { codes: ["m8", "m9", "m1"], explain: "Not a run. Numbers do not wrap around: 8-9-1 is not a sequence." },
  { codes: ["p6", "p6", "p6", "p6"], explain: "All four copies of one tile: a kong. It counts as one set, and you draw a replacement tile." },
  { codes: ["we", "ws", "ww"], explain: "Not a set. Winds and dragons never make runs, only pungs, kongs and pairs." },
  { codes: ["m4", "p5", "s6"], explain: "Not a run. All three tiles of a run must be the same suit." },
  { codes: ["p7", "p8", "p9"], explain: "A chow. A run can start or end on a 1 or a 9, as long as it stays inside 1 to 9." },
  { codes: ["s1", "s1", "s1"], explain: "A pung of 1 Bamboo. The bird is the 1 Bamboo on a Hong Kong set." },
];

// ------------------------------------------------------- arranging a hand

export interface SortPuzzle {
  title: string;
  codes: TileCode[];
  tip: string;
}

export const SORT_PUZZLES: SortPuzzle[] = [
  {
    title: "Warm-up",
    codes: ["m1", "m2", "m3", "p4", "p5", "p6", "s7", "s8", "s9", "dr", "dr", "dr", "we", "we"],
    tip: "One run in each suit, a pung of dragons and a pair of winds.",
  },
  {
    title: "Shared tiles",
    codes: ["m2", "m3", "m4", "m4", "m5", "m6", "p3", "p3", "p3", "s6", "s7", "s8", "dg", "dg"],
    tip: "There are two 4 Characters. Each one belongs to a different run.",
  },
  {
    title: "The obvious split is wrong",
    codes: ["p1", "p1", "p1", "p2", "p3", "p4", "p5", "p6", "p7", "m5", "m5", "ws", "ws", "ws"],
    tip: "Try 1-2-3 Dots first and you are stuck. Start with the three 1s instead.",
  },
];

// ---------------------------------------------------------------- waits

export interface WaitPuzzle {
  name: string;
  codes: TileCode[];
  /** What the engine says this hand wins on. */
  waits: TileCode[];
  explain: string;
}

export const WAIT_PUZZLES: WaitPuzzle[] = [
  {
    name: "Two-sided wait",
    codes: ["m2", "m3", "m4", "p5", "p6", "p7", "s2", "s2", "s2", "dr", "dr", "s4", "s5"],
    waits: ["s3", "s6"],
    explain: "4-5 Bamboo is finished by a 3 or a 6: two tiles, up to eight copies. The best wait to have.",
  },
  {
    name: "Edge wait",
    codes: ["p1", "p2", "m4", "m5", "m6", "s7", "s8", "s9", "we", "we", "we", "dg", "dg"],
    waits: ["p3"],
    explain: "1-2 can only become 1-2-3, because there is no 0. One tile, four copies at most.",
  },
  {
    name: "Closed wait",
    codes: ["s4", "s6", "m1", "m2", "m3", "p7", "p8", "p9", "dw", "dw", "dw", "ws", "ws"],
    waits: ["s5"],
    explain: "4 and 6 need the 5 in the middle. Like the edge wait, only one tile wins.",
  },
  {
    name: "Pair wait",
    codes: ["m1", "m2", "m3", "m4", "m5", "m6", "p2", "p3", "p4", "s7", "s8", "s9", "dr"],
    waits: ["dr"],
    explain: "Four sets are done; the lone Red Dragon needs its twin to make the pair.",
  },
  {
    name: "Two pairs",
    codes: ["m2", "m2", "p8", "p8", "m3", "m4", "m5", "s1", "s2", "s3", "we", "we", "we"],
    waits: ["m2", "p8"],
    explain: "Either pair can become a pung; the other is then your pair. Two tiles win.",
  },
  {
    name: "Three-sided wait",
    codes: ["m2", "m3", "m4", "m5", "m6", "p1", "p1", "p1", "s4", "s5", "s6", "dg", "dg"],
    waits: ["m1", "m4", "m7"],
    explain:
      "2-3-4-5-6 splits two ways: 1 makes 1-2-3 + 4-5-6, 4 makes 2-3-4 + 4-5-6, and 7 makes 2-3-4 + 5-6-7. " +
      "Long runs of one suit hide extra waits.",
  },
];

export function winsOn(codes: TileCode[]): TileCode[] {
  return waitingTiles(codes, []);
}

// ---------------------------------------------------------------- claims

/** Where the discarder sits, seen from you. */
export type Direction = "left" | "opposite" | "right";

export const DIRECTION_SEAT: Record<Direction, Seat> = { right: 1, opposite: 2, left: 3 };

export const DIRECTION_LABEL: Record<Direction, string> = {
  left: "on your left",
  opposite: "opposite you",
  right: "on your right",
};

export type ClaimAnswer = ClaimOption["type"] | "none";

export interface ClaimPuzzle {
  hand: TileCode[];
  tile: TileCode;
  from: Direction;
  explain: string;
}

export const CLAIM_PUZZLES: ClaimPuzzle[] = [
  {
    hand: ["p3", "p4", "p6", "p7", "m1", "m1", "m9", "s2", "s3", "s4", "we", "we", "dr"],
    tile: "p5",
    from: "left",
    explain: "The player on your left plays just before you, so you may chow their 5 Dots — three different ways.",
  },
  {
    hand: ["p3", "p4", "p6", "p7", "m1", "m1", "m9", "s2", "s3", "s4", "we", "we", "dr"],
    tile: "p5",
    from: "opposite",
    explain: "The same hand and the same tile, but thrown from across the table. A chow is only allowed from your left.",
  },
  {
    hand: ["dr", "dr", "m2", "m3", "m4", "p6", "p7", "s1", "s1", "s5", "s6", "s8", "wn"],
    tile: "dr",
    from: "right",
    explain: "A pung can be taken from anyone, wherever they sit. Play then carries on from you.",
  },
  {
    hand: ["s7", "s7", "s7", "m2", "m3", "m4", "p1", "p2", "p3", "dg", "m6", "m8", "ws"],
    tile: "s7",
    from: "opposite",
    explain: "With three in hand you choose: pung it, or kong it and draw a replacement tile from the back of the wall.",
  },
  {
    hand: ["m4", "m5", "dr", "dr", "dr", "p1", "p2", "p3", "s5", "s6", "s7", "we", "we"],
    tile: "m6",
    from: "left",
    explain:
      "Your hand is ready on 3 or 6 Characters, so you can win. From the left you could also chow it — but " +
      "why would you? A win beats every other claim.",
  },
  {
    hand: ["m4", "m5", "dr", "dr", "dr", "p1", "p2", "p3", "s5", "s6", "s7", "we", "we"],
    tile: "m3",
    from: "opposite",
    explain: "A winning tile can be claimed from anyone. Here the chow is off the table, but the win is not.",
  },
];

/** What you may claim, by the engine: the answer to a claim puzzle. */
export function claimsFor(puzzle: ClaimPuzzle): ClaimAnswer[] {
  const from = DIRECTION_SEAT[puzzle.from];
  const hands: [TileCode[], TileCode[], TileCode[], TileCode[]] = [puzzle.hand, [], [], []];
  hands[from] = [puzzle.tile];
  const state = buildTable({ hands, turn: from });
  const tile = state.players[from]!.hand[0]!;
  const types = claimOptionsFor(state, 0, tile, from, from === 3).map((o) => o.type);
  const unique = [...new Set(types)];
  return unique.length > 0 ? unique : ["none"];
}

// -------------------------------------------------------------- discards

export interface DiscardPuzzle {
  hand: TileCode[];
  /** Every discard that leaves the hand quickest, by the engine's count. */
  best: TileCode[];
  explain: string;
}

export const DISCARD_PUZZLES: DiscardPuzzle[] = [
  {
    hand: ["m2", "m3", "m4", "m5", "m6", "m7", "p5", "p6", "p7", "s3", "s4", "dr", "dr", "wn"],
    best: ["wn"],
    explain:
      "Everything but the North wind already belongs somewhere: three runs, 3-4 Bamboo and a pair of dragons. " +
      "Throw the North wind and you are ready, waiting on 2 or 5 Bamboo.",
  },
  {
    hand: ["m2", "m3", "m4", "s4", "s5", "s6", "p3", "p5", "p6", "p7", "dr", "dr", "we", "s9"],
    best: ["we"],
    explain:
      "The East wind and the 9 Bamboo are both alone. A wind can only grow by pairing up, while a 9 can also " +
      "join a 7 and 8. The wind is the weaker tile.",
  },
  {
    hand: ["m2", "m3", "m4", "s6", "s7", "s8", "p4", "p6", "s3", "s4", "dr", "dr", "m9", "m9"],
    best: ["p4", "p6", "dr", "m9"],
    explain:
      "One block too many. 4-6 Dots waits only on the 5, while 3-4 Bamboo waits on 2 or 5, so the closed wait " +
      "is the usual one to break. Splitting a pair is just as quick: one pair stays as your eyes.",
  },
];

/** The discards that leave a 14-tile hand the fewest steps from ready, with the most tiles to improve it. */
export function bestDiscards(hand: TileCode[]): TileCode[] {
  const seen = countsFromCodes(hand);
  let bestKey: [number, number] = [99, -1];
  let best: TileCode[] = [];
  for (const code of [...new Set(hand)]) {
    const rest = [...hand];
    rest.splice(rest.indexOf(code), 1);
    const counts = countsFromCodes(rest);
    const key: [number, number] = [handShanten(counts, []), acceptance(counts, [], seen).count];
    const order = key[0] - bestKey[0] || bestKey[1] - key[1];
    if (order < 0) {
      bestKey = key;
      best = [code];
    } else if (order === 0) {
      best.push(code);
    }
  }
  return best;
}

/** How many tile changes a hand is from ready: 0 is ready, -1 is complete. */
export function stepsFromReady(hand: TileCode[]): number {
  return handShanten(countsFromCodes(hand), []);
}
