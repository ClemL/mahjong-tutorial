/**
 * Reading the table: counting what is left, guessing what an opponent is
 * building, and choosing a discard that will not feed them. Every answer is
 * worked out from the hidden tiles by the engine — the player only gets to
 * see what a player at the table could see.
 */
import { greedyAi } from "@/game/ai";
import { stepTable } from "@/game/controller";
import { type GameState, claimOptionsFor, createGame, liableSeat } from "@/game/engine";
import type { Meld } from "@/game/melds";
import { bestPlan, routes } from "@/game/plan";
import { createRng } from "@/game/rng";
import { DEFAULT_RULES, type RuleConfig } from "@/game/rules";
import { PLAYABLE_CODES, type Seat, type TileCode, isFlower } from "@/game/tiles";
import { seenCounts } from "@/game/waits";
import { countsFromCodes } from "@/game/winning";
import { routeKey, seatingFor } from "./routes";
import { type MeldSpec, TilePool, type TableSpec, buildTable } from "./table";

// ------------------------------------------------------------- counting

export interface CountingQuestion {
  state: GameState;
  code: TileCode;
  /** Copies you cannot see: in the wall or in someone else's hand. */
  unseen: number;
}

/** What seat 0 can see of each tile: its own hand, every pond, every laid-down set. */
export function visibleCount(state: GameState, code: TileCode): number {
  const me = state.players[0]!;
  return seenCounts(me.hand, state.players).get(code) ?? 0;
}

/**
 * A position from a real hand played part-way by the computer, and a tile to
 * count. Null when the hand ended before it got far enough; try another seed.
 */
export function countingQuestion(seed: number): CountingQuestion | null {
  const rng = createRng(seed);
  let state = createGame({ seed, config: DEFAULT_RULES });
  // Every seat is the computer's while the position is played out.
  state = { ...state, players: state.players.map((p) => ({ ...p, isHuman: false })) };
  const target = 14 + rng.int(18);
  let steps = 0;
  while (state.players.reduce((n, p) => n + p.discards.length, 0) < target && steps < 600) {
    if (state.phase === "handOver" || state.phase === "gameOver") return null;
    state = stepTable(state, rng, greedyAi);
    steps += 1;
  }
  if (state.phase !== "action" && state.phase !== "claiming") return null;
  state = { ...state, players: state.players.map((p) => ({ ...p, isHuman: p.seat === 0 })) };

  // A tile worth counting is one you can see some of but not all.
  const candidates = PLAYABLE_CODES.filter((code) => {
    const seen = visibleCount(state, code);
    return seen >= 1 && seen <= 3;
  });
  if (candidates.length === 0) return null;
  const code = rng.pick(candidates);
  return { state, code, unseen: 4 - visibleCount(state, code) };
}

// ------------------------------------------------- what are they collecting

export interface CollectPuzzle {
  seat: Seat;
  melds: MeldSpec[];
  /** Their hidden tiles — revealed once you have answered. */
  hidden: TileCode[];
  /** Their discards, oldest first. */
  pond: TileCode[];
  explain: string;
}

export const COLLECT_OPTIONS = [
  { value: "flush-m", label: "A Characters flush" },
  { value: "flush-p", label: "A Dots flush" },
  { value: "flush-s", label: "A Bamboo flush" },
  { value: "pungs", label: "All triplets" },
  { value: "chows", label: "Quick runs" },
] as const;

export const COLLECT_PUZZLES: CollectPuzzle[] = [
  {
    seat: 3,
    melds: [
      { type: "pung", codes: ["s5", "s5", "s5"] },
      { type: "chow", codes: ["s1", "s2", "s3"] },
    ],
    hidden: ["s6", "s7", "s8", "s9", "s9", "wn", "wn"],
    pond: ["m2", "p7", "m8", "p1", "m5", "p4", "dg"],
    explain:
      "Both of North's sets are Bamboo, and seven discards have not included a single Bamboo tile while Characters " +
      "and Dots go out in the middle of their runs. That is a Bamboo flush — keep your Bamboo to yourself.",
  },
  {
    seat: 2,
    melds: [
      { type: "pung", codes: ["p2", "p2", "p2"] },
      { type: "pung", codes: ["m8", "m8", "m8"] },
    ],
    hidden: ["s5", "s5", "dg", "dg", "we", "we", "wn"],
    pond: ["p4", "m6", "s3", "s7", "p5", "m4"],
    explain:
      "Two triplets claimed in two different suits, so no flush. West is throwing middle tiles — the ones runs are " +
      "made of — and keeping pairs. All triplets: any pair you throw them may be the one they pung.",
  },
  {
    seat: 1,
    melds: [{ type: "chow", codes: ["m3", "m4", "m5"] }],
    hidden: ["p2", "p3", "p4", "s6", "s7", "s8", "m7", "m8", "p9", "p9"],
    pond: ["we", "dr", "wn", "s1", "dw", "m9", "p1"],
    explain:
      "Honors and terminals went first, a chow was claimed, and every suit is still in play. South is building " +
      "plain runs as fast as possible. Cheap, but likely to finish soon.",
  },
  {
    seat: 2,
    melds: [
      { type: "pung", codes: ["dr", "dr", "dr"] },
      { type: "chow", codes: ["m6", "m7", "m8"] },
    ],
    hidden: ["m1", "m2", "m3", "m9", "m9", "wn", "wn"],
    pond: ["s4", "p8", "s2", "p3", "s6", "p1", "s9", "p5"],
    explain:
      "A Characters chow beside a dragon triplet, and eight discards of nothing but Dots and Bamboo. A Characters " +
      "half flush — at least 5 faan with the dragons. A Characters tile is the dangerous one.",
  },
];

