/**
 * Example hands for the scoring pages, scored by the engine's own `scoreHand`.
 * Each catalog entry names the pattern it illustrates; the tests check the
 * example really scores it, so the faan shown beside a hand is always what the
 * app would pay.
 */
import { DEFAULT_FAAN, DEFAULT_RULES, type FaanTable, type RuleConfig } from "@/game/rules";
import { type ScoreResult, type WinContext, faanValue, scoreHand } from "@/game/scoring";
import type { Meld } from "@/game/melds";
import { type Seat, type TileCode, WINDS } from "@/game/tiles";
import { decompose, countsFromCodes } from "@/game/winning";
import { type MeldSpec, TilePool } from "./table";

export interface ExampleHand {
  /** Sets already laid on the table: claimed sets, and concealed kongs. */
  melds?: MeldSpec[];
  /** The tiles still in hand, the winning tile included. */
  concealed: TileCode[];
  winning: TileCode;
  selfDrawn?: boolean;
  seat?: Seat;
  roundWind?: TileCode;
  /** Bonus tiles held. Left out, the example is scored with Flowers and Seasons out of the game. */
  flowers?: TileCode[];
  robbingKong?: boolean;
  onKongReplacement?: boolean;
  onLastTile?: boolean;
  heavenly?: boolean;
  earthly?: boolean;
}

/** The tables the examples are scored at: the default rules, with or without bonus tiles. */
export function configFor(example: ExampleHand): RuleConfig {
  return example.flowers ? DEFAULT_RULES : { ...DEFAULT_RULES, flowers: false };
}

export function contextFor(example: ExampleHand, config: RuleConfig = configFor(example)): WinContext {
  const pool = new TilePool(true);
  const melds: Meld[] = (example.melds ?? []).map((m) => ({
    type: m.type,
    tiles: pool.takeAll(m.codes),
    concealed: m.concealed ?? false,
  }));
  return {
    concealed: pool.takeAll(example.concealed),
    melds,
    flowers: pool.takeAll(example.flowers ?? []),
    winningTile: example.winning,
    seat: example.seat ?? 1,
    roundWind: example.roundWind ?? WINDS[0]!,
    selfDrawn: example.selfDrawn ?? false,
    robbingKong: example.robbingKong ?? false,
    onKongReplacement: example.onKongReplacement ?? false,
    onLastTile: example.onLastTile ?? false,
    heavenly: example.heavenly ?? false,
    earthly: example.earthly ?? false,
    config,
  };
}

export function scoreExample(example: ExampleHand, config?: RuleConfig): ScoreResult {
  const result = scoreHand(contextFor(example, config));
  if (!result) throw new Error(`Not a winning hand: ${example.concealed.join(" ")}`);
  return result;
}

// ------------------------------------------------------------ the catalog

export type Tier = "everyday" | "bigger" | "limit";

export interface PatternEntry {
  key: string;
  /** Faan from the rules table, or the fixed value for bonus tiles. */
  faan: number;
  chinese: string;
  name: string;
  tier: Tier;
  rule: string;
  example: ExampleHand;
}

const f = (key: keyof FaanTable) => DEFAULT_FAAN[key];
const pung = (code: TileCode): MeldSpec => ({ type: "pung", codes: [code, code, code] });
const kong = (code: TileCode, concealed = false): MeldSpec => ({ type: "kong", codes: [code, code, code, code], concealed });
const chow = (...codes: TileCode[]): MeldSpec => ({ type: "chow", codes });

