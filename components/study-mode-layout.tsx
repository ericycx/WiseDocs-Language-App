import Link from "next/link";
import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { languageAccent } from "@/components/language-accent";
import { STUDY_MODES, StudyModeTabs, studyHref } from "@/components/study-mode-links";
import type { Language, Pack, StudyMode } from "@/lib/types";
import { cn } from "@/lib/utils";

export function StudyModeLayout({
  language,
  pack,
  mode,
  missedOnly,
  children,
}: {
  language: Language;
  pack: Pack;
  mode: StudyMode;
  missedOnly: boolean;
  children: ReactNode;
}) {
  const modeLabel = STUDY_MODES.find((m) => m.mode === mode)?.label ?? mode;
  const filterLink = (active: boolean) =>
    cn(
      "inline-flex h-8 items-center rounded-full px-3 text-sm font-semibold",
      active ? "bg-foreground text-background" : "hover:bg-accent",
    );

  return (
    <div style={languageAccent(language.code)} className="space-y-5">
      <Breadcrumbs
        items={[
          { label: "Languages", href: "/" },
          { label: language.name, href: `/${language.code}` },
          { label: pack.title, href: `/${language.code}/${pack.id}` },
          { label: modeLabel },
        ]}
      />
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">
            {language.flag} {pack.title}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{modeLabel}</h1>
        </div>
        <nav aria-label="Which cards to study" className="self-start rounded-full border-2 border-ink bg-card p-1 sm:self-auto">
          <ul className="flex gap-1">
            <li>
              <Link
                href={studyHref(language.code, pack.id, mode, false)}
                aria-current={!missedOnly ? "page" : undefined}
                className={filterLink(!missedOnly)}
              >
                All cards
              </Link>
            </li>
            <li>
              <Link
                href={studyHref(language.code, pack.id, mode, true)}
                aria-current={missedOnly ? "page" : undefined}
                className={filterLink(missedOnly)}
              >
                Unmastered only
              </Link>
            </li>
          </ul>
        </nav>
      </header>
      <StudyModeTabs lang={language.code} packId={pack.id} current={mode} missedOnly={missedOnly} />
      <div className="pt-2">{children}</div>
    </div>
  );
}
