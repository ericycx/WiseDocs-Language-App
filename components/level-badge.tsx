import { Badge } from "@/components/ui/badge";
import type { Level } from "@/lib/types";

const LEVEL_NAMES: Record<Level, string> = {
  A1: "Beginner",
  A2: "Elementary",
  B1: "Intermediate",
  B2: "Upper intermediate",
  C1: "Advanced",
};

export function LevelBadge({ level }: { level: Level }) {
  return (
    <Badge
      variant="outline"
      className="h-6 border-2 border-ink bg-secondary px-2 font-mono text-xs font-bold text-secondary-foreground"
      title={`${level} · ${LEVEL_NAMES[level]}`}
    >
      <span className="sr-only">Level </span>
      {level}
    </Badge>
  );
}
