import type { RouteRow } from "@/tutorial/routes";

/** A long label that gives way to a short one on a narrow screen, or always when compact. */
function Label({ long, short, compact }: { long: string; short: string; compact: boolean }) {
  if (compact) return <>{short}</>;
  return (
    <>
      <span className="routes__long">{long}</span>
      <span className="routes__short" aria-hidden>
        {short}
      </span>
    </>
  );
}

function fromReady(shanten: number): string {
  if (shanten < 0) return "complete";
  if (shanten === 0) return "ready";
  return String(shanten);
}

/** A hand's routes to a win: how far each is, what it pays, and whether that clears the minimum. */
export function RoutesTable({
  rows,
  minFaan,
  caption,
  compact = false,
}: {
  rows: RouteRow[];
  minFaan: number;
  caption?: string;
  /** Short headings and a star for the route to play for, to fit a narrow column. */
  compact?: boolean;
}) {
  return (
    <div className={compact ? "table-scroll routes routes--compact" : "table-scroll routes"}>
      <table className="data-table routes__table">
        {caption ? <caption className="routes__caption">{caption}</caption> : null}
        <thead>
          <tr>
            <th>Route</th>
            <th className="num">
              <Label long="Tiles from ready" short="Away" compact={compact} />
            </th>
            <th className="num">
              <Label long="Faan, about" short="Faan" compact={compact} />
            </th>
            <th>
              <Label long={`Wins at ${minFaan} faan?`} short={`≥ ${minFaan}?`} compact={compact} />
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} className={r.best ? "routes__row routes__row--best" : "routes__row"}>
              <td>
                {r.label}
                {r.best ? (
                  <>
                    <span className={compact ? "routes__star routes__star--on" : "routes__star"} aria-hidden>
                      {" "}
                      ★
                    </span>
                    {compact ? <span className="sr-only">, play for this</span> : <span className="routes__badge">Play for this</span>}
                  </>
                ) : null}
              </td>
              <td className="num">{fromReady(r.shanten)}</td>
              <td className="num">{r.faan}</td>
              <td className={r.declarable ? "routes__yes" : "routes__no"}>
                {r.declarable ? "✓" : "✗"} <Label long={r.declarable ? "Yes" : "No"} short="" compact={compact} />
                {compact ? <span className="sr-only">{r.declarable ? "yes" : "no"}</span> : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
