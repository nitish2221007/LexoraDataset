import React from 'react';
import { IndexedWord, DatasetManifest } from '../types/dataset';
import { Search, Volume2, ChevronRight, Bookmark } from 'lucide-react';
import { speakWord } from '../lib/datasetLoader';

interface SearchViewProps {
  searchQuery: string;
  manifest: DatasetManifest | null;
  bookmarkedIds: string[];
  onToggleBookmark: (wordId: string) => void;
  onNavigateToWord: (classId: string, subjectId: string, chapterId: string, pageNo: number) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
  searchQuery,
  manifest,
  bookmarkedIds,
  onToggleBookmark,
  onNavigateToWord
}) => {
  if (!manifest) return null;

  const query = searchQuery.toLowerCase().trim();
  const results: IndexedWord[] = query
    ? manifest.allWordsIndex.filter(
        (item) =>
          item.word.toLowerCase().includes(query) ||
          item.meaning.toLowerCase().includes(query)
      ).slice(0, 100)
    : [];

  return (
    <div className="search-view max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <section className="search-view-hero bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Search className="w-5 h-5 text-indigo-600" aria-hidden="true" />
            <span>{query ? `Results for “${searchQuery}”` : 'Find a word'}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {query
              ? `Found ${results.length} matching ${results.length === 1 ? 'word' : 'words'} across the NCERT library`
              : 'Search by word or meaning from the field above'}
          </p>
        </div>
      </section>

      {results.length > 0 ? (
        <div className="search-results-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((item, index) => {
            const isBookmarked = bookmarkedIds.includes(item.id);
            return (
              <article
                key={item.id}
                className="search-result-card bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all space-y-3 flex flex-col justify-between"
                style={{ '--search-delay': `${Math.min(index, 8) * 40}ms` } as React.CSSProperties}
              >
                <div>
                  <div className="search-result-heading flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">{item.word}</h2>
                      <div className="search-result-meta flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          Class {item.classId.replace('class_', '')} • {item.subjectId.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          Page {item.pageNo}
                        </span>
                      </div>
                    </div>

                    <div className="search-result-actions flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => speakWord(item.word)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        aria-label={`Listen to ${item.word}`}
                      >
                        <Volume2 className="w-4 h-4" aria-hidden="true" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onToggleBookmark(item.id)}
                        className={`p-1.5 rounded-lg transition-all ${
                          isBookmarked ? 'text-amber-500' : 'text-slate-400 hover:text-indigo-600'
                        }`}
                        aria-label={isBookmarked ? `Remove ${item.word} from saved words` : `Save ${item.word}`}
                        aria-pressed={isBookmarked}
                      >
                        <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  <p className="search-result-meaning text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl mt-3 border border-slate-100 dark:border-slate-800">
                    {item.meaning}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigateToWord(item.classId, item.subjectId, item.chapterId, item.pageNo)}
                  className="search-open-button w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white text-xs font-bold text-slate-700 dark:text-slate-300 transition-all flex items-center justify-between"
                >
                  <span>Open textbook page {item.pageNo}</span>
                  <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </article>
            );
          })}
        </div>
      ) : (
        <section className="search-empty bg-white dark:bg-slate-900 p-12 rounded-2xl text-center border border-slate-200 dark:border-slate-800 space-y-2">
          <Search className="w-10 h-10 text-slate-400 mx-auto" aria-hidden="true" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {query ? `No words found for “${searchQuery}”` : 'What do you want to understand?'}
          </h2>
          <p className="text-xs text-slate-500">
            {query ? 'Try another spelling or search inside a meaning.' : 'Type a word above to search all 12,441 entries.'}
          </p>
        </section>
      )}
    </div>
  );
};
