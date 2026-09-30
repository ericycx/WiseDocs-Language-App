const LEADING_WORDS = ["the", "to", "a", "an"];

/**
 * Normalizes an answer for lenient comparison: trims, lowercases, strips Latin
 * accents, removes parenthetical notes, leading ¿/¡, trailing punctuation,
 * collapses whitespace and drops leading English articles / "to".
 */
export function normalizeAnswer(input: string): string {
  let s = input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // combining Latin diacritics only (keeps Japanese dakuten)
    .normalize("NFC")
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ") // parenthetical notes, e.g. "you (formal)"
    .replace(/[’‘`]/g, "'")
    .replace(/[¿¡"“”]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[\s.,!?;:…。！？、]+$/u, "")
    .trim();

  let changed = true;
  while (changed) {
    changed = false;
    for (const word of LEADING_WORDS) {
      if (s.startsWith(word + " ") && s.length > word.length + 1) {
        s = s.slice(word.length + 1).trimStart();
        changed = true;
      }
    }
  }
  return s;
}

/** Accepted answers for an expected translation: the whole string plus "/" or ";" alternatives. */
export function acceptedAnswers(expected: string): string[] {
  const parts = [expected, ...expected.split(/[/;]/)];
  const normalized = parts.map(normalizeAnswer).filter((p) => p.length > 0);
  return Array.from(new Set(normalized));
}

export function checkAnswer(input: string, expected: string): boolean {
  const given = normalizeAnswer(input);
  if (!given) return false;
  return acceptedAnswers(expected).includes(given);
}
