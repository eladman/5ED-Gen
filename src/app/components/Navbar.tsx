"use client";

import LoginButton from "./LoginButton";
import { useAuth } from "@/lib/hooks/useAuth";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

// Import PWA button with no SSR to prevent hydration issues
const InstallPWAButton = dynamic(
  () => import("./InstallPWAButton"),
  { ssr: false }
);

interface NavbarProps {
  isAcademy?: boolean;
  isLoading?: boolean;
}

export default function Navbar({ isAcademy = false, isLoading = false }: NavbarProps) {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className={`fixed w-full z-50 ${isAcademy || isLoading ? 'bg-black' : 'bg-white/80'} backdrop-blur-sm`}>
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button - Only show when user is signed in */}
            {user && (
              <button 
                className={`p-2 ${isAcademy || isLoading ? 'text-white' : 'text-gray-600'} focus:outline-none`}
                onClick={toggleMobileMenu}
                aria-label="Toggle mobile menu"
              >
                <div className="w-6 h-6 flex flex-col justify-between">
                  <motion.span
                    className={`block w-full h-0.5 ${isAcademy || isLoading ? 'bg-white' : 'bg-gray-600'} rounded-full origin-center`}
                    animate={{
                      rotate: isMobileMenuOpen ? 45 : 0,
                      y: isMobileMenuOpen ? 8 : 0,
                    }}
                    transition={{ duration: 0.2 }}
                  />
                  <motion.span
                    className={`block w-full h-0.5 ${isAcademy || isLoading ? 'bg-white' : 'bg-gray-600'} rounded-full`}
                    animate={{
                      opacity: isMobileMenuOpen ? 0 : 1,
                    }}
                    transition={{ duration: 0.1 }}
                  />
                  <motion.span
                    className={`block w-full h-0.5 ${isAcademy || isLoading ? 'bg-white' : 'bg-gray-600'} rounded-full origin-center`}
                    animate={{
                      rotate: isMobileMenuOpen ? -45 : 0,
                      y: isMobileMenuOpen ? -8 : 0,
                    }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
              </button>
            )}
            <Link href="/" className={`text-2xl font-bold text-[#ff8714] hover:text-[#e67200] transition-colors cursor-pointer`}>
              חמש אצבעות
            </Link>
          </div>
          
          <div className="flex items-center space-x-4 space-x-reverse">
            {/* PWA Install Button - Only show when user is signed in and client-side */}
            {user && isMounted && <InstallPWAButton />}
            <LoginButton isAcademy={isAcademy || isLoading} />
          </div>
        </div>

        {/* Mobile Navigation Menu - Only show when user is signed in */}
        <AnimatePresence>
          {user && isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className={`${isAcademy || isLoading ? 'bg-black' : 'bg-white'} ${isAcademy ? '' : 'border-t'} overflow-hidden`}
            >
              <motion.div
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                exit={{ y: -20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col space-y-1 px-4 py-3"
              >
                <Link 
                  href="/" 
                  className={`${isAcademy || isLoading ? 'text-white hover:text-gray-200' : 'text-gray-600 hover:text-[#ff8714]'} py-2 px-3 rounded-lg hover:bg-gray-100/10 transition-colors`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  ראשי
                </Link>
                <Link 
                  href="/programs" 
                  className={`${isAcademy || isLoading ? 'text-white hover:text-gray-200' : 'text-gray-600 hover:text-[#ff8714]'} py-2 px-3 rounded-lg hover:bg-gray-100/10 transition-colors hidden`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  התוכניות שלי
                </Link>
                <Link 
                  href="/metrics" 
                  className={`${isAcademy || isLoading ? 'text-white hover:text-gray-200' : 'text-gray-600 hover:text-[#ff8714]'} py-2 px-3 rounded-lg hover:bg-gray-100/10 transition-colors`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  מדדים
                </Link>
                <Link 
                  href="/academy" 
                  className={`${isAcademy || isLoading ? 'text-white hover:text-gray-200' : 'text-gray-600 hover:text-[#ff8714]'} py-2 px-3 rounded-lg hover:bg-gray-100/10 transition-colors`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  האקדמיה
                </Link>
                <Link 
                  href="/profile" 
                  className={`${isAcademy || isLoading ? 'text-white hover:text-gray-200' : 'text-gray-600 hover:text-[#ff8714]'} py-2 px-3 rounded-lg hover:bg-gray-100/10 transition-colors`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  פרופיל
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
} 