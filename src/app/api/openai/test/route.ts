import OpenAI from 'openai';
import { NextResponse } from 'next/server';

// Use the API key directly for testing
const openai = new OpenAI({
  apiKey: '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'
});

export async function GET() {
  try {
    // Simple test to check if the API key works
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using a simpler model for testing
      messages: [
        {
          role: "system",
          content: "answer only in hebrew. You are a helpful assistant."
        },
        {
          role: "user",
          content: "Say hello world"
        }
      ]
    });

    return NextResponse.json({
      success: true,
      message: completion.choices[0].message.content,
      model: completion.model
    });
  } catch (error: any) {
    console.error('OpenAI API Error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error
    }, { status: 500 });
  }
} 