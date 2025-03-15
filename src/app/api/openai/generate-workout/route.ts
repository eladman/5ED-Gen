import OpenAI from 'openai';
import { NextResponse } from 'next/server';

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

const weekDays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

function generateWorkoutSchedule(frequency: 2 | 3 | 4 | 5) {
  const schedule = [];
  const daysGap = Math.floor(7 / frequency);
  let currentDayIndex = 0;

  for (let i = 0; i < frequency; i++) {
    const isStrengthDay = i % 2 === 1;
    const workoutTemplates = isStrengthDay ? strengthWorkouts : aerobicWorkouts;
    const randomWorkout = workoutTemplates[Math.floor(Math.random() * workoutTemplates.length)];
    
    schedule.push({
      ...randomWorkout,
      day: weekDays[currentDayIndex]
    });

    currentDayIndex = (currentDayIndex + daysGap) % 7;
  }

  return schedule.sort((a, b) => weekDays.indexOf(a.day) - weekDays.indexOf(b.day));
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
    
    console.log('Received workout generation request');
    
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

    // Use fallback workouts if in production and we're having issues
    if (process.env.NODE_ENV === 'production' && process.env.USE_FALLBACK_WORKOUTS === 'true') {
      console.log('Using fallback workouts due to configuration');
      const frequency = userAnswers.workoutFrequency || 3;
      const fallbackWorkouts = generateWorkoutSchedule(
        Math.min(Math.max(frequency, 2), 5) as 2 | 3 | 4 | 5
      );
      return NextResponse.json({ workouts: fallbackWorkouts });
    }

    const prompt = `Generate a personalized workout program based on the following user information:
    - Gender: ${userAnswers.gender || 'Not specified'}
    - Age Group: ${userAnswers.group || 'Not specified'}
    - Experience Level: ${userAnswers.experienceLevel || 'Not specified'}
    - 3km Run Time: ${userAnswers.threeKmTime || 'Not specified'}
    - Max Pull-ups: ${userAnswers.pullUps || 'Not specified'}
    - Training Goal: ${userAnswers.goal || 'Not specified'}
    - Weekly Workout Frequency: ${userAnswers.workoutFrequency || '3'} times

    Please generate a weekly workout schedule following the Five Finger method, which includes:
    1. Warm-up exercises
    2. Main workout (alternating between aerobic and strength training)
    3. Cool-down exercises
    4. Intensity level
    5. Duration

    For each workout, also include:
    - A specific workout goal that explains the purpose and benefits
    - Recommended resting time between exercises
    - Easy, medium, and hard variations for each exercise

    Format the response as a JSON object with a 'workouts' array, where each workout contains:
    {
      "workouts": [
        {
          "day": "string (day of week in Hebrew)",
          "type": "aerobic" or "strength",
          "title": "string",
          "exercises": ["array of exercise descriptions"],
          "duration": "string (in minutes)",
          "intensity": "קל" or "בינוני" or "גבוה",
          "workoutGoal": "string describing the purpose and benefits of this workout",
          "enhancedExercises": [
            {
              "name": "exercise name (matching the one in exercises array)",
              "restingTime": "string (e.g., '30 seconds', '1 minute')",
              "variations": {
                "easy": "description of easier variation",
                "medium": "description of medium variation",
                "hard": "description of harder variation"
              }
            }
          ]
        }
      ]
    }

    Ensure the workouts are appropriate for the user's level and goals.`;

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
            content: "answer only in hebrew. You are a professional fitness trainer using the Five Fingers method, specializing in creating personalized workout programs (no gym), keep in mind that the user is also doing 2 intense Five Fingers workouts each week, each workout should be 45-60 minutes long, based on the user answers, and consider adding a run pace or number of reps/sets based on the user's level (answers). For each exercise, provide resting times and variations for different difficulty levels. Respond only with valid JSON that includes a 'workouts' array."
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

      // Fallback to predefined workouts if parsing fails
      try {
        const workoutProgram = JSON.parse(content);
        console.log('Successfully parsed OpenAI response');
        
        // Validate the response structure
        if (!workoutProgram.workouts || !Array.isArray(workoutProgram.workouts)) {
          console.error('Invalid response structure from OpenAI:', workoutProgram);
          throw new Error('Invalid response structure');
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
        
        // Fallback to predefined workouts
        const frequency = userAnswers.workoutFrequency || 3;
        const fallbackWorkouts = generateWorkoutSchedule(
          Math.min(Math.max(frequency, 2), 5) as 2 | 3 | 4 | 5
        );
        
        console.log('Using fallback workouts');
        return NextResponse.json({ workouts: fallbackWorkouts });
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
      
      // Fallback to predefined workouts
      const frequency = userAnswers.workoutFrequency || 3;
      const fallbackWorkouts = generateWorkoutSchedule(
        Math.min(Math.max(frequency, 2), 5) as 2 | 3 | 4 | 5
      );
      
      console.log('Using fallback workouts due to OpenAI error');
      return NextResponse.json({ workouts: fallbackWorkouts });
    }
    
  } catch (error: any) {
    console.error('Error generating workout program:', error);
    
    // Always return fallback workouts on error in production
    if (process.env.NODE_ENV === 'production') {
      try {
        const userAnswers = await req.json().then(body => body.userAnswers).catch(() => ({}));
        const frequency = userAnswers?.workoutFrequency || 3;
        const fallbackWorkouts = generateWorkoutSchedule(
          Math.min(Math.max(frequency, 2), 5) as 2 | 3 | 4 | 5
        );
        console.log('Using fallback workouts due to general error');
        return NextResponse.json({ workouts: fallbackWorkouts });
      } catch (fallbackError) {
        console.error('Error generating fallback workouts:', fallbackError);
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to generate workout program',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 