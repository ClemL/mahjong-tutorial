"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { type Difficulty, strategyFor } from "@/game/ai";
import { needsTurnAdvance, stepTable } from "@/game/controller";
import {
  type ClaimOption,
  type GameState,
  answerClaim,
  claimTurn,
  createGame,
  declareAddedKong,
  declareConcealedKong,
  declareSelfDraw,
  discard,
  nextHand,
  setMinFaan,
  turnActions,
} from "@/game/engine";
import { createRng } from "@/game/rng";
import { DEFAULT_RULES } from "@/game/rules";
import { type Seat, type Tile, tileName } from "@/game/tiles";
import { Choice } from "@/components/Choice";
import { TileFace } from "@/components/TileView";
import { adviseClaim, adviseDiscard, stepsText, turnShanten, waitsFor, standingShanten } from "@/tutorial/coach";
import { HandResult } from "./HandResult";
import { PlayLog } from "./PlayLog";
import { TableView } from "./TableView";
import { PACE_MS } from "./pace";

const YOU: Seat = 0;
const NAMES = ["You", "South", "West", "North"];

type Waiting = "turn" | "claim" | "done" | null;

function waitingOn(state: GameState): Waiting {
  if (state.phase === "handOver" || state.phase === "gameOver") return "done";
  if (state.phase === "claiming") return claimTurn(state)?.seat === YOU ? "claim" : null;
  if (state.phase === "action" && state.turn === YOU && state.lastDiscard === null && !needsTurnAdvance(state)) return "turn";
  return null;
}

function claimLabel(option: ClaimOption): string {
  switch (option.type) {
    case "win":
      return `Win 食糊 · ${option.score?.faan ?? 0} faan`;
    case "chow":
      return `Chow ${option.codes.map((c) => c[1]).join("-")}`;
    case "pung":
      return "Pung 碰";
    case "kong":
      return "Kong 槓";
  }
}

const LEVELS = [
  { value: "easy", label: "Easy", hint: "Slips up now and then, and claims too eagerly" },
  { value: "normal", label: "Normal", hint: "The game's default computer player" },
  { value: "hard", label: "Hard", hint: "Plays for what a hand is worth, not just speed" },
] as const;

const MINIMUMS = [
  { value: "0", label: "0 faan", hint: "Any complete hand wins, chicken hands included" },
  { value: "1", label: "1 faan", hint: "The app's default" },
  { value: "3", label: "3 faan", hint: "The Hong Kong standard — harder" },
] as const;

