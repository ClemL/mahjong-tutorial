"use client";

import { useMemo, useState } from "react";
import { compareCodes, tileName } from "@/game/tiles";
import { type Decision, MISTAKES, type Review, reviewDecisions } from "@/tutorial/review";
import { TileRow } from "@/components/Tiles";

const LABEL: Record<Review["verdict"], string> = {
  match: "Same as the coach",
  fine: "As good",
  narrower: "Slightly fewer outs",
  slower: "A step slower",
  cheaper: "No route to the minimum",
  claim: "A different call",
  missedWin: "Missed a win",
};

function Item({ r }: { r: Review }) {
  const mistake = MISTAKES.includes(r.verdict);
  const hand = [...r.hand].sort(compareCodes);
  const mark = r.kind === "discard" && r.yourCode ? hand.indexOf(r.yourCode) : undefined;
  return (
    <li className={mistake ? "review__item review__item--mistake" : "review__item"}>
      <div className="review__head">
        <span className="review__n">#{r.index + 1}</span>
        <strong>{LABEL[r.verdict]}</strong>
      </div>
      <TileRow codes={hand} size="sm" mark={mark} />
      <p className="review__moves">
        <span>
          {r.kind === "claim"
            ? `On the ${r.yourCode ? tileName(r.yourCode) : "discard"}: you ${r.yours === "Pass" ? "passed" : `called ${r.yours}`}`
            : r.yours}
        </span>
        {r.verdict !== "match" ? <span> · Coach: {r.coach}</span> : null}
      </p>
      {r.verdict !== "match" ? <p className="review__why">{r.why}</p> : null}
    </li>
  );
}

/**
 * The hand just played, decision by decision, against the game's Normal
 * computer player. Mistakes first; near-ties and matches on request.
 */
export function HandReview({ decisions }: { decisions: Decision[] }) {
  const [all, setAll] = useState(false);
  const reviews = useMemo(() => reviewDecisions(decisions, 0), [decisions]);
  if (reviews.length === 0) return null;
  const mistakes = reviews.filter((r) => MISTAKES.includes(r.verdict));
  const matches = reviews.filter((r) => r.verdict === "match").length;
  const shown = all ? reviews : mistakes;
  return (
    <section className="review panel-block" aria-label="Review of your hand">
      <p className="coach__label">Review of your hand</p>
      <p className="small">
        {reviews.length} decisions: {matches} the same as the coach, {mistakes.length} that cost you something.
      </p>
      {shown.length ? (
        <ol className="review__list">
          {shown.map((r) => (
            <Item key={r.index} r={r} />
          ))}
        </ol>
      ) : (
        <p className="verdict verdict--right">
          <strong>✓ </strong>No mistakes that mattered. Show every decision to see the near-ties.
        </p>
      )}
      <button type="button" className="btn btn--sm btn--ghost" onClick={() => setAll((a) => !a)}>
        {all ? "Show mistakes only" : "Show every decision"}
      </button>
    </section>
  );
}
