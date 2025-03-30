"use client";

import { useState, useEffect } from 'react';
import { FaSearch, FaMicrophone, FaHeart } from 'react-icons/fa';
import { useAuth } from '@/lib/hooks/useAuth';
import { db } from '@/lib/firebase/firebase';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';

const podcasts = [
  {
    id: '1',
    title: 'מסע להצלחה',
    host: 'גיא הוכמן',
    description: 'פודקאסט שבועי עם אנשי מפתח בתעשייה שחולקים את סיפור ההצלחה שלהם והתובנות שצברו בדרך',
    category: 'הצלחה',
    episodes: 156,
    rating: 4.9,
    image: 'https://example.com/podcast1.jpg'
  },
  {
    id: '2',
    title: 'חוכמת הרגש',
    host: 'ד״ר טל בן שחר',
    description: 'פודקאסט העוסק באינטליגנציה רגשית, מודעות עצמית ופיתוח כישורים רגשיים',
    category: 'מודעות',
    episodes: 89,
    rating: 4.8,
    image: 'https://example.com/podcast2.jpg'
  },
  {
    id: '3',
    title: 'מנהיגות והשפעה',
    host: 'רונית רפאל',
    description: 'שיחות עם מנהיגים מובילים על פיתוח מיומנויות מנהיגות והשפעה חיובית',
    category: 'מנהיגות',
    episodes: 124,
    rating: 4.7,
    image: 'https://example.com/podcast3.jpg'
  },
  {
    id: '4',
    title: 'פסיכולוגיה מעשית',
    host: 'פרופ׳ יורם יובל',
    description: 'הסברים מעשיים על תהליכים פסיכולוגיים וכלים ליישום בחיי היומיום',
    category: 'פסיכולוגיה',
    episodes: 203,
    rating: 4.9,
    image: 'https://example.com/podcast4.jpg'
  },
  {
    id: '5',
    title: 'יצירתיות וחדשנות',
    host: 'מיכל אנסקי',
    description: 'פודקאסט המתמקד בפיתוח חשיבה יצירתית וחדשנית בעולם המודרני',
    category: 'יצירתיות',
    episodes: 67,
    rating: 4.6,
    image: 'https://example.com/podcast5.jpg'
  },
  {
    id: '6',
    title: 'איזון עבודה-חיים',
    host: 'שירלי לוי',
    description: 'טיפים ואסטרטגיות ליצירת איזון בריא בין קריירה לחיים אישיים',
    category: 'איזון',
    episodes: 92,
    rating: 4.8,
    image: 'https://example.com/podcast6.jpg'
  }
];

const categories = ['הכל', 'מועדפים', 'הצלחה', 'מודעות', 'מנהיגות', 'פסיכולוגיה', 'יצירתיות', 'איזון'];

export default function PodcastsSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('הכל');
  const [favorites, setFavorites] = useState<string[]>([]);
  const { user } = useAuth();

  // Load favorites from Firebase and listen for real-time updates
  useEffect(() => {
    let unsubscribe: () => void;

    const setupFavorites = async () => {
      if (!user) {
        const savedFavorites = localStorage.getItem('podcastFavorites');
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
            setFavorites(userData.favoritePodcasts || []);
            // Update localStorage
            localStorage.setItem('podcastFavorites', JSON.stringify(userData.favoritePodcasts || []));
          }
        });

        // Initial load
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          const savedFavorites = localStorage.getItem('podcastFavorites');
          if (savedFavorites) {
            const favoritesArray = JSON.parse(savedFavorites);
            await setDoc(userDocRef, { favoritePodcasts: favoritesArray }, { merge: true });
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

  const toggleFavorite = async (podcastId: string) => {
    if (!user) {
      // אם המשתמש לא מחובר, שומרים רק ב-localStorage
      const newFavorites = favorites.includes(podcastId)
        ? favorites.filter(id => id !== podcastId)
        : [...favorites, podcastId];
      
      setFavorites(newFavorites);
      localStorage.setItem('podcastFavorites', JSON.stringify(newFavorites));
      return;
    }

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const newFavorites = favorites.includes(podcastId)
        ? favorites.filter(id => id !== podcastId)
        : [...favorites, podcastId];

      await setDoc(userDocRef, { favoritePodcasts: newFavorites }, { merge: true });
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const filteredPodcasts = podcasts.filter(podcast => {
    const matchesSearch = podcast.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         podcast.host.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         podcast.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === 'הכל' ? true :
      selectedCategory === 'מועדפים' ? favorites.includes(podcast.id) :
      podcast.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-center">פודקאסטים מומלצים</h2>
      
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
            <div className="relative h-48 bg-[#ff8714]/10 flex items-center justify-center">
              <FaMicrophone className="w-12 h-12 text-[#ff8714] opacity-75" />
              <button
                onClick={() => toggleFavorite(podcast.id)}
                className="absolute top-4 left-4 p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors"
              >
                <FaHeart 
                  className={`w-5 h-5 ${
                    favorites.includes(podcast.id) 
                      ? 'text-red-500' 
                      : 'text-gray-300'
                  }`} 
                />
              </button>
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 text-white rounded text-sm">
                {podcast.episodes} פרקים
              </div>
            </div>
            <div className="p-4">
              <div className="inline-block px-2 py-1 bg-[#ff8714]/10 text-[#ff8714] text-xs font-medium rounded-full mb-2">
                {podcast.category}
              </div>
              <h3 className="text-lg font-bold mb-1 text-gray-900">{podcast.title}</h3>
              <p className="text-sm text-gray-600 mb-2">מנחה: {podcast.host}</p>
              <p className="text-sm text-gray-700 mb-2 line-clamp-2">{podcast.description}</p>
              <div className="flex items-center justify-end text-sm text-gray-500">
                <span>⭐ {podcast.rating}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredPodcasts.length === 0 && (
        <div className="text-center py-16">
          <div className="text-gray-500 text-lg">
            {selectedCategory === 'מועדפים' 
              ? user 
                ? 'עדיין לא סימנת פודקאסטים כמועדפים'
                : 'התחבר כדי לשמור פודקאסטים מועדפים'
              : 'לא נמצאו פודקאסטים מתאימים לחיפוש שלך'
            }
          </div>
        </div>
      )}
    </div>
  );
} 