import OpenAI from 'openai';
import { NextResponse } from 'next/server';

// Add edge runtime config
export const runtime = 'edge';

// Sample workout templates for fallback
const aerobicWorkouts = [
  {
    type: 'aerobic',
    title: 'אימון ריצה מדורג',
    exercises: [
      'חימום 10 דקות הליכה/ריצה קלה',
      '5 דקות ריצה בקצב בינוני',
      '3 × 3 דקות ריצה מהירה עם דקה הליכה בין לבין',
      'שחרור 10 דקות הליכה'
    ],
    duration: '35 דקות',
    intensity: 'בינוני'
  },
  {
    type: 'aerobic',
    title: 'אימון סיבולת בסיסי',
    exercises: [
      'חימום 10 דקות',
      'ריצה רציפה 30 דקות בדופק נמוך',
      'שחרור 5 דקות'
    ],
    duration: '45 דקות',
    intensity: 'קל'
  },
  {
    type: 'aerobic',
    title: 'אימון אינטרוולים',
    exercises: [
      'חימום 10 דקות',
      '8 × 1 דקה ריצה מהירה',
      '1 דקה הליכה בין לבין',
      'שחרור 10 דקות'
    ],
    duration: '35 דקות',
    intensity: 'גבוה'
  }
];

const strengthWorkouts = [
  {
    type: 'strength',
    title: 'אימון כוח עליון',
    exercises: [
      'עליות מתח 3×8',
      'שכיבות שמיכה 4×12',
      'מתח צר 3×8',
      'דחיקת כתפיים 3×12',
      'כפיפות מרפק 3×12'
    ],
    duration: '45 דקות',
    intensity: 'גבוה'
  },
  {
    type: 'strength',
    title: 'אימון כוח תחתון',
    exercises: [
      'סקוואט 4×12',
      'לאנג׳ הליכה 3×10 לכל רגל',
      'מתח רחב 3×8',
      'כפיפות בטן 3×20',
      'פלאנק 3×45 שניות'
    ],
    duration: '50 דקות',
    intensity: 'גבוה'
  },
  {
    type: 'strength',
    title: 'אימון כוח מתפרץ',
    exercises: [
      'קפיצות סקוואט 4×10',
      'ברפי 4×8',
      'שכיבות שמיכה נפיצות 4×8',
      'מתיחות בטן מהירות 4×15',
      'קפיצות פיסוק 4×20'
    ],
    duration: '40 דקות',
    intensity: 'גבוה'
  }
];

// Military-specific workout templates
const militaryWorkouts = [
  {
    type: 'military',
    title: 'אימון הכנה לקרבי - סיבולת',
    exercises: [
      'חימום 10 דקות',
      'ריצת אינטרוולים: 10 × 100 מטר ספרינט עם 30 שניות מנוחה',
      'זחילה צבאית 4 × 20 מטר',
      'ריצה עם משקל 5 ק"ג 3 × 400 מטר',
      'תרגילי קפיצה 3 × 20 (קפיצות סקוואט, קפיצות פיסוק, ברפי)',
      'שחרור 5 דקות'
    ],
    duration: '50 דקות',
    intensity: 'גבוה',
    equipment: 'משקולת 5 ק"ג או תיק עם משקל דומה'
  },
  {
    type: 'military',
    title: 'אימון הכנה לקרבי - כוח',
    exercises: [
      'חימום 10 דקות',
      'מתח רחב 5 × מקסימום (מנוחה 90 שניות)',
      'שכיבות שמיכה 5 × 20 (מנוחה 60 שניות)',
      'סקוואט עם קפיצה 4 × 15 (מנוחה 60 שניות)',
      'זחילת דוב 3 × 20 מטר (מנוחה 45 שניות)',
      'מקבילים 4 × 12 (מנוחה 60 שניות)',
      'פלאנק עם תזוזה צידית 3 × 45 שניות לכל צד',
      'שחרור 5 דקות'
    ],
    duration: '55 דקות',
    intensity: 'גבוה',
    equipment: 'מתח, מקבילים'
  },
  {
    type: 'military',
    title: 'אימון הכנה לקרבי - משולב',
    exercises: [
      'חימום 10 דקות',
      'סבב אימון (4 סיבובים, 45 שניות עבודה, 15 שניות מנוחה בין תרגילים):',
      '- ברפי',
      '- זחילה צבאית נמוכה',
      '- מתיחות בטן מהירות',
      '- ריצה במקום עם ברכיים גבוהות',
      '- שכיבות שמיכה עם מחיאת כף',
      '- קפיצות סקוואט',
      'מנוחה 2 דקות בין סיבובים',
      'ריצת 1.5 ק"מ בקצב מהיר',
      'שחרור 5 דקות'
    ],
    duration: '50 דקות',
    intensity: 'גבוה',
    equipment: 'אין'
  }
];

