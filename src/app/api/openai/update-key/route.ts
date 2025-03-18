import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// This is a simplified version for development purposes
// In a production environment, you would want to add proper authentication
export async function POST(req: Request) {
  try {
    // In a real application, you would check if the user is authenticated and is an admin
    // For now, we'll use a simple API key for protection
    const authHeader = req.headers.get('authorization');
    const expectedApiKey = process.env.ADMIN_API_KEY || 'admin-secret-key';
    
    if (!authHeader || authHeader !== `Bearer ${expectedApiKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin API key required.' },
        { status: 401 }
      );
    }
    
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
    
    // In a production environment, you would want to store this in a secure way
    // This is a simplified example for development purposes
    try {
      // Read the current .env.local file
      const envPath = path.join(process.cwd(), '.env.local');
      let envContent = '';
      
      try {
        envContent = fs.readFileSync(envPath, 'utf8');
      } catch (err) {
        // File doesn't exist, create it
        envContent = '';
      }
      
      // Update or add the OPENAI_API_KEY
      const lines = envContent.split('\n');
      let keyFound = false;
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('OPENAI_API_KEY=')) {
          lines[i] = `OPENAI_API_KEY=${apiKey}`;
          keyFound = true;
          break;
        }
      }
      
      if (!keyFound) {
        lines.push(`OPENAI_API_KEY=${apiKey}`);
      }
      
      // Write the updated content back to the file
      fs.writeFileSync(envPath, lines.join('\n'));
      
      // Note: In a production environment, you would need to restart the server
      // or use a different approach to update environment variables at runtime
      process.env.OPENAI_API_KEY = apiKey;
      
      return NextResponse.json({
        success: true,
        message: 'API key updated successfully',
        keyPrefix: apiKey.substring(0, 5) + '...',
        keyLength: apiKey.length
      });
    } catch (fsError: any) {
      console.error('Error updating API key file:', fsError);
      return NextResponse.json(
        { error: 'Failed to update API key file', details: fsError.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error updating API key:', error);
    return NextResponse.json(
      { error: 'Failed to update API key', details: error.message },
      { status: 500 }
    );
  }
} 