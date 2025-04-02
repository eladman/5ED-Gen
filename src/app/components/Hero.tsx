'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function Hero() {
  const router = useRouter();

  return (
    <section className="relative min-h-[90vh] flex items-center section-padding overflow-hidden bg-gradient-to-b from-[#ff8714] via-[#fff5eb] to-white">
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
              הגשם את <span className="text-gradient">הפוטנציאל</span> שלך
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
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <motion.button 
                className="btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/create-program')}
              >
                צור תוכנית אימון
              </motion.button>
              <motion.button 
                className="px-6 py-3 rounded-lg font-semibold border-2 border-[#ff8714] text-[#ff8714] hover:bg-[#fff5eb] transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                גלה עוד
              </motion.button>
            </motion.div>
          </motion.div>
          <motion.div 
            className="relative h-[500px] hidden lg:block"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          >
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-[#ff8714] to-[#ffa149] rounded-full opacity-30 blur-3xl"
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
              <Image
                src="/images/profile.jpg"
                alt="Profile"
                fill
                className="object-contain rounded-3xl"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
      <motion.div 
        className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white via-[#fff5eb] to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
      />
    </section>
  );
} 