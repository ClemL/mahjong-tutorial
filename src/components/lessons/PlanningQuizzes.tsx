"use client";

import { useMemo, useState } from "react";
import { SEAT_NAMES, type Seat, type TileCode, compareCodes, flowerOwner, roundName, tileName } from "@/game/tiles";
import {
  DECLARE_PUZZLES,
  SPEED_PUZZLES,
  THREE_FAAN,
  routesAfter,
  speedAnswer,
  speedOnly,
  winningTiles,
} from "@/tutorial/planning";
import { TileButton } from "@/components/TileView";
import { TileRow } from "@/components/Tiles";
import { QuizShell, Verdict } from "./QuizShell";
import { RoutesTable } from "./RoutesTable";

function flowerNote(seat: Seat, flowers: TileCode[]): string {
  if (flowers.length === 0) return "no flowers";
  const own = flowers.filter((f) => flowerOwner(f) === seat);
  return own.length ? "your own flower" : "a flower that is not yours";
}

function Context({ seat, roundWind, flowers }: { seat: Seat; roundWind: TileCode; flowers: TileCode[] }) {
  return (
    <p className="quiz__ask">
      A <strong>3-faan</strong> table. You sit <strong>{SEAT_NAMES[seat]}</strong> in the{" "}
      <strong>{roundName(roundWind)}</strong> round, with {flowerNote(seat, flowers)}, and nothing claimed yet.
    </p>
  );
}

/** Fourteen tiles at a 3-faan table: the quickest discard, or the one that keeps a hand worth declaring? */
export function SpeedValueQuiz() {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<TileCode | null>(null);
  const p = SPEED_PUZZLES[index]!;
  const answer = useMemo(() => speedAnswer(p), [p]);
  const trap = useMemo(() => speedOnly(p).filter((c) => !answer.includes(c)), [p, answer]);
  const rows = useMemo(() => (picked ? routesAfter(p, picked) : null), [p, picked]);
  const last = index === SPEED_PUZZLES.length - 1;
  const hand = [...p.hand].sort(compareCodes);

  return (
    <QuizShell
      title="Speed or value?"
      progress={`${index + 1} of ${SPEED_PUZZLES.length}`}
      onNext={picked && !last ? () => (setIndex(index + 1), setPicked(null)) : undefined}
      onRestart={picked && last ? () => (setIndex(0), setPicked(null)) : undefined}
    >
      <Context seat={p.seat} roundWind={p.roundWind} flowers={p.flowers} />
      <p className="quiz__ask">Tap the tile you would throw. You will see every route the hand has left.</p>
      <div className="sorter__hand">
        {hand.map((code, i) => (
          <TileButton
            key={`${code}-${i}`}
            code={code}
            size="md"
            className={picked ? (answer.includes(code) ? "discardq__tile--best" : code === picked ? "discardq__tile--wrong" : "") : ""}
            ariaLabel={`Throw ${tileName(code)}`}
            disabled={picked !== null}
            onClick={() => setPicked(code)}
          />
        ))}
      </div>
      {picked ? (
        <>
          <Verdict right={answer.includes(picked)}>
            {answer.includes(picked) || trap.includes(picked) ? "" : `The best: ${answer.map(tileName).join(" or ")}. `}
            {p.explain}
          </Verdict>
          {rows ? <RoutesTable rows={rows} minFaan={THREE_FAAN.minFaan} caption={`After throwing the ${tileName(picked)}`} /> : null}
        </>
      ) : null}
    </QuizShell>
  );
}

