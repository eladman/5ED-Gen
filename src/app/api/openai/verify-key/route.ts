import OpenAI from 'openai';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        status: 'missing',
        message: 'OpenAI API key is not configured',
        details: 'The OPENAI_API_KEY environment variable is missing. Please add it to your .env file or environment variables.'
      });
    }
    
    // Basic format validation
    if (!(process.env.OPENAI_API_KEY.startsWith('sk-') || process.env.OPENAI_API_KEY.startsWith('sk-proj-')) || 
        process.env.OPENAI_API_KEY.length < 20) {
      return NextResponse.json({
        status: 'invalid_format',
        message: 'Invalid API key format',
        details: 'The API key should start with "sk-" or "sk-proj-" and be at least 20 characters long.',
        keyPrefix: process.env.OPENAI_API_KEY.substring(0, 5) + '...',
        keyLength: process.env.OPENAI_API_KEY.length
      });
    }
    
    // For build purposes, use a placeholder API key if the environment variable is missing
    const apiKey = process.env.OPENAI_API_KEY || 'sk-placeholder-for-build-purposes-only';
    
    // Test the API key with a simple request
    try {
      const openai = new OpenAI({
        apiKey: apiKey,
      });
      
      // Use a simple models list request to verify the key
      const models = await openai.models.list();
      
      return NextResponse.json({
        status: 'valid',
        message: 'API key is valid',
        details: 'The API key was successfully verified with OpenAI.',
        keyPrefix: process.env.OPENAI_API_KEY.substring(0, 5) + '...',
        keyLength: process.env.OPENAI_API_KEY.length,
        modelsAvailable: models.data.length
      });
    } catch (apiError: any) {
      // Check for authentication errors
      if (apiError.status === 401 || 
          (apiError.message && apiError.message.includes('API key')) ||
          (apiError.error && apiError.error.message && apiError.error.message.includes('API key'))) {
        return NextResponse.json({
          status: 'authentication_failed',
          message: 'API key authentication failed',
          details: apiError.message || (apiError.error && apiError.error.message) || 'The provided API key was rejected by OpenAI.',
          keyPrefix: process.env.OPENAI_API_KEY.substring(0, 5) + '...',
          keyLength: process.env.OPENAI_API_KEY.length
        });
      }
      
      // Other API errors
      return NextResponse.json({
        status: 'api_error',
        message: 'OpenAI API error',
        details: apiError.message || 'An error occurred while communicating with the OpenAI API.',
        keyPrefix: process.env.OPENAI_API_KEY.substring(0, 5) + '...',
        keyLength: process.env.OPENAI_API_KEY.length
      });
    }
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: 'Unexpected error',
      details: error.message || 'An unexpected error occurred while verifying the API key.'
    });
  }
} 