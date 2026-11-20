export interface LessonMeta {
  slug: string;
  title: string;
  summary: string;
  /** Tiles drawn on the lesson's card. */
  tiles: string[];
}

export const LESSONS: LessonMeta[] = [
  {
    slug: "tiles",
    title: "The tiles",
    summary: "144 tiles: three suits, four winds, three dragons and eight bonus tiles.",
    tiles: ["m1", "p1", "s1", "we", "dr"],
  },
  {
    slug: "sets",
    title: "Sets and the pair",
    summary: "Chow, pung, kong — and the pair that every hand needs.",
    tiles: ["m3", "m4", "m5", "dg", "dg", "dg"],
  },
  {
    slug: "winning-hand",
    title: "A winning hand",
    summary: "Four sets and a pair. Try splitting a hand yourself.",
    tiles: ["p1", "p2", "p3", "s5", "s5"],
  },
  {
    slug: "turns",
    title: "Seats, the wall and a turn",
    summary: "Who deals, which way play goes, and what happens to a flower.",
    tiles: ["we", "ws", "ww", "wn"],
  },
  {
    slug: "claims",
    title: "Claiming discards",
    summary: "When you may take someone else's tile — and who gets it when two want it.",
    tiles: ["p4", "p5", "p6"],
  },
  {
    slug: "ready",
    title: "Being ready",
    summary: "One tile from winning: reading which tiles finish your hand.",
    tiles: ["s4", "s5", "back"],
  },
  {
    slug: "strategy",
    title: "First strategy",
    summary: "What to throw, what to keep, and when to say no to a claim.",
    tiles: ["wn", "m1", "p5"],
  },
  {
    slug: "playing-for-faan",
    title: "Playing for faan",
    summary: "Speed against value: keep a hand worth declaring, and know which winning tiles count.",
    tiles: ["p2", "p3", "p4", "wn", "wn", "wn"],
  },
  {
    slug: "reading-the-table",
    title: "Reading the table",
    summary: "Count what is left, and work out what each opponent is building.",
    tiles: ["s5", "s5", "s5", "back", "back"],
  },
  {
    slug: "defense",
    title: "Defense",
    summary: "Which tiles are safe late in a hand — and the one that makes you pay for someone else's win.",
    tiles: ["dr", "dg", "dw"],
  },
];

export function lessonIndex(slug: string): number {
  return LESSONS.findIndex((l) => l.slug === slug);
}
