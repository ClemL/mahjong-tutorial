"use client";

import { useMemo, useState } from "react";
import { type TileCode, compareCodes, tileName } from "@/game/tiles";
import { SORT_PUZZLES, classifySet } from "@/tutorial/quizzes";
import { TileButton } from "@/components/TileView";
import { TileRow } from "@/components/Tiles";
import { QuizShell } from "./QuizShell";

interface Slot {
  id: number;
  code: TileCode;
}

const KIND_LABEL = { chow: "Chow", pung: "Pung", kong: "Kong", pair: "Pair" } as const;

/** Split fourteen tiles into four sets and a pair, by tapping them into groups. */
export function HandSorter() {
  const [puzzle, setPuzzle] = useState(0);
  const p = SORT_PUZZLES[puzzle]!;
  const tiles = useMemo<Slot[]>(
    () => [...p.codes].sort(compareCodes).map((code, id) => ({ id, code })),
    [p.codes],
  );
  const [groups, setGroups] = useState<number[][]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [showTip, setShowTip] = useState(false);

  const used = new Set(groups.flat());
  const loose = tiles.filter((t) => !used.has(t.id));
  const codesOf = (ids: number[]) => ids.map((id) => tiles[id]!.code);
  const kinds = groups.map((g) => classifySet(codesOf(g)));
  const pairs = kinds.filter((k) => k === "pair").length;
  const solved = loose.length === 0 && pairs === 1;

  const reset = (next = puzzle) => {
    setPuzzle(next);
    setGroups([]);
    setSelected([]);
    setMessage(null);
    setShowTip(false);
  };

  const toggle = (id: number) => {
    setMessage(null);
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const group = () => {
    const codes = codesOf(selected);
    const kind = classifySet(codes);
    if (kind === "none" || kind === "kong") {
      setMessage(
        kind === "kong"
          ? "Four of a kind is a kong, but in a hand of fourteen tiles it would leave you a tile short. Use three."
          : `${codes.map(tileName).join(", ")} is not a set. A set is three in a row in one suit, or three of the same tile.`,
      );
      return;
    }
    if (kind === "pair" && pairs >= 1) {
      setMessage("A winning hand has exactly one pair. Find a set for these instead.");
      return;
    }
    setGroups((g) => [...g, selected]);
    setSelected([]);
  };

  const ungroup = (index: number) => {
    setGroups((g) => g.filter((_, i) => i !== index));
    setMessage(null);
  };

  return (
    <QuizShell
      title={`Arrange the hand: ${p.title}`}
      progress={`${puzzle + 1} of ${SORT_PUZZLES.length}`}
      onNext={solved && puzzle < SORT_PUZZLES.length - 1 ? () => reset(puzzle + 1) : undefined}
      onRestart={solved && puzzle === SORT_PUZZLES.length - 1 ? () => reset(0) : undefined}
      nextLabel="Next hand"
    >
      <p className="quiz__ask">
        Tap three tiles that make a set (or two for the pair), then <strong>Make set</strong>. Tap a finished set to
        take it apart.
      </p>
      <div className="sorter__groups" aria-label="Your sets">
        {groups.length === 0 ? <span className="muted small">Your sets will appear here.</span> : null}
        {groups.map((g, i) => (
          <button
            key={i}
            type="button"
            className="sorter__set"
            onClick={() => ungroup(i)}
            aria-label={`${KIND_LABEL[kinds[i] as keyof typeof KIND_LABEL]}: ${codesOf(g).map(tileName).join(", ")}. Tap to take apart.`}
          >
            <TileRow codes={codesOf(g)} size="sm" />
            <span className="sorter__kind">{KIND_LABEL[kinds[i] as keyof typeof KIND_LABEL]}</span>
          </button>
        ))}
      </div>
      {solved ? (
        <p className="verdict verdict--right" role="status">
          <strong>✓ Mahjong! </strong>Four sets and a pair: a complete hand.
        </p>
      ) : (
        <>
          <div className="sorter__hand" aria-label="Tiles still to place">
            {loose.map((t) => (
              <TileButton
                key={t.id}
                code={t.code}
                size="md"
                className={selected.includes(t.id) ? "tile--picked" : ""}
                ariaLabel={`${tileName(t.code)}${selected.includes(t.id) ? ", selected" : ""}`}
                onClick={() => toggle(t.id)}
              />
            ))}
          </div>
          <div className="actions">
            <button type="button" className="btn btn--primary" disabled={selected.length < 2} onClick={group}>
              Make set
            </button>
            <button type="button" className="btn" disabled={selected.length === 0} onClick={() => setSelected([])}>
              Clear selection
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => setShowTip(true)} disabled={showTip}>
              Hint
            </button>
          </div>
          {message ? (
            <p className="verdict verdict--wrong" role="status">
              <strong>✗ </strong>
              {message}
            </p>
          ) : null}
          {showTip ? <p className="quiz__tip">{p.tip}</p> : null}
        </>
      )}
    </QuizShell>
  );
}
