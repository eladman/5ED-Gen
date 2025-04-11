import './globals.css'
import type { Metadata } from 'next'
import { Heebo } from 'next/font/google'
import { AuthProvider } from '@/lib/contexts/AuthContext'
import { ProfileProvider } from '@/lib/contexts/ProfileContext'
import { Toaster } from 'react-hot-toast'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Navbar from '@/components/Navbar'
import dynamic from 'next/dynamic'

// Import PWA components with no SSR to prevent hydration issues
const PWAUpdateNotification = dynamic(
  () => import('@/components/PWAUpdateNotification'),
  { ssr: false }
)

const heebo = Heebo({ 
  subsets: ['hebrew', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-heebo'
})

export const metadata: Metadata = {
  title: 'חמש אצבעות - תוכניות אימון אישיות',
  description: 'פלטפורמה מתקדמת ליצירת תוכניות אימון אישיות ומעקב אחר התקדמות',
  manifest: '/manifest.json',
  themeColor: '#ffffff',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'חמש אצבעות',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-192x192.png' },
    ],
    shortcut: [
      { url: '/icons/icon-512x512.png' },
    ],
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'white',
    'mobile-web-app-capable': 'yes',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${heebo.className} bg-white min-h-screen`}>
        <AuthProvider>
          <ProfileProvider>
            <Navbar />
            {children}
            <Toaster position="top-center" toastOptions={{
              duration: 3000,
              style: {
                background: '#333',
                color: '#fff',
                direction: 'rtl'
              },
            }} />
            <PWAUpdateNotification />
            <Analytics />
            <SpeedInsights />
          </ProfileProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
