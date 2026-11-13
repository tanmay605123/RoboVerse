'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function AnimatedSplashLogo({ onFinish }: { onFinish?: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onFinish) onFinish();
    }, 2400);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-robo-bg"
        >
          {/* Ambient Radial Cyber Glow */}
          <div className="absolute w-[450px] h-[450px] rounded-full bg-robo-neon/10 blur-[100px] pointer-events-none" />

          {/* Animated SVG Emblem */}
          <div className="relative w-44 h-44 mb-6">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {/* Outer Hexagon Line Draw Animation */}
              <motion.polygon
                points="100,28 162,64 162,136 100,172 38,136 38,64"
                fill="none"
                stroke="#7FE7D6"
                strokeWidth="2.5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.8 }}
                transition={{ duration: 1.2, ease: 'easeInOut' }}
              />

              {/* Inner Glowing Hexagon Frame */}
              <motion.polygon
                points="100,38 152,68 152,132 100,162 48,132 48,68"
                fill="#05120C"
                stroke="#39FF6A"
                strokeWidth="3.5"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8, type: 'spring' }}
                style={{ transformOrigin: '100px 100px' }}
              />

              {/* Lightning Circuit Bolt Dash */}
              <motion.path
                d="M 108 48 L 74 102 L 102 102 L 88 152 L 132 94 L 106 94 Z"
                fill="#39FF6A"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.7 }}
              />

              {/* Central Glowing Node Ignition */}
              <motion.circle
                cx="102"
                cy="102"
                r="14"
                fill="#39FF6A"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.4, 1], opacity: [0, 1, 0.8] }}
                transition={{ delay: 1.4, duration: 0.6 }}
                style={{ transformOrigin: '102px 102px' }}
              />
              <circle cx="102" cy="102" r="5" fill="#FFFFFF" />
            </svg>
          </div>

          {/* Typography Reveal */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-3xl font-extrabold tracking-wider font-sans">
              <span className="text-robo-text">ROBO</span>
              <span className="text-robo-neon neon-glow">VERSE</span>
            </h1>
            <p className="text-xs font-mono text-robo-teal tracking-[0.3em] mt-1">
              LEARN IT. BUILD IT. SIMULATE IT.
            </p>
          </motion.div>

          {/* Loading Progress Bar */}
          <div className="w-48 h-1 bg-[#091E16] rounded-full mt-8 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 2.2, ease: 'easeInOut' }}
              className="h-full bg-gradient-to-r from-robo-teal to-robo-neon"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
