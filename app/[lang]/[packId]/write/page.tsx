import type { Metadata } from "next";
import { StudyPage, studyMetadata } from "@/components/study-page";
import { getAllPackParams } from "@/lib/data";

export async function generateStaticParams() {
  return getAllPackParams();
}

export async function generateMetadata({ params }: PageProps<"/[lang]/[packId]/write">): Promise<Metadata> {
  return studyMetadata(params, "write");
}

export default function Page({ params, searchParams }: PageProps<"/[lang]/[packId]/write">) {
  return <StudyPage params={params} searchParams={searchParams} mode="write" />;
}
