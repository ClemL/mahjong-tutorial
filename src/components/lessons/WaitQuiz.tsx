"use client";

import { useState } from "react";
import { HONORS, type TileCode, compareCodes, suitOf, tileName } from "@/game/tiles";
import { WAIT_PUZZLES } from "@/tutorial/quizzes";
import { TileButton } from "@/components/TileView";
import { TileRow } from "@/components/Tiles";
import { QuizShell, Verdict } from "./QuizShell";

/** The tiles worth offering: every tile of the suits in the hand, and the honors it holds. */
function candidates(hand: TileCode[]): TileCode[] {
  const suits = [...new Set(hand.map(suitOf).filter(Boolean))] as string[];
  const suited = suits.flatMap((s) => [1, 2, 3, 4, 5, 6, 7, 8, 9].map((r) => `${s}${r}`));
  const honors = HONORS.filter((h) => hand.includes(h));
  return [...suited, ...honors].sort(compareCodes);
}

/** Thirteen tiles, one short: which tiles would finish the hand? */
export function WaitQuiz() {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<TileCode[]>([]);
  const [checked, setChecked] = useState(false);
  const puzzle = WAIT_PUZZLES[index]!;
  const truth = puzzle.waits;
  const right = checked && picked.length === truth.length && truth.every((t) => picked.includes(t));
  const last = index === WAIT_PUZZLES.length - 1;

  const toggle = (code: TileCode) => {
    if (checked) return;
    setPicked((p) => (p.includes(code) ? p.filter((c) => c !== code) : [...p, code]));
  };

  const go = (next: number) => {
    setIndex(next);
    setPicked([]);
    setChecked(false);
  };

  return (
    <QuizShell
      title={`Which tiles win? ${checked ? `— ${puzzle.name}` : ""}`}
      progress={`${index + 1} of ${WAIT_PUZZLES.length}`}
      onNext={checked && !last ? () => go(index + 1) : undefined}
      onRestart={checked && last ? () => go(0) : undefined}
    >
      <div className="quiz__stage">
        <TileRow codes={[...puzzle.codes].sort(compareCodes)} size="md" label={`Hand: ${puzzle.codes.map(tileName).join(", ")}`} />
      </div>
      <p className="quiz__ask">Tap every tile that would complete this hand, then check.</p>
      <div className="waits__palette" role="group" aria-label="Candidate tiles">
        {candidates(puzzle.codes).map((code) => {
          const on = picked.includes(code);
          const state = checked ? (truth.includes(code) ? (on ? "hit" : "missed") : on ? "wrong" : "") : on ? "on" : "";
          return (
            <TileButton
              key={code}
              code={code}
              size="sm"
              className={state ? `waits__tile waits__tile--${state}` : "waits__tile"}
              ariaLabel={`${tileName(code)}${on ? ", picked" : ""}${checked && truth.includes(code) ? ", a winning tile" : ""}`}
              onClick={() => toggle(code)}
            />
          );
        })}
      </div>
      {!checked ? (
        <div className="actions">
          <button type="button" className="btn btn--primary" disabled={picked.length === 0} onClick={() => setChecked(true)}>
            Check
          </button>
        </div>
      ) : (
        <Verdict right={right}>
          {right ? "" : `It wins on ${truth.map(tileName).join(" and ")}. `}
          {puzzle.explain}
        </Verdict>
      )}
    </QuizShell>
  );
}
