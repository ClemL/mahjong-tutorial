import type { Metadata } from "next";
import Link from "next/link";
import { GAME_URL } from "@/tutorial/site";
import { PracticeGame } from "@/components/game/PracticeGame";

export const metadata: Metadata = {
  title: "Practice",
  description: "Play whole hands of Hong Kong mahjong against the game's computer players, with an optional coach.",
};

export default function PracticePage() {
  return (
    <>
      <header className="page-head">
        <p className="eyebrow">Practice table</p>
        <h1>Play against the computer</h1>
        <p className="lede">
          A real shuffled deal and the same three computer players the game uses. The coach can tell you how far you
          are from ready, suggest a discard and say which tiles you are waiting on.
        </p>
      </header>
      <PracticeGame />
      <p className="muted small practice__note">
        This practice table runs on one screen so you can learn. The real game is played round a tablet with a phone
        for each player — <Link href="/table-players">here is how that works</Link>, or{" "}
        <a href={GAME_URL} target="_blank" rel="noreferrer">
          open the game
        </a>
        .
      </p>
    </>
  );
}
