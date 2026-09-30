import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { languageAccent } from "@/components/language-accent";
import type { LanguageSummary } from "@/lib/data";

export function LanguageCard({ language, index = 0 }: { language: LanguageSummary; index?: number }) {
  const tilt = ["-rotate-1", "rotate-1", "rotate-[0.5deg]", "-rotate-[0.5deg]"][index % 4];
  return (
    <Link
      href={`/${language.code}`}
      style={languageAccent(language.code)}
      className={`sticker press group relative flex flex-col overflow-hidden rounded-2xl bg-card ${tilt} hover:rotate-0 motion-reduce:rotate-0`}
      aria-label={`${language.name} (${language.nativeName}): ${language.packCount} packs, ${language.cardCount} cards`}
    >
      <div className="relative flex h-28 items-end justify-between bg-(--lang) px-5 pb-3">
        <span aria-hidden className="text-6xl leading-none drop-shadow-sm">
          {language.flag}
        </span>
        <span
          aria-hidden
          lang={language.code}
          className="font-heading text-3xl font-semibold text-ink/80 sm:text-4xl"
        >
          {language.nativeName}
        </span>
      </div>
      <div className="flex items-center justify-between gap-3 border-t-2 border-ink px-5 py-4">
        <div>
          <h2 className="text-2xl font-semibold">{language.name}</h2>
          <p className="text-sm text-muted-foreground">
            {language.packCount} packs · {language.cardCount} cards
          </p>
        </div>
        <span
          aria-hidden
          className="grid size-10 place-items-center rounded-full border-2 border-ink bg-secondary transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
        >
          <ArrowRight className="size-5" />
        </span>
      </div>
    </Link>
  );
}
