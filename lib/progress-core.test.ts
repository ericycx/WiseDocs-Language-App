import { describe, expect, it } from "vitest";
import { applyAnswer, packKey, packStats, parseProgress, unmasteredCards } from "./progress-core";
import type { Pack } from "./types";

const pack: Pack = {
  id: "p",
  languageCode: "es",
  title: "P",
  description: "",
  topic: "T",
  level: "A1",
  cards: [
    { id: "a", term: "a", translation: "a" },
    { id: "b", term: "b", translation: "b" },
    { id: "c", term: "c", translation: "c" },
    { id: "d", term: "d", translation: "d" },
  ],
};

describe("applyAnswer", () => {
  it("masters a card after 3 correct answers in a row", () => {
    let p = applyAnswer(undefined, true, 1);
    p = applyAnswer(p, true, 2);
    expect(p.mastered).toBe(false);
    p = applyAnswer(p, true, 3);
    expect(p).toEqual({ correct: 3, incorrect: 0, streak: 3, lastSeen: 3, mastered: true });
  });

  it("resets the streak and clears mastery on a wrong answer", () => {
    let p = applyAnswer(undefined, true, 1);
    p = applyAnswer(p, true, 1);
    p = applyAnswer(p, true, 1);
    p = applyAnswer(p, false, 9);
    expect(p).toEqual({ correct: 3, incorrect: 1, streak: 0, lastSeen: 9, mastered: false });
  });
});

describe("packStats / unmasteredCards", () => {
  const mastered = { correct: 3, incorrect: 0, streak: 3, lastSeen: 1, mastered: true };
  const learning = { correct: 1, incorrect: 1, streak: 1, lastSeen: 1, mastered: false };
  const progress = { [packKey(pack)]: { a: mastered, b: learning, zzz: mastered } };

  it("counts mastered, learning and not started cards", () => {
    expect(packStats(progress, pack)).toEqual({ total: 4, mastered: 1, learning: 1, notStarted: 2, percent: 25 });
    expect(packStats({}, pack).percent).toBe(0);
  });

  it("lists cards that are not mastered", () => {
    expect(unmasteredCards(progress, pack).map((c) => c.id)).toEqual(["b", "c", "d"]);
  });
});

describe("parseProgress", () => {
  it("returns empty for missing or corrupt data", () => {
    expect(parseProgress(null)).toEqual({});
    expect(parseProgress("not json")).toEqual({});
    expect(parseProgress("[1,2]")).toEqual({});
    expect(parseProgress("42")).toEqual({});
  });

  it("drops malformed entries but keeps valid ones", () => {
    const ok = { correct: 1, incorrect: 0, streak: 1, lastSeen: 5, mastered: false };
    const raw = JSON.stringify({ "es/p": { a: ok, b: { correct: "x" } }, bad: 3 });
    expect(parseProgress(raw)).toEqual({ "es/p": { a: ok } });
  });
});
