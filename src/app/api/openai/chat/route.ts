import { openai } from "@ai-sdk/openai";
import { convertToCoreMessages, streamText } from "ai";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }
    
    const { messages } = await req.json();
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or empty messages array' },
        { status: 400 }
      );
    }
    
    // Find the system message if it exists
    const systemMessage = messages.find((msg: any) => msg.role === 'system');
    
    // Default system message if none is provided
    const defaultSystemMessage = "You are a helpful AI assistant that provides workout advice. Answer in Hebrew.";
    
    // Log for debugging
    console.log("Processing chat request with messages:", 
      messages.map((m: any) => ({ role: m.role, content: m.content?.substring(0, 50) + '...' }))
    );
    
    const result = await streamText({
      model: openai("gpt-4o"),
      messages: convertToCoreMessages(messages),
      system: systemMessage?.content || defaultSystemMessage,
      temperature: 0.7,
      maxTokens: 1000,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return NextResponse.json(
      { error: "Error processing request", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
