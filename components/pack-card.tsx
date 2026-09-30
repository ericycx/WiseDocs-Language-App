"use client";

import Link from "next/link";
import { LevelBadge } from "@/components/level-badge";
import { ProgressBar } from "@/components/progress-bar";
import { useProgress } from "@/lib/progress";
import { packStats } from "@/lib/progress-core";
import type { Pack } from "@/lib/types";

export function PackCard({ pack }: { pack: Pack }) {
  const { progress } = useProgress();
  const stats = packStats(progress, pack);

  return (
    <li className="h-full">
      <Link
        href={`/${pack.languageCode}/${pack.id}`}
        className="sticker press flex h-full flex-col gap-3 rounded-2xl bg-card p-5"
      >
        <div className="flex items-start justify-between gap-3">
          <span className="rounded-full bg-(--lang) px-2.5 py-0.5 text-xs font-semibold text-ink">{pack.topic}</span>
          <LevelBadge level={pack.level} />
        </div>
        <div className="flex-1">
          <h2 className="text-xl leading-tight font-semibold">{pack.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{pack.description}</p>
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium text-muted-foreground">
            <span>{pack.cards.length} cards</span>
            <span>
              {stats.mastered}/{stats.total} mastered
            </span>
          </div>
          <ProgressBar value={stats.percent} label={`${pack.title} mastery`} />
        </div>
      </Link>
    </li>
  );
}
