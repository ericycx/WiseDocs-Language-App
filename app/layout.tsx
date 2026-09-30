import type { Metadata, Viewport } from "next";
import { Figtree, Fraunces } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  axes: ["SOFT", "opsz"],
});

const body = Figtree({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: { default: "Tandem · Flashcards for real languages", template: "%s · Tandem" },
  description: "Learn Spanish, French, Japanese and German with flashcards, quizzes, writing drills and a speedy match game.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf5ea" },
    { media: "(prefers-color-scheme: dark)", color: "#1b2030" },
  ],
};

// Applies the saved (or system) theme before first paint to avoid a flash.
const themeScript = `(function(){try{var t=localStorage.getItem("tandem:theme");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;if(d)document.documentElement.classList.add("dark")}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only z-50 rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 pt-4 pb-16 sm:px-6">
          {children}
        </main>
        <footer className="mx-auto w-full max-w-5xl px-4 pb-8 text-sm text-muted-foreground sm:px-6">
          Made for curious learners · Progress is saved in this browser only.
        </footer>
      </body>
    </html>
  );
}
