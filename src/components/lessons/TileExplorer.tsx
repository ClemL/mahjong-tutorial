"use client";

import { useState } from "react";
import { TILE_STYLES } from "@/game/appearance";
import { DRAGONS, FLOWERS, SEAT_NAMES, type TileCode, WINDS, flowerOwner, isFlower, isHonor, rankOf, suitOf, tileGlyph, tileName, tileSuitGlyph } from "@/game/tiles";
import { useAppearance } from "@/hooks/useAppearance";
import { Choice } from "@/components/Choice";
import { TileFace } from "@/components/TileView";

const RANKS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const GROUPS: { title: string; codes: TileCode[] }[] = [
  { title: "Characters 萬", codes: RANKS.map((r) => `m${r}`) },
  { title: "Dots 筒", codes: RANKS.map((r) => `p${r}`) },
  { title: "Bamboo 索", codes: RANKS.map((r) => `s${r}`) },
  { title: "Winds 風", codes: WINDS },
  { title: "Dragons 三元", codes: DRAGONS },
  { title: "Flowers 花", codes: FLOWERS.slice(0, 4) },
  { title: "Seasons 季", codes: FLOWERS.slice(4) },
];

const DRAGON_NOTES: Record<string, string> = {
  dr: "中 zung, “centre”. Painted red.",
  dg: "發 faat, “prosper”. Painted green.",
  dw: "白 baak, “white”. Usually an empty blue frame, sometimes blank.",
};

const FLOWER_NAMES: Record<string, string> = {
  f1: "Plum 梅", f2: "Orchid 蘭", f3: "Chrysanthemum 菊", f4: "Bamboo 竹",
  f5: "Spring 春", f6: "Summer 夏", f7: "Autumn 秋", f8: "Winter 冬",
};

function describe(code: TileCode): { title: string; lines: string[] } {
  if (isFlower(code)) {
    const owner = flowerOwner(code)!;
    return {
      title: FLOWER_NAMES[code]!,
      lines: [
        "A bonus tile: one copy only, never part of a set.",
        "When you draw it you lay it face up beside you and draw a replacement from the back of the wall.",
        `Its number is ${owner + 1}, so it belongs to ${SEAT_NAMES[owner]}: worth 1 faan to the ${SEAT_NAMES[owner]} player, nothing to anyone else.`,
      ],
    };
  }
  if (isHonor(code)) {
    const wind = code[0] === "w";
    return {
      title: `${tileName(code)} ${tileGlyph(code)}`,
      lines: [
        "An honor tile: four copies.",
        wind
          ? "Winds make pungs, kongs and pairs, never runs. A pung scores when it is your seat's wind or the round's wind."
          : "Dragons make pungs, kongs and pairs, never runs. Any pung of dragons is worth 1 faan.",
        wind ? "" : DRAGON_NOTES[code]!,
      ].filter(Boolean),
    };
  }
  const rank = rankOf(code);
  const suit = { m: "Characters", p: "Dots", s: "Bamboo" }[suitOf(code)!];
  const extra =
    code === "s1"
      ? "The 1 Bamboo is drawn as a bird (a sparrow or peacock) on most sets — the game's Cantonese name, 麻雀, means sparrow."
      : code[0] === "m"
        ? `The top character is the number ${tileGlyph(code)}; ${tileSuitGlyph(code)} below means ten thousand.`
        : "";
  return {
    title: `${tileName(code)}`,
    lines: [
      `A suited tile: four copies of the ${rank} of ${suit}.`,
      rank === 1 || rank === 9
        ? "A terminal (1 or 9): it can end a run but not sit in the middle of one, so it connects in fewer ways."
        : "It can sit in runs and in pungs.",
      extra,
    ].filter(Boolean),
  };
}

/** Every tile in the set, with what it is and how it is used. */
export function TileExplorer() {
  const api = useAppearance();
  const [picked, setPicked] = useState<TileCode>("s1");
  const info = describe(picked);
  return (
    <div className="explorer panel-block">
      <Choice
        label="Tile faces"
        options={TILE_STYLES}
        value={api.appearance.tiles}
        onChange={(value) => api.set("tiles", value)}
      />
      <div className="explorer__body">
        <div className="explorer__groups">
          {GROUPS.map((group) => (
            <section key={group.title} className="explorer__group" aria-label={group.title}>
              <h3 className="explorer__title">{group.title}</h3>
              <div className="explorer__row">
                {group.codes.map((code) => (
                  <button
                    key={code}
                    type="button"
                    className={picked === code ? "explorer__pick explorer__pick--on" : "explorer__pick"}
                    aria-pressed={picked === code}
                    aria-label={tileName(code)}
                    onClick={() => setPicked(code)}
                  >
                    <TileFace code={code} size="md" />
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
        <aside className="explorer__info" aria-live="polite">
          <TileFace code={picked} size="lg" className="explorer__big" />
          <h3 className="explorer__name">{info.title}</h3>
          <ul>
            {info.lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
