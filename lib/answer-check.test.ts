import { describe, expect, it } from "vitest";
import { acceptedAnswers, checkAnswer, normalizeAnswer } from "./answer-check";

describe("normalizeAnswer", () => {
  it("trims, lowercases and collapses whitespace", () => {
    expect(normalizeAnswer("  Good    Morning  ")).toBe("good morning");
  });

  it("strips accents", () => {
    expect(normalizeAnswer("Café")).toBe("cafe");
    expect(normalizeAnswer("naïve résumé")).toBe("naive resume");
  });

  it("drops leading articles and 'to', repeatedly", () => {
    expect(normalizeAnswer("the apple")).toBe("apple");
    expect(normalizeAnswer("an egg")).toBe("egg");
    expect(normalizeAnswer("to eat")).toBe("eat");
    expect(normalizeAnswer("to the left")).toBe("left");
  });

  it("keeps a lone article word and words that merely start with one", () => {
    expect(normalizeAnswer("a")).toBe("a");
    expect(normalizeAnswer("theater")).toBe("theater");
    expect(normalizeAnswer("tomato")).toBe("tomato");
  });

  it("removes final punctuation and Spanish inverted marks", () => {
    expect(normalizeAnswer("How are you?")).toBe("how are you");
    expect(normalizeAnswer("¡Hola!")).toBe("hola");
    expect(normalizeAnswer("my name is…")).toBe("my name is");
    expect(normalizeAnswer("hello!!!")).toBe("hello");
  });

  it("removes parenthetical notes", () => {
    expect(normalizeAnswer("to know (facts)")).toBe("know");
    expect(normalizeAnswer("how are you? (formal)")).toBe("how are you");
  });

  it("normalizes curly apostrophes", () => {
    expect(normalizeAnswer("you’re welcome")).toBe("you're welcome");
  });

  it("does not strip Japanese voicing marks", () => {
    expect(normalizeAnswer("が")).not.toBe(normalizeAnswer("か"));
  });
});

describe("acceptedAnswers", () => {
  it("splits alternatives on / and ;", () => {
    expect(acceptedAnswers("bill / check")).toEqual(["bill / check", "bill", "check"]);
    expect(acceptedAnswers("hi; hello")).toEqual(["hi; hello", "hi", "hello"]);
  });
});

describe("checkAnswer", () => {
  it("accepts exact and lenient matches", () => {
    expect(checkAnswer("water", "water")).toBe(true);
    expect(checkAnswer("The Water.", "water")).toBe(true);
    expect(checkAnswer("eat", "to eat")).toBe(true);
    expect(checkAnswer("to eat", "to eat")).toBe(true);
  });

  it("accepts any listed alternative", () => {
    expect(checkAnswer("check", "bill / check")).toBe(true);
    expect(checkAnswer("to make", "to do / to make")).toBe(true);
    expect(checkAnswer("can", "to be able to / can")).toBe(true);
  });

  it("ignores parenthetical hints in the expected answer", () => {
    expect(checkAnswer("to be", "to be (states, location)")).toBe(true);
    expect(checkAnswer("how are you", "how are you? (informal)")).toBe(true);
  });

  it("rejects wrong or empty answers", () => {
    expect(checkAnswer("bread", "water")).toBe(false);
    expect(checkAnswer("", "water")).toBe(false);
    expect(checkAnswer("   ", "water")).toBe(false);
    expect(checkAnswer("the", "water")).toBe(false);
  });
});
