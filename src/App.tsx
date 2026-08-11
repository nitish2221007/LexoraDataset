import React, { useState, useEffect } from 'react';
import { DatasetManifest, ViewMode, PageData, WordItem } from './types/dataset';
import { getDatasetManifest, getChapterPages, getBookmarkedIds, toggleBookmark } from './lib/datasetLoader';
import { Header } from './components/Header';
import { PageNavigator } from './components/PageNavigator';
import { PageView } from './components/PageView';
import { FlashcardView } from './components/FlashcardView';
import { QuizView } from './components/QuizView';
import { SearchView } from './components/SearchView';
import { BookmarksView } from './components/BookmarksView';
import { MobileBottomNav } from './components/MobileBottomNav';
import { StorySwipeView } from './components/StorySwipeView';
import { DeckSelectionView } from './components/DeckSelectionView';
import { applySEO } from './lib/seo';

export const App: React.FC = () => {
  const [manifest, setManifest] = useState<DatasetManifest | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>('class_10');
  const [selectedSubject, setSelectedSubject] = useState<string>('history');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('chapter_1');
  const [currentPageNo, setCurrentPageNo] = useState<number>(3);

  const [chapterPages, setChapterPages] = useState<PageData[]>([]);
  const [isLoadingPages, setIsLoadingPages] = useState<boolean>(false);

  const [viewMode, setViewMode] = useState<ViewMode>('page');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');
  
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [bookmarkedWordsCache, setBookmarkedWordsCache] = useState<{ word: WordItem; pageNo?: number }[]>([]);
  
  // Selection Flow Step: 'class' | 'subject' | 'chapter' | 'words'
  const [selectionStep, setSelectionStep] = useState<'class' | 'subject' | 'chapter' | 'words'>('class');

  // Gamification: XP & Streak
  const [xp, setXp] = useState<number>(() => {
    return Number(localStorage.getItem('lexora_xp') || '50');
  });
  const [streak, setStreak] = useState<number>(() => {
    return Number(localStorage.getItem('lexora_streak') || '1');
  });

  const handleAddXp = (amount: number) => {
    setXp(prev => {
      const next = prev + amount;
      localStorage.setItem('lexora_xp', next.toString());
      return next;
    });
  };

  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // 1. Parse initial URL query parameters for SEO Deep Linking or pop open Class->Subject->Chapter selector
  useEffect(() => {
    getDatasetManifest().then((data) => {
      setManifest(data);
      setBookmarkedIds(getBookmarkedIds());

      const params = new URLSearchParams(window.location.search);
      const urlClass = params.get('class') || (params.get('c') ? `class_${params.get('c')}` : null);
      const urlSubj = params.get('subject') || params.get('s');
      const urlChap = params.get('chapter') || (params.get('ch') ? `chapter_${params.get('ch')}` : null);
      const urlPage = params.get('page') || params.get('p');

      if (urlClass && data.classes[urlClass]) {
        setSelectedClass(urlClass);
        const subjToUse = urlSubj && data.classes[urlClass].subjects[urlSubj] ? urlSubj : Object.keys(data.classes[urlClass].subjects)[0] || 'history';
        setSelectedSubject(subjToUse);

        if (urlChap && data.classes[urlClass].subjects[subjToUse]?.chapters[urlChap]) {
          setSelectedChapterId(urlChap);
        } else {
          const firstChap = Object.keys(data.classes[urlClass].subjects[subjToUse]?.chapters || {})[0];
          if (firstChap) setSelectedChapterId(firstChap);
        }

        if (urlPage) {
          setCurrentPageNo(Number(urlPage));
        }

        // Direct URL parameter passed -> open words view directly
        setSelectionStep('words');
      } else {
        // No query parameters -> start on Screen 1: Choose Class!
        setSelectionStep('class');
      }
    });
  }, []);

  // 2. Sync URL search params and dynamic SEO metadata with keyword permutations
  useEffect(() => {
    if (!manifest) return;

    const classNum = selectedClass.replace('class_', '');
    const subjObj = manifest.classes[selectedClass]?.subjects[selectedSubject];
    const subjectName = subjObj?.name || selectedSubject.replace('_', ' ').toUpperCase();
    const chapterTitle = subjObj?.chapters[selectedChapterId]?.title || `Chapter ${selectedChapterId.replace('chapter_', '')}`;

    applySEO({
      classNum,
      subjectId: selectedSubject,
      subjectName,
      chapterId: selectedChapterId,
      chapterTitle,
      pageNo: currentPageNo
    });

    const newUrl = `${window.location.pathname}?c=${classNum}&s=${selectedSubject}&ch=${selectedChapterId}&p=${currentPageNo}`;
    window.history.replaceState(null, '', newUrl);
  }, [manifest, selectedClass, selectedSubject, selectedChapterId, currentPageNo]);

  // Fetch pages whenever selected chapter changes
  useEffect(() => {
    if (!manifest) return;
    const activeClassObj = manifest.classes[selectedClass];
    const activeSubjectObj = activeClassObj?.subjects[selectedSubject];
    const chapterObj = activeSubjectObj?.chapters[selectedChapterId];

    if (chapterObj) {
      setIsLoadingPages(true);
      getChapterPages(chapterObj.file).then((pages) => {
        setChapterPages(pages);
        if (pages.length > 0) {
          const pageNumbers = pages.map((p) => p.page_no);
          if (!pageNumbers.includes(currentPageNo)) {
            setCurrentPageNo(pageNumbers[0]);
          }
        }
        setIsLoadingPages(false);
      });
    } else {
      setChapterPages([]);
    }
  }, [manifest, selectedClass, selectedSubject, selectedChapterId]);

  // Handle keyboard navigation for flipping pages
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (viewMode !== 'page' && viewMode !== 'flashcard') return;
      if (selectionStep !== 'words') return;

      const availablePages = chapterPages.map((p) => p.page_no);
      const currentIndex = availablePages.indexOf(currentPageNo);

      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setCurrentPageNo(availablePages[currentIndex - 1]);
      } else if (e.key === 'ArrowRight' && currentIndex < availablePages.length - 1) {
        setCurrentPageNo(availablePages[currentIndex + 1]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [chapterPages, currentPageNo, viewMode, selectionStep]);

  const handleToggleBookmark = (wordId: string) => {
    const updatedIds = toggleBookmark(wordId);
    setBookmarkedIds(updatedIds);
  };

  const handleClearAllBookmarks = () => {
    localStorage.removeItem('lexora_bookmarked_words_v1');
    setBookmarkedIds([]);
  };

  const activePageData = chapterPages.find((p) => p.page_no === currentPageNo);
  const wordsOnCurrentPage = activePageData?.words || [];
  const availablePages = chapterPages.map((p) => p.page_no);

  const currentChapterTitle = manifest?.classes[selectedClass]?.subjects[selectedSubject]?.chapters[selectedChapterId]?.title;

  useEffect(() => {
    if (!manifest) return;
    const result: { word: WordItem; pageNo?: number }[] = [];

    chapterPages.forEach((pg) => {
      pg.words.forEach((w) => {
        if (bookmarkedIds.includes(w.id)) {
          result.push({ word: w, pageNo: pg.page_no });
        }
      });
    });

    bookmarkedIds.forEach((id) => {
      if (!result.some((r) => r.word.id === id)) {
        const indexed = manifest.allWordsIndex.find((iw) => iw.id === id);
        if (indexed) {
          result.push({
            word: {
              id: indexed.id,
              word: indexed.word,
              meaning: indexed.meaning,
              difficulty: indexed.difficulty
            },
            pageNo: indexed.pageNo
          });
        }
      }
    });

    setBookmarkedWordsCache(result);
  }, [bookmarkedIds, chapterPages, manifest]);

  const handleNavigateToWord = (classId: string, subjectId: string, chapterId: string, pageNo: number) => {
    setSelectedClass(classId);
    setSelectedSubject(subjectId);
    setSelectedChapterId(chapterId);
    setCurrentPageNo(pageNo);
    setSelectionStep('words');
    setViewMode('page');
  };

  return (
    <div className="lexora-app min-h-screen bg-[#FFF5F8] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 selection:bg-pink-500 selection:text-white">
      
      {/* Header Bar */}
      <Header
        viewMode={viewMode}
        setViewMode={(v) => {
          setViewMode(v);
          if (v === 'page' && selectionStep !== 'words') {
            setSelectionStep('words');
          }
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        bookmarkCount={bookmarkedIds.length}
        totalWords={manifest?.allWordsIndex.length || 12441}
        xp={xp}
      />

      {/* Page Navigator (Active when viewing words) */}
      {(viewMode === 'page' || viewMode === 'reel' || viewMode === 'flashcard' || viewMode === 'quiz') && selectionStep === 'words' && (
        <PageNavigator
          viewMode={viewMode}
          manifest={manifest}
          selectedClass={selectedClass}
          setSelectedClass={setSelectedClass}
          selectedSubject={selectedSubject}
          setSelectedSubject={setSelectedSubject}
          selectedChapterId={selectedChapterId}
          setSelectedChapterId={setSelectedChapterId}
          currentPageNo={currentPageNo}
          setCurrentPageNo={setCurrentPageNo}
          availablePages={availablePages}
          wordsOnCurrentPage={wordsOnCurrentPage.length}
          difficultyFilter={difficultyFilter}
          setDifficultyFilter={setDifficultyFilter}
          onOpenDeckModal={() => setSelectionStep('chapter')}
        />
      )}

      {/* Main View Container */}
      <main className="lexora-main flex-1 pb-16">
        {viewMode === 'page' && selectionStep !== 'words' && (
          <DeckSelectionView
            step={selectionStep}
            setStep={setSelectionStep}
            manifest={manifest}
            selectedClass={selectedClass}
            setSelectedClass={setSelectedClass}
            selectedSubject={selectedSubject}
            setSelectedSubject={setSelectedSubject}
            selectedChapterId={selectedChapterId}
            setSelectedChapterId={setSelectedChapterId}
            setCurrentPageNo={setCurrentPageNo}
          />
        )}

        {viewMode === 'page' && selectionStep === 'words' && (
          <PageView
            currentPageNo={currentPageNo}
            words={wordsOnCurrentPage}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
            difficultyFilter={difficultyFilter}
            isLoading={isLoadingPages}
            chapterTitle={currentChapterTitle}
            xp={xp}
            streak={streak}
            availablePages={availablePages}
            onPageChange={setCurrentPageNo}
            onOpenDeckModal={() => setSelectionStep('chapter')}
            selectedClass={selectedClass}
            selectedSubject={selectedSubject}
          />
        )}

        {viewMode === 'reel' && (
          <StorySwipeView
            key={`${selectedClass}-${selectedSubject}-${selectedChapterId}-${currentPageNo}-reel`}
            words={wordsOnCurrentPage}
            currentPageNo={currentPageNo}
            onAddXp={handleAddXp}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
          />
        )}

        {viewMode === 'flashcard' && (
          <FlashcardView
            key={`${selectedClass}-${selectedSubject}-${selectedChapterId}-${currentPageNo}-cards`}
            words={wordsOnCurrentPage}
            currentPageNo={currentPageNo}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
          />
        )}

        {viewMode === 'quiz' && (
          <QuizView
            key={`${selectedClass}-${selectedSubject}-${selectedChapterId}-${currentPageNo}-quiz`}
            words={wordsOnCurrentPage}
            currentPageNo={currentPageNo}
          />
        )}

        {viewMode === 'search' && (
          <SearchView
            searchQuery={searchQuery}
            manifest={manifest}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
            onNavigateToWord={handleNavigateToWord}
          />
        )}

        {viewMode === 'bookmarks' && (
          <BookmarksView
            bookmarkedWords={bookmarkedWordsCache}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
            onClearAll={handleClearAllBookmarks}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="lexora-footer border-t border-[#F3C6D6] dark:border-slate-800 bg-white dark:bg-slate-900 py-6 mb-16 md:mb-0 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} NCERT Unofficial Vocab • Page-Wise Explorer</p>
          <p>Class 1 to 12 Dataset • 12,441 Words</p>
        </div>
      </footer>

      {/* Mobile Sticky Bottom Navigation Bar */}
      <MobileBottomNav
        viewMode={viewMode}
        setViewMode={(v) => {
          setViewMode(v);
          if (v === 'page' && selectionStep !== 'words') {
            setSelectionStep('words');
          }
        }}
        bookmarkCount={bookmarkedIds.length}
      />

    </div>
  );
};
