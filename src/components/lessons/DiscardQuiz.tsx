"use client";

import { useState } from "react";
import { type TileCode, compareCodes, tileName } from "@/game/tiles";
import { DISCARD_PUZZLES } from "@/tutorial/quizzes";
import { TileButton } from "@/components/TileView";
import { QuizShell, Verdict } from "./QuizShell";

/** Fourteen tiles in hand: which one goes? */
export function DiscardQuiz() {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<TileCode | null>(null);
  const puzzle = DISCARD_PUZZLES[index]!;
  const hand = [...puzzle.hand].sort(compareCodes);
  const right = picked !== null && puzzle.best.includes(picked);
  const last = index === DISCARD_PUZZLES.length - 1;

  const go = (next: number) => {
    setIndex(next);
    setPicked(null);
  };

  return (
    <QuizShell
      title="Which tile would you throw?"
      progress={`${index + 1} of ${DISCARD_PUZZLES.length}`}
      onNext={picked && !last ? () => go(index + 1) : undefined}
      onRestart={picked && last ? () => go(0) : undefined}
    >
      <p className="quiz__ask">It is your turn and you hold fourteen tiles. Tap the one to discard.</p>
      <div className="sorter__hand">
        {hand.map((code, i) => {
          const state = picked ? (puzzle.best.includes(code) ? "best" : code === picked ? "wrong" : "") : "";
          return (
            <TileButton
              key={`${code}-${i}`}
              code={code}
              size="md"
              className={state ? `discardq__tile--${state}` : ""}
              ariaLabel={`Discard ${tileName(code)}`}
              disabled={picked !== null}
              onClick={() => setPicked(code)}
            />
          );
        })}
      </div>
      {picked ? (
        <Verdict right={right}>
          {right
            ? puzzle.best.length > 1
              ? `Any of ${puzzle.best.map(tileName).join(", ")} is as quick. `
              : ""
            : `The quickest discard: ${puzzle.best.map(tileName).join(" or ")}. `}
          {puzzle.explain}
        </Verdict>
      ) : null}
    </QuizShell>
  );
}
