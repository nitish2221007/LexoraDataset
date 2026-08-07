import React, { useState } from 'react';
import { Volume2, Bookmark, Check, Smile, Lightbulb, Sparkles, BookOpen, Copy } from 'lucide-react';
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

  const difficulty = word.difficulty || 'Medium';

  const getDifficultyBadge = (diff: string) => {
    switch (diff.toLowerCase()) {
      case 'easy':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'medium':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'hard':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      default:
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
    }
  };

  const handleAudio = () => {
    setIsPlayingAudio(true);
    speakWord(word.word);
    setTimeout(() => setIsPlayingAudio(false), 1200);
  };

  const handleCopy = () => {
    const text = `${word.word}: ${word.meaning}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const medium = word.medium;

  return (
    <div className="group relative bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-700/60 transition-all duration-300 flex flex-col justify-between">
      <div>
        
        {/* Card Header: Word Name, Difficulty, Actions */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {word.word}
              </h3>
              
              {/* Difficulty Badge */}
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getDifficultyBadge(difficulty)}`}>
                {difficulty}
              </span>

              {pageNo && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  Page {pageNo}
                </span>
              )}
            </div>

            {/* Phonetic Pronunciation */}
            {medium?.pronunciation && (
              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5 flex items-center gap-1">
                <span>/{medium.pronunciation}/</span>
              </p>
            )}
          </div>

          {/* Action Buttons: Audio TTS, Copy, Bookmark */}
          <div className="flex items-center gap-1.5 shrink-0">
            
            {/* Audio Speech Button */}
            <button
              onClick={handleAudio}
              className={`p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all ${
                isPlayingAudio ? 'animate-pulse text-indigo-600 bg-indigo-50 dark:bg-indigo-950' : ''
              }`}
              title="Listen to Pronunciation (Audio)"
            >
              <Volume2 className="w-4 h-4" />
            </button>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              title="Copy Word & Meaning"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Bookmark Button */}
            <button
              onClick={() => onToggleBookmark(word.id)}
              className={`p-2 rounded-xl transition-all ${
                isBookmarked
                  ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 font-bold'
                  : 'text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={isBookmarked ? "Remove Bookmark" : "Save to Bookmarks"}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Primary Meaning */}
        <div className="mb-4 text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
          {word.meaning}
        </div>

        {/* Rich Explanations (Simple & Funny) */}
        {medium && (
          <div className="space-y-2.5 text-xs">
            
            {/* Simple Explanation */}
            {medium.simple_explanation && (
              <div className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300">Simple: </span>
                  <span>{medium.simple_explanation}</span>
                </div>
              </div>
            )}

            {/* Funny Explanation (Dataset Highlight!) */}
            {medium.funny_explanation && (
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/60 text-purple-900 dark:text-purple-200">
                <Smile className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Funny Note: </span>
                  <span>{medium.funny_explanation}</span>
                </div>
              </div>
            )}

            {/* Examples */}
            {medium.examples && medium.examples.length > 0 && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
                <span className="font-bold text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Examples
                </span>
                {medium.examples.map((ex, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-slate-600 dark:text-slate-300 italic">
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded shrink-0 uppercase not-italic ${
                      ex.type === 'funny' 
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300' 
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {ex.type}
                    </span>
                    <span>"{ex.text}"</span>
                  </div>
                ))}
              </div>
            )}

            {/* Synonyms & Antonyms */}
            {((medium.synonyms && medium.synonyms.length > 0) || (medium.antonyms && medium.antonyms.length > 0)) && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap gap-2 text-[11px]">
                {medium.synonyms && medium.synonyms.length > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Synonyms:</span>
                    <span className="text-slate-600 dark:text-slate-400">{medium.synonyms.join(', ')}</span>
                  </div>
                )}
                {medium.antonyms && medium.antonyms.length > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-rose-600 dark:text-rose-400">Antonyms:</span>
                    <span className="text-slate-600 dark:text-slate-400">{medium.antonyms.join(', ')}</span>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
