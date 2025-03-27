"use client";

import { useState } from 'react';
import { FaSearch, FaMicrophone } from 'react-icons/fa';

const podcasts = [
  {
    id: '1',
    title: 'מנהיגות בשדה הקרב',
    host: 'מיכל גולן',
    guests: ['יוסי כהן', 'דני אבידן'],
    description: 'שיחה מרתקת על מנהיגות בשדה הקרב עם מפקדים בכירים שחולקים תובנות מניסיונם.',
    duration: '52:15',
    category: 'מנהיגות',
    listens: 842
  },
  {
    id: '2',
    title: 'פסיכולוגיה של לוחמים',
    host: 'דר. יעל אבני',
    guests: ['פרופ. רן כהן'],
    description: 'ניתוח מעמיק של האתגרים הפסיכולוגיים שלוחמים מתמודדים איתם ודרכי התמודדות מומלצות.',
    duration: '45:30',
    category: 'אימון מנטלי',
    listens: 567
  },
  {
    id: '3',
    title: 'טכניקות אימון חדשניות',
    host: 'רון לביא',
    guests: ['שירה כהן', 'מיקי גל'],
    description: 'דיון על שיטות אימון חדשניות שעוזרות לשפר ביצועים פיזיים ומנטליים.',
    duration: '38:20',
    category: 'אימון גופני',
    listens: 723
  }
];

const categories = ['הכל', 'מנהיגות', 'אימון מנטלי', 'אימון גופני', 'אסטרטגיה'];

export default function PodcastsSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('הכל');

  const filteredPodcasts = podcasts.filter(podcast => {
    const matchesSearch = podcast.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         podcast.host.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         podcast.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'הכל' || podcast.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-center">פודקאסטים</h2>
      
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="חפש פודקאסטים..."
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

      {/* Podcasts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPodcasts.map(podcast => (
          <div key={podcast.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
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
        ))}
      </div>

      {/* Empty State */}
      {filteredPodcasts.length === 0 && (
        <div className="text-center py-16">
          <div className="text-gray-500 text-lg">לא נמצאו פודקאסטים מתאימים לחיפוש שלך</div>
        </div>
      )}
    </div>
  );
} 