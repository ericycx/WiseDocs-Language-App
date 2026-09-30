"use client";

import { RotateCcw, Timer, Trophy } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { ModeProps } from "@/components/study-session";
import { Button } from "@/components/ui/button";
import { useBestTime } from "@/lib/progress";
import { sample, shuffle } from "@/lib/shuffle";
import type { Card } from "@/lib/types";
import { cn } from "@/lib/utils";

export const MATCH_PAIRS = 6;

type Tile = { key: string; cardId: string; side: "term" | "translation"; text: string };

function buildTiles(cards: Card[]): Tile[] {
  const round = sample(cards, MATCH_PAIRS);
  return shuffle(
    round.flatMap((c) => [
      { key: `${c.id}:term`, cardId: c.id, side: "term" as const, text: c.term },
      { key: `${c.id}:translation`, cardId: c.id, side: "translation" as const, text: c.translation },
    ]),
  );
}

export function formatTime(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`;
}

export function MatchMode({ language, pack, cards, restart }: ModeProps) {
  const { best, saveTime } = useBestTime(pack);
  const [tiles] = useState(() => buildTiles(cards));
  const [selected, setSelected] = useState<Tile | null>(null);
  const [matched, setMatched] = useState<Set<string>>(() => new Set());
  const [wrong, setWrong] = useState<string[]>([]);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const [finish, setFinish] = useState<{ ms: number; record: boolean } | null>(null);

  const pairs = tiles.length / 2;

  useEffect(() => {
    if (startedAt === null || finish) return;
    const id = setInterval(() => setNow(performance.now()), 100);
    return () => clearInterval(id);
  }, [startedAt, finish]);

  useEffect(() => {
    if (wrong.length === 0) return;
    const t = setTimeout(() => setWrong([]), 550);
    return () => clearTimeout(t);
  }, [wrong]);

  /** `at` is the click event's timestamp (same clock as `performance.now()`). */
  function pick(tile: Tile, at: number) {
    if (matched.has(tile.cardId) || finish) return;
    const start = startedAt ?? at;
    if (startedAt === null) {
      setStartedAt(start);
      setNow(start);
    }
    if (!selected || selected.side === tile.side) {
      // First pick, or switching to another tile on the same side.
      setSelected(selected?.key === tile.key ? null : tile);
      return;
    }
    if (selected.cardId === tile.cardId) {
      const nextMatched = new Set(matched).add(tile.cardId);
      setMatched(nextMatched);
      setSelected(null);
      if (nextMatched.size === pairs) {
        const ms = Math.round(at - start);
        setFinish({ ms, record: saveTime(ms) });
      }
    } else {
      setWrong([selected.key, tile.key]);
      setSelected(null);
    }
  }

  const elapsed = finish ? finish.ms : startedAt === null ? 0 : Math.max(0, now - startedAt);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-card px-4 py-1.5 font-mono text-lg font-bold">
          <Timer aria-hidden className="size-5" />
          <span aria-label="Elapsed time">{formatTime(elapsed)}</span>
        </p>
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Trophy aria-hidden className="size-4" />
          Best: {best ? formatTime(best) : "—"}
        </p>
        <p className="w-full text-sm text-muted-foreground sm:w-auto" aria-live="polite">
          {matched.size} of {pairs} pairs matched
        </p>
      </div>

      {finish ? (
        <div className="sticker animate-pop-in rounded-3xl bg-card p-8 text-center">
          <span aria-hidden className="text-5xl">
            {finish.record ? "🏆" : "⚡"}
          </span>
          <h2 className="mt-2 text-3xl font-semibold" aria-live="polite">
            {finish.record ? "New best time!" : "All matched!"}
          </h2>
          <p className="mt-2 text-lg">
            You finished in <strong>{formatTime(finish.ms)}</strong>
            {best && !finish.record ? ` (best ${formatTime(best)})` : ""}.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button onClick={() => restart()} className="sticker-sm press h-11 rounded-full px-5">
              <RotateCcw aria-hidden /> Play again
            </Button>
            <Button asChild variant="outline" className="h-11 rounded-full border-2 border-ink px-5">
              <Link href={`/${pack.languageCode}/${pack.id}`}>Back to pack</Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Tap a {language.name} term, then its English meaning. The timer starts on your first tap.
          </p>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4" aria-label="Match tiles">
            {tiles.map((tile) => {
              const isMatched = matched.has(tile.cardId);
              const isSelected = selected?.key === tile.key;
              const isWrong = wrong.includes(tile.key);
              return (
                <li key={tile.key}>
                  <button
                    type="button"
                    onClick={(e) => pick(tile, e.timeStamp)}
                    disabled={isMatched}
                    aria-pressed={isSelected}
                    aria-label={`${tile.side === "term" ? language.name : "English"}: ${tile.text}${isMatched ? " (matched)" : ""}`}
                    className={cn(
                      "flex min-h-24 w-full items-center justify-center rounded-2xl p-3 text-center text-base font-semibold break-words transition-[opacity,background-color,transform] duration-200 motion-reduce:transition-none",
                      isMatched
                        ? "scale-95 border-2 border-dashed border-ink/30 bg-transparent text-muted-foreground opacity-40"
                        : "sticker-sm press bg-card",
                      tile.side === "term" && !isMatched && "font-heading text-lg",
                      isSelected && "bg-(--lang) text-ink ring-4 ring-ring/40",
                      isWrong && "animate-shake bg-destructive text-white",
                    )}
                  >
                    <span lang={tile.side === "term" ? language.code : "en"}>{tile.text}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
