import { describe, expect, it } from "vitest";
import { extractVideoId, watchUrlAt } from "@/lib/youtube/parse-url";
import { AppError } from "@/lib/errors";

const ID = "dQw4w9WgXcQ";

describe("extractVideoId", () => {
  it.each([
    ["bare id", ID],
    ["watch url", `https://www.youtube.com/watch?v=${ID}`],
    ["watch url without www", `https://youtube.com/watch?v=${ID}`],
    ["watch url with extra params", `https://www.youtube.com/watch?v=${ID}&t=42s&list=abc`],
    ["short link", `https://youtu.be/${ID}`],
    ["short link with query", `https://youtu.be/${ID}?si=xyz`],
    ["shorts", `https://www.youtube.com/shorts/${ID}`],
    ["embed", `https://www.youtube.com/embed/${ID}`],
    ["live", `https://www.youtube.com/live/${ID}`],
    ["mobile", `https://m.youtube.com/watch?v=${ID}`],
    ["music", `https://music.youtube.com/watch?v=${ID}`],
    ["untrimmed", `  https://youtu.be/${ID}  `],
  ])("parses %s", (_label, input) => {
    expect(extractVideoId(input)).toBe(ID);
  });

  it.each([
    ["empty", ""],
    ["not a url", "hello world"],
    ["wrong host", "https://vimeo.com/123456"],
    ["playlist only", "https://www.youtube.com/playlist?list=abc"],
    ["channel", "https://www.youtube.com/@somechannel"],
    ["too short id", "https://youtu.be/abc"],
  ])("rejects %s", (_label, input) => {
    expect(() => extractVideoId(input)).toThrow(AppError);
  });
});

describe("watchUrlAt", () => {
  it("builds a timestamped deep link with an integer second", () => {
    expect(watchUrlAt(ID, 92.7)).toBe(`https://www.youtube.com/watch?v=${ID}&t=92s`);
  });
});
