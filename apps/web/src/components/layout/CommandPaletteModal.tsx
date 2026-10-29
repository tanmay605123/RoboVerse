'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Cpu,
  FolderPlus,
  Sparkles,
  Trophy,
  MapPin,
  BookOpen,
  GraduationCap,
  ShoppingBag,
  ArrowRight,
  X,
  CreditCard,
  Sliders,
} from 'lucide-react';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandItem {
  id: string;
  category: 'ACTIONS' | 'SAMPLE_PROJECTS' | 'COMPONENTS' | 'COURSES';
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  href: string;
}

const COMMAND_ITEMS: CommandItem[] = [
  // Quick Actions
  {
    id: 'act_new_circuit',
    category: 'ACTIONS',
    title: 'New Circuit Workshop',
    subtitle: 'Launch 2D & 3D Tinkercad-style circuit canvas',
    icon: Cpu,
    iconBg: 'bg-orange-100 text-brand-orange',
    href: '/workbench',
  },
  {
    id: 'act_ask_rituu',
    category: 'ACTIONS',
    title: 'Ask Rituu AI Mentor',
    subtitle: 'Debug wiring errors or ask Arduino C++ code questions',
    icon: Sparkles,
    iconBg: 'bg-purple-100 text-brand-purple',
    href: '/rituu',
  },
  {
    id: 'act_hackathons',
    category: 'ACTIONS',
    title: 'Browse Robotics Hackathons',
    subtitle: 'View upcoming competitions and prize pools',
    icon: Trophy,
    iconBg: 'bg-amber-100 text-amber-600',
    href: '/hackathons',
  },
  {
    id: 'act_shops',
    category: 'ACTIONS',
    title: 'Find Nearby Component Shops',
    subtitle: 'Locate verified electronics markets on Google Maps',
    icon: MapPin,
    iconBg: 'bg-rose-100 text-rose-500',
    href: '/shops',
  },
  {
    id: 'act_plans',
    category: 'ACTIONS',
    title: 'Upgrade Plan & Subscriptions',
    subtitle: 'Unlock live mentorship, unlimited projects & 18% GST invoices',
    icon: CreditCard,
    iconBg: 'bg-emerald-100 text-emerald-600',
    href: '/dashboard?tab=plans',
  },

  // Sample Projects
  {
    id: 'samp_line_follower',
    category: 'SAMPLE_PROJECTS',
    title: 'Autonomous Line Following Robot',
    subtitle: 'PID differential steering with dual TCRT5000 IR sensors & L298N',
    icon: Cpu,
    iconBg: 'bg-blue-100 text-brand-blue',
    href: '/workbench?starter=starter_line_follower',
  },
  {
    id: 'samp_robotic_hand',
    category: 'SAMPLE_PROJECTS',
    title: '5-Finger Articulated Robotic Hand',
    subtitle: 'Bionic gripper using 5x SG90 micro servos and flex triggers',
    icon: Cpu,
    iconBg: 'bg-orange-100 text-brand-orange',
    href: '/workbench?starter=starter_robotic_hand',
  },
  {
    id: 'samp_drone_quad',
    category: 'SAMPLE_PROJECTS',
    title: 'Drone Quadcopter Flight Controller',
    subtitle: '6-DOF IMU stabilization with MPU6050 and brushless ESC telemetry',
    icon: Cpu,
    iconBg: 'bg-emerald-100 text-emerald-600',
    href: '/workbench?starter=starter_drone_quad',
  },

  // Components
  {
    id: 'comp_arduino_uno',
    category: 'COMPONENTS',
    title: 'Arduino Uno R3 Microcontroller',
    subtitle: 'ATmega328P with 14 digital I/O, 6 analog inputs & 16MHz clock',
    icon: Cpu,
    iconBg: 'bg-cyan-100 text-cyan-600',
    href: '/workbench?add=arduino_uno',
  },
  {
    id: 'comp_ultrasonic',
    category: 'COMPONENTS',
    title: 'Ultrasonic Distance Sensor HC-SR04',
    subtitle: '2cm to 400cm sonar ranging with 40kHz sonic burst',
    icon: Cpu,
    iconBg: 'bg-indigo-100 text-indigo-600',
    href: '/workbench?add=hc_sr04',
  },
  {
    id: 'comp_servo_sg90',
    category: 'COMPONENTS',
    title: 'Micro Servo Motor SG90 (180°)',
    subtitle: '50Hz PWM position control with nylon gear train',
    icon: Cpu,
    iconBg: 'bg-orange-100 text-brand-orange',
    href: '/workbench?add=servo_sg90',
  },

  // Courses
  {
    id: 'course_arduino_101',
    category: 'COURSES',
    title: 'Arduino Electronics 101: From LED to Robot',
    subtitle: 'Fundamental voltage dividers, Ohm’s Law and digital I/O',
    icon: BookOpen,
    iconBg: 'bg-blue-100 text-brand-blue',
    href: '/roadmap?course=arduino-101',
  },
  {
    id: 'course_ros_nav',
    category: 'COURSES',
    title: 'ROS 2 & Autonomous LiDAR Navigation',
    subtitle: 'SLAM mapping, costmaps, and Nav2 waypoint navigation',
    icon: GraduationCap,
    iconBg: 'bg-purple-100 text-brand-purple',
    href: '/roadmap?course=ros2-nav',
  },
];

