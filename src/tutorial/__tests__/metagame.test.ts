import { describe, expect, it } from "vitest";
import { analyzeShape } from "@/game/winning";
import { allTiles, buildTable } from "../table";
import { DISCARD_PUZZLES, CLAIM_PUZZLES, DIRECTION_SEAT } from "../quizzes";
import {
  DECLARE_PUZZLES,
  MINIMUM_MEASURED,
  SPEED_PUZZLES,
  THREE_FAAN,
  routesAfter,
  speedAnswer,
  speedOnly,
  winningTiles,
} from "../planning";
import {
  COLLECT_OPTIONS,
  COLLECT_PUZZLES,
  DEFENSE_PUZZLES,
  collectAnswer,
  countingQuestion,
  dangerOf,
  defenseAnswer,
  defenseTable,
  holdsNoFlowers,
  visibleCount,
} from "../reading";
import { DRILL_CHOICES, drillAnswer, drillHand } from "../drill";
import { MISTAKES, reviewClaim, reviewDiscard } from "../review";
import { routeRows, seatingFor } from "../routes";
import { discard } from "@/game/engine";

describe("speed against value", () => {
  it("has a puzzle where the quickest discard is not the one that keeps a declarable hand", () => {
    const p = SPEED_PUZZLES[0]!;
    const value = speedAnswer(p);
    const fast = speedOnly(p);
    expect(value).toEqual(expect.arrayContaining(["m4", "m5"]));
    expect(fast.some((c) => value.includes(c))).toBe(false);
    // Every fast discard leaves only routes under the minimum as the quickest ones.
    for (const code of fast) {
      const quickest = Math.min(...routesAfter(p, code).map((r) => r.shanten));
      expect(routesAfter(p, code).filter((r) => r.shanten === quickest).every((r) => !r.declarable)).toBe(true);
    }
  });

  it("has a puzzle where speed and value agree", () => {
    const p = SPEED_PUZZLES[1]!;
    expect(speedOnly(p).every((c) => speedAnswer(p).includes(c))).toBe(true);
  });

  it("marks exactly one route as the one to play for", () => {
    for (const p of SPEED_PUZZLES) {
      const rows = routeRows(p.hand.slice(0, 13), [], seatingFor(p.seat, p.roundWind, p.flowers, THREE_FAAN));
      expect(rows.filter((r) => r.best)).toHaveLength(1);
      expect(rows[0]!.best).toBe(true);
    }
  });

  it("quotes the game's own measurements in order of minimum", () => {
    expect(MINIMUM_MEASURED.map((m) => m.minFaan)).toEqual([0, 3, 5]);
    for (const m of MINIMUM_MEASURED) expect(m.won + m.washedOut).toBeCloseTo(100, 5);
  });
});

describe("which winning tiles can be declared", () => {
  it("first puzzle: East wind can be declared at 3 faan, 9 Bamboo cannot", () => {
    const tiles = winningTiles(DECLARE_PUZZLES[0]!);
    expect(tiles.map((t) => [t.code, t.declarable])).toEqual([
      ["s9", false],
      ["we", true],
    ]);
  });

  it("second puzzle: neither off a discard, both when self-drawn", () => {
    const tiles = winningTiles(DECLARE_PUZZLES[1]!);
    expect(tiles.length).toBe(2);
    expect(tiles.every((t) => !t.declarable && t.selfDrawnFaan >= THREE_FAAN.minFaan)).toBe(true);
  });

  it("third puzzle: both declarable", () => {
    expect(winningTiles(DECLARE_PUZZLES[2]!).every((t) => t.declarable)).toBe(true);
  });
});

describe("what are they collecting", () => {
  it.each(COLLECT_PUZZLES.map((p, i) => [i + 1, p]))("puzzle %s: the planner's route is one of the options", (_i, p) => {
    expect(p.hidden.length + p.melds.length * 3).toBe(13);
    const answer = collectAnswer(p);
    expect(COLLECT_OPTIONS.map((o) => o.value)).toContain(answer);
  });

  it("covers a flush, triplets and runs", () => {
    expect(COLLECT_PUZZLES.map((p) => collectAnswer(p))).toEqual(["flush-s", "pungs", "chows", "flush-m"]);
  });
});

