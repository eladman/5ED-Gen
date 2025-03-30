"use client";

import { useState, useEffect } from 'react';
import { FaSearch, FaVideo, FaHeart } from 'react-icons/fa';
import { useAuth } from '@/lib/hooks/useAuth';
import { db } from '@/lib/firebase/firebase';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';

const videos = [
  {
    id: '1',
    title: 'כוחו של הרגל',
    creator: 'TED',
    description: 'הרצאת TED מרתקת על כיצד הרגלים משפיעים על חיינו ואיך ניתן לשנות אותם',
    category: 'הרגלים',
    duration: '18:34',
    rating: 4.8,
    thumbnail: 'https://img.youtube.com/vi/9vJRopau0g0/maxresdefault.jpg'
  },
  {
    id: '2',
    title: 'איך למצוא את הייעוד שלך',
    creator: 'Simon Sinek',
    description: 'סיימון סינק מסביר כיצד למצוא את ה-WHY שלך ולחיות חיים משמעותיים יותר',
    category: 'משמעות',
    duration: '45:12',
    rating: 4.9,
    thumbnail: 'https://img.youtube.com/vi/u4ZoJKF_VuA/maxresdefault.jpg'
  },
  {
    id: '3',
    title: 'הדרך להצלחה',
    creator: 'Tony Robbins',
    description: 'טוני רובינס מדבר על האסטרטגיות המובילות להצלחה בכל תחום בחיים',
    category: 'הצלחה',
    duration: '1:02:45',
    rating: 4.7,
    thumbnail: 'https://img.youtube.com/vi/Cpc-t-Uwv1I/maxresdefault.jpg'
  },
  {
    id: '4',
    title: 'כוחה של פגיעות',
    creator: 'Brené Brown',
    description: 'ברנה בראון מדברת על חשיבות הפגיעות והאומץ בחיינו',
    category: 'העצמה',
    duration: '20:19',
    rating: 4.9,
    thumbnail: 'https://img.youtube.com/vi/iCvmsMzlF7o/maxresdefault.jpg'
  },
  {
    id: '5',
    title: 'מיינדפולנס ומדיטציה',
    creator: 'Headspace',
    description: 'מדריך מעשי לתרגול מיינדפולנס ומדיטציה בחיי היומיום',
    category: 'מודעות',
    duration: '15:23',
    rating: 4.6,
    thumbnail: 'https://img.youtube.com/vi/quyXS4a0JGQ/maxresdefault.jpg'
  },
  {
    id: '6',
    title: 'ניהול זמן אפקטיבי',
    creator: 'Brian Tracy',
    description: 'טכניקות מעשיות לניהול זמן יעיל והגברת הפרודוקטיביות',
    category: 'פרודוקטיביות',
    duration: '52:18',
    rating: 4.8,
    thumbnail: 'https://img.youtube.com/vi/GHBN7qpdP7M/maxresdefault.jpg'
  }
];

const categories = ['הכל', 'מועדפים', 'הרגלים', 'משמעות', 'הצלחה', 'העצמה', 'מודעות', 'פרודוקטיביות'];

export default function VideosSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('הכל');
  const [favorites, setFavorites] = useState<string[]>([]);
  const { user } = useAuth();

  // Load favorites from Firebase and listen for real-time updates
  useEffect(() => {
    let unsubscribe: () => void;

    const setupFavorites = async () => {
      if (!user) {
        const savedFavorites = localStorage.getItem('videoFavorites');
        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites));
        }
        return;
      }

      try {
        const userDocRef = doc(db, 'users', user.uid);
        
        // Subscribe to real-time updates
        unsubscribe = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            const userData = doc.data();
            setFavorites(userData.favoriteVideos || []);
            // Update localStorage
            localStorage.setItem('videoFavorites', JSON.stringify(userData.favoriteVideos || []));
          }
        });

        // Initial load
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          const savedFavorites = localStorage.getItem('videoFavorites');
          if (savedFavorites) {
            const favoritesArray = JSON.parse(savedFavorites);
            await setDoc(userDocRef, { favoriteVideos: favoritesArray }, { merge: true });
          }
        }
      } catch (error) {
        console.error('Error setting up favorites:', error);
      }
    };

    setupFavorites();

    // Cleanup subscription
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  const toggleFavorite = async (videoId: string) => {
    if (!user) {
      // אם המשתמש לא מחובר, שומרים רק ב-localStorage
      const newFavorites = favorites.includes(videoId)
        ? favorites.filter(id => id !== videoId)
        : [...favorites, videoId];
      
      setFavorites(newFavorites);
      localStorage.setItem('videoFavorites', JSON.stringify(newFavorites));
      return;
    }

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const newFavorites = favorites.includes(videoId)
        ? favorites.filter(id => id !== videoId)
        : [...favorites, videoId];

      await setDoc(userDocRef, { favoriteVideos: newFavorites }, { merge: true });
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.creator.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === 'הכל' ? true :
      selectedCategory === 'מועדפים' ? favorites.includes(video.id) :
      video.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-center">סרטונים מומלצים</h2>
      
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
            <div className="relative h-48 bg-[#ff8714]/10 flex items-center justify-center">
              <FaVideo className="w-12 h-12 text-[#ff8714] opacity-75" />
              <button
                onClick={() => toggleFavorite(video.id)}
                className="absolute top-4 left-4 p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors"
              >
                <FaHeart 
                  className={`w-5 h-5 ${
                    favorites.includes(video.id) 
                      ? 'text-red-500' 
                      : 'text-gray-300'
                  }`} 
                />
              </button>
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 text-white rounded text-sm">
                {video.duration}
              </div>
            </div>
            <div className="p-4">
              <div className="inline-block px-2 py-1 bg-[#ff8714]/10 text-[#ff8714] text-xs font-medium rounded-full mb-2">
                {video.category}
              </div>
              <h3 className="text-lg font-bold mb-1 text-gray-900">{video.title}</h3>
              <p className="text-sm text-gray-600 mb-2">יוצר: {video.creator}</p>
              <p className="text-sm text-gray-700 mb-2 line-clamp-2">{video.description}</p>
              <div className="flex items-center justify-end text-sm text-gray-500">
                <span>⭐ {video.rating}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredVideos.length === 0 && (
        <div className="text-center py-16">
          <div className="text-gray-500 text-lg">
            {selectedCategory === 'מועדפים' 
              ? user 
                ? 'עדיין לא סימנת סרטונים כמועדפים'
                : 'התחבר כדי לשמור סרטונים מועדפים'
              : 'לא נמצאו סרטונים מתאימים לחיפוש שלך'
            }
          </div>
        </div>
      )}
    </div>
  );
} 