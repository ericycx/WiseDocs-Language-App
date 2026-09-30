import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 pt-5 pb-2 sm:px-6">
      <Link
        href="/"
        className="group inline-flex items-center gap-2 rounded-lg font-heading text-2xl font-semibold tracking-tight"
        aria-label="Tandem home"
      >
        <span
          aria-hidden
          className="sticker-sm grid size-9 -rotate-6 place-items-center rounded-lg bg-primary text-lg text-primary-foreground transition-transform group-hover:rotate-0 motion-reduce:transition-none"
        >
          T
        </span>
        <span>Tandem</span>
      </Link>
      <ThemeToggle />
    </header>
  );
}
