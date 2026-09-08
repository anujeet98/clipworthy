import type { MomentsResult } from "@/lib/moments/schema";

export interface ApiError {
  code: string;
  message: string;
}

/** Calls `POST /api/moments` and narrows the response to a typed result. */
export async function requestMoments(url: string): Promise<MomentsResult> {
  const res = await fetch("/api/moments", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url }),
  });

  const data = (await res.json().catch(() => null)) as
    | MomentsResult
    | { error: ApiError }
    | null;

  if (!res.ok || !data || "error" in data) {
    const message =
      data && "error" in data ? data.error.message : "Request failed. Please try again.";
    throw new Error(message);
  }

  return data;
}
