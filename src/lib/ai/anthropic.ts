/**
 * Anthropic client singleton plus a typed helper for extracting a single
 * tool-use call from a response. Centralising this keeps model/version choices
 * and error mapping in one place.
 */
import Anthropic from "@anthropic-ai/sdk";
import { serverEnv } from "@/lib/config";
import { errors } from "@/lib/errors";

let client: Anthropic | null = null;

export function anthropic(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: serverEnv.ANTHROPIC_API_KEY });
  }
  return client;
}

export const MODEL = serverEnv.ANTHROPIC_MODEL;

/**
 * Runs a single-tool "structured output" call and returns the tool input,
 * retrying once on transient failure. The caller validates the shape.
 */
export async function callWithTool(params: {
  system: string;
  userContent: string;
  tool: Anthropic.Tool;
  maxTokens?: number;
}): Promise<unknown> {
  const { system, userContent, tool, maxTokens = 4096 } = params;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await anthropic().messages.create({
        model: MODEL,
        max_tokens: maxTokens,
        system,
        tools: [tool],
        tool_choice: { type: "tool", name: tool.name },
        messages: [{ role: "user", content: userContent }],
      });

      const block = res.content.find((b) => b.type === "tool_use");
      if (block && block.type === "tool_use") return block.input;

      if (attempt === 1) throw errors.modelError("no tool_use block in response");
    } catch (err) {
      if (attempt === 1) {
        const detail = err instanceof Error ? err.message : String(err);
        throw errors.modelError(detail);
      }
    }
  }
  throw errors.modelError("exhausted retries");
}
