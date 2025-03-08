import { FaRunning, FaDumbbell, FaSave } from 'react-icons/fa';
import { useState } from 'react';
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
}

const workoutSchedule: WorkoutDay[] = [
  {
    day: 'ראשון',
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
    day: 'שלישי',
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
    day: 'חמישי',
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
    day: 'שבת',
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
  }
];

export default function WeeklyWorkoutTemplate() {
  const { user } = useAuth();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

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
        schedule: workoutSchedule
      });
      toast.success('התוכנית נשמרה בהצלחה!');
      router.push('/');
    } catch (error) {
      console.error('Error saving workout program:', error);
      toast.error('אירעה שגיאה בשמירת התוכנית');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-3">
          תוכנית אימונים <span className="text-gradient">שבועית</span>
        </h1>
        <div className="w-24 h-1 bg-[#ff8714] mx-auto rounded-full"></div>
      </div>
      
      <div className="flex justify-end mb-6">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg text-white transition-all ${
            isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#ff8714] hover:bg-[#e67200]'
          }`}
        >
          <FaSave className="w-5 h-5" />
          <span>{isSaving ? 'שומר...' : 'שמור תוכנית'}</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {workoutSchedule.map((workout, index) => (
          <div 
            key={workout.day}
            className="bg-white rounded-xl shadow-md overflow-hidden border-2 border-gray-100 hover:border-[#ff8714] transition-all duration-300"
          >
            {/* Header */}
            <div className={`p-4 ${
              workout.type === 'aerobic' ? 'bg-blue-50' : 'bg-orange-50'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {workout.type === 'aerobic' ? (
                    <FaRunning className="w-5 h-5 text-blue-500" />
                  ) : (
                    <FaDumbbell className="w-5 h-5 text-orange-500" />
                  )}
                  <h3 className="font-bold text-lg">{`יום ${workout.day}`}</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  workout.intensity === 'קל' ? 'bg-green-100 text-green-700' :
                  workout.intensity === 'בינוני' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {workout.intensity}
                </span>
              </div>
              <p className="text-gray-600 mt-1">{workout.title}</p>
            </div>

            {/* Exercises */}
            <div className="p-4">
              <ul className="space-y-2">
                {workout.exercises.map((exercise, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff8714]"></span>
                    <span>{exercise}</span>
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