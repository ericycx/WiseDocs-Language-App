"use client";

import { Search, X } from "lucide-react";
import { useId, useMemo, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { PackCard } from "@/components/pack-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LEVELS, type Pack } from "@/lib/types";

const ALL = "all";

const chip =
  "h-8 rounded-full border-2 border-ink bg-card px-3 font-semibold data-[state=on]:bg-foreground data-[state=on]:text-background hover:bg-accent";

export function PackBrowser({ packs, languageName }: { packs: Pack[]; languageName: string }) {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<string>(ALL);
  const [topic, setTopic] = useState<string>(ALL);
  const searchId = useId();

  const levels = useMemo(() => LEVELS.filter((l) => packs.some((p) => p.level === l)), [packs]);
  const topics = useMemo(() => Array.from(new Set(packs.map((p) => p.topic))).sort(), [packs]);

  const q = query.trim().toLowerCase();
  const filtered = packs.filter(
    (p) =>
      (level === ALL || p.level === level) &&
      (topic === ALL || p.topic === topic) &&
      (q === "" || p.title.toLowerCase().includes(q)),
  );
  const hasFilters = q !== "" || level !== ALL || topic !== ALL;

  function reset() {
    setQuery("");
    setLevel(ALL);
    setTopic(ALL);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4" role="search" aria-label={`Filter ${languageName} packs`}>
        <div className="relative max-w-md">
          <label htmlFor={searchId} className="sr-only">
            Search packs by title
          </label>
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id={searchId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search packs…"
            className="sticker-sm h-11 rounded-xl bg-card pl-9 text-base"
          />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
          <FilterGroup label="Level" value={level} onChange={setLevel} options={levels} />
          <FilterGroup label="Topic" value={topic} onChange={setTopic} options={topics} />
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? "pack" : "packs"} shown
      </p>

      {filtered.length > 0 ? (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((pack) => (
            <PackCard key={pack.id} pack={pack} />
          ))}
        </ul>
      ) : (
        <EmptyState
          emoji="🔍"
          title="No packs match"
          action={
            hasFilters ? (
              <Button onClick={reset} className="sticker-sm press h-10 rounded-full px-4">
                <X aria-hidden /> Clear filters
              </Button>
            ) : undefined
          }
        >
          Try a different search or loosen the level and topic filters.
        </EmptyState>
      )}
    </div>
  );
}

function FilterGroup({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
}) {
  const labelId = useId();
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span id={labelId} className="text-sm font-semibold text-muted-foreground">
        {label}
      </span>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(v) => onChange(v || ALL)}
        aria-labelledby={labelId}
        className="flex-wrap"
      >
        <ToggleGroupItem value={ALL} className={chip}>
          All
        </ToggleGroupItem>
        {options.map((o) => (
          <ToggleGroupItem key={o} value={o} className={chip}>
            {o}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
