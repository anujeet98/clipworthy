import { describe, expect, it } from "vitest";
import { chunkTranscript, renderTranscript, type Transcript } from "@/lib/youtube/transcript";

describe("renderTranscript", () => {
  it("renders windows as [mm:ss] lines", () => {
    const transcript: Transcript = {
      durationSeconds: 130,
      windows: [
        { start: 0, end: 45, text: "intro talk" },
        { start: 72, end: 130, text: "the punchline lands here" },
      ],
    };
    expect(renderTranscript(transcript)).toBe(
      "[00:00] intro talk\n[01:12] the punchline lands here",
    );
  });

  it("switches to h:mm:ss past an hour", () => {
    const transcript: Transcript = {
      durationSeconds: 3700,
      windows: [{ start: 3661, end: 3700, text: "late" }],
    };
    expect(renderTranscript(transcript)).toBe("[1:01:01] late");
  });
});

describe("chunkTranscript", () => {
  it("keeps a small transcript in one chunk", () => {
    const rendered = "[00:00] a\n[00:45] b\n[01:30] c";
    expect(chunkTranscript(rendered, 1000)).toEqual([rendered]);
  });

  it("splits on line boundaries when over budget", () => {
    const lines = Array.from({ length: 10 }, (_, i) => `[00:${i}0] line ${i}`);
    const chunks = chunkTranscript(lines.join("\n"), 40);
    expect(chunks.length).toBeGreaterThan(1);
    // every original line survives exactly once, no line is broken mid-way
    expect(chunks.join("\n").split("\n")).toEqual(lines);
  });
});
