'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
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

  // Animation variants for text
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.3
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 50 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white">
      <div className="container-custom relative z-10 text-center max-w-6xl">
        <motion.div 
          className="space-y-4"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          dir="rtl"
        >
          <motion.h1 
            className="heading-1 text-gray-900"
            variants={item}
          >
            <motion.span 
              className="block text-gradient text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight"
              whileInView={{
                textShadow: ["0 0 0px rgba(255,135,20,0)", "0 0 10px rgba(255,135,20,0.3)", "0 0 0px rgba(255,135,20,0)"],
              }}
              viewport={{ once: true }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              אפליקציית חמש אצבעות
            </motion.span>
            <motion.span 
              className="block text-gray-700 text-4xl md:text-5xl lg:text-6xl mt-8 font-light"
              variants={item}
            >
              להשתפר בכל זמן, בכל מקום
            </motion.span>
          </motion.h1>
          
          <motion.div 
            variants={item}
            className="flex justify-center pt-12"
          >
            <motion.button 
              className="px-12 py-5 rounded-full font-semibold bg-gradient-to-r from-[#ff8714] to-[#ffa149] text-white transition-all duration-300 shadow-lg shadow-orange-200/30 text-xl"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 30px -10px rgba(255, 135, 20, 0.3)"
              }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSignIn}
            >
              התחל עכשיו
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
} 