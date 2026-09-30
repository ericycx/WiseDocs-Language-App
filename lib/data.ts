import languagesJson from "@/data/languages.json";
import esPacks from "@/data/packs/es.json";
import frPacks from "@/data/packs/fr.json";
import jaPacks from "@/data/packs/ja.json";
import dePacks from "@/data/packs/de.json";
import type { Language, Pack } from "./types";

/**
 * The only module that touches mock data. Every function is async so a real
 * API can replace the JSON imports later without changing callers.
 */

const languages = languagesJson as Language[];

const packsByLanguage: Record<string, Pack[]> = {
  es: esPacks as Pack[],
  fr: frPacks as Pack[],
  ja: jaPacks as Pack[],
  de: dePacks as Pack[],
};

export async function getLanguages(): Promise<Language[]> {
  return languages;
}

export async function getLanguage(code: string): Promise<Language | undefined> {
  return languages.find((l) => l.code === code);
}

export async function getPacks(languageCode: string): Promise<Pack[]> {
  return packsByLanguage[languageCode] ?? [];
}

export async function getPack(languageCode: string, packId: string): Promise<Pack | undefined> {
  return (packsByLanguage[languageCode] ?? []).find((p) => p.id === packId);
}

export type LanguageSummary = Language & { packCount: number; cardCount: number };

export async function getLanguageSummaries(): Promise<LanguageSummary[]> {
  return languages.map((l) => {
    const packs = packsByLanguage[l.code] ?? [];
    return { ...l, packCount: packs.length, cardCount: packs.reduce((n, p) => n + p.cards.length, 0) };
  });
}

/** All `{ lang, packId }` pairs, for `generateStaticParams`. */
export async function getAllPackParams(): Promise<{ lang: string; packId: string }[]> {
  return languages.flatMap((l) => (packsByLanguage[l.code] ?? []).map((p) => ({ lang: l.code, packId: p.id })));
}
