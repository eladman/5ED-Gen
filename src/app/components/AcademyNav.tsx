"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaPlay, FaBook, FaMicrophone, FaStar } from 'react-icons/fa';

const navItems = [
  {
    title: 'סרטים',
    href: '/academy/videos',
    icon: FaPlay
  },
  {
    title: 'ספרים',
    href: '/academy/books',
    icon: FaBook
  },
  {
    title: 'פודקאסטים',
    href: '/academy/podcasts',
    icon: FaMicrophone
  },
  {
    title: 'המלצות הצוות',
    href: '/academy/recommendations',
    icon: FaStar
  }
];

export default function AcademyNav() {
  const pathname = usePathname();

  return (
    <div className="flex justify-center gap-4 mb-8">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isActive
                ? 'bg-[#ff8714] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{item.title}</span>
          </Link>
        );
      })}
    </div>
  );
} 