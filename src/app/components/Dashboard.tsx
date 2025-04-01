'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/hooks/useAuth';
import { getProfile } from '@/lib/firebase/profileUtils';

export default function Dashboard() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [profileName, setProfileName] = useState<string>('');
  const [stats, setStats] = useState({
    workoutsCompleted: 0,
    streakDays: 0,
    upcomingWorkouts: 0,
    gritScore: 0
  });

  // Fetch user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Fetch profile data
        if (user) {
          const profile = await getProfile(user.uid);
          if (profile?.name) {
            setProfileName(profile.name);
          } else {
            setProfileName(user.displayName || 'חבר');
          }
        }

        // Simulate loading stats data
        // In a real app, you would fetch this data from your backend
        setTimeout(() => {
          setStats({
            workoutsCompleted: Math.floor(Math.random() * 30),
            streakDays: Math.floor(Math.random() * 14),
            upcomingWorkouts: Math.floor(Math.random() * 5),
            gritScore: Math.floor(Math.random() * 41) + 60 // Random score between 60-100
          });
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error loading user data:', error);
        setProfileName(user?.displayName || 'חבר');
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] w-full">
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
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-gray-600"
        >
          טוען נתונים...
        </motion.p>
      </div>
    );
  }

  return (
    <motion.section 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-24 pb-16 section-padding min-h-screen bg-white"
    >
      <div className="container-custom">
        {/* Welcome header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h1 className="text-5xl font-bold text-gray-900">
            שלום, <span className="text-[#ff8714]">{profileName}</span>
          </h1>
          <p className="text-gray-600 mt-3 text-xl">ברוך הבא לדשבורד האישי שלך</p>
        </motion.div>

        {/* Stats cards */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto"
        >
          <StatCard 
            title="אימונים שהושלמו" 
            value={stats.workoutsCompleted} 
            icon="🏋️‍♂️" 
            color="bg-blue-50" 
            delay={0.1}
          />
          <StatCard 
            title="רצף ימים" 
            value={stats.streakDays} 
            icon="🔥" 
            color="bg-red-50" 
            delay={0.2}
          />
          <StatCard 
            title="אימונים מתוכננים" 
            value={stats.upcomingWorkouts} 
            icon="📅" 
            color="bg-green-50" 
            delay={0.3}
          />
          <StatCard 
            title="ציון גריט" 
            value={stats.gritScore} 
            icon="💪" 
            color="bg-purple-50" 
            delay={0.4}
          />
        </motion.div>
      </div>
    </motion.section>
  );
}

function StatCard({ title, value, icon, color, delay = 0 }: { 
  title: string; 
  value: number | string; 
  icon: string; 
  color: string; 
  delay?: number 
}) {
  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
      className={`${color} rounded-xl p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center`}
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-gray-600">{title}</p>
    </motion.div>
  );
} 