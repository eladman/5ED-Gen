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
    // Check if API key is available and valid
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is missing');
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }
    
    // Validate API key format (basic check)
    // Support both standard API keys (sk-...) and project-based API keys (sk-proj-...)
    if (!(process.env.OPENAI_API_KEY.startsWith('sk-') || process.env.OPENAI_API_KEY.startsWith('sk-proj-')) || 
        process.env.OPENAI_API_KEY.length < 20) {
      console.error('OpenAI API key appears to be invalid');
      return NextResponse.json(
        { error: 'Invalid OpenAI API key format. Please check your environment variables.' },
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

    // Function to generate default enhanced exercises
    const createDefaultEnhancedExercises = (exercises: string[]) => {
      return exercises.map((exercise: string) => ({
        name: exercise,
        restingTime: "30-60 שניות",
        formCues: "הקפד על ביצוע נכון ויציבה טובה",
        commonMistakes: "יציבה לא נכונה, תנועה מהירה מדי",
        breathingPattern: "נשום בזמן המאמץ, שאף באוויר בזמן הרפיה",
        progressionMetrics: "הגדל משקל/חזרות בהדרגה",
        variations: {
          easy: "גרסה מופחתת - הפחת משקל/חזרות",
          medium: exercise,
          hard: "גרסה מתקדמת - הוסף משקל/חזרות"
        }
      }));
    };
    
    console.log('Sending request to OpenAI');
    
    try {
      // Set a timeout for the OpenAI request
      const timeoutMs = 25000; // Reduce to 25 seconds for Vercel limits
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      // Ultra simplified system message
      const systemMessage = "מאמן כושר: שדרג תרגילי אימון עם מידע טכני. תן JSON בעברית בלבד.";

      // Ultra simplified prompt
      const simplifiedPrompt = `שדרג אימון: ${JSON.stringify({
        title: workout.title,
        type: workout.type,
        exercises: workout.exercises.slice(0, 3) // Limit to first 3 exercises to reduce complexity
      })}`;

      // Prepare default enhanced exercises
      const defaultEnhancedExercises = createDefaultEnhancedExercises(workout.exercises);

      // Default workout goal
      const defaultWorkoutGoal = workout.type === 'aerobic' 
        ? "שיפור סיבולת לב-ריאה, חיזוק מערכת הנשימה והלב, העלאת יכולת אירובית"
        : "חיזוק והגדלת מסת שריר, שיפור כוח וסיבולת שרירית";

      // Fallback directly if environment variable is set
      if (process.env.USE_FALLBACK_WORKOUTS === 'true') {
        console.log('Using fallback enhancement instead of OpenAI API');
        return NextResponse.json({
          workoutGoal: defaultWorkoutGoal,
          enhancedExercises: defaultEnhancedExercises
        });
      }

      console.log('Calling OpenAI with simplified prompt');
      
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo", // Using a faster model that's less likely to timeout
        messages: [
          {
            role: "system",
            content: systemMessage
          },
          {
            role: "user",
            content: simplifiedPrompt
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
        max_tokens: 2000 // Reduced token count
      }, { signal: controller.signal });

      clearTimeout(timeoutId);

      console.log('Received response from OpenAI');
      
      const content = completion.choices[0].message.content;
      if (!content) {
        console.error('No content received from OpenAI, using fallback');
        return NextResponse.json({
          workoutGoal: defaultWorkoutGoal,
          enhancedExercises: defaultEnhancedExercises
        });
      }

      // Parse the response with fallback
      try {
        const enhancedWorkout = JSON.parse(content);
        console.log('Successfully parsed OpenAI response');
        
        // Validate the response structure
        if (!enhancedWorkout.workoutGoal || !enhancedWorkout.enhancedExercises || !Array.isArray(enhancedWorkout.enhancedExercises)) {
          console.error('Invalid response structure from OpenAI, using fallback');
          return NextResponse.json({
            workoutGoal: defaultWorkoutGoal,
            enhancedExercises: defaultEnhancedExercises
          });
        }
        
        return NextResponse.json(enhancedWorkout);
      } catch (jsonError) {
        console.error('Error parsing OpenAI response, using fallback');
        return NextResponse.json({
          workoutGoal: defaultWorkoutGoal,
          enhancedExercises: defaultEnhancedExercises
        });
      }
    } catch (openaiError: any) {
      console.error('OpenAI API error, using fallback:', openaiError);
      
      // Create default enhanced exercises for fallback
      const enhancedExercises = createDefaultEnhancedExercises(workout.exercises);
      
      // Default workout goal
      const workoutGoal = workout.type === 'aerobic' 
        ? "שיפור סיבולת לב-ריאה, חיזוק מערכת הנשימה והלב, העלאת יכולת אירובית"
        : "חיזוק והגדלת מסת שריר, שיפור כוח וסיבולת שרירית";
      
      return NextResponse.json({
        workoutGoal: workoutGoal,
        enhancedExercises: enhancedExercises
      });
    }
    
  } catch (error: any) {
    console.error('Error enhancing workout details:', error);
    
    // Return error instead of fallback
    return NextResponse.json(
      { 
        error: 'Failed to enhance workout details with GPT-4',
        message: error.message,
        details: 'Please try again later.'
      },
      { status: 500 }
    );
  }
} 