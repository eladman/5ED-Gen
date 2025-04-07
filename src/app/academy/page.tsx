"use client";

import { FaPlay, FaBook, FaMicrophone, FaChevronLeft, FaChevronRight, FaHeart } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import CategorySection from '../components/CategorySection';
import Link from 'next/link';
import Image from 'next/image';
import ContentModal from '../components/ContentModal';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useAuth } from '@/lib/hooks/useAuth';
import { addToFavorites, removeFromFavorites, isInFavorites } from '@/lib/firebase/firebaseUtils';

// Dynamically import SplashScreen with no SSR
const SplashScreen = dynamic(() => import('../components/SplashScreen'), { ssr: false });

const SPOTIFY_CLIENT_ID = '86096c3b744045a898cbdf7731f63525';
const SPOTIFY_CLIENT_SECRET = '4d5f8ceee0044b2fb58bdcea0c81f555';
const SPOTIFY_SHOW_ID = '1pkoB14iPwztzO8LXkqGaR';

const getSpotifyEpisodes = async () => {
  try {
    // קבלת Access Token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // שליפת הפרקים
    const res = await fetch(
      `https://api.spotify.com/v1/shows/${SPOTIFY_SHOW_ID}/episodes?market=IL&limit=5`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const data = await res.json();
    return data.items;
  } catch (error) {
    console.error('Error fetching Spotify episodes:', error);
    return [];
  }
};

const getActionText = (category: string) => {
  switch (category) {
    case 'podcasts':
      return 'האזן';
    case 'books':
      return 'קרא';
    case 'videos':
      return 'צפה';
    default:
      return 'פתח';
  }
};

// Types
interface Item {
  id: string;
  title: string;
  description: string;
  href: string;
  category: string;
  image: string;
  duration: string;
  recommendedBy?: string;
  actionText?: string;
  spotifyId?: string;
  spotifyUrl?: string;
  applePodcastsUrl?: string;
  isFavorite?: boolean;
}

interface Category {
  id: string;
  title: string;
  icon: any;
  color: string;
  items: Item[];
}

interface AcademyContentProps {
  categories: Category[];
  isLoaded: boolean;
  handleItemClick: (e: React.MouseEvent, item: Item) => void;
  selectedItem: Item | null;
  handleCloseModal: () => void;
  checkScrollability: (elementId: string) => void;
  user: any;
  favoriteItems: string[];
  handleFavoriteClick: (e: React.MouseEvent, item: Item) => void;
}

// Client Component for Academy Content
function AcademyContent({ 
  categories, 
  isLoaded, 
  handleItemClick, 
  selectedItem, 
  handleCloseModal,
  checkScrollability,
  user,
  favoriteItems,
  handleFavoriteClick
}: AcademyContentProps) {
  return (
    <div className="min-h-screen bg-black font-heebo text-right overflow-x-hidden">
      <main className="px-4 md:px-8 py-8 pt-24 overflow-x-hidden">
        {/* Content Rows */}
        <motion.div 
          className="space-y-8 md:space-y-12 overflow-x-hidden"
          variants={containerVariants}
          initial="hidden"
          animate={isLoaded ? "show" : "hidden"}
        >
          {categories.map((category) => (
            <motion.div 
              key={category.id} 
              className="group/row relative"
              variants={itemVariants}
            >
              <div className={`flex items-center gap-3 mb-4 md:mb-6 px-2 ${category.id === 'five-fingers-podcast' ? 'justify-center w-full' : ''}`}>
                <h2 className="text-xl md:text-2xl font-bold text-white">{category.title}</h2>
              </div>

              {/* Scrolling Container */}
              <div 
                id={`scroll-${category.id}`}
                className={`flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide scroll-smooth -mx-4 md:-mx-8 px-4 md:px-8
                py-8 md:py-12 -my-8 md:-my-12 ${category.id === 'five-fingers-podcast' ? 'justify-center' : ''}`}
                style={{ 
                  scrollbarWidth: 'none', 
                  msOverflowStyle: 'none',
                  WebkitOverflowScrolling: 'touch'
                }}
                onScroll={() => checkScrollability(`scroll-${category.id}`)}
                dir="rtl"
              >
                {category.items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    className="flex-none w-[180px] md:w-[200px] group/item relative"
                    onClick={(e) => handleItemClick(e, item)}
                    variants={{
                      hidden: { opacity: 0, x: 50 },
                      show: { 
                        opacity: 1, 
                        x: 0,
                        transition: {
                          duration: 0.5,
                          delay: index * 0.1
                        }
                      }
                    }}
                  >
                    <div className="flex flex-col">
                      <div className="relative aspect-square cursor-pointer overflow-visible rounded-lg 
                        transition-all duration-300 ease-out 
                        hover:shadow-xl
                        group-hover/item:z-[999] 
                        transform-gpu hover:scale-[1.05] bg-[#282828] hover:bg-[#383838]">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover rounded-lg"
                          sizes="(max-width: 768px) 280px, 320px"
                        />
                        {user && category.id !== 'five-fingers-podcast' && (
                          <button
                            onClick={(e) => handleFavoriteClick(e, item)}
                            className="absolute bottom-2 left-2 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                          >
                            <FaHeart
                              className={`w-4 h-4 ${
                                favoriteItems.includes(item.id)
                                  ? 'text-red-500'
                                  : 'text-white'
                              }`}
                            />
                          </button>
                        )}
                      </div>
                      
                      {/* Content below image */}
                      <div className="mt-3">
                        <h3 className="text-base md:text-lg font-bold text-white line-clamp-2">
                          {item.title}
                        </h3>
                        <div className="mt-2">
                          <span className="text-sm text-gray-400">
                            המלצת {item.recommendedBy}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* Modal */}
      {selectedItem && (
        <ContentModal
          item={selectedItem}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

export default function AcademyPage() {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [scrollPositions, setScrollPositions] = useState<{ [key: string]: { canScrollLeft: boolean; canScrollRight: boolean } }>({});
  const [spotifyEpisodes, setSpotifyEpisodes] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [favoriteItems, setFavoriteItems] = useState<string[]>([]);
  const { user } = useAuth();

  interface Item {
    id: string;
    title: string;
    description: string;
    href: string;
    category: string;
    image: string;
    duration: string;
    recommendedBy?: string;
    actionText?: string;
    spotifyId?: string;
    spotifyUrl?: string;
    applePodcastsUrl?: string;
    isFavorite?: boolean;
  }

  const handleItemClick = (e: React.MouseEvent, item: Item) => {
    e.preventDefault();
    setSelectedItem(item);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  const checkScrollability = (elementId: string) => {
    const container = document.getElementById(elementId);
    if (container) {
      const canScrollLeft = container.scrollLeft > 20;
      const canScrollRight = container.scrollLeft < (container.scrollWidth - container.clientWidth - 20);
      
      setScrollPositions(prev => ({
        ...prev,
        [elementId]: { canScrollLeft, canScrollRight }
      }));
    }
  };

  const handleScroll = (direction: 'left' | 'right', elementId: string) => {
    const container = document.getElementById(elementId);
    if (container) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      
      checkScrollability(elementId);
      setTimeout(() => checkScrollability(elementId), 300);
    }
  };

  useEffect(() => {
    categories.forEach(category => {
      checkScrollability(`scroll-${category.id}`);
    });

    const handleResize = () => {
      categories.forEach(category => {
        checkScrollability(`scroll-${category.id}`);
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchEpisodes = async () => {
      const episodes = await getSpotifyEpisodes();
      setSpotifyEpisodes(episodes);
    };
    fetchEpisodes();
  }, []);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const loadFavorites = async () => {
      if (user) {
        try {
          const favorites = await isInFavorites(user.uid);
          setFavoriteItems(favorites);
        } catch (error) {
          console.error('Error loading favorites:', error);
        }
      }
    };

    loadFavorites();
  }, [user]);

  const handleFavoriteClick = async (e: React.MouseEvent, item: Item) => {
    e.stopPropagation();
    if (!user) return;

    try {
      if (favoriteItems.includes(item.id)) {
        await removeFromFavorites(user.uid, item.id);
        setFavoriteItems(prev => prev.filter(id => id !== item.id));
      } else {
        await addToFavorites(user.uid, item.id);
        setFavoriteItems(prev => [...prev, item.id]);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const categories = [
    {
      id: 'five-fingers-podcast',
      title: 'מבית חמש אצבעות',
      icon: FaMicrophone,
      color: 'podcasts',
      items: [
        {
          id: 'five-fingers-main',
          title: 'הפודקאסט של חמש אצבעות',
          description: 'פודקאסט שבועי על חינוך, תרבות ומנהיגות',
          href: 'https://open.spotify.com/show/1pkoB14iPwztzO8LXkqGaR',
          category: 'five-fingers-podcast',
          image: '/images/hamesh/Podcast.png',
          duration: 'פודקאסט שבועי',
          recommendedBy: 'חמש אצבעות',
          spotifyUrl: 'https://open.spotify.com/show/1pkoB14iPwztzO8LXkqGaR',
          applePodcastsUrl: 'https://podcasts.apple.com/il/podcast/%D7%97%D7%9E%D7%A9-%D7%90%D7%A6%D7%91%D7%A2%D7%95%D7%AA-%D7%97%D7%99%D7%A0%D7%95%D7%9A-%D7%AA%D7%A8%D7%91%D7%95%D7%AA-%D7%9E%D7%A0%D7%94%D7%99%D7%92%D7%95%D7%AA/id1480173467',
          isFavorite: favoriteItems.includes('five-fingers-main')
        },
        {
          id: 'five-fingers-lectures',
          title: 'הרצאות חמש אצבעות',
          description: 'סדרת הרצאות מרתקות על חינוך ומנהיגות',
          href: 'https://www.youtube.com/playlist?list=PLvlNhUzVZPwl-qWGuA_g31gEEAKIjwCKn',
          category: 'five-fingers-lectures',
          image: '/images/hamesh/Podcast.png',
          duration: 'סדרת הרצאות',
          recommendedBy: 'חמש אצבעות',
          isFavorite: favoriteItems.includes('five-fingers-lectures')
        },
        {
          id: 'five-fingers-magazine',
          title: 'המגזין',
          description: 'מגזין דיגיטלי על חינוך, תרבות ומנהיגות',
          href: 'https://www.5fingers.co.il/',
          category: 'five-fingers-magazine',
          image: '/images/hamesh/Podcast.png',
          duration: 'מגזין דיגיטלי',
          recommendedBy: 'חמש אצבעות',
          isFavorite: favoriteItems.includes('five-fingers-magazine')
        }
      ]
    },
    {
      id: 'books',
      title: 'ספרים מובילים',
      icon: FaBook,
      color: 'books',
      items: [
        {
          id: 'wisdom-of-indifference',
          title: 'חוכמת האדישות',
          description: 'ספר על התמודדות עם אתגרים ומציאת שלווה פנימית',
          href: '#',
          category: 'books',
          image: '/images/books/Wisdom of Indifference Cover.jpg',
          duration: '200 עמודים',
          recommendedBy: 'חמש אצבעות',
          isFavorite: favoriteItems.includes('wisdom-of-indifference')
        },
        {
          id: 'grit',
          title: 'נחישות',
          description: 'כוחה של התשוקה וההתמדה מאת אנג׳לה דאקוורת',
          href: '#',
          category: 'books',
          image: '/images/books/Grit Angela Dakworth.jpg',
          duration: '400 עמודים',
          recommendedBy: 'חמש אצבעות',
          isFavorite: favoriteItems.includes('grit')
        },
        {
          id: '12-rules',
          title: '12 כללים לחיים',
          description: 'נוגדן לכאוס מאת ג׳ורדן פיטרסון',
          href: '#',
          category: 'books',
          image: '/images/books/12-rules-for-life.jpeg',
          duration: '448 עמודים',
          recommendedBy: 'חמש אצבעות',
          isFavorite: favoriteItems.includes('12-rules')
        },
        {
          id: 'flexible-brain',
          title: 'המוח הגמיש',
          description: 'כיצד המוח משנה את עצמו - נוירופלסטיות ומדע המוח המודרני',
          href: '#',
          category: 'books',
          image: '/images/books/המוח הגמיש.jpg',
          duration: '448 עמודים',
          recommendedBy: 'חמש אצבעות',
          isFavorite: favoriteItems.includes('flexible-brain')
        },
        {
          id: 'beyond-limits',
          title: 'Beyond Limits',
          description: 'מסע מעורר השראה אל מעבר לגבולות האפשרי מאת אלון אולמן',
          href: '#',
          category: 'books',
          image: '/images/books/Beyond Limits Alon Ullman.jpg',
          duration: '300 עמודים',
          recommendedBy: 'חמש אצבעות',
          isFavorite: favoriteItems.includes('beyond-limits')
        },
        {
          id: 'who-moved-my-cheese',
          title: 'מי הזיז את הגבינה שלי?',
          description: 'ספר מעורר השראה על התמודדות עם שינויים בחיים ובעבודה',
          href: '#',
          category: 'books',
          image: '/images/books/Who Moved My Cheese.jpg',
          duration: '96 עמודים',
          recommendedBy: 'חמש אצבעות',
          isFavorite: favoriteItems.includes('who-moved-my-cheese')
        },
        {
          id: 'michael-master',
          title: 'Michael Master',
          description: 'מסע של התפתחות אישית והעצמה',
          href: '#',
          category: 'books',
          image: '/images/books/Michael Master.jpg',
          duration: '250 עמודים',
          recommendedBy: 'חמש אצבעות',
          isFavorite: favoriteItems.includes('michael-master')
        },
        {
          id: 'what-doesnt-kill',
          title: 'מה שלא הורג',
          description: 'כיצד להתמודד עם אתגרים ולצמוח מהם',
          href: '#',
          category: 'books',
          image: '/images/books/מה שלא הורג.jpg',
          duration: '280 עמודים',
          recommendedBy: 'חמש אצבעות',
          isFavorite: favoriteItems.includes('what-doesnt-kill')
        }
      ]
    },
    {
      id: 'videos',
      title: 'סרטים מובילים',
      icon: FaPlay,
      color: 'videos',
      items: [
        {
          id: '1',
          title: 'אימון כוח למתקדמים',
          description: 'סדרת תרגילים מתקדמים לבניית כוח פיזי',
          href: '/academy/videos/1',
          category: 'videos',
          image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop',
          duration: '15 דקות',
          recommendedBy: 'רס"ן גיא אברהם',
          isFavorite: favoriteItems.includes('1')
        },
        {
          id: '2',
          title: 'טכניקות לחימה',
          description: 'הדרכה מקיפה על טכניקות לחימה מתקדמות',
          href: '/academy/videos/2',
          category: 'videos',
          image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=1000&auto=format&fit=crop',
          duration: '20 דקות',
          isFavorite: favoriteItems.includes('2')
        },
        {
          id: '3',
          title: 'אימון מנטלי',
          description: 'סדרת תרגילים לשיפור החוסן המנטלי',
          href: '/academy/videos/3',
          category: 'videos',
          image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop',
          duration: '10 דקות',
          isFavorite: favoriteItems.includes('3')
        },
        {
          id: '4',
          title: 'תזונה נכונה',
          description: 'מדריך וידאו לתזונה מותאמת ללוחמים',
          actionText: 'צפה',
          href: '/academy/videos/4',
          category: 'videos',
          image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1000&auto=format&fit=crop',
          duration: '25 דקות',
          isFavorite: favoriteItems.includes('4')
        },
        {
          id: '5',
          title: 'טכניקות התאוששות',
          description: 'מדריך להתאוששות מהירה אחרי אימונים',
          actionText: 'צפה',
          href: '/academy/videos/5',
          category: 'videos',
          image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?q=80&w=1000&auto=format&fit=crop',
          duration: '18 דקות',
          isFavorite: favoriteItems.includes('5')
        }
      ]
    },
    {
      id: 'podcasts',
      title: 'פודקאסטים מובילים',
      icon: FaMicrophone,
      color: 'podcasts',
      items: [
        {
          id: '1',
          title: 'מנהיגות בשדה הקרב',
          description: 'שיחה מרתקת על מנהיגות בשדה הקרב עם מפקדים בכירים',
          href: '/academy/podcasts/1',
          category: 'podcasts',
          image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?q=80&w=1000&auto=format&fit=crop',
          duration: '45 דקות',
          recommendedBy: 'סא"ל יובל כהן',
          isFavorite: favoriteItems.includes('1')
        },
        {
          id: '2',
          title: 'אימון מנטלי למתקדמים',
          description: 'טכניקות מתקדמות לשיפור היכולות המנטליות בקרב',
          href: '/academy/podcasts/2',
          category: 'podcasts',
          image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop',
          duration: '35 דקות',
          recommendedBy: 'רס"ן דן לוי',
          isFavorite: favoriteItems.includes('2')
        },
        {
          id: '3',
          title: 'תזונה ללוחם',
          description: 'מדריך מקיף לתזונה נכונה לשיפור ביצועים',
          href: '/academy/podcasts/3',
          category: 'podcasts',
          image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1000&auto=format&fit=crop',
          duration: '40 דקות',
          recommendedBy: 'סרן עמית ישראלי',
          isFavorite: favoriteItems.includes('3')
        },
        {
          id: '4',
          title: 'טכניקות לחימה מתקדמות',
          description: 'שיחה עם מומחים לטכניקות לחימה מודרניות',
          actionText: 'האזן',
          href: '/academy/podcasts/4',
          category: 'podcasts',
          image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=1000&auto=format&fit=crop',
          duration: '50 דקות',
          isFavorite: favoriteItems.includes('4')
        },
        {
          id: '5',
          title: 'אימון כוח פונקציונלי',
          description: 'מדריך לאימון כוח מותאם ללוחמים',
          actionText: 'האזן',
          href: '/academy/podcasts/5',
          category: 'podcasts',
          image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop',
          duration: '30 דקות',
          isFavorite: favoriteItems.includes('5')
        }
      ]
    }
  ];

  return (
    <main>
      {showSplash ? (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      ) : (
        <AcademyContent 
          categories={categories}
          isLoaded={isLoaded}
          handleItemClick={handleItemClick}
          selectedItem={selectedItem}
          handleCloseModal={handleCloseModal}
          checkScrollability={checkScrollability}
          user={user}
          favoriteItems={favoriteItems}
          handleFavoriteClick={handleFavoriteClick}
        />
      )}
    </main>
  );
} 