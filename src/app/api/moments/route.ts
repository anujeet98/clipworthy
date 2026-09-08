/**
 * POST /api/moments
 * Body: { url: string }  -> MomentsResult
 *
 * Thin HTTP adapter: validate input, delegate to the pipeline, and map any
 * AppError to a stable JSON envelope. All domain logic lives in lib/.
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { AppError } from "@/lib/errors";
import { findMoments } from "@/lib/moments/find-moments";

// The model calls make this longer than the default; still within Vercel's
// hobby-tier ceiling. Revisit if we routinely hit it.
export const maxDuration = 60;
export const runtime = "nodejs";

const bodySchema = z.object({
  url: z.string().min(1, "A YouTube URL is required"),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "INVALID_URL", message: "Request body must be JSON" } },
      { status: 400 },
    );
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "INVALID_URL", message: parsed.error.issues[0]?.message } },
      { status: 400 },
    );
  }

  try {
    const result = await findMoments(parsed.data.url);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json(
        { error: { code: err.code, message: err.userMessage } },
        { status: err.status },
      );
    }
    console.error("[/api/moments] unexpected error", err);
    return NextResponse.json(
      { error: { code: "INTERNAL", message: "Something went wrong. Please try again." } },
      { status: 500 },
    );
  }
}
