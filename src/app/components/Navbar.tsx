"use client";

import LoginButton from "./LoginButton";
import { useAuth } from "@/lib/hooks/useAuth";
import Link from "next/link";
import { useState } from "react";

interface NavbarProps {
  isAcademy?: boolean;
  isLoading?: boolean;
}

export default function Navbar({ isAcademy = false, isLoading = false }: NavbarProps) {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className={`fixed w-full z-50 ${isAcademy || isLoading ? 'bg-black' : 'bg-white/80'} backdrop-blur-sm`}>
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className={`text-2xl font-bold text-[#ff8714] hover:text-[#e67200] transition-colors cursor-pointer`}>
            חמש אצבעות
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 space-x-reverse">
            <Link href="/" className={`${isAcademy || isLoading ? 'text-white hover:text-gray-200' : 'text-gray-600 hover:text-[#ff8714]'}`}>ראשי</Link>
            <Link href="/programs" className={`${isAcademy || isLoading ? 'text-white hover:text-gray-200' : 'text-gray-600 hover:text-[#ff8714]'}`}>
              התוכניות שלי
            </Link>
            <Link href="/metrics" className={`${isAcademy || isLoading ? 'text-white hover:text-gray-200' : 'text-gray-600 hover:text-[#ff8714]'}`}>
              מדדים
            </Link>
            <Link href="/academy" className={`${isAcademy || isLoading ? 'text-white hover:text-gray-200' : 'text-gray-600 hover:text-[#ff8714]'}`}>
              האקדמיה
            </Link>
            <Link href="/profile" className={`${isAcademy || isLoading ? 'text-white hover:text-gray-200' : 'text-gray-600 hover:text-[#ff8714]'}`}>
              פרופיל
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className={`md:hidden p-2 ${isAcademy || isLoading ? 'text-white' : 'text-gray-600'} focus:outline-none`}
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
            <LoginButton isAcademy={isAcademy || isLoading} />
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className={`md:hidden ${isAcademy || isLoading ? 'bg-black' : 'bg-white'} ${isAcademy ? '' : 'border-t'} pb-4 pt-2 shadow-lg`}>
            <div className="flex flex-col space-y-3 px-4">
              <Link 
                href="/" 
                className={`${isAcademy || isLoading ? 'text-white hover:text-gray-200' : 'text-gray-600 hover:text-[#ff8714]'} py-2 ${isAcademy ? '' : 'border-b border-gray-100'}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                ראשי
              </Link>
              <Link 
                href="/programs" 
                className={`${isAcademy || isLoading ? 'text-white hover:text-gray-200' : 'text-gray-600 hover:text-[#ff8714]'} py-2 ${isAcademy ? '' : 'border-b border-gray-100'}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                התוכניות שלי
              </Link>
              <Link 
                href="/metrics" 
                className={`${isAcademy || isLoading ? 'text-white hover:text-gray-200' : 'text-gray-600 hover:text-[#ff8714]'} py-2 ${isAcademy ? '' : 'border-b border-gray-100'}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                מדדים
              </Link>
              <Link 
                href="/academy" 
                className={`${isAcademy || isLoading ? 'text-white hover:text-gray-200' : 'text-gray-600 hover:text-[#ff8714]'} py-2 ${isAcademy ? '' : 'border-b border-gray-100'}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                האקדמיה
              </Link>
              <Link 
                href="/profile" 
                className={`${isAcademy || isLoading ? 'text-white hover:text-gray-200' : 'text-gray-600 hover:text-[#ff8714]'} py-2`}
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