"use client";

import Navbar from '../components/Navbar';
import AcademyCard from '../components/AcademyCard';
import TeamRecommendations from '../components/TeamRecommendations';
import { FaPlay, FaBook, FaMicrophone } from 'react-icons/fa';

export default function LibraryPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8 pt-32">
        <h1 className="text-4xl font-bold text-center mb-12 text-[#ff8714]">ברוכים הבאים לאקדמיה של חמש - המקום שישדרג אתכם</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <AcademyCard
            title="סרטים"
            description="צפה בסרטוני הדרכה מקצועיים בנושאי אימון, טכניקות לחימה ואימון מנטלי"
            icon={FaPlay}
            href="/academy/videos"
          />
          <AcademyCard
            title="ספרים"
            description="גלה ספרים מומלצים בנושאי אסטרטגיה, אימון מנטלי וכושר גופני"
            icon={FaBook}
            href="/academy/books"
          />
          <AcademyCard
            title="פודקאסטים"
            description="האזן לפודקאסטים מעשירים עם מומחים מתחומי האימון והלחימה"
            icon={FaMicrophone}
            href="/academy/podcasts"
          />
        </div>

        <TeamRecommendations />
      </div>
    </main>
  );
} 