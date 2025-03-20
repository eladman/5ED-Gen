'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { getDocument, updateDocument } from '@/lib/firebase/firebaseUtils';
import { FaArrowRight, FaDumbbell, FaRunning, FaClock, FaArrowDown, FaArrowUp, FaChevronDown, FaChevronUp, FaBullseye } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface ExerciseVariation {
  easy: string;
  medium: string;
  hard: string;
}

interface EnhancedExercise {
  name: string;
  restingTime: string;
  variations: ExerciseVariation;
  formCues?: string;
  commonMistakes?: string;
  breathingPattern?: string;
  progressionMetrics?: string;
  sets?: number;
  reps?: number;
  duration?: number; // For running exercises (in minutes)
  pace?: string; // For continuous running (e.g., "5:30 min/km")
  intervals?: number; // For interval training
}

interface WorkoutDay {
  day: string;
  type: 'aerobic' | 'strength' | 'military';
  title: string;
  exercises: string[];
  duration: string;
  intensity: 'קל' | 'בינוני' | 'גבוה';
  workoutGoal?: string;
  enhancedExercises?: EnhancedExercise[];
  equipment?: string;
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

export default function WorkoutDetails() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [workout, setWorkout] = useState<WorkoutProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const [enhancingWorkout, setEnhancingWorkout] = useState<Record<number, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  
  // Add console.log for debugging
  useEffect(() => {
    console.log('Workout ID from params:', id);
  }, [id]);
  
  // Helper function to safely find enhanced exercise without causing undefined errors
  const safelyFindEnhancedExercise = (exercises: EnhancedExercise[] | undefined, exerciseName: string): EnhancedExercise | null => {
    if (!exercises || !Array.isArray(exercises) || exercises.length === 0 || !exerciseName) {
      return null;
    }
    
    // Try exact match
    let match = exercises.find(e => e && e.name && e.name === exerciseName);
    if (match) return match;
    
    // Try includes (with safe checks)
    match = exercises.find(e => {
      if (!e || !e.name) return false;
      return exerciseName.includes(e.name) || e.name.includes(exerciseName);
    });
    if (match) return match;
    
    // Try first word match
    match = exercises.find(e => {
      if (!e || !e.name) return false;
      const exerciseWords = exerciseName.split(' ');
      const enhancedWords = e.name.split(' ');
      return exerciseWords[0] && enhancedWords[0] && 
             exerciseWords[0].toLowerCase() === enhancedWords[0].toLowerCase();
    });
    if (match) return match;
    
    // Default to first exercise if all else fails
    return exercises[0] || null;
  };
  
  // Define weekDays array for the weekly schedule overview
  const weekDays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

  // Check if an exercise is a warmup or cooldown exercise
  const isWarmupOrCooldown = (exercise: string): boolean => {
    if (!exercise) return false;
    const lowerCaseExercise = exercise.toLowerCase();
    // More specific matching to avoid false positives
    return (
      lowerCaseExercise.includes('חימום') || 
      lowerCaseExercise.includes('שחרור') || 
      lowerCaseExercise.includes('מתיחות') ||
      lowerCaseExercise === 'warm up' ||
      lowerCaseExercise === 'warmup' ||
      lowerCaseExercise === 'warm-up' ||
      lowerCaseExercise === 'cool down' ||
      lowerCaseExercise === 'cooldown' ||
      lowerCaseExercise === 'cool-down' ||
      lowerCaseExercise === 'stretching' ||
      lowerCaseExercise === 'stretches'
    );
  };

  // Check if an exercise is a running exercise
  const isRunningExercise = (exercise: string): boolean => {
    if (!exercise) return false;
    const lowerCaseExercise = exercise.toLowerCase();
    return lowerCaseExercise.includes('ריצה') || 
           lowerCaseExercise.includes('ריצת') || 
           lowerCaseExercise.includes('אינטרוול') || 
           lowerCaseExercise.includes('interval') ||
           lowerCaseExercise.includes('run') ||
           lowerCaseExercise.includes('sprint');
  };

