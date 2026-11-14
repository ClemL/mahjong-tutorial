import type { Metadata } from "next";
import { TileRow } from "@/components/Tiles";

export const metadata: Metadata = {
  title: "History",
  description:
    "Where mahjong came from: Qing dynasty China, the 1920s American craze, the bans and rule books, and the variants played today.",
};

interface Event {
  when: string;
  title: string;
  text: string;
}

const TIMELINE: Event[] = [
  {
    when: "c. 1850–1880",
    title: "A tile game takes shape in Qing China",
    text:
      "Mahjong appears in the lower Yangtze region — Ningbo and Shanghai are the usual candidates — growing out of " +
      "older Chinese card games. The card historian Thierry Depaulis puts a form of it as early as 1850; a museum in " +
      "Ningbo credits a local official, Chen Yumen (陳魚門, 1817–1878), with turning paper cards into tiles. Nobody has " +
      "proved a single inventor.",
  },
  {
    when: "1900s",
    title: "City parlors across China",
    text:
      "Tile sets of bone and bamboo spread through China's treaty ports and cities, where the game is played in " +
      "homes, clubs and teahouses — and, very often, for money.",
  },
  {
    when: "1920",
    title: "Babcock's red book",
    text:
      "Joseph Park Babcock, a Standard Oil employee who learned the game in China, publishes Rules of Mah-Jongg. He " +
      "simplifies the rules, adds English index numbers to the tiles and trademarks the spelling “Mah-Jongg”.",
  },
  {
    when: "1922–1924",
    title: "The American craze",
    text:
      "Sets are imported from China in bulk and mahjong becomes a fad across the United States. Many of Babcock's " +
      "simplifications are dropped as players look for the richer Chinese scoring.",
  },
  {
    when: "1920s",
    title: "Japan's first clubs",
    text:
      "The game reaches Japan; the earliest known club, Jakusenkai, opens in Akasaka, Tokyo, in 1920. After the war, Japanese " +
      "players settle into what becomes riichi mahjong — still without a single official rule book.",
  },
  {
    when: "1937",
    title: "The National Mah Jongg League",
    text:
      "Players in New York found the NMJL to standardize the American game. It publishes a new card of winning hands " +
      "every year, and American mahjong drifts further from the Chinese game, later adding jokers.",
  },
  {
    when: "1949",
    title: "Banned in mainland China",
    text:
      "The new People's Republic outlaws mahjong as gambling. The game survives in Hong Kong, Taiwan and across the " +
      "Chinese diaspora.",
  },
  {
    when: "1956",
    title: "Hong Kong licenses its parlors",
    text:
      "Gambling had been illegal in Hong Kong since 1871, but the colonial government begins licensing mahjong " +
      "“schools” (麻雀館). Fewer than seventy licensed parlors remain today.",
  },
  {
    when: "1981–1986",
    title: "A different game with the same tiles",
    text:
      "Brodie Lockard writes a tile-matching puzzle on the PLATO system in 1981; Activision sells it as Shanghai in " +
      "1986. “Mahjong solitaire” uses mahjong tiles but has nothing to do with the four-player game.",
  },
  {
    when: "1985",
    title: "Back on the mainland",
    text: "China lifts the ban on mahjong played without gambling, and the game returns to homes and parks.",
  },
  {
    when: "1998",
    title: "An official rule book",
    text:
      "China's State Sports Commission publishes the Mahjong Competition Rules (国标麻将): 81 scoring patterns, an " +
      "8-point minimum, and no gambling, drinking or smoking at the table.",
  },
  {
    when: "2002",
    title: "A first world championship",
    text:
      "Tokyo hosts a world championship, organized by Japanese mahjong bodies and the Ningbo Mahjong Sport " +
      "Association. The World Mahjong Organization follows in 2006.",
  },
];

const VARIANTS: [string, string, string][] = [
  ["Hong Kong (old style)", "13 tiles + 1", "Faan with doubling payouts, flowers by seat, a minimum (often 3 faan). This app."],
  ["Chinese Official (国标)", "13 tiles + 1", "81 patterns, points added rather than doubled, 8-point minimum. Used in international competition."],
  ["Japanese riichi", "13 tiles + 1", "No flowers; declare riichi when ready; bonus dora tiles; a hand needs at least one scoring pattern (yaku)."],
  ["Taiwanese", "16 tiles + 1", "Five sets and a pair; flowers; scored in tai."],
  ["American (NMJL)", "13 tiles + 1", "Jokers, a pre-game tile pass (the Charleston), and a card of winning hands that changes every year."],
];

