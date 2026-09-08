/**
 * Extracts an 11-character YouTube video id from any of the URL shapes a user
 * is likely to paste: watch links, short links, Shorts, embeds, live, and a
 * bare id.
 */
import { errors } from "@/lib/errors";

const VIDEO_ID_RE = /^[a-zA-Z0-9_-]{11}$/;

/** Returns the canonical video id or throws `AppError("INVALID_URL")`. */
export function extractVideoId(input: string): string {
  const value = input.trim();

  if (VIDEO_ID_RE.test(value)) return value;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw errors.invalidUrl();
  }

  const host = url.hostname.replace(/^www\./, "");

  // youtu.be/<id>
  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    if (VIDEO_ID_RE.test(id)) return id;
  }

  if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
    // watch?v=<id>
    const v = url.searchParams.get("v");
    if (v && VIDEO_ID_RE.test(v)) return v;

    // /shorts/<id>, /embed/<id>, /live/<id>, /v/<id>
    const segments = url.pathname.split("/").filter(Boolean);
    if (segments.length === 2 && ["shorts", "embed", "live", "v"].includes(segments[0])) {
      if (VIDEO_ID_RE.test(segments[1])) return segments[1];
    }
  }

  throw errors.invalidUrl();
}

/** Builds a deep link that opens the video at a given second. */
export function watchUrlAt(videoId: string, startSeconds: number): string {
  return `https://www.youtube.com/watch?v=${videoId}&t=${Math.floor(startSeconds)}s`;
}
