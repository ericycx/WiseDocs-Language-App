import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <div
        aria-hidden
        className="sticker mb-8 grid h-40 w-64 rotate-3 place-items-center rounded-2xl bg-card font-heading text-6xl font-semibold"
      >
        ¿404?
      </div>
      <h1 className="text-4xl font-semibold tracking-tight">Lost in translation</h1>
      <p className="mt-3 max-w-md text-lg text-muted-foreground">
        We couldn&apos;t find that language or pack. It may have moved, or the link has a typo.
      </p>
      <Button asChild className="sticker-sm press mt-6 h-11 rounded-full px-5 text-base">
        <Link href="/">Back to all languages</Link>
      </Button>
    </div>
  );
}
