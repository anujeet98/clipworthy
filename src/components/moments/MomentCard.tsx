import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { categoryTone } from "@/components/moments/category-tone";
import type { Moment } from "@/lib/moments/schema";

function formatDuration(seconds: number): string {
  return `${seconds}s`;
}

export function MomentCard({ moment, rank }: { moment: Moment; rank: number }) {
  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted">#{rank}</span>
          <Badge tone={categoryTone[moment.category]}>{moment.category}</Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="font-mono">{moment.startLabel}</span>
          <span aria-hidden>·</span>
          <span>{formatDuration(moment.durationSeconds)}</span>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-foreground">{moment.hook}</p>

      <div className="mt-1 flex items-center justify-between">
        <div className="flex items-center gap-2" title="Predicted short-form performance">
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-surface-raised">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${moment.score}%` }}
            />
          </div>
          <span className="text-xs text-muted">{moment.score}</span>
        </div>

        <a
          href={moment.watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-accent hover:underline"
        >
          Watch on YouTube ↗
        </a>
      </div>
    </Card>
  );
}
