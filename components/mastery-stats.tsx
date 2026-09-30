"use client";

import Link from "next/link";
import { RotateCcw, Target } from "lucide-react";
import { ProgressBar } from "@/components/progress-bar";
import { studyHref } from "@/components/study-mode-links";
import { Button } from "@/components/ui/button";
import { useProgress } from "@/lib/progress";
import { packStats } from "@/lib/progress-core";
import type { Pack } from "@/lib/types";

export function MasteryStats({ pack }: { pack: Pack }) {
  const { progress, resetPack } = useProgress();
  const stats = packStats(progress, pack);
  const remaining = stats.total - stats.mastered;
  const started = stats.mastered + stats.learning > 0;

  function onReset() {
    if (window.confirm(`Reset your progress for “${pack.title}”?`)) resetPack(pack);
  }

  return (
    <section aria-labelledby="mastery-heading" className="sticker rounded-2xl bg-card p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="mastery-heading" className="text-xl font-semibold">
          Your mastery
        </h2>
        <span className="font-heading text-3xl font-semibold">{stats.percent}%</span>
      </div>
      <ProgressBar value={stats.percent} label={`${pack.title} mastery`} className="mt-3" />
      <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Stat label="Mastered" value={stats.mastered} className="bg-success/15" />
        <Stat label="Learning" value={stats.learning} className="bg-highlight/40" />
        <Stat label="New" value={stats.notStarted} className="bg-muted" />
      </dl>
      <p className="mt-3 text-xs text-muted-foreground">
        A card is mastered after 3 correct answers in a row in Learn or Write.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {remaining > 0 && started && (
          <Button asChild className="sticker-sm press h-10 rounded-full px-4">
            <Link href={studyHref(pack.languageCode, pack.id, "learn", true)}>
              <Target aria-hidden /> Review {remaining} unmastered
            </Link>
          </Button>
        )}
        {started && (
          <Button variant="ghost" onClick={onReset} className="h-10 rounded-full px-4">
            <RotateCcw aria-hidden /> Reset progress
          </Button>
        )}
      </div>
    </section>
  );
}

function Stat({ label, value, className }: { label: string; value: number; className?: string }) {
  return (
    <div className={`rounded-xl border-2 border-ink/15 px-2 py-2 ${className ?? ""}`}>
      <dt className="text-xs font-semibold text-muted-foreground">{label}</dt>
      <dd className="font-heading text-2xl font-semibold">{value}</dd>
    </div>
  );
}
