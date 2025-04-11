"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import Navbar from '@/components/Navbar';
import AcademyNav from '@/components/AcademyNav';
import BookCard from '@/components/BookCard';
import { isInFavorites } from '@/lib/firebase/firebaseUtils';
import { FaPlay, FaMicrophone } from 'react-icons/fa';

// מידע לדוגמה של המלצות הצוות
const recommendations = {
  books: [
    {
      id: 'book1',
      title: 'אמנות המלחמה',
      author: 'סון דזה',
      description: 'ספר קלאסי על אסטרטגיה צבאית. הספר מלמד על חשיבה אסטרטגית, מנהיגות וניהול משאבים.',
      rating: 5,
      category: 'אסטרטגיה',
      likes: 256,
      recommendedBy: 'רס"ן יוני כהן'
    }
  ],
  videos: [
    {
      id: 'video1',
      title: 'אימון כוח למתקדמים',
      instructor: 'דן כהן',
      description: 'סרטון הדרכה מקיף על טכניקות אימון כוח מתקדמות, כולל תרגילים מורכבים והסברים מפורטים.',
      duration: '45:30',
      category: 'אימון גופני',
      views: 1540,
      recommendedBy: 'רס"ר אבי לוי'
    }
  ],
  podcasts: [
    {
      id: 'podcast1',
      title: 'מנהיגות בשדה הקרב',
      host: 'מיכל גולן',
      guests: ['יוסי כהן', 'דני אבידן'],
      description: 'שיחה מרתקת על מנהיגות בשדה הקרב עם מפקדים בכירים שחולקים תובנות מניסיונם.',
      duration: '52:15',
      category: 'מנהיגות',
      listens: 842,
      recommendedBy: 'אל"מ דוד גבאי'
    }
  ]
};

export default function RecommendationsPage() {
  const { user } = useAuth();
  const [favoriteBooks, setFavoriteBooks] = useState<string[]>([]);
  const [favoritePodcasts, setFavoritePodcasts] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      isInFavorites(user.uid).then(favs => {
        // Filter favorites based on their prefix (e.g., "book-", "podcast-")
        setFavoriteBooks(favs.filter((fav: string) => fav.startsWith('book-')).map((fav: string) => fav.substring(5))); // Remove prefix
        setFavoritePodcasts(favs.filter((fav: string) => fav.startsWith('podcast-')).map((fav: string) => fav.substring(8))); // Remove prefix
      });
    }
  }, [user]);

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8 pt-32">
        <h1 className="text-3xl font-bold text-center mb-4">המלצות הצוות</h1>
        <p className="text-xl text-[#ff8714] text-center mb-8">תוכן נבחר במיוחד עבורך על ידי צוות המומחים שלנו</p>
        
        <AcademyNav />
        
        {/* ספרים מומלצים */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">ספרים מומלצים</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recommendations.books.map(book => (
              <div key={book.id} className="relative">
                <div className="absolute -top-3 -right-3 bg-[#ff8714] text-white text-sm font-bold px-3 py-1 rounded-full z-10">
                  המלצת {book.recommendedBy}
                </div>
                <BookCard {...book} />
              </div>
            ))}
          </div>
        </div>
        
        {/* סרטים מומלצים */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">סרטים מומלצים</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.videos.map(video => (
              <div key={video.id} className="relative">
                <div className="absolute -top-3 -right-3 bg-[#ff8714] text-white text-sm font-bold px-3 py-1 rounded-full z-10">
                  המלצת {video.recommendedBy}
                </div>
                <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className="relative aspect-video bg-gray-200">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FaPlay className="w-12 h-12 text-white opacity-75" />
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="inline-block px-2 py-1 bg-[#ff8714]/10 text-[#ff8714] text-xs font-medium rounded-full mb-2">
                      {video.category}
                    </div>
                    <h3 className="text-lg font-bold mb-1 text-gray-900">{video.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{video.instructor}</p>
                    <p className="text-sm text-gray-700 mb-2 line-clamp-2">{video.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{video.duration}</span>
                      <span>{video.views} צפיות</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* פודקאסטים מומלצים */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">פודקאסטים מומלצים</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.podcasts.map(podcast => (
              <div key={podcast.id} className="relative">
                <div className="absolute -top-3 -right-3 bg-[#ff8714] text-white text-sm font-bold px-3 py-1 rounded-full z-10">
                  המלצת {podcast.recommendedBy}
                </div>
                <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className="relative h-24 bg-[#ff8714]/10 flex items-center justify-center">
                    <FaMicrophone className="w-12 h-12 text-[#ff8714] opacity-75" />
                  </div>
                  <div className="p-4">
                    <div className="inline-block px-2 py-1 bg-[#ff8714]/10 text-[#ff8714] text-xs font-medium rounded-full mb-2">
                      {podcast.category}
                    </div>
                    <h3 className="text-lg font-bold mb-1 text-gray-900">{podcast.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">מנחה: {podcast.host}</p>
                    <p className="text-sm text-gray-700 mb-2 line-clamp-2">{podcast.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{podcast.duration}</span>
                      <span>{podcast.listens} האזנות</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
} 