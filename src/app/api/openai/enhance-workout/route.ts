import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Default enhancement templates for fallback
const defaultEnhancements = {
  aerobic: {
    workoutGoal: "שיפור סיבולת לב-ריאה, חיזוק מערכת הנשימה והגברת יעילות הלב",
    enhancedExercises: [
      {
        name: "חימום",
        restingTime: "אין צורך במנוחה",
        variations: {
          easy: "הליכה קלה במקום",
          medium: "ריצה קלה במקום",
          hard: "קפיצות במקום"
        }
      },
      {
        name: "ריצה",
        restingTime: "1-2 דקות בין סטים",
        variations: {
          easy: "הליכה מהירה או ריצה קלה",
          medium: "ריצה בקצב בינוני",
          hard: "ריצה מהירה או אינטרוולים"
        }
      },
      {
        name: "שחרור",
        restingTime: "אין צורך במנוחה",
        variations: {
          easy: "מתיחות קלות",
          medium: "מתיחות בינוניות",
          hard: "מתיחות עמוקות"
        }
      }
    ]
  },
  strength: {
    workoutGoal: "חיזוק והגדלת מסת השריר, שיפור כוח וסיבולת שרירית",
    enhancedExercises: [
      {
        name: "סקוואט",
        restingTime: "60-90 שניות",
        variations: {
          easy: "סקוואט חלקי עם משקל גוף",
          medium: "סקוואט מלא עם משקל גוף",
          hard: "סקוואט קפיצה"
        }
      },
      {
        name: "שכיבות שמיכה",
        restingTime: "60-90 שניות",
        variations: {
          easy: "שכיבות שמיכה על הברכיים",
          medium: "שכיבות שמיכה רגילות",
          hard: "שכיבות שמיכה עם מחיאת כף"
        }
      },
      {
        name: "מתח",
        restingTime: "60-90 שניות",
        variations: {
          easy: "מתח בעזרת רגליים על הרצפה",
          medium: "מתח מלא",
          hard: "מתח עם משקל נוסף"
        }
      }
    ]
  }
};

export async function POST(req: Request) {
  try {
    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is missing');
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }
    
    console.log('Received workout enhancement request');
    
    // Parse request body with error handling
    let workout;
    try {
      const body = await req.json();
      workout = body.workout;
      console.log('Workout to enhance:', workout);
    } catch (parseError: any) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request format', details: parseError.message },
        { status: 400 }
      );
    }
    
    // Validate workout
    if (!workout) {
      console.error('Missing workout in request');
      return NextResponse.json(
        { error: 'Missing workout in request' },
        { status: 400 }
      );
    }

    // Use fallback enhancements if in production and we're having issues
    if (process.env.NODE_ENV === 'production' && process.env.USE_FALLBACK_WORKOUTS === 'true') {
      console.log('Using fallback enhancements due to configuration');
      const workoutType = workout.type || 'aerobic';
      return NextResponse.json(defaultEnhancements[workoutType as 'aerobic' | 'strength']);
    }
    
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

    console.log('Sending request to OpenAI');
    
    try {
      // Set a timeout for the OpenAI request
      const timeoutMs = 25000; // 25 seconds
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo", // Fallback to a more reliable model
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
      }, { signal: controller.signal });

      clearTimeout(timeoutId);

      console.log('Received response from OpenAI');
      
      const content = completion.choices[0].message.content;
      if (!content) {
        console.error('No content received from OpenAI');
        return NextResponse.json(
          { error: 'No content received from OpenAI' },
          { status: 500 }
        );
      }

      // Parse the response with fallback
      try {
        const enhancedWorkout = JSON.parse(content);
        console.log('Successfully parsed OpenAI response');
        
        // Validate the response structure
        if (!enhancedWorkout.workoutGoal || !enhancedWorkout.enhancedExercises || !Array.isArray(enhancedWorkout.enhancedExercises)) {
          console.error('Invalid response structure from OpenAI:', enhancedWorkout);
          throw new Error('Invalid response structure');
        }
        
        return NextResponse.json(enhancedWorkout);
      } catch (jsonError) {
        console.error('Error parsing OpenAI response:', jsonError, 'Content:', content);
        
        // Try to extract JSON from the response if it's wrapped in markdown or other text
        try {
          const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                           content.match(/```\s*([\s\S]*?)\s*```/) ||
                           content.match(/{[\s\S]*}/);
                           
          if (jsonMatch && jsonMatch[1]) {
            const extractedJson = JSON.parse(jsonMatch[1]);
            if (extractedJson.workoutGoal && extractedJson.enhancedExercises) {
              console.log('Successfully extracted JSON from OpenAI response');
              return NextResponse.json(extractedJson);
            }
          }
        } catch (extractError) {
          console.error('Failed to extract JSON from response:', extractError);
        }
        
        // Fallback to default enhancements
        const workoutType = workout.type || 'aerobic';
        console.log('Using fallback enhancements');
        return NextResponse.json(defaultEnhancements[workoutType as 'aerobic' | 'strength']);
      }
    } catch (openaiError: any) {
      console.error('OpenAI API error:', openaiError);
      
      // Check if it's a timeout error
      if (openaiError.message?.includes('timeout') || 
          openaiError.type === 'request_timeout' ||
          openaiError.name === 'AbortError' ||
          openaiError.code === 'ETIMEDOUT') {
        return NextResponse.json(
          { error: 'OpenAI request timed out. Please try again.' },
          { status: 504 }
        );
      }
      
      // Fallback to default enhancements
      const workoutType = workout.type || 'aerobic';
      console.log('Using fallback enhancements due to OpenAI error');
      return NextResponse.json(defaultEnhancements[workoutType as 'aerobic' | 'strength']);
    }
    
  } catch (error: any) {
    console.error('Error enhancing workout details:', error);
    
    // Always return fallback enhancements on error in production
    if (process.env.NODE_ENV === 'production') {
      try {
        const workout = await req.json().then(body => body.workout).catch(() => ({}));
        const workoutType = workout?.type || 'aerobic';
        console.log('Using fallback enhancements due to general error');
        return NextResponse.json(defaultEnhancements[workoutType as 'aerobic' | 'strength']);
      } catch (fallbackError) {
        console.error('Error generating fallback enhancements:', fallbackError);
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to enhance workout details',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 