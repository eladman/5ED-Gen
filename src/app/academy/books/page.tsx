"use client";

import Navbar from '@/components/Navbar';
import BooksSection from '@/components/BooksSection';
import AcademyNav from '@/components/AcademyNav';

export default function BooksPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8 pt-32">
        <h1 className="text-3xl font-bold text-center mb-4">ספרים מומלצים</h1>
        <p className="text-xl text-[#ff8714] text-center mb-8">גלה ספרים מומלצים בנושאי אסטרטגיה, אימון מנטלי וכושר גופני</p>
        
        <AcademyNav />
        <BooksSection />
      </div>
    </main>
  );
} 