  // Check if a running exercise is interval-based
  const isIntervalRunning = (exercise: string): boolean => {
    if (!exercise) return false;
    const lowerCaseExercise = exercise.toLowerCase();
    return lowerCaseExercise.includes('אינטרוול') || 
           lowerCaseExercise.includes('interval') ||
           lowerCaseExercise.includes('הפוגות') ||
           lowerCaseExercise.includes('sprint');
  };

  // Translate resting time to Hebrew
  const translateRestingTime = (time: string): string => {
    // Replace English numbers with the same numbers
    let hebrewTime = time.replace(/(\d+)/g, '$1');
    
    // Replace common English time units with Hebrew
    hebrewTime = hebrewTime.replace(/seconds/gi, 'שניות')
                           .replace(/second/gi, 'שניות')
                           .replace(/minutes/gi, 'דקות')
                           .replace(/minute/gi, 'דקות')
                           .replace(/secs/gi, 'שניות')
                           .replace(/sec/gi, 'שניות')
                           .replace(/mins/gi, 'דקות')
                           .replace(/min/gi, 'דקות')
                           .replace(/between sets/gi, 'בין סטים')
                           .replace(/rest/gi, 'מנוחה');
    
    return hebrewTime;
  };

  // Translate common English exercise terms to Hebrew
  const translateToHebrew = (text: string): string => {
    if (!text) return text;
    
    // Common exercise terms dictionary
    const translations: Record<string, string> = {
      'push-up': 'שכיבות שמיכה',
      'push up': 'שכיבות שמיכה',
      'pushup': 'שכיבות שמיכה',
      'pull-up': 'מתח',
      'pull up': 'מתח',
      'pullup': 'מתח',
      'squat': 'סקוואט',
      'lunge': 'לאנג׳',
      'plank': 'פלאנק',
      'burpee': 'ברפי',
      'crunch': 'כפיפות בטן',
      'sit-up': 'כפיפות בטן',
      'sit up': 'כפיפות בטן',
      'situp': 'כפיפות בטן',
      'jumping jack': 'קפיצות פיסוק',
      'jumping jacks': 'קפיצות פיסוק',
      'mountain climber': 'הרים',
      'mountain climbers': 'הרים',
      'dip': 'שקיעות',
      'dips': 'שקיעות',
      'bench press': 'לחיצת חזה',
      'deadlift': 'מתים',
      'shoulder press': 'לחיצת כתפיים',
      'bicep curl': 'כפיפות מרפק',
      'bicep curls': 'כפיפות מרפק',
      'tricep extension': 'הרחקות טרייספס',
      'tricep extensions': 'הרחקות טרייספס',
      'leg raise': 'הרמות רגליים',
      'leg raises': 'הרמות רגליים',
      'russian twist': 'טוויסט רוסי',
      'russian twists': 'טוויסט רוסי',
      'sets': 'סטים',
      'set': 'סט',
      'reps': 'חזרות',
      'rep': 'חזרה',
      'repetitions': 'חזרות',
      'repetition': 'חזרה',
      'rest': 'מנוחה',
      'seconds': 'שניות',
      'second': 'שניות',
      'minutes': 'דקות',
      'minute': 'דקות',
      'easy': 'קל',
      'medium': 'בינוני',
      'hard': 'מאתגר',
      'beginner': 'מתחיל',
      'intermediate': 'בינוני',
      'advanced': 'מתקדם',
      'warmup': 'חימום',
      'warm-up': 'חימום',
      'warm up': 'חימום',
      'cooldown': 'שחרור',
      'cool-down': 'שחרור',
      'cool down': 'שחרור',
      'stretching': 'מתיחות',
      'stretch': 'מתיחה',
      'running': 'ריצה',
      'run': 'ריצה',
      'jogging': 'ריצה קלה',
      'jog': 'ריצה קלה',
      'walking': 'הליכה',
      'walk': 'הליכה',
      'sprint': 'ספרינט',
      'sprinting': 'ספרינט',
      'interval': 'אינטרוול',
      'intervals': 'אינטרוולים',
      'cardio': 'קרדיו',
      'strength': 'כוח',
      'endurance': 'סיבולת',
      'flexibility': 'גמישות',
      'balance': 'שיווי משקל',
      'core': 'ליבה',
      'upper body': 'פלג גוף עליון',
      'lower body': 'פלג גוף תחתון',
      'chest': 'חזה',
      'back': 'גב',
      'shoulders': 'כתפיים',
      'arms': 'זרועות',
      'legs': 'רגליים',
      'abs': 'בטן',
      'abdominals': 'שרירי בטן',
      'glutes': 'ישבן',
      'hamstrings': 'שרירי ירך אחוריים',
      'quads': 'שרירי ירך קדמיים',
      'quadriceps': 'שרירי ירך קדמיים',
      'calves': 'שוקיים',
      'biceps': 'שרירי זרוע קדמיים',
      'triceps': 'שרירי זרוע אחוריים',
      'between': 'בין',
      'with': 'עם',
      'and': 'ו',
      'or': 'או',
      'for': 'למשך',
      'each': 'כל',
      'side': 'צד',
      'sides': 'צדדים',
      'leg': 'רגל',
      'arm': 'זרוע',
      'hold': 'החזקה',
      'holding': 'החזקה',
      'repeat': 'חזור',
      'repeating': 'חזרה',
      'complete': 'השלם',
      'completing': 'השלמה',
      'perform': 'בצע',
      'performing': 'ביצוע',
      'do': 'בצע',
      'doing': 'ביצוע',
      'exercise': 'תרגיל',
      'exercises': 'תרגילים',
      'workout': 'אימון',
      'workouts': 'אימונים',
      'training': 'אימון',
      'program': 'תוכנית',
      'programs': 'תוכניות',
      'routine': 'שגרה',
      'routines': 'שגרות'
    };
    
    // Replace English terms with Hebrew equivalents
    let translatedText = text;
    
    // First replace full phrases (to avoid partial replacements)
    Object.entries(translations).forEach(([english, hebrew]) => {
      // Case insensitive replacement of whole words
      const regex = new RegExp(`\\b${english}\\b`, 'gi');
      translatedText = translatedText.replace(regex, hebrew);
    });
    
    return translatedText;
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

  // Get workout type colors
  const getWorkoutTypeColors = (type: 'aerobic' | 'strength' | 'military') => {
    if (type === 'aerobic') {
      return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: 'text-blue-500', darkBg: 'bg-blue-500' };
    } else if (type === 'strength') {
      return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: 'text-orange-500', darkBg: 'bg-orange-500' };
    } else {
      // Military type
      return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: 'text-green-500', darkBg: 'bg-green-500' };
    }
  };

  useEffect(() => {
    const fetchWorkout = async () => {
      if (!user || !id) {
        console.log('Missing user or id param:', { user: !!user, id });
        setLoading(false);
        return;
      }

      // Add timeout for the fetch operation
      const timeoutId = setTimeout(() => {
        if (loading) {
          console.log('Fetch operation timed out after 10 seconds');
          toast.error('בקשה לא הושלמה בזמן סביר, אנא נסה שוב');
          setLoading(false);
        }
      }, 10000); // 10 seconds timeout

      try {
        console.log('Fetching workout with ID:', id);
        const doc = await getDocument<Omit<WorkoutProgram, 'id'>>('workoutPrograms', id as string);
        console.log('Fetched document:', doc ? 'exists' : 'not found');
        
        // Clear timeout as data is fetched
        clearTimeout(timeoutId);
        
        if (!doc) {
          toast.error('לא נמצאה תוכנית אימון');
          setLoading(false);
          return;
        }
        
        if (doc.userId !== user.uid) {
          toast.error('אין לך הרשאה לצפות בתוכנית אימון זו');
          setLoading(false);
          return;
        }
        
        // Initialize workout data
        const workoutData = doc as WorkoutProgram;
        console.log('Workout data structure:', {
          hasSchedule: !!workoutData.schedule,
          isScheduleArray: Array.isArray(workoutData.schedule),
          scheduleLength: Array.isArray(workoutData.schedule) ? workoutData.schedule.length : 'N/A'
        });
        
        // Set basic workout data immediately to improve perceived performance
        setWorkout({
          ...workoutData,
          schedule: workoutData.schedule || []
        });
        
        // Ensure schedule exists and is an array before proceeding
        if (!workoutData.schedule || !Array.isArray(workoutData.schedule) || workoutData.schedule.length === 0) {
          workoutData.schedule = [];
          toast.error('תוכנית האימון חסרה או פגומה');
          setLoading(false);
          return;
        }
        
        // Auto-enhance all workouts on page load
        const enhancedSchedule = [...workoutData.schedule];
        
        // Process each workout day one at a time to avoid overwhelming the system
        for (let index = 0; index < enhancedSchedule.length; index++) {
          const day = enhancedSchedule[index];
          if (!day) {
            console.log('Skipping undefined workout day at index:', index);
            continue;
          }
          
          try {
            // Ensure day has an exercises array
            if (!day.exercises) {
              day.exercises = [];
            }
            
            if (!day.enhancedExercises) {
              try {
                setEnhancingWorkout(prev => ({ ...prev, [index]: true }));
                const enhancedData = await enhanceWorkout(day);
                
                // Ensure enhancedData has the expected structure
                if (!enhancedData || !enhancedData.enhancedExercises) {
                  console.log('Warning: Enhanced data has unexpected structure:', enhancedData);
                  // Create a minimal enhanced exercise array if missing
                  enhancedData.enhancedExercises = day.exercises.map(exercise => ({
                    name: exercise || '',
                    restingTime: '60 שניות',
                    variations: {
                      easy: 'גרסה קלה',
                      medium: 'גרסה בינונית',
                      hard: 'גרסה קשה'
                    }
                  }));
                }
                
                // Translate any English content in the enhanced data
                if (enhancedData.workoutGoal) {
                  enhancedData.workoutGoal = translateToHebrew(enhancedData.workoutGoal);
                }
                
                if (enhancedData.enhancedExercises) {
                  enhancedData.enhancedExercises = enhancedData.enhancedExercises.map((exercise: EnhancedExercise) => {
                    // Initialize default values for sets and reps
                    let exerciseWithParams = {
                      ...exercise,
                      name: translateToHebrew(exercise.name),
                      restingTime: translateRestingTime(exercise.restingTime),
                      variations: {
                        easy: translateToHebrew(exercise.variations.easy),
                        medium: translateToHebrew(exercise.variations.medium),
                        hard: translateToHebrew(exercise.variations.hard)
                      }
                    };

                    // Set default values for sets/reps or running parameters
                    if (isRunningExercise(exercise.name || "")) {
                      if (isIntervalRunning(exercise.name || "")) {
                        exerciseWithParams.intervals = 5; // Default 5 intervals
                      } else {
                        exerciseWithParams.duration = 20; // Default 20 minutes
                        exerciseWithParams.pace = "5:30"; // Default pace (min/km)
                      }
                    } else {
                      exerciseWithParams.sets = 3; // Default 3 sets
                      exerciseWithParams.reps = 10; // Default 10 reps
                    }

                    return exerciseWithParams;
                  });
                }
                
                enhancedSchedule[index] = {
                  ...enhancedSchedule[index],
                  workoutGoal: enhancedData.workoutGoal,
                  enhancedExercises: enhancedData.enhancedExercises,
                };
                
                // Update the UI with current progress to improve user experience
                setWorkout({
                  ...workoutData,
                  schedule: enhancedSchedule
                });
              } catch (error) {
                console.error('Error enhancing workout:', error);
              } finally {
                setEnhancingWorkout(prev => ({ ...prev, [index]: false }));
              }
            } else {
              // For existing enhanced exercises, make sure they have the sets/reps/running parameters
              // First check if all exercises in the day have enhanced versions
              const missingExercises = day.exercises
                .filter(exercise => !isWarmupOrCooldown(exercise)) // Skip warm-ups
                .filter(exercise => !day.enhancedExercises!.some(e => 
                  e.name === exercise || 
                  exercise.includes(e.name) || 
                  e.name.includes(exercise)));
              
              // If we found exercises without enhanced versions, create them
              if (missingExercises.length > 0) {
                console.log('Found missing exercises:', missingExercises);
                
                missingExercises.forEach(exerciseName => {
                  // Create a basic enhanced exercise object
                  const newEnhancedExercise: EnhancedExercise = {
                    name: exerciseName,
                    restingTime: "60 שניות",
                    variations: {
                      easy: "גרסה קלה של התרגיל",
                      medium: "גרסה בינונית של התרגיל",
                      hard: "גרסה קשה של התרגיל"
                    },
                    sets: 3,
                    reps: 10
                  };
                  
                  // Add to enhanced exercises array
                  if (!day.enhancedExercises) {
                    day.enhancedExercises = [];
                  }
                  day.enhancedExercises.push(newEnhancedExercise);
                });
              }

              // Now update all enhanced exercises with proper parameters
              day.enhancedExercises!.forEach((exercise, i) => {
                if (isRunningExercise(exercise.name)) {
                  if (isIntervalRunning(exercise.name)) {
                    if (!exercise.intervals) day.enhancedExercises![i].intervals = 5;
                  } else {
                    if (!exercise.duration) day.enhancedExercises![i].duration = 20;
                    if (!exercise.pace) day.enhancedExercises![i].pace = "5:30";
                  }
                } else {
                  if (!exercise.sets) day.enhancedExercises![i].sets = 3;
                  if (!exercise.reps) day.enhancedExercises![i].reps = 10;
                }
              });
            }
          } catch (error) {
            console.error('Error processing workout day:', error);
          }
        }
        
        // Final update with all enhancements
        setWorkout({
          ...workoutData,
          schedule: enhancedSchedule
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching workout:', error);
        // Log more detailed error information
        if (error instanceof Error) {
          console.error('Error details:', error.message);
        }
        toast.error('אירעה שגיאה בטעינת תוכנית האימון');
        setLoading(false);
      }
    };

    fetchWorkout();
  }, [user, id, router]);

  const enhanceWorkout = async (workoutDay: WorkoutDay) => {
    // Add local timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 5000); // 5 seconds timeout for enhancement API call
    
    try {
      const response = await fetch('/api/openai/enhance-workout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workout: workoutDay }),
        signal: controller.signal
      });

      // Clear the timeout as we got a response
      clearTimeout(timeoutId);

      // Handle timeout errors
      if (response.status === 504) {
        console.error('Request timed out');
        throw new Error('בקשה לשרת נכשלה בגלל זמן תגובה ארוך.');
      }

      if (!response.ok) {
        const errorData = await response.json();
        
        // Check for API key errors
        if (errorData.error && (
            errorData.error.includes('API key') || 
            errorData.error.includes('authentication') || 
            errorData.message?.includes('API key') ||
            errorData.message?.includes('authentication')
          )) {
          console.error('OpenAI API key error:', errorData);
          throw new Error('שגיאת אימות מול שרת ה-AI. אנא פנה למנהל המערכת.');
        }
        
        throw new Error(errorData.message || errorData.error || 'Failed to enhance workout details');
      }

      const data = await response.json();
      
      // Validate response structure and provide defaults if needed
      if (!data.workoutGoal) {
        data.workoutGoal = "שיפור כושר כללי וחיזוק שרירים.";
      }
      
      if (!data.enhancedExercises || !Array.isArray(data.enhancedExercises) || data.enhancedExercises.length === 0) {
        console.error('Invalid response format:', data);
        
        // Create default enhanced exercises if missing
        data.enhancedExercises = workoutDay.exercises.map(exercise => ({
          name: exercise || '',
          restingTime: '60 שניות',
          variations: {
            easy: 'גרסה קלה',
            medium: 'גרסה בינונית',
            hard: 'גרסה קשה'
          }
        }));
      }
      
      return data;
    } catch (error: any) {
      // Handle AbortError specifically
      if (error.name === 'AbortError') {
        console.error('Request aborted due to timeout');
        
        // Return fallback data instead of failing
        return {
          workoutGoal: "שיפור כושר כללי וחיזוק שרירים.",
          enhancedExercises: workoutDay.exercises.map(exercise => ({
            name: exercise || '',
            restingTime: '60 שניות',
            variations: {
              easy: 'גרסה קלה',
              medium: 'גרסה בינונית',
              hard: 'גרסה קשה'
            }
          }))
        };
      }
      
      // Re-throw the error to be handled by the caller
      throw error;
    }
  };

  // Add a function to handle refresh attempts for better user experience
  const handleRefreshAttempt = () => {
    setLoading(true);
    // Reload the page to restart the fetch process
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="container-custom pt-32 flex flex-col justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff8714] mb-4"></div>
        <p className="text-gray-600 mb-2">טוען תוכנית אימון...</p>
        <p className="text-gray-500 text-sm text-center max-w-md">
          אנו מעבדים את תוכנית האימון שלך, פעולה זו עשויה להימשך מספר שניות
        </p>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="container-custom pt-32 flex flex-col justify-center items-center min-h-[400px]">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-4">לא ניתן להציג את תוכנית האימון</h2>
          <p className="text-gray-600 mb-8">התרחשה שגיאה בטעינת התוכנית או שהתוכנית אינה קיימת.</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push('/programs')}
              className="px-6 py-3 bg-[#ff8714] text-white rounded-lg hover:bg-[#e67200] transition-colors"
            >
              חזור לתוכניות האימון
            </button>
            <button
              onClick={handleRefreshAttempt}
              className="px-6 py-3 bg-white border-2 border-[#ff8714] text-[#ff8714] rounded-lg hover:bg-[#fff8f1] transition-colors"
            >
              נסה שוב
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header Section */}
      <div className="relative mb-12 overflow-hidden rounded-2xl bg-gradient-to-r from-[#ff8714] to-[#e67200] py-10 px-8 shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 -mr-20 -mt-20 rounded-full opacity-20 bg-white"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 -ml-20 -mb-20 rounded-full opacity-10 bg-white"></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-white">
            תוכנית אימונים <span className="text-white">שבועית</span>
          </h1>
          <div className="w-24 h-1 bg-white rounded-full mb-4"></div>
          <p className="text-white/90 max-w-2xl">
            תוכנית אימונים מותאמת אישית שנבנתה במיוחד עבורך, בהתאם ליכולות ולמטרות שלך.
          </p>
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={() => router.push('/programs')}
          className="flex items-center gap-2 px-6 py-3 rounded-lg text-white transition-all bg-[#ff8714] hover:bg-[#e67200] shadow-md"
        >
          <FaArrowRight className="w-5 h-5" />
          <span>חזור לתוכניות</span>
        </button>
        
        {isSaving && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-md border border-green-200">
            <div className="w-4 h-4 border-2 border-t-green-500 border-r-green-500 border-b-green-200 border-l-green-200 rounded-full animate-spin"></div>
            <span>שומר שינויים...</span>
          </div>
        )}
      </div>

      {/* User Profile Card */}
      {workout && workout.userAnswers && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-10 border border-gray-200">
          <div className="p-0">
            <div className="flex items-center bg-gradient-to-r from-[#ff8714] to-[#e67200] p-6">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mr-5">
                <FaBullseye className="text-white w-7 h-7" />
              </div>
              <div>
                <h2 className="text-lg text-white/80 font-medium mb-1">מטרת התוכנית</h2>
                <h3 className="text-2xl font-bold text-white">
                  {workout.userAnswers.goal === 'army' 
                    ? 'הכנה לצבא' 
                    : workout.userAnswers.goal === 'aerobic' 
                      ? 'שיפור יכולת אירובית' 
                      : workout.userAnswers.goal === 'strength' 
                        ? 'חיזוק ובניית שרירים' 
                        : workout.userAnswers.goal === 'weight' 
                          ? 'ירידה במשקל' 
                          : workout.userAnswers.goal || 'שיפור כושר כללי'}
                </h3>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Workout Cards */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6">תוכנית האימונים המפורטת</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {Array.isArray(workout.schedule) && workout.schedule.length > 0 ? (
          workout.schedule.map((workoutDay, index) => {
            if (!workoutDay) return null; // Skip undefined workout days
            
            const colors = getWorkoutTypeColors(workoutDay.type || 'strength');
            
            return (
              <div 
                key={index}
                className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300"
              >
                {/* Header */}
                <div className={`relative p-6 bg-gradient-to-r from-[#ff8714] to-[#e67200]`}>
                  <div className="absolute top-0 right-0 w-32 h-32 -mr-10 -mt-10 rounded-full opacity-20 bg-white"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          {workoutDay.type === 'aerobic' ? (
                            <FaRunning className="w-6 h-6 text-white" />
                          ) : workoutDay.type === 'strength' ? (
                            <FaDumbbell className="w-6 h-6 text-white" />
                          ) : (
                            <FaBullseye className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-xl text-white">{translateToHebrew(workoutDay.title || '')}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-white/80 text-sm">אימון {index + 1}</span>
                            <span className="w-1 h-1 rounded-full bg-white/60"></span>
                            <span className="text-white/80 text-sm">{workoutDay.duration || '45 דקות'}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                        workoutDay.intensity === 'קל' 
                          ? 'bg-green-100 text-green-800' 
                          : workoutDay.intensity === 'בינוני' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {workoutDay.intensity || 'בינוני'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Workout Goal */}
                {enhancingWorkout[index] ? (
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ) : workoutDay.workoutGoal && (
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-start gap-2">
                      <FaBullseye className="w-5 h-5 text-[#ff8714] mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-bold text-gray-800 text-sm">מטרת האימון:</h4>
                        <p className="text-gray-700 text-sm mt-1">{workoutDay.workoutGoal}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Exercises List */}
                <div className="p-6">
                  <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#fff5eb] text-[#ff8714] flex items-center justify-center text-sm">
                      {Array.isArray(workoutDay.exercises) ? 
                        workoutDay.exercises.filter(ex => ex && !isWarmupOrCooldown(ex)).length : 0}
                    </span>
                    <span>תרגילים</span>
                  </h4>
                  
                  <ul className="space-y-4">
                    {Array.isArray(workoutDay.exercises) && workoutDay.exercises
                      .filter(exercise => exercise && !isWarmupOrCooldown(exercise))
                      .map((exercise, i) => {
                        // Get the full exercise name for matching
                        const exerciseName = exercise;
                        // Find the matching enhanced exercise
                        const enhancedExercise = safelyFindEnhancedExercise(workoutDay.enhancedExercises, exerciseName);
                        
                        return (
                          <li key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                            {/* Exercise Header */}
                            <div 
                              className="p-4 bg-[#fff5eb] flex justify-between items-center hover:bg-[#ffefe0] transition-colors"
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-[#ff8714] text-white flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                                  {i + 1}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-800">{typeof exercise === 'string' ? exercise : JSON.stringify(exercise)}</p>
                                </div>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                  </ul>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-1 md:col-span-2 text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600 mb-4">לא נמצאו אימונים בתוכנית זו</p>
            <button
              onClick={() => router.push('/programs')}
              className="px-6 py-3 bg-[#ff8714] text-white rounded-lg hover:bg-[#e67200] transition-colors"
            >
              חזור לתוכניות
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 