function meldsOf(specs: MeldSpec[], pool: TilePool): Meld[] {
  return specs.map((m) => ({ type: m.type, tiles: pool.takeAll(m.codes), concealed: m.concealed ?? false }));
}

/** The route the engine's planner would play this hand for — the answer. */
export function collectAnswer(p: CollectPuzzle, config: RuleConfig = DEFAULT_RULES): string {
  const pool = new TilePool(true);
  const melds = meldsOf(p.melds, pool);
  const plan = bestPlan(
    routes(countsFromCodes(p.hidden), melds, seatingFor(p.seat, "we", [], config)),
    config.minFaan,
  );
  return routeKey(plan.route);
}

// ------------------------------------------------------------- defense

export type DangerKind = "safe" | "win" | "liability";

export interface DefensePuzzle {
  title: string;
  /** "safe": pick the one safe tile; "danger": pick the one you must not throw. */
  ask: "safe" | "danger";
  question: string;
  /** The opponent the puzzle is about. */
  watch: Seat;
  table: TableSpec;
  candidates: TileCode[];
  explain: string;
}

const FILL_SOUTH = ["m1", "m4", "p7", "s2", "s4", "we", "wn", "dg", "p1", "m9", "s9", "p9", "ww"];
const FILL_WEST = ["m1", "m7", "p1", "p8", "s1", "s3", "ws", "dg", "m9", "s9", "p9", "dr", "ww"];

