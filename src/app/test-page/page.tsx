'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { getDocuments, updateDocument } from '@/lib/firebase/firebaseUtils';
import { toast } from 'react-hot-toast';

interface WorkoutDay {
  day: string;
  type: 'aerobic' | 'strength';
  title: string;
  exercises: string[];
  duration: string;
  intensity: 'קל' | 'בינוני' | 'גבוה';
  workoutGoal?: string;
}

interface WorkoutProgram {
  id: string;
  userId: string;
  createdAt: string;
  schedule: WorkoutDay[] | null | undefined;
  userAnswers: any;
  answersId: string;
}

export default function TestPage() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<WorkoutProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [fixing, setFixing] = useState(false);

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

  const fixWorkout = async (workout: WorkoutProgram) => {
    if (!user) return;

    try {
      setFixing(true);
      
      // Create default schedule if it doesn't exist or isn't an array
      const fixedSchedule = Array.isArray(workout.schedule) ? workout.schedule : [];
      
      // Update the workout in Firebase
      await updateDocument('workoutPrograms', workout.id, {
        schedule: fixedSchedule
      });
      
      toast.success('תוכנית האימון תוקנה בהצלחה');
      
      // Update local state
      setWorkouts(workouts.map(w => 
        w.id === workout.id ? {...w, schedule: fixedSchedule} : w
      ));
    } catch (error) {
      console.error('Error fixing workout:', error);
      toast.error('אירעה שגיאה בתיקון תוכנית האימון');
    } finally {
      setFixing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-8 mt-32">
        <h1 className="text-2xl font-bold mb-4">בדיקת תוכניות אימון</h1>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff8714]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 mt-32">
      <h1 className="text-2xl font-bold mb-4">בדיקת תוכניות אימון</h1>
      
      {workouts.length === 0 ? (
        <p>אין תוכניות אימון להצגה</p>
      ) : (
        <div className="space-y-6">
          <p className="mb-4">נמצאו {workouts.length} תוכניות אימון</p>
          
          {workouts.map((workout) => {
            const hasValidSchedule = workout.schedule && Array.isArray(workout.schedule);
            
            return (
              <div 
                key={workout.id} 
                className={`p-6 rounded-lg border ${hasValidSchedule ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
              >
                <h2 className="text-xl font-bold mb-2">תוכנית אימון {workout.id}</h2>
                <p className="text-sm text-gray-500 mb-4">נוצר בתאריך: {new Date(workout.createdAt).toLocaleDateString()}</p>
                
                <div className="space-y-2 mb-4">
                  <p>
                    <span className="font-semibold">מצב ה-schedule: </span>
                    {!workout.schedule ? (
                      <span className="text-red-600">חסר לגמרי</span>
                    ) : !Array.isArray(workout.schedule) ? (
                      <span className="text-red-600">קיים אבל לא מערך ({typeof workout.schedule})</span>
                    ) : (
                      <span className="text-green-600">תקין ({workout.schedule.length} אימונים)</span>
                    )}
                  </p>
                  
                  {hasValidSchedule && (
                    <div>
                      <p className="font-semibold">אימונים:</p>
                      <ul className="list-disc list-inside ml-4">
                        {workout.schedule && workout.schedule.map((day, i) => (
                          <li key={i}>{day.title} - {day.type} - {day.intensity}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                {!hasValidSchedule && (
                  <button
                    onClick={() => fixWorkout(workout)}
                    disabled={fixing}
                    className="px-4 py-2 bg-[#ff8714] text-white rounded-lg hover:bg-[#e67200] disabled:bg-gray-400"
                  >
                    {fixing ? 'מתקן...' : 'תקן תוכנית'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 