/**
 * Shared types and validation for the moment-detection domain.
 * These schemas are the contract between the model, the API, and the UI.
 */
import { z } from "zod";

export const MOMENT_CATEGORIES = [
  "funny",
  "insightful",
  "controversial",
  "emotional",
  "quotable",
  "surprising",
] as const;

export type MomentCategory = (typeof MOMENT_CATEGORIES)[number];

/** A single candidate clip as produced by the model (raw, pre-validation). */
export const modelMomentSchema = z.object({
  start: z.number().nonnegative(),
  end: z.number().positive(),
  /** One-line, scroll-stopping description of why this is share-worthy. */
  hook: z.string().min(3).max(160),
  /** 0-100 confidence that this would perform as a short. */
  score: z.number().min(0).max(100),
  category: z.enum(MOMENT_CATEGORIES),
});

export type ModelMoment = z.infer<typeof modelMomentSchema>;

export const modelResponseSchema = z.object({
  moments: z.array(modelMomentSchema),
});

/** A validated, client-facing moment with derived display fields. */
export interface Moment extends ModelMoment {
  id: string;
  durationSeconds: number;
  /** `mm:ss` label for the clip start. */
  startLabel: string;
  /** Deep link that opens the source video at `start`. */
  watchUrl: string;
}

/** The full payload returned by `POST /api/moments`. */
export interface MomentsResult {
  video: {
    videoId: string;
    title: string;
    author: string;
    thumbnailUrl: string;
  };
  moments: Moment[];
}
