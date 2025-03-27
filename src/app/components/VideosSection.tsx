"use client";

import { useState } from 'react';
import { FaSearch, FaPlay } from 'react-icons/fa';

const videos = [
  {
    id: '1',
    title: 'אימון כוח מתקדם',
    instructor: 'דן כהן',
    description: 'סרטון הדרכה מקיף על טכניקות אימון כוח מתקדמות, כולל תרגילים מורכבים והסברים מפורטים.',
    duration: '45:30',
    category: 'אימון גופני',
    views: 1234
  },
  {
    id: '2',
    title: 'טכניקות לחימה',
    instructor: 'יוסי לוי',
    description: 'מדריך מקיף לטכניקות לחימה בסיסיות ומתקדמות, כולל הדגמות ותרגול מעשי.',
    duration: '38:15',
    category: 'אסטרטגיה',
    views: 856
  },
  {
    id: '3',
    title: 'אימון מנטלי',
    instructor: 'מיכל דהן',
    description: 'סרטון על טכניקות אימון מנטלי, כולל תרגילי נשימה, מדיטציה והתמודדות עם לחץ.',
    duration: '32:45',
    category: 'אימון מנטלי',
    views: 654
  }
];

const categories = ['הכל', 'אסטרטגיה', 'אימון מנטלי', 'אימון גופני'];

export default function VideosSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('הכל');

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'הכל' || video.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-center">סרטונים</h2>
      
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="חפש סרטונים..."
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

      {/* Videos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map(video => (
          <div key={video.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
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
        ))}
      </div>

      {/* Empty State */}
      {filteredVideos.length === 0 && (
        <div className="text-center py-16">
          <div className="text-gray-500 text-lg">לא נמצאו סרטונים מתאימים לחיפוש שלך</div>
        </div>
      )}
    </div>
  );
} 