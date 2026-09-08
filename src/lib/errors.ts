/**
 * Typed application errors.
 *
 * Each error carries a stable `code` (for the client to branch on) and an
 * HTTP `status`. The API layer converts any thrown `AppError` into a
 * consistent JSON envelope; anything else becomes a generic 500.
 */

export type AppErrorCode =
  | "INVALID_URL"
  | "NO_TRANSCRIPT"
  | "VIDEO_UNAVAILABLE"
  | "TRANSCRIPT_TOO_SHORT"
  | "MODEL_ERROR"
  | "INTERNAL";

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly status: number;
  /** Optional safe-to-display detail for the end user. */
  readonly userMessage: string;

  constructor(
    code: AppErrorCode,
    status: number,
    message: string,
    userMessage?: string,
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
    this.userMessage = userMessage ?? message;
  }
}

export const errors = {
  invalidUrl: () =>
    new AppError(
      "INVALID_URL",
      400,
      "Could not extract a YouTube video id from the provided URL",
      "That doesn't look like a valid YouTube video link.",
    ),
  noTranscript: () =>
    new AppError(
      "NO_TRANSCRIPT",
      422,
      "Video has no accessible caption track",
      "This video has captions disabled, so we can't analyse it yet.",
    ),
  videoUnavailable: () =>
    new AppError(
      "VIDEO_UNAVAILABLE",
      404,
      "Video is private, deleted, or region-locked",
      "This video is private or unavailable.",
    ),
  transcriptTooShort: () =>
    new AppError(
      "TRANSCRIPT_TOO_SHORT",
      422,
      "Transcript is too short to contain meaningful moments",
      "This video is too short to pull clips from.",
    ),
  modelError: (detail: string) =>
    new AppError(
      "MODEL_ERROR",
      502,
      `Model call failed: ${detail}`,
      "The analysis service had a hiccup. Please try again.",
    ),
} as const;
