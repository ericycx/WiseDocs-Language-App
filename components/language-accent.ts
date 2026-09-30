import type { CSSProperties } from "react";

/** Sets `--lang` to the language's accent color so children can use `bg-(--lang)`. */
export function languageAccent(code: string): CSSProperties {
  return { "--lang": `var(--lang-${code}, var(--primary))` } as CSSProperties;
}
