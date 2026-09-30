import { useCallback, useSyncExternalStore } from "react";
import { applyAnswer, packKey, parseProgress } from "./progress-core";
import type { Pack, Progress } from "./types";

const PROGRESS_KEY = "tandem:progress:v1";
const BEST_TIMES_KEY = "tandem:match-best:v1";
const CHANGE_EVENT = "tandem:storage";

const EMPTY_PROGRESS: Progress = {};
const EMPTY_TIMES: Record<string, number> = {};

function readRaw(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeRaw(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage full or blocked (private mode): progress just won't persist.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

/** Caches the parsed value per raw string so snapshots stay referentially stable. */
function cachedReader<T>(key: string, parse: (raw: string | null) => T): () => T {
  let lastRaw: string | null | undefined;
  let lastValue: T;
  return () => {
    const raw = readRaw(key);
    if (raw !== lastRaw) {
      lastRaw = raw;
      lastValue = parse(raw);
    }
    return lastValue;
  };
}

const readProgress = cachedReader(PROGRESS_KEY, parseProgress);

function parseTimes(raw: string | null): Record<string, number> {
  if (!raw) return EMPTY_TIMES;
  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== "object" || Array.isArray(data)) return EMPTY_TIMES;
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
      if (typeof v === "number" && Number.isFinite(v) && v > 0) out[k] = v;
    }
    return out;
  } catch {
    return EMPTY_TIMES;
  }
}

const readTimes = cachedReader(BEST_TIMES_KEY, parseTimes);

export function useProgress() {
  const progress = useSyncExternalStore(subscribe, readProgress, () => EMPTY_PROGRESS);

  const recordAnswer = useCallback((pack: Pack, cardId: string, correct: boolean) => {
    const current = readProgress();
    const key = packKey(pack);
    const packProgress = current[key] ?? {};
    const next: Progress = {
      ...current,
      [key]: { ...packProgress, [cardId]: applyAnswer(packProgress[cardId], correct, Date.now()) },
    };
    writeRaw(PROGRESS_KEY, JSON.stringify(next));
  }, []);

  const resetPack = useCallback((pack: Pack) => {
    const next = { ...readProgress() };
    delete next[packKey(pack)];
    writeRaw(PROGRESS_KEY, JSON.stringify(next));
  }, []);

  return { progress, recordAnswer, resetPack };
}

/** Best Match time (ms) for a pack; `saveTime` keeps the lower value. */
export function useBestTime(pack: Pack) {
  const times = useSyncExternalStore(subscribe, readTimes, () => EMPTY_TIMES);
  const key = packKey(pack);
  const best = times[key];

  const saveTime = useCallback(
    (ms: number): boolean => {
      const current = readTimes();
      const prev = current[key];
      if (prev !== undefined && prev <= ms) return false;
      writeRaw(BEST_TIMES_KEY, JSON.stringify({ ...current, [key]: ms }));
      return true;
    },
    [key],
  );

  return { best, saveTime };
}

const noopSubscribe = () => () => {};

/** False during SSR and hydration, true afterwards. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
