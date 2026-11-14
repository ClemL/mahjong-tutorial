"use client";

import { useMemo, useState } from "react";
import { compareCodes, tileName } from "@/game/tiles";
import { CLAIM_PUZZLES, type ClaimAnswer, DIRECTION_LABEL, claimsFor } from "@/tutorial/quizzes";
import { TileFace } from "@/components/TileView";
import { TileRow } from "@/components/Tiles";
import { QuizShell, Verdict } from "./QuizShell";

const OPTIONS: { value: ClaimAnswer; label: string }[] = [
  { value: "chow", label: "Chow 上" },
  { value: "pung", label: "Pung 碰" },
  { value: "kong", label: "Kong 槓" },
  { value: "win", label: "Win 食糊" },
  { value: "none", label: "Nothing" },
];

/** A tile is thrown: tick everything you could call for it. */
export function ClaimQuiz() {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<ClaimAnswer[]>([]);
  const [checked, setChecked] = useState(false);
  const puzzle = CLAIM_PUZZLES[index]!;
  const truth = useMemo(() => claimsFor(puzzle), [puzzle]);
  const right = checked && picked.length === truth.length && truth.every((t) => picked.includes(t));
  const last = index === CLAIM_PUZZLES.length - 1;

  const toggle = (value: ClaimAnswer) => {
    if (checked) return;
    setPicked((p) => {
      if (value === "none") return p.includes("none") ? [] : ["none"];
      const rest = p.filter((x) => x !== "none");
      return rest.includes(value) ? rest.filter((x) => x !== value) : [...rest, value];
    });
  };

  const go = (next: number) => {
    setIndex(next);
    setPicked([]);
    setChecked(false);
  };

  return (
    <QuizShell
      title="What can you call?"
      progress={`${index + 1} of ${CLAIM_PUZZLES.length}`}
      onNext={checked && !last ? () => go(index + 1) : undefined}
      onRestart={checked && last ? () => go(0) : undefined}
    >
      <div className="claimq">
        <div className="claimq__thrown">
          <span className="claimq__who">
            The player <strong>{DIRECTION_LABEL[puzzle.from]}</strong> throws
          </span>
          <TileFace code={puzzle.tile} size="lg" justDiscarded />
          <span className="sr-only">{tileName(puzzle.tile)}</span>
        </div>
        <div>
          <span className="claimq__who">Your hand</span>
          <TileRow codes={[...puzzle.hand].sort(compareCodes)} size="md" label={`Your hand: ${puzzle.hand.map(tileName).join(", ")}`} />
        </div>
      </div>
      <p className="quiz__ask">Tick everything you may call, then check.</p>
      <div className="quiz__choices" role="group" aria-label="Calls">
        {OPTIONS.map((o) => {
          const on = picked.includes(o.value);
          const verdict = checked ? (truth.includes(o.value) ? "quiz__choice--right" : on ? "quiz__choice--wrong" : "") : "";
          return (
            <button
              key={o.value}
              type="button"
              className={["btn", on && !checked ? "btn--on" : "", verdict].filter(Boolean).join(" ")}
              aria-pressed={on}
              onClick={() => toggle(o.value)}
            >
              {o.label}
            </button>
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
          {right ? "" : `The answer: ${truth.map((t) => OPTIONS.find((o) => o.value === t)!.label).join(", ")}. `}
          {puzzle.explain}
        </Verdict>
      )}
    </QuizShell>
  );
}
