"use client";

import { Navbar, PodcastsSection, AcademyNav } from '@/components';

export default function PodcastsPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8 pt-32">
        <h1 className="text-3xl font-bold text-center mb-4">פודקאסטים מומלצים</h1>
        <p className="text-xl text-[#ff8714] text-center mb-8">האזן לפודקאסטים מעשירים עם מומחים מתחומי האימון והלחימה</p>
        
        <AcademyNav />
        <PodcastsSection />
      </div>
    </main>
  );
} 