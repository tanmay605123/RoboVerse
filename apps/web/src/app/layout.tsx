import type { Metadata } from 'next';
import './globals.css';
import { FloatingRituuChat } from '@/components/rituu/FloatingRituuChat';

export const metadata: Metadata = {
  title: 'RoboVerse | Learn it. Build it. Simulate it.',
  description:
    'Robotics and electronics learning platform for students. Interactive 2D & 3D circuit simulation, Arduino coding, and AI mentor Rituu.',
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
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&family=Sora:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                document.documentElement.classList.add('dark');
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="bg-[#07110D] text-[#EAF7EF] min-h-screen selection:bg-[#39FF6A] selection:text-[#07110D] font-sans antialiased">
        {children}
        <FloatingRituuChat />
      </body>
    </html>
  );
}
