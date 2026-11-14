import Link from "next/link";
import type { ReactNode } from "react";
import { DEFAULT_RULES } from "@/game/rules";
import { TileGroups, TileRow } from "@/components/Tiles";
import { ClaimQuiz } from "./ClaimQuiz";
import { DiscardQuiz } from "./DiscardQuiz";
import { HandSorter } from "./HandSorter";
import { SeatingDiagram } from "./SeatingDiagram";
import { SetQuiz } from "./SetQuiz";
import { TileExplorer } from "./TileExplorer";
import { WaitQuiz } from "./WaitQuiz";

function Tiles() {
  return (
    <>
      <div className="prose">
        <p>
          A Hong Kong set has <strong>144 tiles</strong>. Most of them belong to three <strong>suits</strong>, each
          numbered 1 to 9, with four copies of every tile:
        </p>
      </div>
      <TileGroups
        groups={[
          ["m1", "m2", "m3", "m4", "m5", "m6", "m7", "m8", "m9"],
          ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8", "p9"],
          ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9"],
        ]}
        size="md"
        caption="Characters 萬 (top), Dots 筒 and Bamboo 索. 3 suits × 9 numbers × 4 copies = 108 tiles."
      />
      <div className="prose">
        <p>
          Characters carry the Chinese numeral: 一 二 三 四 五 六 七 八 九 are 1 to 9. Dots and Bamboo are counted
          by their pips, except the 1 Bamboo, which is a bird.
        </p>
        <p>
          The <strong>honor tiles</strong> have no numbers: four <strong>winds</strong> (East 東, South 南, West 西,
          North 北) and three <strong>dragons</strong> (red 中, green 發, white 白), again four of each — 28 tiles.
        </p>
      </div>
      <TileGroups
        groups={[
          ["we", "ws", "ww", "wn"],
          ["dr", "dg", "dw"],
        ]}
        caption="Winds and dragons."
      />
      <div className="prose">
        <p>
          Last come eight <strong>bonus tiles</strong>, one of each: four Flowers and four Seasons. They never join a
          hand. You set them aside when you draw them, draw again, and they may score you a faan at the end.
        </p>
      </div>
      <TileGroups groups={[["f1", "f2", "f3", "f4"], ["f5", "f6", "f7", "f8"]]} caption="Flowers 1–4 and Seasons 1–4." />
      <div className="callout">
        <span className="callout__title">Words you will meet</span>
        <p>
          <strong>Terminals</strong> are the 1s and 9s. <strong>Honors</strong> are winds and dragons. Together they
          are 幺九 — the tiles that connect in the fewest ways.
        </p>
      </div>
      <h2>Explore the set</h2>
      <div className="prose">
        <p>
          Tap any tile to see what it is. Chinese numerals hard to read at first? Switch the tile faces to
          <em> Western</em> — the game has the same setting, under Table &amp; tiles.
        </p>
      </div>
      <TileExplorer />
    </>
  );
}

function Sets() {
  return (
    <>
      <div className="prose">
        <p>
          You win by collecting your tiles into groups. There are three kinds of <strong>set</strong>, and one{" "}
          <strong>pair</strong>.
        </p>
      </div>
      <div className="set-kinds">
        <div className="panel-block">
          <h3>Chow 上 — a run</h3>
          <TileRow codes={["p3", "p4", "p5"]} />
          <p>Three numbers in a row, all in one suit. Honors never make runs, and 8-9-1 does not wrap round.</p>
        </div>
        <div className="panel-block">
          <h3>Pung 碰 — a triplet</h3>
          <TileRow codes={["dr", "dr", "dr"]} />
          <p>Three of the same tile. Any tile can make one, honors included.</p>
        </div>
        <div className="panel-block">
          <h3>Kong 槓 — four of a kind</h3>
          <TileRow codes={["s6", "s6", "s6", "s6"]} />
          <p>All four copies. It still counts as one set, so you draw an extra tile to make up for it.</p>
        </div>
        <div className="panel-block">
          <h3>Pair 眼 — the eyes</h3>
          <TileRow codes={["we", "we"]} />
          <p>Two of the same tile. A winning hand has exactly one.</p>
        </div>
      </div>
      <div className="prose">
        <p>
          The Chinese names are what players call out at the table: <em>chow</em>, <em>pung</em> and <em>kong</em> are
          English spellings of them. The app&apos;s table speaks them aloud in Cantonese when someone claims a tile.
        </p>
      </div>
      <h2>Try it</h2>
      <SetQuiz />
    </>
  );
}

