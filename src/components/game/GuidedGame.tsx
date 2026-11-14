"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { claimTurn, turnActions } from "@/game/engine";
import type { Tile } from "@/game/tiles";
import { tileName } from "@/game/tiles";
import {
  EXAMPLE_HAND,
  type HumanMove,
  YOU,
  applyMove,
  awaiting,
  opponentBeat,
  sameMove,
  startScenario,
} from "@/tutorial/guided";
import { TableView } from "./TableView";
import { HandResult } from "./HandResult";
import { PlayLog } from "./PlayLog";
import { PACE_MS } from "./pace";

const CLAIM_LABEL = { chow: "Chow 上", pung: "Pung 碰", kong: "Kong 槓", win: "Win 食糊" } as const;

function describe(move: HumanMove): string {
  switch (move.kind) {
    case "discard":
      return `throw the ${tileName(move.code)}`;
    case "claim":
      return move.type === "win" ? "win" : `call ${move.type}`;
    case "pass":
      return "pass";
    case "draw":
      return "draw";
    case "selfDraw":
      return "declare the win";
  }
}

/** One hand on the real engine, the other seats scripted, a coach saying what to do and why. */
export function GuidedGame() {
  const scenario = EXAMPLE_HAND;
  const [game, setGame] = useState(() => startScenario(scenario));
  const [step, setStep] = useState(0);
  const [started, setStarted] = useState(false);
  const [armed, setArmed] = useState<string | null>(null);
  const [hint, setHint] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [why, setWhy] = useState<string | null>(null);

  const waiting = awaiting(game);
  const expected = scenario.steps[step];

  // The other seats play on their own, a beat at a time, so each move can be followed.
  useEffect(() => {
    if (!started || waiting !== null) return;
    const timer = window.setTimeout(() => {
      const next = opponentBeat(game, scenario);
      if (next) setGame(next);
    }, PACE_MS);
    return () => window.clearTimeout(timer);
  }, [game, started, waiting, scenario]);

  const hintTileId = useMemo(() => {
    if (!hint || !expected || expected.expect.kind !== "discard") return null;
    const code = expected.expect.code;
    return game.players[YOU]!.hand.find((t) => t.code === code)?.id ?? null;
  }, [hint, expected, game]);

  const attempt = (move: HumanMove) => {
    if (!expected) return;
    if (!sameMove(move, expected.expect)) {
      const want = expected.expect;
      setFeedback(
        want.kind === "selfDraw" && move.kind === "discard"
          ? "Hold on — look at your hand. You do not need to discard: you can win."
          : want.kind === "discard" && move.kind === "discard"
            ? `The coach would throw the ${tileName(want.code)} here, not the ${tileName(move.code)}. Read the note above, or tap Show me.`
            : `Not this time: the coach would ${describe(want)} here, not ${describe(move)}. Read the note above.`,
      );
      setArmed(null);
      return;
    }
    const next = applyMove(game, move);
    if (!next) return;
    setGame(next);
    setWhy(expected.why);
    setFeedback(null);
    setHint(false);
    setArmed(null);
    setStep((s) => s + 1);
  };

  const onTile = (tile: Tile) => {
    if (waiting !== "turn") return;
    if (armed === tile.id) attempt({ kind: "discard", code: tile.code });
    else {
      setArmed(tile.id);
      setFeedback(null);
    }
  };

  const restart = () => {
    setGame(startScenario(scenario));
    setStep(0);
    setArmed(null);
    setHint(false);
    setFeedback(null);
    setWhy(null);
    setStarted(true);
  };

  const claim = waiting === "claim" ? claimTurn(game) : null;
  const claimTypes = claim ? [...new Set(claim.options.map((o) => o.type))] : [];
  const canWin = waiting === "turn" && turnActions(game, YOU).canWin;
  const armedTile = armed ? game.players[YOU]!.hand.find((t) => t.id === armed) : null;

  const actions =
    waiting === "draw" ? (
      <button type="button" className="btn btn--primary btn--lg" onClick={() => attempt({ kind: "draw" })}>
        Draw a tile
      </button>
    ) : waiting === "claim" ? (
      <>
        {claimTypes.map((type) => (
          <button
            key={type}
            type="button"
            className={type === "win" ? "btn btn--win btn--lg" : "btn btn--primary btn--lg"}
            onClick={() => attempt({ kind: "claim", type })}
          >
            {CLAIM_LABEL[type]}
          </button>
        ))}
        <button type="button" className="btn btn--lg" onClick={() => attempt({ kind: "pass" })}>
          Pass
        </button>
      </>
    ) : waiting === "turn" ? (
      <>
        {canWin ? (
          <button type="button" className="btn btn--win btn--lg" onClick={() => attempt({ kind: "selfDraw" })}>
            Win 自摸
          </button>
        ) : null}
        <button
          type="button"
          className="btn btn--lg"
          disabled={!armedTile}
          onClick={() => armedTile && attempt({ kind: "discard", code: armedTile.code })}
        >
          {armedTile ? `Discard ${tileName(armedTile.code)}` : "Pick a tile to discard"}
        </button>
      </>
    ) : null;

  return (
    <div className="game">
      <div className="game__table">
        <TableView
          state={game}
          you={YOU}
          reveal={waiting === "done"}
          names={["You", "South", "West", "North"]}
          canDiscard={started && waiting === "turn"}
          armedTileId={armed}
          hintTileId={hintTileId}
          onTile={onTile}
          actions={started ? actions : null}
        />
      </div>
      <aside className="game__coach" aria-label="Coach">
        {!started ? (
          <div className="coach panel-block">
            <p className="coach__label">Before you start</p>
            <p>{scenario.intro}</p>
            <p className="muted small">
              The other three players follow a script, so this hand goes the same way every time. Your moves go
              through the real game engine — it will only let you make legal ones.
            </p>
            <button type="button" className="btn btn--primary btn--lg" onClick={() => setStarted(true)}>
              Start the hand
            </button>
          </div>
        ) : waiting === "done" ? (
          <HandResult state={game} you={YOU} names={["You", "South", "West", "North"]}>
            <p>{scenario.outro}</p>
            <div className="actions">
              <Link href="/practice" className="btn btn--primary">
                Practice a full hand
              </Link>
              <Link href="/scoring" className="btn">
                How scoring works
              </Link>
              <button type="button" className="btn btn--ghost" onClick={restart}>
                Play it again
              </button>
            </div>
          </HandResult>
        ) : (
          <div className="coach panel-block">
            <p className="coach__label">
              Coach · step {Math.min(step + 1, scenario.steps.length)} of {scenario.steps.length}
            </p>
            {why ? (
              <p className="coach__why">
                <strong>✓ </strong>
                {why}
              </p>
            ) : null}
            {waiting === null ? (
              <p className="coach__watch" aria-live="polite">
                Watch the others play…
              </p>
            ) : expected ? (
              <>
                <p className="coach__say" aria-live="polite">
                  {expected.coach}
                </p>
                {expected.expect.kind === "discard" ? (
                  <button type="button" className="btn btn--sm btn--ghost" onClick={() => setHint(true)} disabled={hint}>
                    Show me
                  </button>
                ) : null}
              </>
            ) : null}
            {feedback ? (
              <p className="verdict verdict--wrong" role="alert">
                {feedback}
              </p>
            ) : null}
          </div>
        )}
      </aside>
      <div className="game__extra">
        <PlayLog state={game} you={YOU} names={["You", "South", "West", "North"]} />
      </div>
    </div>
  );
}
