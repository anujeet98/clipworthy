/**
 * Fetches lightweight video metadata via YouTube's public oEmbed endpoint.
 * No API key, no quota. Used only for display (title, channel, thumbnail).
 */
import { errors } from "@/lib/errors";

export interface VideoMetadata {
  videoId: string;
  title: string;
  author: string;
  /** Highest-quality static thumbnail that is guaranteed to exist. */
  thumbnailUrl: string;
}

export async function fetchMetadata(videoId: string): Promise<VideoMetadata> {
  const oembed = `https://www.youtube.com/oembed?format=json&url=https://www.youtube.com/watch?v=${videoId}`;
  const res = await fetch(oembed, { next: { revalidate: 3600 } });

  if (res.status === 401 || res.status === 403 || res.status === 404) {
    throw errors.videoUnavailable();
  }
  if (!res.ok) {
    // Metadata is non-critical; fall back to a bare record.
    return {
      videoId,
      title: "Untitled video",
      author: "Unknown channel",
      thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    };
  }

  const data = (await res.json()) as { title?: string; author_name?: string };
  return {
    videoId,
    title: data.title ?? "Untitled video",
    author: data.author_name ?? "Unknown channel",
    thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
  };
}
