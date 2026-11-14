"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SECTIONS } from "@/tutorial/site";
import { AppearanceMenu } from "./AppearanceMenu";

export function SiteHeader() {
  const path = usePathname();
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="brand" aria-label="Learn Hong Kong Mahjong, home">
          <span className="brand__mark" aria-hidden>
            中
          </span>
          <span className="brand__name">
            Learn <span className="brand__strong">Mahjong</span>
          </span>
        </Link>
        <nav className="site-nav" aria-label="Sections">
          {SECTIONS.map((s) => {
            const active = path === s.href || path.startsWith(`${s.href}/`);
            return (
              <Link
                key={s.href}
                href={s.href}
                className={active ? "site-nav__link site-nav__link--on" : "site-nav__link"}
                aria-current={active ? "page" : undefined}
              >
                {s.label}
              </Link>
            );
          })}
        </nav>
        <AppearanceMenu />
      </div>
    </header>
  );
}
