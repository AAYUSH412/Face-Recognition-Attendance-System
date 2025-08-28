import React from 'react';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../hooks/useTheme';
import { Button } from './Button';
import { HoverScale } from './Animation';

export const ThemeToggle = ({ size = 'default', variant = 'ghost', className = '' }) => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <SunIcon className="h-5 w-5" />;
      case 'dark':
        return <MoonIcon className="h-5 w-5" />;
      case 'system':
      default:
        return <ComputerDesktopIcon className="h-5 w-5" />;
    }
  };

  const getTooltipText = () => {
    switch (theme) {
      case 'light':
        return 'Switch to dark mode';
      case 'dark':
        return 'Switch to system preference';
      case 'system':
      default:
        return 'Switch to light mode';
    }
  };

  return (
    <HoverScale>
      <Button
        variant={variant}
        size={size}
        onClick={toggleTheme}
        className={`relative ${className}`}
        title={getTooltipText()}
        aria-label={getTooltipText()}
      >
        {getIcon()}
      </Button>
    </HoverScale>
  );
};

export const ThemeSelector = ({ className = '' }) => {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: 'light', label: 'Light', icon: SunIcon },
    { value: 'dark', label: 'Dark', icon: MoonIcon },
    { value: 'system', label: 'System', icon: ComputerDesktopIcon },
  ];

  return (
    <div className={`flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`}>
      {themes.map(({ value, label, icon: IconComponent }) => {
        return (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
              ${theme === value
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }
            `}
            aria-label={`Switch to ${label.toLowerCase()} theme`}
          >
            <IconComponent className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ThemeToggle;
