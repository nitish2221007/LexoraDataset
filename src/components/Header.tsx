import React from 'react';
import {
  BookOpen,
  Zap,
  Layers,
  HelpCircle,
  Bookmark,
  Search,
  Sun,
  Moon,
  Flame,
  X
} from 'lucide-react';
import { ViewMode } from '../types/dataset';

interface HeaderProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  bookmarkCount: number;
  totalWords: number;
  xp: number;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  setViewMode,
  searchQuery,
  setSearchQuery,
  darkMode,
  setDarkMode,
  bookmarkCount,
  totalWords,
  xp
}) => {
  const closeMobileSearch = () => {
    setSearchQuery('');
    setViewMode('page');
  };

  return (
    <header className="lexora-header sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Mobile header */}
      <div className="mobile-header md:hidden">
        <button
          type="button"
          onClick={() => setViewMode('page')}
          className="mobile-brand"
          aria-label="Open NCERT Unofficial Vocab reader"
        >
          <span className="mobile-brand-mark" aria-hidden="true">
            <BookOpen />
          </span>
          <span className="mobile-brand-copy">
            <span className="mobile-brand-name">NCERT Unofficial Vocab</span>
            <span className="mobile-brand-note">NCERT words, made simple</span>
          </span>
        </button>

        <div className="mobile-header-actions">
          <span className="mobile-xp" aria-label={`${xp} experience points`}>
            <Flame aria-hidden="true" />
            <strong>{xp}</strong>
            <span>XP</span>
          </span>

          <button
            type="button"
            onClick={() => setViewMode('search')}
            className={`mobile-icon-button ${viewMode === 'search' ? 'is-active' : ''}`}
            aria-label="Search all words"
          >
            <Search aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className="mobile-icon-button"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
          </button>
        </div>
      </div>

      {viewMode === 'search' && (
        <div className="mobile-search-row md:hidden">
          <Search aria-hidden="true" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search a word or meaning"
            aria-label="Search a word or meaning"
            autoFocus
          />
          <button type="button" onClick={closeMobileSearch} aria-label="Close search">
            <X aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Existing desktop header */}
      <div className="hidden md:flex max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setViewMode('page')}
          className="flex items-center gap-2.5 cursor-pointer shrink-0 text-left"
        >
          <span className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black shadow-md shadow-amber-500/20">
            <BookOpen className="w-5 h-5" />
          </span>
          <span>
            <span className="block font-black text-lg tracking-tight text-slate-900 dark:text-white">
              NCERT Unofficial Vocab
            </span>
            <span className="block text-[10px] text-slate-500 font-medium">
              {totalWords.toLocaleString()} Words • Page Wise
            </span>
          </span>
        </button>

        <div className="flex-1 max-w-md relative hidden md:block">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                if (event.target.value.trim() && viewMode !== 'search') {
                  setViewMode('search');
                }
              }}
              placeholder="Search NCERT words, meanings..."
              className="w-full pl-10 pr-4 py-1.5 text-xs font-medium rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <nav className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
            <button
              type="button"
              onClick={() => setViewMode('page')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'page'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reader</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('reel')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'reel'
                  ? 'bg-amber-500 text-white shadow-sm font-extrabold'
                  : 'text-amber-600 dark:text-amber-400 hover:text-amber-700'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">1-Min Reel</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('flashcard')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'flashcard'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('quiz')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'quiz'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Quiz</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('bookmarks')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all relative ${
                viewMode === 'bookmarks'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Saved</span>
              {bookmarkCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-extrabold">
                  {bookmarkCount}
                </span>
              )}
            </button>
          </nav>

          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
