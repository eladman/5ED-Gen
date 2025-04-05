"use client";

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { FaPlay, FaBook, FaMicrophone, FaTimes, FaApple, FaSpotify } from 'react-icons/fa';

interface ContentModalProps {
  item: {
    id: string;
    title: string;
    description: string;
    category: string;
    image?: string;
    duration?: string;
    spotifyUrl?: string;
    applePodcastsUrl?: string;
    href?: string;
  };
  onClose: () => void;
}

export default function ContentModal({ item, onClose }: ContentModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [showPlatformSelection, setShowPlatformSelection] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300); // Wait for animation to complete
  };

  const getIcon = () => {
    switch (item.category) {
      case 'podcasts':
        return <FaMicrophone className="w-6 h-6" />;
      case 'books':
        return <FaBook className="w-6 h-6" />;
      case 'videos':
        return <FaPlay className="w-6 h-6" />;
      default:
        return null;
    }
  };

  const handleActionClick = () => {
    if (item.category === 'podcasts' || item.category === 'five-fingers-podcast') {
      setShowPlatformSelection(true);
    } else {
      // Handle other content types
      window.open(item.href, '_blank');
    }
  };

  const handlePlatformSelect = (platform: 'spotify' | 'apple') => {
    const url = platform === 'spotify' ? item.spotifyUrl : item.applePodcastsUrl;
    if (url) {
      window.open(url, '_blank');
    }
    setShowPlatformSelection(false);
  };

  return (
    <div 
      className={`fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div 
        ref={modalRef}
        className={`bg-[#181818] rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        {/* Header */}
        <div className="relative h-[40vh]">
          <div className="absolute inset-0">
            <Image
              src={item.image || '/images/placeholder.jpg'}
              alt={item.title}
              fill
              className="object-cover rounded-t-lg"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-[#181818]/80 to-transparent" />
          </div>
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            <FaTimes className="w-6 h-6" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="flex items-center gap-4 mb-4">
              {getIcon()}
              <span className="text-[#ff8714]">{item.duration}</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">{item.title}</h2>
            <p className="text-lg text-gray-300">{item.description}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {item.category === 'five-fingers-podcast' && (
            <div className="mb-6 bg-[#ff8714]/10 p-4 rounded-lg">
              <h3 className="text-xl font-bold mb-2 text-[#ff8714]">פודקאסט חמש אצבעות</h3>
              <p className="text-gray-300">
                הפודקאסט הרשמי של חמש אצבעות - פודקאסט שבועי עם תובנות, טיפים וסיפורים מעולם האימון והלחימה.
                בהגשת צוות חמש אצבעות, עם אורחים מיוחדים מהשטח.
              </p>
            </div>
          )}
          <div className="flex gap-4">
            <button 
              onClick={handleActionClick}
              className="bg-[#ff8714] text-white px-8 py-3 rounded-lg hover:bg-[#ff7a2e] transition-colors flex items-center gap-2"
            >
              {getIcon()}
              <span>{item.category === 'podcasts' || item.category === 'five-fingers-podcast' ? 'האזן לפודקאסט' : 'התחל לצפות'}</span>
            </button>
            <button className="bg-white/20 backdrop-blur-sm text-white px-8 py-3 rounded-lg hover:bg-white/30 transition-colors">
              מידע נוסף
            </button>
          </div>
        </div>

        {/* Platform Selection Modal */}
        {showPlatformSelection && (
          <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4">
            <div className="bg-[#181818] rounded-lg p-8 max-w-md w-full">
              <h3 className="text-2xl font-bold mb-6 text-center">בחר פלטפורמה להאזנה</h3>
              <div className="space-y-4">
                <button
                  onClick={() => handlePlatformSelect('spotify')}
                  className="w-full bg-[#1DB954] text-white px-6 py-4 rounded-lg hover:bg-[#1ed760] transition-colors flex items-center justify-center gap-3"
                >
                  <FaSpotify className="w-6 h-6" />
                  <span>האזן ב-Spotify</span>
                </button>
                <button
                  onClick={() => handlePlatformSelect('apple')}
                  className="w-full bg-[#FC3C44] text-white px-6 py-4 rounded-lg hover:bg-[#ff4d55] transition-colors flex items-center justify-center gap-3"
                >
                  <FaApple className="w-6 h-6" />
                  <span>האזן ב-Apple Podcasts</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 