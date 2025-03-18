import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
  try {
    const { apiKey } = await req.json();
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }
    
    // Validate API key format
    if (!(apiKey.startsWith('sk-') || apiKey.startsWith('sk-proj-')) || apiKey.length < 20) {
      return NextResponse.json(
        { error: 'Invalid API key format. API keys should start with "sk-" or "sk-proj-" and be at least 20 characters long.' },
        { status: 400 }
      );
    }
    
    // Test the API key
    try {
      const openai = new OpenAI({
        apiKey: apiKey,
      });
      
      // Use a simple models list request to verify the key
      const models = await openai.models.list();
      
      return NextResponse.json({
        success: true,
        message: 'API key is valid',
        keyPrefix: apiKey.substring(0, 5) + '...',
        keyLength: apiKey.length,
        modelsAvailable: models.data.length,
        models: models.data.slice(0, 5).map(model => model.id) // Return first 5 models for verification
      });
    } catch (apiError: any) {
      // Check for authentication errors
      if (apiError.status === 401 || 
          (apiError.message && apiError.message.includes('API key')) ||
          (apiError.error && apiError.error.message && apiError.error.message.includes('API key'))) {
        return NextResponse.json(
          { 
            success: false,
            error: 'API key authentication failed',
            details: apiError.message || (apiError.error && apiError.error.message) || 'The provided API key was rejected by OpenAI.',
            keyPrefix: apiKey.substring(0, 5) + '...',
            keyLength: apiKey.length
          },
          { status: 401 }
        );
      }
      
      // Other API errors
      return NextResponse.json(
        { 
          success: false,
          error: 'OpenAI API error',
          details: apiError.message || 'An error occurred while communicating with the OpenAI API.',
          keyPrefix: apiKey.substring(0, 5) + '...',
          keyLength: apiKey.length
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Unexpected error',
        details: error.message || 'An unexpected error occurred while testing the API key.'
      },
      { status: 500 }
    );
  }
} 