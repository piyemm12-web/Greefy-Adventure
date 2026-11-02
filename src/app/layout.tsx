import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import "./globals.css";

// Fonts (Brandon Grotesque, Alternate Gothic, Chronicle Display) are loaded in
// globals.css from the Greedy Adventures CDN, matching the original site.

export const metadata: Metadata = {
  title: "Sea View Skydiving — Tandem Jump over Pattaya | Greedy Adventures (prototype)",
  description:
    "Tandem skydive from 13,000 ft over the Gulf of Thailand. The same jump in every package: choose no cameras, instructor video and photos, or a personal cameraman.",
};

export const viewport: Viewport = { themeColor: "#ffffff" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="antialiased">
      <head>
        <link rel="preconnect" href="https://www.greedyadventures.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://pub-89f493a2b50b4e43b99552a737bef138.r2.dev" />
      </head>
      <body className="min-h-dvh">
        <a
          href="#main"
          className="sr-only z-[200] bg-white px-4 py-2 text-primary focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
