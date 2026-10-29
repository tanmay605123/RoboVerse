'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Trophy, Zap, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';

export function ChallengeBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const challenges = [
    {
      id: 'weekly_ch_1',
      tag: 'WEEKLY CIRCUIT CHALLENGE',
      title: 'Autonomous Obstacle Rover with HC-SR04 & L298N',
      description: 'Build a differential drive robot that stops and turns when detecting an object within 15 cm. Earn 250 XP + "Pathfinder" badge!',
      actionText: 'Start the challenge',
      actionHref: '/workbench?starter=starter_obstacle_car',
      reward: '250 XP',
      gradient: 'from-[#FFF0E2] via-[#FFF8F0] to-[#FFFFFF] dark:from-[#241C1A] dark:via-[#1E1924] dark:to-[#171E3F]',
      badgeColor: 'bg-orange-100 text-brand-orange dark:bg-orange-950 dark:text-orange-400',
    },
    {
      id: 'hackathon_alert_2',
      tag: 'NATIONAL HACKATHON ALERT',
      title: 'National Autonomous Rover Challenge 2026',
      description: 'Prize pool ₹2,50,000! Registrations close in 5 days. Form a team of 4 or join the AI-matched pool.',
      actionText: 'Register team now',
      actionHref: '/hackathons',
      reward: '₹2.5L Pool',
      gradient: 'from-[#EBF2FF] via-[#F4F8FF] to-[#FFFFFF] dark:from-[#151F3B] dark:via-[#192244] dark:to-[#171E3F]',
      badgeColor: 'bg-blue-100 text-brand-blue dark:bg-blue-950 dark:text-blue-400',
    },
    {
      id: 'new_course_3',
      tag: 'NEW TRACK LAUNCHED',
      title: 'Machine Learning for Robotics & ROS 2 Navigation',
      description: 'Train edge neural networks on camera feeds for real-time visual line tracking and SLAM mapping.',
      actionText: 'Explore curriculum',
      actionHref: '/roadmap',
      reward: 'Pro Track',
      gradient: 'from-[#F3EBFF] via-[#FAF5FF] to-[#FFFFFF] dark:from-[#221838] dark:via-[#1D1B36] dark:to-[#171E3F]',
      badgeColor: 'bg-purple-100 text-brand-purple dark:bg-purple-950 dark:text-purple-400',
    },
  ];

  const current = challenges[currentSlide];

  return (
    <div className={`relative overflow-hidden rounded-[20px] border border-[#E8ECF2] dark:border-[#2A3568] bg-gradient-to-r ${current.gradient} p-6 md:p-8 shadow-card-soft transition-all duration-300`}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
        {/* Left Illustration / Robot Mascot */}
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-tr from-brand-orange to-brand-orangeLight flex items-center justify-center text-white shrink-0 shadow-orange-pill transform -rotate-3 hover:rotate-0 transition-transform">
            <Trophy className="w-9 h-9 md:w-11 md:h-11" />
          </div>

          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${current.badgeColor}`}>
                {current.tag}
              </span>
              <span className="text-xs font-bold text-brand-muted">• {current.reward}</span>
            </div>
            <h2 className="text-lg md:text-xl font-black text-brand-navy dark:text-white leading-tight">
              {current.title}
            </h2>
            <p className="text-xs md:text-sm text-brand-muted dark:text-gray-300 line-clamp-2">
              {current.description}
            </p>
          </div>
        </div>

        {/* Right CTA Button & Slide Controls */}
        <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
          <Link
            href={current.actionHref}
            className="px-5 py-2.5 rounded-full border-2 border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white dark:hover:text-white font-bold text-xs md:text-sm transition-all duration-200 flex items-center gap-2 shadow-xs group"
          >
            <span>{current.actionText}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Slide switchers */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentSlide((prev) => (prev > 0 ? prev - 1 : challenges.length - 1))}
              className="p-2 rounded-full bg-white dark:bg-slate-800 text-brand-muted hover:text-brand-navy dark:hover:text-white border border-gray-200 dark:border-slate-700 shadow-xs"
              aria-label="Previous challenge"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev < challenges.length - 1 ? prev + 1 : 0))}
              className="p-2 rounded-full bg-white dark:bg-slate-800 text-brand-muted hover:text-brand-navy dark:hover:text-white border border-gray-200 dark:border-slate-700 shadow-xs"
              aria-label="Next challenge"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Decorative Background Dots */}
      <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-brand-orange/5 blur-2xl pointer-events-none" />
    </div>
  );
}
