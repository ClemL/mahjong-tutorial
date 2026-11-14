/** The main sections, in reading order. */
export const SECTIONS = [
  { href: "/learn", label: "Learn", blurb: "Seven short lessons, each with something to try." },
  { href: "/example", label: "Example hand", blurb: "Play one hand with a coach at your shoulder." },
  { href: "/practice", label: "Practice", blurb: "Play whole hands against three computer opponents." },
  { href: "/scoring", label: "Scoring", blurb: "From your first faan to the limit hands." },
  { href: "/table-players", label: "Table players", blurb: "Already play at a real table? What is different here." },
  { href: "/history", label: "History", blurb: "From Qing dynasty parlors to phones round a tablet." },
] as const;

export const GAME_URL = "https://clem-mahjong.vercel.app/";
export const REPO_URL = "https://github.com/ClemL/mahjong-tutorial";
