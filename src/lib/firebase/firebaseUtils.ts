import { auth, db, storage } from "./firebase";
import {
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  query,
  where,
  DocumentData,
  setDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// localStorage helpers
const saveToLocalStorage = (key: string, data: any): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

const getFromLocalStorage = (key: string): any => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error retrieving from localStorage:', error);
    return null;
  }
};

// Auth functions
export const logoutUser = () => signOut(auth);

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  
  // Add scopes for better user profile access
  provider.addScope('profile');
  provider.addScope('email');
  
  // Set custom parameters
  provider.setCustomParameters({
    prompt: 'select_account'
  });
  
  try {
    console.log("Initiating Google sign-in popup");
    // Wrap in a Promise.resolve to ensure proper promise handling
    const result = await Promise.resolve(signInWithPopup(auth, provider));
    console.log("Google sign-in successful");
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    // Rethrow to allow handling in the UI layer
    throw error;
  }
};

// Firestore functions with localStorage fallback
export const addDocument = async (collectionName: string, data: any) => {
  try {
    if (!data) {
      console.error(`Invalid data provided to addDocument for ${collectionName}`);
      throw new Error(`Cannot save empty data to ${collectionName}`);
    }
    
    console.log(`Attempting to save document to ${collectionName} collection:`, data);
    
    // Make a clean copy of the data
    const cleanData = { ...data };
    
    // Ensure createdAt is present
    if (!cleanData.createdAt) {
      cleanData.createdAt = new Date().toISOString();
    }
    
    let firestoreError = null;
    let savedToFirestore = false;
    
    try {
      // First try to add to Firestore
      const docRef = await addDoc(collection(db, collectionName), cleanData);
      console.log(`Document successfully added to Firestore ${collectionName} with ID:`, docRef.id);
      savedToFirestore = true;
      return { id: docRef.id, ...cleanData, savedToFirestore: true };
    } catch (error: any) {
      firestoreError = error;
      
      // Log detailed error info
      console.error(`Firestore add failed for ${collectionName} with error:`, error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      if (error.code === 'permission-denied') {
        console.warn(`Permission denied when saving to ${collectionName}, using localStorage fallback`);
      } else {
        console.error(`Error type when saving to ${collectionName}:`, error.name);
      }
    }
    
    // If Firestore failed, use localStorage fallback
    console.log(`Using localStorage fallback for ${collectionName}`);
    
    // Generate a unique ID for the document
    const localId = `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Get existing collection from localStorage or create new one
    const existingCollection = getFromLocalStorage(`collection_${collectionName}`) || [];
    
    // Create document with ID and timestamp
    const newDocument = {
      id: localId,
      ...cleanData
    };
    
    // Add to collection
    existingCollection.push(newDocument);
    
    // Save back to localStorage
    const localSaveSuccess = saveToLocalStorage(`collection_${collectionName}`, existingCollection);
    
    if (!localSaveSuccess) {
      console.error(`Failed to save to localStorage for ${collectionName}`);
      throw new Error(
        firestoreError ? 
        `Firestore error: ${firestoreError.code} - ${firestoreError.message}. LocalStorage also failed.` : 
        `Failed to save document to both Firestore and localStorage`
      );
    }
    
    console.log(`Document saved to localStorage collection ${collectionName} with ID:`, localId);
    
    // Create success message with warning about localStorage
    const saveInfo = firestoreError 
      ? `Data saved locally only due to: ${firestoreError.code}` 
      : 'Data saved locally';
      
    return { 
      id: localId, 
      ...cleanData, 
      savedToFirestore: false,
      saveInfo
    };
  } catch (error: any) {
    console.error(`Error in addDocument function for ${collectionName}:`, error);
    // Add more context to the error to help with debugging
    const enhancedError = new Error(`Failed to save document to ${collectionName}: ${error.message || 'Unknown error'}`);
    (enhancedError as any).originalError = error;
    throw enhancedError;
  }
};

export const getDocuments = async <T extends DocumentData>(collectionName: string): Promise<(T & { id: string })[]> => {
  try {
    console.log(`Attempting to retrieve documents from ${collectionName} collection`);
    
    let firestoreError = null;
    let firestoreSuccess = false;
    
    try {
      // First try to get from Firestore
      const querySnapshot = await getDocs(collection(db, collectionName));
      const documents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as (T & { id: string })[];
      
      console.log(`Successfully retrieved ${documents.length} documents from Firestore collection ${collectionName}`);
      firestoreSuccess = true;
      return documents;
    } catch (error: any) {
      firestoreError = error;
      
      // Log detailed error info
      console.error(`Firestore read failed for ${collectionName} with error:`, error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      if (error.code === 'permission-denied') {
        console.warn(`Permission denied when reading from ${collectionName}, using localStorage fallback`);
      } else {
        console.error(`Error type when reading from ${collectionName}:`, error.name);
      }
    }
    
    // If Firestore failed, get from localStorage
    console.log(`Using localStorage fallback to retrieve documents from ${collectionName}`);
    const localDocuments = getFromLocalStorage(`collection_${collectionName}`) || [];
    console.log(`Retrieved ${localDocuments.length} documents from localStorage collection ${collectionName}`);
    
    // Add a flag to show these came from localStorage
    return localDocuments.map((doc: any) => ({
      ...doc,
      fromLocalStorage: true
    })) as (T & { id: string })[];
  } catch (error: any) {
    console.error(`Error in getDocuments function for ${collectionName}:`, error);
    
    // First try to return any local data even if there was an error
    try {
      const localDocuments = getFromLocalStorage(`collection_${collectionName}`) || [];
      console.log(`Retrieved ${localDocuments.length} documents from localStorage as error recovery`);
      
      if (localDocuments.length > 0) {
        return localDocuments.map((doc: any) => ({
          ...doc,
          fromLocalStorage: true,
          errorRecovery: true
        })) as (T & { id: string })[];
      }
    } catch (localError) {
      console.error(`Failed to retrieve from localStorage for recovery:`, localError);
    }
    
    // Add more context to the error
    const enhancedError = new Error(`Failed to get documents from ${collectionName}: ${error.message || 'Unknown error'}`);
    (enhancedError as any).originalError = error;
    throw enhancedError;
  }
};

export const getDocument = async <T extends DocumentData>(collectionName: string, documentId: string): Promise<(T & { id: string }) | null> => {
  try {
    try {
      // First try to get from Firestore
      const docRef = doc(db, collectionName, documentId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as (T & { id: string });
      }
    } catch (firestoreError) {
      console.error(`Firestore get document failed for ${collectionName}/${documentId}, using localStorage fallback:`, firestoreError);
    }
    
    // Get from localStorage
    const localCollection = getFromLocalStorage(`collection_${collectionName}`) || [];
    const localDocument = localCollection.find((doc: any) => doc.id === documentId);
    
    return localDocument || null;
  } catch (error) {
    console.error('Error getting document:', error);
    throw error;
  }
};

export const updateDocument = async (collectionName: string, id: string, data: any) => {
  try {
    try {
      // First try to update in Firestore
      await updateDoc(doc(db, collectionName, id), data);
      console.log(`Document updated in Firestore: ${collectionName}/${id}`);
      return { success: true };
    } catch (firestoreError) {
      console.error(`Firestore update failed for ${collectionName}/${id}, using localStorage fallback:`, firestoreError);
      
      // Get from localStorage
      const localCollection = getFromLocalStorage(`collection_${collectionName}`) || [];
      const documentIndex = localCollection.findIndex((doc: any) => doc.id === id);
      
      if (documentIndex === -1) {
        throw new Error(`Document not found in localStorage: ${collectionName}/${id}`);
      }
      
      // Update the document
      localCollection[documentIndex] = {
        ...localCollection[documentIndex],
        ...data
      };
      
      // Save back to localStorage
      const localSaveSuccess = saveToLocalStorage(`collection_${collectionName}`, localCollection);
      
      if (!localSaveSuccess) {
        throw new Error(`Failed to update document in both Firestore and localStorage`);
      }
      
      console.log(`Document updated in localStorage: ${collectionName}/${id}`);
      return { success: true };
    }
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
};

export const deleteDocument = async (collectionName: string, id: string) => {
  try {
    try {
      // First try to delete from Firestore
      await deleteDoc(doc(db, collectionName, id));
      console.log(`Document deleted from Firestore: ${collectionName}/${id}`);
    } catch (firestoreError) {
      console.error(`Firestore delete failed for ${collectionName}/${id}, using localStorage fallback:`, firestoreError);
      
      // Get from localStorage
      const localCollection = getFromLocalStorage(`collection_${collectionName}`) || [];
      const filteredCollection = localCollection.filter((doc: any) => doc.id !== id);
      
      // Save back to localStorage
      const localSaveSuccess = saveToLocalStorage(`collection_${collectionName}`, filteredCollection);
      
      if (!localSaveSuccess) {
        throw new Error(`Failed to delete document from both Firestore and localStorage`);
      }
      
      console.log(`Document deleted from localStorage: ${collectionName}/${id}`);
    }
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
};

export const addToFavorites = async (userId: string, itemId: string) => {
  try {
    const favoritesRef = doc(db, 'users', userId, 'favorites', itemId);
    await setDoc(favoritesRef, {
      itemId,
      addedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    throw error;
  }
};

export const removeFromFavorites = async (userId: string, itemId: string) => {
  try {
    const favoritesRef = doc(db, 'users', userId, 'favorites', itemId);
    await deleteDoc(favoritesRef);
  } catch (error) {
    console.error('Error removing from favorites:', error);
    throw error;
  }
};

export const isInFavorites = async (userId: string): Promise<string[]> => {
  try {
    const favoritesRef = collection(db, 'users', userId, 'favorites');
    const querySnapshot = await getDocs(favoritesRef);
    return querySnapshot.docs.map(doc => doc.id);
  } catch (error) {
    console.error('Error checking favorites:', error);
    throw error;
  }
};

// Storage functions
export const uploadFile = async (file: File, path: string) => {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};
