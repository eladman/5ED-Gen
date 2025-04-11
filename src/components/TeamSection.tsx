'use client';

import { motion } from 'framer-motion';
import ImageGallery from './ImageGallery';

export default function TeamSection() {
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
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <section className="section-padding bg-white overflow-hidden" id="team">
      <div className="container-custom">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="heading-2 mb-6 text-gray-900">
            <span className="text-gradient">הצוות</span> שלנו
          </h2>
          <p className="text-xl text-gray-600">
            הכירו את הצוות המקצועי מאחורי חמש אצבעות - מומחים מובילים בתחום האימון וטכנולוגיה
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
            className="relative"
          >
            <div className="relative">
              <ImageGallery />
            </div>
          </motion.div>
          
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            dir="rtl"
            className="space-y-8"
          >
            <motion.h3 
              variants={item} 
              className="text-3xl font-bold mb-4"
            >
              מובילים <span className="text-gradient">חדשנות</span> בתחום האימון הגופני
            </motion.h3>
            
            <motion.p variants={item} className="text-lg text-gray-600">
              הצוות שלנו מורכב ממאמנים מנוסים, מדעני ספורט ומפתחי תוכנה, המחויבים לעזור לך להשיג את המטרות שלך.
            </motion.p>
            
            <motion.p variants={item} className="text-lg text-gray-600">
              אנו משלבים ידע מעמיק בתחום האימון הגופני עם טכנולוגיה מתקדמת כדי ליצור חוויית אימון אישית וייחודית.
            </motion.p>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 