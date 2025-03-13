'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { saveProfile, getProfile, processProfileImage } from '@/lib/firebase/profileUtils';
import Navbar from '@/app/components/Navbar';

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    team: '',
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    const fetchProfile = async () => {
      try {
        setIsFetching(true);
        const profile = await getProfile(user.uid);
        if (profile) {
          setFormData({
            name: profile.name,
            phone: profile.phone,
            team: profile.team,
          });
          // Use photoData (base64) first, then fallback to photoURL if available
          if (profile.photoData) {
            setProfileImage(profile.photoData);
          } else if (profile.photoURL) {
            setProfileImage(profile.photoURL);
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchProfile();
  }, [user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'phone' && !/^\d*$/.test(value)) return;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSaveStatus('idle');
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG, etc.)');
      return;
    }

    // Validate file size (max 5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > MAX_FILE_SIZE) {
      alert('Please select an image under 5MB');
      return;
    }

    try {
      // Create a temporary preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        setSaveStatus('idle');
      };
      reader.onerror = () => {
        console.error('Error creating image preview');
        alert('Error creating image preview');
      };
      reader.readAsDataURL(file);

      setImageFile(file);
    } catch (error) {
      console.error('Error handling image:', error);
      alert('Error handling image. Please try again with a different image.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setSaveStatus('saving');
    
    try {
      let photoData = undefined;
      
      if (imageFile) {
        try {
          console.log('Processing profile image...');
          photoData = await processProfileImage(imageFile);
          console.log('Profile image processed successfully');
        } catch (uploadError: any) {
          console.error('Profile image processing failed:', uploadError);
          alert(`תמונת הפרופיל לא נשמרה: ${uploadError.message || 'שגיאה לא ידועה'}`);
          // Continue with saving other profile data even if image processing fails
          photoData = undefined;
        }
      } else if (profileImage && profileImage.startsWith('data:')) {
        // Preserve existing photoData if no new image is uploaded
        photoData = profileImage;
      }

      console.log('Saving profile data...');
      await saveProfile(user.uid, {
        ...formData,
        photoData,
      });
      console.log('Profile data saved successfully');

      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error: any) {
      console.error('Error saving profile:', error);
      setSaveStatus('error');
      alert(`שמירת הפרופיל נכשלה: ${error.message || 'שגיאה לא ידועה'}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 pt-20">
          <div className="container-custom py-8 flex justify-center items-center">
            <div className="text-[#ff8714]">טוען...</div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-20">
        <div className="container-custom py-8">
          <h1 className="text-3xl font-bold mb-8 text-center text-[#ff8714]">פרופיל משתמש</h1>
          <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6 bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-col items-center mb-6">
              <div className="relative w-32 h-32 mb-4">
                {profileImage ? (
                  <Image
                    src={profileImage}
                    alt="Profile preview"
                    fill
                    className="rounded-full object-cover border-4 border-[#ff8714]"
                    onError={(e) => {
                      console.error('Error loading profile image:', e);
                      setProfileImage(null);
                    }}
                    unoptimized={profileImage.startsWith('data:')}
                    priority={true}
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center border-4 border-[#ff8714]">
                    <span className="text-gray-400">תמונה</span>
                  </div>
                )}
              </div>
              <label className="cursor-pointer bg-[#ff8714] text-white px-4 py-2 rounded-md hover:bg-[#e67200] transition-colors duration-200">
                העלאת תמונה
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                  onClick={(e) => {
                    // Reset the input value to allow selecting the same file again
                    (e.target as HTMLInputElement).value = '';
                  }}
                />
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-right mb-1 text-gray-700">
                  שם מלא
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md text-right focus:ring-2 focus:ring-[#ff8714] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-right mb-1 text-gray-700">
                  מספר טלפון
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md text-right focus:ring-2 focus:ring-[#ff8714] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-right mb-1 text-gray-700">
                  קבוצה
                </label>
                <input
                  type="text"
                  name="team"
                  value={formData.team}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md text-right focus:ring-2 focus:ring-[#ff8714] focus:border-transparent"
                  required
                />
              </div>

              <div className="flex flex-col items-center">
                <button
                  type="submit"
                  disabled={isLoading || saveStatus === 'saving'}
                  className="w-full bg-[#ff8714] text-white py-2 rounded-md hover:bg-[#e67200] disabled:bg-[#ffa14d] disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {saveStatus === 'saving' ? 'שומר...' : 'שמור שינויים'}
                </button>

                {saveStatus === 'success' && (
                  <div className="mt-2 text-green-600 text-sm">
                    הפרופיל נשמר בהצלחה
                  </div>
                )}

                {saveStatus === 'error' && (
                  <div className="mt-2 text-red-600 text-sm">
                    שגיאה בשמירת הפרופיל
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
      </main>
    </>
  );
} 