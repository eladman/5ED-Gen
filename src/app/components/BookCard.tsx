import Image from 'next/image';
import { FaStar, FaExternalLinkAlt } from 'react-icons/fa';

interface BookCardProps {
  title: string;
  author: string;
  description: string;
  imageUrl: string;
  rating: number;
  amazonLink?: string;
  category: string;
}

export default function BookCard({
  title,
  author,
  description,
  imageUrl,
  rating,
  amazonLink,
  category
}: BookCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative aspect-[3/4] w-full">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
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
        {amazonLink && (
          <a
            href={amazonLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-[#ff8714] hover:text-[#e67200] transition-colors"
          >
            קנה באמזון
            <FaExternalLinkAlt className="mr-1 w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
} 