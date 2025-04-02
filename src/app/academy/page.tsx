"use client";

import { FaPlay, FaBook, FaMicrophone, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import CategorySection from '../components/CategorySection';
import Link from 'next/link';
import Image from 'next/image';
import ContentModal from '../components/ContentModal';
import { useState, useEffect } from 'react';

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

  const handleItemClick = (e: React.MouseEvent, item: any) => {
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
          duration: '45 דקות'
        },
        {
          id: '2',
          title: 'אימון מנטלי למתקדמים',
          description: 'טכניקות מתקדמות לשיפור היכולות המנטליות בקרב',
          href: '/academy/podcasts/2',
          category: 'podcasts',
          image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop',
          duration: '35 דקות'
        },
        {
          id: '3',
          title: 'תזונה ללוחם',
          description: 'מדריך מקיף לתזונה נכונה לשיפור ביצועים',
          href: '/academy/podcasts/3',
          category: 'podcasts',
          image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1000&auto=format&fit=crop',
          duration: '40 דקות'
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
          duration: '300 דקות'
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
          duration: '15 דקות'
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
        spotifyUrl: episode.external_urls.spotify
      }))
    }
  ];

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative h-[40vh] w-full">
        <div className="absolute inset-0 bg-gradient-to-r from-[#ff8714]/90 via-[#ff8714]/50 to-transparent z-10" />
        <div className="absolute inset-0">
          <Image
            src="/images/podcasts/leadership.jpg"
            alt="Hero"
            fill
            className="object-cover brightness-90"
            priority
          />
        </div>
        <div className="relative z-20 h-full flex items-center">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-2 text-zinc-900 drop-shadow-lg">האקדמיה של חמש</h1>
            <p className="text-xl mb-4 max-w-2xl text-zinc-800 drop-shadow-lg">המקום להתפתח, ללמוד ולהתקדם. גלה תוכן איכותי בפודקאסטים, ספרים וסרטים.</p>
            <div className="flex gap-4">
              <button className="bg-[#ff8714] text-white px-6 py-2 rounded-lg hover:bg-[#e67200] transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                התחל לצפות
              </button>
              <button className="bg-zinc-900/90 backdrop-blur px-6 py-2 rounded-lg hover:bg-zinc-800 transition-all text-white border border-zinc-800 hover:border-zinc-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                מידע נוסף
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Rows */}
      <div className="space-y-2 py-8">
        {categories.map((category) => (
          <div key={category.id} className="group/row relative px-4 -mx-4 mb-2">
            <h2 className="text-2xl font-bold mb-1 px-4">{category.title}</h2>
            <div className="relative group">
              {/* Navigation Arrows */}
              {scrollPositions[`scroll-${category.id}`]?.canScrollRight && (
                <button 
                  onClick={() => handleScroll('left', `scroll-${category.id}`)}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-40 w-12 h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center bg-gradient-to-r from-white/90 to-transparent"
                  aria-label="גלול שמאלה"
                >
                  <FaChevronLeft className="w-6 h-6 text-zinc-900 drop-shadow-lg" />
                </button>
              )}
              {scrollPositions[`scroll-${category.id}`]?.canScrollLeft && (
                <button 
                  onClick={() => handleScroll('right', `scroll-${category.id}`)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-40 w-12 h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center bg-gradient-to-l from-white/90 to-transparent"
                  aria-label="גלול ימינה"
                >
                  <FaChevronRight className="w-6 h-6 text-zinc-900 drop-shadow-lg" />
                </button>
              )}

              <div 
                id={`scroll-${category.id}`} 
                className="flex gap-4 overflow-x-auto scrollbar-hide px-4 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] pt-[2%] pb-[8%]"
                onScroll={() => checkScrollability(`scroll-${category.id}`)}
              >
                {category.items.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="flex-none w-[300px] relative group/item"
                    onClick={(e) => handleItemClick(e, item)}
                  >
                    <div className="relative aspect-square rounded overflow-hidden transition-[transform,z-index] duration-300 ease-in-out origin-bottom
                    group-hover/item:scale-[1.15]
                    group-hover/item:z-50
                    group-hover/item:-translate-y-[5%]
                    group-hover/item:shadow-[0_0_2rem_rgba(0,0,0,0.3)]
                    group-hover/item:rounded-lg
                    group-hover/item:delay-100">
                      <Image
                        src={item.image || '/images/placeholder.jpg'}
                        alt={item.title}
                        fill
                        className="object-cover bg-zinc-900"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority
                      />
                      {/* Overlay on Hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover/item:opacity-100 transition-all duration-300" />
                      
                      {/* Content on Hover */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover/item:opacity-100 transition-all duration-300 scale-90 group-hover/item:scale-100">
                        <h3 className="text-lg font-bold mb-1 text-white">{item.title}</h3>
                        
                        {/* Info Row */}
                        <div className="flex items-center gap-2 text-sm mb-2">
                          <span className="text-[#ff8714] font-medium">{item.duration}</span>
                          <span className="text-white/80">•</span>
                          <span className="text-white/80">HD</span>
                        </div>
                        
                        {/* Description */}
                        <p className="text-sm text-white/90 mb-3 line-clamp-2">{item.description}</p>
                        
                        {/* Buttons */}
                        <div className="flex items-center gap-2">
                          <button className="bg-white text-black px-4 py-1.5 rounded-md flex items-center gap-2 hover:bg-white/90 transition-colors">
                            <FaPlay className="w-4 h-4" />
                            <span>נגן</span>
                          </button>
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleItemClick(e, item);
                            }}
                            className="bg-white/30 text-white px-4 py-1.5 rounded-md hover:bg-white/40 transition-colors"
                          >
                            מידע נוסף
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedItem && (
        <ContentModal
          item={selectedItem}
          onClose={handleCloseModal}
        />
      )}
    </main>
  );
} 