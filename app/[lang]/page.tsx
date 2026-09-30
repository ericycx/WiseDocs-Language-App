import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { languageAccent } from "@/components/language-accent";
import { PackBrowser } from "@/components/pack-browser";
import { getLanguage, getLanguages, getPacks } from "@/lib/data";

export async function generateStaticParams() {
  return (await getLanguages()).map((l) => ({ lang: l.code }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  const language = await getLanguage(lang);
  return language ? { title: `${language.name} packs` } : {};
}

export default async function LanguagePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  const language = await getLanguage(lang);
  if (!language) notFound();
  const packs = await getPacks(language.code);

  return (
    <div style={languageAccent(language.code)}>
      <Breadcrumbs items={[{ label: "Languages", href: "/" }, { label: language.name }]} />
      <header className="mb-8 flex items-center gap-4">
        <span
          aria-hidden
          className="sticker grid size-16 shrink-0 rotate-3 place-items-center rounded-2xl bg-(--lang) text-4xl"
        >
          {language.flag}
        </span>
        <div>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{language.name}</h1>
          <p className="text-muted-foreground">
            <span lang={language.code}>{language.nativeName}</span> · {packs.length} packs
          </p>
        </div>
      </header>
      <PackBrowser packs={packs} languageName={language.name} />
    </div>
  );
}
