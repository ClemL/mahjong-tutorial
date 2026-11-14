import type { Metadata, Viewport } from "next";
import "./globals.css";
import { APPEARANCE_INIT_SCRIPT } from "@/game/appearance";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const metadata: Metadata = {
  title: {
    default: "Learn Hong Kong Mahjong",
    template: "%s · Learn Hong Kong Mahjong",
  },
  description:
    "Learn Hong Kong old-style mahjong from the first tile to the last faan: interactive lessons, a guided example hand, " +
    "a practice table against the computer, scoring from basics to limit hands, and the game's history.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0d3b2e",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="jade" data-suits="vivid" data-tiles="traditional" data-body="ivory" data-backs="table">
      <head>
        {/* Restores the saved look before first paint, so a chosen theme never flashes the default. */}
        <script dangerouslySetInnerHTML={{ __html: APPEARANCE_INIT_SCRIPT }} />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="site-main">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
