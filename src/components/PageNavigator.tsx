import React from 'react';
import { ChevronLeft, ChevronRight, Book, Sparkles, Filter, Hash } from 'lucide-react';
import { DatasetManifest, ManifestChapter } from '../types/dataset';

interface PageNavigatorProps {
  manifest: DatasetManifest | null;
  selectedClass: string;
  setSelectedClass: (c: string) => void;
  selectedSubject: string;
  setSelectedSubject: (s: string) => void;
  selectedChapterId: string;
  setSelectedChapterId: (ch: string) => void;
  currentPageNo: number;
  setCurrentPageNo: (p: number) => void;
  availablePages: number[];
  wordsOnCurrentPage: number;
  difficultyFilter: string;
  setDifficultyFilter: (d: string) => void;
}

export const PageNavigator: React.FC<PageNavigatorProps> = ({
  manifest,
  selectedClass,
  setSelectedClass,
  selectedSubject,
  setSelectedSubject,
  selectedChapterId,
  setSelectedChapterId,
  currentPageNo,
  setCurrentPageNo,
  availablePages,
  wordsOnCurrentPage,
  difficultyFilter,
  setDifficultyFilter
}) => {
  if (!manifest) return null;

  const activeClassObj = manifest.classes[selectedClass];
  const activeSubjectObj = activeClassObj?.subjects[selectedSubject];
  const availableChapters: ManifestChapter[] = activeSubjectObj
    ? Object.values(activeSubjectObj.chapters)
    : [];
  const currentChapterObj = activeSubjectObj?.chapters[selectedChapterId];

  const currentPageIndex = availablePages.indexOf(currentPageNo);
  const hasPrev = currentPageIndex > 0;
  const hasNext = currentPageIndex < availablePages.length - 1;

  const handlePrevPage = () => {
    if (hasPrev) {
      setCurrentPageNo(availablePages[currentPageIndex - 1]);
    }
  };

  const handleNextPage = () => {
    if (hasNext) {
      setCurrentPageNo(availablePages[currentPageIndex + 1]);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 shadow-sm py-4 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        
        {/* Top Control Row: Class, Subject, Chapter Selectors */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Class & Subject Selector */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Class Pill Selector */}
            <select
              value={selectedClass}
              onChange={(e) => {
                const newClass = e.target.value;
                setSelectedClass(newClass);
                const firstSubj = Object.keys(manifest.classes[newClass]?.subjects || {})[0] || 'history';
                setSelectedSubject(firstSubj);
                const firstChap = Object.keys(manifest.classes[newClass]?.subjects[firstSubj]?.chapters || {})[0] || '';
                setSelectedChapterId(firstChap);
              }}
              className="bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {Object.keys(manifest.classes).map((cKey) => (
                <option key={cKey} value={cKey}>
                  {manifest.classes[cKey].name}
                  {Object.keys(manifest.classes[cKey].subjects.history?.chapters || {}).length === 0 &&
                  Object.keys(manifest.classes[cKey].subjects.political_science?.chapters || {}).length === 0
                    ? ' (Dataset ready)'
                    : ''}
                </option>
              ))}
            </select>

            {/* Subject Tabs */}
            {activeClassObj && (
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                {Object.keys(activeClassObj.subjects).map((subjKey) => {
                  const subj = activeClassObj.subjects[subjKey];
                  const isSelected = selectedSubject === subjKey;
                  const chapCount = Object.keys(subj.chapters).length;
                  return (
                    <button
                      key={subjKey}
                      onClick={() => {
                        setSelectedSubject(subjKey);
                        const firstChap = Object.keys(subj.chapters)[0] || '';
                        setSelectedChapterId(firstChap);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      <span>{subjKey.replace('_', ' ').toUpperCase()}</span>
                      {chapCount > 0 && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 font-bold">
                          {chapCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Chapter Dropdown Selector */}
          <div className="flex-1 min-w-[240px]">
            {availableChapters.length > 0 ? (
              <select
                value={selectedChapterId}
                onChange={(e) => setSelectedChapterId(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs sm:text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer truncate"
              >
                {availableChapters.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    {ch.title} ({ch.pageCount} Pages • {ch.wordCount} Words)
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-2 font-medium">
                No chapters added for this selection yet. Showing active Class 10 dataset!
              </div>
            )}
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy Only</option>
              <option value="Medium">Medium Only</option>
              <option value="Hard">Hard Only</option>
            </select>
          </div>
        </div>

        {/* Bottom Page Navigation Bar ("Page Wise Jumper") */}
        {currentChapterObj && availablePages.length > 0 && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex flex-wrap items-center justify-between gap-3">
            
            {/* Textbook Page Indicator */}
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-md shadow-indigo-500/20">
                <Hash className="w-3.5 h-3.5" />
              </span>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Textbook Page</span>
                <div className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <span>Page {currentPageNo}</span>
                  <span className="text-xs text-slate-400 font-normal">
                    (Page {currentPageIndex + 1} of {availablePages.length})
                  </span>
                </div>
              </div>
            </div>

            {/* Main Page Swiper & Slider Controls */}
            <div className="flex items-center gap-2 flex-1 max-w-md justify-center">
              
              <button
                onClick={handlePrevPage}
                disabled={!hasPrev}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white disabled:opacity-40 disabled:hover:bg-slate-100 disabled:hover:text-slate-700 dark:disabled:hover:bg-slate-800 dark:disabled:hover:text-slate-300 transition-all shadow-sm font-semibold flex items-center gap-1 text-xs"
                title="Previous Page (Left Arrow Key)"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Prev</span>
              </button>

              {/* Page Selector Dropdown Pill */}
              <div className="relative flex items-center">
                <select
                  value={currentPageNo}
                  onChange={(e) => setCurrentPageNo(Number(e.target.value))}
                  className="bg-indigo-50/80 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs sm:text-sm rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none text-center min-w-[120px]"
                >
                  {availablePages.map((pg) => {
                    const pgInfo = currentChapterObj.pages.find(p => p.pageNo === pg);
                    return (
                      <option key={pg} value={pg}>
                        Page {pg} ({pgInfo?.wordCount || 0} words)
                      </option>
                    );
                  })}
                </select>
              </div>

              <button
                onClick={handleNextPage}
                disabled={!hasNext}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white disabled:opacity-40 disabled:hover:bg-slate-100 disabled:hover:text-slate-700 dark:disabled:hover:bg-slate-800 dark:disabled:hover:text-slate-300 transition-all shadow-sm font-semibold flex items-center gap-1 text-xs"
                title="Next Page (Right Arrow Key)"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Words Count Badge for Active Page */}
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {wordsOnCurrentPage} Words on Page {currentPageNo}
              </span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
