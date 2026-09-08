import { MomentFinder } from "@/components/moments/MomentFinder";

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-5 py-16 sm:py-24">
      <div className="flex flex-col gap-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-accent">
          Clipworthy
        </span>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Find the viral moments in any YouTube video
        </h1>
        <p className="max-w-xl text-sm text-muted sm:text-base">
          Paste a link. Clipworthy reads the transcript and hands you the funniest,
          most quotable, most share-worthy moments — with exact timestamps.
        </p>
      </div>

      <div className="mt-10">
        <MomentFinder />
      </div>

      <footer className="mt-auto pt-16 text-xs text-muted">
        v1 — timestamps only. Auto-cutting, vertical reframe, and captions are on the
        roadmap.
      </footer>
    </main>
  );
}