function generateWorkoutSchedule(frequency: 2 | 3 | 4 | 5, goal?: string) {
  const schedule = [];

  for (let i = 0; i < frequency; i++) {
    // If goal is army/military, prioritize military workouts
    if (goal === 'army' && militaryWorkouts.length > 0) {
      // Ensure variety by cycling through available military workouts
      const militaryWorkoutIndex = i % militaryWorkouts.length;
      schedule.push({
        ...militaryWorkouts[militaryWorkoutIndex],
        day: (i + 1).toString()
      });
    } else {
      // Standard alternating workout pattern for other goals
      const isStrengthDay = i % 2 === 1;
      const workoutTemplates = isStrengthDay ? strengthWorkouts : aerobicWorkouts;
      const randomWorkout = workoutTemplates[Math.floor(Math.random() * workoutTemplates.length)];
      
      schedule.push({
        ...randomWorkout,
        day: (i + 1).toString()
      });
    }
  }

  return schedule;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const startTime = Date.now();
  console.log('Starting generate-workout API call');
  
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
    
    console.log('Received workout generation request', `Elapsed: ${(Date.now() - startTime)/1000}s`);
    
    // Parse request body with error handling
    let userAnswers;
    try {
      const body = await req.json();
      userAnswers = body.userAnswers;
      console.log('User answers:', userAnswers);
    } catch (parseError: any) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request format', details: parseError.message },
        { status: 400 }
      );
    }
    
    // Validate user answers
    if (!userAnswers) {
      console.error('Missing userAnswers in request');
      return NextResponse.json(
        { error: 'Missing user answers in request' },
        { status: 400 }
      );
    }

    const prompt = `Create a personalized Five Fingers workout program for:
    - Gender: ${userAnswers.gender || 'Not specified'}
    - Age: ${userAnswers.group || 'Not specified'}
    - Experience: ${userAnswers.experienceLevel || 'Not specified'}
    - 3km Time: ${userAnswers.threeKmTime || 'Not specified'}
    - Max Pull-ups: ${userAnswers.pullUps || 'Not specified'}
    - Goal: ${userAnswers.goal || 'Not specified'}
    - Weekly Frequency: ${userAnswers.workoutFrequency || '3'} times

    Guidelines:
    1. 45-60 minute workouts with warm-up, workout, and cool-down
    2. Include clear title, specific workout goal, intensity level, and duration
    3. Detail exercises with reps, sets, and rest periods
    4. Focus on military preparation with crawling, sprinting, carrying objects
    5. Include equipment needed and metrics to track

    Format as JSON with a 'workouts' array. ALL TEXT MUST BE IN HEBREW ONLY.`;

    console.log('Sending request to OpenAI', `Elapsed: ${(Date.now() - startTime)/1000}s`);
    
    // Set a timeout for the OpenAI request
    const timeoutMs = 50000; // 50 seconds for edge runtime
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      // System message - simplify
      const systemMessage = "You are an elite fitness coach specializing in creating workout programs in Hebrew. Create professional, evidence-based workout programs that combine physical and mental challenges. ALL OUTPUT MUST BE IN HEBREW.";

      // Full detailed prompt - simplify
      const detailedPrompt = `Create a personalized Five Fingers workout program for:
      - Gender: ${userAnswers.gender || 'Not specified'}
      - Age: ${userAnswers.group || 'Not specified'}
      - Experience: ${userAnswers.experienceLevel || 'Not specified'}
      - 3km Time: ${userAnswers.threeKmTime || 'Not specified'}
      - Max Pull-ups: ${userAnswers.pullUps || 'Not specified'}
      - Goal: ${userAnswers.goal || 'Not specified'}
      - Weekly Frequency: ${userAnswers.workoutFrequency || '3'} times

      Guidelines:
      1. 45-60 minute workouts with warm-up, workout, and cool-down
      2. Include clear title, specific workout goal, intensity level, and duration
      3. Detail exercises with reps, sets, and rest periods
      4. Focus on military preparation with crawling, sprinting, carrying objects
      5. Include equipment needed and metrics to track

      Format as JSON with a 'workouts' array. ALL TEXT MUST BE IN HEBREW ONLY.`;

      console.log('Calling OpenAI', `Elapsed: ${(Date.now() - startTime)/1000}s`);
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // Using GPT-4o model as requested
        messages: [
          {
            role: "system",
            content: systemMessage
          },
          {
            role: "user",
            content: detailedPrompt
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
        max_tokens: 4000
      }, { signal: controller.signal });

      clearTimeout(timeoutId);

      console.log('Received response from OpenAI', `Elapsed: ${(Date.now() - startTime)/1000}s`);
      
      const content = completion.choices[0].message.content;
      if (!content) {
        console.error('No content received from OpenAI');
        return NextResponse.json(
          { error: 'לא התקבלה תשובה מהשרת. אנא נסה שוב.' },
          { status: 500 }
        );
      }

      // Try to parse the response
      try {
        const workoutProgram = JSON.parse(content);
        console.log('Successfully parsed OpenAI response');
        
        // Validate the response structure
        if (!workoutProgram.workouts || !Array.isArray(workoutProgram.workouts)) {
          console.error('Invalid response structure from OpenAI:', workoutProgram);
          return NextResponse.json(
            { error: 'מבנה התשובה שגוי. אנא נסה שוב.' },
            { status: 500 }
          );
        }
        
        return NextResponse.json(workoutProgram);
      } catch (jsonError) {
        console.error('Error parsing OpenAI response:', jsonError, 'Content:', content);
        
        // Try to extract JSON from the response if it's wrapped in markdown or other text
        try {
          const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                           content.match(/```\s*([\s\S]*?)\s*```/) ||
                           content.match(/{[\s\S]*}/);
                           
          if (jsonMatch && jsonMatch[1]) {
            const extractedJson = JSON.parse(jsonMatch[1]);
            if (extractedJson.workouts && Array.isArray(extractedJson.workouts)) {
              console.log('Successfully extracted JSON from OpenAI response');
              return NextResponse.json(extractedJson);
            }
          }
        } catch (extractError) {
          console.error('Failed to extract JSON from response:', extractError);
        }
        
        return NextResponse.json(
          { error: 'שגיאה בעיבוד התשובה. אנא נסה שוב.' },
          { status: 500 }
        );
      }
    } catch (openaiError: any) {
      console.error('OpenAI API error:', openaiError);
      
      if (openaiError.message?.includes('timeout') || 
          openaiError.type === 'request_timeout' ||
          openaiError.name === 'AbortError' ||
          openaiError.code === 'ETIMEDOUT') {
        console.error('Request timed out');
        return NextResponse.json(
          { error: 'תם הזמן המוקצב לבקשה. אנא נסה שוב.' },
          { status: 504 }
        );
      }
      
      return NextResponse.json(
        { error: 'שגיאה בתקשורת עם השרת: ' + openaiError.message },
        { status: 500 }
      );
    }
    
  } catch (error: any) {
    console.error('Error generating workout program:', error);
    
    // Return error instead of fallback
    return NextResponse.json(
      { 
        error: 'Failed to generate workout program with GPT-4',
        message: error.message,
        details: 'Please try again later.'
      },
      { status: 500 }
    );
  }
} 