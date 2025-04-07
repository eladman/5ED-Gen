'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Image from 'next/image';

interface SplashScreenProps {
  isLoaded: boolean;
}

const SplashScreen = ({ isLoaded }: SplashScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  // Timer to ensure splash screen is shown for at least 2.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 2500); // 2.5 seconds

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, []);

  // Hide splash screen only when content is loaded AND min time has passed
  useEffect(() => {
    if (isLoaded && minTimeElapsed) {
      setIsVisible(false);
    }
  }, [isLoaded, minTimeElapsed]);

  // Disable scroll when splash screen is visible
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    // Re-enable scroll when component unmounts or becomes hidden
    return () => {
      document.body.style.overflow = '';
    };
  }, [isVisible]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      <div 
        className="flex items-center justify-center mb-4 rounded-full"
        style={{
          backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0) 70%)'
        }}
      >
        <Image
          src="/images/logo.png"
          alt="חמש אצבעות לוגו"
          width={550}
          height={550}
          priority
        />
      </div>
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff8714]"></div>
      <p className="text-[#ff8714] mt-4 text-lg font-semibold">טוען...</p>
    </div>
  );
};

export default SplashScreen; 