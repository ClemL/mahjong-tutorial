"use client";

import type { ReactNode } from "react";
import type { GameState } from "@/game/engine";
import { SEAT_NAMES, type Seat, sortTiles } from "@/game/tiles";
import { faanValue } from "@/game/scoring";
import { TileFace } from "@/components/TileView";
import { MeldRow } from "./MeldRow";

/** The settled hand: who won, how, what it scored and who paid. */
export function HandResult({
  state,
  you,
  names,
  children,
}: {
  state: GameState;
  you: Seat;
  names?: string[];
  children?: ReactNode;
}) {
  const result = state.result;
  const nameOf = (seat: Seat) => names?.[seat] ?? SEAT_NAMES[seat];
  if (!result) return null;

  if (result.type === "washout") {
    return (
      <div className="result panel-block" role="status">
        <h3 className="result__title">Washout 流局</h3>
        <p className="muted">The wall ran out with nobody finished. Nobody pays, and the deal moves on.</p>
        {children}
      </div>
    );
  }

  const winner = result.winner!;
  const score = result.score!;
  const p = state.players[winner]!;
  return (
    <div className="result panel-block" role="status">
      <h3 className="result__title">
        {winner === you ? "You win" : `${nameOf(winner)} wins`} —{" "}
        {result.from === null ? "self-drawn 自摸" : `on ${result.from === you ? "your" : `${nameOf(result.from)}'s`} discard`}
      </h3>
      <div className="result__hand">
        {p.melds.map((m, i) => (
          <MeldRow key={i} meld={m} />
        ))}
        <span className="tile-row">
          {sortTiles(p.hand).map((t) => (
            <TileFace key={t.id} code={t.code} size="sm" />
          ))}
        </span>
        {p.flowers.length ? (
          <span className="tile-row">
            {p.flowers.map((t) => (
              <TileFace key={t.id} code={t.code} size="sm" />
            ))}
          </span>
        ) : null}
      </div>
      <table className="data-table result__table">
        <tbody>
          {score.patterns.map((pat, i) => (
            <tr key={`${pat.key}-${i}`}>
              <td>
                {pat.name} <span className="cjk muted">{pat.chinese}</span>
              </td>
              <td className="num">{pat.faan} faan</td>
            </tr>
          ))}
          <tr className="result__total">
            <td>
              Total{score.limitReached ? " (the limit)" : ""}
            </td>
            <td className="num">
              {score.scoredFaan} faan = {faanValue(score.faan, state.config)} pts
            </td>
          </tr>
        </tbody>
      </table>
      <ul className="result__pay">
        {result.payments.map((amount, seat) => (
          <li key={seat} className={amount > 0 ? "pay pay--up" : amount < 0 ? "pay pay--down" : "pay"}>
            <span>{seat === you ? "You" : nameOf(seat as Seat)}</span>
            <strong>{amount > 0 ? `+${amount}` : amount}</strong>
          </li>
        ))}
      </ul>
      {children}
    </div>
  );
}
