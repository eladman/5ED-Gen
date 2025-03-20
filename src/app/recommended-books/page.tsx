"use client";

import { useState } from 'react';
import BookCard from '@/app/components/BookCard';
import { FaSearch, FaFilter } from 'react-icons/fa';

// נתונים לדוגמה - בהמשך נעביר למקום מסודר יותר
const recommendedBooks = [
  {
    id: '1',
    title: 'אמנות המלחמה',
    author: 'סון דזה',
    description: 'ספר קלאסי על אסטרטגיה צבאית שמיושם גם בעסקים ובחיים האישיים. הספר מלמד על חשיבה אסטרטגית, מנהיגות, וניהול משאבים.',
    imageUrl: 'https://m.media-amazon.com/images/I/71JUJ7nQ-GL._AC_UF1000,1000_QL80_.jpg',
    rating: 5,
    amazonLink: 'https://www.amazon.com/Art-War-Sun-Tzu/dp/1599869772',
    category: 'אסטרטגיה'
  },
  {
    id: '2',
    title: 'גוף ונפש של לוחם',
    author: 'פיט בלייבר',
    description: 'מדריך מקיף לאימון מנטלי וגופני של לוחמים. הספר מתמקד בבניית חוסן נפשי, מוטיבציה, והתמודדות עם לחץ.',
    imageUrl: 'https://m.media-amazon.com/images/I/61KI7oL+dYL._AC_UF1000,1000_QL80_.jpg',
    rating: 4,
    amazonLink: 'https://www.amazon.com/Warriors-Mind-Body-Pete-Blaber/dp/0425236579',
    category: 'אימון מנטלי'
  },
  {
    id: '3',
    title: 'כושר קרבי',
    author: 'מארק דה לוקה',
    description: 'מדריך מעשי לבניית כושר קרבי. כולל תוכניות אימון, תזונה, והכנה פיזית ומנטלית למשימות מבצעיות.',
    imageUrl: 'https://m.media-amazon.com/images/I/71QR7+t+THL._AC_UF1000,1000_QL80_.jpg',
    rating: 5,
    amazonLink: 'https://www.amazon.com/Combat-Fitness-Guide-Military-Training/dp/1544941835',
    category: 'אימון גופני'
  }
];

const categories = ['הכל', 'אסטרטגיה', 'אימון מנטלי', 'אימון גופני'];

export default function RecommendedBooksPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('הכל');

  const filteredBooks = recommendedBooks.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'הכל' || book.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">ספרים מומלצים</h1>
      
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="חפש לפי כותרת, מחבר או תיאור..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2 pr-10 pl-4 text-right bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8714] text-black shadow-sm"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-[#ff8714] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredBooks.map(book => (
          <BookCard key={book.id} {...book} />
        ))}
      </div>

      {/* Empty State */}
      {filteredBooks.length === 0 && (
        <div className="text-center py-16">
          <div className="text-gray-500 text-lg">לא נמצאו ספרים מתאימים לחיפוש שלך</div>
        </div>
      )}
    </div>
  );
} 