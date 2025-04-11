"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaHeart } from 'react-icons/fa';
import { useAuth } from '@/lib/hooks/useAuth';
import { addToFavorites, removeFromFavorites, isInFavorites } from '@/lib/firebase/firebaseUtils';

interface Trainer {
  id: string;
  name: string;
  role: string;
  image: string;
  recommendations: {
    id: string;
    title: string;
    description: string;
    link: string;
  }[];
}

interface TeamRecommendationsProps {
  trainers: Trainer[];
}

const colors = {
  primary: '#FF8C42',
  secondary: '#FFF0E5',
  hover: '#FF7A2E',
  bg: '#FFF8F0'
};

export default function TeamRecommendations({ trainers }: TeamRecommendationsProps) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);

  const displayedTrainers = showAll ? trainers : trainers.slice(0, 2);
  const hasMoreTrainers = trainers.length > 2;

  return (
    <section className="rounded-xl shadow-sm p-4 h-[400px] flex flex-col" style={{ backgroundColor: colors.bg }}>
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-lg font-bold text-gray-900">המלצות מהצוות</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {displayedTrainers.map((trainer) => (
          <div key={trainer.id} className="bg-white rounded-lg p-3">
            <div className="flex items-center gap-3 mb-2">
              <div className="relative w-12 h-12 rounded-full overflow-hidden">
                <Image
                  src={trainer.image}
                  alt={trainer.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{trainer.name}</h3>
                <p className="text-sm text-gray-600">{trainer.role}</p>
              </div>
            </div>
            
            {trainer.recommendations.slice(0, 1).map((rec) => {
              const itemId = `trainer-${trainer.id}-${rec.id}`;
              const isFavorite = favorites.has(itemId);
              
              return (
                <div key={rec.id} className="bg-gray-50 rounded-lg p-2.5">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-1 text-sm">{rec.title}</h4>
                      <p className="text-xs text-gray-600 line-clamp-2">{rec.description}</p>
                    </div>
                    <button
                      onClick={() => {
                        if (!user) return;
                        if (isFavorite) {
                          removeFromFavorites(user.uid, itemId);
                          setFavorites(prev => {
                            const newFavorites = new Set(prev);
                            newFavorites.delete(itemId);
                            return newFavorites;
                          });
                        } else {
                          addToFavorites(user.uid, itemId);
                          setFavorites(prev => new Set(Array.from(prev).concat(itemId)));
                        }
                      }}
                      className={`p-1.5 rounded-full transition-colors ${
                        isFavorite 
                          ? 'text-red-500 hover:text-red-600' 
                          : 'text-gray-400 hover:text-red-500'
                      }`}
                      title={isFavorite ? 'הסר ממועדפים' : 'הוסף למועדפים'}
                    >
                      <FaHeart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {hasMoreTrainers && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 text-sm font-medium transition-colors"
          style={{ color: colors.primary }}
        >
          {showAll ? 'הצג פחות' : `הצג עוד ${trainers.length - 2} מאמנים`}
        </button>
      )}

      <style jsx>{`
        .overflow-y-auto::-webkit-scrollbar {
          width: 4px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: ${colors.primary};
          border-radius: 2px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: ${colors.hover};
        }
      `}</style>
    </section>
  );
} 