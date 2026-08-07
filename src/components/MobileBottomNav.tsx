import React from 'react';
import { BookOpen, Layers, HelpCircle, Bookmark, Search } from 'lucide-react';
import { ViewMode } from '../types/dataset';

interface MobileBottomNavProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  bookmarkCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  viewMode,
  setViewMode,
  bookmarkCount
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-3 py-2 shadow-2xl transition-colors">
      <div className="grid grid-cols-5 gap-1 max-w-md mx-auto text-center">
        
        {/* Page Reader */}
        <button
          onClick={() => setViewMode('page')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
            viewMode === 'page'
              ? 'text-indigo-600 dark:text-indigo-400 font-black'
              : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-800'
          }`}
        >
          <BookOpen className={`w-5 h-5 mb-0.5 ${viewMode === 'page' ? 'scale-110' : ''}`} />
          <span className="text-[10px] tracking-tight">Reader</span>
        </button>

        {/* Flashcards */}
        <button
          onClick={() => setViewMode('flashcard')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
            viewMode === 'flashcard'
              ? 'text-indigo-600 dark:text-indigo-400 font-black'
              : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-800'
          }`}
        >
          <Layers className={`w-5 h-5 mb-0.5 ${viewMode === 'flashcard' ? 'scale-110' : ''}`} />
          <span className="text-[10px] tracking-tight">Cards</span>
        </button>

        {/* Quiz */}
        <button
          onClick={() => setViewMode('quiz')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
            viewMode === 'quiz'
              ? 'text-indigo-600 dark:text-indigo-400 font-black'
              : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-800'
          }`}
        >
          <HelpCircle className={`w-5 h-5 mb-0.5 ${viewMode === 'quiz' ? 'scale-110' : ''}`} />
          <span className="text-[10px] tracking-tight">Quiz</span>
        </button>

        {/* Bookmarks / Saved */}
        <button
          onClick={() => setViewMode('bookmarks')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all relative ${
            viewMode === 'bookmarks'
              ? 'text-indigo-600 dark:text-indigo-400 font-black'
              : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <Bookmark className={`w-5 h-5 mb-0.5 ${viewMode === 'bookmarks' ? 'scale-110' : ''}`} />
            {bookmarkCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full text-[9px] bg-indigo-600 text-white font-extrabold">
                {bookmarkCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Saved</span>
        </button>

        {/* Search */}
        <button
          onClick={() => setViewMode('search')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
            viewMode === 'search'
              ? 'text-indigo-600 dark:text-indigo-400 font-black'
              : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-800'
          }`}
        >
          <Search className={`w-5 h-5 mb-0.5 ${viewMode === 'search' ? 'scale-110' : ''}`} />
          <span className="text-[10px] tracking-tight">Search</span>
        </button>

      </div>
    </nav>
  );
};
