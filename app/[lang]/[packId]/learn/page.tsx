import type { Metadata } from "next";
import { StudyPage, studyMetadata } from "@/components/study-page";
import { getAllPackParams } from "@/lib/data";

export async function generateStaticParams() {
  return getAllPackParams();
}

export async function generateMetadata({ params }: PageProps<"/[lang]/[packId]/learn">): Promise<Metadata> {
  return studyMetadata(params, "learn");
}

export default function Page({ params, searchParams }: PageProps<"/[lang]/[packId]/learn">) {
  return <StudyPage params={params} searchParams={searchParams} mode="learn" />;
}
