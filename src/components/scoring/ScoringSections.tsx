import { DEFAULT_RULES, MIN_FAAN_CHOICES, halfShare } from "@/game/rules";
import { faanValue } from "@/game/scoring";
import { tileName } from "@/game/tiles";
import { PATTERNS, TIERS, TWO_READINGS, type Tier, readings, scoreExample } from "@/tutorial/scoring";
import { TileRow } from "@/components/Tiles";
import { Breakdown, ExampleTiles } from "./ExampleTiles";

/** Faan to points, and what each player pays, from the rules the app plays. */
export function PayoutTable() {
  const rows = Array.from({ length: DEFAULT_RULES.limitFaan + 1 }, (_, faan) => faan);
  return (
    <div className="table-scroll">
      <table className="data-table payout">
        <thead>
          <tr>
            <th className="num">Faan</th>
            <th className="num">Hand worth</th>
            <th className="num">Self-draw: you collect</th>
            <th className="num">Off a discard: you collect</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((faan) => {
            const v = faanValue(faan, DEFAULT_RULES);
            return (
              <tr key={faan} className={faan === DEFAULT_RULES.limitFaan ? "payout__limit" : undefined}>
                <td className="num">
                  {faan}
                  {faan === DEFAULT_RULES.limitFaan ? "+" : ""}
                </td>
                <td className="num">{v}</td>
                <td className="num">
                  {v * 3} <span className="muted small">(3 × {v})</span>
                </td>
                <td className="num">
                  {v + 2 * halfShare(v)}{" "}
                  <span className="muted small">
                    ({v} + 2 × {halfShare(v)})
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function MinimumChoices() {
  return (
    <span>
      {MIN_FAAN_CHOICES.map((n, i) => (
        <span key={n}>
          {i > 0 ? (i === MIN_FAAN_CHOICES.length - 1 ? " or " : ", ") : ""}
          <strong>{n}</strong>
        </span>
      ))}
    </span>
  );
}

/** Every pattern of one tier, each with its example and the engine's breakdown. */
export function PatternTier({ tier }: { tier: Tier }) {
  const meta = TIERS.find((t) => t.value === tier)!;
  return (
    <>
      <p className="prose muted">{meta.blurb}</p>
      <div className="patterns">
        {PATTERNS.filter((p) => p.tier === tier).map((p) => {
          const score = scoreExample(p.example);
          return (
            <article key={p.key} className="pattern panel-block" id={`p-${p.key}`}>
              <header className="pattern__head">
                <h3 className="pattern__name">
                  {p.name} <span className="cjk pattern__cn">{p.chinese}</span>
                </h3>
                <span className="pattern__faan">
                  {p.faan} faan{p.faan >= DEFAULT_RULES.limitFaan ? " · limit" : ""}
                </span>
              </header>
              <p className="pattern__rule">{p.rule}</p>
              <ExampleTiles example={p.example} score={score} />
              <details className="pattern__more">
                <summary>How this example scores</summary>
                <Breakdown score={score} highlight={p.key} />
              </details>
            </article>
          );
        })}
      </div>
    </>
  );
}

/** One hand, read as triplets and as runs: the scorer keeps the reading that pays more. */
export function ReadingsDemo() {
  const all = readings(TWO_READINGS).sort((a, b) => b.score.faan - a.score.faan);
  return (
    <div className="readings">
      <TileRow codes={TWO_READINGS.concealed} size="sm" label={TWO_READINGS.concealed.map(tileName).join(" ")} />
      <div className="readings__grid">
        {all.map((r, i) => (
          <div key={i} className={i === 0 ? "panel-block readings__one readings__one--kept" : "panel-block readings__one"}>
            <p className="coach__label">{i === 0 ? "Read as triplets — kept" : "Read as runs"}</p>
            <span className="tile-groups__sets">
              {r.sets.map((s, j) => (
                <TileRow key={j} codes={s} size="sm" />
              ))}
              <TileRow codes={[r.pair, r.pair]} size="sm" />
            </span>
            <Breakdown score={r.score} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ExampleFigure({ which }: { which: string }) {
  const p = PATTERNS.find((x) => x.key === which)!;
  return <ExampleTiles example={p.example} score={scoreExample(p.example)} />;
}
