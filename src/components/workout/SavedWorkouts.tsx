'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { getDocuments, deleteDocument } from '@/lib/firebase/firebaseUtils';
import { FaRunning, FaDumbbell, FaTrash, FaBullseye } from 'react-icons/fa';
import toast from 'react-hot-toast';

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
  goal?: string;
}

interface WorkoutProgram {
  id: string;
  userId: string;
  createdAt: string;
  schedule: WorkoutDay[];
  userAnswers: UserAnswers;
  answersId: string;
}

export default function SavedWorkouts() {
  const router = useRouter();
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<WorkoutProgram[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkouts = async () => {
      if (!user) return;
      
      try {
        const docs = await getDocuments<Omit<WorkoutProgram, 'id'>>('workoutPrograms');
        const userWorkouts = docs.filter(doc => doc.userId === user.uid);
        setWorkouts(userWorkouts);
      } catch (error) {
        console.error('Error fetching workouts:', error);
        toast.error('אירעה שגיאה בטעינת תוכניות האימון');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, [user]);

  const handleDelete = async (workoutId: string) => {
    try {
      const loadingToast = toast.loading('מוחק תוכנית אימון...') as string;
      
      // Delete from Firebase
      await deleteDocument('workoutPrograms', workoutId);
      
      // Update local state
      setWorkouts(prev => prev.filter(workout => workout.id !== workoutId));
      
      toast.success('תוכנית האימון נמחקה בהצלחה!', { id: loadingToast });
    } catch (error) {
      console.error('Error deleting workout:', error);
      toast.error('אירעה שגיאה במחיקת תוכנית האימון');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff8714]"></div>
      </div>
    );
  }

  if (workouts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">עדיין אין תוכניות אימון שמורות</p>
        <button
          onClick={() => router.push('/create-program')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#ff8714] text-white rounded-lg hover:bg-[#e67200] transition-colors"
        >
          <span>צור תוכנית חדשה</span>
        </button>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getGroupLabel = (group: string) => {
    const groups = {
      youth: 'נוער (15-18)',
      teens: 'נערים (12-14)',
      children: 'ילדים (8-11)'
    };
    return groups[group as keyof typeof groups] || group;
  };

  const getExperienceLabel = (level: string) => {
    const levels = {
      '0-4months': 'עד 4 חודשים',
      'upto1year': 'עד שנה',
      '1-2years': 'שנה-שנתיים',
      '2-3years': 'שנתיים-שלוש',
      '3plusYears': 'שלוש שנים +'
    };
    return levels[level as keyof typeof levels] || level;
  };

  return (
    <div className="grid grid-cols-1 gap-8">
      {workouts.map((workout) => (
        <div key={workout.id} className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-gray-100 hover:border-[#ff8714] transition-all duration-300">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold mb-2">תוכנית אימונים</h3>
                <p className="text-gray-600">{formatDate(workout.createdAt)}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/workout/${workout.id}`)}
                  className="px-4 py-2 bg-[#ff8714] text-white rounded-lg hover:bg-[#e67200] transition-colors"
                >
                  צפה בתוכנית
                </button>
                <button
                  onClick={() => handleDelete(workout.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <FaTrash className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#fff5eb] to-white rounded-lg p-5 mb-4 border border-[#ffead3]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#ff8714] rounded-full flex items-center justify-center flex-shrink-0">
                  <FaBullseye className="text-white w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">מטרת התוכנית</h4>
                  <p className="font-medium text-gray-700">
                    {workout.userAnswers.goal === 'army' 
                      ? 'הכנה לצבא' 
                      : workout.userAnswers.goal === 'aerobic' 
                        ? 'שיפור יכולת אירובית' 
                        : workout.userAnswers.goal === 'strength' 
                          ? 'חיזוק ובניית שרירים' 
                          : workout.userAnswers.goal === 'weight' 
                            ? 'ירידה במשקל' 
                            : workout.userAnswers.goal || 'שיפור כושר כללי'}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(() => {
                if (!workout.schedule || !Array.isArray(workout.schedule) || workout.schedule.length === 0) {
                  return (
                    <div className="col-span-2 text-center py-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-600">אין ימי אימון מוגדרים בתוכנית זו</p>
                    </div>
                  );
                }
                
                const scheduleArray = Array.isArray(workout.schedule) ? workout.schedule : [];
                const displayCount = Math.min(2, scheduleArray.length);
                const workoutsToDisplay = [];
                
                for (let i = 0; i < displayCount; i++) {
                  const day = scheduleArray[i];
                  workoutsToDisplay.push(
                    <div 
                      key={`workout-${workout.id}-day-${i}`}
                      className={`rounded-lg p-4 ${day.type === 'aerobic' ? 'bg-blue-50' : 'bg-orange-50'}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {day.type === 'aerobic' ? (
                          <FaRunning className="w-4 h-4 text-blue-500" />
                        ) : (
                          <FaDumbbell className="w-4 h-4 text-orange-500" />
                        )}
                        <h5 className="font-semibold">{`אימון ${i + 1} - ${day.title}`}</h5>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-sm text-gray-600">{day.duration}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          day.intensity === 'קל' ? 'bg-green-100 text-green-700' :
                          day.intensity === 'בינוני' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {day.intensity}
                        </span>
                      </div>
                    </div>
                  );
                }
                
                return workoutsToDisplay;
              })()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 