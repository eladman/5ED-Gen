import { db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import imageCompression from 'browser-image-compression';

interface ProfileData {
  name: string;
  phone: string;
  team: string;
  teamType?: string; // Added for team type (נוער/נערים/ילדים)
  gender?: string; // Added for gender selection (male/female)
  group?: string; // Added for metrics comparison feature
  photoURL?: string;
  photoData?: string; // base64 encoded image data
}

// Local storage helper functions for fallback
const saveProfileToLocalStorage = (userId: string, data: ProfileData) => {
  try {
    localStorage.setItem(`profile_${userId}`, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

const getProfileFromLocalStorage = (userId: string): ProfileData | null => {
  try {
    const data = localStorage.getItem(`profile_${userId}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error retrieving from localStorage:', error);
    return null;
  }
};

export const saveProfile = async (userId: string, data: ProfileData) => {
  try {
    if (!userId) {
      console.error('saveProfile called with invalid userId:', userId);
      throw new Error('User ID is required to save profile');
    }
    
    // Create a clean copy of the data without undefined values
    const cleanData: Record<string, any> = {};
    
    // Only include defined values
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        cleanData[key] = value;
      }
    });

    console.log(`Attempting to save profile for user ${userId} with data:`, cleanData);
    
    let savedToFirestore = false;
    let firestoreError = null;
    
    try {
      // First try to save to Firestore
      await setDoc(doc(db, 'profiles', userId), cleanData, { merge: true });
      console.log('Profile saved to Firestore successfully');
      savedToFirestore = true;
    } catch (error: any) {
      firestoreError = error;
      console.error('Firestore save failed with error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Using localStorage fallback...');
    }
    
    // If Firestore failed, try localStorage
    if (!savedToFirestore) {
      console.log('Attempting to save profile to localStorage');
      const localSaveSuccess = saveProfileToLocalStorage(userId, cleanData as ProfileData);
      
      if (!localSaveSuccess) {
        console.error('Both Firestore and localStorage saves failed');
        throw new Error(
          firestoreError ? 
          `Firestore error: ${firestoreError.message}. LocalStorage also failed.` : 
          'Failed to save profile data to both Firestore and localStorage'
        );
      }
      console.log('Profile saved to localStorage successfully as a fallback');
    }
    
    // Attempt to set the profile completion flag in sessionStorage
    try {
      sessionStorage.setItem('profileCompleted', 'true');
      console.log('Set profile completion flag in sessionStorage');
    } catch (storageError) {
      console.error('Could not set sessionStorage flag:', storageError);
      // Non-critical error, don't throw
    }
    
    return { success: true, savedToFirestore };
    
  } catch (error: any) {
    console.error('Error in saveProfile function:', error);
    // Provide more information in the error message
    throw new Error(`Failed to save profile data: ${error.message || 'Unknown error'}`);
  }
};

export const getProfile = async (userId: string): Promise<ProfileData | null> => {
  try {
    try {
      // First try to get from Firestore
      const docRef = doc(db, 'profiles', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        console.log('Profile retrieved from Firestore successfully');
        return docSnap.data() as ProfileData;
      }
    } catch (firestoreError) {
      console.error('Firestore fetch failed, using localStorage fallback:', firestoreError);
    }
    
    // Fallback to localStorage if Firestore fails or document doesn't exist
    const localProfile = getProfileFromLocalStorage(userId);
    if (localProfile) {
      console.log('Profile retrieved from localStorage successfully');
      return localProfile;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw new Error('Failed to fetch profile data');
  }
};

export const processProfileImage = async (file: File): Promise<string> => {
  try {
    console.log(`Processing profile image`);
    
    // Check if file is valid
    if (!file || !(file instanceof File)) {
      throw new Error('Invalid file provided for upload');
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // Check file size (max 5MB before compression)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File size too large. Please select an image under 5MB');
    }
    
    // Compress image before encoding
    const options = {
      maxSizeMB: 0.5, // Increased slightly to maintain better quality
      maxWidthOrHeight: 800, // Increased for better quality
      useWebWorker: true,
      maxIteration: 10, // Max number of compression iterations
      initialQuality: 0.7, // Initial compression quality
    };
    
    console.log('Compressing image...');
    let compressedFile;
    try {
      compressedFile = await imageCompression(file, options);
      console.log(`Image compressed from ${file.size} to ${compressedFile.size} bytes`);
    } catch (compressionError) {
      console.error('Compression failed, using original file:', compressionError);
      compressedFile = file; // Fallback to original file if compression fails
    }
    
    // Convert to base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      // Set up error handling
      const timeoutId = setTimeout(() => {
        reader.abort();
        reject(new Error('File reading timed out'));
      }, 30000); // 30 second timeout
      
      reader.onloadend = () => {
        clearTimeout(timeoutId);
        if (!reader.result) {
          reject(new Error('Failed to read file'));
          return;
        }
        const base64String = reader.result as string;
        console.log(`Image converted to base64 string of length: ${base64String.length}`);
        resolve(base64String);
      };
      
      reader.onerror = () => {
        clearTimeout(timeoutId);
        reject(new Error('Failed to convert image to base64'));
      };
      
      reader.readAsDataURL(compressedFile);
    });
  } catch (error: any) {
    console.error('Error processing image:', error);
    throw new Error(`Failed to process profile image: ${error.message || 'Unknown error'}`);
  }
};