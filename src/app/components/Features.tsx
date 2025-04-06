'use client';

import { motion } from 'framer-motion';
import { 
  ClipboardDocumentCheckIcon, 
  ChartBarIcon, 
  UserGroupIcon, 
  SparklesIcon 
} from '@heroicons/react/24/outline';

const features = [
  {
    title: 'תוכניות אימון מותאמות אישית',
    description: 'בנה תוכנית אימון המותאמת בדיוק לצרכים ולמטרות שלך',
    icon: ClipboardDocumentCheckIcon,
  },
  {
    title: 'מעקב התקדמות',
    description: 'עקוב אחר ההתקדמות שלך עם כלי מדידה וויזואליים מתקדמים',
    icon: ChartBarIcon,
  },
  {
    title: 'קהילה תומכת',
    description: 'הצטרף לקהילת מתאמנים תומכת ושתף את ההצלחות שלך',
    icon: UserGroupIcon,
  },
  {
    title: 'טכנולוגיה מתקדמת',
    description: 'שימוש בטכנולוגיה חדשנית לאופטימיזציה של תוכנית האימונים',
    icon: SparklesIcon,
  },
];

export default function Features() {
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
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center max-w-3xl mx-auto mb-16"
          dir="rtl"
        >
          <h2 className="heading-2 mb-6 text-gray-900">
            למה לבחור ב<span className="text-gradient">חמש אצבעות</span>?
          </h2>
          <p className="text-xl text-gray-600">
            הפלטפורמה שלנו מספקת את כל הכלים הדרושים להצלחה שלך
          </p>
        </motion.div>
        
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              variants={item}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="w-12 h-12 bg-[#fff5eb] rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-[#ff8714]" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
} 