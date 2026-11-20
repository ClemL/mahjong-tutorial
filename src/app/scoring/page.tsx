import type { Metadata } from "next";
import Link from "next/link";
import { DEFAULT_FAAN, DEFAULT_RULES, halfShare } from "@/game/rules";
import { faanValue } from "@/game/scoring";
import { PATTERNS } from "@/tutorial/scoring";
import { FaanDrill } from "@/components/scoring/FaanDrill";
import { FaanQuiz } from "@/components/scoring/FaanQuiz";
import { ScoringLab } from "@/components/scoring/ScoringLab";
import { MinimumChoices, PatternTier, PayoutTable, ReadingsDemo } from "@/components/scoring/ScoringSections";

export const metadata: Metadata = {
  title: "Scoring",
  description:
    "Hong Kong mahjong scoring from the first faan to the limit hands: the payout table, who pays, every pattern with an example, and a scoring lab.",
};

const SECTIONS = [
  ["basics", "Faan and points"],
  ["paying", "Who pays"],
  ["everyday", "Everyday faan"],
  ["lab", "Scoring lab"],
  ["bigger", "Bigger hands"],
  ["limit", "Limit hands"],
  ["fine-print", "The fine print"],
  ["quiz", "Test yourself"],
  ["drill", "Faan drill"],
  ["reference", "Full table"],
] as const;

