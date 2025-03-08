'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { getDocuments, deleteDocument } from '@/lib/firebase/firebaseUtils';
import { FaCalendarAlt, FaRunning, FaDumbbell, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface WorkoutDay {
  day: string;
  type: 'aerobic' | 'strength';
  title: string;
  exercises: string[];
  duration: string;
  intensity: 'קל' | 'בינוני' | 'גבוה';
}

interface WorkoutProgram {
  id: string;
  userId: string;
  createdAt: string;
  schedule: WorkoutDay[];
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

  if (!workouts.length) {
    return (
      <div className="text-center py-12">
        <FaCalendarAlt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">אין תוכניות אימון שמורות</h3>
        <p className="text-gray-500">צור תוכנית אימון חדשה כדי להתחיל</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {workouts.map((workout) => (
        <div
          key={workout.id}
          className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="w-6 h-6 text-[#ff8714]" />
              <span className="text-sm text-gray-500">
                {new Date(workout.createdAt).toLocaleDateString('he-IL')}
              </span>
            </div>
            <button
              onClick={() => handleDelete(workout.id)}
              className="text-red-500 hover:text-red-600 transition-colors p-2"
              title="מחק תוכנית"
            >
              <FaTrash className="w-4 h-4" />
            </button>
          </div>
          
          <h3 className="text-lg font-semibold mb-4">תוכנית אימונים שבועית</h3>
          
          <div className="space-y-3">
            {workout.schedule.map((day) => (
              <div key={day.day} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {day.type === 'aerobic' ? (
                    <FaRunning className="w-4 h-4 text-blue-500" />
                  ) : (
                    <FaDumbbell className="w-4 h-4 text-orange-500" />
                  )}
                  <span className="font-medium">{day.day}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    day.intensity === 'קל' ? 'bg-green-100 text-green-700' :
                    day.intensity === 'בינוני' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {day.intensity}
                  </span>
                  <span className="text-gray-500">{day.duration}</span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => router.push(`/workout/${workout.id}`)}
            className="mt-4 w-full bg-[#fff5eb] text-[#ff8714] py-2 rounded-lg font-medium hover:bg-[#ffe4cc] transition-colors"
          >
            צפה בתוכנית
          </button>
        </div>
      ))}
    </div>
  );
} 