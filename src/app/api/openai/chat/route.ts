import { openai } from "@ai-sdk/openai";
import { convertToCoreMessages, streamText } from "ai";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'מפתח ה-API של OpenAI לא מוגדר' },
        { status: 500 }
      );
    }
    
    const { messages } = await req.json();
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'מערך ההודעות אינו תקין או ריק' },
        { status: 400 }
      );
    }
    
    // Find the system message if it exists
    const systemMessage = messages.find((msg: any) => msg.role === 'system');
    
    // Default system message if none is provided - enforcing Hebrew responses
    const defaultSystemMessage = "אתה עוזר מועיל שמספק עצות אימון. עליך לענות תמיד בעברית בלבד. אם אינך יודע את התשובה, אמור זאת בפשטות בעברית.";
    
    // Log for debugging
    console.log("Processing chat request with messages:", 
      messages.map((m: any) => ({ role: m.role, content: m.content?.substring(0, 50) + '...' }))
    );
    
    try {
      const result = await streamText({
        model: openai("gpt-4o-mini"),
        messages: convertToCoreMessages(messages),
        system: systemMessage?.content || defaultSystemMessage,
        temperature: 0.7,
        maxTokens: 1000,
      });
  
      return result.toDataStreamResponse();
    } catch (streamError) {
      console.error("OpenAI Streaming Error:", streamError);
      return NextResponse.json(
        { error: "אירעה שגיאה ביצירת התוכן. נא לנסות שוב מאוחר יותר.", details: streamError instanceof Error ? streamError.message : String(streamError) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return NextResponse.json(
      { error: "אירעה שגיאה בעיבוד הבקשה", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
