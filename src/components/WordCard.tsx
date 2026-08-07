import React, { useState } from 'react';
import { Volume2, Bookmark, Check, Copy, Sparkles, Lightbulb, Smile, ChevronDown, ChevronUp } from 'lucide-react';
import { WordItem } from '../types/dataset';
import { speakWord } from '../lib/datasetLoader';

interface WordCardProps {
  word: WordItem;
  isBookmarked: boolean;
  onToggleBookmark: (wordId: string) => void;
  pageNo?: number;
}

export const WordCard: React.FC<WordCardProps> = ({
  word,
  isBookmarked,
  onToggleBookmark,
  pageNo
}) => {
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const difficulty = word.difficulty || 'Medium';

  const getDifficultyBadge = (diff: string) => {
    switch (diff.toLowerCase()) {
      case 'easy':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60';
      case 'medium':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800/60';
      case 'hard':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800/60';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const handleAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlayingAudio(true);
    speakWord(word.word);
    setTimeout(() => setIsPlayingAudio(false), 1200);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `${word.word}: ${word.meaning}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const medium = word.medium;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 space-y-4">
      
      {/* Word Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {word.word}
            </h2>

            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getDifficultyBadge(difficulty)}`}>
              {difficulty}
            </span>

            {pageNo && (
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                • Page {pageNo}
              </span>
            )}
          </div>

          {/* Phonetic Pronunciation Guide */}
          {medium?.pronunciation && (
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs sm:text-sm">
              <span>/{medium.pronunciation}/</span>
            </div>
          )}
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          
          {/* Audio Pronunciation Button */}
          <button
            onClick={handleAudio}
            className={`p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition-all ${
              isPlayingAudio ? 'animate-bounce bg-indigo-600 text-white' : ''
            }`}
            title="Pronounce word"
          >
            <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Bookmark Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(word.id);
            }}
            className={`p-2.5 rounded-2xl transition-all ${
              isBookmarked
                ? 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-300'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
            title={isBookmarked ? "Saved" : "Save word"}
          >
            <Bookmark className={`w-4 h-4 sm:w-5 sm:h-5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 transition-all"
            title="Copy meaning"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Meaning Box - Large, High Contrast, Super Readable */}
      <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-semibold text-base sm:text-lg leading-relaxed">
        {word.meaning}
      </div>

      {/* Expandable Rich Explanations */}
      {medium && (
        <div className="space-y-3 pt-1">
          
          {/* Simple Explanation */}
          {medium.simple_explanation && (
            <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 text-xs sm:text-sm leading-relaxed flex items-start gap-2.5">
              <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Simple Explanation: </span>
                <span>{medium.simple_explanation}</span>
              </div>
            </div>
          )}

          {/* Funny Explanation (Memorable Trick) */}
          {medium.funny_explanation && (
            <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40 text-purple-950 dark:text-purple-200 text-xs sm:text-sm leading-relaxed flex items-start gap-2.5">
              <Smile className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Funny Trick: </span>
                <span>{medium.funny_explanation}</span>
              </div>
            </div>
          )}

          {/* Example Sentences */}
          {medium.examples && medium.examples.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Examples
              </span>
              {medium.examples.map((ex, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase not-italic mr-2 ${
                    ex.type === 'funny' 
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' 
                      : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                  }`}>
                    {ex.type}
                  </span>
                  "{ex.text}"
                </div>
              ))}
            </div>
          )}

          {/* Synonyms & Antonyms */}
          {((medium.synonyms && medium.synonyms.length > 0) || (medium.antonyms && medium.antonyms.length > 0)) && (
            <div className="flex flex-wrap gap-3 pt-2 text-xs sm:text-sm">
              {medium.synonyms && medium.synonyms.length > 0 && (
                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 px-3 py-1.5 rounded-xl text-emerald-800 dark:text-emerald-300 font-medium">
                  <strong className="font-bold">Synonyms: </strong>
                  {medium.synonyms.join(', ')}
                </div>
              )}
              {medium.antonyms && medium.antonyms.length > 0 && (
                <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/40 px-3 py-1.5 rounded-xl text-rose-800 dark:text-rose-300 font-medium">
                  <strong className="font-bold">Antonyms: </strong>
                  {medium.antonyms.join(', ')}
                </div>
              )}
            </div>
          )}

        </div>
      )}

    </div>
  );
};
