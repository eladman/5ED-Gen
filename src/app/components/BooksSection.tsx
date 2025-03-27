"use client";

import { useState } from 'react';
import BookCard from '@/app/components/BookCard';
import { FaSearch } from 'react-icons/fa';

const books = [
  {
    id: '1',
    title: 'אמנות המלחמה',
    author: 'סון דזה',
    description: 'ספר קלאסי על אסטרטגיה צבאית שמיושם גם בעסקים ובחיים האישיים. הספר מלמד על חשיבה אסטרטגית, מנהיגות, וניהול משאבים.',
    rating: 5,
    category: 'אסטרטגיה',
    likes: 124
  },
  {
    id: '2',
    title: 'גוף ונפש של לוחם',
    author: 'פיט בלייבר',
    description: 'מדריך מקיף לאימון מנטלי וגופני של לוחמים. הספר מתמקד בבניית חוסן נפשי, מוטיבציה, והתמודדות עם לחץ.',
    rating: 4,
    category: 'אימון מנטלי',
    likes: 89
  },
  {
    id: '3',
    title: 'כושר קרבי',
    author: 'מארק דה לוקה',
    description: 'מדריך מעשי לבניית כושר קרבי. כולל תוכניות אימון, תזונה, והכנה פיזית ומנטלית למשימות מבצעיות.',
    rating: 5,
    category: 'אימון גופני',
    likes: 156
  }
];

const categories = ['הכל', 'אסטרטגיה', 'אימון מנטלי', 'אימון גופני'];

export default function BooksSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('הכל');

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'הכל' || book.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-center">ספרים</h2>
      
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="חפש ספרים..."
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