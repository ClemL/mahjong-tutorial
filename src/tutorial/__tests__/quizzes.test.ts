import { describe, expect, it } from "vitest";
import { analyzeShape } from "@/game/winning";
import {
  CLAIM_PUZZLES,
  DISCARD_PUZZLES,
  SET_QUIZ,
  SORT_PUZZLES,
  WAIT_PUZZLES,
  bestDiscards,
  claimsFor,
  classifySet,
  winsOn,
} from "../quizzes";

function copiesOk(codes: string[]) {
  const counts = new Map<string, number>();
  for (const c of codes) counts.set(c, (counts.get(c) ?? 0) + 1);
  return [...counts.values()].every((n) => n <= 4);
}

describe("set recognition", () => {
  it("names each shape", () => {
    expect(classifySet(["m3", "m4", "m5"])).toBe("chow");
    expect(classifySet(["m5", "m3", "m4"])).toBe("chow");
    expect(classifySet(["dr", "dr", "dr"])).toBe("pung");
    expect(classifySet(["p6", "p6", "p6", "p6"])).toBe("kong");
    expect(classifySet(["we", "we"])).toBe("pair");
    expect(classifySet(["m8", "m9", "m1"])).toBe("none");
    expect(classifySet(["we", "ws", "ww"])).toBe("none");
    expect(classifySet(["m4", "p5", "s6"])).toBe("none");
    expect(classifySet(["s2", "s3", "s5"])).toBe("none");
  });

  it("has an explanation that matches the answer for every item", () => {
    for (const item of SET_QUIZ) {
      const kind = classifySet(item.codes);
      const said = item.explain.toLowerCase();
      if (kind === "none") expect(said).toMatch(/not/);
      else expect(said).toContain(kind === "pair" ? "pair" : kind);
    }
  });
});

describe("hands to arrange", () => {
  it.each(SORT_PUZZLES.map((p) => [p.title, p]))("%s is a complete hand", (_t, puzzle) => {
    expect(puzzle.codes).toHaveLength(14);
    expect(copiesOk(puzzle.codes)).toBe(true);
    expect(analyzeShape(puzzle.codes, [])).not.toBeNull();
  });
});

describe("waits", () => {
  it.each(WAIT_PUZZLES.map((p) => [p.name, p]))("%s wins on what it says", (_n, puzzle) => {
    expect(puzzle.codes).toHaveLength(13);
    expect(copiesOk(puzzle.codes)).toBe(true);
    expect(winsOn(puzzle.codes)).toEqual(puzzle.waits);
  });
});

describe("claims", () => {
  const expected = [["chow"], ["none"], ["pung"], ["kong", "pung"], ["chow", "win"], ["win"]];

  it("asks the engine what each discard can be claimed for", () => {
    expect(CLAIM_PUZZLES.map((p) => claimsFor(p).sort())).toEqual(expected);
  });

  it("uses no tile more than four times", () => {
    for (const p of CLAIM_PUZZLES) expect(copiesOk([...p.hand, p.tile])).toBe(true);
  });
});

describe("discards", () => {
  it.each(DISCARD_PUZZLES.map((p, i) => [i + 1, p]))("puzzle %s names every best discard", (_i, puzzle) => {
    expect(puzzle.hand).toHaveLength(14);
    expect(copiesOk(puzzle.hand)).toBe(true);
    expect(bestDiscards(puzzle.hand).sort()).toEqual([...puzzle.best].sort());
  });
});
