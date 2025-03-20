import { FaStar, FaHeart } from 'react-icons/fa';
import { useState } from 'react';

interface BookCardProps {
  title: string;
  author: string;
  description: string;
  rating: number;
  category: string;
  likes?: number;
}

export default function BookCard({
  title,
  author,
  description,
  rating,
  category,
  likes = 0
}: BookCardProps) {
  const [likeCount, setLikeCount] = useState(likes);
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    if (isLiked) {
      setLikeCount(prev => prev - 1);
    } else {
      setLikeCount(prev => prev + 1);
    }
    setIsLiked(!isLiked);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300 p-4">
      <div className="inline-block px-2 py-1 bg-[#ff8714]/10 text-[#ff8714] text-xs font-medium rounded-full mb-2">
        {category}
      </div>
      <h3 className="text-lg font-bold mb-1 text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600 mb-2">{author}</p>
      <div className="flex items-center mb-3">
        {[...Array(5)].map((_, i) => (
          <FaStar
            key={i}
            className={`${
              i < rating ? 'text-yellow-400' : 'text-gray-300'
            } w-4 h-4`}
          />
        ))}
      </div>
      <p className="text-sm text-gray-700 mb-4 line-clamp-3">{description}</p>
      <button 
        onClick={handleLike}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#ff8714] transition-colors"
      >
        <FaHeart className={`w-4 h-4 ${isLiked ? 'text-red-500' : 'text-gray-400'}`} />
        <span>{likeCount} לייקים</span>
      </button>
    </div>
  );
} 