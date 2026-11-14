import type { Metadata } from "next";
import { GuidedGame } from "@/components/game/GuidedGame";

export const metadata: Metadata = {
  title: "Example hand",
  description: "Play one hand of Hong Kong mahjong with a coach: a discard, a chow, a pung, a claim to refuse and a self-drawn win.",
};

export default function ExamplePage() {
  return (
    <>
      <header className="page-head">
        <p className="eyebrow">Interactive example</p>
        <h1>Play your first hand</h1>
        <p className="lede">
          You sit East. A coach tells you what to do and why, one move at a time: throw a lone tile, chow, pung, turn
          down a claim, and win on a tile you draw yourself.
        </p>
      </header>
      <GuidedGame />
    </>
  );
}
