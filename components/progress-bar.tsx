import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  label,
  className,
}: {
  value: number;
  label: string;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <Progress
      value={clamped}
      aria-label={label}
      aria-valuetext={`${clamped}%`}
      className={cn(
        "h-3 rounded-full border-2 border-ink bg-muted [&>[data-slot=progress-indicator]]:bg-success",
        className,
      )}
    />
  );
}
