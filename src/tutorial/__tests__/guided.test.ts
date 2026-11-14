import { describe, expect, it } from "vitest";
import { claimTurn } from "@/game/engine";
import {
  EXAMPLE_HAND,
  type HumanMove,
  applyMove,
  awaiting,
  opponentBeat,
  startScenario,
} from "../guided";
import { allTiles } from "../table";

/** Play the other seats until the table waits on you. */
function settle(state: ReturnType<typeof startScenario>) {
  let next = opponentBeat(state);
  let beats = 0;
  while (next) {
    state = next;
    next = opponentBeat(state);
    beats += 1;
    if (beats > 200) throw new Error("The script never came back to you");
  }
  return state;
}

function kindFor(move: HumanMove) {
  if (move.kind === "claim" || move.kind === "pass") return "claim";
  if (move.kind === "draw") return "draw";
  return "turn";
}

describe("the guided example hand", () => {
  it("is dealt from exactly one 144-tile set", () => {
    const state = startScenario();
    const ids = allTiles(state).map((t) => t.id);
    expect(ids).toHaveLength(144);
    expect(new Set(ids).size).toBe(144);
  });

  it("offers every move the coach asks for, in order, and ends in a 3-faan self-drawn win", () => {
    let state = startScenario();
    for (const step of EXAMPLE_HAND.steps) {
      state = settle(state);
      expect(awaiting(state)).toBe(kindFor(step.expect));
      if (step.expect.kind === "claim") {
        const type = step.expect.type;
        expect(claimTurn(state)?.options.map((o) => o.type)).toContain(type);
      }
      const next = applyMove(state, step.expect);
      expect(next, JSON.stringify(step.expect)).not.toBeNull();
      state = next!;
    }
    expect(awaiting(state)).toBe("done");
    expect(state.result?.winner).toBe(0);
    expect(state.result?.from).toBeNull();
    expect(state.result?.score?.faan).toBe(3);
    expect(state.result?.score?.patterns.map((p) => p.key).sort()).toEqual(["dragonPung", "ownFlower", "selfDraw"]);
    expect(state.result?.payments).toEqual([24, -8, -8, -8]);
  });

  it("offers no win on the 9 Bamboo the coach says to pass", () => {
    let state = startScenario();
    for (const step of EXAMPLE_HAND.steps) {
      state = settle(state);
      if (step.expect.kind === "pass") {
        expect(claimTurn(state)?.options.map((o) => o.type)).toEqual(["pung"]);
        return;
      }
      state = applyMove(state, step.expect)!;
    }
    throw new Error("The script has no pass");
  });

  it("refuses a move that is not open to you", () => {
    const state = settle(startScenario());
    expect(applyMove(state, { kind: "draw" })).toBeNull();
    expect(applyMove(state, { kind: "selfDraw" })).toBeNull();
    expect(applyMove(state, { kind: "discard", code: "m9" })).toBeNull();
  });
});
