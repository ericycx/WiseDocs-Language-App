import { describe, expect, it } from "vitest";
import { sample, shuffle } from "./shuffle";

describe("shuffle", () => {
  it("returns a permutation without mutating the input", () => {
    const input = [1, 2, 3, 4, 5, 6];
    const copy = [...input];
    const out = shuffle(input);
    expect(input).toEqual(copy);
    expect(out).not.toBe(input);
    expect([...out].sort()).toEqual(copy);
  });

  it("is deterministic for a given rng", () => {
    // rng always 0 -> each step swaps i with 0
    expect(shuffle([1, 2, 3, 4], () => 0)).toEqual([2, 3, 4, 1]);
    // rng just under 1 -> j === i, so nothing moves
    expect(shuffle([1, 2, 3, 4], () => 0.9999)).toEqual([1, 2, 3, 4]);
  });

  it("handles empty and single-item arrays", () => {
    expect(shuffle([])).toEqual([]);
    expect(shuffle(["x"])).toEqual(["x"]);
  });

  it("produces every permutation of 3 items over many runs", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 500; i++) seen.add(shuffle(["a", "b", "c"]).join(""));
    expect(seen.size).toBe(6);
  });
});

describe("sample", () => {
  it("returns at most `count` distinct items", () => {
    const out = sample([1, 2, 3, 4, 5, 6, 7, 8], 6);
    expect(out).toHaveLength(6);
    expect(new Set(out).size).toBe(6);
    expect(sample([1, 2], 6)).toHaveLength(2);
    expect(sample([1, 2], -1)).toEqual([]);
  });
});
