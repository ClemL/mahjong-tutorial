import Link from "next/link";
import { LESSONS } from "@/tutorial/lessons";
import { SECTIONS } from "@/tutorial/site";
import { TileGroups, TileRow } from "@/components/Tiles";
import { FilmButton } from "@/components/site/FilmButton";

const SECTION_TILES: Record<string, string[]> = {
  "/learn": ["m1", "m2", "m3"],
  "/example": ["dr", "dr", "dr"],
  "/practice": ["back", "back", "back", "p5"],
  "/scoring": ["s1", "s1", "s1", "s1"],
  "/table-players": ["we", "ws", "ww", "wn"],
  "/history": ["f1", "f5"],
};

export default function Home() {
  return (
    <>
      <section className="hero">
        <div>
          <p className="eyebrow">Hong Kong old-style mahjong</p>
          <h1>Learn mahjong, one tile at a time</h1>
          <p className="lede">
            Short lessons you can try as you read, a hand played with a coach beside you, practice against the
            computer, and scoring explained from your first faan to the limit hands. Already play at a real table? Start
            with <Link href="/table-players">what is different here</Link>.
          </p>
          <div className="hero__actions">
            <Link href={`/learn/${LESSONS[0]!.slug}`} className="btn btn--primary btn--lg">
              Start lesson 1
            </Link>
            <Link href="/example" className="btn btn--lg">
              Play the example hand
            </Link>
            <FilmButton />
          </div>
        </div>
        <div className="hero__table" aria-label="A winning hand: four sets and a pair">
          <TileGroups
            groups={[
              ["m2", "m3", "m4"],
              ["p6", "p7", "p8"],
              ["s5", "s5", "s5"],
              ["dr", "dr", "dr"],
              ["wn", "wn"],
            ]}
            size="md"
          />
          <p className="hero__label">Four sets and a pair. By the end of lesson 3 you will read this at a glance.</p>
        </div>
      </section>

      <h2>Where to start</h2>
      <div className="cards">
        {SECTIONS.map((s, i) => (
          <Link key={s.href} href={s.href} className="card">
            <span className="card__step">{i < 3 ? `Step ${i + 1}` : "Any time"}</span>
            <h3 className="card__title">{s.label}</h3>
            <p className="card__text">{s.blurb}</p>
            <span className="card__tiles">
              <TileRow codes={SECTION_TILES[s.href] ?? []} size="sm" />
            </span>
          </Link>
        ))}
      </div>

      <h2>What you will be playing</h2>
      <div className="prose">
        <p>
          This tutorial teaches the rules of the{" "}
          <a href="https://clem-mahjong.vercel.app/" target="_blank" rel="noreferrer">
            Hong Kong Mahjong table
          </a>
          : the full 144-tile set, chow, pung and kong claims, and faan scoring with a doubling payout. The game is
          played round a tablet acting as the table, with each player on their phone; empty chairs are played by the
          computer. The tiles, colors and computer players on these pages are the game&apos;s own, so what you learn
          here is exactly what you will see there.
        </p>
      </div>
    </>
  );
}
