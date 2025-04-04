'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const images = [
  { src: '/images/profile.jpg', alt: 'Profile' },
  { src: '/images/user/835837AC-5D94-46F7-9649-DFCD616939CA.PNG', alt: 'User Image 1' },
  { src: '/images/user/55EE99EB-E32E-4696-856B-1C052B1B960B.PNG', alt: 'User Image 2' },
  { src: '/images/user/AB49752E-3B5C-4285-84E7-C9EAAEC7B856.PNG', alt: 'User Image 3' },
  { src: '/images/user/IMG_5397.PNG', alt: 'User Image 4' },
];

export default function ImageGallery() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Minimum swipe distance to register as a swipe (in pixels)
  const minSwipeDistance = 50;

  const handleNext = () => {
    setDirection(-1);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrevious = () => {
    setDirection(1);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const handleDotClick = (index: number) => {
    const currentPos = currentIndex;
    const targetPos = index;
    const totalImages = images.length;
    
    const normalDistance = targetPos - currentPos;
    const wrapDistance = targetPos > currentPos 
      ? -(totalImages - (targetPos - currentPos))
      : totalImages + (targetPos - currentPos);
    
    const shortestPath = Math.abs(normalDistance) <= Math.abs(wrapDistance) 
      ? normalDistance 
      : wrapDistance;
    
    setDirection(shortestPath > 0 ? 1 : -1);
    setCurrentIndex(index);
  };

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    handleUserInteraction();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrevious();
    }
    
    // Reset touch positions
    setTouchStart(0);
    setTouchEnd(0);
  };

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      handleNext();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [currentIndex, isAutoPlaying]);

  // Pause auto-play when user interacts with gallery
  const handleUserInteraction = () => {
    setIsAutoPlaying(false);
    // Resume auto-play after 30 seconds of inactivity
    const timeout = setTimeout(() => setIsAutoPlaying(true), 30000);
    return () => clearTimeout(timeout);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <div 
      className="relative h-[300px] md:h-[400px] lg:h-[500px] w-full overflow-hidden rounded-3xl shadow-xl"
      onClick={handleUserInteraction}
      onMouseEnter={handleUserInteraction}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Main image carousel */}
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className="absolute inset-0"
        >
          <Image
            src={images[currentIndex].src}
            alt={images[currentIndex].alt}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </motion.div>
      </AnimatePresence>

      {/* Navigation arrows */}
      <button 
        onClick={(e) => { e.stopPropagation(); handlePrevious(); }}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/50 backdrop-blur-sm p-2 rounded-full text-gray-800 hover:bg-white/70 transition-colors z-20"
        aria-label="Previous image"
      >
        <ChevronLeft size={24} />
      </button>
      <button 
        onClick={(e) => { e.stopPropagation(); handleNext(); }}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/50 backdrop-blur-sm p-2 rounded-full text-gray-800 hover:bg-white/70 transition-colors z-20"
        aria-label="Next image"
      >
        <ChevronRight size={24} />
      </button>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
    </div>
  );
} 