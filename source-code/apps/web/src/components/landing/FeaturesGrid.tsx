'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Cpu,
  Sparkles,
  MapPin,
  Trophy,
  ShoppingBag,
  Award,
  Zap,
  Activity,
  Layers,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: Cpu,
    title: '3D Circuit Workbench & MNA Engine',
    description:
      'Drag-and-drop components onto real breadboards in 3D. Real-time electrical nodal simulation, Arduino C++ compilation, and instant short-circuit / missing ground error warnings.',
    tag: 'FLAGSHIP ENGINE',
    highlightColor: 'from-robo-neon/20 to-transparent',
    iconColor: 'text-robo-neon',
  },
  {
    icon: Sparkles,
    title: 'Rituu, Your AI Robotics Copilot',
    description:
      'Upload a photo of your breadboard wiring or paste Arduino code. Rituu spots errors, explains fixes with step-by-step guidance, and prevents burnt components.',
    tag: 'CLAUDE VISION AI',
    highlightColor: 'from-robo-teal/20 to-transparent',
    iconColor: 'text-robo-teal',
  },
  {
    icon: Layers,
    title: '3D Robotics Learning Roadmap',
    description:
      'Progress through an interactive 3D level map: Electronics basics, Arduino, Sensor fusion, Motor Kinematics, ROS 2, and Computer Vision for autonomous rovers.',
    tag: 'LEARNING PASSPORT',
    highlightColor: 'from-robo-neon/20 to-transparent',
    iconColor: 'text-robo-neon',
  },
  {
    icon: Trophy,
    title: 'National Hackathons & Team Match',
    description:
      'Curated competitions across Indian schools and engineering colleges. Get city alerts, practice past problem statements, and form multidisciplinary robot teams.',
    tag: 'COMPETITIONS',
    highlightColor: 'from-robo-orange/20 to-transparent',
    iconColor: 'text-robo-orange',
  },
  {
    icon: ShoppingBag,
    title: 'TechSavyyy Store & 1-Click BOM',
    description:
      'Order verified microcontrollers, sensors, and chassis at student-friendly prices. One-click "Buy All Project Parts" automatically populated from your 3D simulator.',
    tag: 'HARDWARE STORE',
    highlightColor: 'from-robo-teal/20 to-transparent',
    iconColor: 'text-robo-teal',
  },
  {
    icon: MapPin,
    title: 'Local Component Shop Locator',
    description:
      'Need parts right now for a science exhibition or hackathon deadline? Locate verified offline component shops in your city with stock inventory and contact details.',
    tag: 'LOCAL STORES',
    highlightColor: 'from-robo-neon/20 to-transparent',
    iconColor: 'text-robo-neon',
  },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="py-20 md:py-28 relative bg-[#06100C]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-robo-surfaceRaised border border-robo-borderSubtle text-robo-teal text-xs font-mono mb-4">
            <Activity className="w-3.5 h-3.5" />
            <span>FULL-STACK ROBOTICS ECOSYSTEM</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-sans">
            Everything You Need To Go From{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-robo-neon to-robo-teal">
              Zero to Building Autonomous Robots
            </span>
          </h2>
          <p className="text-base sm:text-lg text-robo-textSecondary mt-4">
            RoboVerse combines browser-based 3D physics simulation with guided mentor classes and real hardware delivery.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative rounded-2xl glass-panel p-7 overflow-hidden transition-all duration-300 hover:border-robo-borderHighlight hover:-translate-y-1.5 flex flex-col justify-between"
              >
                {/* Radial Glow Header */}
                <div
                  className={`absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl ${feat.highlightColor} rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500`}
                />

                <div>
                  {/* Tag and Icon */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3 rounded-xl bg-robo-surfaceRaised border border-robo-borderSubtle group-hover:border-robo-neon/40 transition-colors">
                      <Icon className={`w-6 h-6 ${feat.iconColor}`} />
                    </div>
                    <span className="text-[10px] font-mono tracking-wider px-2.5 py-1 rounded bg-[#040B08] text-robo-textMuted border border-robo-borderSubtle">
                      {feat.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold font-sans text-robo-text group-hover:text-robo-neon transition-colors mb-3">
                    {feat.title}
                  </h3>

                  <p className="text-sm text-robo-textSecondary leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-robo-borderSubtle/40 flex items-center gap-1.5 text-xs font-semibold text-robo-teal group-hover:text-robo-neon transition-colors">
                  <span>Explore Feature</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
