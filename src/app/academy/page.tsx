"use client";

import { FaPlay, FaBook, FaMicrophone } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import CategorySection from '../components/CategorySection';

export default function AcademyPage() {
  const categories = [
    {
      id: 'podcasts',
      title: 'פודקאסטים',
      icon: FaMicrophone,
      color: 'podcasts',
      items: [
        {
          id: '1',
          title: 'מנהיגות בשדה הקרב',
          description: 'שיחה מרתקת על מנהיגות בשדה הקרב עם מפקדים בכירים',
          href: '/academy/podcasts/1',
          category: 'podcasts',
          image: '/images/podcasts/leadership.jpg'
        },
        {
          id: '2',
          title: 'אימון מנטלי למתקדמים',
          description: 'טכניקות מתקדמות לשיפור היכולות המנטליות בקרב',
          href: '/academy/podcasts/2',
          category: 'podcasts',
          image: '/images/podcasts/mental.jpg'
        },
        {
          id: '3',
          title: 'תזונה ללוחם',
          description: 'מדריך מקיף לתזונה נכונה לשיפור ביצועים',
          href: '/academy/podcasts/3',
          category: 'podcasts',
          image: '/images/podcasts/nutrition.jpg'
        },
        {
          id: '4',
          title: 'טכניקות לחימה מתקדמות',
          description: 'שיחה עם מומחים לטכניקות לחימה מודרניות',
          actionText: 'האזן',
          href: '/academy/podcasts/4',
          image: '/images/podcasts/combat.jpg',
          category: 'podcasts'
        },
        {
          id: '5',
          title: 'אימון כוח פונקציונלי',
          description: 'מדריך לאימון כוח מותאם ללוחמים',
          actionText: 'האזן',
          href: '/academy/podcasts/5',
          image: '/images/podcasts/strength.jpg',
          category: 'podcasts'
        }
      ]
    },
    {
      id: 'books',
      title: 'ספרים',
      icon: FaBook,
      color: 'books',
      items: [
        {
          id: '1',
          title: 'אמנות המלחמה',
          description: 'ספר קלאסי על אסטרטגיה צבאית מאת סון דזה',
          href: '/academy/books/1',
          category: 'books',
          image: '/images/books/art-of-war.jpg'
        },
        {
          id: '2',
          title: 'מנהיגות בשדה הקרב',
          description: 'ניתוח מקרי מנהיגות בקרבות מודרניים',
          href: '/academy/books/2',
          category: 'books',
          image: '/images/books/leadership.jpg'
        },
        {
          id: '3',
          title: 'המדריך ללוחם המודרני',
          description: 'מדריך מקיף לכל תחומי הלחימה המודרנית',
          href: '/academy/books/3',
          category: 'books',
          image: '/images/books/modern-warrior.jpg'
        },
        {
          id: '4',
          title: 'פסיכולוגיה של לחימה',
          description: 'ניתוח פסיכולוגי של מצבי לחימה',
          actionText: 'קרא',
          href: '/academy/books/4',
          image: '/images/books/psychology.jpg',
          category: 'books'
        },
        {
          id: '5',
          title: 'תזונה ללוחם',
          description: 'מדריך לתזונה מותאמת ללוחמים',
          actionText: 'קרא',
          href: '/academy/books/5',
          image: '/images/books/nutrition.jpg',
          category: 'books'
        }
      ]
    },
    {
      id: 'videos',
      title: 'סרטים',
      icon: FaPlay,
      color: 'videos',
      items: [
        {
          id: '1',
          title: 'אימון כוח למתקדמים',
          description: 'סדרת תרגילים מתקדמים לבניית כוח פיזי',
          href: '/academy/videos/1',
          category: 'videos',
          image: '/images/videos/strength.jpg'
        },
        {
          id: '2',
          title: 'טכניקות לחימה',
          description: 'הדרכה מקיפה על טכניקות לחימה מתקדמות',
          href: '/academy/videos/2',
          category: 'videos',
          image: '/images/videos/combat.jpg'
        },
        {
          id: '3',
          title: 'אימון מנטלי',
          description: 'סדרת תרגילים לשיפור החוסן המנטלי',
          href: '/academy/videos/3',
          category: 'videos',
          image: '/images/videos/mental.jpg'
        },
        {
          id: '4',
          title: 'תזונה נכונה',
          description: 'מדריך וידאו לתזונה מותאמת ללוחמים',
          actionText: 'צפה',
          href: '/academy/videos/4',
          image: '/images/videos/nutrition.jpg',
          category: 'videos'
        },
        {
          id: '5',
          title: 'טכניקות התאוששות',
          description: 'מדריך להתאוששות מהירה אחרי אימונים',
          actionText: 'צפה',
          href: '/academy/videos/5',
          image: '/images/videos/recovery.jpg',
          category: 'videos'
        }
      ]
    }
  ];

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-6 pt-24">
        <h1 className="text-3xl font-bold text-center mb-2 text-[#ff8714]">האקדמיה של חמש</h1>
        <p className="text-lg text-center mb-8 text-gray-600">המקום להתפתח, ללמוד ולהתקדם</p>
        
        {/* קטגוריות תוכן */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((category) => (
            <CategorySection key={category.id} {...category} />
          ))}
        </div>
      </div>
    </main>
  );
} 