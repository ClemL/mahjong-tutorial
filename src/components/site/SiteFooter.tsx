import Link from "next/link";
import { GAME_URL, REPO_URL, SECTIONS } from "@/tutorial/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <nav aria-label="All sections" className="site-footer__nav">
          {SECTIONS.map((s) => (
            <Link key={s.href} href={s.href}>
              {s.label}
            </Link>
          ))}
        </nav>
        <p>
          Rules, tiles and scoring are the{" "}
          <a href={GAME_URL} target="_blank" rel="noreferrer">
            Hong Kong Mahjong table
          </a>
          &apos;s own: every example on these pages is checked by its game engine. Source on{" "}
          <a href={REPO_URL} target="_blank" rel="noreferrer">
            GitHub
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
