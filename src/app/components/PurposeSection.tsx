'use client';

import { motion } from 'framer-motion';

export default function PurposeSection() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <section className="pt-6 pb-24 bg-white overflow-hidden">
      <div className="container-custom">
        <motion.div
          className="max-w-5xl mx-auto text-center"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          dir="rtl"
        >
          <motion.div variants={item} className="mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-8">
              <span className="text-gradient">המטרה שלנו</span>
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-[#ff8714] to-[#ffa149] mx-auto rounded-full mb-8"></div>
          </motion.div>

          <motion.div 
            variants={item}
            className="text-xl md:text-2xl text-gray-600 leading-relaxed space-y-8 mb-12"
          >
            <p>
              עדכון גרסה לחינוך 
              <span className="text-[#ff8714] font-semibold"> בישראל ובעולם</span>.
            </p>
            <p>
              המשימה שלנו היא לעזור לכם לפתח חוסן מנטלי, גריט, ומסוגלות להגיע הכי רחוק שאפשר
              עם <span className="text-[#ff8714] font-semibold">טכנולוגיה מתקדמת ותמיכה מקצועית</span>.
            </p>
          </motion.div>

          <motion.div 
            variants={item}
            className="grid md:grid-cols-3 gap-8 text-center"
          >
            {[
              {
                number: "24/7",
                text: "זמינות מלאה"
              },
              {
                number: "+1000",
                text: "תרגילים ואימונים"
              },
              {
                number: "100%",
                text: "מותאם אישית"
              }
            ].map((stat, index) => (
              <motion.div 
                key={index}
                className="p-6 rounded-2xl bg-gray-50"
                whileHover={{ 
                  scale: 1.05,
                  backgroundColor: "#fff5eb",
                  transition: { duration: 0.2 }
                }}
              >
                <h3 className="text-4xl font-bold text-[#ff8714] mb-2">{stat.number}</h3>
                <p className="text-gray-600 text-lg">{stat.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
} 