import OpenAI from 'openai';
import { NextResponse } from 'next/server';

// Use environment variable for API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET() {
  try {
    // Check if API key is available and valid
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'OpenAI API key is not configured',
        details: 'The OPENAI_API_KEY environment variable is missing. Please add it to your .env file or environment variables.'
      }, { status: 500 });
    }
    
    // Validate API key format (basic check)
    // Support both standard API keys (sk-...) and project-based API keys (sk-proj-...)
    if (!(process.env.OPENAI_API_KEY.startsWith('sk-') || process.env.OPENAI_API_KEY.startsWith('sk-proj-')) || 
        process.env.OPENAI_API_KEY.length < 20) {
      console.error('OpenAI API key appears to be invalid');
      return NextResponse.json({
        success: false,
        error: 'Invalid OpenAI API key format',
        details: 'The API key should start with "sk-" or "sk-proj-" and be at least 20 characters long. Current key format is invalid.',
        keyPrefix: process.env.OPENAI_API_KEY.substring(0, 5) + '...',
        keyLength: process.env.OPENAI_API_KEY.length
      }, { status: 500 });
    }
    
    // Simple test to check if the API key works
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // Using GPT-4o for testing
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
        model: completion.model,
        apiKeyStatus: 'valid',
        apiKeyPrefix: process.env.OPENAI_API_KEY.substring(0, 5) + '...',
        apiKeyLength: process.env.OPENAI_API_KEY.length
      });
    } catch (apiError: any) {
      console.error('OpenAI API Error:', apiError);
      
      // Check for specific API key errors
      if (apiError.status === 401 || 
          (apiError.message && apiError.message.includes('API key')) ||
          (apiError.error && apiError.error.message && apiError.error.message.includes('API key'))) {
        return NextResponse.json({
          success: false,
          error: 'Invalid API key',
          details: apiError.message || (apiError.error && apiError.error.message) || 'The provided API key was rejected by OpenAI.',
          apiKeyPrefix: process.env.OPENAI_API_KEY.substring(0, 5) + '...',
          apiKeyLength: process.env.OPENAI_API_KEY.length,
          fullError: process.env.NODE_ENV === 'development' ? apiError : undefined
        }, { status: 401 });
      }
      
      return NextResponse.json({
        success: false,
        error: apiError.message || 'Unknown OpenAI API error',
        details: apiError.error || 'An error occurred while communicating with the OpenAI API.',
        apiKeyStatus: 'unknown',
        apiKeyPrefix: process.env.OPENAI_API_KEY.substring(0, 5) + '...',
        apiKeyLength: process.env.OPENAI_API_KEY.length,
        fullError: process.env.NODE_ENV === 'development' ? apiError : undefined
      }, { status: apiError.status || 500 });
    }
  } catch (error: any) {
    console.error('General Error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
      details: 'An unexpected error occurred while testing the OpenAI API key.',
      fullError: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
} 