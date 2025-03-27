"use client";

import Link from 'next/link';
import { IconType } from 'react-icons';

interface AcademyCardProps {
  title: string;
  description: string;
  icon: IconType;
  href: string;
}

export default function AcademyCard({ title, description, icon: Icon, href }: AcademyCardProps) {
  return (
    <Link href={href} className="block">
      <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 h-full">
        <div className="w-12 h-12 rounded-full bg-[#ff8714]/10 flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-[#ff8714]" />
        </div>
        <h3 className="text-xl font-bold mb-2 text-gray-900">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </Link>
  );
} 