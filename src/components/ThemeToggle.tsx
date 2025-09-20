import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Palette } from 'lucide-react';

type Theme = 'light' | 'dark' | 'futuristic-dark';

export const ThemeToggle = () => {
  const [theme, setTheme] = useState<Theme>('futuristic-dark');

  useEffect(() => {
    // Get saved theme from localStorage or default to futuristic-dark
    const savedTheme = (localStorage.getItem('theme') as Theme) || 'futuristic-dark';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('dark', 'futuristic-dark');
    
    // Apply new theme class
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else if (newTheme === 'futuristic-dark') {
      root.classList.add('futuristic-dark');
    }
    
    // Save to localStorage
    localStorage.setItem('theme', newTheme);
  };

  const cycleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'futuristic-dark'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    
    setTheme(nextTheme);
    applyTheme(nextTheme);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      case 'futuristic-dark':
        return <Palette className="h-4 w-4" />;
      default:
        return <Sun className="h-4 w-4" />;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light Theme';
      case 'dark':
        return 'Dark Theme';
      case 'futuristic-dark':
        return 'Futuristic Dark';
      default:
        return 'Light Theme';
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={cycleTheme}
      className="gap-2"
      title={`Current: ${getThemeLabel()}. Click to cycle themes.`}
    >
      {getThemeIcon()}
      <span className="hidden sm:inline">{getThemeLabel()}</span>
    </Button>
  );
};

export default ThemeToggle;