const SOURCES: [string, string][] = [
  ["Mahjong — Wikipedia", "https://en.wikipedia.org/wiki/Mahjong"],
  ["Sloperama Mah-Jongg FAQ 11: history and the Chen Yumen claim", "https://sloperama.com/mjfaq/mjfaq11c.html"],
  ["Joseph Park Babcock — Wikipedia", "https://en.wikipedia.org/wiki/Joseph_Park_Babcock"],
  ["About the League — National Mah Jongg League", "https://nationalmahjonggleague.org/league.aspx"],
  ["Japanese mahjong — Wikipedia", "https://en.wikipedia.org/wiki/Japanese_mahjong"],
  ["Mahjong: The King of Chinese Games — The Diplomat (2013)", "https://thediplomat.com/2013/10/mahjong-the-king-of-chinese-games"],
  ["Mahjong school — Wikipedia", "https://en.wikipedia.org/wiki/Mahjong_school"],
  ["Shanghai (video game) — Wikipedia", "https://en.wikipedia.org/wiki/Shanghai_(video_game)"],
  ["2002 World Championship in Mahjong — Wikipedia", "https://en.wikipedia.org/wiki/2002_World_Championship_in_Mahjong"],
  ["World Mahjong Organization — Wikipedia", "https://en.wikipedia.org/wiki/World_Mahjong_Organization"],
];

export default function HistoryPage() {
  return (
    <>
      <header className="page-head">
        <p className="eyebrow">History</p>
        <h1>From Qing parlors to a tablet on the table</h1>
        <p className="lede">
          Mahjong is younger than it looks — about 150 years old — and its exact birth is still argued over. What is
          clear is how far it has travelled since.
        </p>
      </header>

      <section>
        <h2>The name, and the bird</h2>
        <div className="prose">
          <p>
            In Cantonese the game is 麻雀 — <em>maa jeuk</em>, &ldquo;sparrow&rdquo; — which is why the 1 Bamboo on a
            Hong Kong set is a bird. In Mandarin it is usually 麻將, <em>májiàng</em>. &ldquo;Mahjong&rdquo; and
            Babcock&apos;s &ldquo;Mah-Jongg&rdquo; are English spellings of the same words.
          </p>
          <p>
            The three suits are usually traced to money-suited Chinese playing cards: coins (the Dots 筒), strings of
            coins (the Bamboo 索) and myriads, ten thousand coins (the Characters 萬).
          </p>
        </div>
        <TileRow codes={["s1", "p1", "m1"]} size="lg" label="The 1 Bamboo bird, the 1 Dot coin and the 1 Character" />
      </section>

      <section>
        <h2>Timeline</h2>
        <ol className="timeline">
          {TIMELINE.map((e) => (
            <li key={e.when + e.title} className="timeline__item">
              <span className="timeline__when">{e.when}</span>
              <div className="timeline__what">
                <h3>{e.title}</h3>
                <p>{e.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="callout">
          <span className="callout__title">How sure is this?</span>
          <p>
            The twentieth-century dates are well documented. The origin is not: early accounts disagree by decades,
            several popular histories repeat each other without sources, and the Chen Yumen story comes from a museum
            with a stake in the answer. Treat any single &ldquo;inventor&rdquo; with caution.
          </p>
        </div>
      </section>

      <section>
        <h2>One game, many rule books</h2>
        <div className="prose">
          <p>
            There has never been one mahjong. These are the families most players meet today; the tiles are shared, the
            scoring is not.
          </p>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Variant</th>
                <th>Hand</th>
                <th>What sets it apart</th>
              </tr>
            </thead>
            <tbody>
              {VARIANTS.map(([name, hand, what]) => (
                <tr key={name}>
                  <th scope="row">{name}</th>
                  <td>{hand}</td>
                  <td>{what}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="prose">
          <p>
            Hong Kong old style keeps things compact: a short list of patterns and a payout that doubles with each
            faan. Hong Kong tables also play a &ldquo;new style&rdquo; with a
            longer list of patterns; this tutorial and the app teach the old one.
          </p>
        </div>
      </section>

      <section>
        <h2>Sources</h2>
        <ol className="sources">
          {SOURCES.map(([title, url]) => (
            <li key={url}>
              <a href={url} target="_blank" rel="noreferrer">
                {title}
              </a>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
