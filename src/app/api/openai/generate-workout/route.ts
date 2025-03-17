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
  try {
    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is missing');
      return NextResponse.json(
        { error: 'מפתח ה-API של OpenAI לא מוגדר' },
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
        { error: 'תבנית הבקשה אינה חוקית', details: parseError.message },
        { status: 400 }
      );
    }
    
    // Validate user answers
    if (!userAnswers) {
      console.error('Missing userAnswers in request');
      return NextResponse.json(
        { error: 'חסרות תשובות המשתמש בבקשה' },
        { status: 400 }
      );
    }

    const prompt = `בקשה בעברית - תכניות אימון - יש להשיב בעברית בלבד!
    תכנן תוכנית אימון מותאמת אישית בשיטת האימון חמישי האצבעות הפיזי-מנטלי בהתבסס על המידע הבא:
    - מגדר: ${userAnswers.gender || 'לא צוין'}
    - קבוצת גיל: ${userAnswers.group || 'לא צוין'}
    - רמת ניסיון: ${userAnswers.experienceLevel || 'לא צוין'}
    - זמן ריצה 3 ק"מ: ${userAnswers.threeKmTime || 'לא צוין'}
    - מקסימום מתח: ${userAnswers.pullUps || 'לא צוין'}
    - מטרת אימון: ${userAnswers.goal || 'לא צוין'}
    - תדירות אימון שבועית: ${userAnswers.workoutFrequency || '3'} פעמים

    חשוב מאוד: התשובה כולה חייבת להיות בעברית בלבד כולל כל שמות השדות והערכים.
    
    נא ליצור לוח זמנים שבועי מקיף לאימונים על פי ההנחיות הבאות:
    
    1. כל אימון צריך להיות בין 45-60 דקות ולכלול:
       - חימום של 10 דקות (אין צורך לפרט את פרטי החימום)
       - אימון מובנה המשלב מאמץ פיזי ואתגרי חוסן מנטלי כדי לבנות כושר גופני וקשיחות מנטלית
       - תרגילים הדוחפים את גבולות המשתמש, אימוץ אי-נוחות ככלי לצמיחה
       - שילוב של אתגרי כוח, סיבולת ומיקוד מנטלי
       - כותרת ברורה ומעוררת מוטיבציה המשקפת את מוקד האימון
       - מטרת אימון ספציפית המסבירה את המטרה, היתרונות והתוצאות הצפויות
       - רמת עצימות מדויקת (קל/בינוני/גבוה)
       - משך זמן מדויק (בין 45-60 דקות בסך הכל)
    
    2. עבור כל תרגיל, כלול:
       - חזרות, סטים ותזמון מדויקים
       - רגעים המאתגרים חוזק מנטלי — כגון החזקת עמדות תחת עייפות, שמירה על מיקוד תחת לחץ, או הגדרה והשגה של יעדים קטנים במהלך האימונים
       - זמני מנוחה ספציפיים בין סטים
    
    3. ודא שהתוכנית עוקבת אחר העקרונות הבאים:
       - המשתמש כבר מבצע שני אימוני חמישי האצבעות אינטנסיביים מדי שבוע, כך שתוכנית זו צריכה לספק אימון משלים מבלי להעמיס יתר על הגוף
       - תעדוף תנועות פונקציונליות, תרגילי משקל גוף ויעדים מאתגרים אך ברי השגה
       - התאמת הקושי לרמת הכושר הנוכחית של המשתמש, עם אפשרויות להגברת העצימות
       - שילוב רגעים המאתגרים חוזק מנטלי לאורך האימונים
       - איזון בין קבוצות שרירים שונות לאורך השבוע
       - התחשבות ברמת הניסיון של המשתמש לבחירת תרגילים
       - התאמה למטרות הספציפיות של המשתמש (הכנה צבאית, שיפור אירובי, בניית כוח)
    ${userAnswers.goal === 'army' ? `
    4. חשוב - מכיוון שהמשתמש בחר ב"הכנה לצבא" כמטרה שלו:
       - ליצור אימונים בסגנון צבאי אינטנסיביים המכינים ספציפית למבחני כושר של צה"ל וכושר קרבי
       - לכלול תרגילים המדמים פעילויות צבאיות כגון זחילה, ספרינטים בשטח משתנה (כולל חול אם אפשר), נשיאת חפצים כבדים ומרכיבי מסלול מכשולים
       - להתמקד בבניית סיבולת, כוח נפיצות וחוסן מנטלי תחת לחץ
       - לשלב אימון אינטרוולים עם זמני מנוחה מינימליים כדי לדמות לחץ קרבי
       - לכלול תרגילים הבונים חוזק פלג גוף עליון לפעילויות כמו טיפוס ומשיכה
       - להוסיף תרגילי דריל בסגנון צבאי כמו זחילת דוב, זחילות נמוכות, זחילות גבוהות ותנועות טקטיות
       - להבטיח שהאימונים בונים יכולת אנאירובית ואירובית הנדרשת למבחני כושר צבאיים
       - לכלול תרגילי שותפים כאשר אפשר כדי לדמות פעילויות צבאיות מבוססות צוות
       - לתכנן אימונים עם עצימות פרוגרסיבית להכנה לדרישות הפיזיות של הטירונות
       - להתמקד בחוזק וייצוב הליבה שהם חיוניים לפעילויות צבאיות` : ''}
    
    ${userAnswers.goal === 'army' ? '5' : '4'}. עבור כל אימון, כלול גם:
       - ציוד נדרש (אם יש)
       - זמן מנוחה מומלץ בין תרגילים
       - מדדי ביצוע למעקב אחר התקדמות

    פרמט את התשובה כאובייקט JSON עם מערך 'אימונים', כאשר כל אימון מכיל:
    {
      "אימונים": [
        {
          "מספר_אימון": "מספר (מספר האימון)",
          "סוג": "אירובי" או "כוח",
          "כותרת": "מחרוזת (כותרת ברורה ומעוררת מוטיבציה)",
          "ציוד": "מחרוזת (ציוד נדרש, אם יש)",
          "תרגילים": ["מערך של תיאורי תרגילים מפורטים עם סטים, חזרות והנחיות צורה"],
          "משך": "מחרוזת (בדקות, בין 45-60 דקות)",
          "עצימות": "קל" או "בינוני" או "גבוה",
          "מטרת_אימון": "מחרוזת המתארת את המטרה הספציפית, היתרונות והתוצאות הצפויות",
          "תרגילים_מורחבים": [
            {
              "זמן_מנוחה": "מחרוזת (לדוגמה, '30 שניות', 'דקה אחת')"
            }
          ]
        }
      ]
    }

    חשוב מאוד: כל הטקסט בתשובה חייב להיות בעברית בלבד, כולל כל שמות השדות והערכים.
    ודא שהאימונים הם גם תובעניים פיזית וגם מאתגרים מנטלית, מטפחים חוסן, מיקוד ושיפור עצמי.`;

    console.log('Sending request to OpenAI');
    
    try {
      // Set a timeout for the OpenAI request
      const timeoutMs = 40000; // Increased from 25000 to 40000 ms (40 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "אתה מאמן כושר עילית בעל מומחיות בשיטת האימון החמישי האצבעות הפיזי-מנטלי, פיזיולוגיה של אימון, מדעי הספורט, ואימון מותאם אישית. ההתמחות שלך היא ביצירת תוכניות אימון מקצועיות ומבוססות ראיות המותאמות לצרכים ויעדים אישיים המשלבות אתגר פיזי עם בניית חוסן מנטלי. כל תוכנית אימון שאתה יוצר מובנית בקפידה עם התקדמות נכונה, תקופתיות, והתאוששות, תוך שילוב אתגרים מנטליים המטפחים חוסן, מיקוד, ושיפור עצמי. יש לך ניסיון רב באימון הכנה צבאית, כולל דרישות כושר קרבי של צה״ל, מבחני כושר צבאיים, ואימון טקטי. זכור שהמשתמש גם עושה 2 אימוני צוות חמישי האצבעות אינטנסיביים בכל שבוע. חשוב מאוד: אתה חייב להגיב רק בעברית, כולל כל שמות השדות והערכים ב-JSON. הגב רק עם JSON תקין הכולל מערך 'אימונים' או 'workouts'."
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

      // Fallback to predefined workouts if parsing fails
      try {
        const workoutProgram = JSON.parse(content);
        console.log('Successfully parsed OpenAI response');
        
        // Validate the response structure and ensure Hebrew output
        if (!workoutProgram.workouts && !workoutProgram.אימונים) {
          console.error('Invalid response structure from OpenAI, missing workouts array:', workoutProgram);
          
          // Try to fix the structure - if there's any array that might be the workouts
          const possibleWorkoutsArrays = Object.values(workoutProgram).filter(val => Array.isArray(val));
          if (possibleWorkoutsArrays.length > 0) {
            // Use the first array found as workouts
            workoutProgram.אימונים = possibleWorkoutsArrays[0];
          } else {
            throw new Error('Invalid response structure: No workouts array found');
          }
        }
        
        // Ensure we have a Hebrew-named array
        if (workoutProgram.workouts && !workoutProgram.אימונים) {
          workoutProgram.אימונים = workoutProgram.workouts;
          delete workoutProgram.workouts;
        }
        
        // Transform any English field names to Hebrew for each workout
        const hebrewFieldMap = {
          'workoutNumber': 'מספר_אימון',
          'type': 'סוג',
          'title': 'כותרת',
          'equipment': 'ציוד',
          'exercises': 'תרגילים',
          'duration': 'משך',
          'intensity': 'עצימות',
          'workoutGoal': 'מטרת_אימון',
          'enhancedExercises': 'תרגילים_מורחבים',
          'restingTime': 'זמן_מנוחה'
        };
        
        // Type values translation
        const typeTranslation = {
          'aerobic': 'אירובי',
          'strength': 'כוח'
        };
        
        // Intensity values translation
        const intensityTranslation = {
          'easy': 'קל',
          'medium': 'בינוני',
          'hard': 'גבוה',
          'light': 'קל',
          'moderate': 'בינוני',
          'high': 'גבוה'
        };
        
        // Process each workout to ensure Hebrew fields and values
        if (workoutProgram.אימונים && Array.isArray(workoutProgram.אימונים)) {
          workoutProgram.אימונים = workoutProgram.אימונים.map((workout: any) => {
            const hebrewWorkout: any = {};
            
            // Transform field names to Hebrew
            Object.entries(workout).forEach(([key, value]) => {
              const hebrewKey = hebrewFieldMap[key as keyof typeof hebrewFieldMap] || key;
              let processedValue = value;
              
              // Special handling for type field - translate values if needed
              if (key === 'type' || key === 'סוג') {
                const englishType = String(value).toLowerCase();
                processedValue = typeTranslation[englishType as keyof typeof typeTranslation] || value;
              }
              
              // Special handling for intensity field - translate values if needed
              if (key === 'intensity' || key === 'עצימות') {
                const englishIntensity = String(value).toLowerCase();
                processedValue = intensityTranslation[englishIntensity as keyof typeof intensityTranslation] || value;
              }
              
              hebrewWorkout[hebrewKey] = processedValue;
            });
            
            // Process nested enhancedExercises array if it exists
            if (hebrewWorkout.תרגילים_מורחבים && Array.isArray(hebrewWorkout.תרגילים_מורחבים)) {
              hebrewWorkout.תרגילים_מורחבים = hebrewWorkout.תרגילים_מורחבים.map((exercise: any) => {
                const hebrewExercise: any = {};
                
                Object.entries(exercise).forEach(([key, value]) => {
                  const hebrewKey = hebrewFieldMap[key as keyof typeof hebrewFieldMap] || key;
                  hebrewExercise[hebrewKey] = value;
                });
                
                return hebrewExercise;
              });
            }
            
            return hebrewWorkout;
          });
        }
        
        console.log('Processed response to ensure Hebrew fields');
        return NextResponse.json(workoutProgram);
      } catch (jsonError) {
        console.error('Error parsing or processing OpenAI response:', jsonError, 'Content:', content);
        
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
          Math.min(Math.max(frequency, 2), 5) as 2 | 3 | 4 | 5,
          userAnswers.goal
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
        Math.min(Math.max(frequency, 2), 5) as 2 | 3 | 4 | 5,
        userAnswers.goal
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
          Math.min(Math.max(frequency, 2), 5) as 2 | 3 | 4 | 5,
          userAnswers.goal
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