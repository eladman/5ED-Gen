import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/lib/contexts/AuthContext'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'חמש אצבעות - תוכניות אימון אישיות',
  description: 'פלטפורמה מתקדמת ליצירת תוכניות אימון אישיות ומעקב אחר התקדמות',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${inter.className} bg-white min-h-screen`}>
        <AuthProvider>
          {children}
          <Toaster position="top-center" toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
              direction: 'rtl'
            },
          }} />
        </AuthProvider>
      </body>
    </html>
  )
}
