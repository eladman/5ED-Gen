'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/hooks/useAuth';

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    workoutsCompleted: 0,
    streakDays: 0,
    upcomingWorkouts: 0,
    progress: 0
  });

  // Simulate loading some user data
  useEffect(() => {
    const loadUserData = async () => {
      // In a real app, you would fetch this data from your backend
      setTimeout(() => {
        setStats({
          workoutsCompleted: Math.floor(Math.random() * 30),
          streakDays: Math.floor(Math.random() * 14),
          upcomingWorkouts: Math.floor(Math.random() * 5),
          progress: Math.floor(Math.random() * 100)
        });
        setIsLoading(false);
      }, 1000);
    };

    loadUserData();
  }, []);

  const tabs = [
    { id: 'overview', label: 'סקירה כללית' },
    { id: 'programs', label: 'תוכניות אימון' },
    { id: 'progress', label: 'התקדמות' },
    { id: 'goals', label: 'יעדים' }
  ];

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
      className="pt-24 pb-16 section-padding min-h-screen bg-gradient-to-b from-white to-[#fff5eb]"
    >
      <div className="container-custom">
        {/* Welcome header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900">
            שלום, <span className="text-[#ff8714]">{user?.displayName?.split(' ')[0] || 'חבר'}</span>
          </h1>
          <p className="text-gray-600 mt-2">ברוך הבא לדשבורד האישי שלך</p>
        </motion.div>

        {/* Stats cards */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
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
            title="התקדמות כללית" 
            value={`${stats.progress}%`} 
            icon="📈" 
            color="bg-purple-50" 
            delay={0.4}
          />
        </motion.div>

        {/* Tabs */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex overflow-x-auto no-scrollbar space-x-4 space-x-reverse border-b">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#ff8714] text-[#ff8714]'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6 min-h-[300px]"
          >
            {activeTab === 'overview' && (
              <OverviewTab />
            )}
            {activeTab === 'programs' && (
              <div className="flex flex-col items-center justify-center h-64">
                <h3 className="text-xl font-semibold text-gray-700">תוכניות האימון שלך</h3>
                <p className="text-gray-500 mt-2">כאן תוכל לראות ולנהל את תוכניות האימון שלך</p>
                <button 
                  onClick={() => router.push('/programs')}
                  className="mt-4 px-6 py-2 bg-[#ff8714] text-white rounded-lg hover:bg-[#e67200] transition-colors"
                >
                  צפה בתוכניות
                </button>
              </div>
            )}
            {activeTab === 'progress' && (
              <div className="flex flex-col items-center justify-center h-64">
                <h3 className="text-xl font-semibold text-gray-700">מעקב התקדמות</h3>
                <p className="text-gray-500 mt-2">כאן תוכל לעקוב אחר ההתקדמות שלך לאורך זמן</p>
                <button 
                  onClick={() => router.push('/metrics')}
                  className="mt-4 px-6 py-2 bg-[#ff8714] text-white rounded-lg hover:bg-[#e67200] transition-colors"
                >
                  צפה במדדים
                </button>
              </div>
            )}
            {activeTab === 'goals' && (
              <div className="flex flex-col items-center justify-center h-64">
                <h3 className="text-xl font-semibold text-gray-700">היעדים שלך</h3>
                <p className="text-gray-500 mt-2">הגדר ועקוב אחר היעדים האישיים שלך</p>
                <button 
                  onClick={() => router.push('/profile')}
                  className="mt-4 px-6 py-2 bg-[#ff8714] text-white rounded-lg hover:bg-[#e67200] transition-colors"
                >
                  הגדר יעדים
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Quick actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <QuickActionCard 
            title="צור אימון חדש" 
            description="הוסף אימון חדש לתוכנית שלך"
            icon="➕"
            onClick={() => router.push('/create-program')}
            delay={0.1}
          />
          <QuickActionCard 
            title="עדכן מדדים" 
            description="הזן את המדדים האחרונים שלך"
            icon="📊"
            onClick={() => router.push('/metrics')}
            delay={0.2}
          />
          <QuickActionCard 
            title="הפרופיל שלי" 
            description="עדכן את פרטי הפרופיל שלך"
            icon="👤"
            onClick={() => router.push('/profile')}
            delay={0.3}
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
      whileHover={{ scale: 1.03 }}
      className={`${color} rounded-xl p-6 shadow-sm border border-gray-100`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
    </motion.div>
  );
}

function QuickActionCard({ title, description, icon, onClick, delay = 0 }: {
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
  delay?: number;
}) {
  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 cursor-pointer"
    >
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-[#fff5eb] flex items-center justify-center text-xl mr-4">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-gray-600 text-sm mt-1">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}

function OverviewTab() {
  const [showAnimation, setShowAnimation] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAnimation(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="relative min-h-[300px]">
      {showAnimation ? (
        <motion.div 
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.5, delay: 1.5 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              rotate: [0, 10, 0, -10, 0]
            }}
            transition={{ 
              duration: 1.5,
              ease: "easeInOut"
            }}
            className="text-6xl"
          >
            💪
          </motion.div>
        </motion.div>
      ) : null}
      
      <motion.div
        initial={{ opacity: showAnimation ? 0 : 1 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-xl font-semibold text-gray-700 mb-4">סקירת השבוע</h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">האימון הבא שלך</h4>
            <div className="bg-[#fff5eb] p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">אימון כוח - פלג גוף עליון</p>
                  <p className="text-sm text-gray-600 mt-1">היום, 18:00</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-1 bg-[#ff8714] text-white rounded-lg text-sm"
                >
                  התחל אימון
                </motion.button>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-2">התקדמות שבועית</h4>
            <div className="h-8 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "60%" }}
                transition={{ duration: 1, delay: showAnimation ? 0.5 : 0 }}
                className="h-full bg-gradient-to-r from-[#ff8714] to-[#ffa149]"
              />
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>0 ימים</span>
              <span>3/5 ימים</span>
              <span>7 ימים</span>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-2">הישגים אחרונים</h4>
            <div className="grid grid-cols-3 gap-2">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="bg-blue-50 p-3 rounded-lg flex flex-col items-center"
              >
                <span className="text-2xl">🏆</span>
                <span className="text-sm text-center mt-1">5 אימונים רצופים</span>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="bg-green-50 p-3 rounded-lg flex flex-col items-center"
              >
                <span className="text-2xl">💪</span>
                <span className="text-sm text-center mt-1">שיפור ב-10% בלחיצת חזה</span>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="bg-purple-50 p-3 rounded-lg flex flex-col items-center"
              >
                <span className="text-2xl">🎯</span>
                <span className="text-sm text-center mt-1">הגעת ליעד המשקל!</span>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 