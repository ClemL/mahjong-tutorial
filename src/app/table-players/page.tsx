import type { Metadata } from "next";
import Link from "next/link";
import { DEAD_WALL_TILES, DEFAULT_RULES, MIN_FAAN_CHOICES, STARTING_CHIPS } from "@/game/rules";
import { faanValue } from "@/game/scoring";
import { GAME_URL } from "@/tutorial/site";
import { TileRow } from "@/components/Tiles";

export const metadata: Metadata = {
  title: "For table players",
  description:
    "Already play mahjong at a real table? How the Hong Kong Mahjong app differs: a tablet as the table, a phone per player, strict claim order, and the house rules it plays.",
};

const on = (b: boolean) => (b ? "On" : "Off");

/** What a table changes, set against how the app handles it. Facts are the game's, as of November 2026. */
const DIFFERENCES: [string, string, string][] = [
  ["The table", "Tiles on felt, racks in front of you", "A tablet lies in the middle as the table; your phone, held sideways, is your rack"],
  ["Players", "Four people, or no game", "One to four people; the computer plays any empty chair (Easy, Normal or Hard)"],
  ["Shuffling and the wall", "Wash the tiles, build the wall, roll dice, break it", "The server shuffles; nobody builds or breaks anything"],
  ["Calling a discard", "Shout first; argue about who was first", "One seat is asked at a time, strongest claim first, with 20 seconds to answer"],
  ["Mistakes", "False wins, short or long hands, dead hands", "Impossible: only legal claims are offered, and Win only appears when the hand is complete and worth enough"],
  ["Counting the score", "Someone counts, someone checks", "Scored and paid automatically, choosing the reading of your hand that pays most"],
  ["Money", "Chips or cash change hands", `Points only: everyone starts with ${STARTING_CHIPS} chips`],
  ["Seat winds", "The dealer is always East; winds move with the deal", "Each chair keeps its wind all game, and so does its flower number"],
];

