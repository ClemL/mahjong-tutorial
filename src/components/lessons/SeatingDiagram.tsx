import { TileFace } from "@/components/TileView";

const SEATS = [
  { area: "bottom", code: "we", name: "East", note: "You — the dealer" },
  { area: "right", code: "ws", name: "South", note: "On your right: plays next" },
  { area: "top", code: "ww", name: "West", note: "Opposite you" },
  { area: "left", code: "wn", name: "North", note: "On your left: plays just before you" },
] as const;

/**
 * The table seen from East's chair. Play runs East → South → West → North,
 * which at a real table is anticlockwise: the next player is always on your
 * right, so the one before you — whose discards you may chow — is on your left.
 */
export function SeatingDiagram() {
  return (
    <figure className="seating" aria-label="Seating: East at the bottom, South on the right, West at the top, North on the left. Play passes anticlockwise.">
      <div className="seating__table">
        {SEATS.map((s, i) => (
          <div key={s.area} className={`seating__seat seating__seat--${s.area}`}>
            <TileFace code={s.code} size="md" />
            <span className="seating__name">
              {i + 1}. {s.name}
            </span>
            <span className="seating__note">{s.note}</span>
          </div>
        ))}
        <div className="seating__felt" aria-hidden>
          <svg viewBox="0 0 100 100" className="seating__arrows">
            <defs>
              <marker id="arrowhead" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M0 0 L10 5 L0 10 z" fill="currentColor" />
              </marker>
            </defs>
            <path d="M58 82 A34 34 0 0 0 82 58" markerEnd="url(#arrowhead)" />
            <path d="M82 42 A34 34 0 0 0 58 18" markerEnd="url(#arrowhead)" />
            <path d="M42 18 A34 34 0 0 0 18 42" markerEnd="url(#arrowhead)" />
            <path d="M18 58 A34 34 0 0 0 42 82" markerEnd="url(#arrowhead)" />
          </svg>
          <span className="seating__wall">wall</span>
        </div>
      </div>
      <figcaption className="tile-groups__caption">
        Seen from your chair. Turns pass to the right — anticlockwise round the table.
      </figcaption>
    </figure>
  );
}
