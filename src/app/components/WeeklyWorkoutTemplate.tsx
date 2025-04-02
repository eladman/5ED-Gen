import { FaRunning, FaDumbbell, FaSave, FaBullseye } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { addDocument } from '@/lib/firebase/firebaseUtils';
import { useAuth } from '@/lib/hooks/useAuth';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface WorkoutDay {
  day: string;
  type: 'aerobic' | 'strength' | 'military';
  title: string;
  exercises: string[];
  duration: string;
  intensity: string;
  equipment?: string;
  workoutGoal?: string;
}

interface UserAnswers {
  gender: 'male' | 'female';
  group: 'youth' | 'teens' | 'children';
  experienceLevel: '0-4months' | 'upto1year' | '1-2years' | '2-3years' | '3plusYears';
  threeKmTime: string;
  pullUps: number;
  goal: 'army' | 'aerobic' | 'strength' | 'other';
  workoutFrequency: 2 | 3 | 4 | 5;
}

interface WeeklyWorkoutTemplateProps {
  userAnswers: UserAnswers;
  answersId: string;
}

// Sample workout templates
const aerobicWorkouts: Omit<WorkoutDay, 'day'>[] = [
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

const strengthWorkouts: Omit<WorkoutDay, 'day'>[] = [
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
const militaryWorkouts: Omit<WorkoutDay, 'day'>[] = [
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
  }
];

const weekDays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

function generateWorkoutSchedule(frequency: 2 | 3 | 4 | 5, goal?: string): WorkoutDay[] {
  const schedule: WorkoutDay[] = [];

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

export default function WeeklyWorkoutTemplate({ userAnswers, answersId }: WeeklyWorkoutTemplateProps) {
  const [workoutSchedule, setWorkoutSchedule] = useState<WorkoutDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const generateWorkoutProgram = async (retryCount = 0, maxRetries = 3): Promise<void> => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/openai/generate-workout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userAnswers }),
        signal: AbortSignal.timeout(90000)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 504 || errorData?.error?.includes('timeout') || errorData?.error?.includes('aborted')) {
          console.error('Request timed out or aborted');
          if (retryCount < maxRetries) {
            toast.loading(`ניסיון נוסף... (${retryCount + 1}/${maxRetries + 1})`, { duration: 3000 });
            await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
            return generateWorkoutProgram(retryCount + 1, maxRetries);
          } else {
            toast.error('בקשה לשרת נכשלה בגלל זמן תגובה ארוך. אנא נסה שוב מאוחר יותר.');
            if (userAnswers.goal === 'army') {
              setWorkoutSchedule(generateWorkoutSchedule(userAnswers.workoutFrequency, 'army'));
              toast.success('נוצרה תוכנית אימונים בסיסית (ללא AI) כמוצא אחרון');
            } else {
              setWorkoutSchedule(generateWorkoutSchedule(userAnswers.workoutFrequency));
              toast.success('נוצרה תוכנית אימונים בסיסית (ללא AI) כמוצא אחרון');
            }
            setLoading(false);
            return;
          }
        }
        
        if (errorData.error && (
            errorData.error.includes('API key') || 
            errorData.error.includes('authentication') || 
            errorData.error.includes('401') ||
            errorData.error.includes('Incorrect API key') ||
            errorData.message?.includes('API key') ||
            errorData.message?.includes('authentication') ||
            errorData.details?.includes('API key')
          )) {
          console.error('OpenAI API key error:', errorData);
          toast.error('שגיאת אימות מול שרת ה-AI. אנא פנה למנהל המערכת לבדיקת מפתח ה-API.');
          setLoading(false);
          return;
        }
        
        throw new Error(errorData.message || errorData.error || 'אירעה שגיאה ביצירת תוכנית האימונים');
      }

      const data = await response.json();

      if (!data.workouts || !Array.isArray(data.workouts)) {
        throw new Error('Invalid response format from server');
      }

      setWorkoutSchedule(data.workouts);
      setLoading(false);
    } catch (error: any) {
      console.error('Error generating workout program:', error);
      toast.error(error.message || 'אירעה שגיאה ביצירת תוכנית האימונים');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userAnswers) {
      generateWorkoutProgram();
    }
  }, [userAnswers, generateWorkoutProgram]);

  const handleSave = async () => {
    if (!user) {
      toast.error('יש להתחבר כדי לשמור את התוכנית');
      return;
    }

    // Verify schedule is properly formatted before saving
    if (!workoutSchedule || !Array.isArray(workoutSchedule) || workoutSchedule.length === 0) {
      toast.error('תוכנית האימון ריקה או לא חוקית');
      return;
    }

    setSaving(true);
    try {
      await addDocument('workoutPrograms', {
        userId: user.uid,
        createdAt: new Date().toISOString(),
        schedule: workoutSchedule,
        userAnswers,
        answersId
      });
      
      toast.success('התוכנית נשמרה בהצלחה!');
      router.push('/programs');
    } catch (error) {
      console.error('Error saving workout program:', error);
      toast.error('אירעה שגיאה בשמירת התוכנית');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff8714]"></div>
        <p className="text-gray-600">יוצר תוכנית אימונים מותאמת אישית...</p>
        <p className="text-sm text-gray-500 text-center max-w-md mt-2">
          אנחנו משתמשים בבינה מלאכותית מתקדמת כדי ליצור תוכנית אימונים המותאמת במיוחד לצרכים ולמטרות שלך
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">תוכנית אימונים שבועית</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#ff8714] text-white rounded-lg hover:bg-[#e67200] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaSave className="w-5 h-5" />
          <span>{saving ? 'שומר...' : 'שמור תוכנית'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.isArray(workoutSchedule) && workoutSchedule.map((workout, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300"
          >
            {/* Card Header with Gradient Background */}
            <div className={`p-5 relative ${
              workout.type === 'aerobic' 
                ? 'bg-gradient-to-r from-[#ff8714] to-[#e67200]' 
                : workout.type === 'strength' 
                  ? 'bg-gradient-to-r from-[#ff8714] to-[#e67200]'
                  : 'bg-gradient-to-r from-[#ff8714] to-[#e67200]'
            }`}>
              <div className="absolute top-0 right-0 w-32 h-32 -mr-10 -mt-10 rounded-full opacity-20 bg-white"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      {workout.type === 'aerobic' ? (
                        <FaRunning className="w-6 h-6 text-white" />
                      ) : workout.type === 'strength' ? (
                        <FaDumbbell className="w-6 h-6 text-white" />
                      ) : (
                        <FaBullseye className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-white">{workout.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-white/80 text-sm">אימון {workout.day}</span>
                        <span className="w-1 h-1 rounded-full bg-white/60"></span>
                        <span className="text-white/80 text-sm">{workout.duration}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                    workout.intensity === 'קל' 
                      ? 'bg-green-100 text-green-800' 
                      : workout.intensity === 'בינוני' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {workout.intensity}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Workout Goal Section */}
            {workout.workoutGoal && (
              <div className="px-5 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-start gap-2">
                  <FaBullseye className="w-5 h-5 text-[#ff8714] mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm">מטרת האימון:</h4>
                    <p className="text-gray-700 text-sm mt-1">{workout.workoutGoal}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Equipment Section (if available) */}
            {workout.equipment && (
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">ציוד נדרש:</span>
                  <span className="text-sm text-gray-600">{workout.equipment}</span>
                </div>
              </div>
            )}

            {/* Exercises List */}
            <div className="p-5">
              <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#fff5eb] text-[#ff8714] flex items-center justify-center text-sm">{workout.exercises.length}</span>
                <span>תרגילים</span>
              </h4>
              <ul className="space-y-3">
                {workout.exercises.map((exercise, i) => (
                  <li key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#fff5eb] transition-colors">
                    <div className="w-6 h-6 rounded-full bg-[#fff5eb] text-[#ff8714] flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-gray-800">{typeof exercise === 'string' ? exercise : JSON.stringify(exercise)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-[#fff5eb] rounded-lg p-6">
        <h3 className="font-bold mb-4 text-gray-800">הערות חשובות:</h3>
        <ul className="space-y-2 text-gray-600">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff8714]"></span>
            <span>יש לבצע חימום לפני כל אימון ושחרור בסיומו</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff8714]"></span>
            <span>שתו מים לפני, במהלך ואחרי האימון</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff8714]"></span>
            <span>התאימו את העומסים והמשקלים ליכולתכם</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff8714]"></span>
            <span>במידה ומרגישים כאב או אי נוחות, יש להפסיק ולהתייעץ עם מאמן</span>
          </li>
        </ul>
      </div>
    </div>
  );
} 