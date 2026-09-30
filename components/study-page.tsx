import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StudyModeLayout } from "@/components/study-mode-layout";
import { STUDY_MODES } from "@/components/study-mode-links";
import { StudySession } from "@/components/study-session";
import { getLanguage, getPack } from "@/lib/data";
import type { StudyMode } from "@/lib/types";

type StudyParams = Promise<{ lang: string; packId: string }>;
type StudySearchParams = Promise<Record<string, string | string[] | undefined>>;

async function load(params: StudyParams) {
  const { lang, packId } = await params;
  const [language, pack] = await Promise.all([getLanguage(lang), getPack(lang, packId)]);
  if (!language || !pack) notFound();
  return { language, pack };
}

export async function studyMetadata(params: StudyParams, mode: StudyMode): Promise<Metadata> {
  const { lang, packId } = await params;
  const [language, pack] = await Promise.all([getLanguage(lang), getPack(lang, packId)]);
  const label = STUDY_MODES.find((m) => m.mode === mode)?.label ?? mode;
  return language && pack ? { title: `${label} · ${pack.title} · ${language.name}` } : {};
}

/** Shared server entry for the four study-mode routes. */
export async function StudyPage({
  params,
  searchParams,
  mode,
}: {
  params: StudyParams;
  searchParams: StudySearchParams;
  mode: StudyMode;
}) {
  const [{ language, pack }, query] = await Promise.all([load(params), searchParams]);
  const missedOnly = query.filter === "missed";

  return (
    <StudyModeLayout language={language} pack={pack} mode={mode} missedOnly={missedOnly}>
      <StudySession language={language} pack={pack} mode={mode} missedOnly={missedOnly} />
    </StudyModeLayout>
  );
}
