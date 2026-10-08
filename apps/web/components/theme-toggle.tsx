'use client';

import {
  Moon,
  Sun,
} from 'lucide-react';

import {
  useEffect,
  useState,
} from 'react';

type Theme =
  | 'light'
  | 'dark';

export default function ThemeToggle() {
  const [
    theme,
    setTheme,
  ] = useState<Theme>('light');

  useEffect(() => {
    const saved =
      localStorage.getItem(
        'prorabotka_theme',
      ) as Theme | null;

    const preferredDark =
      window.matchMedia(
        '(prefers-color-scheme: dark)',
      ).matches;

    const initialTheme =
      saved ||
      (preferredDark
        ? 'dark'
        : 'light');

    applyTheme(
      initialTheme,
    );
  }, []);

  function applyTheme(
    nextTheme: Theme,
  ) {
    setTheme(
      nextTheme,
    );

    localStorage.setItem(
      'prorabotka_theme',
      nextTheme,
    );

    document.documentElement.classList.toggle(
      'dark',
      nextTheme === 'dark',
    );
  }

  function toggleTheme() {
    applyTheme(
      theme === 'dark'
        ? 'light'
        : 'dark',
    );
  }

  return (
    <button
      type="button"
      onClick={
        toggleTheme
      }
      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
      aria-label="Toggle theme"
      title={
        theme === 'dark'
          ? 'Light mode'
          : 'Dark mode'
      }
    >
      {theme === 'dark' ? (
        <Sun
          size={18}
          strokeWidth={1.8}
        />
      ) : (
        <Moon
          size={18}
          strokeWidth={1.8}
        />
      )}
    </button>
  );
}