'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { getDocument } from '@/lib/firebase/firebaseUtils';
import { FaArrowRight, FaDumbbell, FaRunning, FaClock, FaArrowDown, FaArrowUp, FaChevronDown, FaChevronUp, FaBullseye } from 'react-icons/fa';

interface ExerciseVariation {
  easy: string;
  medium: string;
  hard: string;
}

interface EnhancedExercise {
  name: string;
  restingTime: string;
  variations: ExerciseVariation;
}

interface WorkoutDay {
  day: string;
  type: 'aerobic' | 'strength';
  title: string;
  exercises: string[];
  duration: string;
  intensity: 'קל' | 'בינוני' | 'גבוה';
  workoutGoal?: string;
  enhancedExercises?: EnhancedExercise[];
}

interface UserAnswers {
  gender: 'male' | 'female';
  group: 'youth' | 'teens' | 'children';
  experienceLevel: '0-4months' | 'upto1year' | '1-2years' | '2-3years' | '3plusYears';
  threeKmTime: string;
  pullUps: number;
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
  const [selectedVariations, setSelectedVariations] = useState<Record<string, 'easy' | 'medium' | 'hard'>>({});
  const [expandedExercises, setExpandedExercises] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchWorkout = async () => {
      if (!user || !id) return;

      try {
        const doc = await getDocument<Omit<WorkoutProgram, 'id'>>('workoutPrograms', id as string);
        if (!doc || doc.userId !== user.uid) {
          router.push('/');
          return;
        }
        
        // Initialize workout data
        const workoutData = doc as WorkoutProgram;
        
        // Auto-enhance all workouts on page load
        const enhancedSchedule = [...workoutData.schedule];
        const enhancementPromises = enhancedSchedule.map(async (day, index) => {
          if (!day.enhancedExercises) {
            try {
              setEnhancingWorkout(prev => ({ ...prev, [index]: true }));
              const enhancedData = await enhanceWorkout(day);
              
              // Translate any English content in the enhanced data
              if (enhancedData.workoutGoal) {
                enhancedData.workoutGoal = translateToHebrew(enhancedData.workoutGoal);
              }
              
              if (enhancedData.enhancedExercises) {
                enhancedData.enhancedExercises = enhancedData.enhancedExercises.map((exercise: EnhancedExercise) => ({
                  ...exercise,
                  name: translateToHebrew(exercise.name),
                  restingTime: translateRestingTime(exercise.restingTime),
                  variations: {
                    easy: translateToHebrew(exercise.variations.easy),
                    medium: translateToHebrew(exercise.variations.medium),
                    hard: translateToHebrew(exercise.variations.hard)
                  }
                }));
              }
              
              enhancedSchedule[index] = {
                ...enhancedSchedule[index],
                workoutGoal: enhancedData.workoutGoal,
                enhancedExercises: enhancedData.enhancedExercises,
              };
              
              // Initialize selected variations to 'medium' for all exercises
              enhancedData.enhancedExercises.forEach((exercise: EnhancedExercise) => {
                const key = `${index}-${exercise.name}`;
                setSelectedVariations(prev => ({
                  ...prev,
                  [key]: 'medium'
                }));
              });
            } catch (error) {
              console.error('Error enhancing workout:', error);
            } finally {
              setEnhancingWorkout(prev => ({ ...prev, [index]: false }));
            }
          }
        });
        
        await Promise.all(enhancementPromises);
        
        setWorkout({
          ...workoutData,
          schedule: enhancedSchedule
        });
      } catch (error) {
        console.error('Error fetching workout:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkout();
  }, [user, id, router]);

  const enhanceWorkout = async (workoutDay: WorkoutDay) => {
    try {
      const response = await fetch('/api/openai/enhance-workout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workout: workoutDay }),
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(30000) // 30 seconds timeout
      });

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
      
      // Validate response structure
      if (!data.workoutGoal || !data.enhancedExercises || !Array.isArray(data.enhancedExercises)) {
        console.error('Invalid response format:', data);
        throw new Error('התקבל פורמט לא תקין מהשרת');
      }
      
      return data;
    } catch (error: any) {
      // Handle AbortError specifically
      if (error.name === 'AbortError') {
        console.error('Request aborted due to timeout');
        throw new Error('בקשה לשרת נכשלה בגלל זמן תגובה ארוך.');
      }
      
      // Re-throw the error to be handled by the caller
      throw error;
    }
  };

