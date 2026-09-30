"use client";

import { SpeakButton } from "@/components/speak-button";
import type { Card, Language } from "@/lib/types";

// Spans (styled as blocks) keep the markup valid inside a <button>.
export function Flashcard({
  card,
  language,
  flipped,
  termFirst,
  onFlip,
}: {
  card: Card;
  language: Language;
  flipped: boolean;
  termFirst: boolean;
  onFlip: () => void;
}) {
  const termFace = (
    <span className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
      <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">{language.name}</span>
      <span lang={language.code} className="block font-heading text-4xl leading-tight font-semibold break-words sm:text-5xl">
        {card.term}
      </span>
      {card.pronunciation && <span className="block text-lg text-muted-foreground italic">{card.pronunciation}</span>}
      {card.partOfSpeech && <span className="block text-sm text-muted-foreground">{card.partOfSpeech}</span>}
    </span>
  );

  const translationFace = (
    <span className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
      <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">English</span>
      <span className="block font-heading text-3xl leading-tight font-semibold break-words sm:text-4xl">
        {card.translation}
      </span>
      {card.example && (
        <span className="mt-3 block max-w-md text-sm">
          <span lang={language.code} className="block font-medium">
            “{card.example}”
          </span>
          {card.exampleTranslation && (
            <span className="block text-muted-foreground italic">{card.exampleTranslation}</span>
          )}
        </span>
      )}
    </span>
  );

  const front = termFirst ? termFace : translationFace;
  const back = termFirst ? translationFace : termFace;

  return (
    <div className="relative">
      <div className="flip-scene">
        <button type="button" onClick={onFlip} aria-pressed={flipped} className="block w-full rounded-3xl text-left">
          <span className="sr-only">Flip card. </span>
          <span className="flip-inner block h-80 sm:h-96" data-flipped={flipped}>
            <span className="flip-face sticker block rounded-3xl bg-card" aria-hidden={flipped}>
              {front}
            </span>
            <span
              className="flip-face flip-back sticker block rounded-3xl bg-[color-mix(in_oklch,var(--lang)_22%,var(--card))]"
              aria-hidden={!flipped}
            >
              {back}
            </span>
          </span>
        </button>
      </div>
      <SpeakButton text={card.term} locale={language.ttsLocale} className="absolute top-4 right-4 z-10" />
      <p className="mt-3 text-center text-sm text-muted-foreground" aria-hidden>
        Tap the card to flip
      </p>
    </div>
  );
}
