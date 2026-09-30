import type { Card, CardProgress, Pack, Progress } from "./types";

export const MASTERY_STREAK = 3;

export function packKey(pack: Pick<Pack, "languageCode" | "id">): string {
  return `${pack.languageCode}/${pack.id}`;
}

export function applyAnswer(prev: CardProgress | undefined, correct: boolean, now: number): CardProgress {
  const base: CardProgress = prev ?? { correct: 0, incorrect: 0, streak: 0, lastSeen: 0, mastered: false };
  if (correct) {
    const streak = base.streak + 1;
    return { ...base, correct: base.correct + 1, streak, lastSeen: now, mastered: base.mastered || streak >= MASTERY_STREAK };
  }
  return { ...base, incorrect: base.incorrect + 1, streak: 0, lastSeen: now, mastered: false };
}

export type PackStats = { total: number; mastered: number; learning: number; notStarted: number; percent: number };

export function packStats(progress: Progress, pack: Pack): PackStats {
  const entries = progress[packKey(pack)] ?? {};
  let mastered = 0;
  let learning = 0;
  for (const card of pack.cards) {
    const p = entries[card.id];
    if (!p) continue;
    if (p.mastered) mastered++;
    else learning++;
  }
  const total = pack.cards.length;
  return {
    total,
    mastered,
    learning,
    notStarted: total - mastered - learning,
    percent: total === 0 ? 0 : Math.round((mastered / total) * 100),
  };
}

export function unmasteredCards(progress: Progress, pack: Pack): Card[] {
  const entries = progress[packKey(pack)] ?? {};
  return pack.cards.filter((c) => !entries[c.id]?.mastered);
}

function isCardProgress(v: unknown): v is CardProgress {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.correct === "number" &&
    typeof o.incorrect === "number" &&
    typeof o.streak === "number" &&
    typeof o.lastSeen === "number" &&
    typeof o.mastered === "boolean"
  );
}

/** Parses stored progress, dropping anything malformed. Never throws. */
export function parseProgress(raw: string | null): Progress {
  if (!raw) return {};
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return {};
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) return {};
  const out: Progress = {};
  for (const [key, cards] of Object.entries(data as Record<string, unknown>)) {
    if (!cards || typeof cards !== "object" || Array.isArray(cards)) continue;
    const valid: Record<string, CardProgress> = {};
    for (const [cardId, cp] of Object.entries(cards as Record<string, unknown>)) {
      if (isCardProgress(cp)) valid[cardId] = cp;
    }
    out[key] = valid;
  }
  return out;
}
