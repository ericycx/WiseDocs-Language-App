import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { languageAccent } from "@/components/language-accent";
import { LevelBadge } from "@/components/level-badge";
import { MasteryStats } from "@/components/mastery-stats";
import { SpeakButton } from "@/components/speak-button";
import { StudyModeGrid } from "@/components/study-mode-links";
import { getAllPackParams, getLanguage, getPack } from "@/lib/data";

export async function generateStaticParams() {
  return getAllPackParams();
}

export async function generateMetadata({ params }: PageProps<"/[lang]/[packId]">): Promise<Metadata> {
  const { lang, packId } = await params;
  const [language, pack] = await Promise.all([getLanguage(lang), getPack(lang, packId)]);
  return language && pack ? { title: `${pack.title} · ${language.name}`, description: pack.description } : {};
}

export default async function PackPage({ params }: PageProps<"/[lang]/[packId]">) {
  const { lang, packId } = await params;
  const [language, pack] = await Promise.all([getLanguage(lang), getPack(lang, packId)]);
  if (!language || !pack) notFound();

  return (
    <div style={languageAccent(language.code)} className="space-y-8">
      <div>
        <Breadcrumbs
          items={[
            { label: "Languages", href: "/" },
            { label: language.name, href: `/${language.code}` },
            { label: pack.title },
          ]}
        />
        <header className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border-2 border-ink bg-(--lang) px-3 py-0.5 text-sm font-semibold text-ink">
              {language.flag} {pack.topic}
            </span>
            <LevelBadge level={pack.level} />
          </div>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{pack.title}</h1>
          <p className="max-w-2xl text-lg text-muted-foreground">{pack.description}</p>
        </header>
      </div>

      <section aria-labelledby="modes-heading" className="space-y-3">
        <h2 id="modes-heading" className="text-2xl font-semibold">
          Study this pack
        </h2>
        <StudyModeGrid lang={language.code} packId={pack.id} />
      </section>

      <div className="grid gap-8 lg:grid-cols-[1fr_20rem] lg:items-start">
        <section aria-labelledby="cards-heading" className="order-2 space-y-3 lg:order-1">
          <h2 id="cards-heading" className="text-2xl font-semibold">
            All {pack.cards.length} cards
          </h2>
          <ul className="divide-y-2 divide-ink/10 overflow-hidden rounded-2xl border-2 border-ink bg-card">
            {pack.cards.map((card) => (
              <li key={card.id} className="flex items-start gap-3 p-4">
                <SpeakButton text={card.term} locale={language.ttsLocale} size="icon" className="mt-0.5 shrink-0" />
                <div className="grid flex-1 gap-1 sm:grid-cols-2 sm:gap-4">
                  <div>
                    <p lang={language.code} className="text-lg font-semibold">
                      {card.term}
                    </p>
                    {card.pronunciation && (
                      <p className="text-sm text-muted-foreground italic">{card.pronunciation}</p>
                    )}
                  </div>
                  <div>
                    <p>
                      {card.translation}
                      {card.partOfSpeech && (
                        <span className="ml-2 text-xs text-muted-foreground">{card.partOfSpeech}</span>
                      )}
                    </p>
                    {card.example && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        <span lang={language.code}>{card.example}</span>
                        {card.exampleTranslation && <span className="block italic">{card.exampleTranslation}</span>}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
        <aside className="order-1 lg:sticky lg:top-6 lg:order-2">
          <MasteryStats pack={pack} />
        </aside>
      </div>
    </div>
  );
}
