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
  apiKey: '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'
});

export async function POST(req: Request) {
  try {
    console.log('Received workout generation request');
    const { userAnswers } = await req.json();
    console.log('User answers:', userAnswers);
    
    const prompt = `Generate a personalized workout program based on the following user information:
    - Gender: ${userAnswers.gender}
    - Age Group: ${userAnswers.group}
    - Experience Level: ${userAnswers.experienceLevel}
    - 3km Run Time: ${userAnswers.threeKmTime}
    - Max Pull-ups: ${userAnswers.pullUps}
    - Training Goal: ${userAnswers.goal}
    - Weekly Workout Frequency: ${userAnswers.workoutFrequency} times

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

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
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
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      return NextResponse.json(
        { error: 'No content received from OpenAI' },
        { status: 500 }
      );
    }

    const workoutProgram = JSON.parse(content);
    return NextResponse.json(workoutProgram);
    
  } catch (error: any) {
    console.error('Error generating workout program:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate workout program',
        message: error.message 
      },
      { status: 500 }
    );
  }
} 