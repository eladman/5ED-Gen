'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Image from 'next/image';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen = ({ onFinish }: SplashScreenProps) => {
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    // Show text after logo animation
    const textTimer = setTimeout(() => {
      setShowText(true);
    }, 1000);

    // Finish splash screen after all animations
    const finishTimer = setTimeout(() => {
      onFinish();
    }, 2500);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div className="text-center relative">
        {/* Logo Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.8,
            ease: "easeOut"
          }}
          className="relative w-64 h-64 md:w-96 md:h-96"
        >
          <Image
            src="/images/logo.png"
            alt="חמש אצבעות"
            fill
            className="object-contain"
            priority
          />
        </motion.div>

        {/* Circular loading animation */}
        {showText && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute bottom-[-120px] left-1/2 transform -translate-x-1/2"
          >
            <div className="w-16 h-16 relative">
              <div className="w-16 h-16 rounded-full border-t-4 border-[#ff8714] border-r-4 border-r-transparent animate-[spin_1s_linear_infinite]" />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SplashScreen; 