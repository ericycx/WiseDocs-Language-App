import { shuffle, type Rng } from "./shuffle";

export type LearnState = {
  /** Card ids still to answer; index 0 is the current question. */
  queue: string[];
  /** Ids missed at least once, in the order they were first missed. */
  missed: string[];
  totalAnswers: number;
  correctAnswers: number;
};

export const REQUEUE_MIN = 3;
export const REQUEUE_MAX = 5;

export function createLearnState(cardIds: readonly string[]): LearnState {
  return { queue: [...cardIds], missed: [], totalAnswers: 0, correctAnswers: 0 };
}

export function currentCardId(state: LearnState): string | undefined {
  return state.queue[0];
}

export function isLearnComplete(state: LearnState): boolean {
  return state.queue.length === 0;
}

/**
 * Records an answer to the current card. A correct card leaves the queue.
 * A missed card is re-inserted 3–5 positions later (so 3–5 other cards come
 * before it again), or at the end if fewer cards remain.
 */
export function answerLearn(state: LearnState, correct: boolean, rng: Rng = Math.random): LearnState {
  const [current, ...rest] = state.queue;
  if (current === undefined) return state;

  const totalAnswers = state.totalAnswers + 1;
  if (correct) {
    return { ...state, queue: rest, totalAnswers, correctAnswers: state.correctAnswers + 1 };
  }

  const span = REQUEUE_MAX - REQUEUE_MIN + 1;
  const offset = REQUEUE_MIN + Math.min(span - 1, Math.floor(rng() * span));
  const index = Math.min(offset, rest.length);
  const queue = [...rest.slice(0, index), current, ...rest.slice(index)];
  const missed = state.missed.includes(current) ? state.missed : [...state.missed, current];
  return { queue, missed, totalAnswers, correctAnswers: state.correctAnswers };
}

export function learnAccuracy(state: LearnState): number {
  return state.totalAnswers === 0 ? 0 : state.correctAnswers / state.totalAnswers;
}

/**
 * Builds up to 4 answer options: the correct one plus up to 3 distinct wrong
 * options from the same pack, shuffled.
 */
export function buildOptions(
  correct: string,
  pool: readonly string[],
  rng: Rng = Math.random,
  count = 4,
): string[] {
  const wrong = Array.from(new Set(pool.filter((o) => o !== correct)));
  const picked = shuffle(wrong, rng).slice(0, count - 1);
  return shuffle([correct, ...picked], rng);
}
