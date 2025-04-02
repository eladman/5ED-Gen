import { anthropic } from "@ai-sdk/anthropic";
import { StreamingTextResponse } from "ai";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const model = anthropic("claude-3-sonnet-20240229");
    const { stream } = await model.doStream({
      inputFormat: "prompt",
      mode: {
        type: "regular"
      },
      prompt: messages.map((msg: any) => msg.content).join("\n"),
      temperature: 0.7,
      maxTokens: 1000,
    });

    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error("Error in Anthropic chat:", error);
    return new Response("Error processing your request", { status: 500 });
  }
}