export default function TablePlayersPage() {
  const r = DEFAULT_RULES;
  return (
    <>
      <header className="page-head">
        <p className="eyebrow">For table players</p>
        <h1>You know the game. Here is what is different.</h1>
        <p className="lede">
          The{" "}
          <a href={GAME_URL} target="_blank" rel="noreferrer">
            Hong Kong Mahjong
          </a>{" "}
          app plays the game you know, old-style Hong Kong rules with 144 tiles and faan scoring, but it is laid out
          differently, it enforces things a real table leaves to trust, and it has house rules of its own. This page is
          the short version.
        </p>
        <ul className="toc" aria-label="On this page">
          <li>
            <a href="#glance">At a glance</a>
          </li>
          <li>
            <a href="#setup">Sitting down</a>
          </li>
          <li>
            <a href="#play">During a hand</a>
          </li>
          <li>
            <a href="#rules">House rules</a>
          </li>
          <li>
            <a href="#extras">What a table cannot do</a>
          </li>
          <li>
            <a href="#missing">What it does not do</a>
          </li>
        </ul>
      </header>

      <section id="glance">
        <h2>At a glance</h2>
        <div className="table-scroll">
          <table className="data-table compare-table">
            <thead>
              <tr>
                <th></th>
                <th>At a real table</th>
                <th>In the app</th>
              </tr>
            </thead>
            <tbody>
              {DIFFERENCES.map(([topic, table, app]) => (
                <tr key={topic}>
                  <th scope="row">{topic}</th>
                  <td>{table}</td>
                  <td>{app}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="setup">
        <h2>Sitting down</h2>
        <div className="prose">
          <ul>
            <li>
              <strong>Two devices at least.</strong> A tablet is the table and at least one phone is a player. There is
              no game on one device — the <Link href="/practice">practice table</Link> here is the place for that.
            </li>
            <li>
              <strong>Three fixed tables, no room codes.</strong> Open Table 1, 2 or 3 on the start page. The tablet
              shows one large QR code for the next open chair; scan it and you are seated. A name typed under the code
              comes with it. Anyone with the link can sit down — there is no password.
            </li>
            <li>
              <strong>The tablet tells you where to sit</strong> — for example <em>Seat 1 East · bottom edge</em> — so
              the chairs round the real table match the seats in the game. Before the deal, people can swap chairs.
            </li>
            <li>
              <strong>Only the tablet deals.</strong> Four people arriving one at a time all start the same hand. After
              each hand, every phone taps <em>Ready</em>; when the last person does, the next hand is dealt.
            </li>
          </ul>
        </div>
      </section>

      <section id="play">
        <h2>During a hand</h2>
        <div className="compare">
          <div className="compare__col panel-block">
            <h3>On the tablet</h3>
            <ul>
              <li>Each player&apos;s discards sit in front of them, where their tiles would land — not in one central pile.</li>
              <li>Open sets, flowers, how many tiles each player holds, scores, the round and the tiles left.</li>
              <li>Tap any discarded tile and every copy of it in sight is ringed and counted.</li>
              <li>Calls are spoken in Cantonese — 碰, 上, 槓, 食糊, 自摸 — and, if switched on, every discard is named.</li>
              <li>The table can pause the hand; every clock stops.</li>
              <li>It never receives anyone&apos;s concealed tiles.</li>
            </ul>
          </div>
          <div className="compare__col panel-block">
            <h3>On your phone</h3>
            <ul>
              <li>Only your own hand and the decisions that are yours: discard, chow, pung, kong, win or pass.</li>
              <li>Discarding takes two taps on a touch screen — pick the tile, then throw it — so a stray thumb costs nothing.</li>
              <li>
                <em>Take back</em> (an assist, off by default) gives you five seconds to take a discard back, until
                someone claims it.
              </li>
              <li>Swipe across to see everyone&apos;s discards, sorted as thrown, by suit, or pooled by tile.</li>
              <li>Optional helpers underline finished sets and show what each started set needs, and how many are left.</li>
            </ul>
          </div>
        </div>
        <div className="prose">
          <h3>Claims are taken in order, not by who shouts first</h3>
          <p>
            When a tile is thrown, the app asks one seat at a time, strongest claim first: <strong>win</strong>, then{" "}
            <strong>pung or kong</strong>, then <strong>chow</strong>. Nobody is offered a chow while someone else could
            still pung the tile. You have 20 seconds to answer (with two or more sets to choose between, you can ask
            once for 20 more); the computer answers at once, and an unanswered call counts as a pass. There is no &ldquo;I said it first.&rdquo;
          </p>
          <h3>Turn clocks and nudges</h3>
          <p>
            The table can set a time limit on each turn (off, 15, 30, 60 or 120 seconds; the first turn of a hand gets a
            minute more). Players can turn on <em>Hurry up</em> to nudge someone slow — not in the first three seconds,
            and not twice within ten. A phone left silent for five minutes is marked away and the computer plays for it
            until it returns.
          </p>
        </div>
      </section>

      <section id="rules">
        <h2>The house rules it plays</h2>
        <div className="prose">
          <p>
            Hong Kong scoring has always been a house-rules affair. These are the app&apos;s defaults; the ones marked
            &ldquo;setting&rdquo; can be changed on the tablet, most of them even mid-game.
          </p>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Rule</th>
                <th>In the app</th>
                <th>Setting?</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Minimum faan to win</td>
                <td>
                  {r.minFaan} (choices {MIN_FAAN_CHOICES.join(", ")}). Hong Kong&apos;s classic standard is 3.
                </td>
                <td>Setting</td>
              </tr>
              <tr>
                <td>Limit</td>
                <td>
                  {r.limitFaan} faan = {faanValue(r.limitFaan, r)} points; payout 1 · 2 · 4 · 8 · 16 · 24 · 32 · 48 · 64 · 96 · 128
                </td>
                <td>No</td>
              </tr>
              <tr>
                <td>Win off a discard</td>
                <td>Thrower pays in full, the other two pay half each (rounded up)</td>
                <td>Setting: thrower pays alone (出銃全包)</td>
              </tr>
              <tr>
                <td>Two can win on one discard</td>
                <td>Only the first after the thrower (截糊)</td>
                <td>Setting: pay every winner (雙響)</td>
              </tr>
              <tr>
                <td>Liability 包</td>
                <td>{on(r.liability)}: feeding a third dragon set or a fourth set pays the whole self-drawn win</td>
                <td>Setting</td>
              </tr>
              <tr>
                <td>End of the wall</td>
                <td>Every tile is played before a washout</td>
                <td>Setting: leave a dead wall of {DEAD_WALL_TILES}</td>
              </tr>
              <tr>
                <td>Flowers and Seasons</td>
                <td>{on(r.flowers)} — own flower 1 faan, all four 3, all eight the limit, none at all 1</td>
                <td>Setting: play with 136 tiles</td>
              </tr>
              <tr>
                <td>Game length</td>
                <td>All four wind rounds</td>
                <td>Setting: East only, or East and South</td>
              </tr>
              <tr>
                <td>Dealer after a washout</td>
                <td>The deal passes on (only a dealer&apos;s win keeps it)</td>
                <td>No</td>
              </tr>
              <tr>
                <td>Seat winds</td>
                <td>Fixed to the chair for the whole game</td>
                <td>No</td>
              </tr>
              <tr>
                <td>Seven pairs</td>
                <td>Not a winning hand; Thirteen Orphans is the only hand that is not sets and a pair</td>
                <td>No</td>
              </tr>
              <tr>
                <td>Concealed self-draw</td>
                <td>1 faan for the self-draw; the concealed-hand faan is only for wins off a discard</td>
                <td>No</td>
              </tr>
              <tr>
                <td>All sequences 平糊</td>
                <td>1 faan with any pair and any wait</td>
                <td>No</td>
              </tr>
              <tr>
                <td>Kongs and flowers mid-hand</td>
                <td>Nothing is paid on the spot; everything is settled in the winner&apos;s faan</td>
                <td>No</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="callout">
          <span className="callout__title">The one to watch: seat winds</span>
          <p>
            At most tables the dealer is always East, so when the deal passes everyone&apos;s seat wind moves round. In
            the app each chair keeps its wind for the whole game: the South chair is South even while it deals. Your
            seat-wind triplet and your own flower number follow the chair, not the deal.
          </p>
        </div>
      </section>

      <section id="extras">
        <h2>What a table cannot do</h2>
        <div className="prose">
          <ul>
            <li>
              <strong>Replay a hand</strong> move by move once it is over, and keep a <strong>history</strong> of the
              table&apos;s finished games and each person&apos;s record.
            </li>
            <li>
              <strong>Achievements</strong> — twelve to earn, from <em>Off the Mark</em> (win a hand) to{" "}
              <em>Top of the Table</em> — and end-of-game stats: time on turns, hurry-ups, pungs and chows.
            </li>
            <li>
              <strong>Share scores</strong> as a picture from the final scores.
            </li>
            <li>
              <strong>Choose the tiles&apos; look</strong>: five tables, five tile faces — Hong Kong (painted, the
              default), Pips, Indexed, Numerals and Western — and three suit palettes. Try them with the{" "}
              <em>Look</em> button at the top of this page.
            </li>
          </ul>
        </div>
        <div className="face-strip" aria-hidden>
          <TileRow codes={["m7", "p7", "s7", "dr", "dg", "dw", "f3"]} size="md" />
        </div>
      </section>

      <section id="missing">
        <h2>What it does not do</h2>
        <div className="prose">
          <ul>
            <li>No game on a single device, and no upright phone layout: phones play sideways.</li>
            <li>No accounts and no password: anyone with the link can take a chair. A rate limit stops chair-grabbing.</li>
            <li>No money: chips are points.</li>
            <li>
              No house rules beyond the settings above — no seven pairs, no kong payments, no dealer bonus, no rotating
              seat winds.
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}
