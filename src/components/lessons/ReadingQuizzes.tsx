"use client";

import { useEffect, useMemo, useState } from "react";
import { SEAT_NAMES, type TileCode, tileName } from "@/game/tiles";
import {
  COLLECT_OPTIONS,
  COLLECT_PUZZLES,
  type CountingQuestion,
  DEFENSE_PUZZLES,
  collectAnswer,
  countingQuestion,
  dangerOf,
  defenseAnswer,
  defenseTable,
} from "@/tutorial/reading";
import { TableView } from "@/components/game/TableView";
import { TileFace } from "@/components/TileView";
import { TileRow } from "@/components/Tiles";
import { QuizShell, Verdict } from "./QuizShell";

const NAMES = ["You", "South", "West", "North"];
const POSITION = ["", "on your right", "opposite you", "on your left"];

// ---------------------------------------------------------------- counting

function whereSeen(q: CountingQuestion) {
  const count = (tiles: { code: TileCode }[]) => tiles.filter((t) => t.code === q.code).length;
  const players = q.state.players;
  return {
    hand: count(players[0]!.hand),
    ponds: players.reduce((n, p) => n + count(p.discards), 0),
    sets: players.reduce((n, p) => n + p.melds.reduce((m, meld) => m + count(meld.tiles), 0), 0),
  };
}

