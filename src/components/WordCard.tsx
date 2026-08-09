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
      className={`word-item-connected cursor-pointer transition-all duration-300 ${
        effectiveIsOpen
          ? 'bg-[#1F3A30] text-white rounded-3xl p-5 sm:p-6 my-3 shadow-2xl border border-[#2B4E41] ring-1 ring-emerald-500/20'
          : 'py-4 px-3 sm:px-4 border-b border-slate-200 dark:border-slate-800/80 hover:bg-slate-100/60 dark:hover:bg-slate-850/50'
      }`}
    >
      {/* Top Header Row */}
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-2 flex-wrap min-w-0">
          <h3 className={`text-xl sm:text-2xl font-serif font-bold tracking-tight transition-colors ${
            effectiveIsOpen
              ? 'text-white font-extrabold'
              : 'bg-gradient-to-r from-[#A31257] via-[#C2185B] to-[#E0729B] dark:from-pink-400 dark:via-rose-300 dark:to-purple-300 bg-clip-text text-transparent'
          }`}>
            {word.word}
          </h3>

          <span className={`text-xs font-sans italic ${effectiveIsOpen ? 'text-[#A7C4B8]' : 'text-slate-400 dark:text-slate-400'}`}>
            {getPartOfSpeech()}
          </span>

          {medium?.pronunciation && (
            <span className={`text-xs font-sans font-medium ${effectiveIsOpen ? 'text-[#C2E0D4]' : 'text-[#C2185B] dark:text-pink-400'}`}>
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
              effectiveIsOpen ? 'text-[#A7C4B8] hover:bg-white/10 hover:text-white' : 'text-slate-400 hover:text-[#C2185B]'
            } ${isPlayingAudio ? 'animate-pulse text-amber-300' : ''}`}
            title="Listen Audio"
          >
            <Volume2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className={`p-1.5 rounded-xl transition-all ${
              effectiveIsOpen ? 'text-[#A7C4B8] hover:bg-white/10 hover:text-white' : 'text-slate-400 hover:text-slate-700'
            }`}
            title="Copy word"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400 font-bold" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handleBookmarkToggle}
            className={`p-1.5 rounded-xl transition-all ${
              isBookmarked
                ? 'text-amber-400'
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
      <p className={`mt-2 text-sm sm:text-base font-sans leading-relaxed ${
        effectiveIsOpen ? 'text-[#F0F7F4] font-medium text-base sm:text-lg' : 'text-slate-800 dark:text-slate-200'
      }`}>
        {word.meaning}
      </p>

      {/* Expandable Extra Info Detail Section (Accordion) */}
      {effectiveIsOpen && (
        <div className="mt-4 pt-3.5 border-t border-dashed border-[#2D5244] space-y-3 font-sans text-xs sm:text-sm text-[#F0F7F4] animate-slide-down">
          
          {medium?.examples && medium.examples.length > 0 && (
            <p className="text-[#D3E5DD]">
              <span className="font-bold text-white">Example: </span>
              “{medium.examples[0].text}”
            </p>
          )}

          {medium?.synonyms && medium.synonyms.length > 0 && (
            <p className="text-[#D3E5DD]">
              <span className="font-bold text-white">Similar words: </span>
              {medium.synonyms.join(', ')}
            </p>
          )}

          {medium?.simple_explanation && (
            <div className="flex items-start gap-2.5 bg-[#162A23] p-3 rounded-2xl border border-[#26473B] text-[#E2F0EA]">
              <Lightbulb className="w-4 h-4 text-[#82D6B3] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">Simple: </span>
                <span>{medium.simple_explanation}</span>
              </div>
            </div>
          )}

          {medium?.funny_explanation && (
            <div className="flex items-start gap-2.5 bg-[#25294A] p-3 rounded-2xl border border-[#3A4072] text-[#EAE8F8]">
              <Smile className="w-4 h-4 text-[#B6B0F2] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">Funny Trick: </span>
                <span>{medium.funny_explanation}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
