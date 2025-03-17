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
  },
  military: {
    workoutGoal: "הכנה לדרישות הפיזיות של שירות קרבי, שיפור סיבולת, כוח וחוסן מנטלי",
    enhancedExercises: [
      {
        name: "זחילה צבאית",
        restingTime: "30-45 שניות",
        variations: {
          easy: "זחילה על הברכיים למרחק קצר",
          medium: "זחילה צבאית סטנדרטית",
          hard: "זחילה צבאית עם משקל נוסף או בשטח חולי"
        }
      },
      {
        name: "ריצת אינטרוולים",
        restingTime: "20-30 שניות בין ספרינטים",
        variations: {
          easy: "ריצה 30 שניות, הליכה 30 שניות",
          medium: "ספרינט 20 שניות, הליכה 40 שניות",
          hard: "ספרינט 30 שניות, הליכה 30 שניות בשטח משתנה"
        }
      },
      {
        name: "ברפי",
        restingTime: "30-45 שניות",
        variations: {
          easy: "ברפי ללא קפיצה",
          medium: "ברפי סטנדרטי",
          hard: "ברפי עם מחיאת כף ומשיכת ברכיים לחזה"
        }
      },
      {
        name: "אימון עם משקל",
        restingTime: "45-60 שניות",
        variations: {
          easy: "הליכה עם תיק 5 ק\"ג",
          medium: "ריצה קלה עם תיק 10 ק\"ג",
          hard: "ריצה/הליכה מהירה עם תיק 15 ק\"ג"
        }
      },
      {
        name: "תרגילי כוח משולבים",
        restingTime: "45-60 שניות",
        variations: {
          easy: "סדרה של 10 שכיבות שמיכה, 10 סקוואט, 10 כפיפות בטן",
          medium: "סדרה של 15 שכיבות שמיכה, 15 סקוואט, 15 כפיפות בטן, 5 מתח",
          hard: "סדרה של 20 שכיבות שמיכה, 20 סקוואט, 20 כפיפות בטן, 10 מתח, 10 ברפי"
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
        { error: 'מפתח ה-API של OpenAI לא מוגדר' },
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
        { error: 'תבנית הבקשה אינה חוקית', details: parseError.message },
        { status: 400 }
      );
    }
    
    // Validate workout
    if (!workout) {
      console.error('Missing workout in request');
      return NextResponse.json(
        { error: 'חסר האימון בבקשה' },
        { status: 400 }
      );
    }

    const prompt = `Enhance the following workout with professional, detailed information:
    - Workout: ${JSON.stringify(workout)}
    
    IMPORTANT: THE ENTIRE RESPONSE MUST BE IN HEBREW ONLY INCLUDING ALL FIELD NAMES AND VALUES.

    Please provide the following comprehensive enhancements:
    
    1. A specific, evidence-based workout goal that explains:
       - The primary physiological purpose of this workout
       - The specific fitness benefits and adaptations it targets
       - How it contributes to overall athletic development
       - Expected outcomes with consistent training
    
    2. For each exercise, provide:
       - Precise recommended resting time between sets (based on exercise intensity and type)
       - Detailed form cues and technique instructions to ensure proper execution
       - Common mistakes to avoid and how to correct them
       - Progression metrics to track improvement
    
    3. For each exercise, provide three distinct variations:
       - Easy: A simplified version with specific modifications for beginners or those with limitations
       - Medium: The standard version with proper form and execution guidelines
       - Hard: An advanced variation with specific progression elements for experienced athletes
    
    4. Additional professional insights:
       - Optimal breathing patterns for each exercise
       - Mind-muscle connection cues
       - Recovery recommendations
       - Performance indicators to track progress
    
    Format the response as a JSON object with the following structure (ALL IN HEBREW):
    {
      "workoutGoal": "detailed description of the workout's purpose, benefits, and expected outcomes IN HEBREW",
      "enhancedExercises": [
        {
          "name": "original exercise name IN HEBREW",
          "restingTime": "precise resting recommendation (e.g., '30-45 seconds for hypertrophy', '2-3 minutes for strength') IN HEBREW",
          "formCues": "detailed technique instructions and proper form guidelines IN HEBREW",
          "commonMistakes": "common errors and how to correct them IN HEBREW",
          "breathingPattern": "optimal breathing technique for this exercise IN HEBREW",
          "progressionMetrics": "how to measure improvement in this exercise IN HEBREW",
          "variations": {
            "easy": "detailed description of easier variation with specific modifications IN HEBREW",
            "medium": "detailed description of standard variation with proper execution guidelines IN HEBREW",
            "hard": "detailed description of advanced variation with specific progression elements IN HEBREW"
          }
        }
      ]
    }
    
    VERY IMPORTANT: ALL TEXT IN THE RESPONSE MUST BE IN HEBREW ONLY, INCLUDING ALL FIELD NAMES AND VALUES.`;

    console.log('Sending request to OpenAI');
    
    try {
      // Set a timeout for the OpenAI request
      const timeoutMs = 30000; // 30 seconds
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "אתה מאמן כושר מקצועי ברמה עולמית המתמחה בתכנון אימונים מדויקים ומבוססי מדע. תפקידך הוא לספק הנחיות מפורטות ומקצועיות לכל תרגיל, כולל טכניקה נכונה, וריאציות מותאמות לרמות שונות, וטיפים מתקדמים. חשוב מאוד: הקפד לענות בעברית מקצועית ומדויקת בלבד, כולל כל שמות השדות והערכים ב-JSON. הגב אך ורק ב-JSON תקין המכיל שדות בעברית בלבד."
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
          { error: 'לא התקבל תוכן מ-OpenAI' },
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
        
        // Use fallback enhancements if there's an error
        console.log('Using fallback enhancements due to OpenAI error');
        
        // Determine workout type and use appropriate fallback
        let workoutType = workout.type || 'aerobic';
        
        // Map 'military' type to the appropriate enhancement
        if (workoutType === 'military') {
          return NextResponse.json({ enhancedWorkout: { ...workout, ...defaultEnhancements.military } });
        } else if (workoutType === 'strength') {
          return NextResponse.json({ enhancedWorkout: { ...workout, ...defaultEnhancements.strength } });
        } else {
          return NextResponse.json({ enhancedWorkout: { ...workout, ...defaultEnhancements.aerobic } });
        }
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
      
      // Use fallback enhancements if there's an error
      console.log('Using fallback enhancements due to OpenAI error');
      
      // Determine workout type and use appropriate fallback
      let workoutType = workout.type || 'aerobic';
      
      // Map 'military' type to the appropriate enhancement
      if (workoutType === 'military') {
        return NextResponse.json({ enhancedWorkout: { ...workout, ...defaultEnhancements.military } });
      } else if (workoutType === 'strength') {
        return NextResponse.json({ enhancedWorkout: { ...workout, ...defaultEnhancements.strength } });
      } else {
        return NextResponse.json({ enhancedWorkout: { ...workout, ...defaultEnhancements.aerobic } });
      }
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