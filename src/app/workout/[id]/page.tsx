'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { getDocument } from '@/lib/firebase/firebaseUtils';
import { FaArrowRight, FaDumbbell, FaRunning } from 'react-icons/fa';

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

export default function WorkoutDetails() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [workout, setWorkout] = useState<WorkoutProgram | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkout = async () => {
      if (!user || !id) return;

      try {
        const doc = await getDocument<Omit<WorkoutProgram, 'id'>>('workoutPrograms', id as string);
        if (!doc || doc.userId !== user.uid) {
          router.push('/');
          return;
        }
        setWorkout(doc as WorkoutProgram);
      } catch (error) {
        console.error('Error fetching workout:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkout();
  }, [user, id, router]);

  if (loading) {
    return (
      <div className="container-custom pt-32 flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff8714]"></div>
      </div>
    );
  }

  if (!workout) {
    return null;
  }

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
          onClick={() => router.push('/')}
          className="flex items-center gap-2 px-6 py-3 rounded-lg text-white transition-all bg-[#ff8714] hover:bg-[#e67200]"
        >
          <FaArrowRight className="w-5 h-5" />
          <span>חזור לתוכניות</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {workout.schedule.map((day) => (
          <div 
            key={day.day}
            className="bg-white rounded-xl shadow-md overflow-hidden border-2 border-gray-100 hover:border-[#ff8714] transition-all duration-300"
          >
            {/* Header */}
            <div className={`p-4 ${
              day.type === 'aerobic' ? 'bg-blue-50' : 'bg-orange-50'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {day.type === 'aerobic' ? (
                    <FaRunning className="w-5 h-5 text-blue-500" />
                  ) : (
                    <FaDumbbell className="w-5 h-5 text-orange-500" />
                  )}
                  <h3 className="font-bold text-lg">{`יום ${day.day}`}</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  day.intensity === 'קל' ? 'bg-green-100 text-green-700' :
                  day.intensity === 'בינוני' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {day.intensity}
                </span>
              </div>
              <p className="text-gray-600 mt-1">{day.title}</p>
            </div>

            {/* Exercises */}
            <div className="p-4">
              <ul className="space-y-2">
                {day.exercises.map((exercise, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff8714]"></span>
                    <span>{exercise}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-600">
                <span>משך האימון:</span>
                <span>{day.duration}</span>
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