/** Whole hands on the real engine against the game's own computer players, with an optional coach. */
export function PracticeGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [minFaan, setMin] = useState<string>(String(DEFAULT_RULES.minFaan));
  const [coach, setCoach] = useState(true);
  const [game, setGame] = useState<GameState | null>(null);
  const [armed, setArmed] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const rng = useRef(createRng(1));

  // Dealt on the client only: a seeded deal on the server would be the same hand for everyone.
  useEffect(() => {
    const seed = Math.floor(Math.random() * 0xffffffff);
    rng.current = createRng(seed);
    setGame(createGame({ seed, config: { ...DEFAULT_RULES, minFaan: Number(minFaan) } }));
    // Only on first load; later changes go through the controls below.
  }, []);

  const waiting = game ? waitingOn(game) : null;

  useEffect(() => {
    if (!game || waiting !== null) return;
    const timer = window.setTimeout(() => {
      setGame((g) => (g ? stepTable(g, rng.current, strategyFor(difficulty)) : g));
    }, PACE_MS);
    return () => window.clearTimeout(timer);
  }, [game, waiting, difficulty]);

  useEffect(() => {
    setArmed(null);
    setShowHint(false);
  }, [game?.logSeq]);

  const advice = useMemo(() => (game && coach && waiting === "turn" ? adviseDiscard(game, YOU) : null), [game, coach, waiting]);
  const claim = useMemo(() => (game && waiting === "claim" ? claimTurn(game) : null), [game, waiting]);
  const claimAdvice = useMemo(
    () => (game && coach && claim ? adviseClaim(game, YOU, claim.options) : undefined),
    [game, coach, claim],
  );

  if (!game) return <div className="game game--loading panel-block">Shuffling the tiles…</div>;

  const act = (next: GameState) => {
    setGame(next);
    setArmed(null);
  };

  const onTile = (tile: Tile) => {
    if (waiting !== "turn") return;
    if (armed === tile.id) act(discard(game, YOU, tile.id));
    else setArmed(tile.id);
  };

  const newGame = () => {
    const seed = Math.floor(Math.random() * 0xffffffff);
    rng.current = createRng(seed);
    act(createGame({ seed, config: { ...DEFAULT_RULES, minFaan: Number(minFaan) } }));
  };

  const turn = waiting === "turn" ? turnActions(game, YOU) : null;
  const armedTile = armed ? game.players[YOU]!.hand.find((t) => t.id === armed) : null;

  const actions =
    waiting === "turn" && turn ? (
      <>
        {turn.canWin ? (
          <button type="button" className="btn btn--win btn--lg" onClick={() => act(declareSelfDraw(game, YOU))}>
            Win 自摸 · {turn.winScore?.faan} faan
          </button>
        ) : null}
        {turn.kongs.map((k) => (
          <button
            key={`${k.kind}-${k.code}`}
            type="button"
            className="btn btn--primary btn--lg"
            onClick={() =>
              act(k.kind === "concealed" ? declareConcealedKong(game, YOU, k.code) : declareAddedKong(game, YOU, k.code))
            }
          >
            Kong {tileName(k.code)}
          </button>
        ))}
        <button
          type="button"
          className="btn btn--lg"
          disabled={!armedTile}
          onClick={() => armedTile && act(discard(game, YOU, armedTile.id))}
        >
          {armedTile ? `Discard ${tileName(armedTile.code)}` : "Pick a tile to discard"}
        </button>
      </>
    ) : waiting === "claim" && claim ? (
      <>
        {claim.options.map((o) => (
          <button
            key={o.id}
            type="button"
            className={o.type === "win" ? "btn btn--win btn--lg" : "btn btn--primary btn--lg"}
            onClick={() => act(answerClaim(game, YOU, o.id))}
          >
            {claimLabel(o)}
          </button>
        ))}
        <button type="button" className="btn btn--lg" onClick={() => act(answerClaim(game, YOU, null))}>
          Pass
        </button>
      </>
    ) : null;

  const standing = waitsFor(game, YOU);

  return (
    <div className="game">
      <div className="game__table">
        <TableView
          state={game}
          you={YOU}
          names={NAMES}
          reveal={waiting === "done"}
          canDiscard={waiting === "turn"}
          armedTileId={armed}
          hintTileId={showHint ? (advice?.tile.id ?? null) : null}
          onTile={onTile}
          actions={actions}
        />
      </div>
      <aside className="game__coach" aria-label="Coach and settings">
        {waiting === "done" ? (
          <HandResult state={game} you={YOU} names={NAMES}>
            <p className="muted small">
              Running score: {game.scores.map((s, i) => `${NAMES[i]} ${s > 0 ? "+" : ""}${s}`).join(" · ")}
            </p>
            <div className="actions">
              {game.phase === "handOver" ? (
                <button type="button" className="btn btn--primary" onClick={() => act(nextHand(game))}>
                  Next hand
                </button>
              ) : null}
              <button type="button" className="btn" onClick={newGame}>
                New game
              </button>
            </div>
          </HandResult>
        ) : coach ? (
          <div className="coach panel-block" aria-live="polite">
            <p className="coach__label">Coach</p>
            {waiting === "turn" ? (
              <>
                <p className="coach__say">
                  {turn?.canWin ? "You can win — tap Win! " : ""}
                  {stepsText(turnShanten(game, YOU))}
                </p>
                {advice ? (
                  showHint ? (
                    <p>
                      The computer&apos;s Normal player would throw the <strong>{tileName(advice.tile.code)}</strong>
                      {advice.shanten === 0
                        ? ", leaving you ready."
                        : `, leaving ${advice.improving} unseen tiles that would bring you closer.`}
                    </p>
                  ) : (
                    <button type="button" className="btn btn--sm" onClick={() => setShowHint(true)}>
                      Suggest a discard
                    </button>
                  )
                ) : null}
              </>
            ) : waiting === "claim" && claim ? (
              <p className="coach__say">
                {game.lastDiscard ? `${NAMES[game.lastDiscard.from]} threw the ${tileName(game.lastDiscard.tile.code)}. ` : ""}
                {claimAdvice ? (
                  <>
                    The coach would take it: <strong>{claimLabel(claimAdvice)}</strong>.
                  </>
                ) : (
                  <>The coach would pass: the claim does not bring a hand worth declaring any closer.</>
                )}
              </p>
            ) : (
              <p className="coach__watch">{stepsText(standingShanten(game, YOU))}</p>
            )}
            {standing.length > 0 && waiting !== "turn" ? (
              <div className="coach__waits">
                <span className="small muted">Waiting on</span>
                {standing.map((w) => (
                  <span key={w.code} className="coach__wait">
                    <TileFace code={w.code} size="sm" />
                    <span className="small">{w.left} left</span>
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </aside>
      <div className="game__extra">
        <div className="panel-block game__settings">
          <Choice
            label="Computer players"
            options={LEVELS.map((l) => ({ ...l }))}
            value={difficulty}
            onChange={(v) => setDifficulty(v as Difficulty)}
          />
          <Choice
            label="Minimum to win"
            options={MINIMUMS.map((m) => ({ ...m }))}
            value={minFaan}
            onChange={(v) => {
              setMin(v);
              setGame((g) => (g ? setMinFaan(g, Number(v)) : g));
            }}
          />
          <label className="switch">
            <input type="checkbox" checked={coach} onChange={(e) => setCoach(e.target.checked)} />
            <span>Coach</span>
          </label>
          <button type="button" className="btn btn--sm btn--ghost" onClick={newGame}>
            Deal a new game
          </button>
        </div>
        <PlayLog state={game} you={YOU} names={NAMES} />
      </div>
    </div>
  );
}
