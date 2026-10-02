import type { Metadata } from 'next';
import './globals.css';
import { FloatingRituuChat } from '@/components/rituu/FloatingRituuChat';

export const metadata: Metadata = {
  title: 'RoboVerse | 3D Robotics & Electronics Learning Platform',
  description:
    'Learn it. Build it. Simulate it. Futuristic 3D circuits, Arduino simulation, and AI robotics assistant Rituu for students.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/brand/app-icon-1024.svg',
  },
  manifest: '/manifest.json',
};

export const viewport = {
  themeColor: '#07110D',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Manrope:wght@400;500;600;700&family=Sora:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-robo-bg text-robo-text min-h-screen selection:bg-robo-neon selection:text-black">
        {children}
        <FloatingRituuChat />
      </body>
    </html>
  );
}
