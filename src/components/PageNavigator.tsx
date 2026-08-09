import React from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Filter,
  Hash,
  SlidersHorizontal,
  Grid
} from 'lucide-react';
import { DatasetManifest, ManifestChapter, ViewMode } from '../types/dataset';

interface PageNavigatorProps {
  viewMode: ViewMode;
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
  onOpenDeckModal?: () => void;
}

export const PageNavigator: React.FC<PageNavigatorProps> = ({
  viewMode,
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
  setDifficultyFilter,
  onOpenDeckModal
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
  const hasNext = currentPageIndex >= 0 && currentPageIndex < availablePages.length - 1;

  const handleClassChange = (newClass: string) => {
    setSelectedClass(newClass);
    const firstSubject = Object.keys(manifest.classes[newClass]?.subjects || {})[0] || 'history';
    setSelectedSubject(firstSubject);
    const firstChapter = Object.keys(manifest.classes[newClass]?.subjects[firstSubject]?.chapters || {})[0] || '';
    setSelectedChapterId(firstChapter);
  };

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubject(subjectId);
    const firstChapter = Object.keys(activeClassObj?.subjects[subjectId]?.chapters || {})[0] || '';
    setSelectedChapterId(firstChapter);
  };

  const handlePrevPage = () => {
    if (hasPrev) setCurrentPageNo(availablePages[currentPageIndex - 1]);
  };

  const handleNextPage = () => {
    if (hasNext) setCurrentPageNo(availablePages[currentPageIndex + 1]);
  };

  const subjectLabel = (key: string) => {
    if (key === 'political_science') return 'Civics';
    return activeClassObj?.subjects[key]?.name || key.replace(/_/g, ' ');
  };

  return (
    <>
      {/* Compact, touch-first mobile controls */}
      <section
        className={`mobile-reader-navigator md:hidden ${viewMode === 'page' ? '' : 'is-study-mode'}`}
        aria-label="Textbook navigation"
      >
        <div className="mobile-library-row">
          <button
            type="button"
            onClick={onOpenDeckModal}
            className="flex items-center justify-between px-3 py-2 bg-[#FFEAF2] dark:bg-slate-800 border border-[#F3C6D6] dark:border-slate-700 rounded-xl text-[#C2185B] dark:text-pink-400 font-bold text-xs w-full mb-2"
          >
            <span className="flex items-center gap-1.5">
              <Grid className="w-3.5 h-3.5" />
              <span>Step Selector (Class 1-12)</span>
            </span>
            <span className="bg-[#C2185B] text-white px-2 py-0.5 rounded-full text-[10px]">
              Class {selectedClass.replace('class_', '')}
            </span>
          </button>
        </div>

        <div className="mobile-library-row">
          <label className="mobile-class-select">
            <span>Class</span>
            <select value={selectedClass} onChange={(event) => handleClassChange(event.target.value)}>
              {Object.keys(manifest.classes).map((classKey) => (
                <option key={classKey} value={classKey}>
                  {manifest.classes[classKey].name.replace(/^Class\s*/i, '')}
                </option>
              ))}
            </select>
            <ChevronDown aria-hidden="true" />
          </label>

          {activeClassObj && (
            <div className="mobile-subject-tabs" role="tablist" aria-label="Choose subject">
              {Object.keys(activeClassObj.subjects).map((subjectKey) => (
                <button
                  type="button"
                  role="tab"
                  aria-selected={selectedSubject === subjectKey}
                  key={subjectKey}
                  onClick={() => handleSubjectChange(subjectKey)}
                  className={selectedSubject === subjectKey ? 'is-active' : ''}
                >
                  {subjectLabel(subjectKey)}
                </button>
              ))}
            </div>
          )}
        </div>

        {availableChapters.length > 0 ? (
          <label className="mobile-chapter-select">
            <span className="mobile-chapter-icon" aria-hidden="true"><BookOpen /></span>
            <span className="mobile-chapter-copy">
              <span>Currently reading</span>
              <strong>{currentChapterObj?.title || 'Choose a chapter'}</strong>
            </span>
            <ChevronDown className="mobile-chapter-chevron" aria-hidden="true" />
            <select value={selectedChapterId} onChange={(event) => setSelectedChapterId(event.target.value)}>
              {availableChapters.map((chapter) => (
                <option key={chapter.id} value={chapter.id}>
                  {chapter.title} ({chapter.pageCount} pages)
                </option>
              ))}
            </select>
          </label>
        ) : (
          <div className="mobile-empty-chapter">No chapters are available for this selection yet.</div>
        )}

        {currentChapterObj && availablePages.length > 0 && (
          <div className="mobile-page-toolbar">
            <button
              type="button"
              onClick={handlePrevPage}
              disabled={!hasPrev}
              className="mobile-page-arrow"
              aria-label="Previous textbook page"
            >
              <ChevronLeft aria-hidden="true" />
            </button>

            <label className="mobile-page-picker">
              <span>
                <small>Textbook page</small>
                <strong>{currentPageNo}</strong>
              </span>
              <span className="mobile-page-meta">
                {wordsOnCurrentPage} words · {currentPageIndex + 1}/{availablePages.length}
              </span>
              <ChevronDown aria-hidden="true" />
              <select value={currentPageNo} onChange={(event) => setCurrentPageNo(Number(event.target.value))}>
                {availablePages.map((page) => {
                  const pageInfo = currentChapterObj.pages.find((item) => item.pageNo === page);
                  return (
                    <option key={page} value={page}>
                      Page {page} ({pageInfo?.wordCount || 0} words)
                    </option>
                  );
                })}
              </select>
            </label>

            <button
              type="button"
              onClick={handleNextPage}
              disabled={!hasNext}
              className="mobile-page-arrow"
              aria-label="Next textbook page"
            >
              <ChevronRight aria-hidden="true" />
            </button>
          </div>
        )}

        {viewMode === 'page' && (
          <div className="mobile-difficulty-row">
            <span className="mobile-filter-label"><SlidersHorizontal aria-hidden="true" /> Level</span>
            <div className="mobile-filter-options" aria-label="Filter by difficulty">
              {['All', 'Easy', 'Medium', 'Hard'].map((level) => (
                <button
                  type="button"
                  key={level}
                  onClick={() => setDifficultyFilter(level)}
                  className={difficultyFilter === level ? 'is-active' : ''}
                  aria-pressed={difficultyFilter === level}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Desktop controls */}
      <div className="hidden md:block bg-white dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 shadow-sm py-4 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onOpenDeckModal}
                className="bg-[#C2185B] text-white hover:bg-[#A31257] font-bold text-xs rounded-xl px-3.5 py-2 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Class 1-12 Deck Flow</span>
              </button>

              <select
                value={selectedClass}
                onChange={(event) => handleClassChange(event.target.value)}
                className="bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {Object.keys(manifest.classes).map((classKey) => (
                  <option key={classKey} value={classKey}>{manifest.classes[classKey].name}</option>
                ))}
              </select>

              {activeClassObj && (
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                  {Object.keys(activeClassObj.subjects).map((subjectKey) => {
                    const subject = activeClassObj.subjects[subjectKey];
                    const isSelected = selectedSubject === subjectKey;
                    const chapterCount = Object.keys(subject.chapters).length;
                    return (
                      <button
                        type="button"
                        key={subjectKey}
                        onClick={() => handleSubjectChange(subjectKey)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-white dark:bg-slate-700 text-[#C2185B] dark:text-pink-300 shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      >
                        <span>{subjectKey.replace('_', ' ').toUpperCase()}</span>
                        {chapterCount > 0 && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 font-bold">
                            {chapterCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-[240px]">
              {availableChapters.length > 0 ? (
                <select
                  value={selectedChapterId}
                  onChange={(event) => setSelectedChapterId(event.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs sm:text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer truncate"
                >
                  {availableChapters.map((chapter) => (
                    <option key={chapter.id} value={chapter.id}>
                      {chapter.title} ({chapter.pageCount} Pages • {chapter.wordCount} Words)
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-2 font-medium">
                  No chapters added for this selection yet.
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={difficultyFilter}
                onChange={(event) => setDifficultyFilter(event.target.value)}
                className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
              >
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy Only</option>
                <option value="Medium">Medium Only</option>
                <option value="Hard">Hard Only</option>
              </select>
            </div>
          </div>

          {currentChapterObj && availablePages.length > 0 && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-[#C2185B] text-white flex items-center justify-center font-black text-xs shadow-md shadow-pink-500/20">
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

              <div className="flex items-center gap-2 flex-1 max-w-md justify-center">
                <button
                  type="button"
                  onClick={handlePrevPage}
                  disabled={!hasPrev}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-[#C2185B] hover:text-white disabled:opacity-40 transition-all shadow-sm font-semibold flex items-center gap-1 text-xs"
                  title="Previous Page (Left Arrow Key)"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Prev</span>
                </button>

                <select
                  value={currentPageNo}
                  onChange={(event) => setCurrentPageNo(Number(event.target.value))}
                  className="bg-pink-50/80 dark:bg-slate-800 border border-pink-200 dark:border-slate-700 text-[#C2185B] dark:text-pink-300 font-extrabold text-sm rounded-xl px-4 py-2 focus:outline-none cursor-pointer text-center min-w-[140px]"
                >
                  {availablePages.map((page) => {
                    const pageInfo = currentChapterObj.pages.find((item) => item.pageNo === page);
                    return <option key={page} value={page}>Page {page} ({pageInfo?.wordCount || 0} words)</option>;
                  })}
                </select>

                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={!hasNext}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-[#C2185B] hover:text-white disabled:opacity-40 transition-all shadow-sm font-semibold flex items-center gap-1 text-xs"
                  title="Next Page (Right Arrow Key)"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-pink-100 dark:bg-pink-950/80 text-[#C2185B] dark:text-pink-300 border border-pink-200 dark:border-pink-800">
                {wordsOnCurrentPage} Words on Page {currentPageNo}
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
