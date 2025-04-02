"use client";

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { FaPlay, FaBook, FaMicrophone, FaTimes } from 'react-icons/fa';

interface ContentModalProps {
  item: {
    id: string;
    title: string;
    description: string;
    category: string;
    image?: string;
    duration?: string;
  };
  onClose: () => void;
}

export default function ContentModal({ item, onClose }: ContentModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);

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
          <div className="flex gap-4">
            <button className="bg-[#ff8714] text-white px-8 py-3 rounded-lg hover:bg-[#ff7a2e] transition-colors flex items-center gap-2">
              {getIcon()}
              <span>התחל לצפות</span>
            </button>
            <button className="bg-white/20 backdrop-blur-sm text-white px-8 py-3 rounded-lg hover:bg-white/30 transition-colors">
              מידע נוסף
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 