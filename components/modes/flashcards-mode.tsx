"use client";

import { ArrowLeft, ArrowRight, ArrowLeftRight, RotateCcw, Shuffle } from "lucide-react";
import { useEffect, useState } from "react";
import { Flashcard } from "@/components/flashcard";
import { ProgressBar } from "@/components/progress-bar";
import type { ModeProps } from "@/components/study-session";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { shuffle } from "@/lib/shuffle";

const INTERACTIVE = "button, a, input, textarea, select, [role='button'], [contenteditable='true']";

export function FlashcardsMode({ language, cards }: ModeProps) {
  const [order, setOrder] = useState(cards);
  const [shuffled, setShuffled] = useState(false);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [termFirst, setTermFirst] = useState(true);

  const total = order.length;
  const card = order[index];

  function go(delta: number) {
    setIndex((i) => Math.min(total - 1, Math.max(0, i + delta)));
    setFlipped(false);
  }

  function toggleShuffle() {
    setOrder(shuffled ? cards : shuffle(cards));
    setShuffled(!shuffled);
    setIndex(0);
    setFlipped(false);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const target = e.target as HTMLElement | null;
      const inField = target?.closest("input, textarea, select, [contenteditable='true']");
      if (inField) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setIndex((i) => Math.min(total - 1, i + 1));
        setFlipped(false);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setIndex((i) => Math.max(0, i - 1));
        setFlipped(false);
      } else if (e.key === " " && !target?.closest(INTERACTIVE)) {
        // Space on a focused button already activates it; only handle it elsewhere.
        e.preventDefault();
        setFlipped((f) => !f);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [total]);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <ProgressBar value={((index + 1) / total) * 100} label="Position in deck" className="flex-1" />
        <span className="shrink-0 font-mono text-sm font-bold" aria-live="polite">
          {index + 1} / {total}
        </span>
      </div>

      <Flashcard
        key={`${card.id}-${termFirst}`}
        card={card}
        language={language}
        flipped={flipped}
        termFirst={termFirst}
        onFlip={() => setFlipped((f) => !f)}
      />

      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          size="icon-lg"
          onClick={() => go(-1)}
          disabled={index === 0}
          aria-label="Previous card"
          className="sticker-sm press size-12 rounded-full bg-card"
        >
          <ArrowLeft aria-hidden className="size-5" />
        </Button>
        <p className="hidden text-center text-xs text-muted-foreground sm:block">
          <kbd className="rounded border px-1 font-mono">Space</kbd> flip ·{" "}
          <kbd className="rounded border px-1 font-mono">←</kbd> <kbd className="rounded border px-1 font-mono">→</kbd>{" "}
          move
        </p>
        <Button
          variant="outline"
          size="icon-lg"
          onClick={() => go(1)}
          disabled={index === total - 1}
          aria-label="Next card"
          className="sticker-sm press size-12 rounded-full bg-card"
        >
          <ArrowRight aria-hidden className="size-5" />
        </Button>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <Toggle
          pressed={shuffled}
          onPressedChange={toggleShuffle}
          aria-label="Shuffle cards"
          className="h-10 rounded-full border-2 border-ink px-4 data-[state=on]:bg-foreground data-[state=on]:text-background"
        >
          <Shuffle aria-hidden /> Shuffle
        </Toggle>
        <Toggle
          pressed={!termFirst}
          onPressedChange={(p) => {
            setTermFirst(!p);
            setFlipped(false);
          }}
          aria-label="Show English side first"
          className="h-10 rounded-full border-2 border-ink px-4 data-[state=on]:bg-foreground data-[state=on]:text-background"
        >
          <ArrowLeftRight aria-hidden /> English first
        </Toggle>
        {index === total - 1 && total > 1 && (
          <Button
            variant="ghost"
            onClick={() => {
              setIndex(0);
              setFlipped(false);
            }}
            className="h-10 rounded-full px-4"
          >
            <RotateCcw aria-hidden /> Start over
          </Button>
        )}
      </div>
    </div>
  );
}