/** A real position from a hand the computer played part-way: how many of this tile are still out there? */
export function CountingDrill() {
  const [seed, setSeed] = useState<number | null>(null);
  const [answer, setAnswer] = useState<number | null>(null);
  const [score, setScore] = useState({ right: 0, total: 0 });

  // Dealt in the browser: a random position per visit, never the same one baked into the page.
  useEffect(() => {
    setSeed(Math.floor(Math.random() * 1_000_000));
  }, []);

  const question = useMemo(() => {
    if (seed === null) return null;
    for (let s = seed; s < seed + 50; s++) {
      const q = countingQuestion(s);
      if (q) return q;
    }
    return null;
  }, [seed]);

  const next = () => {
    setSeed((s) => (s ?? 0) + 51);
    setAnswer(null);
  };

  if (!question) return <div className="quiz panel-block muted">Dealing a position…</div>;
  const seen = whereSeen(question);
  const choose = (n: number) => {
    if (answer !== null) return;
    setAnswer(n);
    setScore((s) => ({ right: s.right + (n === question.unseen ? 1 : 0), total: s.total + 1 }));
  };

  return (
    <QuizShell
      title="Count the tile"
      progress={score.total ? `${score.right} of ${score.total} right` : undefined}
      onNext={answer !== null ? next : undefined}
      nextLabel="Another position"
    >
      <div className="countq__ask">
        <TileFace code={question.code} size="lg" />
        <p className="quiz__ask">
          A hand part-way through. How many <strong>{tileName(question.code)}</strong> can you not see — still in the
          wall, or in someone else&apos;s hand?
        </p>
      </div>
      <div className="quiz__choices" role="group" aria-label="How many are unseen">
        {[0, 1, 2, 3, 4].map((n) => (
          <button
            key={n}
            type="button"
            className={[
              "btn",
              answer !== null && n === question.unseen ? "quiz__choice--right" : "",
              answer === n && n !== question.unseen ? "quiz__choice--wrong" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            disabled={answer !== null && n !== answer && n !== question.unseen}
            onClick={() => choose(n)}
          >
            {n}
          </button>
        ))}
      </div>
      {answer !== null ? (
        <Verdict right={answer === question.unseen}>
          {`There are four of every tile. You can see ${4 - question.unseen}: ${seen.hand} in your hand, ${seen.ponds} in the ponds and ${seen.sets} in sets on the table — so ${question.unseen} ${question.unseen === 1 ? "is" : "are"} still out there.`}
        </Verdict>
      ) : null}
      <TableView state={question.state} you={0} names={NAMES} canDiscard={false} />
    </QuizShell>
  );
}

// ----------------------------------------------------- what are they making

/** One opponent's sets and discards: what are they building? */
export function CollectQuiz() {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const p = COLLECT_PUZZLES[index]!;
  const truth = useMemo(() => collectAnswer(p), [p]);
  const last = index === COLLECT_PUZZLES.length - 1;
  const go = (n: number) => {
    setIndex(n);
    setPicked(null);
  };

  return (
    <QuizShell
      title={`What is ${SEAT_NAMES[p.seat]} collecting?`}
      progress={`${index + 1} of ${COLLECT_PUZZLES.length}`}
      onNext={picked && !last ? () => go(index + 1) : undefined}
      onRestart={picked && last ? () => go(0) : undefined}
    >
      <div className="opponent panel-block">
        <p className="coach__label">
          {SEAT_NAMES[p.seat]}, {POSITION[p.seat]}
        </p>
        <span className="example__part">
          <span className="example__tag">Claimed sets</span>
          <span className="example__sets">
            {p.melds.map((m, i) => (
              <TileRow key={i} codes={m.codes} size="sm" className="example__meld" />
            ))}
          </span>
        </span>
        <span className="example__part">
          <span className="example__tag">{picked ? "Their hand, revealed" : `In hand: ${p.hidden.length} tiles`}</span>
          <TileRow codes={picked ? p.hidden : p.hidden.map(() => "back" as const)} size="sm" />
        </span>
        <span className="example__part">
          <span className="example__tag">Discards, oldest first</span>
          <TileRow codes={p.pond} size="sm" />
        </span>
      </div>
      <div className="quiz__choices" role="group" aria-label="What they are collecting">
        {COLLECT_OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            className={[
              "btn",
              picked && o.value === truth ? "quiz__choice--right" : "",
              picked === o.value && o.value !== truth ? "quiz__choice--wrong" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            disabled={picked !== null && o.value !== picked && o.value !== truth}
            onClick={() => picked ?? setPicked(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
      {picked ? <Verdict right={picked === truth}>{p.explain}</Verdict> : null}
    </QuizShell>
  );
}

// ---------------------------------------------------------------- defense

const DANGER_TEXT = {
  safe: () => "Safe: nobody wins on it or makes a set you would pay for.",
  win: (seat: number) => `${SEAT_NAMES[seat]} wins on it.`,
  liability: (seat: number) => `${SEAT_NAMES[seat]} pungs it for a set you would be liable (包) for.`,
} as const;

/** Late in a hand: which tile do you throw, or which must you keep? */
export function DefenseQuiz() {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<TileCode | null>(null);
  const p = DEFENSE_PUZZLES[index]!;
  const state = useMemo(() => defenseTable(p), [p]);
  const truth = useMemo(() => defenseAnswer(p), [p]);
  const last = index === DEFENSE_PUZZLES.length - 1;
  const go = (n: number) => {
    setIndex(n);
    setPicked(null);
  };

  return (
    <QuizShell
      title={p.title}
      progress={`${index + 1} of ${DEFENSE_PUZZLES.length}`}
      onNext={picked && !last ? () => go(index + 1) : undefined}
      onRestart={picked && last ? () => go(0) : undefined}
    >
      <p className="quiz__ask">
        <strong>{p.question}</strong>
      </p>
      <div className="quiz__choices" role="group" aria-label="Candidate tiles">
        {p.candidates.map((code) => {
          const good = truth.includes(code);
          return (
            <button
              key={code}
              type="button"
              className={[
                "btn defenseq__pick",
                picked && good ? "quiz__choice--right" : "",
                picked === code && !good ? "quiz__choice--wrong" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-label={tileName(code)}
              disabled={picked !== null && code !== picked && !good}
              onClick={() => picked ?? setPicked(code)}
            >
              <TileRow codes={[code]} size="md" />
            </button>
          );
        })}
      </div>
      {picked ? (
        <>
          <Verdict right={truth.includes(picked)}>{p.explain}</Verdict>
          <ul className="defenseq__list">
            {p.candidates.map((code) => {
              const d = dangerOf(state, code);
              return (
                <li key={code}>
                  <TileRow codes={[code]} size="sm" /> {d.kind === "safe" ? DANGER_TEXT.safe() : DANGER_TEXT[d.kind](d.seat!)}
                </li>
              );
            })}
          </ul>
        </>
      ) : null}
      <TableView state={state} you={0} names={NAMES} canDiscard={false} reveal={picked !== null} />
    </QuizShell>
  );
}
