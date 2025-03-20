'use client';

import { useEffect, useState } from 'react';
import Hero from './components/Hero'
import Features from './components/Features'
import Navbar from './components/Navbar'
import Dashboard from './components/Dashboard'
import { useAuth } from '@/lib/hooks/useAuth'
import { motion } from 'framer-motion'

export default function Home() {
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Handle hydration issues by waiting until client-side render
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading state while auth state is determined
  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-16 h-16 rounded-full border-t-4 border-[#ff8714] border-r-4 border-r-transparent"
        />
      </div>
    );
  }

  // Show different content based on authentication status
  return (
    <main className="min-h-screen">
      <Navbar />
      {user ? (
        <Dashboard />
      ) : (
        <>
          <Hero />
          <Features />
        </>
      )}
    </main>
  )
}
