import React from 'react';
import { WordItem } from '../types/dataset';
import { WordCard } from './WordCard';
import { Sparkles, ArrowLeftRight, BookOpen, AlertCircle } from 'lucide-react';

interface PageViewProps {
  currentPageNo: number;
  words: WordItem[];
  bookmarkedIds: string[];
  onToggleBookmark: (wordId: string) => void;
  difficultyFilter: string;
  isLoading: boolean;
  chapterTitle?: string;
}

export const PageView: React.FC<PageViewProps> = ({
  currentPageNo,
  words,
  bookmarkedIds,
  onToggleBookmark,
  difficultyFilter,
  isLoading,
  chapterTitle
}) => {
  // Filter words by difficulty if set
  const filteredWords = words.filter(w => {
    if (difficultyFilter === 'All') return true;
    return (w.difficulty || 'Medium').toLowerCase() === difficultyFilter.toLowerCase();
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto animate-spin">
          <Sparkles className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
          Loading Page {currentPageNo} vocabulary data...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header Banner for Page */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-900 dark:to-indigo-950/40 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/40">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{chapterTitle || 'Textbook Vocabulary'}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <span>Page {currentPageNo} Vocabulary</span>
            <span className="text-sm font-semibold px-3 py-1 rounded-full bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 border border-slate-200 dark:border-slate-700 shadow-sm">
              {filteredWords.length} {filteredWords.length === 1 ? 'Word' : 'Words'}
            </span>
          </h1>
        </div>

        {/* Shortcut Hint */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-700">
          <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-500" />
          <span>Press <strong>Left / Right Arrow keys</strong> to flip pages</span>
        </div>
      </div>

      {/* Grid of Word Cards */}
      {filteredWords.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWords.map((word) => (
            <WordCard
              key={word.id}
              word={word}
              pageNo={currentPageNo}
              isBookmarked={bookmarkedIds.includes(word.id)}
              onToggleBookmark={onToggleBookmark}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl text-center border border-slate-200 dark:border-slate-800 space-y-3">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            No words matching "{difficultyFilter}" difficulty on Page {currentPageNo}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Try switching the difficulty filter to "All" to view all vocabulary words on this page.
          </p>
        </div>
      )}

    </div>
  );
};
