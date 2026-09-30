# Language Learning App — Frontend Plan

A Quizlet-style flashcard app organized by language. The user picks a language, browses topic packs for it, and studies a pack in several modes.

Version 1 is **frontend-only**: mock data sits behind a small data layer so a real API can replace it later without UI changes.

## Stack

- Next.js (App Router) + React + TypeScript (strict)
- Tailwind CSS + shadcn/ui
- Vitest for unit tests
- Mock data in `data/*.json`, read only through `lib/data.ts`
- Study progress saved in `localStorage` (through a `useProgress` hook)
- Pronunciation through the browser's Web Speech API (`speechSynthesis`)

## User flow / routes

| Route | Purpose |
|---|---|
| `/` | Language picker: grid of cards (flag, name, native name, pack count) |
| `/[lang]` | Pack list: search by title, filter by level and topic, progress bar per pack |
| `/[lang]/[packId]` | Pack overview: description, full card list, study-mode buttons, mastery stats |
| `/[lang]/[packId]/flashcards` | Flip cards, prev/next, shuffle, choose which side shows first, text-to-speech |
| `/[lang]/[packId]/learn` | Multiple choice (4 options), missed cards come back later, results screen |
| `/[lang]/[packId]/write` | Type the translation, accent/case-insensitive check, "I was right" override |
| `/[lang]/[packId]/match` | Timed pairing game, best time saved |

Invalid language or pack IDs render a friendly 404.

## Data model

```ts
type Level = "A1" | "A2" | "B1" | "B2" | "C1";

type Language = {
  code: string;        // "es"
  name: string;        // "Spanish"
  nativeName: string;  // "Español"
  flag: string;        // "🇪🇸"
  ttsLocale: string;   // "es-ES"
};

type Card = {
  id: string;
  term: string;              // in the target language
  translation: string;       // in English
  pronunciation?: string;
  partOfSpeech?: string;
  example?: string;
  exampleTranslation?: string;
};

type Pack = {
  id: string;
  languageCode: string;
  title: string;
  description: string;
  topic: string;
  level: Level;
  cards: Card[];
};

type CardProgress = { correct: number; incorrect: number; streak: number; lastSeen: number; mastered: boolean };
type Progress = Record<string /* packId */, Record<string /* cardId */, CardProgress>>;
```

A card is **mastered** after 3 correct answers in a row. A wrong answer resets the streak and clears mastery.

## Mock data

Spanish, French, Japanese and German. Each has 3–5 packs (for example Greetings, Food & Drink, Travel, Numbers, Common Verbs) with 10–20 **accurate** cards each. Japanese cards put romaji in `pronunciation`.

## Study mode details

**Flashcards:** Flip animation (respects `prefers-reduced-motion`), tap or Space to flip, ←/→ to move, shuffle, toggle to show the term or the translation first, speaker button that reads the term in the language's `ttsLocale`, and an "N / total" counter.

**Learn:** 4 options, with the 3 wrong options taken from the same pack. Feedback shows right away. A missed card is put back 3–5 positions later in the queue. The session ends when every card has been answered correctly once. The results screen shows accuracy and the missed cards. The queue logic lives in `lib/learn-queue.ts` and is a pure, tested function.

**Write:** Type the translation. `lib/answer-check.ts` normalizes answers (trim, lowercase, strip accents, collapse whitespace, ignore leading articles like "the"/"to" and final punctuation). On a miss it shows the correct answer, with an "I was right" override.

**Match:** Up to 6 pairs per round in a shuffled grid. Click a term, then its translation. Wrong pairs flash red. Timer, with the best time per pack saved in localStorage.

**Missed cards:** Every mode can run with only the unmastered cards (`?filter=missed`).

## Project structure

```
app/
  layout.tsx, page.tsx, not-found.tsx
  [lang]/page.tsx
  [lang]/[packId]/page.tsx
  [lang]/[packId]/{flashcards,learn,write,match}/page.tsx
components/   LanguageCard, PackCard, Flashcard, StudyModeLayout, ProgressBar, Breadcrumbs, ...
components/ui/ shadcn components
lib/          types.ts, data.ts, progress.ts (useProgress), answer-check.ts, learn-queue.ts, tts.ts, shuffle.ts
data/         languages.json, packs/<lang>.json
docs/         PLAN.md (this file)
```

## Build phases

1. **Setup:** Scaffold the app, add Tailwind and shadcn, write the types, mock data and data layer, and set up Vitest.
2. **Browsing:** Language picker, pack list (search and filters), pack overview, breadcrumbs, 404.
3. **Flashcards mode**
4. **Learn, Write and Match modes**, plus unit tests for `answer-check` and `learn-queue`
5. **Progress:** The `useProgress` hook, progress bars, mastery stats, missed-cards filter
6. **Polish:** Responsive/mobile layout, dark mode, accessibility (keyboard, focus, aria labels, reduced motion), empty states

## UI / UX

- A friendly, distinctive design, not a generic template look. Light and dark mode.
- Mobile-first. Flashcards must work well on phones.
- Accessible: keyboard navigation, visible focus, aria labels on icon buttons.
- Breadcrumbs: `Languages › Spanish › Food & Drink`.

## Out of scope (later)

Accounts/auth, a backend API, user-made packs, spaced repetition (SRS), choosing a base language other than English.

## Implementation notes (v1)

Decisions made while building v1 that refine the spec above:

- **Progress keys:** Pack ids are only unique within a language (e.g. `/es/food-drink` and `/fr/food-drink`), so the outer `Progress` key is `${languageCode}/${packId}` (`packKey()` in `lib/progress-core.ts`). Pure progress logic (mastery rule, stats, parsing corrupt storage) lives in `lib/progress-core.ts` and is tested; `lib/progress.ts` holds the `useProgress` / `useBestTime` hooks.
- **Answer alternatives:** A `translation` may list accepted alternatives separated by `/` or `;` (e.g. `"bill / check"`), and parenthetical notes such as `"to know (facts)"` are ignored when checking answers.
- **Mastery sources:** Learn and Write record answers toward mastery. Flashcards and Match don't, because they don't test recall.
- **Write:** One pass through the shuffled deck. Correct answers are recorded right away. A miss is recorded only when the learner continues, so "I was right" can count it as correct instead. The results screen offers "Retry missed".
- **Learn:** Wrong options come from the whole pack, even when `?filter=missed` narrows the session. A missed card goes back into the queue after 3–5 other cards (or at the end if fewer remain).
- **Match:** Pairs can be picked in either order (term → translation or translation → term). The timer starts on the first tap.
- **Missed filter:** The card set is frozen when a session starts, so cards mastered mid-session stay in the deck until it's restarted.
