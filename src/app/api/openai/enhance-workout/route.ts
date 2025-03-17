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

    const prompt = `בקשה בעברית - פירוט אימון - יש להשיב בעברית בלבד!
    שדרג את האימון הבא עם מידע מקצועי ומפורט:
    - אימון: ${JSON.stringify(workout)}
    
    חשוב מאוד: התשובה כולה חייבת להיות בעברית בלבד כולל כל שמות השדות והערכים.

    נא לספק את השדרוגים המקיפים הבאים:
    
    1. מטרת אימון ספציפית, מבוססת מדעית המסבירה:
       - המטרה הפיזיולוגית העיקרית של אימון זה
       - היתרונות והסתגלויות הכושר הספציפיים שהוא מכוון אליהם
       - כיצד הוא תורם להתפתחות אתלטית כוללת
       - תוצאות צפויות עם אימון עקבי
    
    2. עבור כל תרגיל, ספק:
       - זמן מנוחה מומלץ מדויק בין סטים (בהתבסס על עצימות וסוג התרגיל)
       - הנחיות טכניקה מפורטות והוראות צורה להבטחת ביצוע נכון
       - טעויות נפוצות שיש להימנע מהן וכיצד לתקן אותן
       - מדדי התקדמות למעקב אחר שיפור
    
    3. עבור כל תרגיל, ספק שלוש וריאציות נבדלות:
       - קל: גרסה מפושטת עם התאמות ספציפיות למתחילים או בעלי מגבלות
       - בינוני: הגרסה הסטנדרטית עם הנחיות צורה וביצוע נכונים
       - קשה: וריאציה מתקדמת עם אלמנטי התקדמות ספציפיים לספורטאים מנוסים
    
    4. תובנות מקצועיות נוספות:
       - דפוסי נשימה אופטימליים לכל תרגיל
       - רמזי חיבור מוח-שריר
       - המלצות התאוששות
       - אינדיקטורים לביצוע למעקב אחר התקדמות
    
    פרמט את התשובה כאובייקט JSON עם המבנה הבא (הכל בעברית):
    {
      "מטרת_אימון": "תיאור מפורט של מטרת האימון, היתרונות והתוצאות הצפויות",
      "תרגילים_מורחבים": [
        {
          "שם": "שם התרגיל המקורי",
          "זמן_מנוחה": "המלצת מנוחה מדויקת (למשל, '30-45 שניות להיפרטרופיה', '2-3 דקות לכוח')",
          "הנחיות_צורה": "הוראות טכניקה מפורטות והנחיות צורה נכונה",
          "טעויות_נפוצות": "טעויות נפוצות וכיצד לתקן אותן",
          "דפוס_נשימה": "טכניקת נשימה אופטימלית לתרגיל זה",
          "מדדי_התקדמות": "כיצד למדוד שיפור בתרגיל זה",
          "וריאציות": {
            "קל": "תיאור מפורט של וריאציה קלה יותר עם התאמות ספציפיות",
            "בינוני": "תיאור מפורט של וריאציה סטנדרטית עם הנחיות ביצוע נכונות",
            "קשה": "תיאור מפורט של וריאציה מתקדמת עם אלמנטי התקדמות ספציפיים"
          }
        }
      ]
    }
    
    חשוב מאוד: כל הטקסט בתשובה חייב להיות בעברית בלבד, כולל כל שמות השדות והערכים.`;

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
        
        // Transform Hebrew field names if they're in English
        const hebrewFieldMap = {
          'workoutGoal': 'מטרת_אימון',
          'enhancedExercises': 'תרגילים_מורחבים',
          'name': 'שם',
          'restingTime': 'זמן_מנוחה',
          'formCues': 'הנחיות_צורה',
          'commonMistakes': 'טעויות_נפוצות',
          'breathingPattern': 'דפוס_נשימה',
          'progressionMetrics': 'מדדי_התקדמות',
          'variations': 'וריאציות',
          'easy': 'קל',
          'medium': 'בינוני',
          'hard': 'קשה'
        };
        
        // Process the workoutGoal field to ensure Hebrew
        if (enhancedWorkout.workoutGoal && !enhancedWorkout.מטרת_אימון) {
          enhancedWorkout.מטרת_אימון = enhancedWorkout.workoutGoal;
          delete enhancedWorkout.workoutGoal;
        }
        
        // Process the enhancedExercises array to ensure Hebrew field names
        if (enhancedWorkout.enhancedExercises && !enhancedWorkout.תרגילים_מורחבים) {
          enhancedWorkout.תרגילים_מורחבים = enhancedWorkout.enhancedExercises;
          delete enhancedWorkout.enhancedExercises;
        }
        
        // Process each exercise to ensure Hebrew fields
        if (enhancedWorkout.תרגילים_מורחבים && Array.isArray(enhancedWorkout.תרגילים_מורחבים)) {
          enhancedWorkout.תרגילים_מורחבים = enhancedWorkout.תרגילים_מורחבים.map((exercise: any) => {
            const hebrewExercise: any = {};
            
            Object.entries(exercise).forEach(([key, value]) => {
              const hebrewKey = hebrewFieldMap[key as keyof typeof hebrewFieldMap] || key;
              
              // If this is the variations object, process its fields too
              if (key === 'variations' || key === 'וריאציות') {
                const variations = value as Record<string, any>;
                const hebrewVariations: Record<string, any> = {};
                
                Object.entries(variations).forEach(([varKey, varValue]) => {
                  const hebrewVarKey = hebrewFieldMap[varKey as keyof typeof hebrewFieldMap] || varKey;
                  hebrewVariations[hebrewVarKey] = varValue;
                });
                
                hebrewExercise[hebrewKey] = hebrewVariations;
              } else {
                hebrewExercise[hebrewKey] = value;
              }
            });
            
            return hebrewExercise;
          });
        }
        
        console.log('Processed response to ensure Hebrew fields');
        return NextResponse.json(enhancedWorkout);
      } catch (jsonError) {
        console.error('Error parsing or processing OpenAI response:', jsonError, 'Content:', content);
        
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