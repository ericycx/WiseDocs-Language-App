import { describe, expect, it } from "vitest";
import { getAllPackParams, getLanguages, getPack, getPacks } from "./data";
import { LEVELS } from "./types";

describe("mock data", () => {
  it("has 4 languages with 3–5 packs of 10–20 cards each", async () => {
    const languages = await getLanguages();
    expect(languages.map((l) => l.code).sort()).toEqual(["de", "es", "fr", "ja"]);
    for (const lang of languages) {
      const packs = await getPacks(lang.code);
      expect(packs.length).toBeGreaterThanOrEqual(3);
      expect(packs.length).toBeLessThanOrEqual(5);
      for (const pack of packs) {
        expect(pack.languageCode).toBe(lang.code);
        expect(LEVELS).toContain(pack.level);
        expect(pack.cards.length).toBeGreaterThanOrEqual(10);
        expect(pack.cards.length).toBeLessThanOrEqual(20);
        const ids = pack.cards.map((c) => c.id);
        expect(new Set(ids).size).toBe(ids.length);
        for (const card of pack.cards) {
          expect(card.term.trim()).not.toBe("");
          expect(card.translation.trim()).not.toBe("");
          if (lang.code === "ja") expect(card.pronunciation).toBeTruthy();
        }
      }
      expect(new Set(packs.map((p) => p.id)).size).toBe(packs.length);
    }
  });

  it("looks up packs and returns undefined for unknown ids", async () => {
    expect((await getPack("es", "food-drink"))?.title).toBe("Food & Drink");
    expect(await getPack("es", "nope")).toBeUndefined();
    expect(await getPack("xx", "food-drink")).toBeUndefined();
    expect(await getPacks("xx")).toEqual([]);
    expect((await getAllPackParams()).length).toBeGreaterThan(12);
  });
});
