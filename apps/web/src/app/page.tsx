'use client';

import React, { useState } from 'react';
import { Navbar } from '../components/landing/Navbar';
import { HeroSection } from '../components/landing/HeroSection';
import { FeaturesGrid } from '../components/landing/FeaturesGrid';
import { Pricing3DSection } from '../components/landing/Pricing3DSection';
import { FaqSection } from '../components/landing/FaqSection';
import { Footer } from '../components/landing/Footer';
import { AnimatedSplashLogo } from '../components/brand/AnimatedSplashLogo';

export default function LandingPage() {
  const [splashFinished, setSplashFinished] = useState(false);

  return (
    <main className="min-h-screen bg-robo-bg text-robo-text selection:bg-robo-neon selection:text-black">
      {/* 3D Animated Splash Logo Intro */}
      {!splashFinished && (
        <AnimatedSplashLogo onFinish={() => setSplashFinished(true)} />
      )}

      {/* Main Page Layout */}
      <Navbar />
      <HeroSection />
      <FeaturesGrid />
      <Pricing3DSection />
      <FaqSection />
      <Footer />
    </main>
  );
}
