"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MomentsResults } from "@/components/moments/MomentsResults";
import { requestMoments } from "@/lib/moments/client";
import type { MomentsResult } from "@/lib/moments/schema";

type Status = "idle" | "loading" | "success" | "error";

export function MomentFinder() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MomentsResult | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!url.trim() || status === "loading") return;

    setStatus("loading");
    setError(null);

    try {
      const data = await requestMoments(url.trim());
      setResult(data);
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  return (
    <div className="flex w-full flex-col gap-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <Input
          type="url"
          inputMode="url"
          placeholder="https://www.youtube.com/watch?v=…"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          invalid={status === "error"}
          aria-label="YouTube video URL"
        />
        <Button type="submit" loading={status === "loading"} className="sm:w-44 sm:shrink-0">
          {status === "loading" ? "Analysing…" : "Find moments"}
        </Button>
      </form>

      {status === "error" && error && (
        <p className="text-sm text-primary" role="alert">
          {error}
        </p>
      )}

      {status === "loading" && (
        <p className="text-sm text-muted">
          Pulling the transcript and scanning for share-worthy moments. This usually
          takes 10–30 seconds.
        </p>
      )}

      {status === "success" && result && <MomentsResults result={result} />}
    </div>
  );
}
