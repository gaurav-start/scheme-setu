'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const isDarkNow = document.documentElement.classList.contains('dark');
    const nextTheme = isDarkNow ? 'light' : 'dark';

    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);

    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label="Toggle Dark Mode"
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className="p-1.5 rounded-md border border-slate-600 bg-slate-800/80 hover:bg-slate-700 text-amber-400 hover:text-amber-300 transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
    >
      <Sun className="w-3.5 h-3.5 text-amber-400 hidden dark:block" />
      <Moon className="w-3.5 h-3.5 text-slate-200 block dark:hidden" />
    </button>
  );
}
