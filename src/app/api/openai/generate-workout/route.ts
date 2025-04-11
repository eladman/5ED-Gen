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
      // Standard alternating workout pattern for other goals - more athlete-focused
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

// For build purposes, use a placeholder API key if the environment variable is missing
const apiKey = process.env.OPENAI_API_KEY || 'sk-placeholder-for-build-purposes-only';

const openai = new OpenAI({
  apiKey: apiKey,
});

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

    const prompt = `Generate a personalized workout program using the Five Fingers Physical-Mental Training method based on the following user information:
    - Gender: ${userAnswers.gender || 'Not specified'}
    - Age Group: ${userAnswers.group || 'Not specified'}
    - Experience Level: ${userAnswers.experienceLevel || 'Not specified'}
    - 3km Run Time: ${userAnswers.threeKmTime || 'Not specified'}
    - Max Pull-ups: ${userAnswers.pullUps || 'Not specified'}
    - Training Goal: ${userAnswers.goal || 'Not specified'}
    - Weekly Workout Frequency: ${userAnswers.workoutFrequency || '3'} times

    VERY IMPORTANT: ALL CONTENT MUST BE IN HEBREW (עברית) ONLY. DO NOT USE ANY ENGLISH AT ALL.

    Please generate a comprehensive weekly workout schedule following these guidelines:
    
    1. Each workout should be between 45-60 minutes and include:
       - A 10-minute warm-up (no need to specify the warm-up details)
       - A structured workout that combines physical effort and mental resilience challenges to build both physical fitness and mental toughness
       - Exercises that push the user's limits, embracing discomfort as a tool for growth
       - A mix of strength, endurance, and mental focus challenges
       - A clear, motivational title that reflects the workout's focus (IN HEBREW)
       - A specific workout goal that explains the purpose, benefits, and expected outcomes (IN HEBREW)
       - Precise intensity level (קל/בינוני/גבוה)
       - Accurate duration (between 45-60 minutes total)
    
    2. For each exercise, include:
       - Exact repetitions, sets, and timing (IN HEBREW)
       - Moments that challenge mental strength — such as holding positions under fatigue, maintaining focus under pressure, or setting and achieving small targets during workouts
       - Specific rest periods between sets (IN HEBREW)
    
    3. Ensure the program follows these principles:
       - The user already performs two intense Five Fingers workouts per week, so this program should provide complementary training without overloading their body
       - Prioritize functional movements, bodyweight exercises, and challenging yet achievable goals
       - Adapt the difficulty to suit the user's current fitness level, with options to scale intensity
       - Incorporate moments that challenge mental strength throughout the workouts
       - Balance different muscle groups throughout the week
       - Consider the user's experience level for exercise selection
       - Align with the user's specific goals (military preparation, aerobic improvement, strength building)
    ${userAnswers.goal === 'army' ? `
    4. IMPORTANT - Since the user selected "הכנה לצבא" (Military Preparation) as their goal:
       - Create intense, military-style training workouts that specifically prepare for IDF physical tests and combat fitness
       - Include exercises that mimic military activities such as crawling, sprinting on varied terrain (including sand if possible), carrying heavy objects, and obstacle course elements
       - Focus on building endurance, explosive power, and mental resilience under pressure
       - Incorporate interval training with minimal rest periods to simulate combat stress
       - Include exercises that build upper body strength for activities like climbing and pulling
       - Add specific military-style drills like bear crawls, low crawls, high crawls, and tactical movements
       - Ensure workouts build both anaerobic and aerobic capacity needed for military fitness tests
       - Include partner exercises when possible to simulate team-based military activities
       - Design workouts with progressive intensity to prepare for the physical demands of basic training
       - Focus on core strength and stability which is essential for military activities` : `
    4. IMPORTANT - Create athlete-style training workouts that focus on:
       - Building overall functional strength, endurance, and mobility
       - Developing athletic performance with balanced full-body training
       - Incorporating compound movements that engage multiple muscle groups
       - Including progressive overload principles to continuously improve performance
       - Adding athletic movements like jumping, sprinting, and dynamic exercises
       - Focusing on proper form and technique to maximize results and prevent injury
       - Developing core stability and rotational strength for athletic movement
       - Including mobility work to improve range of motion and prevent injury
       - Adding periodized training to optimize performance gains
       - Developing sports-specific skills based on the user's preferences and goals`}
    
    ${userAnswers.goal === 'army' ? '5' : '5'}. For each workout, also include:
       - Equipment needed (if any) (IN HEBREW)
       - Recommended resting time between exercises (IN HEBREW)
       - Performance metrics to track progress (IN HEBREW)

    REMINDER: ALL CONTENT MUST BE IN HEBREW (עברית) ONLY.

    Format the response as a JSON object with a 'workouts' array, where each workout contains:
    {
      "workouts": [
        {
          "workoutNumber": "number (workout number)",
          "type": "aerobic" or "strength",
          "title": "string (clear, motivational title IN HEBREW)",
          "equipment": "string (equipment needed, if any IN HEBREW)",
          "exercises": ["array of detailed exercise descriptions with sets, reps, and form cues IN HEBREW"],
          "duration": "string (in minutes, between 45-60 minutes)",
          "intensity": "קל" or "בינוני" or "גבוה",
          "workoutGoal": "string describing the specific purpose, benefits, and expected outcomes IN HEBREW",
          "enhancedExercises": [
            {
              "restingTime": "string (e.g., '30 seconds', '1 minute' IN HEBREW)"
            }
          ]
        }
      ]
    }

    Ensure the workouts are both physically demanding and mentally challenging, fostering resilience, focus, and self-improvement. ALL TEXT MUST BE IN HEBREW.`;

    console.log('Sending request to OpenAI');
    
    // Set a timeout for the OpenAI request
    const timeoutMs = 60000; // 60 seconds
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      // System message
      const systemMessage = "You are an elite fitness coach with expertise in the Five Fingers Physical-Mental Training method, exercise physiology, sports science, and personalized training. Your specialty is creating professional, evidence-based workout programs tailored to individual needs and goals that combine physical challenge with mental resilience building. Each workout plan you create is meticulously structured with proper progression, periodization, and recovery. Keep in mind that the user is also doing 2 intense Five Fingers team workouts every week. VERY IMPORTANT: All workout titles, exercises, descriptions and content MUST be in Hebrew (עברית) only. Respond only with valid JSON that includes a 'workouts' array.";

      // Full detailed prompt
      const detailedPrompt = `Generate a personalized workout program using the Five Fingers Physical-Mental Training method based on the following user information:
      - Gender: ${userAnswers.gender || 'Not specified'}
      - Age Group: ${userAnswers.group || 'Not specified'}
      - Experience Level: ${userAnswers.experienceLevel || 'Not specified'}
      - 3km Run Time: ${userAnswers.threeKmTime || 'Not specified'}
      - Max Pull-ups: ${userAnswers.pullUps || 'Not specified'}
      - Training Goal: ${userAnswers.goal || 'Not specified'}
      - Weekly Workout Frequency: ${userAnswers.workoutFrequency || '3'} times

      VERY IMPORTANT: ALL CONTENT MUST BE IN HEBREW (עברית) ONLY. DO NOT USE ANY ENGLISH AT ALL.

      Please generate a comprehensive weekly workout schedule following these guidelines:
      
      1. Each workout should be between 45-60 minutes and include:
         - A 10-minute warm-up (no need to specify the warm-up details)
         - A clear, motivational title that reflects the workout's focus (IN HEBREW)
         - A specific workout goal that explains the purpose, benefits, and expected outcomes (IN HEBREW)
         - Precise intensity level (קל/בינוני/גבוה)
         - Accurate duration (between 45-60 minutes total)
      
      2. For each exercise, include:
         - Exact repetitions, sets, and timing (IN HEBREW)
         - Specific rest periods between sets (IN HEBREW)
      
      3. Ensure the program follows these principles:
         - The user already performs two intense Five Fingers workouts per week, so this program should provide complementary training without overloading their body
         - Prioritize functional movements, bodyweight exercises, and challenging yet achievable goals
         - Adapt the difficulty to suit the user's current fitness level, with options to scale intensity
         - Balance different muscle groups throughout the week
         - Consider the user's experience level for exercise selection
         - Align with the user's specific goals (military preparation, aerobic improvement, strength building)
      
      4. IMPORTANT - Since the user selected "הכנה לצבא" (Military Preparation) as their goal:
         - Create intense, military-style training workouts that specifically prepare for IDF physical tests and combat fitness
         - Include exercises that mimic military activities such as crawling, sprinting on varied terrain (including sand if possible), carrying heavy objects, and obstacle course elements
         - Focus on building endurance, explosive power, and mental resilience under pressure
         - Incorporate interval training with minimal rest periods to simulate combat stress
         - Include exercises that build upper body strength for activities like climbing and pulling
         - Add specific military-style drills like bear crawls, low crawls, high crawls, and tactical movements
         - Ensure workouts build both anaerobic and aerobic capacity needed for military fitness tests
         - Include partner exercises when possible to simulate team-based military activities
         - Design workouts with progressive intensity to prepare for the physical demands of basic training
         - Focus on core strength and stability which is essential for military activities
      
      5. For each workout, also include:
         - Equipment needed (if any) (IN HEBREW)
         - Recommended resting time between exercises (IN HEBREW)
         - Performance metrics to track progress (IN HEBREW)

      REMINDER: ALL CONTENT MUST BE IN HEBREW (עברית) ONLY.

      Format the response as a JSON object with a 'workouts' array, where each workout contains:
      {
        "workouts": [
          {
            "workoutNumber": "number (workout number)",
            "type": "aerobic" or "strength",
            "title": "string (clear, motivational title IN HEBREW)",
            "equipment": "string (equipment needed, if any IN HEBREW)",
            "exercises": ["array of detailed exercise descriptions with sets, reps, and form cues IN HEBREW"],
            "duration": "string (in minutes, between 45-60 minutes)",
            "intensity": "קל" or "בינוני" or "גבוה",
            "workoutGoal": "string describing the specific purpose, benefits, and expected outcomes IN HEBREW"
          }
        ]
      }

      Ensure the workouts are both physically demanding and mentally challenging, fostering resilience, focus, and self-improvement. ALL TEXT MUST BE IN HEBREW.`;

      console.log('Calling OpenAI');
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // Using GPT-4o for better workout generation
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

      console.log('Received response from OpenAI');
      
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