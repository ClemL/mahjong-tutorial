"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SEAT_NAMES, roundName } from "@/game/tiles";
import { DRILL_CHOICES, type DrillHand, drillAnswer, drillHand } from "@/tutorial/drill";
import { QuizShell, Verdict } from "@/components/lessons/QuizShell";
import { Breakdown, ExampleTiles } from "./ExampleTiles";

const ROUND = 10;
const SECONDS = 30;
/** A missed hand comes back after this many others. */
const AGAIN_AFTER = 2;
const BEST_KEY = "mahjong-tutorial.drill-best";

interface Result {
  seed: number;
  right: boolean;
  secs: number;
  missed: string[];
}

function flowersText(hand: DrillHand): string {
  const f = hand.example.flowers ?? [];
  return f.length === 0 ? "no flowers" : `${f.length} bonus tile${f.length > 1 ? "s" : ""}`;
}

function readBest(): number | null {
  try {
    const raw = window.localStorage.getItem(BEST_KEY);
    return raw === null ? null : Number(raw);
  } catch {
    return null;
  }
}

/**
 * Ten random winning hands against the clock. A hand you miss comes back two
 * hands later, until you get it — the cheapest kind of spaced repetition.
 */
export function FaanDrill() {
  const [queue, setQueue] = useState<number[] | null>(null);
  const [answer, setAnswer] = useState<number | null>(null);
  const [left, setLeft] = useState(SECONDS);
  const [timed, setTimed] = useState(true);
  const [results, setResults] = useState<Result[]>([]);
  const [best, setBest] = useState<number | null>(null);
  const started = useRef(Date.now());

  const start = useCallback(() => {
    const base = Math.floor(Math.random() * 1_000_000);
    setQueue(Array.from({ length: ROUND }, (_, i) => base + i));
    setResults([]);
    setAnswer(null);
    setLeft(SECONDS);
    started.current = Date.now();
  }, []);

  // Seeds are drawn in the browser, so every round is new.
  useEffect(() => {
    start();
    setBest(readBest());
  }, [start]);

  const seed = queue?.[0] ?? null;
  const hand = useMemo(() => (seed === null ? null : drillHand(seed)), [seed]);
  const truth = hand ? drillAnswer(hand.score) : 0;
  const firstTries = results.filter((r, i) => results.findIndex((x) => x.seed === r.seed) === i);
  const done = queue !== null && queue.length === 0;

  const settle = useCallback(
    (n: number | null) => {
      if (!hand || answer !== null) return;
      const right = n === truth;
      setAnswer(n ?? -1);
      setResults((r) => [
        ...r,
        {
          seed: hand.seed,
          right,
          secs: (Date.now() - started.current) / 1000,
          missed: right ? [] : hand.score.patterns.map((p) => p.name),
        },
      ]);
    },
    [hand, answer, truth],
  );

  useEffect(() => {
    if (!timed || answer !== null || !hand) return;
    if (left <= 0) {
      settle(null);
      return;
    }
    const t = window.setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [timed, answer, hand, left, settle]);

  const next = () => {
    setQueue((q) => {
      if (!q) return q;
      const [current, ...rest] = q;
      const missed = answer !== truth;
      // Back into the round a little later, until it is right.
      if (missed && current !== undefined) rest.splice(Math.min(AGAIN_AFTER, rest.length), 0, current);
      return rest;
    });
    setAnswer(null);
    setLeft(SECONDS);
    started.current = Date.now();
  };

  useEffect(() => {
    if (!done) return;
    const score = firstTries.filter((r) => r.right).length;
    if (best === null || score > best) {
      setBest(score);
      try {
        window.localStorage.setItem(BEST_KEY, String(score));
      } catch {
        // A best that cannot be saved is still shown for this visit.
      }
    }
    // Only when the round ends.
  }, [done]);

  if (queue === null) return <div className="quiz panel-block muted">Shuffling…</div>;

  if (done) {
    const right = firstTries.filter((r) => r.right).length;
    const avg = firstTries.reduce((n, r) => n + r.secs, 0) / Math.max(1, firstTries.length);
    const tally = new Map<string, number>();
    for (const r of results) for (const name of r.missed) tally.set(name, (tally.get(name) ?? 0) + 1);
    const hardest = [...tally.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
    return (
      <QuizShell title="Faan drill — round over" score={`${right} of ${ROUND} right first time`} onRestart={start}>
        <ul className="drill__summary">
          <li>Average time on a first try: {avg.toFixed(1)} seconds.</li>
          {best !== null ? <li>Your best round on this device: {best} of {ROUND}.</li> : null}
          {hardest.length ? (
            <li>Patterns in the hands you missed most: {hardest.map(([n]) => n).join(", ")}.</li>
          ) : (
            <li>Nothing missed. Try it with a shorter fuse next time.</li>
          )}
        </ul>
      </QuizShell>
    );
  }

  // Attempts at this hand, the one just answered included.
  const attempts = results.filter((r) => r.seed === seed).length;
  const repeat = answer === null ? attempts > 0 : attempts > 1;
  const position = Math.min(ROUND, firstTries.length + (attempts === 0 ? 1 : 0));
  return (
    <QuizShell
      title="Faan drill"
      progress={`${position} of ${ROUND}${repeat ? " · again" : ""}`}
      onNext={answer !== null ? next : undefined}
    >
      <div className="drill__head">
        <p className="quiz__ask">
          You sit <strong>{SEAT_NAMES[hand!.example.seat ?? 0]}</strong>, {roundName(hand!.example.roundWind ?? "we")}{" "}
          round, {flowersText(hand!)}, won {hand!.example.selfDrawn ? "by self-draw" : "off a discard"}.
        </p>
        <label className="switch small">
          <input type="checkbox" checked={timed} onChange={(e) => setTimed(e.target.checked)} />
          <span>{SECONDS}-second clock</span>
        </label>
      </div>
      {timed && answer === null ? (
        <div className="drill__clock" role="timer" aria-label={`${left} seconds left`}>
          <span className="drill__bar" style={{ width: `${(left / SECONDS) * 100}%` }} />
          <span className="drill__secs" aria-hidden>
            {left}s
          </span>
        </div>
      ) : null}
      <ExampleTiles example={hand!.example} score={hand!.score} size="md" />
      <div className="quiz__choices" role="group" aria-label="Faan">
        {DRILL_CHOICES.map((n) => (
          <button
            key={n}
            type="button"
            className={[
              "btn drill__btn",
              answer !== null && n === truth ? "quiz__choice--right" : "",
              answer === n && n !== truth ? "quiz__choice--wrong" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            disabled={answer !== null && n !== answer && n !== truth}
            onClick={() => settle(n)}
          >
            {n === 10 ? "10+" : n}
          </button>
        ))}
      </div>
      {answer !== null ? (
        <>
          <Verdict right={answer === truth}>
            {answer === -1 ? "Out of time. " : ""}
            {`${hand!.score.faan} faan${hand!.score.limitReached ? ", paid at the limit" : ""}.`}
            {answer !== truth ? " It comes back in two hands." : ""}
          </Verdict>
          <Breakdown score={hand!.score} />
        </>
      ) : null}
    </QuizShell>
  );
}
