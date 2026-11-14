"use client";

import { useState } from "react";
import { FilmDialog } from "@/components/FilmPlayer";
import { RUNTIME } from "@/film/script";

/** The game's own hand-drawn explainer film, opened over the page. */
export function FilmButton({ className = "btn btn--lg" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const minutes = Math.floor(RUNTIME / 60);
  const seconds = String(Math.round(RUNTIME % 60)).padStart(2, "0");
  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        ▶ Watch the film · {minutes}:{seconds}
      </button>
      {open ? <FilmDialog onClose={() => setOpen(false)} /> : null}
    </>
  );
}
