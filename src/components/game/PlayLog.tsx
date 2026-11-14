"use client";

import type { GameState } from "@/game/engine";
import { SEAT_NAMES, type Seat } from "@/game/tiles";

/** "East discards …" from the engine, said as "You discard …" when it was you. */
function line(text: string, seat: Seat | null, you: Seat, names?: string[]): string {
  if (seat === null) return text;
  const wind = SEAT_NAMES[seat];
  if (!text.startsWith(`${wind} `)) return text;
  const rest = text.slice(wind.length + 1);
  if (seat === you) return `You ${rest.replace(/^(\w+?)s\b/, "$1")}`;
  return `${names?.[seat] ?? wind} ${rest}`;
}

/** The last few moves at the table, newest first. */
export function PlayLog({ state, you, names }: { state: GameState; you: Seat; names?: string[] }) {
  const entries = state.log.slice(-6).reverse();
  return (
    <div className="playlog panel-block">
      <p className="coach__label">At the table</p>
      {entries.length === 0 ? <p className="muted small">Nothing played yet.</p> : null}
      <ol className="playlog__list" aria-live="polite">
        {entries.map((e, i) => (
          <li key={e.id} className={i === 0 ? "playlog__item playlog__item--new" : "playlog__item"}>
            {line(e.text, e.seat, you, names)}
          </li>
        ))}
      </ol>
    </div>
  );
}
