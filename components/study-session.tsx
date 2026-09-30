"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { FlashcardsMode } from "@/components/modes/flashcards-mode";
import { LearnMode } from "@/components/modes/learn-mode";
import { MatchMode } from "@/components/modes/match-mode";
import { WriteMode } from "@/components/modes/write-mode";
import { studyHref } from "@/components/study-mode-links";
import { Button } from "@/components/ui/button";
import { useHydrated, useProgress } from "@/lib/progress";
import { unmasteredCards } from "@/lib/progress-core";
import type { Card, Language, Pack, StudyMode } from "@/lib/types";

export type ModeProps = {
  language: Language;
  pack: Pack;
  /** Cards for this session (already filtered). Modes snapshot them on mount. */
  cards: Card[];
  /** Start a fresh session, optionally with a specific subset of cards. */
  restart: (cards?: Card[]) => void;
};

/**
 * Client entry for a study mode. Waits for hydration so shuffles and
 * localStorage reads never run during server render, applies the
 * `?filter=missed` filter, and remounts the mode on restart.
 */
export function StudySession({
  language,
  pack,
  mode,
  missedOnly,
}: {
  language: Language;
  pack: Pack;
  mode: StudyMode;
  missedOnly: boolean;
}) {
  const hydrated = useHydrated();
  const { progress } = useProgress();
  // The card set is frozen per session so mastering cards mid-session (with the
  // missed filter) doesn't swap the deck out from under the learner.
  const [session, setSession] = useState<{ id: number; cards: Card[] | null; missedOnly: boolean }>({
    id: 0,
    cards: null,
    missedOnly,
  });

  const filtered = useMemo(
    () => (missedOnly ? unmasteredCards(progress, pack) : pack.cards),
    [missedOnly, progress, pack],
  );

  if (hydrated && (session.cards === null || session.missedOnly !== missedOnly)) {
    // Adjusting state during render (React's recommended alternative to an effect).
    setSession({ id: session.id + 1, cards: filtered, missedOnly });
  }

  if (!hydrated || session.cards === null) {
    return (
      <div
        className="h-80 animate-pulse rounded-2xl border-2 border-dashed border-ink/30 bg-muted motion-reduce:animate-none"
        aria-busy="true"
        aria-label="Loading study session"
      />
    );
  }

  const cards = session.cards;

  if (cards.length === 0) {
    return (
      <EmptyState
        emoji="🎉"
        title={missedOnly ? "Nothing left to review" : "This pack is empty"}
        action={
          <>
            {missedOnly && (
              <Button asChild className="sticker-sm press h-10 rounded-full px-4">
                <Link href={studyHref(pack.languageCode, pack.id, mode, false)}>Study all cards</Link>
              </Button>
            )}
            <Button asChild variant="outline" className="h-10 rounded-full border-2 border-ink px-4">
              <Link href={`/${pack.languageCode}/${pack.id}`}>Back to pack</Link>
            </Button>
          </>
        }
      >
        {missedOnly ? "You've mastered every card in this pack. Nicely done!" : "There are no cards to study yet."}
      </EmptyState>
    );
  }

  const props: ModeProps = {
    language,
    pack,
    cards,
    restart: (override) => setSession((s) => ({ id: s.id + 1, cards: override ?? null, missedOnly })),
  };
  const key = `${mode}-${session.id}-${missedOnly}`;

  switch (mode) {
    case "flashcards":
      return <FlashcardsMode key={key} {...props} />;
    case "learn":
      return <LearnMode key={key} {...props} />;
    case "write":
      return <WriteMode key={key} {...props} />;
    case "match":
      return <MatchMode key={key} {...props} />;
  }
}
