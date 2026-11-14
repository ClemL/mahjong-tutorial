/**
 * The guided example hand: one deal, played on the real engine, with the
 * three other seats following a script so the hand teaches the same things
 * every time — a discard, a chow, a pung, a claim to turn down, and a
 * self-drawn win.
 *
 * Only the other seats are scripted. Your moves go through the engine like any
 * game's, which is why the test can play the script end to end and check that
 * every claim the coach asks for is really offered.
 */
import {
  type ClaimOption,
  type GameState,
  advanceTurn,
  answerClaim,
  claimTurn,
  declareSelfDraw,
  discard,
  turnActions,
} from "@/game/engine";
import { needsTurnAdvance } from "@/game/controller";
import { type Seat, type TileCode, nextSeat } from "@/game/tiles";
import { type TableSpec, buildTable } from "./table";

export const YOU: Seat = 0;

export type HumanMove =
  | { kind: "discard"; code: TileCode }
  | { kind: "claim"; type: ClaimOption["type"] }
  | { kind: "pass" }
  | { kind: "draw" }
  | { kind: "selfDraw" };

export interface GuidedStep {
  expect: HumanMove;
  /** What the coach asks for. */
  coach: string;
  /** Said once it is done: why it was the right call. */
  why: string;
}

export interface Scenario {
  intro: string;
  table: TableSpec;
  /** Each other seat's discards, in the order it throws them. */
  scripted: Partial<Record<Seat, TileCode[]>>;
  steps: GuidedStep[];
  outro: string;
}

/** What the table is waiting on you for, or null while the other seats play. */
export type Awaiting = "turn" | "claim" | "draw" | "done" | null;

export const EXAMPLE_HAND: Scenario = {
  intro:
    "You sit East, so you are the dealer and start with 14 tiles. Plum 梅 — flower number 1 — was " +
    "set aside as it was dealt and replaced from the wall. Flower 1 belongs to East, so it will be " +
    "worth a faan if you win.",
  table: {
    hands: [
      ["p2", "p3", "m6", "m7", "s3", "s4", "s5", "dr", "dr", "s9", "s9", "wn", "m1", "p7"],
      ["ww", "dr", "s9", "m2", "m4", "m9", "p5", "p9", "s6", "s7", "ws", "ws", "dg"],
      ["s1", "we", "m3", "m5", "m5", "p6", "p8", "s2", "s8", "s8", "dw", "dw", "ww"],
      ["m8", "dw", "s6", "m4", "m9", "p3", "p5", "s2", "s7", "we", "wn", "ws", "dg"],
    ],
    flowers: [["f1"], [], [], []],
    // South, West, North, South, South, West, North — then your own draw.
    draws: ["s6", "m6", "s4", "m7", "we", "p2", "dg", "p4"],
    dealer: 0,
    turn: 0,
    drawn: "p7",
  },
  scripted: {
    1: ["ww", "dr", "s9"],
    2: ["s1", "we"],
    3: ["m8", "wn"],
  },
  steps: [
    {
      expect: { kind: "discard", code: "wn" },
      coach:
        "Throw one tile away to start. Look for a tile that cannot join anything. The North wind is " +
        "alone, honors never make runs, and North is neither your seat wind nor the round wind, so even " +
        "three of them would score nothing for you. Tap it, then tap it again to discard.",
      why: "A lone honor that scores nothing for you is the safest first discard.",
    },
    {
      expect: { kind: "claim", type: "chow" },
      coach:
        "North, the player on your left, just threw the 8 Characters. You hold the 6 and 7, so you can " +
        "chow: take the tile and lay down the run 6-7-8. Tap Chow.",
      why:
        "A chow can only be taken from the player on your left, because you play next. The run goes " +
        "down face up, so the table can see it.",
    },
    {
      expect: { kind: "discard", code: "m1" },
      coach:
        "You took a tile instead of drawing one, so now you discard. Two tiles stand alone: the 1 " +
        "Character and the 7 Dots. A 1 can only grow one way (2-3), while a 7 can grow into 5-6-7, " +
        "6-7-8 or 7-8-9. Let the 1 Character go.",
      why: "Terminals (1s and 9s) connect in fewer ways than middle tiles, so they go first.",
    },
    {
      expect: { kind: "claim", type: "pung" },
      coach:
        "South threw a Red Dragon, and you hold a pair of them. Anyone's discard can be punged, wherever " +
        "they sit. Tap Pung.",
      why:
        "A triplet of dragons is worth 1 faan on its own. The turn jumped to you, skipping West and " +
        "North.",
    },
    {
      expect: { kind: "discard", code: "p7" },
      coach:
        "Now discard the 7 Dots. Look at what is left: 2-3 Dots, 3-4-5 Bamboo and a pair of 9 Bamboo, " +
        "beside your two sets on the table.",
      why:
        "Your hand is now ready (聽牌, ting): one tile from finished. A 1 or a 4 of Dots completes 2-3, " +
        "so you have two different tiles to win on. That is a two-sided wait, the best kind.",
    },
    {
      expect: { kind: "pass" },
      coach:
        "South threw a 9 Bamboo, and the game offers you a pung. Do not take it. Those two 9s are your " +
        "pair, the eyes every winning hand needs. Punging them would break a ready hand. Tap Pass.",
      why: "Not every claim helps. Turning one down is often the stronger play.",
    },
    {
      expect: { kind: "draw" },
      coach: "West and North have played. It is your turn again: draw a tile from the wall.",
      why: "Every ordinary turn starts with a draw.",
    },
    {
      expect: { kind: "selfDraw" },
      coach:
        "The 4 Dots! It completes 2-3-4, and your hand is four sets and a pair. Declare the win. Tap " +
        "Win.",
      why: "A win on a tile you drew yourself is 自摸 (self-draw), and all three opponents pay.",
    },
  ],
  outro:
    "Dragon triplet, self-draw and your own flower: 3 faan. That meets the 3-faan minimum many Hong " +
    "Kong tables play to. At 3 faan each opponent pays 8 points, so you collect 24.",
};

