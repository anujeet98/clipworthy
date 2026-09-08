import { describe, expect, it } from "vitest";
import { normaliseMoments } from "@/lib/moments/find-moments";
import type { ModelMoment } from "@/lib/moments/schema";

const VIDEO = "dQw4w9WgXcQ";

function moment(over: Partial<ModelMoment>): ModelMoment {
  return { start: 10, end: 40, hook: "a hook", score: 50, category: "funny", ...over };
}

describe("normaliseMoments", () => {
  it("sorts by score descending and adds display fields", () => {
    const out = normaliseMoments(
      [moment({ start: 10, end: 40, score: 30 }), moment({ start: 100, end: 130, score: 90 })],
      VIDEO,
      600,
    );
    expect(out.map((m) => m.score)).toEqual([90, 30]);
    expect(out[0].startLabel).toBe("1:40");
    expect(out[0].watchUrl).toBe(`https://www.youtube.com/watch?v=${VIDEO}&t=100s`);
    expect(out[0].id).toMatch(/[0-9a-f-]{36}/);
  });

  it("clamps clip duration to the configured bounds", () => {
    const [tooLong] = normaliseMoments([moment({ start: 0, end: 9999 })], VIDEO, 100000);
    expect(tooLong.durationSeconds).toBe(90);

    const [tooShort] = normaliseMoments([moment({ start: 0, end: 2 })], VIDEO, 100000);
    expect(tooShort.durationSeconds).toBe(8);
  });

  it("never lets a clip end past the video duration", () => {
    const [m] = normaliseMoments([moment({ start: 580, end: 620 })], VIDEO, 600);
    expect(m.end).toBeLessThanOrEqual(600);
  });

  it("drops moments starting at or beyond the video duration", () => {
    const out = normaliseMoments([moment({ start: 700, end: 730 })], VIDEO, 600);
    expect(out).toHaveLength(0);
  });

  it("drops zero/negative-length and out-of-range moments", () => {
    const out = normaliseMoments(
      [moment({ start: 50, end: 50 }), moment({ start: -5, end: 20 })],
      VIDEO,
      600,
    );
    expect(out).toHaveLength(0);
  });

  it("dedupes moments that start within 5 seconds of each other", () => {
    const out = normaliseMoments(
      [moment({ start: 30, score: 80 }), moment({ start: 32, score: 60 })],
      VIDEO,
      600,
    );
    expect(out).toHaveLength(1);
    expect(out[0].score).toBe(80);
  });

  it("caps the result at the configured maximum", () => {
    const many = Array.from({ length: 30 }, (_, i) =>
      moment({ start: i * 20, score: i }),
    );
    expect(normaliseMoments(many, VIDEO, 100000).length).toBeLessThanOrEqual(12);
  });
});
