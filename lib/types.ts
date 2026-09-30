export type Level = "A1" | "A2" | "B1" | "B2" | "C1";

export const LEVELS: readonly Level[] = ["A1", "A2", "B1", "B2", "C1"];

export type Language = {
  code: string; // "es"
  name: string; // "Spanish"
  nativeName: string; // "Español"
  flag: string; // "🇪🇸"
  ttsLocale: string; // "es-ES"
};

export type Card = {
  id: string;
  term: string; // in the target language
  translation: string; // in English; "/" or ";" separate accepted alternatives
  pronunciation?: string;
  partOfSpeech?: string;
  example?: string;
  exampleTranslation?: string;
};

export type Pack = {
  id: string;
  languageCode: string;
  title: string;
  description: string;
  topic: string;
  level: Level;
  cards: Card[];
};

export type CardProgress = {
  correct: number;
  incorrect: number;
  streak: number;
  lastSeen: number;
  mastered: boolean;
};

/**
 * Keyed by pack key (see `packKey` in lib/progress-core.ts: `${languageCode}/${packId}`),
 * then by card id. Pack ids are only unique within a language, so the key is namespaced.
 */
export type Progress = Record<string, Record<string, CardProgress>>;

export type StudyMode = "flashcards" | "learn" | "write" | "match";
