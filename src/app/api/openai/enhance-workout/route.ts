import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }
    
    const { workout } = await req.json();
    
    const prompt = `Enhance the following workout with additional details:
    - Workout: ${JSON.stringify(workout)}
    
    Please provide the following enhancements:
    1. A specific workout goal that explains the purpose and benefits of this workout
    2. Recommended resting time between exercises (for each exercise)
    3. Easy, medium, and hard variations for each exercise (to allow users to adjust difficulty)
    
    Format the response as a JSON object with the following structure:
    {
      "workoutGoal": "string describing the purpose and benefits of this workout",
      "enhancedExercises": [
        {
          "name": "original exercise name",
          "restingTime": "string (e.g., '30 seconds', '1 minute')",
          "variations": {
            "easy": "description of easier variation",
            "medium": "description of medium variation",
            "hard": "description of harder variation"
          }
        }
      ]
    }`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "answer only in hebrew. You are a professional fitness trainer specializing in creating detailed workout programs. Provide specific, actionable advice for workout enhancements. Respond only with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      return NextResponse.json(
        { error: 'No content received from OpenAI' },
        { status: 500 }
      );
    }

    const enhancedWorkout = JSON.parse(content);
    return NextResponse.json(enhancedWorkout);
    
  } catch (error: any) {
    console.error('Error enhancing workout details:', error);
    return NextResponse.json(
      { 
        error: 'Failed to enhance workout details',
        message: error.message 
      },
      { status: 500 }
    );
  }
} 