"use client";

import TestFirebaseSave from '@/test-firebase-save';
import AuthStatusTest from '@/test-auth-status';

export default function TestFirebasePage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Firebase Connectivity Test</h1>
      
      <div className="grid grid-cols-1 gap-6">
        <AuthStatusTest />
        <TestFirebaseSave />
      </div>
    </div>
  );
} 