export const PATTERNS: PatternEntry[] = [
  // ---- everyday: 1 faan each
  {
    key: "dragonPung",
    faan: f("honorTriplet"),
    chinese: "三元牌",
    name: "Dragon triplet",
    tier: "everyday",
    rule: "A pung or kong of any dragon — red 中, green 發 or white 白. Each one counts.",
    example: { melds: [pung("dg")], concealed: ["m1", "m2", "m3", "p4", "p5", "p6", "s7", "s8", "s9", "ww", "ww"], winning: "s9" },
  },
  {
    key: "seatWind",
    faan: f("honorTriplet"),
    chinese: "門風",
    name: "Seat wind triplet",
    tier: "everyday",
    rule: "A pung or kong of your own seat's wind. Here you sit South.",
    example: { melds: [pung("ws")], concealed: ["m2", "m3", "m4", "p6", "p7", "p8", "s1", "s2", "s3", "m9", "m9"], winning: "m9" },
  },
  {
    key: "roundWind",
    faan: f("honorTriplet"),
    chinese: "圈風",
    name: "Round wind triplet",
    tier: "everyday",
    rule:
      "A pung or kong of the round's wind (East in the first round). Sitting East in the East round, an East " +
      "pung scores as both seat and round wind: 2 faan.",
    example: {
      melds: [pung("we")],
      concealed: ["m5", "m6", "m7", "p2", "p3", "p4", "s4", "s5", "s6", "p9", "p9"],
      winning: "s6",
      seat: 2,
    },
  },
  {
    key: "selfDraw",
    faan: f("selfDraw"),
    chinese: "自摸",
    name: "Self-draw",
    tier: "everyday",
    rule: "You drew the winning tile yourself instead of taking a discard. All three opponents pay.",
    example: {
      melds: [chow("p2", "p3", "p4")],
      concealed: ["m1", "m2", "m3", "s4", "s5", "s6", "m9", "m9", "m9", "s8", "s8"],
      winning: "s5",
      selfDrawn: true,
    },
  },
  {
    key: "concealedHand",
    faan: f("concealedHand"),
    chinese: "門前清",
    name: "Concealed hand",
    tier: "everyday",
    rule:
      "No sets claimed, and you win on a discard. In this app a concealed hand that self-draws scores the self-draw " +
      "faan instead, not both.",
    example: {
      concealed: ["m2", "m3", "m4", "p5", "p5", "p5", "s6", "s7", "s8", "s1", "s2", "s3", "dg", "dg"],
      winning: "s3",
    },
  },
  {
    key: "allChows",
    faan: f("allChows"),
    chinese: "平糊",
    name: "All sequences",
    tier: "everyday",
    rule: "All four sets are runs. Here, unlike some house rules, any pair and any wait will do.",
    example: {
      melds: [chow("m1", "m2", "m3")],
      concealed: ["p4", "p5", "p6", "s1", "s2", "s3", "s7", "s8", "s9", "p9", "p9"],
      winning: "s9",
    },
  },
  {
    key: "noBonus",
    faan: f("noBonus"),
    chinese: "無花",
    name: "No bonus tiles",
    tier: "everyday",
    rule: "You won without drawing a single Flower or Season. Only counts when bonus tiles are in the game.",
    example: {
      melds: [pung("dg")],
      concealed: ["m1", "m2", "m3", "p4", "p5", "p6", "s7", "s8", "s9", "ww", "ww"],
      winning: "s9",
      flowers: [],
    },
  },
  {
    key: "ownFlower",
    faan: 1,
    chinese: "正花",
    name: "Own flower or season",
    tier: "everyday",
    rule:
      "Each bonus tile whose number matches your seat — 1 for East, 2 South, 3 West, 4 North — is 1 faan. " +
      "Sitting South, Orchid (2) scores; Spring (1) does not.",
    example: {
      melds: [pung("dg")],
      concealed: ["m1", "m2", "m3", "p4", "p5", "p6", "s7", "s8", "s9", "ww", "ww"],
      winning: "s9",
      flowers: ["f2", "f5"],
    },
  },
  {
    key: "kongReplacement",
    faan: f("kongReplacement"),
    chinese: "槓上開花",
    name: "Win on a kong replacement",
    tier: "everyday",
    rule: "You made a kong, drew the replacement tile from the back of the wall, and it won. Self-draw counts too.",
    example: {
      melds: [kong("m5")],
      concealed: ["p1", "p2", "p3", "s4", "s5", "s6", "s7", "s8", "s9", "dw", "dw"],
      winning: "s9",
      selfDrawn: true,
      onKongReplacement: true,
    },
  },
  {
    key: "robbingKong",
    faan: f("robbingKong"),
    chinese: "搶槓",
    name: "Robbing the kong",
    tier: "everyday",
    rule: "Someone adds a fourth tile to their pung, and that tile is the one you win on. You take it before the kong is made.",
    example: {
      melds: [chow("m6", "m7", "m8")],
      concealed: ["p2", "p3", "p4", "s3", "s3", "s3", "s5", "s6", "s7", "wn", "wn"],
      winning: "s7",
      robbingKong: true,
    },
  },
  {
    key: "lastTile",
    faan: f("lastTile"),
    chinese: "海底撈月",
    name: "Win on the last tile",
    tier: "everyday",
    rule: "The very last tile of the wall (海底撈月, “moon from the sea bed”), or the discard after it (河底撈魚).",
    example: {
      melds: [pung("p8")],
      concealed: ["m3", "m4", "m5", "s2", "s3", "s4", "s6", "s7", "s8", "m7", "m7"],
      winning: "m7",
      selfDrawn: true,
      onLastTile: true,
    },
  },
  // ---- bigger hands
  {
    key: "allPungs",
    faan: f("allPungs"),
    chinese: "對對糊",
    name: "All triplets",
    tier: "bigger",
    rule: "Four pungs or kongs and a pair — no runs at all.",
    example: {
      melds: [pung("m2"), pung("p5")],
      concealed: ["s7", "s7", "s7", "m8", "m8", "m8", "p1", "p1"],
      winning: "p1",
    },
  },
  {
    key: "allExposed",
    faan: f("allExposed"),
    chinese: "全求人",
    name: "All sets claimed",
    tier: "bigger",
    rule: "All four sets taken from discards, and the pair completed on a discard too. Begging for every tile pays.",
    example: {
      melds: [chow("m1", "m2", "m3"), pung("p7"), chow("s4", "s5", "s6"), pung("s9")],
      concealed: ["dr", "dr"],
      winning: "dr",
    },
  },
  {
    key: "halfFlush",
    faan: f("halfFlush"),
    chinese: "混一色",
    name: "Half flush",
    tier: "bigger",
    rule: "One suit only, plus winds or dragons.",
    example: {
      melds: [pung("wn")],
      concealed: ["s2", "s3", "s4", "s5", "s6", "s7", "s9", "s9", "s9", "ws", "ws"],
      winning: "s7",
      seat: 2,
    },
  },
  {
    key: "flowerSet",
    faan: f("bonusSet"),
    chinese: "一台花",
    name: "All four flowers (or seasons)",
    tier: "bigger",
    rule: "All four Flowers, or all four Seasons. Replaces the single own-flower faan.",
    example: {
      melds: [pung("dg")],
      concealed: ["m1", "m2", "m3", "p4", "p5", "p6", "s7", "s8", "s9", "ww", "ww"],
      winning: "s9",
      flowers: ["f1", "f2", "f3", "f4"],
    },
  },
  {
    key: "smallThreeDragons",
    faan: f("smallThreeDragons"),
    chinese: "小三元",
    name: "Small three dragons",
    tier: "bigger",
    rule: "Pungs of two dragons and a pair of the third. Replaces the dragon triplet faan.",
    example: {
      melds: [pung("dr"), pung("dg")],
      concealed: ["m1", "m2", "m3", "p4", "p5", "p6", "dw", "dw"],
      winning: "dw",
    },
  },
  {
    key: "terminalsAndHonors",
    faan: f("terminalsAndHonors"),
    chinese: "混幺九",
    name: "Terminals and honors",
    tier: "bigger",
    rule: "Every set is a pung of 1s, 9s, winds or dragons. Includes all triplets, so that is not added again.",
    example: {
      melds: [pung("m1"), pung("p9")],
      concealed: ["s1", "s1", "s1", "wn", "wn", "wn", "dr", "dr"],
      winning: "dr",
    },
  },
  {
    key: "fullFlush",
    faan: f("fullFlush"),
    chinese: "清一色",
    name: "Full flush",
    tier: "bigger",
    rule: "Every tile from one suit — no honors.",
    example: {
      melds: [chow("p1", "p2", "p3")],
      concealed: ["p4", "p5", "p6", "p7", "p8", "p9", "p2", "p2", "p2", "p5", "p5"],
      winning: "p9",
    },
  },
  {
    key: "bigThreeDragons",
    faan: f("bigThreeDragons"),
    chinese: "大三元",
    name: "Big three dragons",
    tier: "bigger",
    rule: "Pungs or kongs of all three dragons.",
    example: {
      melds: [pung("dr"), pung("dg"), pung("dw")],
      concealed: ["m2", "m3", "m4", "p8", "p8"],
      winning: "p8",
    },
  },
  // ---- limit hands
  {
    key: "allTerminals",
    faan: f("allTerminals"),
    chinese: "清幺九",
    name: "All terminals",
    tier: "limit",
    rule: "Only 1s and 9s, all in pungs.",
    example: {
      melds: [pung("m1"), pung("m9"), pung("p1")],
      concealed: ["s9", "s9", "s9", "p9", "p9"],
      winning: "p9",
    },
  },
  {
    key: "allHonors",
    faan: f("allHonors"),
    chinese: "字一色",
    name: "All honors",
    tier: "limit",
    rule: "Only winds and dragons.",
    example: {
      melds: [pung("wn"), pung("ww")],
      concealed: ["dr", "dr", "dr", "dg", "dg", "dg", "we", "we"],
      winning: "we",
    },
  },
  {
    key: "smallFourWinds",
    faan: f("smallFourWinds"),
    chinese: "小四喜",
    name: "Small four winds",
    tier: "limit",
    rule: "Pungs of three winds and a pair of the fourth.",
    example: {
      melds: [pung("we"), pung("ws"), pung("ww")],
      concealed: ["m2", "m3", "m4", "wn", "wn"],
      winning: "wn",
    },
  },
  {
    key: "nineGates",
    faan: f("nineGates"),
    chinese: "九蓮寶燈",
    name: "Nine gates",
    tier: "limit",
    rule: "Concealed 1-1-1-2-3-4-5-6-7-8-9-9-9 of one suit, plus any tile of that suit. It waits on all nine.",
    example: {
      concealed: ["s1", "s1", "s1", "s2", "s3", "s4", "s5", "s5", "s6", "s7", "s8", "s9", "s9", "s9"],
      winning: "s5",
    },
  },
  {
    key: "bigFourWinds",
    faan: f("bigFourWinds"),
    chinese: "大四喜",
    name: "Big four winds",
    tier: "limit",
    rule: "Pungs of all four winds.",
    example: {
      melds: [pung("we"), pung("ws"), pung("ww")],
      concealed: ["wn", "wn", "wn", "p5", "p5"],
      winning: "p5",
    },
  },
  {
    key: "fourKongs",
    faan: f("fourKongs"),
    chinese: "十八羅漢",
    name: "Four kongs",
    tier: "limit",
    rule: "Four kongs — eighteen tiles, the “eighteen arhats”.",
    example: {
      melds: [kong("m3"), kong("p7"), kong("s2"), kong("dr", true)],
      concealed: ["s5", "s5"],
      winning: "s5",
    },
  },
  {
    key: "thirteenOrphans",
    faan: f("thirteenOrphans"),
    chinese: "十三么",
    name: "Thirteen orphans",
    tier: "limit",
    rule: "One of each 1 and 9, each wind and each dragon, plus a second of any of them. The one hand with no sets.",
    example: {
      concealed: ["m1", "m9", "p1", "p9", "s1", "s9", "we", "ws", "ww", "wn", "dr", "dg", "dw", "dr"],
      winning: "dr",
    },
  },
  {
    key: "heavenlyHand",
    faan: f("heavenlyHand"),
    chinese: "天糊",
    name: "Heavenly hand",
    tier: "limit",
    rule: "The dealer's 14 dealt tiles are already a winning hand.",
    example: {
      concealed: ["m2", "m3", "m4", "p6", "p7", "p8", "s3", "s3", "s3", "s5", "s6", "s7", "dg", "dg"],
      winning: "dg",
      seat: 0,
      selfDrawn: true,
      heavenly: true,
    },
  },
  {
    key: "earthlyHand",
    faan: f("earthlyHand"),
    chinese: "地糊",
    name: "Earthly hand",
    tier: "limit",
    rule: "A win on the dealer's first discard, or on your own first draw, before anyone has claimed anything.",
    example: {
      concealed: ["m6", "m7", "m8", "p1", "p2", "p3", "s4", "s5", "s6", "dw", "dw", "dw", "wn", "wn"],
      winning: "wn",
      earthly: true,
    },
  },
  {
    key: "allEightBonus",
    faan: f("allEightBonus"),
    chinese: "八仙過海",
    name: "All eight bonus tiles",
    tier: "limit",
    rule: "Holding all four Flowers and all four Seasons — the “eight immortals crossing the sea”.",
    example: {
      melds: [pung("dg")],
      concealed: ["m1", "m2", "m3", "p4", "p5", "p6", "s7", "s8", "s9", "ww", "ww"],
      winning: "s9",
      flowers: ["f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8"],
    },
  },
];

