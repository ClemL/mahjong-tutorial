/**
 * Lay out an exact position on the real engine's table.
 *
 * Lessons, quizzes and the guided hand all need a particular deal rather than
 * a shuffled one. Building the GameState from tile codes, out of the same
 * 144-tile set the engine deals from, means every claim offered, every wait
 * and every score shown in the tutorial comes from the game's own rules code
 * and cannot drift from it.
 */
import { DEFAULT_RULES, type RuleConfig } from "@/game/rules";
import { type GameState } from "@/game/engine";
import { type Meld, type MeldType } from "@/game/melds";
import {
  type Seat,
  type Tile,
  type TileCode,
  WINDS,
  buildTileSet,
  isFlower,
  sortTiles,
} from "@/game/tiles";

export interface MeldSpec {
  type: MeldType;
  codes: TileCode[];
  /** Concealed kongs only; every other laid-down set was claimed. */
  concealed?: boolean;
  /** Whose discard completed it. Defaults to the seat on the owner's left. */
  from?: Seat;
}

export interface TableSpec {
  /** Concealed tiles, one list per seat (East, South, West, North). */
  hands: [TileCode[], TileCode[], TileCode[], TileCode[]];
  melds?: [MeldSpec[], MeldSpec[], MeldSpec[], MeldSpec[]];
  flowers?: [TileCode[], TileCode[], TileCode[], TileCode[]];
  discards?: [TileCode[], TileCode[], TileCode[], TileCode[]];
  /** The front of the wall, in the order it will be drawn. */
  draws?: TileCode[];
  dealer?: Seat;
  turn?: Seat;
  roundWind?: TileCode;
  /** A tile in the turn player's hand marked as the one just drawn. */
  drawn?: TileCode | null;
  humanSeat?: Seat;
  config?: RuleConfig;
}

/** Hands out physical tiles by code, so no tile is ever in two places. */
export class TilePool {
  private readonly left: Tile[];

  constructor(withFlowers = true) {
    this.left = buildTileSet(withFlowers);
  }

  take(code: TileCode): Tile {
    const index = this.left.findIndex((t) => t.code === code);
    if (index < 0) throw new Error(`No ${code} left in the set`);
    return this.left.splice(index, 1)[0]!;
  }

  takeAll(codes: TileCode[]): Tile[] {
    return codes.map((c) => this.take(c));
  }

  rest(): Tile[] {
    return [...this.left];
  }
}

function previousSeat(seat: Seat): Seat {
  return ((seat + 3) % 4) as Seat;
}

export function buildTable(spec: TableSpec): GameState {
  const config = spec.config ?? DEFAULT_RULES;
  const pool = new TilePool(config.flowers !== false);
  const humanSeat = spec.humanSeat ?? 0;
  const seats: Seat[] = [0, 1, 2, 3];

  const players = seats.map((seat) => {
    const melds: Meld[] = (spec.melds?.[seat] ?? []).map((m) => {
      const tiles = pool.takeAll(m.codes);
      const concealed = m.concealed ?? false;
      const from = concealed ? undefined : (m.from ?? previousSeat(seat));
      return {
        type: m.type,
        tiles,
        concealed,
        ...(from === undefined ? {} : { claimedFrom: from, claimedTileId: tiles[tiles.length - 1]!.id }),
      };
    });
    return {
      seat,
      hand: sortTiles(pool.takeAll(spec.hands[seat])),
      melds,
      flowers: pool.takeAll(spec.flowers?.[seat] ?? []),
      discards: pool.takeAll(spec.discards?.[seat] ?? []),
      taken: [],
      isHuman: seat === humanSeat,
    };
  });

  // The scripted draws go first. Of the rest, bonus tiles sit in the middle of
  // the wall, so neither an ordinary draw nor a replacement from the back meets
  // one before a lesson is over.
  const front = pool.takeAll(spec.draws ?? []);
  const rest = pool.rest();
  const plain = rest.filter((t) => !isFlower(t.code));
  const bonus = rest.filter((t) => isFlower(t.code));
  const half = Math.floor(plain.length / 2);
  const wall = [...front, ...plain.slice(0, half), ...bonus, ...plain.slice(half)];

  const turn = spec.turn ?? spec.dealer ?? 0;
  const drawnTile = spec.drawn ? players[turn]!.hand.find((t) => t.code === spec.drawn) : undefined;
  if (spec.drawn && !drawnTile) throw new Error(`Seat ${turn} does not hold ${spec.drawn}`);

  return {
    config,
    rngSeed: 1,
    players,
    wall,
    dealer: spec.dealer ?? 0,
    roundWind: spec.roundWind ?? WINDS[0]!,
    dealership: 0,
    handNumber: 1,
    turn,
    phase: "action",
    drawnTileId: drawnTile?.id ?? null,
    drawWasReplacement: false,
    lastTileInPlay: false,
    lastDiscard: null,
    pendingClaims: [],
    robbingKongTile: null,
    scores: [0, 0, 0, 0],
    result: null,
    history: [],
    log: [],
    logSeq: 0,
  };
}

/** Every tile in the state, wherever it is — for checking that a built table holds exactly one set. */
export function allTiles(state: GameState): Tile[] {
  return [
    ...state.wall,
    ...state.players.flatMap((p) => [...p.hand, ...p.melds.flatMap((m) => m.tiles), ...p.flowers, ...p.discards]),
  ];
}
