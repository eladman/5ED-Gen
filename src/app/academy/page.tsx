"use client";

import { FaPlay, FaBook, FaMicrophone, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import CategorySection from '../components/CategorySection';
import Link from 'next/link';
import Image from 'next/image';
import ContentModal from '../components/ContentModal';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

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

export default function AcademyPage() {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [scrollPositions, setScrollPositions] = useState<{ [key: string]: { canScrollLeft: boolean; canScrollRight: boolean } }>({});
  const [spotifyEpisodes, setSpotifyEpisodes] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

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
  }

  const handleItemClick = (e: React.MouseEvent, item: Item) => {
    e.preventDefault();
    if (item.category === 'five-fingers-podcast') {
      window.open(item.href, '_blank');
      return;
    }
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

  const categories = [
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
          recommendedBy: 'סא"ל יובל כהן'
        },
        {
          id: '2',
          title: 'אימון מנטלי למתקדמים',
          description: 'טכניקות מתקדמות לשיפור היכולות המנטליות בקרב',
          href: '/academy/podcasts/2',
          category: 'podcasts',
          image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop',
          duration: '35 דקות',
          recommendedBy: 'רס"ן דן לוי'
        },
        {
          id: '3',
          title: 'תזונה ללוחם',
          description: 'מדריך מקיף לתזונה נכונה לשיפור ביצועים',
          href: '/academy/podcasts/3',
          category: 'podcasts',
          image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1000&auto=format&fit=crop',
          duration: '40 דקות',
          recommendedBy: 'סרן עמית ישראלי'
        },
        {
          id: '4',
          title: 'טכניקות לחימה מתקדמות',
          description: 'שיחה עם מומחים לטכניקות לחימה מודרניות',
          actionText: 'האזן',
          href: '/academy/podcasts/4',
          category: 'podcasts',
          image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=1000&auto=format&fit=crop',
          duration: '50 דקות'
        },
        {
          id: '5',
          title: 'אימון כוח פונקציונלי',
          description: 'מדריך לאימון כוח מותאם ללוחמים',
          actionText: 'האזן',
          href: '/academy/podcasts/5',
          category: 'podcasts',
          image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop',
          duration: '30 דקות'
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
          id: '1',
          title: 'אמנות המלחמה',
          description: 'ספר קלאסי על אסטרטגיה צבאית מאת סון דזה',
          href: '/academy/books/1',
          category: 'books',
          image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=1000&auto=format&fit=crop',
          duration: '300 דקות',
          recommendedBy: 'אל"מ רועי שמיר'
        },
        {
          id: '2',
          title: 'מנהיגות בשדה הקרב',
          description: 'ניתוח מקרי מנהיגות בקרבות מודרניים',
          href: '/academy/books/2',
          category: 'books',
          image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1000&auto=format&fit=crop',
          duration: '250 דקות'
        },
        {
          id: '3',
          title: 'המדריך ללוחם המודרני',
          description: 'מדריך מקיף לכל תחומי הלחימה המודרנית',
          href: '/academy/books/3',
          category: 'books',
          image: 'https://images.unsplash.com/photo-1509023464722-cd18b3a5dc73?q=80&w=1000&auto=format&fit=crop',
          duration: '400 דקות'
        },
        {
          id: '4',
          title: 'פסיכולוגיה של לחימה',
          description: 'ניתוח פסיכולוגי של מצבי לחימה',
          actionText: 'קרא',
          href: '/academy/books/4',
          category: 'books',
          image: 'https://images.unsplash.com/photo-1519682577862-22b62b24e493?q=80&w=1000&auto=format&fit=crop',
          duration: '280 דקות'
        },
        {
          id: '5',
          title: 'תזונה ללוחם',
          description: 'מדריך לתזונה מותאמת ללוחמים',
          actionText: 'קרא',
          href: '/academy/books/5',
          category: 'books',
          image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1000&auto=format&fit=crop',
          duration: '200 דקות'
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
          recommendedBy: 'רס"ן גיא אברהם'
        },
        {
          id: '2',
          title: 'טכניקות לחימה',
          description: 'הדרכה מקיפה על טכניקות לחימה מתקדמות',
          href: '/academy/videos/2',
          category: 'videos',
          image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=1000&auto=format&fit=crop',
          duration: '20 דקות'
        },
        {
          id: '3',
          title: 'אימון מנטלי',
          description: 'סדרת תרגילים לשיפור החוסן המנטלי',
          href: '/academy/videos/3',
          category: 'videos',
          image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop',
          duration: '10 דקות'
        },
        {
          id: '4',
          title: 'תזונה נכונה',
          description: 'מדריך וידאו לתזונה מותאמת ללוחמים',
          actionText: 'צפה',
          href: '/academy/videos/4',
          category: 'videos',
          image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1000&auto=format&fit=crop',
          duration: '25 דקות'
        },
        {
          id: '5',
          title: 'טכניקות התאוששות',
          description: 'מדריך להתאוששות מהירה אחרי אימונים',
          actionText: 'צפה',
          href: '/academy/videos/5',
          category: 'videos',
          image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?q=80&w=1000&auto=format&fit=crop',
          duration: '18 דקות'
        }
      ]
    },
    {
      id: 'five-fingers-podcast',
      title: 'הפודקאסט של חמש אצבעות',
      icon: FaMicrophone,
      color: 'podcasts',
      items: spotifyEpisodes.map((episode, index) => ({
        id: episode.id,
        title: episode.name,
        description: episode.description,
        href: episode.external_urls.spotify,
        category: 'five-fingers-podcast',
        image: episode.images[0].url,
        duration: `${Math.floor(episode.duration_ms / 60000)} דקות`,
        spotifyId: episode.id,
        spotifyUrl: episode.external_urls.spotify,
        recommendedBy: 'צוות חמש אצבעות'
      }))
    }
  ];

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

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-heebo text-right">
      <Navbar />
      <main className="px-4 md:px-8 py-8">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl md:text-3xl font-bold mb-8 md:mb-10 text-[#ff8714] text-center"
        >
          האקדמיה
        </motion.h1>
        
        {/* Content Rows */}
        <motion.div 
          className="space-y-8 md:space-y-12"
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
              <div className="flex items-center gap-3 mb-4 md:mb-6 px-2">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">{category.title}</h2>
                <category.icon className={`text-2xl text-[#ff8714]`} />
              </div>

              {/* Scrolling Container */}
              <div 
                id={`scroll-${category.id}`}
                className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide scroll-smooth -mx-4 md:-mx-8 px-4 md:px-8
                py-8 md:py-12 -my-8 md:-my-12"
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
                    className="flex-none w-[280px] md:w-[320px] group/item relative"
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
                    <div className="relative aspect-video cursor-pointer overflow-visible rounded-2xl 
                      transition-all duration-300 ease-out 
                      hover:shadow-xl
                      group-hover/item:z-[999] 
                      transform-gpu hover:scale-[1.15]">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover rounded-2xl"
                        sizes="(max-width: 768px) 280px, 320px"
                      />
                      {/* Dark gradient overlay - only at the bottom */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent rounded-2xl" />
                      
                      {/* Content overlay */}
                      <div className="absolute inset-0 p-4 flex flex-col rounded-2xl">
                        {/* Top: Title */}
                        <h3 className="text-lg md:text-xl font-bold mb-2 text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                          {item.title}
                        </h3>
                        
                        {/* Middle: Description - visible on hover */}
                        <div className="flex-1 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300">
                          <p className="text-sm text-gray-200 line-clamp-3 mb-4">
                            {item.description}
                          </p>
                        </div>
                        
                        {/* Bottom: Duration and Recommendation */}
                        <div className="mt-auto">
                          <div className="flex items-center gap-2 text-sm text-gray-300 mb-1">
                            <span className="text-white font-medium">{item.duration}</span>
                            <span>•</span>
                            <span>HD</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="bg-[#ff8714] text-white text-sm font-medium px-3 py-1 rounded-full
                              opacity-0 group-hover/item:opacity-100 transition-opacity duration-300
                              md:opacity-0 md:group-hover/item:opacity-100">
                              {getActionText(category.id)}
                            </span>
                            <span className="text-sm text-gray-200">
                              המלצת {item.recommendedBy}
                            </span>
                          </div>
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