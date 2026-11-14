import type { ScoreResult } from "@/game/scoring";
import { arrangeWinningHand } from "@/game/winning";
import { tileName } from "@/game/tiles";
import type { ExampleHand } from "@/tutorial/scoring";
import { TileRow } from "@/components/Tiles";

/** A scored example: the sets on the table, the hand laid out as sets, and its bonus tiles. */
export function ExampleTiles({ example, score, size = "sm" }: { example: ExampleHand; score?: ScoreResult; size?: "sm" | "md" }) {
  const melds = example.melds ?? [];
  const preferChows = score?.patterns.some((p) => p.key === "allChows") ?? false;
  const layout = arrangeWinningHand(
    example.concealed,
    melds.map((m) => ({ type: m.type, tiles: m.codes.map((code, i) => ({ id: `${code}#${i}`, code })), concealed: m.concealed ?? false })),
    preferChows,
  );
  const handGroups = (
    layout.loose.length > 0 ? [layout.loose] : [...layout.sets.map((s) => s.codes), layout.pair ? [layout.pair, layout.pair] : []]
  ).filter((g) => g.length);
  // Ring the winning tile where it sits: the last group it could have completed.
  const winGroup = handGroups.map((g) => g.includes(example.winning)).lastIndexOf(true);
  const label =
    `${melds.length ? `On the table: ${melds.map((m) => m.codes.map(tileName).join(" ")).join("; ")}. ` : ""}` +
    `In hand: ${example.concealed.map(tileName).join(" ")}. Won on ${tileName(example.winning)}` +
    `${example.selfDrawn ? ", self-drawn" : ", off a discard"}.`;
  return (
    <div className="example" role="img" aria-label={label}>
      {melds.length ? (
        <span className="example__part">
          <span className="example__tag">On the table</span>
          <span className="example__sets">
            {melds.map((m, i) => (
              <TileRow
                key={i}
                codes={m.type === "kong" && m.concealed ? ["back", m.codes[1]!, m.codes[2]!, "back"] : m.codes}
                size={size}
                className="example__meld"
              />
            ))}
          </span>
        </span>
      ) : null}
      <span className="example__part">
        <span className="example__tag">
          {melds.length ? "In hand" : "Concealed hand"} · {example.selfDrawn ? "drew" : "won on"} the ringed tile
        </span>
        <span className="example__sets">
          {handGroups.map((g, i) => (
            <TileRow key={i} codes={g} size={size} mark={i === winGroup ? g.lastIndexOf(example.winning) : undefined} />
          ))}
        </span>
      </span>
      {example.flowers?.length ? (
        <span className="example__part">
          <span className="example__tag">Bonus</span>
          <TileRow codes={example.flowers} size={size} />
        </span>
      ) : null}
    </div>
  );
}

/** The engine's breakdown of an example, pattern by pattern. */
export function Breakdown({ score, highlight }: { score: ScoreResult; highlight?: string }) {
  return (
    <ul className="breakdown">
      {score.patterns.map((p, i) => (
        <li key={`${p.key}-${i}`} className={p.key === highlight ? "breakdown__row breakdown__row--on" : "breakdown__row"}>
          <span>
            {p.name} <span className="cjk muted">{p.chinese}</span>
          </span>
          <span className="breakdown__faan">{p.faan}</span>
        </li>
      ))}
      <li className="breakdown__row breakdown__row--total">
        <span>{score.limitReached ? "Total — paid at the limit" : "Total"}</span>
        <span className="breakdown__faan">
          {score.limitReached ? `${score.faan} → ${score.scoredFaan}` : score.faan} faan · {score.value} pts
        </span>
      </li>
    </ul>
  );
}