describe("defense", () => {
  it.each(DEFENSE_PUZZLES.map((p) => [p.title, p]))("%s deals from one set with legal hand sizes", (_t, p) => {
    const state = defenseTable(p);
    expect(allTiles(state)).toHaveLength(144);
    expect(holdsNoFlowers(p)).toBe(true);
    state.players.forEach((pl, seat) => {
      expect(pl.hand.length + pl.melds.length * 3).toBe(seat === 0 ? 14 : 13);
    });
    for (const c of p.candidates) expect(state.players[0]!.hand.some((t) => t.code === c)).toBe(true);
  });

  it("has exactly one right answer to each puzzle, as the hidden hands decide", () => {
    expect(DEFENSE_PUZZLES.map((p) => defenseAnswer(p))).toEqual([["s6"], ["p3"], ["dw"], ["ws"]]);
  });

  it("names why each dangerous tile is dangerous", () => {
    const kinds = DEFENSE_PUZZLES.map((p) => {
      const state = defenseTable(p);
      return dangerOf(state, defenseAnswer(p)[0]!).kind;
    });
    expect(kinds).toEqual(["win", "win", "liability", "safe"]);
  });

  it("the furiten puzzle's dangerous tile is already in the opponent's own pond", () => {
    const p = DEFENSE_PUZZLES[1]!;
    const state = defenseTable(p);
    expect(state.players[p.watch]!.discards.map((t) => t.code)).toContain("p3");
    expect(dangerOf(state, "p3")).toEqual({ kind: "win", seat: p.watch });
  });
});

describe("counting tiles", () => {
  it("asks about a tile you can see some of, and the answer is what is really hidden", () => {
    let asked = 0;
    for (let seed = 1; seed <= 40 && asked < 12; seed++) {
      const q = countingQuestion(seed);
      if (!q) continue;
      asked += 1;
      expect(allTiles(q.state)).toHaveLength(144);
      const seen = visibleCount(q.state, q.code);
      expect(seen).toBeGreaterThanOrEqual(1);
      expect(seen).toBeLessThanOrEqual(3);
      // The truth: copies in the wall and in the other three hands.
      const hidden = [
        ...q.state.wall,
        ...q.state.players.filter((p) => p.seat !== 0).flatMap((p) => p.hand),
      ].filter((t) => t.code === q.code).length;
      expect(q.unseen).toBe(hidden);
    }
    expect(asked).toBeGreaterThanOrEqual(10);
  });
});

describe("the faan drill", () => {
  it("deals valid winning hands with a spread of scores", () => {
    const answers = new Set<number>();
    const patterns = new Set<string>();
    for (let seed = 0; seed < 400; seed++) {
      const { example, score } = drillHand(seed);
      const codes = [...(example.melds ?? []).flatMap((m) => m.codes), ...example.concealed];
      const counts = new Map<string, number>();
      for (const c of codes) counts.set(c, (counts.get(c) ?? 0) + 1);
      expect([...counts.values()].every((n) => n <= 4)).toBe(true);
      expect(analyzeShape(example.concealed, (example.melds ?? []).map((m) => ({ type: m.type, tiles: [], concealed: false })))).not.toBeNull();
      answers.add(drillAnswer(score));
      score.patterns.forEach((p) => patterns.add(p.key));
    }
    expect(answers.size).toBeGreaterThanOrEqual(7);
    for (const key of ["dragonPung", "halfFlush", "fullFlush", "allPungs", "allChows", "selfDraw", "ownFlower", "noBonus"]) {
      expect(patterns.has(key), key).toBe(true);
    }
  });

  it("is the same hand for the same seed", () => {
    expect(drillHand(42)).toEqual(drillHand(42));
  });

  it("offers a button for every answer", () => {
    for (let seed = 0; seed < 100; seed++) expect(DRILL_CHOICES).toContain(drillAnswer(drillHand(seed).score));
  });
});

describe("reviewing a hand", () => {
  const puzzle = DISCARD_PUZZLES[0]!;
  const before = buildTable({ hands: [puzzle.hand, [], [], []], turn: 0, drawn: puzzle.hand[13] });

  it("calls the coach's own discard a match", () => {
    const wn = before.players[0]!.hand.find((t) => t.code === "wn")!;
    expect(reviewDiscard(before, 0, wn.id).verdict).toBe("match");
  });

  it("flags breaking a finished run when a lone honor could go as a mistake", () => {
    const m2 = before.players[0]!.hand.find((t) => t.code === "m2")!;
    const review = reviewDiscard(before, 0, m2.id);
    expect(MISTAKES).toContain(review.verdict);
    expect(review.yourShape!.shanten).toBeGreaterThan(review.coachShape!.shanten);
  });

  it("flags passing on a winning discard", () => {
    const p = CLAIM_PUZZLES[4]!;
    const from = DIRECTION_SEAT[p.from];
    const hands: [string[], string[], string[], string[]] = [p.hand, [], [], []];
    hands[from] = [p.tile];
    const table = buildTable({ hands, turn: from });
    const thrown = discard(table, from, table.players[from]!.hand[0]!.id);
    expect(reviewClaim(thrown, 0, null).verdict).toBe("missedWin");
    expect(reviewClaim(thrown, 0, "win").verdict).toBe("match");
  });
});