  const toggleVariation = (workoutIndex: number, exerciseName: string, variation: 'easy' | 'medium' | 'hard') => {
    const key = `${workoutIndex}-${exerciseName}`;
    setSelectedVariations({
      ...selectedVariations,
      [key]: variation
    });
  };

  const toggleExerciseExpansion = (workoutIndex: number, exerciseName: string) => {
    const key = `${workoutIndex}-${exerciseName}`;
    setExpandedExercises(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Check if an exercise is a warmup or cooldown exercise
  const isWarmupOrCooldown = (exercise: string): boolean => {
    const lowerCaseExercise = exercise.toLowerCase();
    return lowerCaseExercise.includes('חימום') || 
           lowerCaseExercise.includes('שחרור') || 
           lowerCaseExercise.includes('מתיחות');
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
  const getWorkoutTypeColors = (type: 'aerobic' | 'strength') => {
    return type === 'aerobic' 
      ? { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: 'text-blue-500', darkBg: 'bg-blue-500' }
      : { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: 'text-orange-500', darkBg: 'bg-orange-500' };
  };

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
      
      <div className="flex justify-start mb-6">
        <button
          onClick={() => router.push('/programs')}
          className="flex items-center gap-2 px-6 py-3 rounded-lg text-white transition-all bg-[#ff8714] hover:bg-[#e67200]"
        >
          <FaArrowRight className="w-5 h-5" />
          <span>חזור לתוכניות</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">פרטי המתאמן</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <span className="text-gray-600">מין:</span>
              <p className="font-medium">{workout.userAnswers.gender === 'male' ? 'זכר' : 'נקבה'}</p>
            </div>
            <div>
              <span className="text-gray-600">קבוצת גיל:</span>
              <p className="font-medium">{getGroupLabel(workout.userAnswers.group)}</p>
            </div>
            <div>
              <span className="text-gray-600">ניסיון:</span>
              <p className="font-medium">{getExperienceLabel(workout.userAnswers.experienceLevel)}</p>
            </div>
            <div>
              <span className="text-gray-600">זמן ריצת 3 ק&quot;מ:</span>
              <p className="font-medium">{workout.userAnswers.threeKmTime}</p>
            </div>
            <div>
              <span className="text-gray-600">מספר עליות מתח:</span>
              <p className="font-medium">{workout.userAnswers.pullUps}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {workout.schedule.map((workoutDay, index) => {
          const colors = getWorkoutTypeColors(workoutDay.type);
          
          return (
            <div 
              key={workoutDay.day}
              className="bg-white rounded-xl shadow-md overflow-hidden border-2 border-gray-100 hover:border-[#ff8714] transition-all duration-300"
            >
              {/* Header */}
              <div className={`${colors.bg} p-5 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-20 ${colors.darkBg}"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-10 h-10 rounded-full ${colors.darkBg} flex items-center justify-center`}>
                        {workoutDay.type === 'aerobic' ? (
                          <FaRunning className="w-5 h-5 text-white" />
                        ) : (
                          <FaDumbbell className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div>
                        <h3 className={`font-bold text-lg ${colors.text}`}>{`אימון ${index + 1}`}</h3>
                        <p className="text-gray-600 text-sm">{translateToHebrew(workoutDay.title)}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      workoutDay.intensity === 'קל' ? 'bg-green-100 text-green-700' :
                      workoutDay.intensity === 'בינוני' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {workoutDay.intensity}
                    </span>
                  </div>
                  
                  {/* Workout Goal - Always visible */}
                  {enhancingWorkout[index] ? (
                    <div className={`mt-3 ${colors.bg} p-3 rounded-md ${colors.border} animate-pulse`}>
                      <p className={`${colors.text} text-sm`}>מעדכן פרטי אימון...</p>
                    </div>
                  ) : workoutDay.workoutGoal ? (
                    <div className={`mt-3 bg-white bg-opacity-70 p-3 rounded-md ${colors.border}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <FaBullseye className={colors.icon} />
                        <h4 className={`font-bold ${colors.text}`}>מטרת האימון:</h4>
                      </div>
                      <p className={`${colors.text} text-sm`}>{translateToHebrew(workoutDay.workoutGoal)}</p>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Exercises */}
              <div className="p-5">
                <ul className="space-y-4">
                  {workoutDay.exercises.map((exercise, i) => {
                    const enhancedExercise = workoutDay.enhancedExercises?.find(
                      (e) => e.name === exercise
                    );
                    
                    const translatedExercise = translateToHebrew(exercise);
                    const variationKey = `${index}-${exercise}`;
                    const selectedVariation = selectedVariations[variationKey] || 'medium';
                    const isExpanded = expandedExercises[variationKey] || false;
                    const isWarmupCooldown = isWarmupOrCooldown(exercise);
                    
                    return (
                      <li key={i} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                        <button 
                          onClick={() => !isWarmupCooldown && enhancedExercise ? toggleExerciseExpansion(index, exercise) : undefined}
                          className={`w-full flex items-center justify-between text-left ${!isWarmupCooldown && enhancedExercise ? 'cursor-pointer hover:bg-gray-50 p-2 -mx-2 rounded-md transition-colors' : 'cursor-default p-2 -mx-2'}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${colors.darkBg}`}></span>
                            <span className="font-medium">{translatedExercise}</span>
                          </div>
                          {!isWarmupCooldown && enhancedExercise && (
                            <span className={colors.icon}>
                              {isExpanded ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
                            </span>
                          )}
                        </button>
                        
                        {/* Exercise Details - Toggleable on click, only for non-warmup/cooldown exercises */}
                        {isExpanded && enhancedExercise && !isWarmupCooldown && (
                          <div className="mt-2 bg-gray-50 p-4 rounded-md text-sm">
                            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                              <FaClock className="text-gray-500" />
                              <span className="font-medium">זמן מנוחה: {translateRestingTime(enhancedExercise.restingTime)}</span>
                            </div>
                            
                            {/* Current selected variation */}
                            <div className="mb-2">
                              <div className="flex items-center justify-between mb-3">
                                <span className={`font-bold ${colors.text}`}>וריאציה נבחרת:</span>
                                <div className="flex gap-2">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleVariation(index, exercise, 'easy');
                                    }}
                                    className={`px-2 py-1 rounded text-xs ${selectedVariation === 'easy' 
                                      ? 'bg-green-500 text-white' 
                                      : 'bg-green-100 text-green-700'}`}
                                  >
                                    קל
                                  </button>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleVariation(index, exercise, 'medium');
                                    }}
                                    className={`px-2 py-1 rounded text-xs ${selectedVariation === 'medium' 
                                      ? 'bg-yellow-500 text-white' 
                                      : 'bg-yellow-100 text-yellow-700'}`}
                                  >
                                    בינוני
                                  </button>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleVariation(index, exercise, 'hard');
                                    }}
                                    className={`px-2 py-1 rounded text-xs ${selectedVariation === 'hard' 
                                      ? 'bg-red-500 text-white' 
                                      : 'bg-red-100 text-red-700'}`}
                                  >
                                    מאתגר
                                  </button>
                                </div>
                              </div>
                              <div className="p-3 bg-white rounded-md border border-gray-200">
                                <p>{enhancedExercise.variations && translateToHebrew(enhancedExercise.variations[selectedVariation])}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
                
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-600">
                  <span>משך האימון:</span>
                  <span className="font-medium">{workoutDay.duration}</span>
                </div>
              </div>
            </div>
          );
        })}
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