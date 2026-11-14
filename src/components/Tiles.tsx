import type { TileCode } from "@/game/tiles";
import { TileBack, TileFace, type TileSize } from "./TileView";

/** A plain row of tiles. "back" draws a face-down tile. */
export function TileRow({
  codes,
  size = "md",
  label,
  className = "",
  mark,
}: {
  codes: (TileCode | "back")[];
  size?: TileSize;
  label?: string;
  className?: string;
  /** Index of one tile to ring — the winning tile, say. */
  mark?: number;
}) {
  return (
    <span className={`tile-row ${className}`} role={label ? "img" : undefined} aria-label={label}>
      {codes.map((c, i) =>
        c === "back" ? (
          <TileBack key={i} size={size} />
        ) : (
          <TileFace key={i} code={c} size={size} className={i === mark ? "tile--marked" : ""} />
        ),
      )}
    </span>
  );
}

/** Tiles in groups with a gap between each: a hand laid out as its sets. */
export function TileGroups({
  groups,
  size = "md",
  className = "",
  caption,
}: {
  groups: (TileCode | "back")[][];
  size?: TileSize;
  className?: string;
  caption?: string;
}) {
  return (
    <figure className={`tile-groups ${className}`}>
      <span className="tile-groups__sets">
        {groups.map((g, i) => (
          <TileRow key={i} codes={g} size={size} />
        ))}
      </span>
      {caption ? <figcaption className="tile-groups__caption">{caption}</figcaption> : null}
    </figure>
  );
}
