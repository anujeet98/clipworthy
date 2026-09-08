/**
 * Centralised runtime configuration.
 *
 * Every environment-dependent value is read here exactly once and validated at
 * module load, so the rest of the codebase can import strongly-typed constants
 * without touching `process.env` or repeating validation logic.
 */
import { z } from "zod";

const serverEnvSchema = z.object({
  /** Anthropic API key — the only secret required for v1 (timestamps-only). */
  ANTHROPIC_API_KEY: z.string().min(1, "ANTHROPIC_API_KEY is required"),
  /** Claude model id used for moment detection. Overridable per deploy. */
  ANTHROPIC_MODEL: z.string().default("claude-sonnet-5"),
});

/**
 * Parsed server-side environment. Accessing this on the client will throw,
 * which is intentional — secrets must never reach the browser bundle.
 */
export const serverEnv = (() => {
  // Skip validation during `next build`'s static analysis phase where env vars
  // may be intentionally absent; routes validate again at request time.
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return {
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ?? "",
      ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5",
    };
  }
  return serverEnvSchema.parse({
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL,
  });
})();

/** Tunable, non-secret constants for the moment-detection pipeline. */
export const pipelineConfig = {
  /** Target size (seconds) of each transcript window shown to the model. */
  transcriptWindowSeconds: 45,
  /** Max characters of transcript sent in a single model call before chunking. */
  maxTranscriptCharsPerCall: 24_000,
  /** Maximum number of moments returned to the client. */
  maxMoments: 12,
  /** Clamp for an individual clip's duration (seconds). */
  clip: { minSeconds: 8, maxSeconds: 90 },
} as const;
