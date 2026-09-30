"use client";

import { Check, RotateCcw, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ProgressBar } from "@/components/progress-bar";
import { ResultsScreen } from "@/components/results-screen";
import { SpeakButton } from "@/components/speak-button";
import type { ModeProps } from "@/components/study-session";
import { Button } from "@/components/ui/button";
import {
  answerLearn,
  buildOptions,
  createLearnState,
  currentCardId,
  isLearnComplete,
  learnAccuracy,
  type LearnState,
} from "@/lib/learn-queue";
import { useProgress } from "@/lib/progress";
import { shuffle } from "@/lib/shuffle";
import type { Card } from "@/lib/types";
import { cn } from "@/lib/utils";

type Feedback = { choice: string; correct: boolean } | null;

function optionsFor(state: LearnState, byId: Map<string, Card>, pool: string[]): string[] {
  const id = currentCardId(state);
  const card = id ? byId.get(id) : undefined;
  return card ? buildOptions(card.translation, pool) : [];
}

export function LearnMode({ language, pack, cards, restart }: ModeProps) {
  const { recordAnswer } = useProgress();
  const [byId] = useState(() => new Map(pack.cards.map((c) => [c.id, c])));
  // Wrong options come from the whole pack, even when studying a filtered subset.
  const [pool] = useState(() => pack.cards.map((c) => c.translation));
  const [round, setRound] = useState(() => {
    const learn = createLearnState(shuffle(cards.map((c) => c.id)));
    return { learn, options: optionsFor(learn, byId, pool) };
  });
  const [feedback, setFeedback] = useState<Feedback>(null);
  const continueRef = useRef<HTMLButtonElement>(null);

  const { learn, options } = round;
  const done = isLearnComplete(learn);
  const card = done ? undefined : byId.get(currentCardId(learn)!);
  const learned = cards.length - new Set(learn.queue).size;

  function advance() {
    if (!feedback) return;
    setRound(({ learn: prev }) => {
      const next = answerLearn(prev, feedback.correct);
      return { learn: next, options: optionsFor(next, byId, pool) };
    });
    setFeedback(null);
  }

  function choose(option: string) {
    if (!card || feedback) return;
    const correct = option === card.translation;
    setFeedback({ choice: option, correct });
    recordAnswer(pack, card.id, correct);
  }

  // Auto-advance shortly after a correct answer; wrong answers wait for "Continue".
  useEffect(() => {
    if (!feedback) return;
    if (!feedback.correct) {
      continueRef.current?.focus();
      return;
    }
    const t = setTimeout(() => {
      setRound(({ learn: prev }) => {
        const next = answerLearn(prev, true);
        return { learn: next, options: optionsFor(next, byId, pool) };
      });
      setFeedback(null);
    }, 800);
    return () => clearTimeout(t);
  }, [feedback, byId, pool]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const n = Number(e.key);
      if (!feedback && n >= 1 && n <= options.length) {
        e.preventDefault();
        (document.querySelector(`[data-option-index="${n - 1}"]`) as HTMLButtonElement | null)?.click();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [feedback, options.length]);

  if (done || !card) {
    const accuracy = Math.round(learnAccuracy(learn) * 100);
    const missed = learn.missed.map((id) => byId.get(id)).filter((c): c is Card => Boolean(c));
    return (
      <ResultsScreen
        title={accuracy >= 90 ? "Excellent work!" : accuracy >= 70 ? "Nice progress!" : "Keep at it!"}
        emoji={accuracy >= 90 ? "🏆" : accuracy >= 70 ? "🌟" : "💪"}
        stats={[
          { label: "Accuracy", value: `${accuracy}%` },
          { label: "Cards", value: String(cards.length) },
          { label: "Missed", value: String(missed.length) },
        ]}
        missed={missed}
        language={language}
        backHref={`/${pack.languageCode}/${pack.id}`}
        actions={
          <>
            {missed.length > 0 && (
              <Button onClick={() => restart(missed)} className="sticker-sm press h-11 rounded-full px-5">
                Practice missed
              </Button>
            )}
            <Button onClick={() => restart()} variant="secondary" className="sticker-sm press h-11 rounded-full px-5">
              <RotateCcw aria-hidden /> Study again
            </Button>
          </>
        }
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <ProgressBar value={(learned / cards.length) * 100} label="Cards learned this session" className="flex-1" />
        <span className="shrink-0 font-mono text-sm font-bold">
          {learned} / {cards.length}
        </span>
      </div>

      <div className="sticker relative rounded-3xl bg-card px-6 py-10 text-center">
        <SpeakButton text={card.term} locale={language.ttsLocale} className="absolute top-4 right-4" />
        <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">What does this mean?</p>
        <p lang={language.code} className="mt-2 font-heading text-4xl font-semibold sm:text-5xl">
          {card.term}
        </p>
        {card.pronunciation && <p className="mt-1 text-lg text-muted-foreground italic">{card.pronunciation}</p>}
      </div>

      <ul className="grid gap-3 sm:grid-cols-2" aria-label="Answer options">
        {options.map((option, i) => {
          const isAnswer = option === card.translation;
          const isChoice = feedback?.choice === option;
          const state = !feedback ? "idle" : isAnswer ? "right" : isChoice ? "wrong" : "dim";
          return (
            <li key={option}>
              <button
                type="button"
                data-option-index={i}
                onClick={() => choose(option)}
                disabled={Boolean(feedback)}
                aria-describedby="learn-feedback"
                className={cn(
                  "sticker-sm flex min-h-14 w-full items-center gap-3 rounded-2xl bg-card px-4 py-3 text-left font-semibold transition-colors",
                  state === "idle" && "press hover:bg-accent",
                  state === "right" && "bg-success text-success-foreground",
                  state === "wrong" && "animate-shake bg-destructive text-white",
                  state === "dim" && "opacity-50",
                )}
              >
                <span
                  aria-hidden
                  className="grid size-7 shrink-0 place-items-center rounded-lg border-2 border-current font-mono text-sm"
                >
                  {state === "right" ? <Check className="size-4" /> : state === "wrong" ? <X className="size-4" /> : i + 1}
                </span>
                {option}
              </button>
            </li>
          );
        })}
      </ul>

      <div id="learn-feedback" aria-live="assertive" className="min-h-14 text-center">
        {feedback &&
          (feedback.correct ? (
            <p className="font-semibold text-success">Correct! 🎉</p>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <p className="font-semibold">
                Not quite. <span lang={language.code}>{card.term}</span> means{" "}
                <span className="text-success">{card.translation}</span>. We&apos;ll come back to it.
              </p>
              <Button ref={continueRef} onClick={advance} className="sticker-sm press h-11 rounded-full px-6">
                Continue
              </Button>
            </div>
          ))}
      </div>
    </div>
  );
}
