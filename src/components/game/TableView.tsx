"use client";

import type { ReactNode } from "react";
import type { GameState, PlayerState } from "@/game/engine";
import { claimTurn, liveTiles } from "@/game/engine";
import { SEAT_NAMES, type Seat, type Tile, roundName, sortTiles, tileGlyph, tileName, seatWind } from "@/game/tiles";
import { MeldRow } from "./MeldRow";
import { TileBack, TileButton, TileFace } from "@/components/TileView";

/** Where each other seat sits, seen from yours. */
const POSITION: Record<number, string> = { 1: "on your right", 2: "opposite", 3: "on your left" };

function relative(seat: Seat, you: Seat): 1 | 2 | 3 {
  return ((((seat - you) % 4) + 4) % 4) as 1 | 2 | 3;
}

interface Props {
  state: GameState;
  you: Seat;
  /** Show every hand face up — once the hand is over. */
  reveal?: boolean;
  /** A tile in your hand the coach is pointing at. */
  hintTileId?: string | null;
  /** The tile you have picked up to throw. */
  armedTileId?: string | null;
  canDiscard: boolean;
  onTile?: (tile: Tile) => void;
  /** Buttons under your hand: draw, claim, win, pass. */
  actions?: ReactNode;
  names?: string[];
}

function Pond({ player, lastId }: { player: PlayerState; lastId: string | null }) {
  if (player.discards.length === 0) return <div className="tv-pond tv-pond--empty">No discards yet</div>;
  return (
    <div className="tv-pond" aria-label={`${SEAT_NAMES[player.seat]}'s discards`}>
      {player.discards.map((t) => (
        <TileFace key={t.id} code={t.code} size="sm" justDiscarded={t.id === lastId} />
      ))}
    </div>
  );
}

function Laid({ player }: { player: PlayerState }) {
  if (player.melds.length === 0 && player.flowers.length === 0) return null;
  return (
    <div className="tv-laid">
      {player.melds.map((m, i) => (
        <MeldRow key={i} meld={m} />
      ))}
      {player.flowers.length > 0 ? (
        <span className="tv-flowers" aria-label="Bonus tiles">
          {player.flowers.map((t) => (
            <TileFace key={t.id} code={t.code} size="sm" />
          ))}
        </span>
      ) : null}
    </div>
  );
}

export function TableView({ state, you, reveal, hintTileId, armedTileId, canDiscard, onTile, actions, names }: Props) {
  const lastId = state.lastDiscard?.tile.id ?? null;
  const others = ([3, 2, 1] as const).map((step) => ((you + step) % 4) as Seat);
  const me = state.players[you]!;
  const drawn = me.hand.find((t) => t.id === state.drawnTileId) ?? null;
  const held = sortTiles(me.hand.filter((t) => t.id !== drawn?.id));
  const nameOf = (seat: Seat) => names?.[seat] ?? SEAT_NAMES[seat];
  // Whose move it is: the player in turn until they throw, then whoever is being asked about the tile.
  const asked = state.phase === "claiming" ? (claimTurn(state)?.seat ?? null) : null;
  const moving = (seat: Seat) =>
    asked !== null ? asked === seat : state.phase === "action" && state.turn === seat && state.lastDiscard === null;
  const myTurn = moving(you);

  return (
    <div className="tv">
      <div className="tv__others">
        {others.map((seat) => {
          const p = state.players[seat]!;
          const active = moving(seat);
          return (
            <section
              key={seat}
              className={[`tv-seat tv-seat--${relative(seat, you)}`, active ? "tv-seat--active" : ""].join(" ")}
              aria-label={`${nameOf(seat)}, ${POSITION[relative(seat, you)]}`}
            >
              <header className="tv-seat__head">
                <span className="tv-wind" aria-hidden>
                  {tileGlyph(seatWind(seat))}
                </span>
                <span className="tv-seat__name">{nameOf(seat)}</span>
                <span className="tv-seat__where">{POSITION[relative(seat, you)]}</span>
                {state.dealer === seat ? <span className="tv-badge">Dealer</span> : null}
                {active ? <span className="tv-badge tv-badge--turn">{asked === seat ? "Deciding" : "Playing"}</span> : null}
              </header>
              <div
                className={reveal ? "tv-seat__hand tv-seat__hand--open" : "tv-seat__hand"}
                aria-label={reveal ? "Hand" : `${p.hand.length} tiles in hand`}
              >
                {reveal
                  ? sortTiles(p.hand).map((t) => <TileFace key={t.id} code={t.code} size="sm" />)
                  : p.hand.map((t) => <TileBack key={t.id} size="sm" />)}
              </div>
              <Laid player={p} />
              <Pond player={p} lastId={lastId} />
            </section>
          );
        })}
      </div>

      <div className="tv__center" aria-live="polite">
        <span>
          {roundName(state.roundWind)} round · {liveTiles(state)} tiles left in the wall
        </span>
        {state.lastDiscard ? (
          <span className="tv__thrown">
            {nameOf(state.lastDiscard.from)} threw <TileFace code={state.lastDiscard.tile.code} size="md" justDiscarded />
            <span className="sr-only">{tileName(state.lastDiscard.tile.code)}</span>
          </span>
        ) : null}
      </div>

      <section className={myTurn ? "tv-you tv-you--active" : "tv-you"} aria-label="You">
        <header className="tv-seat__head">
          <span className="tv-wind" aria-hidden>
            {tileGlyph(seatWind(you))}
          </span>
          <span className="tv-seat__name">{nameOf(you)}</span>
          <span className="tv-seat__where">your seat</span>
          {state.dealer === you ? <span className="tv-badge">Dealer</span> : null}
          {myTurn ? <span className="tv-badge tv-badge--turn">{asked === you ? "Your call" : "Your turn"}</span> : null}
        </header>
        <Laid player={me} />
        <Pond player={me} lastId={lastId} />
        <div className="tv-hand" role="group" aria-label="Your hand">
          {held.map((t) => (
            <HandTile key={t.id} tile={t} {...{ hintTileId, armedTileId, canDiscard, onTile }} />
          ))}
          {drawn ? (
            <span className="tv-hand__drawn">
              <HandTile tile={drawn} drawn {...{ hintTileId, armedTileId, canDiscard, onTile }} />
            </span>
          ) : null}
        </div>
        {actions ? <div className="tv-actions">{actions}</div> : null}
      </section>
    </div>
  );
}

function HandTile({
  tile,
  drawn,
  hintTileId,
  armedTileId,
  canDiscard,
  onTile,
}: {
  tile: Tile;
  drawn?: boolean;
  hintTileId?: string | null;
  armedTileId?: string | null;
  canDiscard: boolean;
  onTile?: (tile: Tile) => void;
}) {
  const armed = armedTileId === tile.id;
  return (
    <TileButton
      code={tile.code}
      size="lg"
      drawn={drawn}
      className={[armed ? "tile--picked" : "", hintTileId === tile.id ? "tile--hint" : ""].filter(Boolean).join(" ")}
      inactive={!canDiscard}
      ariaLabel={
        canDiscard
          ? armed
            ? `Discard ${tileName(tile.code)} — tap again to throw it`
            : `Pick ${tileName(tile.code)} to discard`
          : tileName(tile.code)
      }
      onClick={() => canDiscard && onTile?.(tile)}
    />
  );
}
