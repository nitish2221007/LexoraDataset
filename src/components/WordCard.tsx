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
}

export const WordCard: React.FC<WordCardProps> = ({
  word,
  isOpen,
  onToggleOpen,
  isBookmarked,
  onToggleBookmark,
  pageNo,
  index
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

  return (
    <div
      onClick={handleCardClick}
      className={`word-item-connected cursor-pointer py-4 px-2 sm:px-3 border-b border-slate-200 dark:border-slate-800/80 transition-colors ${
        effectiveIsOpen ? 'bg-pink-50/40 dark:bg-slate-850' : 'hover:bg-slate-100/50 dark:hover:bg-slate-850/50'
      }`}
    >
      {/* Top Header Row */}
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-2 flex-wrap min-w-0">
          <h3 className="text-xl sm:text-2xl font-serif font-bold tracking-tight bg-gradient-to-r from-[#A31257] via-[#C2185B] to-[#E0729B] dark:from-pink-400 dark:via-rose-300 dark:to-purple-300 bg-clip-text text-transparent">
            {word.word}
          </h3>

          <span className="text-xs font-sans italic text-slate-400 dark:text-slate-400">
            {getPartOfSpeech()}
          </span>

          {medium?.pronunciation && (
            <span className="text-xs font-sans text-[#C2185B] dark:text-pink-400 font-medium">
              /{medium.pronunciation}/
            </span>
          )}
        </div>

        {/* Inline Action Controls */}
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={handleAudio}
            className={`p-1.5 rounded-lg text-slate-400 hover:text-[#C2185B] transition-all ${
              isPlayingAudio ? 'animate-pulse text-[#C2185B]' : ''
            }`}
            title="Listen Audio"
          >
            <Volume2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all"
            title="Copy word"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handleBookmarkToggle}
            className={`p-1.5 rounded-lg transition-all ${
              isBookmarked ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500'
            }`}
            title={isBookmarked ? 'Saved' : 'Save word'}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Primary Meaning */}
      <p className="mt-1 text-sm sm:text-base font-sans text-slate-800 dark:text-slate-200 leading-relaxed">
        {word.meaning}
      </p>

      {/* Expandable Extra Info Detail Section (Accordion) */}
      {effectiveIsOpen && (
        <div className="mt-3 pt-3 border-t border-dashed border-slate-300 dark:border-slate-700 space-y-2.5 font-sans text-xs sm:text-sm text-slate-700 dark:text-slate-300 animate-slide-down">
          
          {medium?.examples && medium.examples.length > 0 && (
            <p className="text-slate-600 dark:text-slate-300">
              <span className="font-bold text-[#555] dark:text-slate-400">Example: </span>
              “{medium.examples[0].text}”
            </p>
          )}

          {medium?.synonyms && medium.synonyms.length > 0 && (
            <p className="text-slate-600 dark:text-slate-300">
              <span className="font-bold text-[#555] dark:text-slate-400">Similar words: </span>
              {medium.synonyms.join(', ')}
            </p>
          )}

          {medium?.simple_explanation && (
            <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200/80 dark:border-amber-900/60 text-amber-900 dark:text-amber-200">
              <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Simple: </span>
                <span>{medium.simple_explanation}</span>
              </div>
            </div>
          )}

          {medium?.funny_explanation && (
            <div className="flex items-start gap-2 bg-purple-50 dark:bg-purple-950/40 p-2.5 rounded-xl border border-purple-200/80 dark:border-purple-900/60 text-purple-900 dark:text-purple-200">
              <Smile className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
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