export const TIERS: { value: Tier; title: string; blurb: string }[] = [
  {
    value: "everyday",
    title: "Everyday faan",
    blurb: "One faan each. Most winning hands are built from two or three of these.",
  },
  {
    value: "bigger",
    title: "Bigger hands",
    blurb: "Three to eight faan. A flush or a hand of triplets is how a small win becomes a big one.",
  },
  {
    value: "limit",
    title: "Limit hands",
    blurb: `Ten faan or more. Anything at or past ${DEFAULT_RULES.limitFaan} faan is paid at the limit, ${faanValue(DEFAULT_RULES.limitFaan, DEFAULT_RULES)} points.`,
  },
];

// ----------------------------------------------------- reading a hand two ways

export interface Reading {
  sets: TileCode[][];
  pair: TileCode;
  score: ScoreResult;
}

/**
 * Every way a fully concealed hand splits into sets and a pair, each scored
 * on its own — to show why the scorer keeps the one that pays most.
 */
export function readings(example: ExampleHand): Reading[] {
  const config = configFor(example);
  return decompose(countsFromCodes(example.concealed), 4).map((d) => {
    const melds: MeldSpec[] = d.sets.map((s) => ({ type: s.type, codes: s.codes, concealed: true }));
    const score = scoreExample({ ...example, melds, concealed: [d.pair, d.pair] }, config);
    return { sets: d.sets.map((s) => s.codes), pair: d.pair, score };
  });
}

