'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import ImageGallery from './ImageGallery';
import { useAuth } from '@/lib/hooks/useAuth';

export default function Hero() {
  const router = useRouter();
  const { signInWithGoogle } = useAuth();

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      // Router navigation will be handled by the auth state change in the root layout
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  return (
    <section className="relative min-h-[90vh] flex items-center section-padding overflow-hidden bg-white">
      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <motion.h1 
              className="heading-1 text-gray-900"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              הגשם את <span className="text-[#ff8714]">הפוטנציאל</span> שלך
              <br />
              עם תוכנית אימון אישית
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-600"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              פלטפורמת חמש אצבעות מאפשרת למתאמנים ליצור תוכניות אימון מותאמות אישית,
              לעקוב אחר ההתקדמות ולהשיג את המטרות שלהם.
            </motion.p>
            <motion.div 
              className="flex justify-center sm:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <motion.button 
                className="px-8 py-4 rounded-lg font-semibold bg-[#ff8714] text-white hover:bg-[#ff7600] transition-colors duration-200 shadow-lg hover:shadow-xl text-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSignIn}
              >
                גלו את העתיד
              </motion.button>
            </motion.div>
            
            {/* Mobile Gallery - visible only on mobile */}
            <motion.div 
              className="mt-8 block lg:hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <ImageGallery />
            </motion.div>
          </motion.div>
          {/* Desktop Gallery - visible only on desktop */}
          <motion.div 
            className="relative hidden lg:block"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          >
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-[#ff8714]/5 to-[#ffa149]/5 rounded-full opacity-30 blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.3, 0.2],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative h-full"
            >
              <ImageGallery />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 