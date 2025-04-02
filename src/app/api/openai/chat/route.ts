import { openai } from "@ai-sdk/openai";
import { StreamingTextResponse } from "ai";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const model = openai("gpt-4-turbo-preview");
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
    console.error("Error in OpenAI chat:", error);
    return new Response("Error processing your request", { status: 500 });
  }
}
