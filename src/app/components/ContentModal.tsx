"use client";

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { FaPlay, FaBook, FaMicrophone, FaTimes, FaApple, FaSpotify, FaPodcast } from 'react-icons/fa';

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
      ref={modalRef}
    >
      <div className="relative bg-[#181818] rounded-lg max-w-3xl w-full overflow-hidden">
        <div className="relative">
          <Image
            src={item.image || '/images/placeholder.jpg'}
            alt={item.title}
            width={800}
            height={450}
            className="object-cover w-full h-64"
          />
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-50 p-2 bg-white rounded-full text-black hover:bg-gray-200 transition-colors"
            aria-label="Close modal"
          >
            <FaTimes className="w-5 h-5 pointer-events-none" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="flex items-center gap-4 mb-4">
              {getIcon()}
              <h2 className="text-3xl font-bold mb-4">{item.title}</h2>
            </div>
            <p className="text-lg text-gray-300">{item.description}</p>
            {item.spotifyUrl && item.applePodcastsUrl && (
              <div className="flex gap-4 mt-6">
                <a 
                  href={item.spotifyUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-12 h-12 flex items-center justify-center bg-[#1DB954] text-white rounded-full hover:bg-[#1ed760] transition-colors"
                >
                  <FaSpotify className="w-6 h-6" />
                </a>
                <a 
                  href={item.applePodcastsUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-12 h-12 flex items-center justify-center bg-[#872EC4] text-white rounded-full hover:bg-[#9B3DE0] transition-colors"
                >
                  <FaPodcast className="w-6 h-6" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {item.category !== 'podcasts' && item.category !== 'five-fingers-podcast' && item.href && (
            <a 
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#ff8714] text-white px-8 py-3 rounded-lg hover:bg-[#ff7a2e] transition-colors flex items-center gap-2"
            >
              {getIcon()}
              <span>התחל לצפות</span>
            </a>
          )}
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