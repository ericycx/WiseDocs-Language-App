import { LanguageCard } from "@/components/language-card";
import { getLanguageSummaries } from "@/lib/data";

export default async function HomePage() {
  const languages = await getLanguageSummaries();

  return (
    <div className="space-y-10 pt-6">
      <section className="max-w-2xl">
        <p className="mb-3 inline-block -rotate-2 rounded-full border-2 border-ink bg-secondary px-3 py-1 text-sm font-semibold">
          ¡Hola! · Bonjour · こんにちは · Hallo
        </p>
        <h1 className="text-4xl leading-[1.05] font-semibold tracking-tight sm:text-6xl">
          Pick a language. <span className="text-primary italic">Start talking.</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Bite-sized packs of real words and phrases. Flip flashcards, quiz yourself, type from memory, and race the
          clock in Match.
        </p>
      </section>

      <section aria-labelledby="languages-heading">
        <h2 id="languages-heading" className="sr-only">
          Languages
        </h2>
        <ul className="grid gap-6 sm:grid-cols-2">
          {languages.map((language, i) => (
            <li key={language.code}>
              <LanguageCard language={language} index={i} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
