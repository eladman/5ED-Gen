"use client";

import { useState } from 'react';
import Image from 'next/image';
import { FaStar, FaFistRaised, FaBrain, FaDumbbell } from 'react-icons/fa';

interface Trainer {
  id: string;
  name: string;
  image: string;
  expertise: string;
  experience: string;
  icon: 'combat' | 'mental' | 'fitness';
  recommendations: {
    title: string;
    description: string;
    type: 'book' | 'movie' | 'podcast';
  }[];
}

const trainers: Trainer[] = [
  {
    id: '1',
    name: 'יוסי כהן',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500',
    expertise: 'טכניקות לחימה מתקדמות',
    experience: '15 שנות ניסיון באימון לוחמים',
    icon: 'combat',
    recommendations: [
      {
        title: 'ספר המלחמה של סון טסו',
        description: 'ספר עתיק יומין על אסטרטגיה צבאית שמכיל תובנות רלוונטיות גם היום',
        type: 'book'
      },
      {
        title: 'סרט המלחמה',
        description: 'סרט מרתק על מנהיגות בשדה הקרב',
        type: 'movie'
      }
    ]
  },
  {
    id: '2',
    name: 'מיכל גולן',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500',
    expertise: 'אימון מנטלי',
    experience: '12 שנות ניסיון באימון מנטלי',
    icon: 'mental',
    recommendations: [
      {
        title: 'ספר המנהיגות',
        description: 'ספר על מנהיגות והתמודדות עם אתגרים',
        type: 'book'
      },
      {
        title: 'פודקאסט על אימון מנטלי',
        description: 'שיחה מרתקת על חשיבות האימון המנטלי',
        type: 'podcast'
      }
    ]
  },
  {
    id: '3',
    name: 'דני אבידן',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500',
    expertise: 'כושר גופני',
    experience: '10 שנות ניסיון באימון כושר',
    icon: 'fitness',
    recommendations: [
      {
        title: 'סרט על טכניקות לחימה',
        description: 'סרט הדרכה על טכניקות לחימה מתקדמות',
        type: 'movie'
      },
      {
        title: 'ספר על כושר גופני',
        description: 'מדריך מקיף לאימון גופני מקצועי',
        type: 'book'
      }
    ]
  }
];

interface RecommendationModalProps {
  trainer: Trainer;
  onClose: () => void;
}

function RecommendationModal({ trainer, onClose }: RecommendationModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-full overflow-hidden">
              <Image
                src={trainer.image}
                alt={trainer.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">המלצות של {trainer.name}</h2>
              <p className="text-sm text-gray-600">מאמן בכיר</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            ✕
          </button>
        </div>
        
        <div className="space-y-5">
          {trainer.recommendations.map((rec, index) => (
            <div key={index} className="border-b border-gray-100 pb-5 last:border-0">
              <h3 className="text-lg font-semibold mb-2 text-gray-900">{rec.title}</h3>
              <p className="text-gray-600 mb-3 text-sm">{rec.description}</p>
              <div className="flex items-center gap-2">
                <span className="inline-block px-2.5 py-1 bg-[#ff8714]/10 text-[#ff8714] text-xs rounded-full font-medium">
                  {rec.type === 'book' ? 'ספר' : rec.type === 'movie' ? 'סרט' : 'פודקאסט'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TeamRecommendations() {
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);

  const getIcon = (type: 'combat' | 'mental' | 'fitness') => {
    switch (type) {
      case 'combat':
        return <FaFistRaised className="w-4 h-4" />;
      case 'mental':
        return <FaBrain className="w-4 h-4" />;
      case 'fitness':
        return <FaDumbbell className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="mt-20">
      <h2 className="text-2xl font-bold text-center mb-3">המלצות הצוות</h2>
      <p className="text-gray-600 text-center mb-10 max-w-2xl mx-auto text-sm">
        המאמנים שלנו בחרו עבורכם את התוכן הטוב ביותר בתחומי האימון, הלחימה והמנהיגות
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
        {trainers.map((trainer) => (
          <div
            key={trainer.id}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer border border-gray-100"
            onClick={() => setSelectedTrainer(trainer)}
          >
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative w-14 h-14 rounded-full overflow-hidden border border-[#ff8714]/20">
                  <Image
                    src={trainer.image}
                    alt={trainer.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center">
                    {getIcon(trainer.icon)}
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">{trainer.name}</h3>
                  <p className="text-xs text-[#ff8714] font-medium">{trainer.expertise}</p>
                </div>
              </div>
              <p className="text-xs text-gray-600">{trainer.experience}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedTrainer && (
        <RecommendationModal
          trainer={selectedTrainer}
          onClose={() => setSelectedTrainer(null)}
        />
      )}
    </div>
  );
} 