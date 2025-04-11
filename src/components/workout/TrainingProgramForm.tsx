'use client';

import { useState } from 'react';
import { FaMale, FaFemale, FaRunning, FaStopwatch, FaMedal, FaDumbbell } from 'react-icons/fa';
import { IoPeople } from 'react-icons/io5';
import { GiMuscleUp, GiHelmet, GiHeartBeats, GiWeightLiftingUp, GiStairsGoal, GiMilitaryAmbulance } from 'react-icons/gi';
import { WeeklyWorkoutTemplate } from '@/components';
import { useAuth } from '@/lib/hooks/useAuth';
import { addDocument } from '@/lib/firebase/firebaseUtils';
import toast from 'react-hot-toast';

interface FormData {
  gender: 'male' | 'female';
  group: 'youth' | 'teens' | 'children';
  experienceLevel: '0-4months' | 'upto1year' | '1-2years' | '2-3years' | '3plusYears';
  threeKmTime: string;
  pullUps: number;
  goal: 'army' | 'aerobic' | 'strength' | 'other';
  otherGoal?: string;
  workoutFrequency: 2 | 3 | 4 | 5;
}

export default function TrainingProgramForm() {
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    gender: 'male',
    group: 'youth',
    experienceLevel: '0-4months',
    threeKmTime: '',
    pullUps: 0,
    goal: 'army',
    workoutFrequency: 4
  });
  const [currentStep, setCurrentStep] = useState<'basic' | 'metrics' | 'complete'>('basic');
  const [showError, setShowError] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [answersId, setAnswersId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const validateMetrics = () => {
    return formData.threeKmTime !== '' && formData.threeKmTime.includes(':');
  };

  const handleBasicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.goal === 'other' && !formData.otherGoal?.trim()) {
      toast.error('נא לפרט את המטרה שלך');
      return;
    }
    setCurrentStep('metrics');
  };

  const handleMetricsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateMetrics()) {
      setShowError(true);
      return;
    }

    if (!user) {
      toast.error('יש להתחבר כדי ליצור תוכנית');
      return;
    }

    setIsSaving(true);
    try {
      // Prepare data for Firebase by removing undefined fields
      const cleanFormData = {
        userId: user.uid,
        createdAt: new Date().toISOString(),
        gender: formData.gender,
        group: formData.group,
        experienceLevel: formData.experienceLevel,
        threeKmTime: formData.threeKmTime,
        pullUps: formData.pullUps,
        goal: formData.goal,
        workoutFrequency: formData.workoutFrequency,
        ...(formData.goal === 'other' && formData.otherGoal ? { otherGoal: formData.otherGoal } : {})
      };

      // Save user answers to Firebase
      const savedAnswers = await addDocument('userAnswers', cleanFormData);

      setAnswersId(savedAnswers.id);
      setIsSubmitted(true);
      toast.success('הנתונים נשמרו בהצלחה!');
    } catch (error) {
      console.error('Error saving user answers:', error);
      toast.error('אירעה שגיאה בשמירת הנתונים');
    } finally {
      setIsSaving(false);
    }
  };

  if (isSubmitted && answersId) {
    // Clean the form data before passing it to WeeklyWorkoutTemplate
    const cleanUserAnswers = {
      gender: formData.gender,
      group: formData.group,
      experienceLevel: formData.experienceLevel,
      threeKmTime: formData.threeKmTime,
      pullUps: formData.pullUps,
      goal: formData.goal,
      workoutFrequency: formData.workoutFrequency
    };
    
    return <WeeklyWorkoutTemplate userAnswers={cleanUserAnswers} answersId={answersId} />;
  }

  if (currentStep === 'basic') {
    return (
      <form onSubmit={handleBasicSubmit} className="max-w-2xl mx-auto space-y-12 p-6">
        {/* Gender Selection - Card Style */}
        <div className="space-y-4">
          <label className="block text-xl font-medium text-gray-700 text-center">בחר/י מין</label>
          <div className="flex justify-center gap-6 rtl">
            {[
              { value: 'male', label: 'זכר', icon: FaMale },
              { value: 'female', label: 'נקבה', icon: FaFemale }
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData({ ...formData, gender: option.value as 'male' | 'female' })}
                className={`flex flex-col items-center p-6 rounded-xl transition-all ${
                  formData.gender === option.value
                    ? 'bg-[#fff5eb] border-2 border-[#ff8714] shadow-lg scale-105'
                    : 'bg-white border-2 border-gray-200 hover:border-[#ff8714]'
                }`}
              >
                <option.icon className={`w-16 h-16 ${
                  formData.gender === option.value ? 'text-[#ff8714]' : 'text-gray-400'
                }`} />
                <span className="mt-2 text-lg font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Training Group - Visual Cards */}
        <div className="space-y-4">
          <label className="block text-xl font-medium text-gray-700 text-center">קבוצת אימון</label>
          <div className="grid grid-cols-3 gap-4 rtl">
            {[
              { value: 'youth', label: 'נוער', description: '15-18' },
              { value: 'teens', label: 'נערים', description: '12-14' },
              { value: 'children', label: 'ילדים', description: '8-11' }
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData({ ...formData, group: option.value as FormData['group'] })}
                className={`flex flex-col items-center p-4 rounded-xl transition-all ${
                  formData.group === option.value
                    ? 'bg-[#fff5eb] border-2 border-[#ff8714] shadow-lg'
                    : 'bg-white border-2 border-gray-200 hover:border-[#ff8714]'
                }`}
              >
                <IoPeople className={`w-10 h-10 ${
                  formData.group === option.value ? 'text-[#ff8714]' : 'text-gray-400'
                }`} />
                <span className="mt-2 text-lg font-medium">{option.label}</span>
                <span className="text-sm text-gray-500">{option.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Experience Level - Timeline Style */}
        <div className="space-y-4">
          <label className="block text-xl font-medium text-gray-700 text-center">זמן אימון בחמש אצבעות</label>
          <div className="relative pt-8">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gray-200 rounded-full">
              <div className="absolute h-full bg-[#ff8714] rounded-full transition-all"
                   style={{ width: `${
                     formData.experienceLevel === '0-4months' ? 20 :
                     formData.experienceLevel === 'upto1year' ? 40 :
                     formData.experienceLevel === '1-2years' ? 60 :
                     formData.experienceLevel === '2-3years' ? 80 : 100
                   }%` }}
              />
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[
                { value: '0-4months', label: 'עד 4 חודשים' },
                { value: 'upto1year', label: 'עד שנה' },
                { value: '1-2years', label: 'שנה-שנתיים' },
                { value: '2-3years', label: 'שנתיים-שלוש' },
                { value: '3plusYears', label: 'שלוש שנים +' }
              ].map((option, index) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, experienceLevel: option.value as FormData['experienceLevel'] })}
                  className={`flex flex-col items-center pt-6 ${
                    formData.experienceLevel === option.value ? 'text-[#ff8714]' : 'text-gray-500'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full mb-2 ${
                    formData.experienceLevel === option.value ? 'bg-[#ff8714]' : 'bg-gray-300'
                  }`} />
                  <span className="text-sm text-center">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Goal Selection */}
        <div className="space-y-4">
          <label className="block text-xl font-medium text-gray-700 text-center">מה המטרה שלך?</label>
          <div className="grid grid-cols-2 gap-4 rtl">
            {[
              { value: 'army', label: 'הכנה לצבא', icon: GiMilitaryAmbulance },
              { value: 'aerobic', label: 'שיפור אירובי', icon: GiHeartBeats },
              { value: 'strength', label: 'שיפור כוח', icon: GiWeightLiftingUp },
              { value: 'other', label: 'אחר', icon: GiStairsGoal }
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData({ ...formData, goal: option.value as FormData['goal'], otherGoal: option.value === 'other' ? formData.otherGoal : undefined })}
                className={`flex flex-col items-center p-6 rounded-xl transition-all ${
                  formData.goal === option.value
                    ? 'bg-[#fff5eb] border-2 border-[#ff8714] shadow-lg scale-105'
                    : 'bg-white border-2 border-gray-200 hover:border-[#ff8714]'
                }`}
              >
                <option.icon className={`w-16 h-16 ${
                  formData.goal === option.value ? 'text-[#ff8714]' : 'text-gray-400'
                }`} />
                <span className="mt-2 text-lg font-medium">{option.label}</span>
              </button>
            ))}
          </div>
          {formData.goal === 'other' && (
            <div className="mt-4">
              <input
                type="text"
                value={formData.otherGoal || ''}
                onChange={(e) => setFormData({ ...formData, otherGoal: e.target.value })}
                placeholder="פרט/י את המטרה שלך"
                className="w-full p-3 text-lg border-2 border-gray-300 rounded-xl focus:border-[#ff8714] focus:ring-1 focus:ring-[#ff8714] focus:outline-none transition-colors"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-[#ff8714] text-white py-3 px-6 rounded-xl text-lg font-medium hover:bg-[#e67200] focus:outline-none focus:ring-2 focus:ring-[#ff8714] focus:ring-offset-2 transition-colors"
        >
          המשך למדדי ליבה
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleMetricsSubmit} className="max-w-2xl mx-auto space-y-12 p-6">
      {/* 3KM Run Time - Digital Clock Style */}
      <div className="space-y-4">
        <label className="block text-xl font-medium text-gray-700 text-center">
          <div className="flex items-center justify-center gap-2">
            <FaRunning className="w-6 h-6" />
            <span>זמן ריצת 3 קילומטר</span>
            <FaStopwatch className="w-6 h-6" />
          </div>
        </label>
        <div className="flex justify-center items-center gap-2 rtl">
          <input
            type="text"
            placeholder="שניות"
            value={formData.threeKmTime.split(':')[1] || ''}
            onChange={(e) => {
              const seconds = e.target.value;
              const minutes = formData.threeKmTime.split(':')[0] || '0';
              if (/^\d{0,2}$/.test(seconds)) {
                setFormData({ ...formData, threeKmTime: `${minutes}:${seconds}` });
                setShowError(false);
              }
            }}
            className="w-20 text-center text-base font-mono bg-white border-2 border-gray-300 rounded-lg p-2 hover:border-[#ff8714] focus:border-[#ff8714] focus:ring-1 focus:ring-[#ff8714] focus:outline-none"
            maxLength={2}
          />
          <span className="text-lg font-mono">:</span>
          <input
            type="text"
            placeholder="דקות"
            value={formData.threeKmTime.split(':')[0] || ''}
            onChange={(e) => {
              const minutes = e.target.value;
              const seconds = formData.threeKmTime.split(':')[1] || '00';
              if (/^\d{0,2}$/.test(minutes)) {
                setFormData({ ...formData, threeKmTime: `${minutes}:${seconds}` });
                setShowError(false);
              }
            }}
            className="w-20 text-center text-base font-mono bg-white border-2 border-gray-300 rounded-lg p-2 hover:border-[#ff8714] focus:border-[#ff8714] focus:ring-1 focus:ring-[#ff8714] focus:outline-none"
            maxLength={2}
          />
        </div>
      </div>

      {/* Pull-ups - Counter Style */}
      <div className="space-y-4">
        <label className="block text-xl font-medium text-gray-700 text-center">
          <div className="flex items-center justify-center gap-2">
            <GiMuscleUp className="w-6 h-6" />
            <span>מקסימום עליות מתח</span>
          </div>
        </label>
        <div className="flex justify-center items-center gap-4">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, pullUps: Math.max(0, formData.pullUps - 1) })}
            className="w-12 h-12 rounded-full bg-gray-100 text-gray-600 text-2xl flex items-center justify-center hover:bg-gray-200"
          >
            -
          </button>
          <div className="w-24 text-center">
            <input
              type="number"
              value={formData.pullUps}
              onChange={(e) => setFormData({ ...formData, pullUps: Math.max(0, parseInt(e.target.value) || 0) })}
              className="w-full text-center text-3xl font-bold bg-transparent"
            />
          </div>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, pullUps: formData.pullUps + 1 })}
            className="w-12 h-12 rounded-full bg-[#ff8714] text-white text-2xl flex items-center justify-center hover:bg-[#e67200]"
          >
            +
          </button>
        </div>
      </div>

      {/* Workout Frequency */}
      <div className="space-y-4">
        <label className="block text-xl font-medium text-gray-700 text-center">
          <div className="flex items-center justify-center gap-2">
            <FaDumbbell className="w-6 h-6" />
            <span>כמה פעמים בשבוע תרצה/י להתאמן?</span>
          </div>
        </label>
        <div className="grid grid-cols-4 gap-4 rtl">
          {[2, 3, 4, 5].map((frequency) => (
            <button
              key={frequency}
              type="button"
              onClick={() => setFormData({ ...formData, workoutFrequency: frequency as 2 | 3 | 4 | 5 })}
              className={`flex flex-col items-center p-6 rounded-xl transition-all ${
                formData.workoutFrequency === frequency
                  ? 'bg-[#fff5eb] border-2 border-[#ff8714] shadow-lg scale-105'
                  : 'bg-white border-2 border-gray-200 hover:border-[#ff8714]'
              }`}
            >
              <span className="text-3xl font-bold mb-2">{frequency}</span>
              <span className="text-sm text-gray-600">אימונים</span>
            </button>
          ))}
        </div>
      </div>

      {showError && (
        <div className="text-red-500 text-center font-medium">
          יש למלא את כל המדדים לפני השמירה
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => setCurrentStep('basic')}
          disabled={isSaving}
          className="w-1/2 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl text-lg font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          חזרה
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="w-1/2 bg-[#ff8714] text-white py-3 px-6 rounded-xl text-lg font-medium hover:bg-[#e67200] focus:outline-none focus:ring-2 focus:ring-[#ff8714] focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'שומר...' : 'שמירה'}
        </button>
      </div>
    </form>
  );
} 