import type { Metadata } from "next";
import Link from "next/link";
import { LESSONS } from "@/tutorial/lessons";
import { TileRow } from "@/components/Tiles";

export const metadata: Metadata = {
  title: "Learn to play",
  description: "Ten short lessons on Hong Kong mahjong, each with something to try.",
};

export default function LearnIndex() {
  return (
    <>
      <header className="page-head">
        <p className="eyebrow">Learn to play</p>
        <h1>Ten short lessons</h1>
        <p className="lede">
          From the tiles to defense, about forty minutes in all. Each lesson ends with something to try —
          and every answer is checked by the same rules engine the game plays with.
        </p>
      </header>
      <ol className="cards path" aria-label="Lessons">
        {LESSONS.map((lesson, i) => (
          <li key={lesson.slug} className="path__item">
            <Link href={`/learn/${lesson.slug}`} className="card">
              <span className="card__step">Lesson {i + 1}</span>
              <h2 className="card__title">{lesson.title}</h2>
              <p className="card__text">{lesson.summary}</p>
              <span className="card__tiles">
                <TileRow codes={lesson.tiles} size="sm" />
              </span>
            </Link>
          </li>
        ))}
        <li className="path__item">
          <Link href="/example" className="card">
            <span className="card__step">Then</span>
            <h2 className="card__title">Play the example hand</h2>
            <p className="card__text">One hand with a coach: a chow, a pung, a claim to refuse and a self-drawn win.</p>
            <span className="card__tiles">
              <TileRow codes={["p2", "p3", "p4"]} size="sm" />
            </span>
          </Link>
        </li>
      </ol>
    </>
  );
}
