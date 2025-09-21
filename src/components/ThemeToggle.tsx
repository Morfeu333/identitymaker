import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Palette } from 'lucide-react';

type Theme = 'default' | 'theme-light' | 'theme-dark';

export const ThemeToggle = () => {
  const [theme, setTheme] = useState<Theme>('default');

  useEffect(() => {
    // Get saved theme from localStorage or default to default (futuristic)
    const savedTheme = (localStorage.getItem('theme') as Theme) || 'default';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;

    // Remove all theme classes
    root.classList.remove('theme-light', 'theme-dark');

    // Apply new theme class (default doesn't need a class)
    if (newTheme !== 'default') {
      root.classList.add(newTheme);
    }

    // Save to localStorage
    localStorage.setItem('theme', newTheme);
  };

  const cycleTheme = () => {
    const themes: Theme[] = ['default', 'theme-light', 'theme-dark'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];

    setTheme(nextTheme);
    applyTheme(nextTheme);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'theme-light':
        return <Sun className="h-4 w-4" />;
      case 'theme-dark':
        return <Moon className="h-4 w-4" />;
      case 'default':
        return <Palette className="h-4 w-4" />;
      default:
        return <Palette className="h-4 w-4" />;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'theme-light':
        return 'Light';
      case 'theme-dark':
        return 'Dark';
      case 'default':
        return 'Default';
      default:
        return 'Default';
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
