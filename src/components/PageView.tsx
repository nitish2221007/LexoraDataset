import React from 'react';
import { WordItem } from '../types/dataset';
import { WordCard } from './WordCard';
import { BookOpen, Sparkles, AlertCircle } from 'lucide-react';

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
  const filteredWords = words.filter(w => {
    if (difficultyFilter === 'All') return true;
    return (w.difficulty || 'Medium').toLowerCase() === difficultyFilter.toLowerCase();
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto animate-spin">
          <Sparkles className="w-6 h-6" />
        </div>
        <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
          Loading Page {currentPageNo} Vocabulary...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      
      {/* Hand-Crafted Reading Banner */}
      <div className="bg-slate-100 dark:bg-slate-900/90 p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span className="truncate max-w-[240px] sm:max-w-none">{chapterTitle || 'Textbook Vocabulary'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Page {currentPageNo} Meanings
          </h1>
        </div>

        <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-indigo-600 text-white shadow-sm shrink-0">
          {filteredWords.length} Words
        </span>
      </div>

      {/* Hand-Crafted Single Column Cards List (Ultra Readable on Phone) */}
      {filteredWords.length > 0 ? (
        <div className="space-y-4">
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
        <div className="bg-white dark:bg-slate-900 p-10 rounded-3xl text-center border border-slate-200 dark:border-slate-800 space-y-2">
          <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No words found for Page {currentPageNo}</h3>
        </div>
      )}

    </div>
  );
};