function WinningHand() {
  return (
    <>
      <div className="prose">
        <p>
          A winning hand is <strong>four sets and a pair</strong>: 4 × 3 + 2 = 14 tiles. You hold 13 between turns,
          so the fourteenth — drawn from the wall or taken from a discard — is the one that wins.
        </p>
      </div>
      <TileGroups
        groups={[["m2", "m3", "m4"], ["p6", "p7", "p8"], ["s5", "s5", "s5"], ["dg", "dg", "dg"], ["wn", "wn"]]}
        caption="Two runs, two triplets and a pair of North winds: a complete hand."
      />
      <div className="prose">
        <p>The sets can be any mix of runs and triplets. A kong adds one tile but still counts as one set.</p>
        <p>
          There is one exception to the shape: <strong>Thirteen Orphans</strong> (十三么), one of every 1, 9, wind
          and dragon plus a second of any of them. Hong Kong old style has no <em>seven pairs</em> hand — if you
          learned that elsewhere, it does not win here.
        </p>
      </div>
      <TileRow codes={["m1", "m9", "p1", "p9", "s1", "s9", "we", "ws", "ww", "wn", "dr", "dg", "dw", "dw"]} size="sm" label="Thirteen orphans" />
      <div className="callout">
        <span className="callout__title">Shape is not quite enough</span>
        <p>
          A hand must also be worth the table&apos;s <strong>minimum faan</strong>. The app starts at{" "}
          {DEFAULT_RULES.minFaan} faan, and many Hong Kong tables play to 3. A dragon triplet is 1 faan; a hand of
          plain runs with nothing else is usually 0 or 1. <Link href="/scoring">Scoring</Link> covers it all.
        </p>
      </div>
      <h2>Arrange these hands</h2>
      <HandSorter />
    </>
  );
}

function Turns() {
  return (
    <>
      <div className="prose">
        <p>
          Four players sit round the table, each with a seat named after a wind. <strong>East</strong> is the dealer.
        </p>
      </div>
      <SeatingDiagram />
      <h2>Building the wall and dealing</h2>
      <div className="prose">
        <p>
          The tiles are shuffled face down and stacked into a square <strong>wall</strong>, two tiles high. Each player
          takes 13 tiles; the dealer takes a 14th and starts by discarding. Any bonus tile in a hand is laid face up at
          once and replaced from the <em>back</em> of the wall.
        </p>
      </div>
      <h2>A turn</h2>
      <ol className="steps">
        <li>
          <strong>Draw</strong> a tile from the wall. If it is a Flower or Season, lay it down and draw a replacement.
        </li>
        <li>
          <strong>Win</strong> if the tile finishes your hand, or declare a <strong>kong</strong> if you now hold four
          of a kind (and draw a replacement).
        </li>
        <li>
          Otherwise <strong>discard</strong> one tile face up in front of you. You are back to 13.
        </li>
        <li>
          Anyone may <strong>claim</strong> that discard (next lesson). If nobody does, the player on your right draws.
        </li>
      </ol>
      <div className="prose">
        <p>
          The hand ends when someone wins, or when the wall runs out — a <strong>washout</strong> (流局), where nobody
          pays. In the app every tile is drawn before a washout; some tables leave the last sixteen standing as a dead
          wall, and the app can play that way too.
        </p>
      </div>
      <h2>Rounds and the deal</h2>
      <div className="prose">
        <p>
          If the dealer wins, they deal again (連莊). Otherwise the deal moves one seat to the right. When it has gone
          all the way round, the <strong>round wind</strong> moves on — East round, then South, West and North. The
          round wind matters for scoring: a triplet of it is worth a faan to everyone.
        </p>
        <p>
          At a real table the new dealer always becomes East and everyone&apos;s seat wind shifts with the deal. The app
          keeps each chair&apos;s wind for the whole game instead — see <Link href="/table-players">Table players</Link>.
        </p>
      </div>
    </>
  );
}

function Claims() {
  return (
    <>
      <div className="prose">
        <p>
          Every discard is offered round the table. If it completes something in your hand, you may <strong>claim</strong>{" "}
          it instead of waiting for your turn:
        </p>
      </div>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Call</th>
              <th>Needs in your hand</th>
              <th>From whom</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Chow 上</td>
              <td>Two tiles of a run</td>
              <td>Only the player on your left (the one just before you)</td>
            </tr>
            <tr>
              <td>Pung 碰</td>
              <td>A pair of the tile</td>
              <td>Anyone</td>
            </tr>
            <tr>
              <td>Kong 槓</td>
              <td>Three of the tile</td>
              <td>Anyone</td>
            </tr>
            <tr>
              <td>Win 食糊</td>
              <td>A ready hand that the tile completes</td>
              <td>Anyone</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="prose">
        <p>
          A claimed set goes down <strong>face up</strong>, so everyone can see it. After a chow or pung you discard
          straight away; after a kong you draw a replacement first. Then play carries on to <em>your</em> right — so a
          pung can skip players.
        </p>
        <h3>When two players want the same tile</h3>
        <p>
          <strong>Win beats pung or kong, which beat chow.</strong> If two players could win on it, the one who plays
          first after the discarder takes it (截糊). Some tables pay both (雙響); the app can play that way too.
        </p>
        <h3>Kongs on your own turn</h3>
        <p>
          Four of a kind drawn yourself is a <strong>concealed kong</strong> (暗槓), laid down with its ends face down.
          Drawing the fourth tile of a pung you already claimed lets you <strong>add</strong> it (加槓) — but a player
          who wins on that tile may take it first: <em>robbing the kong</em> (搶槓).
        </p>
      </div>
      <div className="callout">
        <span className="callout__title">The trade-off</span>
        <p>
          Claiming is faster, but it shows your hand and costs the <em>concealed hand</em> faan. A chow in particular
          is often worth less than it looks.
        </p>
      </div>
      <h2>Try it</h2>
      <ClaimQuiz />
    </>
  );
}