export const DEFENSE_PUZZLES: DefensePuzzle[] = [
  {
    title: "The flush on the table",
    ask: "danger",
    question: "North has three Bamboo sets down. Which of these would you hold on to?",
    watch: 3,
    table: {
      hands: [
        ["m2", "m3", "m4", "p4", "p5", "p6", "s6", "m8", "wn", "p5", "m6", "m7", "dw", "dw"],
        FILL_SOUTH,
        FILL_WEST,
        ["s4", "s4", "s6", "s6"],
      ],
      melds: [
        [],
        [],
        [],
        [
          { type: "chow", codes: ["s1", "s2", "s3"] },
          { type: "pung", codes: ["s5", "s5", "s5"], from: 1 },
          { type: "chow", codes: ["s7", "s8", "s9"] },
        ],
      ],
      discards: [["ws", "s1"], ["p2", "m5"], ["p3", "m5"], ["m1", "p9", "we", "m9", "p2", "dr"]],
      turn: 0,
      drawn: "dw",
    },
    candidates: ["s6", "p5", "m8", "wn"],
    explain:
      "North has nine Bamboo tiles face up and has thrown nothing but other suits: a Bamboo flush, with four tiles " +
      "left in hand. They are waiting on 4 or 6 Bamboo — a 7-faan full flush. Every other tile here is safe.",
  },
  {
    title: "Thrown before is not safe",
    ask: "danger",
    question: "West is ready. Which of these does West win on?",
    watch: 2,
    table: {
      hands: [
        ["m5", "m6", "m7", "p3", "p7", "p8", "s2", "s3", "s4", "m9", "s1", "wn", "dr", "dr"],
        FILL_SOUTH,
        ["p4", "p5", "m2", "m3", "m4", "s6", "s7", "s8", "dg", "dg", "dg", "we", "we"],
        ["m1", "m2", "p1", "p2", "s5", "s5", "s8", "s9", "ws", "ws", "dw", "dw", "m8"],
      ],
      discards: [["ww"], ["p6", "s7"], ["p3", "s1", "wn", "m9"], ["p9", "s3"]],
      turn: 0,
      drawn: "wn",
    },
    candidates: ["p3", "m9", "s1", "wn"],
    explain:
      "West threw a 3 Dots early on, so it looks safe — but West has since changed the hand and now waits on 3 or " +
      "6 Dots. Hong Kong rules have no furiten: a player may win on a tile they threw before. Only the tiles West " +
      "threw since becoming ready (here the 9 Characters) say anything about the wait.",
  },
  {
    title: "Paying for someone else's win",
    ask: "danger",
    question: "South has two dragon triplets down. Which of these would you hold on to?",
    watch: 1,
    table: {
      hands: [
        ["m2", "m3", "m4", "p5", "p6", "p7", "s3", "s4", "dw", "m5", "p9", "s9", "we", "we"],
        ["dw", "dw", "m1", "m4", "p7", "s2", "wn"],
        FILL_WEST,
        ["m1", "m2", "p1", "p2", "s5", "s5", "s8", "ws", "ws", "s1", "m8", "m7", "p3"],
      ],
      melds: [
        [],
        [
          { type: "pung", codes: ["dr", "dr", "dr"], from: 3 },
          { type: "pung", codes: ["dg", "dg", "dg"], from: 2 },
        ],
        [],
        [],
      ],
      discards: [["wn"], ["s6", "p6"], ["m6", "s7"], ["p4", "m9"]],
      turn: 0,
      drawn: "we",
    },
    candidates: ["dw", "m5", "p9", "s9"],
    explain:
      "South holds a pair of White Dragons. Throw one and South pungs it: three dragon triplets, Big Three Dragons, " +
      "8 faan. Under liability (包) you fed the third dragon set, so if South then wins by self-draw you pay the " +
      "whole hand alone — all three shares.",
  },
  {
    title: "Counting makes it safe",
    ask: "safe",
    question: "North is ready and has thrown only Dots and Bamboo. Which of these is safe?",
    watch: 3,
    table: {
      hands: [
        ["m4", "m7", "ws", "p2", "p3", "p4", "s6", "s7", "s8", "dg", "dg", "m2", "m2", "p9"],
        ["m3", "m1", "p7", "s2", "s4", "we", "wn", "p1", "m9", "s9", "p9", "ww", "dr"],
        ["m1", "m7", "p1", "p8", "s1", "s3", "wn", "dg", "m9", "s9", "p9", "dr", "ww"],
        ["m5", "m6", "m1", "m2", "m3", "m7", "m8", "m9", "s5", "s5", "s5", "we", "we"],
      ],
      discards: [["ws"], ["ws", "s1"], ["p6", "s7"], ["p4", "s3", "p8", "s1", "p5"]],
      turn: 0,
      drawn: "p9",
    },
    candidates: ["m4", "m7", "ws"],
    explain:
      "North's discards are all Dots and Bamboo: the danger is in Characters, and North is waiting on 4 or 7 " +
      "Characters. The South wind is safe: you hold one and two more are in the ponds, so only one copy is unseen. " +
      "Nobody can pung it, and only a hand waiting on that very tile for its pair could win on it.",
  },
];

export function defenseTable(p: DefensePuzzle): GameState {
  return buildTable({ ...p.table, humanSeat: 0 });
}

/** What happens if you throw `code` here: nothing, someone wins on it, or you feed a liable set. */
export function dangerOf(state: GameState, code: TileCode): { kind: DangerKind; seat: Seat | null } {
  const tile = state.players[0]!.hand.find((t) => t.code === code);
  if (!tile) throw new Error(`You do not hold ${code}`);
  for (const seat of [1, 2, 3] as Seat[]) {
    const options = claimOptionsFor(state, seat, tile, 0, seat === 1);
    if (options.some((o) => o.type === "win")) return { kind: "win", seat };
  }
  for (const seat of [1, 2, 3] as Seat[]) {
    const options = claimOptionsFor(state, seat, tile, 0, seat === 1);
    for (const o of options) {
      if (o.type !== "pung" && o.type !== "kong") continue;
      const melds: Meld[] = [
        ...state.players[seat]!.melds,
        { type: o.type, tiles: [tile, tile, tile], concealed: false, claimedFrom: 0 },
      ];
      if (liableSeat(melds) === 0) return { kind: "liability", seat };
    }
  }
  return { kind: "safe", seat: null };
}

/** The candidates that answer the puzzle's question. */
export function defenseAnswer(p: DefensePuzzle): TileCode[] {
  const state = defenseTable(p);
  return p.candidates.filter((code) => {
    const danger = dangerOf(state, code).kind;
    return p.ask === "safe" ? danger === "safe" : danger !== "safe";
  });
}

/** Flowers in a hand would be dealt as bonus tiles; puzzles never hold one. */
export function holdsNoFlowers(p: DefensePuzzle): boolean {
  return p.table.hands.every((h) => h.every((c) => !isFlower(c)));
}
