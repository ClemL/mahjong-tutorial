import { describe, expect, it } from "vitest";
import { answerClaim, discard } from "@/game/engine";
import { DEFAULT_FAAN } from "@/game/rules";
import { WINDS } from "@/game/tiles";
import {
  LAB_HANDS,
  PATTERNS,
  TWO_READINGS,
  labExample,
  payments,
  readings,
  scoreExample,
} from "../scoring";
import { buildTable } from "../table";

describe("the pattern catalog", () => {
  it.each(PATTERNS.map((p) => [p.name, p]))("%s: its example scores it, at the faan listed", (_n, entry) => {
    const result = scoreExample(entry.example);
    const hit = result.patterns.find((p) => p.key === entry.key);
    expect(hit, result.patterns.map((p) => p.key).join(", ")).toBeDefined();
    expect(hit!.faan).toBe(entry.faan);
  });

  it("covers every faan in the rules table", () => {
    const keys = new Set(PATTERNS.map((p) => p.key));
    const named: Record<string, string> = {
      honorTriplet: "dragonPung",
      bonusSet: "flowerSet",
    };
    for (const key of Object.keys(DEFAULT_FAAN)) expect(keys.has(named[key] ?? key), key).toBe(true);
  });

  it("puts each entry in the tier its faan belongs to", () => {
    for (const p of PATTERNS) {
      if (p.tier === "everyday") expect(p.faan).toBe(1);
      if (p.tier === "bigger") expect(p.faan).toBeGreaterThanOrEqual(3);
      if (p.tier === "limit") expect(p.faan).toBeGreaterThanOrEqual(10);
    }
  });
});

describe("reading a hand two ways", () => {
  it("finds the triplet and the run reading, and the triplets pay more", () => {
    const all = readings(TWO_READINGS);
    expect(all).toHaveLength(2);
    const totals = all.map((r) => r.score.faan).sort((a, b) => a - b);
    expect(totals).toEqual([1, 4]);
    expect(scoreExample(TWO_READINGS).faan).toBe(4);
  });
});

describe("the scoring lab", () => {
  it("builds a winning hand from every preset, whatever is claimed", () => {
    for (const hand of LAB_HANDS) {
      for (let claimed = 0; claimed <= 4; claimed++) {
        for (const selfDrawn of [false, true]) {
          const ex = labExample({ hand, claimed, selfDrawn, seat: 0, roundWind: WINDS[0]!, flowers: "own" });
          expect(() => scoreExample(ex)).not.toThrow();
        }
      }
    }
  });

  it("scores the East wind preset as seat and round wind for East in the East round", () => {
    const hand = LAB_HANDS.find((h) => h.id === "wind")!;
    const keys = scoreExample(
      labExample({ hand, claimed: 1, selfDrawn: false, seat: 0, roundWind: "we", flowers: "none" }),
    ).patterns.map((p) => p.key);
    expect(keys).toEqual(expect.arrayContaining(["seatWind", "roundWind"]));
  });
});

describe("payments", () => {
  it("matches what the engine settles for a win on a discard", () => {
    const state = buildTable({
      hands: [["m4", "m5", "dr", "dr", "dr", "p1", "p2", "p3", "s5", "s6", "s7", "we", "we"], [], [], ["m6"]],
      turn: 3,
    });
    const thrown = discard(state, 3, state.players[3]!.hand[0]!.id);
    const won = answerClaim(thrown, 0, "win");
    expect(won.result?.winner).toBe(0);
    const faan = won.result!.score!.faan;
    expect(payments(faan, 0, 3, { othersPayHalf: true })).toEqual(won.result!.payments);
  });

  it("charges all three on a self-draw, and the discarder alone when the others do not pay half", () => {
    expect(payments(3, 0, null, { othersPayHalf: true })).toEqual([24, -8, -8, -8]);
    expect(payments(3, 0, 2, { othersPayHalf: true })).toEqual([16, -4, -8, -4]);
    expect(payments(3, 0, 2, { othersPayHalf: false })).toEqual([8, 0, -8, 0]);
    // Half of an odd value rounds up.
    expect(payments(0, 1, 0, { othersPayHalf: true })).toEqual([-1, 3, -1, -1]);
  });
});