function Ready() {
  return (
    <>
      <div className="prose">
        <p>
          A hand one tile from winning is <strong>ready</strong> — 聽牌, <em>ting</em>. What matters then is which tiles
          finish it, and how many of those are still out there.
        </p>
      </div>
      <div className="wait-kinds">
        <figure className="panel-block">
          <TileRow codes={["s4", "s5"]} />
          <figcaption>
            <strong>Two-sided</strong> — 3 or 6. Up to eight tiles.
          </figcaption>
        </figure>
        <figure className="panel-block">
          <TileRow codes={["p1", "p2"]} />
          <figcaption>
            <strong>Edge</strong> — only the 3.
          </figcaption>
        </figure>
        <figure className="panel-block">
          <TileRow codes={["m4", "m6"]} />
          <figcaption>
            <strong>Closed</strong> — only the 5.
          </figcaption>
        </figure>
        <figure className="panel-block">
          <TileRow codes={["dr"]} />
          <figcaption>
            <strong>Pair</strong> — its twin.
          </figcaption>
        </figure>
        <figure className="panel-block">
          <TileRow codes={["m2", "m2", "p8", "p8"]} />
          <figcaption>
            <strong>Two pairs</strong> — either one.
          </figcaption>
        </figure>
      </div>
      <div className="prose">
        <p>
          Count what you can see. If three 6 Bamboo are already in the discards, a 3-or-6 wait has five tiles left, not
          eight. The game&apos;s phone <em>Helper</em> assist does this count for you; learning to do it yourself is
          what makes you quick.
        </p>
      </div>
      <h2>Find the winning tiles</h2>
      <WaitQuiz />
    </>
  );
}

function Strategy() {
  return (
    <>
      <div className="prose">
        <h3>Early in the hand</h3>
        <ul>
          <li>
            Throw <strong>lone honors that cannot score for you</strong> first — a wind that is neither your seat nor
            the round. Keep dragons and your own winds a little longer: a pair of them can become a faan.
          </li>
          <li>
            Then <strong>lone terminals</strong>: a 1 only grows into 1-2-3, while a 5 can join three different runs.
          </li>
          <li>
            Keep <strong>connected tiles</strong>. Two-sided pairs like 4-5 are worth more than edges like 1-2 or gaps
            like 4-6.
          </li>
        </ul>
        <h3>Count your blocks</h3>
        <p>
          You need four sets and a pair. Once you have more partial sets than that, break the weakest — usually an edge
          or a closed wait.
        </p>
        <h3>Plan for faan</h3>
        <p>
          At a 3-faan table a fast hand worth nothing cannot win. Steer toward something that pays: a dragon or your own
          wind as a triplet, one suit plus honors (half flush, 3 faan), all triplets (3 faan), or staying concealed.
        </p>
        <h3>Say no to some claims</h3>
        <p>
          Do not pung your pair if it leaves you without eyes. Do not open a concealed hand for a chow when the concealed
          faan is all you have.
        </p>
        <h3>Defend late in the hand</h3>
        <p>
          Tiles a player has already discarded are safe against them. Someone with three sets of Bamboo on the table is
          probably after a flush — do not feed them Bamboo. And under <strong>liability</strong> (包), the player who
          discards the tile that gives someone their third dragon set, or their fourth set of any kind, pays that
          player&apos;s whole self-drawn win alone.
        </p>
      </div>
      <h2>Which tile goes?</h2>
      <DiscardQuiz />
      <div className="callout">
        <span className="callout__title">Ready to play</span>
        <p>
          That is the whole game. Play <Link href="/example">the example hand</Link> with a coach, then{" "}
          <Link href="/practice">practice</Link> against the computer.
        </p>
      </div>
    </>
  );
}

export const LESSON_CONTENT: Record<string, () => ReactNode> = {
  tiles: Tiles,
  sets: Sets,
  "winning-hand": WinningHand,
  turns: Turns,
  claims: Claims,
  ready: Ready,
  strategy: Strategy,
};