export const TWO_READINGS: ExampleHand = {
  concealed: ["m1", "m1", "m1", "m2", "m2", "m2", "m3", "m3", "m3", "p5", "p5", "p5", "s9", "s9"],
  winning: "s9",
};

// -------------------------------------------------------------- the lab

export interface LabHand {
  id: string;
  label: string;
  /** Four sets, in the order they are claimed when the lab claims some. */
  sets: MeldSpec[];
  pair: TileCode;
  winning: TileCode;
}

export const LAB_HANDS: LabHand[] = [
  {
    id: "dragons",
    label: "Runs and a dragon",
    sets: [pung("dr"), chow("m2", "m3", "m4"), chow("p5", "p6", "p7"), chow("s3", "s4", "s5")],
    pair: "s8",
    winning: "s5",
  },
  {
    id: "wind",
    label: "East wind triplet",
    sets: [pung("we"), chow("m6", "m7", "m8"), chow("p1", "p2", "p3"), chow("s2", "s3", "s4")],
    pair: "m5",
    winning: "s4",
  },
  {
    id: "flush",
    label: "One suit and honors",
    sets: [pung("wn"), chow("p1", "p2", "p3"), chow("p4", "p5", "p6"), pung("p8")],
    pair: "p9",
    winning: "p6",
  },
  {
    id: "triplets",
    label: "All triplets",
    sets: [pung("m2"), pung("s6"), pung("dg"), pung("p9")],
    pair: "we",
    winning: "we",
  },
  {
    id: "runs",
    label: "Plain runs",
    sets: [chow("m1", "m2", "m3"), chow("m6", "m7", "m8"), chow("p3", "p4", "p5"), chow("s6", "s7", "s8")],
    pair: "s2",
    winning: "s8",
  },
];

