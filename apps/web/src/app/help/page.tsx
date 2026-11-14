import type { Metadata } from 'next';
import { HelpClient } from '../../components/support/HelpClient';

export const metadata: Metadata = {
  title: 'Help Center | RoboVerse',
  description: 'Find answers for your RoboVerse account, simulator, Rituu AI, store orders, and community questions.',
  openGraph: { title: 'Help Center | RoboVerse', description: 'Get back to building with the RoboVerse Help Center.', type: 'website' },
};

export default function HelpPage() { return <HelpClient />; }