export function CommandPaletteModal({ isOpen, onClose }: CommandPaletteModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filteredItems = COMMAND_ITEMS.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (item: CommandItem) => {
    onClose();
    router.push(item.href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-2xl bg-[#0A1F17]/95 rounded-3xl shadow-2xl border border-[rgba(57,255,106,0.3)] backdrop-blur-2xl overflow-hidden animate-slide-up flex flex-col max-h-[80vh] text-[#EAF7EF]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[rgba(57,255,106,0.15)] font-mono">
          <Search className="w-5 h-5 text-[#39FF6A] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command, project, component or course..."
            className="w-full bg-transparent text-sm md:text-base font-semibold text-[#EAF7EF] placeholder:text-[#527063] focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-[#8FA99B] hover:text-[#39FF6A]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-[#0E2A1F] text-[#8FA99B] border border-[rgba(57,255,106,0.2)]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 font-mono">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-[#8FA99B]">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#39FF6A]" />
              <p className="text-sm font-semibold">No results found for &quot;{query}&quot;</p>
              <p className="text-xs mt-1">Try searching for &quot;Arduino&quot;, &quot;Rover&quot;, or &quot;Rituu&quot;</p>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const Icon = item.icon;
              const isSelected = selectedIndex === index;

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[rgba(57,255,106,0.12)] border border-[rgba(57,255,106,0.3)] text-[#EAF7EF]'
                      : 'hover:bg-white/5 text-[#CBD8D0] border border-transparent'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.iconBg}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold truncate text-[#EAF7EF]">{item.title}</p>
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#040B08] border border-[rgba(57,255,106,0.2)] text-[#8FA99B]">
                        {item.category.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8FA99B] truncate mt-0.5">{item.subtitle}</p>
                  </div>
                  <ArrowRight
                    className={`w-4 h-4 transition-transform ${
                      isSelected ? 'text-[#39FF6A] translate-x-0.5' : 'text-transparent'
                    }`}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Helper Bar */}
        <div className="px-6 py-2.5 bg-[#040B08] border-t border-[rgba(57,255,106,0.15)] flex items-center justify-between text-[11px] text-[#8FA99B] font-mono">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="font-mono font-bold bg-[#0E2A1F] text-[#39FF6A] border border-[rgba(57,255,106,0.2)] px-1.5 py-0.5 rounded shadow-xs">↑↓</kbd> Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="font-mono font-bold bg-[#0E2A1F] text-[#39FF6A] border border-[rgba(57,255,106,0.2)] px-1.5 py-0.5 rounded shadow-xs">↵</kbd> Select
            </span>
          </div>
          <span>RoboVerse Command Palette</span>
        </div>
      </div>
    </div>
  );
}
