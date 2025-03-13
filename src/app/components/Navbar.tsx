"use client";

import LoginButton from "./LoginButton";
import { useAuth } from "@/lib/hooks/useAuth";
import Link from "next/link";

export default function Navbar() {
  const { user } = useAuth();

  return (
    <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-sm border-b">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          <div className="text-2xl font-bold text-[#ff8714]">
            חמש אצבעות
          </div>
          
          <div className="hidden md:flex items-center space-x-8 space-x-reverse">
            <Link href="/" className="text-gray-600 hover:text-[#ff8714]">ראשי</Link>
            {!user && (
              <>
                <Link href="#features" className="text-gray-600 hover:text-[#ff8714]">תכונות</Link>
                <Link href="#pricing" className="text-gray-600 hover:text-[#ff8714]">מחירים</Link>
                <Link href="#contact" className="text-gray-600 hover:text-[#ff8714]">צור קשר</Link>
              </>
            )}
            {user && (
              <>
                <Link href="/programs" className="text-gray-600 hover:text-[#ff8714]">
                  התוכניות שלי
                </Link>
                <Link href="/metrics" className="text-gray-600 hover:text-[#ff8714]">
                  מדדים
                </Link>
                <Link href="/profile" className="text-gray-600 hover:text-[#ff8714]">
                  פרופיל
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center space-x-4 space-x-reverse">
            <LoginButton />
          </div>
        </div>
      </div>
    </nav>
  );
} 