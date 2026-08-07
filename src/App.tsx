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
  
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [bookmarkedWordsCache, setBookmarkedWordsCache] = useState<{ word: WordItem; pageNo?: number }[]>([]);

  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // 1. Parse initial URL query parameters for SEO Deep Linking (e.g. ?c=10&s=history&ch=chapter_1&p=3)
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
      }
    });
  }, []);

  // 2. Sync URL search params and dynamic SEO metadata whenever navigation state changes
  useEffect(() => {
    if (!manifest) return;

    const classNum = selectedClass.replace('class_', '');
    const chapterTitle = manifest.classes[selectedClass]?.subjects[selectedSubject]?.chapters[selectedChapterId]?.title || `Chapter ${selectedChapterId.replace('chapter_', '')}`;
    const subjectName = selectedSubject.replace('_', ' ').toUpperCase();

    // Build SEO friendly Page Title & Description
    const pageTitle = `NCERT Class ${classNum} ${subjectName} ${chapterTitle} - Page ${currentPageNo} Word Meanings | Lexora`;
    const pageDesc = `Complete vocabulary, pronunciations, simple & funny explanations for NCERT Class ${classNum} ${subjectName} ${chapterTitle} Page ${currentPageNo}. Free page-wise word meaning explorer.`;

    document.title = pageTitle;

    // Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', pageDesc);

    // Sync URL without page reload for clean SEO links
    const newUrl = `${window.location.pathname}?c=${classNum}&s=${selectedSubject}&ch=${selectedChapterId}&p=${currentPageNo}`;
    window.history.replaceState(null, '', newUrl);

    // Inject JSON-LD Educational Structured Data for Google Search
    let scriptTag = document.getElementById('json-ld-schema');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'json-ld-schema';
      scriptTag.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptTag);
    }

    const schemaData = {
      "@context": "https://schema.org",
      "@type": "EducationalResource",
      "name": pageTitle,
      "description": pageDesc,
      "educationalLevel": `Class ${classNum}`,
      "learningResourceType": "Vocabulary Glossary",
      "inLanguage": "en"
    };

    scriptTag.textContent = JSON.stringify(schemaData);
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
      // Don't flip page if user is typing in search input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (viewMode !== 'page' && viewMode !== 'flashcard') return;

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
  }, [chapterPages, currentPageNo, viewMode]);

  // Bookmarking toggle handler
  const handleToggleBookmark = (wordId: string) => {
    const updatedIds = toggleBookmark(wordId);
    setBookmarkedIds(updatedIds);
  };

  const handleClearAllBookmarks = () => {
    localStorage.removeItem('lexora_bookmarked_words_v1');
    setBookmarkedIds([]);
  };

  // Find active page data
  const activePageData = chapterPages.find((p) => p.page_no === currentPageNo);
  const wordsOnCurrentPage = activePageData?.words || [];
  const availablePages = chapterPages.map((p) => p.page_no);

  // Active chapter title for display
  const currentChapterTitle = manifest?.classes[selectedClass]?.subjects[selectedSubject]?.chapters[selectedChapterId]?.title;

  // Build cache of bookmarked words when bookmarkedIds change
  useEffect(() => {
    if (!manifest) return;
    const result: { word: WordItem; pageNo?: number }[] = [];

    // Check words in loaded chapter pages first
    chapterPages.forEach((pg) => {
      pg.words.forEach((w) => {
        if (bookmarkedIds.includes(w.id)) {
          result.push({ word: w, pageNo: pg.page_no });
        }
      });
    });

    // Also check light index for remaining bookmarked items not currently loaded
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

  // Navigate to exact page from Search View
  const handleNavigateToWord = (classId: string, subjectId: string, chapterId: string, pageNo: number) => {
    setSelectedClass(classId);
    setSelectedSubject(subjectId);
    setSelectedChapterId(chapterId);
    setCurrentPageNo(pageNo);
    setViewMode('page');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 selection:bg-indigo-500 selection:text-white">
      
      {/* Header Bar */}
      <Header
        viewMode={viewMode}
        setViewMode={setViewMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        bookmarkCount={bookmarkedIds.length}
        totalWords={manifest?.allWordsIndex.length || 12441}
      />

      {/* Page Navigator (Active in Page, Flashcard, and Quiz modes) */}
      {(viewMode === 'page' || viewMode === 'flashcard' || viewMode === 'quiz') && (
        <PageNavigator
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
        />
      )}

      {/* View Switcher Container */}
      <main className="flex-1 pb-16">
        {viewMode === 'page' && (
          <PageView
            currentPageNo={currentPageNo}
            words={wordsOnCurrentPage}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
            difficultyFilter={difficultyFilter}
            isLoading={isLoadingPages}
            chapterTitle={currentChapterTitle}
          />
        )}

        {viewMode === 'flashcard' && (
          <FlashcardView
            words={wordsOnCurrentPage}
            currentPageNo={currentPageNo}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
          />
        )}

        {viewMode === 'quiz' && (
          <QuizView
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
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 mb-16 md:mb-0 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} Lexora • Page-Wise Word Meaning Explorer</p>
          <p>Class 10 History & Political Science Dataset • 12,441 Words • 225 Pages</p>
        </div>
      </footer>

      {/* Mobile Sticky Bottom Navigation Bar */}
      <MobileBottomNav
        viewMode={viewMode}
        setViewMode={setViewMode}
        bookmarkCount={bookmarkedIds.length}
      />

    </div>
  );
};
