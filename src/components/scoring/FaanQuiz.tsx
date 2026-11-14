"use client";

import { useMemo, useState } from "react";
import { SEAT_NAMES, type Seat, roundName } from "@/game/tiles";
import { type FlowerChoice, LAB_HANDS, labExample, scoreExample } from "@/tutorial/scoring";
import { QuizShell, Verdict } from "@/components/lessons/QuizShell";
import { Breakdown, ExampleTiles } from "./ExampleTiles";

interface Question {
  hand: string;
  claimed: number;
  selfDrawn: boolean;
  seat: Seat;
  round: string;
  flowers: FlowerChoice;
}

const QUESTIONS: Question[] = [
  { hand: "dragons", claimed: 1, selfDrawn: false, seat: 1, round: "we", flowers: "none" },
  { hand: "runs", claimed: 0, selfDrawn: false, seat: 1, round: "we", flowers: "none" },
  { hand: "wind", claimed: 0, selfDrawn: true, seat: 0, round: "we", flowers: "own" },
  { hand: "flush", claimed: 2, selfDrawn: false, seat: 2, round: "we", flowers: "other" },
  { hand: "triplets", claimed: 4, selfDrawn: false, seat: 3, round: "ws", flowers: "none" },
];

/** Count the faan yourself, then see the engine's count. */
export function FaanQuiz() {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [right, setRight] = useState(0);
  const q = QUESTIONS[index]!;
  const example = useMemo(
    () =>
      labExample({
        hand: LAB_HANDS.find((h) => h.id === q.hand)!,
        claimed: q.claimed,
        selfDrawn: q.selfDrawn,
        seat: q.seat,
        roundWind: q.round,
        flowers: q.flowers,
      }),
    [q],
  );
  const score = useMemo(() => scoreExample(example), [example]);
  const answer = score.faan;
  const options = [...new Set([answer - 2, answer - 1, answer, answer + 1, answer + 2].filter((n) => n >= 0))].slice(0, 4);
  if (!options.includes(answer)) options.push(answer);
  const last = index === QUESTIONS.length - 1;

  const choose = (n: number) => {
    if (picked !== null) return;
    setPicked(n);
    if (n === answer) setRight((r) => r + 1);
  };

  return (
    <QuizShell
      title="How many faan?"
      progress={`${index + 1} of ${QUESTIONS.length}`}
      score={picked !== null && last ? `${right} of ${QUESTIONS.length} right` : undefined}
      onNext={picked !== null && !last ? () => (setIndex((i) => i + 1), setPicked(null)) : undefined}
      onRestart={picked !== null && last ? () => (setIndex(0), setPicked(null), setRight(0)) : undefined}
    >
      <p className="quiz__ask">
        You sit <strong>{SEAT_NAMES[q.seat]}</strong> in the <strong>{roundName(q.round)}</strong> round
        {q.flowers === "none" ? ", with no flowers or seasons" : ""}.
      </p>
      <div className="quiz__stage quiz__stage--left">
        <ExampleTiles example={example} />
      </div>
      <div className="quiz__choices" role="group" aria-label="Faan">
        {options
          .sort((a, b) => a - b)
          .map((n) => (
            <button
              key={n}
              type="button"
              className={[
                "btn",
                picked !== null && n === answer ? "quiz__choice--right" : "",
                picked === n && n !== answer ? "quiz__choice--wrong" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              disabled={picked !== null && n !== picked && n !== answer}
              onClick={() => choose(n)}
            >
              {n} faan
            </button>
          ))}
      </div>
      {picked !== null ? (
        <>
          <Verdict right={picked === answer}>{`It is ${answer} faan: a hand worth ${score.value} points.`}</Verdict>
          <Breakdown score={score} />
        </>
      ) : null}
    </QuizShell>
  );
}
