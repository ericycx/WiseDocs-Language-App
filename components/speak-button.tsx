"use client";

import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/lib/progress";
import { isTtsSupported, speak } from "@/lib/tts";
import { cn } from "@/lib/utils";

export function SpeakButton({
  text,
  locale,
  className,
  size = "icon-lg",
}: {
  text: string;
  locale: string;
  className?: string;
  size?: "icon" | "icon-sm" | "icon-lg";
}) {
  const hydrated = useHydrated();
  const supported = hydrated && isTtsSupported();

  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      disabled={!supported}
      aria-label={supported ? `Pronounce “${text}”` : "Pronunciation isn't available in this browser"}
      title={supported ? "Listen" : "Text-to-speech isn't supported in this browser"}
      onClick={(e) => {
        e.stopPropagation();
        speak(text, locale);
      }}
      onKeyDown={(e) => e.stopPropagation()}
      className={cn("rounded-full border-2 border-ink bg-card", className)}
    >
      <Volume2 aria-hidden />
    </Button>
  );
}
