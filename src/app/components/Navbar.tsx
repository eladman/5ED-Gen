"use client";

import LoginButton from "./LoginButton";
import { useAuth } from "@/lib/hooks/useAuth";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  if (!user) {
    return (
      <div className="fixed w-full z-50 flex justify-center items-center h-16">
        <LoginButton />
      </div>
    );
  }

  return (
    <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-sm border-b">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-[#ff8714] hover:text-[#e67200] transition-colors cursor-pointer">
            חמש אצבעות
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 space-x-reverse">
            <Link href="/" className="text-gray-600 hover:text-[#ff8714]">ראשי</Link>
            <Link href="/programs" className="text-gray-600 hover:text-[#ff8714]">
              התוכניות שלי
            </Link>
            <Link href="/metrics" className="text-gray-600 hover:text-[#ff8714]">
              מדדים
            </Link>
            <Link href="/library" className="text-gray-600 hover:text-[#ff8714]">
              האקדמיה
            </Link>
            <Link href="/profile" className="text-gray-600 hover:text-[#ff8714]">
              פרופיל
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-gray-600 focus:outline-none" 
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          <div className="flex items-center space-x-4 space-x-reverse">
            <LoginButton />
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t pb-4 pt-2 shadow-lg">
            <div className="flex flex-col space-y-3 px-4">
              <Link 
                href="/" 
                className="text-gray-600 hover:text-[#ff8714] py-2 border-b border-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                ראשי
              </Link>
              <Link 
                href="/programs" 
                className="text-gray-600 hover:text-[#ff8714] py-2 border-b border-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                התוכניות שלי
              </Link>
              <Link 
                href="/metrics" 
                className="text-gray-600 hover:text-[#ff8714] py-2 border-b border-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                מדדים
              </Link>
              <Link 
                href="/library" 
                className="text-gray-600 hover:text-[#ff8714] py-2 border-b border-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                ספרייה
              </Link>
              <Link 
                href="/profile" 
                className="text-gray-600 hover:text-[#ff8714] py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                פרופיל
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 