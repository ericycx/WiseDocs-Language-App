import type { ReactNode } from "react";

export function EmptyState({
  emoji,
  title,
  children,
  action,
}: {
  emoji: string;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="sticker animate-pop-in mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl bg-card px-6 py-10 text-center">
      <span aria-hidden className="text-5xl">
        {emoji}
      </span>
      <h2 className="text-2xl font-semibold">{title}</h2>
      {children && <div className="text-muted-foreground">{children}</div>}
      {action && <div className="mt-2 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}