export type FlowerChoice = "none" | "own" | "other" | "set";

export const FLOWER_CHOICES: { value: FlowerChoice; label: string; hint: string }[] = [
  { value: "none", label: "None", hint: "No Flowers or Seasons drawn" },
  { value: "own", label: "Your own", hint: "The flower whose number is your seat" },
  { value: "other", label: "Someone else's", hint: "A flower that belongs to another seat" },
  { value: "set", label: "All four flowers", hint: "Plum, Orchid, Chrysanthemum and Bamboo" },
];

export interface LabOptions {
  hand: LabHand;
  /** How many of the four sets were claimed from discards (the rest are concealed). */
  claimed: number;
  selfDrawn: boolean;
  seat: Seat;
  roundWind: TileCode;
  flowers: FlowerChoice;
}

function flowerCodes(choice: FlowerChoice, seat: Seat): TileCode[] {
  switch (choice) {
    case "none":
      return [];
    case "own":
      return [`f${seat + 1}`];
    case "other":
      return [`f${((seat + 1) % 4) + 1}`];
    case "set":
      return ["f1", "f2", "f3", "f4"];
  }
}

export function labExample(options: LabOptions): ExampleHand {
  const { hand, claimed } = options;
  const melds = hand.sets.slice(0, claimed);
  const inHand = hand.sets.slice(claimed).flatMap((s) => s.codes);
  return {
    melds,
    concealed: [...inHand, hand.pair, hand.pair],
    winning: hand.winning,
    selfDrawn: options.selfDrawn,
    seat: options.seat,
    roundWind: options.roundWind,
    flowers: flowerCodes(options.flowers, options.seat),
  };
}

// ------------------------------------------------------------- payments

export interface PaymentRules {
  othersPayHalf: boolean;
}

/** What each seat pays or receives when `winner` wins a hand worth `faan`. */
export function payments(
  faan: number,
  winner: Seat,
  from: Seat | null,
  rules: PaymentRules,
  config: RuleConfig = DEFAULT_RULES,
): number[] {
  const value = faanValue(faan, config);
  const out = [0, 0, 0, 0];
  const pay = (seat: number, amount: number) => {
    out[seat] -= amount;
    out[winner] += amount;
  };
  for (let seat = 0; seat < 4; seat++) {
    if (seat === winner) continue;
    if (from === null) pay(seat, value);
    else if (seat === from) pay(seat, value);
    else if (rules.othersPayHalf) pay(seat, Math.ceil(value / 2));
  }
  return out;
}
