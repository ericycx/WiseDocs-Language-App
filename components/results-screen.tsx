"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { Card, Language } from "@/lib/types";

export function ResultsScreen({
  title,
  emoji,
  stats,
  missed,
  language,
  backHref,
  actions,
}: {
  title: string;
  emoji: string;
  stats: { label: string; value: string }[];
  missed: Card[];
  language: Language;
  backHref: string;
  actions: ReactNode;
}) {
  return (
    <section aria-labelledby="results-heading" className="animate-pop-in mx-auto max-w-2xl space-y-6">
      <div className="sticker rounded-3xl bg-card p-6 text-center sm:p-8">
        <span aria-hidden className="text-5xl">
          {emoji}
        </span>
        <h2 id="results-heading" className="mt-2 text-3xl font-semibold">
          {title}
        </h2>
        <dl className="mt-5 flex flex-wrap justify-center gap-3">
          {stats.map((s) => (
            <div key={s.label} className="min-w-28 rounded-2xl border-2 border-ink bg-(--lang)/25 px-4 py-3">
              <dt className="text-xs font-bold tracking-wide text-muted-foreground uppercase">{s.label}</dt>
              <dd className="font-heading text-3xl font-semibold">{s.value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {actions}
          <Button asChild variant="outline" className="h-11 rounded-full border-2 border-ink px-5">
            <Link href={backHref}>Back to pack</Link>
          </Button>
        </div>
      </div>

      {missed.length > 0 ? (
        <div>
          <h3 className="mb-2 text-xl font-semibold">Cards to practice ({missed.length})</h3>
          <ul className="divide-y-2 divide-ink/10 overflow-hidden rounded-2xl border-2 border-ink bg-card">
            {missed.map((c) => (
              <li key={c.id} className="flex flex-wrap justify-between gap-x-4 gap-y-1 p-4">
                <span lang={language.code} className="font-semibold">
                  {c.term}
                  {c.pronunciation && (
                    <span className="ml-2 text-sm font-normal text-muted-foreground italic">{c.pronunciation}</span>
                  )}
                </span>
                <span className="text-muted-foreground">{c.translation}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-center font-semibold">No misses. Flawless! ✨</p>
      )}
    </section>
  );
}
