/**
 * Random winning hands for the faan drill. A hand is assembled set by set
 * from a theme — plain runs, a flush, triplets, honors — so the drill meets
 * every common pattern, then scored by the engine. Seeded, so a round can be
 * replayed and the tests can check thousands of them.
 */
import { createRng, type Rng } from "@/game/rng";
import type { ScoreResult } from "@/game/scoring";
import { DRAGONS, type Seat, type Suit, SUITS, type TileCode, WINDS } from "@/game/tiles";
import type { MeldSpec } from "./table";
import { type ExampleHand, scoreExample } from "./scoring";

type Theme = "plain" | "halfFlush" | "fullFlush" | "pungs" | "honors" | "runs";

const THEMES: [Theme, number][] = [
  ["plain", 30],
  ["runs", 14],
  ["halfFlush", 16],
  ["fullFlush", 8],
  ["pungs", 16],
  ["honors", 16],
];

function weighted<T>(rng: Rng, items: [T, number][]): T {
  const total = items.reduce((n, [, w]) => n + w, 0);
  let r = rng.next() * total;
  for (const [item, w] of items) {
    r -= w;
    if (r < 0) return item;
  }
  return items[items.length - 1]![0];
}

interface Group {
  type: "chow" | "pung";
  codes: TileCode[];
}

function suited(suit: Suit, rank: number): TileCode {
  return `${suit}${rank}`;
}

/** One set for the theme, or null if it would need a fifth copy of a tile. */
function drawSet(rng: Rng, theme: Theme, suit: Suit, used: Map<TileCode, number>): Group | null {
  const honorsOk = theme !== "fullFlush" && theme !== "runs";
  const honorChance = theme === "honors" ? 0.55 : theme === "halfFlush" ? 0.3 : theme === "pungs" ? 0.3 : 0.12;
  const suitPick: Suit = theme === "halfFlush" || theme === "fullFlush" ? suit : rng.pick(SUITS);
  let group: Group;
  if (honorsOk && rng.next() < honorChance) {
    const code = rng.pick([...DRAGONS, ...WINDS]);
    group = { type: "pung", codes: [code, code, code] };
  } else {
    const pung = theme === "pungs" || (theme !== "runs" && rng.next() < 0.3);
    if (pung) {
      const code = suited(suitPick, 1 + rng.int(9));
      group = { type: "pung", codes: [code, code, code] };
    } else {
      const start = 1 + rng.int(7);
      group = { type: "chow", codes: [0, 1, 2].map((d) => suited(suitPick, start + d)) };
    }
  }
  const counts = new Map(used);
  for (const c of group.codes) counts.set(c, (counts.get(c) ?? 0) + 1);
  if ([...counts.values()].some((n) => n > 4)) return null;
  for (const [c, n] of counts) used.set(c, n);
  return group;
}

function drawPair(rng: Rng, theme: Theme, suit: Suit, used: Map<TileCode, number>): TileCode | null {
  for (let tries = 0; tries < 20; tries++) {
    const honor = theme !== "fullFlush" && theme !== "runs" && rng.next() < (theme === "honors" ? 0.5 : 0.25);
    const code = honor
      ? rng.pick([...DRAGONS, ...WINDS])
      : suited(theme === "halfFlush" || theme === "fullFlush" ? suit : rng.pick(SUITS), 1 + rng.int(9));
    if ((used.get(code) ?? 0) + 2 <= 4) {
      used.set(code, (used.get(code) ?? 0) + 2);
      return code;
    }
  }
  return null;
}

export interface DrillHand {
  seed: number;
  example: ExampleHand;
  score: ScoreResult;
}

/** A winning hand from a seed. Always valid: it retries until the tiles fit in one set. */
export function drillHand(seed: number): DrillHand {
  for (let attempt = 0; ; attempt++) {
    const rng = createRng((seed * 7919 + attempt * 104729) >>> 0);
    const theme = weighted(rng, THEMES);
    const suit = rng.pick(SUITS);
    const used = new Map<TileCode, number>();
    const sets: Group[] = [];
    for (let i = 0; i < 4 && sets.length === i; i++) {
      for (let tries = 0; tries < 12; tries++) {
        const g = drawSet(rng, theme, suit, used);
        if (g) {
          sets.push(g);
          break;
        }
      }
    }
    const pair = sets.length === 4 ? drawPair(rng, theme, suit, used) : null;
    if (!pair) continue;

    // Claim a few sets from discards: a concealed hand is common, all four rare.
    const claimed = weighted(rng, [
      [0, 30],
      [1, 30],
      [2, 25],
      [3, 12],
      [4, 3],
    ] as [number, number][]);
    const melds: MeldSpec[] = sets.slice(0, claimed).map((g) => ({ type: g.type, codes: g.codes }));
    const inHand = [...sets.slice(claimed).flatMap((g) => g.codes), pair, pair];
    const winning = rng.pick(inHand);
    const seat = rng.int(4) as Seat;
    const flowers = weighted(rng, [
      [[], 35],
      [[`f${seat + 1}`], 25],
      [[`f${((seat + 1) % 4) + 1}`], 25],
      [[`f${seat + 1}`, `f${seat + 5}`], 10],
      [[`f${((seat + 2) % 4) + 1}`, `f${((seat + 1) % 4) + 5}`], 5],
    ] as [TileCode[], number][]);
    const example: ExampleHand = {
      melds,
      concealed: inHand,
      winning,
      selfDrawn: rng.next() < 0.35,
      seat,
      roundWind: rng.next() < 0.75 ? "we" : "ws",
      flowers,
    };
    try {
      return { seed, example, score: scoreExample(example) };
    } catch {
      // A hand that does not split into sets — cannot happen by construction, but never show one.
      continue;
    }
  }
}

/** The faan buttons the drill offers: 0 to 9, then the limit. */
export const DRILL_CHOICES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

/** A hand's answer on the drill's scale: anything at or past the limit is the last button. */
export function drillAnswer(score: ScoreResult): number {
  return Math.min(score.faan, 10);
}
