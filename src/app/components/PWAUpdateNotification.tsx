"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function PWAUpdateNotification() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [showReload, setShowReload] = useState(false);

  useEffect(() => {
    // Check if we're in a browser and if service workers are supported
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Add event listeners for when a new service worker is waiting
      navigator.serviceWorker.ready.then(registration => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setWaitingWorker(newWorker);
                setShowReload(true);
                
                // Show toast notification
                toast(
                  (t) => (
                    <div className="flex flex-col items-center space-y-2">
                      <span className="font-medium">גרסה חדשה זמינה!</span>
                      <div className="flex space-x-2 space-x-reverse">
                        <button
                          onClick={() => {
                            toast.dismiss(t.id);
                            updateServiceWorker();
                          }}
                          className="px-4 py-2 bg-[#ff8714] text-white rounded-md text-sm font-medium"
                        >
                          עדכן עכשיו
                        </button>
                        <button
                          onClick={() => toast.dismiss(t.id)}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium"
                        >
                          אחר כך
                        </button>
                      </div>
                    </div>
                  ),
                  {
                    duration: 15000, // 15 seconds
                    position: 'bottom-center',
                    style: {
                      background: 'white',
                      color: 'black',
                      direction: 'rtl',
                      padding: '16px',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    },
                  }
                );
              }
            });
          }
        });

        // Check if there's already a waiting worker
        if (registration.waiting && navigator.serviceWorker.controller) {
          setWaitingWorker(registration.waiting);
          setShowReload(true);
        }
      });

      // Add event listener for when a new service worker takes over
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          window.location.reload();
          refreshing = true;
        }
      });
    }
  }, []);

  const updateServiceWorker = () => {
    if (waitingWorker) {
      // Send skip waiting message to the waiting service worker
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      setShowReload(false);
    }
  };

  // The component renders nothing, it just manages the update notification
  return null;
} 