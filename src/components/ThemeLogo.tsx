import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
};

export function ThemeLogo({ className = '', size = 'md' }: ThemeLogoProps) {
  const { theme } = useTheme();

  return (
    <img
      src={theme === 'dark' ? '/DataNesTX_Logo_Dark_Frontend.png' : '/DataNesTX_Logo_Light_Frontend.png'}
      alt="DataForgeAI Logo"
      className={`${sizeClasses[size]} ${className}`}
    />
  );
}
