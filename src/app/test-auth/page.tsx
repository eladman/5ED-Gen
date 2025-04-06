"use client";

import AuthStatusTest from '@/test-auth-status';

export default function TestAuthPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Firebase Authentication Test</h1>
      <AuthStatusTest />
    </div>
  );
} 