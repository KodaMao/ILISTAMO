import './globals.css';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { FeedbackButton } from '@/components/FeedbackButton';
import type { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <div className="flex min-h-screen">
          <Navigation />
          <main className="flex-1 px-8 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
