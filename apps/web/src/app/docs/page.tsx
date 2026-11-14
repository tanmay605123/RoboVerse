import type { Metadata } from 'next';
import { DocsClient } from '../../components/support/DocsClient';

export const metadata: Metadata = {
  title: 'Documentation | RoboVerse',
  description: 'Guides for learning, building, simulating, and sharing robotics projects in RoboVerse.',
  openGraph: { title: 'Documentation | RoboVerse', description: 'Learn it. Build it. Simulate it with RoboVerse documentation.', type: 'website' },
};

export default function DocsPage() { return <DocsClient />; }

