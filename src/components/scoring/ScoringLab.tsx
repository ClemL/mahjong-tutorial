"use client";

import { useMemo, useState } from "react";
import { SEAT_NAMES, type Seat, WINDS } from "@/game/tiles";
import { Choice } from "@/components/Choice";
import {
  FLOWER_CHOICES,
  type FlowerChoice,
  LAB_HANDS,
  configFor,
  labExample,
  payments,
  scoreExample,
} from "@/tutorial/scoring";
import { Breakdown, ExampleTiles } from "./ExampleTiles";

const SEAT_OPTIONS = SEAT_NAMES.map((name, i) => ({ value: String(i), label: name, hint: `You sit ${name}` }));
const ROUND_OPTIONS = SEAT_NAMES.map((name, i) => ({ value: WINDS[i]!, label: name, hint: `The ${name} round` }));
const CLAIMED_OPTIONS = [0, 1, 2, 3, 4].map((n) => ({
  value: String(n),
  label: String(n),
  hint: n === 0 ? "Nothing claimed: a concealed hand" : n === 4 ? "Every set taken from a discard" : `${n} set${n > 1 ? "s" : ""} taken from discards`,
}));

/** Change one thing about a hand and watch the engine score it again. */
export function ScoringLab() {
  const [handId, setHandId] = useState<string>(LAB_HANDS[0]!.id);
  const [claimed, setClaimed] = useState("1");
  const [selfDrawn, setSelfDrawn] = useState(false);
  const [seat, setSeat] = useState("1");
  const [round, setRound] = useState<string>("we");
  const [flowers, setFlowers] = useState<FlowerChoice>("none");
  const [othersPayHalf, setOthersPayHalf] = useState(true);

  const hand = LAB_HANDS.find((h) => h.id === handId)!;
  const example = useMemo(
    () =>
      labExample({
        hand,
        claimed: Number(claimed),
        selfDrawn,
        seat: Number(seat) as Seat,
        roundWind: round,
        flowers,
      }),
    [hand, claimed, selfDrawn, seat, round, flowers],
  );
  const score = useMemo(() => scoreExample(example), [example]);
  const config = configFor(example);
  const winner = Number(seat) as Seat;
  const from = selfDrawn ? null : (((winner + 3) % 4) as Seat);
  const paid = payments(score.faan, winner, from, { othersPayHalf }, config);

  return (
    <div className="lab panel-block">
      <div className="lab__controls">
        <Choice
          label="Hand"
          options={LAB_HANDS.map((h) => ({ value: h.id, label: h.label, hint: "" }))}
          value={handId}
          onChange={setHandId}
        />
        <Choice label="Sets claimed from discards" options={CLAIMED_OPTIONS} value={claimed} onChange={setClaimed} />
        <Choice
          label="Winning tile"
          options={[
            { value: "discard", label: "Off a discard", hint: "The player on your left threw it" },
            { value: "self", label: "Self-drawn 自摸", hint: "You drew it from the wall" },
          ]}
          value={selfDrawn ? "self" : "discard"}
          onChange={(v) => setSelfDrawn(v === "self")}
        />
        <Choice label="Your seat" options={SEAT_OPTIONS} value={seat} onChange={setSeat} />
        <Choice label="Round wind" options={ROUND_OPTIONS} value={round} onChange={setRound} />
        <Choice label="Flowers and seasons" options={FLOWER_CHOICES} value={flowers} onChange={(v) => setFlowers(v as FlowerChoice)} />
      </div>
      <div className="lab__out">
        <ExampleTiles example={example} score={score} size="md" />
        <Breakdown score={score} />
        {score.faan < config.minFaan ? (
          <p className="verdict verdict--wrong small">
            Below the app&apos;s {config.minFaan}-faan minimum: this hand could not be declared.
          </p>
        ) : null}
        <div className="lab__pay">
          <div className="lab__pay-head">
            <strong>Who pays</strong>
            {!selfDrawn ? (
              <label className="switch small">
                <input type="checkbox" checked={othersPayHalf} onChange={(e) => setOthersPayHalf(e.target.checked)} />
                <span>The other two pay half</span>
              </label>
            ) : null}
          </div>
          <ul className="result__pay">
            {paid.map((amount, s) => (
              <li key={s} className={amount > 0 ? "pay pay--up" : amount < 0 ? "pay pay--down" : "pay"}>
                <span>
                  {SEAT_NAMES[s]}
                  {s === winner ? " (you)" : s === from ? " (threw it)" : ""}
                </span>
                <strong>{amount > 0 ? `+${amount}` : amount}</strong>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
