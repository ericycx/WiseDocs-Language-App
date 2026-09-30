import { describe, expect, it } from "vitest";
import {
  answerLearn,
  buildOptions,
  createLearnState,
  currentCardId,
  isLearnComplete,
  learnAccuracy,
  type LearnState,
} from "./learn-queue";

const ids = ["a", "b", "c", "d", "e", "f", "g", "h"];
const rng = (value: number) => () => value;

describe("learn queue", () => {
  it("starts with every card queued in order", () => {
    const s = createLearnState(ids);
    expect(s.queue).toEqual(ids);
    expect(currentCardId(s)).toBe("a");
    expect(isLearnComplete(s)).toBe(false);
  });

  it("removes a card answered correctly", () => {
    const s = answerLearn(createLearnState(ids), true);
    expect(s.queue).toEqual(ids.slice(1));
    expect(s.correctAnswers).toBe(1);
    expect(s.totalAnswers).toBe(1);
    expect(s.missed).toEqual([]);
  });

  it("puts a missed card back 3 positions later at minimum", () => {
    const s = answerLearn(createLearnState(ids), false, rng(0));
    expect(s.queue).toEqual(["b", "c", "d", "a", "e", "f", "g", "h"]);
    expect(s.missed).toEqual(["a"]);
  });

  it("puts a missed card back at most 5 positions later", () => {
    const s = answerLearn(createLearnState(ids), false, rng(0.9999));
    expect(s.queue).toEqual(["b", "c", "d", "e", "f", "a", "g", "h"]);
  });

  it("always re-inserts between 3 and 5 positions later", () => {
    for (let r = 0; r < 1; r += 0.05) {
      const s = answerLearn(createLearnState(ids), false, rng(r));
      const pos = s.queue.indexOf("a");
      expect(pos).toBeGreaterThanOrEqual(3);
      expect(pos).toBeLessThanOrEqual(5);
      expect(s.queue).toHaveLength(ids.length);
    }
  });

  it("appends to the end when fewer cards remain", () => {
    const s = answerLearn(createLearnState(["a", "b"]), false, rng(0));
    expect(s.queue).toEqual(["b", "a"]);
    const single = answerLearn(createLearnState(["a"]), false, rng(0));
    expect(single.queue).toEqual(["a"]);
  });

  it("records a missed card only once", () => {
    let s = createLearnState(["a"]);
    s = answerLearn(s, false);
    s = answerLearn(s, false);
    expect(s.missed).toEqual(["a"]);
    expect(s.totalAnswers).toBe(2);
  });

  it("completes once every card has been answered correctly", () => {
    let s: LearnState = createLearnState(["a", "b", "c"]);
    s = answerLearn(s, false, rng(0)); // a missed -> b c a
    s = answerLearn(s, true); // b
    s = answerLearn(s, true); // c
    expect(currentCardId(s)).toBe("a");
    s = answerLearn(s, true); // a
    expect(isLearnComplete(s)).toBe(true);
    expect(s.missed).toEqual(["a"]);
    expect(learnAccuracy(s)).toBeCloseTo(3 / 4);
  });

  it("ignores answers once complete", () => {
    const done = answerLearn(createLearnState(["a"]), true);
    expect(answerLearn(done, true)).toBe(done);
  });

  it("does not mutate the previous state", () => {
    const s = createLearnState(ids);
    const snapshot = structuredClone(s);
    answerLearn(s, false, rng(0.5));
    expect(s).toEqual(snapshot);
  });

  it("reports 0 accuracy before any answers", () => {
    expect(learnAccuracy(createLearnState(ids))).toBe(0);
  });
});

describe("buildOptions", () => {
  const pool = ["water", "bread", "milk", "cheese", "apple", "rice"];

  it("returns 4 unique options including the correct one", () => {
    for (let i = 0; i < 20; i++) {
      const options = buildOptions("water", pool);
      expect(options).toHaveLength(4);
      expect(new Set(options).size).toBe(4);
      expect(options).toContain("water");
      options.forEach((o) => expect(pool).toContain(o));
    }
  });

  it("handles small pools and duplicate translations", () => {
    const options = buildOptions("yes", ["yes", "no", "no"]);
    expect(options.sort()).toEqual(["no", "yes"]);
  });
});
