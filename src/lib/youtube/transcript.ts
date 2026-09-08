/**
 * Fetches a video's caption track and reshapes it into fixed-length windows
 * with human-readable timestamps, which is the format the moment-detection
 * prompt expects.
 *
 * v1 relies on the `youtube-transcript` package (no video download, just the
 * caption track YouTube already serves). If YouTube changes their internals and
 * this becomes flaky, the swap target is a Whisper transcription worker — see
 * docs/ARCHITECTURE.md.
 */
import { YoutubeTranscript } from "youtube-transcript";
import { errors } from "@/lib/errors";
import { pipelineConfig } from "@/lib/config";

export interface TranscriptWindow {
  /** Window start, seconds from video start. */
  start: number;
  /** Window end, seconds from video start. */
  end: number;
  /** Concatenated caption text within the window. */
  text: string;
}

export interface Transcript {
  windows: TranscriptWindow[];
  /** Total spoken duration covered by captions, seconds. */
  durationSeconds: number;
}

function formatTimestamp(totalSeconds: number): string {
  const s = Math.floor(totalSeconds % 60);
  const m = Math.floor((totalSeconds / 60) % 60);
  const h = Math.floor(totalSeconds / 3600);
  const mm = `${m}`.padStart(2, "0");
  const ss = `${s}`.padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export async function fetchTranscript(videoId: string): Promise<Transcript> {
  let raw: Awaited<ReturnType<typeof YoutubeTranscript.fetchTranscript>>;
  try {
    raw = await YoutubeTranscript.fetchTranscript(videoId);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (/disabled|not available|Could not find/i.test(message)) throw errors.noTranscript();
    if (/unavailable|private/i.test(message)) throw errors.videoUnavailable();
    throw errors.noTranscript();
  }

  if (!raw.length) throw errors.noTranscript();

  const windowSize = pipelineConfig.transcriptWindowSeconds;
  const windows: TranscriptWindow[] = [];
  let cursor: TranscriptWindow | null = null;

  for (const entry of raw) {
    const start = entry.offset / 1000;
    const end = start + entry.duration / 1000;
    const text = decodeEntities(entry.text).replace(/\s+/g, " ").trim();
    if (!text) continue;

    if (!cursor || start - cursor.start >= windowSize) {
      cursor = { start, end, text };
      windows.push(cursor);
    } else {
      cursor.end = end;
      cursor.text += ` ${text}`;
    }
  }

  const durationSeconds = windows.length ? windows[windows.length - 1].end : 0;
  if (durationSeconds < pipelineConfig.clip.minSeconds * 2) {
    throw errors.transcriptTooShort();
  }

  return { windows, durationSeconds };
}

/** Renders the transcript as `[mm:ss] text` lines for the prompt. */
export function renderTranscript(transcript: Transcript): string {
  return transcript.windows
    .map((w) => `[${formatTimestamp(w.start)}] ${w.text}`)
    .join("\n");
}

/** Splits rendered transcript lines into chunks under the model char budget. */
export function chunkTranscript(rendered: string, maxChars: number): string[] {
  const lines = rendered.split("\n");
  const chunks: string[] = [];
  let current = "";
  for (const line of lines) {
    if (current.length + line.length + 1 > maxChars && current) {
      chunks.push(current);
      current = "";
    }
    current += (current ? "\n" : "") + line;
  }
  if (current) chunks.push(current);
  return chunks;
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;#39;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}
