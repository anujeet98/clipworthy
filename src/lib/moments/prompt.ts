/**
 * Prompt assets for moment detection. Kept separate from orchestration so the
 * wording can be iterated (and eventually A/B tested) without touching logic.
 */
import type Anthropic from "@anthropic-ai/sdk";
import { MOMENT_CATEGORIES } from "@/lib/moments/schema";
import { pipelineConfig } from "@/lib/config";

export const SYSTEM_PROMPT = `You are a senior short-form video producer who has packaged thousands of \
YouTube long-forms into viral Shorts, Reels, and TikToks.

You are given a timestamped transcript of one video. Identify the segments most \
likely to perform as standalone vertical shorts.

A strong moment:
- is self-contained and makes sense without the surrounding context
- has a clear hook in the first few seconds
- is funny, insightful, controversial, emotional, surprising, or intensely quotable
- runs between ${pipelineConfig.clip.minSeconds} and ${pipelineConfig.clip.maxSeconds} seconds

Avoid: filler, ads/sponsor reads, rambling setup with no payoff, and moments that \
only land if you watched the whole video.

Use only timestamps that appear in the transcript. "start" and "end" are seconds \
from the beginning of the video. Order by "score" descending. Return at most \
${pipelineConfig.maxMoments} moments; fewer is fine if the video is thin.`;

export const MOMENT_TOOL: Anthropic.Tool = {
  name: "report_moments",
  description: "Report the viral-moment candidates found in the transcript.",
  input_schema: {
    type: "object",
    properties: {
      moments: {
        type: "array",
        items: {
          type: "object",
          properties: {
            start: { type: "number", description: "Clip start, seconds from video start" },
            end: { type: "number", description: "Clip end, seconds from video start" },
            hook: {
              type: "string",
              description: "One scroll-stopping line describing the payoff (max 160 chars)",
            },
            score: { type: "number", description: "0-100 confidence it performs as a short" },
            category: { type: "string", enum: [...MOMENT_CATEGORIES] },
          },
          required: ["start", "end", "hook", "score", "category"],
        },
      },
    },
    required: ["moments"],
  },
};

export function buildUserContent(params: {
  title: string;
  transcriptChunk: string;
  chunkIndex: number;
  chunkCount: number;
}): string {
  const { title, transcriptChunk, chunkIndex, chunkCount } = params;
  const part =
    chunkCount > 1 ? `\n(This is part ${chunkIndex + 1} of ${chunkCount} of the transcript.)` : "";
  return `Video title: ${title}${part}\n\nTranscript:\n${transcriptChunk}`;
}
