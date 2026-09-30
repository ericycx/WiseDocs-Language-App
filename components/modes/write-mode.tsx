"use client";

import { Check, RotateCcw, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { ProgressBar } from "@/components/progress-bar";
import { ResultsScreen } from "@/components/results-screen";
import { SpeakButton } from "@/components/speak-button";
import type { ModeProps } from "@/components/study-session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { checkAnswer } from "@/lib/answer-check";
import { useProgress } from "@/lib/progress";
import { shuffle } from "@/lib/shuffle";
import { cn } from "@/lib/utils";

type Status = { kind: "answering" } | { kind: "correct"; overridden: boolean } | { kind: "wrong"; given: string };

export function WriteMode({ language, pack, cards, restart }: ModeProps) {
  const { recordAnswer } = useProgress();
  const [deck] = useState(() => shuffle(cards));
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "answering" });
  const [results, setResults] = useState<Record<string, boolean>>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const inputId = useId();

  const done = index >= deck.length;
  const card = deck[index];

  useEffect(() => {
    if (status.kind === "answering") inputRef.current?.focus();
    else nextRef.current?.focus();
  }, [status.kind, index]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status.kind !== "answering" || !card) return;
    if (checkAnswer(input, card.translation)) {
      recordAnswer(pack, card.id, true);
      setResults((r) => ({ ...r, [card.id]: true }));
      setStatus({ kind: "correct", overridden: false });
    } else {
      // Recorded when the learner continues, so "I was right" can override it.
      setStatus({ kind: "wrong", given: input.trim() });
    }
  }

  function next(overrideCorrect = false) {
    if (!card) return;
    if (status.kind === "wrong") {
      recordAnswer(pack, card.id, overrideCorrect);
      setResults((r) => ({ ...r, [card.id]: overrideCorrect }));
    }
    setIndex((i) => i + 1);
    setInput("");
    setStatus({ kind: "answering" });
  }

  if (done) {
    const missed = deck.filter((c) => results[c.id] === false);
    const correct = deck.length - missed.length;
    const score = Math.round((correct / deck.length) * 100);
    return (
      <ResultsScreen
        title={score >= 90 ? "¡Brillante! Superb spelling." : score >= 60 ? "Solid work!" : "Practice makes perfect"}
        emoji={score >= 90 ? "🏆" : score >= 60 ? "✍️" : "💪"}
        stats={[
          { label: "Score", value: `${score}%` },
          { label: "Correct", value: `${correct}/${deck.length}` },
        ]}
        missed={missed}
        language={language}
        backHref={`/${pack.languageCode}/${pack.id}`}
        actions={
          <>
            {missed.length > 0 && (
              <Button onClick={() => restart(missed)} className="sticker-sm press h-11 rounded-full px-5">
                Retry {missed.length} missed
              </Button>
            )}
            <Button onClick={() => restart()} variant="secondary" className="sticker-sm press h-11 rounded-full px-5">
              <RotateCcw aria-hidden /> Start over
            </Button>
          </>
        }
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <ProgressBar value={(index / deck.length) * 100} label="Write progress" className="flex-1" />
        <span className="shrink-0 font-mono text-sm font-bold">
          {index + 1} / {deck.length}
        </span>
      </div>

      <div
        className={cn(
          "sticker relative rounded-3xl bg-card px-6 py-10 text-center transition-colors",
          status.kind === "correct" && "bg-[color-mix(in_oklch,var(--success)_18%,var(--card))]",
          status.kind === "wrong" && "animate-shake bg-[color-mix(in_oklch,var(--destructive)_14%,var(--card))]",
        )}
      >
        <SpeakButton text={card.term} locale={language.ttsLocale} className="absolute top-4 right-4" />
        <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">Type the English</p>
        <p lang={language.code} className="mt-2 font-heading text-4xl font-semibold sm:text-5xl">
          {card.term}
        </p>
        {card.pronunciation && <p className="mt-1 text-lg text-muted-foreground italic">{card.pronunciation}</p>}
      </div>

      <form onSubmit={submit} className="space-y-3">
        <label htmlFor={inputId} className="sr-only">
          English translation of {card.term}
        </label>
        <Input
          ref={inputRef}
          id={inputId}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          readOnly={status.kind !== "answering"}
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          placeholder="Your answer…"
          aria-invalid={status.kind === "wrong" || undefined}
          aria-describedby={`${inputId}-feedback`}
          className="sticker-sm h-14 rounded-2xl bg-card px-4 text-lg md:text-lg"
        />
        {status.kind === "answering" && (
          <div className="flex gap-2">
            <Button type="submit" disabled={!input.trim()} className="sticker-sm press h-11 flex-1 rounded-full text-base">
              Check
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStatus({ kind: "wrong", given: "" })}
              className="h-11 rounded-full px-4"
            >
              I don&apos;t know
            </Button>
          </div>
        )}
      </form>

      <div id={`${inputId}-feedback`} aria-live="assertive">
        {status.kind === "correct" && (
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="inline-flex items-center gap-2 font-semibold text-success">
              <Check aria-hidden className="size-5" /> {status.overridden ? "Counted as correct." : "Correct!"}{" "}
              <span className="font-normal text-muted-foreground">{card.translation}</span>
            </p>
            <Button ref={nextRef} onClick={() => next()} className="sticker-sm press h-11 rounded-full px-6">
              Next
            </Button>
          </div>
        )}
        {status.kind === "wrong" && (
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="inline-flex flex-wrap items-center justify-center gap-x-2 font-semibold">
              <X aria-hidden className="size-5 text-destructive" />
              {status.given ? (
                <span>
                  You wrote <s className="text-destructive">{status.given}</s>.
                </span>
              ) : null}
              <span>
                Correct answer: <span className="text-success">{card.translation}</span>
              </span>
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button ref={nextRef} onClick={() => next(false)} className="sticker-sm press h-11 rounded-full px-6">
                Continue
              </Button>
              {status.given && (
                <Button
                  variant="outline"
                  onClick={() => next(true)}
                  className="h-11 rounded-full border-2 border-ink px-5"
                >
                  I was right
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
