"use client";

import { useState } from 'react';
import { db } from '@/lib/firebase/firebase';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { auth } from '@/lib/firebase/firebase';

export default function TestFirebaseSave() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const testDirectSave = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Get current user
      const user = auth.currentUser;

      if (!user) {
        throw new Error('No authenticated user found. Please sign in first.');
      }

      // Data to save
      const testData = {
        testField: 'Test value',
        timestamp: new Date().toISOString(),
        randomId: Math.random().toString(36).substring(2, 9)
      };

      // Test saving to a collection (addDoc)
      const collectionRef = collection(db, 'test_collection');
      const docRef = await addDoc(collectionRef, testData);
      
      // Test saving to a specific document (setDoc)
      const userId = user.uid;
      const profileRef = doc(db, 'test_profiles', userId);
      await setDoc(profileRef, {
        ...testData,
        userId
      });

      setResult({
        success: true,
        collectionDocId: docRef.id,
        profileDocId: userId,
        savedData: testData
      });
    } catch (err: any) {
      console.error('Firebase save test error:', err);
      setError(err.message || 'Unknown error testing Firebase save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Firebase Save Test</h2>
      
      <button
        onClick={testDirectSave}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Firebase Save'}
      </button>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-800 rounded">
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}
      
      {result && (
        <div className="mt-4 p-3 bg-green-100 text-green-800 rounded">
          <p><strong>Success!</strong></p>
          <p>Added to collection with ID: {result.collectionDocId}</p>
          <p>Added to profile document: {result.profileDocId}</p>
          <pre className="mt-2 bg-white p-2 rounded text-xs overflow-x-auto">
            {JSON.stringify(result.savedData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 