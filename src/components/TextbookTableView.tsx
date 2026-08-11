import React, { useState } from 'react';
import { WordItem } from '../types/dataset';
import { Volume2, Bookmark, ChevronDown, ChevronUp } from 'lucide-react';
import { speakWord } from '../lib/datasetLoader';

interface TextbookTableViewProps {
  words: WordItem[];
  bookmarkedIds: string[];
  onToggleBookmark: (wordId: string) => void;
  pageNo: number;
}

export const TextbookTableView: React.FC<TextbookTableViewProps> = ({
  words,
  bookmarkedIds,
  onToggleBookmark,
  pageNo
}) => {
  const [expandedWordId, setExpandedWordId] = useState<string | null>(null);

  return (
    <div className="w-full max-w-3xl mx-auto overflow-hidden rounded-xl border-2 border-slate-300 dark:border-slate-800 shadow-md">
      <table className="w-full text-left border-collapse bg-white dark:bg-slate-900 font-sans">
        {/* Table Header: Pink background with White bold text */}
        <thead>
          <tr className="bg-[#C2185B] text-white text-base sm:text-lg font-serif">
            <th className="w-1/3 sm:w-1/4 p-3.5 sm:p-4 font-bold border-r border-pink-700/80">
              Term
            </th>
            <th className="w-2/3 sm:w-3/4 p-3.5 sm:p-4 font-bold">
              Definition
            </th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm sm:text-base">
          {words.map((word) => {
            const isBookmarked = bookmarkedIds.includes(word.id);
            const isExpanded = expandedWordId === word.id;
            const medium = word.medium;

            return (
              <React.Fragment key={word.id}>
                <tr className="hover:bg-pink-50/40 dark:hover:bg-slate-850/50 transition-colors">
                  {/* Left Column: Term */}
                  <td className="p-3.5 sm:p-4 align-top border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="font-serif font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                      {word.word}
                    </div>

                    {word.hindi_meaning && (
                      <div className="text-xs font-sans font-semibold text-[#C2185B] dark:text-pink-400 mt-1">
                        {word.hindi_meaning}
                      </div>
                    )}

                    {medium?.pronunciation && (
                      <div className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                        /{medium.pronunciation}/
                      </div>
                    )}

                    {/* Quick Action Controls */}
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          speakWord(word.word);
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#C2185B] hover:bg-pink-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                        title="Listen Audio"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleBookmark(word.id);
                        }}
                        className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                          isBookmarked
                            ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                            : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        title={isBookmarked ? 'Bookmarked' : 'Bookmark'}
                      >
                        <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setExpandedWordId(isExpanded ? null : word.id)}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 ml-auto cursor-pointer"
                        title="More details"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>

                  {/* Right Column: Definition */}
                  <td className="p-3.5 sm:p-4 align-top text-slate-800 dark:text-slate-200 leading-relaxed">
                    <p className="font-medium text-sm sm:text-base">
                      {word.meaning}
                    </p>

                    {/* Optional Expanded Notes */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs sm:text-sm animate-fade-in">
                        {medium?.simple_explanation && (
                          <div className="p-2.5 rounded-lg bg-pink-50/60 dark:bg-pink-950/30 border border-pink-200/60 dark:border-pink-900/40">
                            <strong className="text-[#C2185B] dark:text-pink-300">Simple Explanation: </strong>
                            <span className="text-slate-700 dark:text-slate-300">{medium.simple_explanation}</span>
                          </div>
                        )}

                        {medium?.funny_explanation && (
                          <div className="p-2.5 rounded-lg bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40">
                            <strong className="text-amber-700 dark:text-amber-300">Memory Trick 💡: </strong>
                            <span className="text-slate-700 dark:text-slate-300">{medium.funny_explanation}</span>
                          </div>
                        )}

                        {medium?.examples && medium.examples.length > 0 && (
                          <div className="text-slate-600 dark:text-slate-400 italic">
                            <strong>Example: </strong>"{medium.examples[0].text}"
                          </div>
                        )}

                        {medium?.synonyms && medium.synonyms.length > 0 && (
                          <div className="text-slate-500 dark:text-slate-400">
                            <strong>Synonyms: </strong>{medium.synonyms.join(', ')}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
