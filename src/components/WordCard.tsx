import React, { useState } from 'react';
import { Volume2, Bookmark, Check, Smile, Lightbulb, Copy } from 'lucide-react';
import { WordItem } from '../types/dataset';
import { speakWord } from '../lib/datasetLoader';

interface WordCardProps {
  word: WordItem;
  isOpen?: boolean;
  onToggleOpen?: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (wordId: string) => void;
  pageNo?: number;
  index?: number;
  readingTheme?: 'standard' | 'paper';
}

export const WordCard: React.FC<WordCardProps> = ({
  word,
  isOpen,
  onToggleOpen,
  isBookmarked,
  onToggleBookmark,
  pageNo,
  index,
  readingTheme = 'standard'
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const effectiveIsOpen = typeof isOpen === 'boolean' ? isOpen : internalOpen;

  const handleCardClick = () => {
    if (onToggleOpen) {
      onToggleOpen();
    } else {
      setInternalOpen(!internalOpen);
    }
  };

  const difficulty = word.difficulty || 'Easy';
  const medium = word.medium;

  const getPartOfSpeech = () => {
    if (difficulty.toLowerCase() === 'easy') return 'noun';
    if (difficulty.toLowerCase() === 'medium') return 'adjective';
    if (difficulty.toLowerCase() === 'hard') return 'noun / advanced';
    return difficulty.toLowerCase();
  };

  const handleAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlayingAudio(true);
    speakWord(word.word);
    window.setTimeout(() => setIsPlayingAudio(false), 1200);
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(`${word.word}: ${word.meaning}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore
    }
  };

  const handleBookmarkToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleBookmark(word.id);
  };

  const isPaper = readingTheme === 'paper';

  return (
    <div
      onClick={handleCardClick}
      className={`word-item-connected cursor-pointer transition-all duration-300 ${
        isPaper
          ? effectiveIsOpen
            ? 'bg-[#FFF9C4]/90 dark:bg-[#2A241E] text-[#1E293B] dark:text-amber-100 rounded-2xl p-4 sm:p-5 my-3 shadow-lg border-2 border-[#FBC02D] dark:border-amber-600/80 ring-2 ring-amber-400/30'
            : 'py-3.5 px-3 border-b border-blue-200/50 dark:border-amber-900/30 hover:bg-amber-100/40 dark:hover:bg-amber-950/40'
          : effectiveIsOpen
          ? 'bg-[#1F3A30] text-white rounded-3xl p-5 sm:p-6 my-3 shadow-2xl border border-[#2B4E41] ring-1 ring-emerald-500/20'
          : 'py-4 px-3 sm:px-4 border-b border-slate-200 dark:border-slate-800/80 hover:bg-slate-100/60 dark:hover:bg-slate-850/50'
      }`}
    >
      {/* Top Header Row */}
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-2 flex-wrap min-w-0">
          <h3 className={`tracking-tight transition-colors ${
            isPaper
              ? 'font-handwriting text-3xl font-bold text-[#1E3A8A] dark:text-amber-300'
              : effectiveIsOpen
              ? 'font-serif text-xl sm:text-2xl font-extrabold text-white'
              : 'font-serif text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#A31257] via-[#C2185B] to-[#E0729B] dark:from-pink-400 dark:via-rose-300 dark:to-purple-300 bg-clip-text text-transparent'
          }`}>
            {word.word}
          </h3>

          <span className={`text-xs italic ${
            isPaper
              ? 'font-handwriting text-base text-[#475569] dark:text-amber-200/70'
              : effectiveIsOpen
              ? 'font-sans text-[#A7C4B8]'
              : 'font-sans text-slate-400'
          }`}>
            {getPartOfSpeech()}
          </span>

          {medium?.pronunciation && (
            <span className={`text-xs font-medium ${
              isPaper
                ? 'font-handwriting text-base text-[#2563EB] dark:text-amber-400'
                : effectiveIsOpen
                ? 'font-sans text-[#C2E0D4]'
                : 'font-sans text-[#C2185B] dark:text-pink-400'
            }`}>
              /{medium.pronunciation}/
            </span>
          )}
        </div>

        {/* Inline Action Controls */}
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={handleAudio}
            className={`p-1.5 rounded-xl transition-all ${
              isPaper
                ? 'text-[#1E3A8A] dark:text-amber-300 hover:bg-amber-200/60 dark:hover:bg-amber-900/60'
                : effectiveIsOpen
                ? 'text-[#A7C4B8] hover:bg-white/10 hover:text-white'
                : 'text-slate-400 hover:text-[#C2185B]'
            } ${isPlayingAudio ? 'animate-pulse text-amber-500' : ''}`}
            title="Listen Audio"
          >
            <Volume2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className={`p-1.5 rounded-xl transition-all ${
              isPaper
                ? 'text-[#1E3A8A] dark:text-amber-300 hover:bg-amber-200/60 dark:hover:bg-amber-900/60'
                : effectiveIsOpen
                ? 'text-[#A7C4B8] hover:bg-white/10 hover:text-white'
                : 'text-slate-400 hover:text-slate-700'
            }`}
            title="Copy word"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600 font-bold" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handleBookmarkToggle}
            className={`p-1.5 rounded-xl transition-all ${
              isBookmarked
                ? 'text-amber-500'
                : isPaper
                ? 'text-[#1E3A8A] dark:text-amber-300 hover:bg-amber-200/60 dark:hover:bg-amber-900/60'
                : effectiveIsOpen
                ? 'text-[#A7C4B8] hover:text-amber-300 hover:bg-white/10'
                : 'text-slate-400 hover:text-amber-500'
            }`}
            title={isBookmarked ? 'Saved' : 'Save word'}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Primary Meaning */}
      <p className={`mt-1.5 leading-relaxed ${
        isPaper
          ? 'font-handwriting text-xl sm:text-2xl text-[#0F172A] dark:text-amber-100 font-semibold'
          : effectiveIsOpen
          ? 'font-sans text-[#F0F7F4] font-medium text-base sm:text-lg'
          : 'font-sans text-slate-800 dark:text-slate-200 text-sm sm:text-base'
      }`}>
        {word.meaning}
      </p>

      {/* Expandable Extra Info Detail Section (Accordion) */}
      {effectiveIsOpen && (
        <div className={`mt-3 pt-3 border-t border-dashed space-y-2.5 animate-slide-down ${
          isPaper
            ? 'border-amber-300 dark:border-amber-700/60 text-[#1E293B] dark:text-amber-100 font-handwriting text-lg sm:text-xl'
            : 'border-[#2D5244] text-[#F0F7F4] font-sans text-xs sm:text-sm'
        }`}>
          
          {medium?.examples && medium.examples.length > 0 && (
            <p className={isPaper ? 'text-[#1E3A8A] dark:text-amber-200' : 'text-[#D3E5DD]'}>
              <span className="font-bold underline">Example: </span>
              “{medium.examples[0].text}”
            </p>
          )}

          {medium?.synonyms && medium.synonyms.length > 0 && (
            <p className={isPaper ? 'text-[#1E3A8A] dark:text-amber-200' : 'text-[#D3E5DD]'}>
              <span className="font-bold underline">Similar words: </span>
              {medium.synonyms.join(', ')}
            </p>
          )}

          {medium?.simple_explanation && (
            <div className={`flex items-start gap-2.5 p-3 rounded-2xl border ${
              isPaper
                ? 'bg-amber-200/60 dark:bg-amber-900/40 border-amber-300 dark:border-amber-700 text-[#1E293B] dark:text-amber-100 font-sans text-xs sm:text-sm'
                : 'bg-[#162A23] border-[#26473B] text-[#E2F0EA] font-sans text-xs sm:text-sm'
            }`}>
              <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Simple: </span>
                <span>{medium.simple_explanation}</span>
              </div>
            </div>
          )}

          {medium?.funny_explanation && (
            <div className={`flex items-start gap-2.5 p-3 rounded-2xl border ${
              isPaper
                ? 'bg-purple-100/70 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800 text-purple-950 dark:text-purple-200 font-sans text-xs sm:text-sm'
                : 'bg-[#25294A] border-[#3A4072] text-[#EAE8F8] font-sans text-xs sm:text-sm'
            }`}>
              <Smile className="w-4 h-4 text-purple-600 dark:text-purple-300 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Funny Trick: </span>
                <span>{medium.funny_explanation}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
