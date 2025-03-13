import { FaRunning, FaDumbbell, FaSave } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { addDocument } from '@/lib/firebase/firebaseUtils';
import { useAuth } from '@/lib/hooks/useAuth';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface WorkoutDay {
  day: string;
  type: 'aerobic' | 'strength';
  title: string;
  exercises: string[];
  duration: string;
  intensity: 'קל' | 'בינוני' | 'גבוה';
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

const weekDays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

function generateWorkoutSchedule(frequency: 2 | 3 | 4 | 5): WorkoutDay[] {
  const schedule: WorkoutDay[] = [];

  for (let i = 0; i < frequency; i++) {
    const isStrengthDay = i % 2 === 1;
    const workoutTemplates = isStrengthDay ? strengthWorkouts : aerobicWorkouts;
    const randomWorkout = workoutTemplates[Math.floor(Math.random() * workoutTemplates.length)];
    
    schedule.push({
      ...randomWorkout,
      day: (i + 1).toString()
    });
  }

  return schedule;
}

export default function WeeklyWorkoutTemplate({ userAnswers, answersId }: WeeklyWorkoutTemplateProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [workoutSchedule, setWorkoutSchedule] = useState<WorkoutDay[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateWorkoutProgram = async () => {
      try {
        const response = await fetch('/api/openai/generate-workout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userAnswers }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'אירעה שגיאה ביצירת תוכנית האימונים');
        }

        if (!data.workouts || !Array.isArray(data.workouts)) {
          throw new Error('התקבל פורמט לא תקין מהשרת');
        }

        setWorkoutSchedule(data.workouts);
      } catch (error: any) {
        console.error('Error:', error);
        setError(error.message || 'אירעה שגיאה ביצירת תוכנית האימונים');
        toast.error('לא ניתן ליצור תוכנית אימונים כרגע, אנא נסה שוב מאוחר יותר');
      } finally {
        setIsLoading(false);
      }
    };

    generateWorkoutProgram();
  }, [userAnswers]);

  const handleSave = async () => {
    if (!user) {
      toast.error('יש להתחבר כדי לשמור את התוכנית');
      return;
    }

    setIsSaving(true);
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
      setIsSaving(false);
    }
  };

  if (isLoading) {
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

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="mb-6">
          <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">שגיאה ביצירת תוכנית האימונים</h3>
          <p className="mt-2 text-red-500">{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-[#ff8714] text-white rounded-lg hover:bg-[#e67200] transition-colors"
        >
          נסה שוב
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">תוכנית אימונים שבועית</h2>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#ff8714] text-white rounded-lg hover:bg-[#e67200] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaSave className="w-5 h-5" />
          <span>{isSaving ? 'שומר...' : 'שמור תוכנית'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {workoutSchedule.map((workout, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-gray-100 hover:border-[#ff8714] transition-all duration-300"
          >
            <div className={`p-4 ${
              workout.type === 'aerobic' ? 'bg-blue-50' : 'bg-orange-50'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {workout.type === 'aerobic' ? (
                    <FaRunning className="w-5 h-5 text-blue-500" />
                  ) : (
                    <FaDumbbell className="w-5 h-5 text-orange-500" />
                  )}
                  <div>
                    <h3 className="font-bold">{workout.title}</h3>
                    <p className="text-sm text-gray-600">אימון {workout.day}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  workout.intensity === 'קל' ? 'bg-green-100 text-green-700' :
                  workout.intensity === 'בינוני' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {workout.intensity}
                </span>
              </div>
              
              {workout.workoutGoal && (
                <div className="mt-3 bg-blue-50 p-3 rounded-md border border-blue-100">
                  <h4 className="font-bold text-blue-800 mb-1">מטרת האימון:</h4>
                  <p className="text-blue-700 text-sm">{workout.workoutGoal}</p>
                </div>
              )}
            </div>

            <div className="p-4">
              <ul className="space-y-3">
                {workout.exercises.map((exercise, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff8714] mt-2"></span>
                    <span className="font-medium">{exercise}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-600">
                <span>משך האימון:</span>
                <span>{workout.duration}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="font-bold mb-4">הערות חשובות:</h3>
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