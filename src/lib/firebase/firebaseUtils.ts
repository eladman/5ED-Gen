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

// Firestore functions
export const addDocument = async (collectionName: string, data: any) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: new Date().toISOString(),
    });
    return { id: docRef.id, ...data };
  } catch (error) {
    console.error('Error adding document:', error);
    throw error;
  }
};

export const getDocuments = async <T extends DocumentData>(collectionName: string): Promise<(T & { id: string })[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as (T & { id: string })[];
  } catch (error) {
    console.error('Error getting documents:', error);
    throw error;
  }
};

export const getDocument = async <T extends DocumentData>(collectionName: string, documentId: string): Promise<(T & { id: string }) | null> => {
  try {
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as (T & { id: string });
    }
    return null;
  } catch (error) {
    console.error('Error getting document:', error);
    throw error;
  }
};

export const updateDocument = (collectionName: string, id: string, data: any) =>
  updateDoc(doc(db, collectionName, id), data);

export const deleteDocument = (collectionName: string, id: string) =>
  deleteDoc(doc(db, collectionName, id));

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
