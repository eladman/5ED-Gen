"use client";

import { IconType } from 'react-icons';
import { FaHeart } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { addToFavorites, removeFromFavorites, isInFavorites } from '@/lib/firebase/firebaseUtils';
import Image from 'next/image';
import Link from 'next/link';

interface CategoryItem {
  id: string;
  title: string;
  description: string;
  href: string;
  category?: string;
  actionText?: string;
  image?: string;
}

interface CategorySectionProps {
  id: string;
  title: string;
  icon: IconType;
  items: CategoryItem[];
  color: string;
}

const categoryColors = {
  podcasts: {
    primary: '#FF8C42',
    secondary: '#FFF0E5',
    hover: '#FF7A2E',
    bg: '#FFF8F0'
  },
  books: {
    primary: '#FF8C42',
    secondary: '#FFF0E5',
    hover: '#FF7A2E',
    bg: '#FFF8F0'
  },
  videos: {
    primary: '#FF8C42',
    secondary: '#FFF0E5',
    hover: '#FF7A2E',
    bg: '#FFF8F0'
  }
};

const getActionText = (category: string) => {
  switch (category) {
    case 'podcasts':
      return 'האזן';
    case 'books':
      return 'קרא';
    case 'videos':
      return 'צפה';
    default:
      return 'פתח';
  }
};

export default function CategorySection({ title, icon: Icon, items, color }: CategorySectionProps) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const loadFavorites = async () => {
      if (user) {
        const userFavorites = await isInFavorites(user.uid);
        setFavorites(new Set(userFavorites));
      }
    };
    loadFavorites();
  }, [user]);

  const handleFavoriteClick = async (item: CategoryItem) => {
    if (!user) return;

    const itemId = `${item.category || ''}-${item.id}`;
    if (favorites.has(itemId)) {
      await removeFromFavorites(user.uid, itemId);
      setFavorites(prev => {
        const newFavorites = new Set(prev);
        newFavorites.delete(itemId);
        return newFavorites;
      });
    } else {
      await addToFavorites(user.uid, itemId);
      setFavorites(prev => new Set([...prev, itemId]));
    }
  };

  const displayedItems = showAll ? items : items.slice(0, 3);
  const hasMoreItems = items.length > 3;

  return (
    <section 
      className="rounded-xl shadow-sm p-4 h-[400px] flex flex-col"
      style={{ backgroundColor: categoryColors[color as keyof typeof categoryColors].bg }}
    >
      <div className="flex items-center gap-3 mb-4">
        <Icon className="w-6 h-6" style={{ color: categoryColors[color as keyof typeof categoryColors].primary }} />
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2 space-y-2">
        {displayedItems.map((item) => {
          const itemId = `${item.category || ''}-${item.id}`;
          const isFavorite = favorites.has(itemId);
          
          return (
            <div key={item.id} className="bg-white rounded-lg p-2.5">
              <div className="flex gap-3">
                {item.image && (
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-1 text-sm">{item.title}</h4>
                      <p className="text-xs text-gray-600 line-clamp-2">{item.description}</p>
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
                          setFavorites(prev => new Set([...prev, itemId]));
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
                  <Link
                    href={item.href}
                    className="inline-flex items-center text-xs font-medium mt-2 transition-colors"
                    style={{ color: categoryColors[color as keyof typeof categoryColors].primary }}
                  >
                    {item.actionText || getActionText(item.category || '')} עכשיו
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {hasMoreItems && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 text-sm font-medium transition-colors"
          style={{ 
            color: categoryColors[color as keyof typeof categoryColors].primary
          }}
        >
          {showAll ? 'הצג פחות' : `הצג עוד ${items.length - 3} פריטים`}
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
          background: ${categoryColors[color as keyof typeof categoryColors].primary};
          border-radius: 2px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: ${categoryColors[color as keyof typeof categoryColors].hover};
        }
      `}</style>
    </section>
  );
} 