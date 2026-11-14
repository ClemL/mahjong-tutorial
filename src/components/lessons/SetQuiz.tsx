"use client";

import { useState } from "react";
import { SET_KINDS, SET_QUIZ, type SetKind, classifySet } from "@/tutorial/quizzes";
import { TileRow } from "@/components/Tiles";
import { QuizShell, Verdict } from "./QuizShell";

/** Name the set: chow, pung, kong, pair or nothing at all. */
export function SetQuiz() {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<SetKind | null>(null);
  const [score, setScore] = useState(0);
  const item = SET_QUIZ[index]!;
  const truth = classifySet(item.codes);
  const done = index >= SET_QUIZ.length - 1 && answer !== null;

  const choose = (kind: SetKind) => {
    if (answer) return;
    setAnswer(kind);
    if (kind === truth) setScore((s) => s + 1);
  };

  return (
    <QuizShell
      title="What is this?"
      progress={`${index + 1} of ${SET_QUIZ.length}`}
      score={done ? `${score} of ${SET_QUIZ.length} right` : undefined}
      onNext={done ? undefined : answer ? () => (setIndex((i) => i + 1), setAnswer(null)) : undefined}
      onRestart={done ? () => (setIndex(0), setAnswer(null), setScore(0)) : undefined}
    >
      <div className="quiz__stage">
        <TileRow codes={item.codes} size="lg" />
      </div>
      <div className="quiz__choices" role="group" aria-label="Your answer">
        {SET_KINDS.map((k) => (
          <button
            key={k.value}
            type="button"
            className={[
              "btn",
              answer && k.value === truth ? "quiz__choice--right" : "",
              answer === k.value && k.value !== truth ? "quiz__choice--wrong" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            disabled={answer !== null && k.value !== answer && k.value !== truth}
            onClick={() => choose(k.value)}
          >
            {k.label}
          </button>
        ))}
      </div>
      {answer ? <Verdict right={answer === truth}>{item.explain}</Verdict> : null}
    </QuizShell>
  );
}
