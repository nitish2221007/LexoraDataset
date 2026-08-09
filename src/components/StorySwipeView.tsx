import React, { useState } from 'react';
import { WordItem } from '../types/dataset';
import { Volume2, Zap, RefreshCw, Bookmark, Laugh, Check, ArrowRight } from 'lucide-react';
import { speakWord } from '../lib/datasetLoader';
import '../styles/storySwipeView.css';

interface StorySwipeViewProps {
  words: WordItem[];
  currentPageNo: number;
  onAddXp: (xp: number) => void;
  bookmarkedIds: string[];
  onToggleBookmark: (id: string) => void;
}

export const StorySwipeView: React.FC<StorySwipeViewProps> = ({
  words,
  currentPageNo,
  onAddXp,
  bookmarkedIds,
  onToggleBookmark
}) => {
  const [index, setIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);

  if (!words || words.length === 0) {
    return (
      <div className="story-empty max-w-md mx-auto py-16 text-center text-slate-500">
        No words are available for Quick Learn on this page.
      </div>
    );
  }

  const safeIndex = Math.min(index, words.length - 1);
  const current = words[safeIndex];
  const isBookmarked = bookmarkedIds.includes(current.id);

  const handleNext = (learned: boolean) => {
    if (learned) {
      onAddXp(10);
      setEarnedXp((previous) => previous + 10);
    }

    speakWord(current.word);

    if (safeIndex < words.length - 1) {
      setIndex((previous) => previous + 1);
    } else {
      setCompleted(true);
    }
  };

  const handleReset = () => {
    setIndex(0);
    setCompleted(false);
    setEarnedXp(0);
  };

  if (completed) {
    return (
      <section className="story-complete max-w-md mx-auto px-4 py-12 text-center space-y-4">
        <span className="story-complete-mark"><Check aria-hidden="true" /></span>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Page {currentPageNo} complete</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">You earned +{earnedXp} XP.</p>
        <button type="button" onClick={handleReset} className="story-replay">
          <RefreshCw aria-hidden="true" />
          Replay page
        </button>
      </section>
    );
  }

  const medium = current.medium;

  return (
    <section className="story-page">
      <div className="story-topbar flex items-center justify-between text-xs font-bold text-slate-500">
        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
          <Zap className="w-4 h-4 fill-amber-500" aria-hidden="true" />
          <span>Quick learn • Word {safeIndex + 1} of {words.length}</span>
        </span>
        <span>Page {currentPageNo}</span>
      </div>

      <div className="progress-bar" aria-hidden="true">
        <div className="progress-filled" style={{ width: `${((safeIndex + 1) / words.length) * 100}%` }} />
      </div>

      <article className="story-card-main bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5 min-h-[380px] flex flex-col justify-between">
        <div>
          <div className="story-word-row flex items-start justify-between gap-2 mb-3">
            <div className="min-w-0">
              <span className="story-difficulty text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase tracking-wider">
                {current.difficulty || 'Easy'}
              </span>
              <h1 className="story-word text-3xl font-black text-slate-900 dark:text-white mt-1">
                {current.word}
              </h1>
              {medium?.pronunciation && (
                <p className="story-pronunciation text-xs font-semibold text-amber-600 dark:text-amber-400">
                  /{medium.pronunciation}/
                </p>
              )}
            </div>

            <div className="story-actions flex items-center gap-1">
              <button
                type="button"
                onClick={() => speakWord(current.word)}
                className="story-action-button"
                aria-label={`Listen to ${current.word}`}
              >
                <Volume2 aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => onToggleBookmark(current.id)}
                className={`story-action-button ${isBookmarked ? 'is-saved' : ''}`}
                aria-label={isBookmarked ? `Remove ${current.word} from saved words` : `Save ${current.word}`}
                aria-pressed={isBookmarked}
              >
                <Bookmark className={isBookmarked ? 'fill-current' : ''} aria-hidden="true" />
              </button>
            </div>
          </div>

          <p className="story-meaning">{current.meaning}</p>

          {medium?.funny_explanation && (
            <div className="story-funny-note">
              <Laugh aria-hidden="true" />
              <div>
                <strong>Memory note</strong>
                <span>{medium.funny_explanation}</span>
              </div>
            </div>
          )}

          {medium?.simple_explanation && (
            <p className="story-simple-note">
              <strong>In simple words:</strong> {medium.simple_explanation}
            </p>
          )}
        </div>

        <div className="story-choice-row">
          <button type="button" onClick={() => handleNext(false)} className="btn-secondary">
            Review later
          </button>
          <button type="button" onClick={() => handleNext(true)} className="btn-primary">
            <span>Got it</span>
            <span>+10 XP <ArrowRight aria-hidden="true" /></span>
          </button>
        </div>
      </article>
    </section>
  );
};
