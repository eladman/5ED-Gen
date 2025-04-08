"use client";

import { useState, useEffect } from 'react';
import { DownloadIcon } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

export default function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Make sure we're in the browser environment
    if (typeof window === 'undefined') return;

    try {
      // Check if already installed
      if (window.matchMedia('(display-mode: standalone)').matches || 
          (window.navigator as NavigatorWithStandalone).standalone === true) {
        setIsInstalled(true);
        return;
      }

      const handleBeforeInstallPrompt = (e: Event) => {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        // Store the event so it can be triggered later
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        // Update UI to notify the user they can install the PWA
        setIsInstallable(true);
      };

      const handleAppInstalled = () => {
        // Hide the app-provided install promotion
        setIsInstallable(false);
        setIsInstalled(true);
        // Clear the deferredPrompt
        setDeferredPrompt(null);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    } catch (error) {
      console.error('Error in PWA install button setup:', error);
      return;
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      // Show the install prompt
      await deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      // We no longer need the prompt. Clear it up.
      setDeferredPrompt(null);
      setIsInstallable(false);
    } catch (error) {
      console.error('Error during PWA installation:', error);
    }
  };

  if (!isInstallable || isInstalled) {
    return null;
  }

  return (
    <button
      onClick={handleInstallClick}
      className="flex items-center gap-1 py-1 px-3 rounded-lg text-white bg-[#ff8714] hover:bg-[#e67200] transition-colors text-sm"
      aria-label="התקן את האפליקציה"
    >
      <DownloadIcon size={16} />
      <span className="hidden sm:inline-block">התקן</span>
    </button>
  );
} 