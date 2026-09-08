/**
 * Orchestrates the timestamps-only pipeline:
 *   video id -> metadata + transcript -> model -> validated, ranked moments.
 *
 * This is the single entry point the API route calls. Later versions add a
 * step after this that enqueues render jobs for the moments the user picks.
 */
import { randomUUID } from "node:crypto";
import { pipelineConfig } from "@/lib/config";
import { errors } from "@/lib/errors";
import { extractVideoId, watchUrlAt } from "@/lib/youtube/parse-url";
import { fetchMetadata } from "@/lib/youtube/metadata";
import {
  chunkTranscript,
  fetchTranscript,
  renderTranscript,
} from "@/lib/youtube/transcript";
import { callWithTool } from "@/lib/ai/anthropic";
import {
  buildUserContent,
  MOMENT_TOOL,
  SYSTEM_PROMPT,
} from "@/lib/moments/prompt";
import {
  modelResponseSchema,
  type ModelMoment,
  type Moment,
  type MomentsResult,
} from "@/lib/moments/schema";

function formatTimestamp(totalSeconds: number): string {
  const s = Math.floor(totalSeconds % 60);
  const m = Math.floor(totalSeconds / 60);
  return `${m}:${`${s}`.padStart(2, "0")}`;
}

/** Clamp, dedupe, sort and cap the raw model output. */
function normaliseMoments(raw: ModelMoment[], videoId: string, maxEnd: number): Moment[] {
  const { minSeconds, maxSeconds } = pipelineConfig.clip;
  const seen = new Set<number>();

  return raw
    .filter((m) => m.end > m.start && m.start >= 0 && m.start < maxEnd)
    .map((m) => {
      const start = Math.max(0, Math.floor(m.start));
      const rawDuration = m.end - m.start;
      const duration = Math.min(maxSeconds, Math.max(minSeconds, Math.round(rawDuration)));
      const end = Math.min(maxEnd, start + duration);
      return { ...m, start, end };
    })
    .filter((m) => {
      const bucket = Math.floor(m.start / 5); // treat clips within 5s as duplicates
      if (seen.has(bucket)) return false;
      seen.add(bucket);
      return true;
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, pipelineConfig.maxMoments)
    .map<Moment>((m) => ({
      ...m,
      id: randomUUID(),
      durationSeconds: m.end - m.start,
      startLabel: formatTimestamp(m.start),
      watchUrl: watchUrlAt(videoId, m.start),
    }));
}

export async function findMoments(youtubeUrl: string): Promise<MomentsResult> {
  const videoId = extractVideoId(youtubeUrl);

  const [metadata, transcript] = await Promise.all([
    fetchMetadata(videoId),
    fetchTranscript(videoId),
  ]);

  const rendered = renderTranscript(transcript);
  const chunks = chunkTranscript(rendered, pipelineConfig.maxTranscriptCharsPerCall);

  const settled = await Promise.all(
    chunks.map(async (chunk, index) => {
      const input = await callWithTool({
        system: SYSTEM_PROMPT,
        userContent: buildUserContent({
          title: metadata.title,
          transcriptChunk: chunk,
          chunkIndex: index,
          chunkCount: chunks.length,
        }),
        tool: MOMENT_TOOL,
      });
      const parsed = modelResponseSchema.safeParse(input);
      if (!parsed.success) throw errors.modelError(parsed.error.message);
      return parsed.data.moments;
    }),
  );

  const moments = normaliseMoments(
    settled.flat(),
    videoId,
    transcript.durationSeconds,
  );

  return {
    video: {
      videoId,
      title: metadata.title,
      author: metadata.author,
      thumbnailUrl: metadata.thumbnailUrl,
    },
    moments,
  };
}
