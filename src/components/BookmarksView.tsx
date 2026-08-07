import React from 'react';
import { WordItem, DatasetManifest } from '../types/dataset';
import { WordCard } from './WordCard';
import { Bookmark, Trash2 } from 'lucide-react';

interface BookmarksViewProps {
  bookmarkedWords: { word: WordItem; pageNo?: number }[];
  bookmarkedIds: string[];
  onToggleBookmark: (wordId: string) => void;
  onClearAll: () => void;
}

export const BookmarksView: React.FC<BookmarksViewProps> = ({
  bookmarkedWords,
  bookmarkedIds,
  onToggleBookmark,
  onClearAll
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-indigo-600 fill-indigo-600" />
            <span>Saved Bookmarks ({bookmarkedWords.length})</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Your personal vocabulary collection saved to local storage
          </p>
        </div>

        {bookmarkedWords.length > 0 && (
          <button
            onClick={onClearAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold text-xs hover:bg-rose-100 transition-all border border-rose-200 dark:border-rose-800"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Bookmarked Grid */}
      {bookmarkedWords.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarkedWords.map(({ word, pageNo }) => (
            <WordCard
              key={word.id}
              word={word}
              pageNo={pageNo}
              isBookmarked={true}
              onToggleBookmark={onToggleBookmark}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl text-center border border-slate-200 dark:border-slate-800 space-y-3">
          <Bookmark className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No bookmarked words yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Click the bookmark icon on any word card while reading pages to save it here for revision!
          </p>
        </div>
      )}

    </div>
  );
};
