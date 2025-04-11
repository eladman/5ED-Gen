"use client";

import { Navbar, VideosSection, AcademyNav } from '@/components';

export default function VideosPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8 pt-32">
        <h1 className="text-3xl font-bold text-center mb-4">סרטים מומלצים</h1>
        <p className="text-xl text-[#ff8714] text-center mb-8">צפה בסרטוני הדרכה מקצועיים בנושאי אימון, טכניקות לחימה ואימון מנטלי</p>
        
        <AcademyNav />
        <VideosSection />
      </div>
    </main>
  );
} 