/** A ready hand at a 3-faan table: which of its winning tiles may it actually win on? */
export function DeclareQuiz() {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<(TileCode | "none")[]>([]);
  const [checked, setChecked] = useState(false);
  const p = DECLARE_PUZZLES[index]!;
  const tiles = useMemo(() => winningTiles(p), [p]);
  const truth: (TileCode | "none")[] = tiles.filter((t) => t.declarable).map((t) => t.code);
  if (truth.length === 0) truth.push("none");
  const right = checked && picked.length === truth.length && truth.every((t) => picked.includes(t));
  const last = index === DECLARE_PUZZLES.length - 1;

  const toggle = (v: TileCode | "none") => {
    if (checked) return;
    setPicked((cur) => {
      if (v === "none") return cur.includes("none") ? [] : ["none"];
      const rest = cur.filter((x) => x !== "none");
      return rest.includes(v) ? rest.filter((x) => x !== v) : [...rest, v];
    });
  };
  const go = (n: number) => {
    setIndex(n);
    setPicked([]);
    setChecked(false);
  };

  return (
    <QuizShell
      title="Which winning tiles can you declare?"
      progress={`${index + 1} of ${DECLARE_PUZZLES.length}`}
      onNext={checked && !last ? () => go(index + 1) : undefined}
      onRestart={checked && last ? () => go(0) : undefined}
    >
      <p className="quiz__ask">
        A <strong>3-faan</strong> table. You sit <strong>{SEAT_NAMES[p.seat]}</strong> in the{" "}
        <strong>{roundName(p.roundWind)}</strong> round, with {flowerNote(p.seat, p.flowers)}. Your hand is ready.
      </p>
      <div className="quiz__stage quiz__stage--split">
        {p.melds?.length ? (
          <span className="example__part">
            <span className="example__tag">Claimed</span>
            <span className="example__sets">
              {p.melds.map((m, i) => (
                <TileRow key={i} codes={m.codes} size="md" className="example__meld" />
              ))}
            </span>
          </span>
        ) : null}
        <span className="example__part">
          <span className="example__tag">In hand</span>
          <TileRow codes={[...p.hand].sort(compareCodes)} size="md" />
        </span>
      </div>
      <p className="quiz__ask">It wins on any of these. Tick the ones you could declare if someone threw them.</p>
      <div className="quiz__choices" role="group" aria-label="Winning tiles">
        {tiles.map((t) => {
          const on = picked.includes(t.code);
          const verdict = checked ? (t.declarable ? "quiz__choice--right" : on ? "quiz__choice--wrong" : "") : "";
          return (
            <button
              key={t.code}
              type="button"
              className={["btn declareq__tile", on && !checked ? "btn--on" : "", verdict].filter(Boolean).join(" ")}
              aria-pressed={on}
              aria-label={tileName(t.code)}
              onClick={() => toggle(t.code)}
            >
              <TileRow codes={[t.code]} size="sm" />
              {checked ? <span className="small">{t.faan} faan</span> : null}
            </button>
          );
        })}
        <button
          type="button"
          className={[
            "btn",
            picked.includes("none") && !checked ? "btn--on" : "",
            checked ? (truth.includes("none") ? "quiz__choice--right" : picked.includes("none") ? "quiz__choice--wrong" : "") : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-pressed={picked.includes("none")}
          onClick={() => toggle("none")}
        >
          None of them
        </button>
      </div>
      {!checked ? (
        <div className="actions">
          <button type="button" className="btn btn--primary" disabled={picked.length === 0} onClick={() => setChecked(true)}>
            Check
          </button>
        </div>
      ) : (
        <>
          <Verdict right={right}>{p.explain}</Verdict>
          <table className="data-table declareq__table">
            <thead>
              <tr>
                <th>Winning tile</th>
                <th className="num">Off a discard</th>
                <th className="num">Self-drawn</th>
              </tr>
            </thead>
            <tbody>
              {tiles.map((t) => (
                <tr key={t.code}>
                  <td>{tileName(t.code)}</td>
                  <td className="num">
                    {t.faan} faan {t.declarable ? "✓" : "✗"}
                  </td>
                  <td className="num">
                    {t.selfDrawnFaan} faan {t.selfDrawnFaan >= THREE_FAAN.minFaan ? "✓" : "✗"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </QuizShell>
  );
}
