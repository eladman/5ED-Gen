"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useProfile } from '@/lib/contexts/ProfileContext';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { saveProfile } from '@/lib/firebase/profileUtils';
import { TeamSelector } from '@/components';
import { getTeamAge } from '@/lib/teamUtils';

export default function SignupForm() {
  const { user, signOut } = useAuth();
  const { refreshProfile } = useProfile();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    team: '',
    teamType: '',
    gender: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
    
    // Pre-fill name if available from Google auth
    if (user.displayName) {
      setFormData(prev => ({
        ...prev,
        name: user.displayName || ''
      }));
    }
  }, [user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTeamChange = (teamId: string) => {
    const teamAge = getTeamAge(teamId);
    setFormData(prev => ({
      ...prev,
      team: teamId,
      teamType: teamAge
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate form
    if (!formData.name || !formData.phone || !formData.team || !formData.gender) {
      alert('נא למלא את כל השדות הנדרשים');
      return;
    }

    setIsLoading(true);
    setSaveStatus('saving');
    
    // Try to save the profile with up to 2 retries
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      attempts++;
      console.log(`Saving profile attempt ${attempts}/${maxAttempts}`);
      
      try {
        // Save user profile to Firestore (or localStorage fallback)
        const result = await saveProfile(user.uid, formData);
        console.log('Save profile result:', result);
        
        if (result && result.success) {
          // Refresh profile in context
          await refreshProfile();
          
          setSaveStatus('success');
          console.log('Profile saved successfully');
          
          setTimeout(() => {
            setSaveStatus('idle');
            // Redirect to main page after successful save
            router.push('/');
          }, 1500);
          
          return; // Exit the loop on success
        }
      } catch (error: any) {
        console.error(`Profile save attempt ${attempts} failed:`, error);
        
        if (attempts >= maxAttempts) {
          // Only show error after last attempt
          console.error('All save attempts failed');
          setSaveStatus('error');
          
          // Create a more user-friendly error message
          let errorMessage = 'שגיאה לא ידועה';
          
          if (error.message && error.message.includes('permission-denied')) {
            errorMessage = 'אין הרשאה לשמור את הפרופיל. אנא יש לצאת ולהיכנס מחדש.';
          } else if (error.message && error.message.includes('network')) {
            errorMessage = 'בעיית תקשורת. אנא בדוק את החיבור לאינטרנט שלך ונסה שוב.';
          } else if (error.message) {
            errorMessage = `שגיאה: ${error.message}`;
          }
          
          alert(`שמירת הפרופיל נכשלה: ${errorMessage}`);
          break; // Exit the loop after displaying the error
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#ff8714] mb-2">ברוכים הבאים לחמש אצבעות</h1>
          <p className="text-gray-600">השלם את הפרטים כדי להתחיל</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-6">
          <div>
            <label htmlFor="name" className="block text-gray-700 mb-1">שם מלא</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-gray-700 mb-1">מספר טלפון</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="05X-XXXXXXX"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">מגדר</label>
            <div className="flex gap-4 mt-1">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === 'male'}
                  onChange={handleInputChange}
                  className="mr-2"
                  required
                />
                <span>זכר</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === 'female'}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span>נקבה</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-1">קבוצה</label>
            <TeamSelector 
              value={formData.team} 
              onChange={handleTeamChange} 
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-[#ff8714] text-white py-2 rounded-md hover:bg-[#e67200] transition-colors duration-200 disabled:opacity-70"
              disabled={isLoading}
            >
              {isLoading ? 'אנא המתן...' : 'שמור והמשך'}
            </button>
          </div>

          {saveStatus === 'success' && (
            <div className="text-green-500 text-center">הפרטים נשמרו בהצלחה!</div>
          )}

          {saveStatus === 'error' && (
            <div className="text-red-500 text-center">שגיאה בשמירת הפרטים, נסה שוב.</div>
          )}
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => signOut().then(() => router.push('/'))}
            className="text-gray-500 hover:text-[#ff8714]"
          >
            התנתק וחזור לדף הבית
          </button>
        </div>
      </div>
    </div>
  );
} 