export default function ScoringPage() {
  const three = faanValue(3, DEFAULT_RULES);
  return (
    <>
      <header className="page-head">
        <p className="eyebrow">Scoring</p>
        <h1>How a hand is scored</h1>
        <p className="lede">
          Winning is half the game; what you win with sets the price. Hong Kong scoring counts <strong>faan</strong>{" "}
          (番, “doubles”) and turns them into points. Every hand and number on this page is scored by the game&apos;s own
          engine, at the rules it plays by default.
        </p>
        <ul className="toc" aria-label="On this page">
          {SECTIONS.map(([id, title]) => (
            <li key={id}>
              <a href={`#${id}`}>{title}</a>
            </li>
          ))}
        </ul>
      </header>

      <section id="basics">
        <h2>Faan and points</h2>
        <div className="prose">
          <p>
            Each pattern in your hand is worth some faan: a dragon triplet 1, a half flush 3, a full flush 7. Add them
            up, and the total sets what the hand is worth. Points roughly <strong>double</strong> with each faan up to
            4, then climb in half-steps to the <strong>limit</strong> (滿糊) of {DEFAULT_RULES.limitFaan} faan,{" "}
            {faanValue(DEFAULT_RULES.limitFaan, DEFAULT_RULES)} points. Anything beyond the limit is paid at the limit.
          </p>
          <p>
            A hand must reach the table&apos;s <strong>minimum</strong> before it may be declared at all. The app
            offers <MinimumChoices /> faan. It starts at <strong>{DEFAULT_RULES.minFaan}</strong>, so mixed tables
            finish more hands; <strong>3</strong> is the classic Hong Kong standard. At 0, a <em>chicken hand</em> (雞糊)
            with no patterns at all can win for a single point.
          </p>
        </div>
        <PayoutTable />
      </section>

      <section id="paying">
        <h2>Who pays</h2>
        <div className="prose">
          <ul>
            <li>
              <strong>Self-draw (自摸):</strong> all three opponents pay the hand&apos;s value. A {three}-point hand
              collects {three * 3}.
            </li>
            <li>
              <strong>Off a discard:</strong> the player who threw the tile pays the full value, and the other two pay
              half each, rounded up — {three} + {halfShare(three)} + {halfShare(three)} = {three + 2 * halfShare(three)}{" "}
              for a {three}-point hand. Many tables make the thrower pay alone (出銃全包); the app can play that way.
            </li>
            <li>
              <strong>Liability (包):</strong> if you throw the tile that gives someone their third dragon set, or their
              fourth set of any kind, and they later win by self-draw, you pay all three shares alone.
            </li>
            <li>
              <strong>Two winners on one discard:</strong> by default only the first player after the thrower wins
              (截糊). A table can instead pay every winner (雙響, 三響).
            </li>
            <li>
              <strong>Washout (流局):</strong> nobody pays.
            </li>
          </ul>
        </div>
      </section>

      <section id="everyday">
        <h2>Everyday faan</h2>
        <PatternTier tier="everyday" />
      </section>

      <section id="lab">
        <h2>Scoring lab</h2>
        <div className="prose">
          <p>
            Pick a hand and change one thing at a time — claim a set, draw the winning tile yourself, sit in another
            seat — and watch the score change. Try the East wind hand from East&apos;s seat in the East round: one
            triplet, two faan.
          </p>
        </div>
        <ScoringLab />
      </section>

      <section id="bigger">
        <h2>Bigger hands</h2>
        <PatternTier tier="bigger" />
      </section>

      <section id="limit">
        <h2>Limit hands</h2>
        <PatternTier tier="limit" />
      </section>

      <section id="fine-print">
        <h2>The fine print</h2>
        <div className="prose">
          <h3>Nothing is counted twice</h3>
          <p>A bigger pattern replaces the smaller ones it already contains:</p>
          <ul>
            <li>Big or small three dragons replace the single dragon triplets.</li>
            <li>Big or small four winds replace the seat and round wind triplets.</li>
            <li>A full flush replaces the half flush.</li>
            <li>Terminals and honors, all terminals and all honors replace all triplets.</li>
            <li>All four flowers (or seasons) replace your own flower; all eight replace everything for bonus tiles.</li>
          </ul>
          <h3>The best reading wins</h3>
          <p>
            Some hands split into sets more than one way. The scorer tries every way and keeps whichever pays most:
          </p>
        </div>
        <ReadingsDemo />
        <div className="prose">
          <h3>Concealed and self-drawn</h3>
          <p>
            In the app a concealed hand won on a discard scores 1 faan (門前清), and a self-drawn win scores 1 faan
            (自摸) — but a concealed hand that self-draws scores the self-draw only, not both. Some house rules give
            both; this is one of the places your home table may differ.
          </p>
          <h3>Bonus tiles</h3>
          <p>
            Each Flower or Season numbered for your seat is 1 faan. Winning with none at all is 1 faan too (無花). A
            table that plays without bonus tiles scores neither. Unwanted flowers cost nothing — they just do not help.
          </p>
          <h3>At the deal</h3>
          <p>
            A dealer whose fourteen dealt tiles already win has a Heavenly Hand (天糊); a win on the dealer&apos;s first
            discard, or on your own first draw before anyone has claimed, is an Earthly Hand (地糊). Both are paid at
            the limit.
          </p>
        </div>
      </section>

      <section id="quiz">
        <h2>Test yourself</h2>
        <FaanQuiz />
      </section>

      <section id="drill">
        <h2>Faan drill</h2>
        <div className="prose">
          <p>
            Ten random winning hands, thirty seconds each. Count the faan; a hand you miss comes back two hands later
            until you get it. Counting fast is what lets you judge, mid-hand, whether a route is worth playing for.
          </p>
        </div>
        <FaanDrill />
      </section>

      <section id="reference">
        <h2>Full faan table</h2>
        <div className="prose">
          <p className="muted">
            The defaults in the app&apos;s <code>rules.ts</code>. The faan values are fixed; the minimum, liability,
            half payments, dead wall, two winners and the bonus tiles are settings on the table.
          </p>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Pattern</th>
                <th>Chinese</th>
                <th className="num">Faan</th>
              </tr>
            </thead>
            <tbody>
              {PATTERNS.map((p) => (
                <tr key={p.key}>
                  <td>
                    <a href={`#p-${p.key}`}>{p.name}</a>
                  </td>
                  <td className="cjk">{p.chinese}</td>
                  <td className="num">{p.faan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted small">
          Seat wind, round wind and dragon triplets share one value ({DEFAULT_FAAN.honorTriplet} faan each).{" "}
          <Link href="/table-players">How this compares to other Hong Kong tables</Link>.
        </p>
      </section>
    </>
  );
}
