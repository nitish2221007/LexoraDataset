import React from 'react';
import { ChevronLeft, ChevronRight, BookOpen, Filter, Hash } from 'lucide-react';
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
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors py-3 sticky top-16 z-30">
      <div className="max-w-4xl mx-auto px-4 space-y-3">
        
        {/* Top Pill Controls: Class, Subject, Chapter */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          
          {/* Class & Subject Selector */}
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            
            {/* Class Pill */}
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
              className="bg-indigo-600 text-white font-extrabold text-xs rounded-xl px-3 py-2 focus:outline-none cursor-pointer shadow-sm"
            >
              {Object.keys(manifest.classes).map((cKey) => (
                <option key={cKey} value={cKey}>
                  {manifest.classes[cKey].name}
                </option>
              ))}
            </select>

            {/* Subject Tabs */}
            {activeClassObj && (
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                {Object.keys(activeClassObj.subjects).map((subjKey) => {
                  const isSelected = selectedSubject === subjKey;
                  return (
                    <button
                      key={subjKey}
                      onClick={() => {
                        setSelectedSubject(subjKey);
                        const firstChap = Object.keys(activeClassObj.subjects[subjKey]?.chapters || {})[0] || '';
                        setSelectedChapterId(firstChap);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      {subjKey.replace('_', ' ').toUpperCase()}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Chapter Selector Dropdown */}
          <div className="w-full sm:flex-1">
            {availableChapters.length > 0 && (
              <select
                value={selectedChapterId}
                onChange={(e) => setSelectedChapterId(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold text-xs sm:text-sm rounded-xl px-3 py-2 focus:outline-none cursor-pointer truncate"
              >
                {availableChapters.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    {ch.title} ({ch.pageCount} Pages)
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Hand-Crafted Mobile Page Jumper Bar */}
        {currentChapterObj && availablePages.length > 0 && (
          <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800/80">
            
            {/* Big Prev Page Button */}
            <button
              onClick={handlePrevPage}
              disabled={!hasPrev}
              className="flex items-center gap-1 px-4 py-2.5 rounded-2xl bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs sm:text-sm hover:bg-indigo-600 hover:text-white disabled:opacity-30 disabled:hover:bg-indigo-50 disabled:hover:text-indigo-700 transition-all shadow-sm active:scale-95"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Prev Page</span>
            </button>

            {/* Page Selector Pill */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Page</span>
              <select
                value={currentPageNo}
                onChange={(e) => setCurrentPageNo(Number(e.target.value))}
                className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-indigo-600 dark:text-indigo-300 font-black text-sm rounded-xl px-2.5 py-1 focus:outline-none cursor-pointer"
              >
                {availablePages.map((pg) => (
                  <option key={pg} value={pg}>
                    {pg}
                  </option>
                ))}
              </select>
              <span className="text-xs text-slate-400 font-medium">/ {availablePages[availablePages.length - 1]}</span>
            </div>

            {/* Big Next Page Button */}
            <button
              onClick={handleNextPage}
              disabled={!hasNext}
              className="flex items-center gap-1 px-4 py-2.5 rounded-2xl bg-indigo-600 text-white font-extrabold text-xs sm:text-sm hover:bg-indigo-700 disabled:opacity-30 disabled:hover:bg-indigo-600 transition-all shadow-md shadow-indigo-500/25 active:scale-95"
            >
              <span>Next Page</span>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

          </div>
        )}

      </div>
    </div>
  );
};
