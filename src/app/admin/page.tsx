'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { FaKey, FaUsers, FaDatabase, FaCog } from 'react-icons/fa';

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect non-admin users
    if (user === null) {
      // Still loading auth state
      return;
    }
    
    // Check if user is admin - you may need to adjust this based on your actual admin check logic
    const isAdmin = user && user.email === 'admin@example.com'; // Replace with your admin check
    
    if (!user || !isAdmin) {
      router.push('/');
    }
  }, [user, router]);

  if (user === null) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6 text-center">טוען...</h1>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff8714]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">לוח בקרה למנהל</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/admin/api-status" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#fff5eb] flex items-center justify-center">
                <FaKey className="text-[#ff8714] text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold">סטטוס API</h2>
                <p className="text-gray-600">בדוק את סטטוס מפתח ה-API של OpenAI</p>
              </div>
            </div>
          </Link>
          
          <Link href="/admin/users" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#fff5eb] flex items-center justify-center">
                <FaUsers className="text-[#ff8714] text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold">ניהול משתמשים</h2>
                <p className="text-gray-600">צפה וערוך פרטי משתמשים</p>
              </div>
            </div>
          </Link>
          
          <Link href="/admin/data" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#fff5eb] flex items-center justify-center">
                <FaDatabase className="text-[#ff8714] text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold">ניהול נתונים</h2>
                <p className="text-gray-600">צפה וערוך נתוני מערכת</p>
              </div>
            </div>
          </Link>
          
          <Link href="/admin/settings" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#fff5eb] flex items-center justify-center">
                <FaCog className="text-[#ff8714] text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold">הגדרות מערכת</h2>
                <p className="text-gray-600">שנה הגדרות מערכת</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
} 