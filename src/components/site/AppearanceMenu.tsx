"use client";

import { useEffect, useRef, useState } from "react";
import { SUIT_PALETTES, THEMES, TILE_STYLES } from "@/game/appearance";
import { useAppearance } from "@/hooks/useAppearance";
import { Choice } from "@/components/Choice";
import { TileFace } from "@/components/TileView";

/** The game's own look settings: table color, tile faces and suit inks. */
export function AppearanceMenu() {
  const api = useAppearance();
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (panel.current && !panel.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <div className="look" ref={panel}>
      <button
        type="button"
        className="btn btn--sm look__toggle"
        aria-expanded={open}
        aria-controls="look-panel"
        onClick={() => setOpen((o) => !o)}
      >
        <span aria-hidden>🀄︎</span> Look
      </button>
      {open ? (
        <div id="look-panel" className="look__panel" role="dialog" aria-label="Table and tiles">
          <p className="look__note">The same choices as the game&apos;s Table &amp; tiles settings.</p>
          <div className="look__preview" aria-hidden>
            {["m5", "p5", "s5", "we", "dr", "dw", "f2"].map((c) => (
              <TileFace key={c} code={c} size="md" />
            ))}
          </div>
          <Choice label="Tile faces" options={TILE_STYLES} value={api.appearance.tiles} onChange={(v) => api.set("tiles", v)} />
          <Choice label="Table" options={THEMES} value={api.appearance.theme} onChange={(v) => api.set("theme", v)} />
          <Choice label="Suit colors" options={SUIT_PALETTES} value={api.appearance.suits} onChange={(v) => api.set("suits", v)} />
        </div>
      ) : null}
    </div>
  );
}
