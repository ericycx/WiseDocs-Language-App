import Link from "next/link";
import { BookOpenCheck, Layers, PencilLine, Puzzle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { StudyMode } from "@/lib/types";
import { cn } from "@/lib/utils";

export const STUDY_MODES: { mode: StudyMode; label: string; blurb: string; icon: LucideIcon }[] = [
  { mode: "flashcards", label: "Flashcards", blurb: "Flip through and say it out loud", icon: Layers },
  { mode: "learn", label: "Learn", blurb: "Multiple choice until it sticks", icon: BookOpenCheck },
  { mode: "write", label: "Write", blurb: "Type the translation from memory", icon: PencilLine },
  { mode: "match", label: "Match", blurb: "Race the clock to pair them up", icon: Puzzle },
];

export function studyHref(lang: string, packId: string, mode: StudyMode, missedOnly: boolean) {
  return `/${lang}/${packId}/${mode}${missedOnly ? "?filter=missed" : ""}`;
}

/** Big mode buttons for the pack overview. */
export function StudyModeGrid({ lang, packId }: { lang: string; packId: string }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {STUDY_MODES.map(({ mode, label, blurb, icon: Icon }) => (
        <li key={mode}>
          <Link
            href={studyHref(lang, packId, mode, false)}
            className="sticker press flex h-full flex-col gap-2 rounded-2xl bg-card p-4"
          >
            <span className="grid size-10 place-items-center rounded-xl border-2 border-ink bg-(--lang) text-ink">
              <Icon aria-hidden className="size-5" />
            </span>
            <span className="font-heading text-lg font-semibold">{label}</span>
            <span className="text-sm text-muted-foreground">{blurb}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Compact tab-like switcher shown inside a study mode. */
export function StudyModeTabs({
  lang,
  packId,
  current,
  missedOnly,
}: {
  lang: string;
  packId: string;
  current: StudyMode;
  missedOnly: boolean;
}) {
  return (
    <nav aria-label="Study modes">
      <ul className="grid grid-cols-4 gap-1.5 sm:flex sm:gap-2">
        {STUDY_MODES.map(({ mode, label, icon: Icon }) => {
          const active = mode === current;
          return (
            <li key={mode}>
              <Link
                href={studyHref(lang, packId, mode, missedOnly)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-full border-2 border-ink px-1.5 text-[13px] font-semibold whitespace-nowrap sm:w-auto sm:px-3 sm:text-sm",
                  active ? "bg-foreground text-background" : "bg-card hover:bg-accent",
                )}
              >
                <Icon aria-hidden className="hidden size-4 sm:inline" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
