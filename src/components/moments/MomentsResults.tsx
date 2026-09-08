import Image from "next/image";
import { MomentCard } from "@/components/moments/MomentCard";
import type { MomentsResult } from "@/lib/moments/schema";

export function MomentsResults({ result }: { result: MomentsResult }) {
  const { video, moments } = result;

  return (
    <section className="flex flex-col gap-5">
      <header className="flex items-center gap-4">
        <Image
          src={video.thumbnailUrl}
          alt=""
          width={120}
          height={68}
          className="rounded-control border border-border object-cover"
          unoptimized
        />
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-foreground">{video.title}</h2>
          <p className="truncate text-xs text-muted">{video.author}</p>
          <p className="mt-1 text-xs text-muted">
            {moments.length} moment{moments.length === 1 ? "" : "s"} found
          </p>
        </div>
      </header>

      {moments.length === 0 ? (
        <p className="rounded-card border border-border bg-surface p-4 text-sm text-muted">
          No standout moments in this one — try a longer or more conversational video.
        </p>
      ) : (
        <ol className="flex flex-col gap-3">
          {moments.map((moment, index) => (
            <li key={moment.id}>
              <MomentCard moment={moment} rank={index + 1} />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
