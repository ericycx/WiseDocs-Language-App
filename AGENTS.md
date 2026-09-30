# AGENTS.md

Guidance for AI coding agents (Claude Code, Codex, Cursor, etc.) working in this repo.

## Project

A Quizlet-style language-learning app. The user picks a language, browses topic packs, and studies them with Flashcards, Learn (multiple choice), Write, and Match modes. **The full spec is in [`docs/PLAN.md`](docs/PLAN.md). Read it before making changes.**

Version 1 is frontend-only: mock JSON data, with progress saved in `localStorage`.

## Stack

Next.js (App Router) · React · TypeScript (strict) · Tailwind CSS · shadcn/ui · Vitest

## Commands

```bash
npm run dev        # start dev server (http://localhost:3000)
npm run build      # production build — must pass before finishing a task
npm run lint       # ESLint
npm test           # Vitest unit tests
```

## Conventions

- **Data access only through `lib/data.ts`.** Components never import `data/*.json` directly. That is what lets a real API replace the mock data later.
- **Shared types live in `lib/types.ts`.** Don't redefine `Language`, `Pack`, `Card` or `Progress` anywhere else.
- **Server Components by default.** Add `"use client"` only for components that need state, effects, or browser APIs (study modes, `useProgress`, TTS).
- **Keep logic pure and tested.** Answer checking (`lib/answer-check.ts`), the learn queue (`lib/learn-queue.ts`) and shuffling stay pure functions with Vitest tests.
- **`localStorage` access is guarded.** Wrap it in try/catch, never touch it during server render, and handle missing or corrupt data.
- **Accessibility is required.** Keyboard support, visible focus, `aria-label` on icon-only buttons, and respect `prefers-reduced-motion`.
- **Mobile-first** Tailwind styling. Use shadcn/ui components from `components/ui/`.
- Name files in kebab-case (`pack-card.tsx`) and components in PascalCase (`PackCard`).
- Mock card content must be **linguistically accurate**. Don't invent words.

## Definition of done

1. `npm run lint`, `npm test` and `npm run build` all pass.
2. The affected routes were loaded in the dev server and work.
3. If the change goes beyond the spec, `docs/PLAN.md` is updated to match.

## Out of scope for now

Auth, a backend/database, user-created packs, spaced repetition. Don't add these unless asked.
