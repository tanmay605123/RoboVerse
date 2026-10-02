'use client';

import React from 'react';
import Link from 'next/link';

interface LogoProps {
  variant?: 'horizontal' | 'stacked' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  withLink?: boolean;
}

export function Logo({
  variant = 'horizontal',
  size = 'md',
  className = '',
  withLink = true,
}: LogoProps) {
  let height = 36;
  if (size === 'sm') height = 28;
  if (size === 'lg') height = 48;
  if (size === 'xl') height = 64;

  let src = '/brand/logo-horizontal-dark.svg';
  if (variant === 'stacked') src = '/brand/logo-stacked-dark.svg';
  if (variant === 'icon') src = '/brand/logo-icon.svg';

  const content = (
    <div className={`flex items-center gap-2 group select-none ${className}`}>
      <img
        src={src}
        alt="RoboVerse Logo"
        style={{ height: `${height}px`, width: 'auto' }}
        className="transition-transform duration-300 group-hover:scale-105"
      />
    </div>
  );

  if (withLink) {
    return (
      <Link href="/" aria-label="RoboVerse Home">
        {content}
      </Link>
    );
  }

  return content;
}
