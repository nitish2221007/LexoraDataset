import React, { useState } from 'react';
import { WordItem } from '../types/dataset';
import { Volume2, ChevronLeft, ChevronRight, RotateCw, CheckCircle2, Bookmark, Lightbulb, Smile } from 'lucide-react';
import { speakWord } from '../lib/datasetLoader';
import confetti from 'canvas-confetti';

interface FlashcardViewProps {
  words: WordItem[];
  currentPageNo: number;
  bookmarkedIds: string[];
  onToggleBookmark: (id: string) => void;
}

export const FlashcardView: React.FC<FlashcardViewProps> = ({
  words,
  currentPageNo,
  bookmarkedIds,
  onToggleBookmark
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownWordIds, setKnownWordIds] = useState<string[]>([]);

  if (!words || words.length === 0) {
    return (
      <div className="flashcard-view max-w-xl mx-auto px-4 py-16 text-center space-y-3">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">No words available for flashcards on Page {currentPageNo}</h3>
      </div>
    );
  }

  const currentWord = words[currentIndex];
  const isBookmarked = bookmarkedIds.includes(currentWord.id);
  const isMastered = knownWordIds.includes(currentWord.id);

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Completed all flashcards on page
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const toggleMastered = () => {
    if (isMastered) {
      setKnownWordIds(prev => prev.filter(id => id !== currentWord.id));
    } else {
      setKnownWordIds(prev => [...prev, currentWord.id]);
    }
  };

  return (
    <div className="flashcard-view max-w-2xl mx-auto px-4 py-8 space-y-6">
      
      {/* Top Flashcard Header */}
      <div className="flashcard-header flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            Flashcards • Page {currentPageNo}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Card {currentIndex + 1} of {words.length} ({knownWordIds.length} Mastered)
          </p>
        </div>

        {/* Progress bar */}
        <div className="flashcard-progress w-32 bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-indigo-600 h-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 3D Flip Card Container */}
      <div 
        onClick={() => setIsFlipped(!isFlipped)}
        className="flashcard-stage relative min-h-[320px] sm:min-h-[360px] w-full cursor-pointer perspective-1000 group"
      >
        <div className={`flashcard-card w-full h-full min-h-[320px] sm:min-h-[360px] rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl transition-all duration-500 transform-gpu flex flex-col justify-between ${
          isFlipped
            ? 'is-flipped bg-indigo-900 text-white border-indigo-700'
            : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white hover:border-indigo-400'
        }`}>

          {/* Front / Back Card Actions */}
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
              isFlipped ? 'bg-indigo-800 text-indigo-200' : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300'
            }`}>
              {isFlipped ? 'Answer & Details' : 'Question (Click to Flip)'}
            </span>

            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => speakWord(currentWord.word)}
                className={`p-2 rounded-xl transition-all ${
                  isFlipped ? 'hover:bg-indigo-800 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
                title="Listen Pronunciation"
              >
                <Volume2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => onToggleBookmark(currentWord.id)}
                className={`p-2 rounded-xl transition-all ${
                  isBookmarked ? 'text-amber-400' : isFlipped ? 'text-indigo-300' : 'text-slate-400'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Card Center Content */}
          <div className="text-center my-auto py-6 space-y-3">
            {!isFlipped ? (
              // Front side: Word
              <div>
                <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
                  {currentWord.word}
                </h3>
                {currentWord.medium?.pronunciation && (
                  <p className="text-sm font-semibold text-indigo-500 dark:text-indigo-400">
                    /{currentWord.medium.pronunciation}/
                  </p>
                )}
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-4 flex items-center justify-center gap-1">
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Tap the card to reveal the meaning</span>
                </p>
              </div>
            ) : (
              // Back side: Meaning & Explanations
              <div className="space-y-4 text-left">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">Meaning</span>
                  <p className="text-lg font-bold leading-snug mt-1">{currentWord.meaning}</p>
                </div>

                {currentWord.medium?.simple_explanation && (
                  <div className="text-xs text-indigo-100 flex items-start gap-2 bg-indigo-950/60 p-3 rounded-xl">
                    <Lightbulb className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                    <span>{currentWord.medium.simple_explanation}</span>
                  </div>
                )}

                {currentWord.medium?.funny_explanation && (
                  <div className="text-xs text-purple-200 flex items-start gap-2 bg-purple-950/60 p-3 rounded-xl border border-purple-800/40">
                    <Smile className="w-4 h-4 text-purple-300 shrink-0 mt-0.5" />
                    <span><strong>Funny: </strong>{currentWord.medium.funny_explanation}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Card Footer: Mastered Checkbox & Flip Prompt */}
          <div className="flex items-center justify-between text-xs pt-4 border-t border-slate-100 dark:border-slate-800/60" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={toggleMastered}
              className={`flex items-center gap-1.5 font-bold transition-all px-3 py-1.5 rounded-xl ${
                isMastered
                  ? 'bg-emerald-500 text-white'
                  : isFlipped ? 'bg-indigo-800 text-indigo-200' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isMastered ? 'Mastered!' : 'Mark Mastered'}</span>
            </button>

            <span className={`font-semibold text-[11px] ${isFlipped ? 'text-indigo-300' : 'text-slate-400'}`}>
              Card {currentIndex + 1} of {words.length}
            </span>
          </div>

        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flashcard-nav flex items-center justify-between gap-4">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-all shadow-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous Card</span>
        </button>

        <button
          onClick={handleNext}
          disabled={currentIndex === words.length - 1}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 disabled:opacity-40 transition-all shadow-lg shadow-indigo-500/25"
        >
          <span>Next Card</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