export function startScenario(scenario: Scenario = EXAMPLE_HAND): GameState {
  return buildTable(scenario.table);
}

/** How many tiles a seat has thrown, the ones claimed from its pond included. */
function thrownBy(state: GameState, seat: Seat): number {
  const p = state.players[seat]!;
  return p.discards.length + (p.taken?.length ?? 0);
}

export function awaiting(state: GameState, you: Seat = YOU): Awaiting {
  if (state.phase === "handOver" || state.phase === "gameOver") return "done";
  if (state.phase === "claiming") return claimTurn(state)?.seat === you ? "claim" : null;
  if (needsTurnAdvance(state)) return nextSeat(state.turn, 1) === you ? "draw" : null;
  if (state.turn === you && state.lastDiscard === null) return "turn";
  return null;
}

/**
 * One beat of the other seats: a pass on a claim, a draw, or the next
 * scripted discard. Null when the table is waiting on you.
 */
export function opponentBeat(state: GameState, scenario: Scenario = EXAMPLE_HAND): GameState | null {
  if (awaiting(state) !== null) return null;
  if (state.phase === "claiming") {
    const turn = claimTurn(state);
    return turn ? answerClaim(state, turn.seat, null) : null;
  }
  if (needsTurnAdvance(state)) return advanceTurn(state);
  const seat = state.turn;
  const script = scenario.scripted[seat] ?? [];
  const code = script[thrownBy(state, seat)];
  const tile = code ? state.players[seat]!.hand.find((t) => t.code === code) : undefined;
  if (!tile) throw new Error(`Seat ${seat} has no scripted discard to make`);
  return discard(state, seat, tile.id);
}

/** The move as the engine would make it, or null when it is not open to you now. */
export function applyMove(state: GameState, move: HumanMove, you: Seat = YOU): GameState | null {
  const waitingFor = awaiting(state, you);
  switch (move.kind) {
    case "discard": {
      if (waitingFor !== "turn") return null;
      const tile = state.players[you]!.hand.find((t) => t.code === move.code);
      return tile ? discard(state, you, tile.id) : null;
    }
    case "claim": {
      if (waitingFor !== "claim") return null;
      const option = claimTurn(state)?.options.find((o) => o.type === move.type);
      return option ? answerClaim(state, you, option.id) : null;
    }
    case "pass":
      return waitingFor === "claim" ? answerClaim(state, you, null) : null;
    case "draw":
      return waitingFor === "draw" ? advanceTurn(state) : null;
    case "selfDraw":
      return waitingFor === "turn" && turnActions(state, you).canWin ? declareSelfDraw(state, you) : null;
  }
}

export function sameMove(a: HumanMove, b: HumanMove): boolean {
  if (a.kind !== b.kind) return false;
  if (a.kind === "discard" && b.kind === "discard") return a.code === b.code;
  if (a.kind === "claim" && b.kind === "claim") return a.type === b.type;
  return true;
}
