import React, { useEffect, useMemo, useRef, useState } from 'react';
import { WordItem } from '../types/dataset';
import { WordCard } from './WordCard';
import { TextbookTableView } from './TextbookTableView';
import { BookOpen, Headphones, Pause, ChevronLeft, ChevronRight, PenTool, Sparkles, Table } from 'lucide-react';
import { speakWord } from '../lib/datasetLoader';

interface PageViewProps {
  currentPageNo: number;
  words: WordItem[];
  bookmarkedIds: string[];
  onToggleBookmark: (wordId: string) => void;
  difficultyFilter: string;
  isLoading: boolean;
  chapterTitle?: string;
  xp: number;
  streak: number;
  availablePages?: number[];
  onPageChange?: (p: number) => void;
  onOpenDeckModal?: () => void;
  selectedClass?: string;
  selectedSubject?: string;
}

export const PageView: React.FC<PageViewProps> = ({
  currentPageNo,
  words,
  bookmarkedIds,
  onToggleBookmark,
  difficultyFilter,
  isLoading,
  chapterTitle,
  xp,
  streak,
  availablePages = [],
  onPageChange,
  onOpenDeckModal,
  selectedClass = 'class_10',
  selectedSubject = 'history'
}) => {
  const [isPlayingAudiobook, setIsPlayingAudiobook] = useState(false);
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0);
  const [openWordId, setOpenWordId] = useState<string | null>(null);
  
  // Reading Layout Mode: 'table' (NCERT Textbook Table) | 'standard' | 'paper'
  const [readingTheme, setReadingTheme] = useState<'table' | 'standard' | 'paper'>(() => {
    return (localStorage.getItem('lexora_reading_theme') as 'table' | 'standard' | 'paper') || 'table';
  });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggleReadingTheme = (theme: 'table' | 'standard' | 'paper') => {
    setReadingTheme(theme);
    localStorage.setItem('lexora_reading_theme', theme);
  };

  const filteredWords = useMemo(
    () => words.filter((word) => {
      if (difficultyFilter === 'All') return true;
      return (word.difficulty || 'Easy').toLowerCase() === difficultyFilter.toLowerCase();
    }),
    [words, difficultyFilter]
  );

  useEffect(() => {
    if (isPlayingAudiobook && filteredWords.length > 0) {
      if (currentAudioIndex < filteredWords.length) {
        const item = filteredWords[currentAudioIndex];
        speakWord(`${item.word}. ${item.meaning}`);
        timerRef.current = setTimeout(() => setCurrentAudioIndex((previous) => previous + 1), 4000);
      } else {
        setIsPlayingAudiobook(false);
        setCurrentAudioIndex(0);
      }
    } else if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlayingAudiobook, currentAudioIndex, filteredWords]);

  const toggleAudiobook = () => {
    if (isPlayingAudiobook) {
      setIsPlayingAudiobook(false);
      window.speechSynthesis?.cancel();
    } else {
      setCurrentAudioIndex(0);
      setIsPlayingAudiobook(true);
    }
  };

  const currentPageIndex = availablePages.indexOf(currentPageNo);
  const hasPrev = currentPageIndex > 0;
  const hasNext = currentPageIndex >= 0 && currentPageIndex < availablePages.length - 1;

  const classNum = selectedClass.replace('class_', '');
  const subjectLabel = selectedSubject.replace('_', ' ').toUpperCase();
  const isPaper = readingTheme === 'paper';

  if (isLoading) {
    return (
      <div className="reader-loading max-w-xl mx-auto px-4 py-16 text-center" aria-live="polite">
        <span className="w-12 h-12 rounded-2xl bg-[#C2185B]/10 text-[#C2185B] dark:text-pink-400 flex items-center justify-center mx-auto animate-spin mb-3">
          <BookOpen aria-hidden="true" />
        </span>
        <p className="font-serif text-lg font-bold text-[#7A0F35] dark:text-white">Opening page {currentPageNo}…</p>
      </div>
    );
  }

  return (
    <div className="vocab-deck-screen max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800 font-sans">
        <button
          onClick={onOpenDeckModal}
          className="back-btn text-[#C2185B] dark:text-pink-400 font-bold text-xs sm:text-sm bg-transparent border-0 cursor-pointer hover:underline"
        >
          &larr; Change chapter
        </button>

        {/* Theme & Layout Switcher Toggle */}
        <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-slate-800 p-1 rounded-xl border border-slate-300 dark:border-slate-700">
          <button
            onClick={() => toggleReadingTheme('table')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              readingTheme === 'table'
                ? 'bg-[#C2185B] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
            title="NCERT Textbook Table Layout"
          >
            <Table className="w-3 h-3" />
            <span>Table View</span>
          </button>

          <button
            onClick={() => toggleReadingTheme('standard')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              readingTheme === 'standard'
                ? 'bg-white dark:bg-slate-700 text-[#C2185B] dark:text-pink-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
            title="Standard Cards"
          >
            <Sparkles className="w-3 h-3" />
            <span className="hidden sm:inline">Cards</span>
          </button>

          <button
            onClick={() => toggleReadingTheme('paper')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              readingTheme === 'paper'
                ? 'bg-[#FFF9C4] dark:bg-amber-950 text-[#1E3A8A] dark:text-amber-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
            title="Handwriting Paper Theme"
          >
            <PenTool className="w-3 h-3 text-amber-600" />
            <span className="hidden sm:inline">Paper</span>
          </button>
        </div>
      </div>

      {/* Main Heading Section */}
      <div className="text-center space-y-1 py-1">
        <h1 className={`list-title ${
          isPaper
            ? 'font-handwriting text-3xl sm:text-4xl font-bold text-[#1E3A8A] dark:text-amber-300'
            : 'font-serif text-2xl sm:text-3xl font-bold text-[#7A0F35] dark:text-white'
        }`}>
          {filteredWords.length} Vocabulary Words
        </h1>
        <p className={`sub text-xs sm:text-sm ${
          isPaper
            ? 'font-handwriting text-lg sm:text-xl text-[#475569] dark:text-amber-200/80'
            : 'font-sans text-slate-500 dark:text-slate-400'
        }`}>
          {subjectLabel} — {chapterTitle || 'Chapter Words'}
        </p>

        <div className="pt-2 flex justify-center">
          <button
            type="button"
            onClick={toggleAudiobook}
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-sans font-bold transition-all ${
              isPlayingAudiobook
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-[#C2185B] hover:bg-[#A31257] text-white shadow-sm'
            }`}
          >
            {isPlayingAudiobook ? <Pause className="w-3.5 h-3.5" /> : <Headphones className="w-3.5 h-3.5" />}
            <span>{isPlayingAudiobook ? `Playing Word ${currentAudioIndex + 1}...` : 'Listen Audio'}</span>
          </button>
        </div>
      </div>

      {/* Main Content View (Table / Cards) */}
      {filteredWords.length > 0 ? (
        readingTheme === 'table' ? (
          <TextbookTableView
            words={filteredWords}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={onToggleBookmark}
            pageNo={currentPageNo}
          />
        ) : (
          <div className={`list max-w-xl mx-auto rounded-2xl p-4 sm:p-6 transition-all duration-300 ${
            isPaper
              ? 'paper-notebook-container shadow-md border-t border-b border-amber-200 dark:border-amber-900'
              : 'border-t border-slate-200 dark:border-slate-800'
          }`}>
            {filteredWords.map((word, index) => {
              const isThisOpen = openWordId === word.id;

              return (
                <WordCard
                  key={word.id}
                  word={word}
                  index={index}
                  pageNo={currentPageNo}
                  isOpen={isThisOpen}
                  onToggleOpen={() => setOpenWordId(isThisOpen ? null : word.id)}
                  isBookmarked={bookmarkedIds.includes(word.id)}
                  onToggleBookmark={onToggleBookmark}
                  readingTheme={readingTheme === 'paper' ? 'paper' : 'standard'}
                />
              );
            })}
          </div>
        )
      ) : (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-xl text-center border border-slate-200 dark:border-slate-800 space-y-2">
          <p className="text-sm font-sans text-slate-600 dark:text-slate-400">
            No {difficultyFilter.toLowerCase()} words found on page {currentPageNo}.
          </p>
        </div>
      )}

      {/* Pagination & Jump Row */}
      {availablePages.length > 0 && onPageChange && (
        <div className="pagination-container pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4 font-sans">
          
          <div className="page-indicator text-center text-xs text-[#8A4A63] dark:text-slate-400 font-medium">
            Page {currentPageNo} of {availablePages[availablePages.length - 1]} (Page {currentPageIndex + 1} of {availablePages.length})
          </div>

          <div className="jump-row flex items-center justify-center gap-2 text-xs">
            <span className="text-[#8A4A63] dark:text-slate-400 font-semibold">Jump to page:</span>
            <select
              value={currentPageNo}
              onChange={(e) => onPageChange(Number(e.target.value))}
              className="px-3 py-1.5 rounded-md border border-[#F3C6D6] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#7A0F35] dark:text-pink-300 font-bold focus:outline-none cursor-pointer"
            >
              {availablePages.map((page) => (
                <option key={page} value={page}>Page {page}</option>
              ))}
            </select>
          </div>

          <div className="pagination flex items-center justify-between gap-4 pt-2">
            <button
              onClick={() => hasPrev && onPageChange(availablePages[currentPageIndex - 1])}
              disabled={!hasPrev}
              className="page-btn flex-1 py-2.5 px-4 rounded-lg border-2 border-[#C2185B] dark:border-pink-500 text-[#C2185B] dark:text-pink-400 font-bold text-sm hover:bg-[#FFEAF2] dark:hover:bg-slate-800 disabled:opacity-35 disabled:cursor-default transition-all text-center flex items-center justify-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={() => hasNext && onPageChange(availablePages[currentPageIndex + 1])}
              disabled={!hasNext}
              className="page-btn next-btn flex-1 py-2.5 px-4 rounded-lg bg-[#C2185B] hover:bg-[#A31257] dark:bg-pink-600 dark:hover:bg-pink-700 text-white font-bold text-sm disabled:opacity-35 disabled:cursor-default transition-all text-center shadow-md shadow-pink-500/20 flex items-center justify-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
