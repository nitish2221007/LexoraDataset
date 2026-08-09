export interface WordExample {
  type: 'normal' | 'funny' | string;
  text: string;
}

export interface MediumDetail {
  pronunciation?: string;
  simple_explanation?: string;
  funny_explanation?: string;
  examples?: WordExample[];
  synonyms?: string[];
  antonyms?: string[];
}

export interface WordItem {
  id: string;
  word: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard' | string;
  meaning: string;
  medium?: MediumDetail;
}

export interface PageData {
  page_no: number;
  words: WordItem[];
}

export interface ManifestPageInfo {
  pageNo: number;
  wordCount: number;
}

export interface ManifestChapter {
  id: string;
  title: string;
  file: string;
  pageCount: number;
  wordCount: number;
  pages: ManifestPageInfo[];
}

export interface ManifestSubject {
  id: string;
  name: string;
  chapters: Record<string, ManifestChapter>;
}

export interface ManifestClass {
  id: string;
  name: string;
  subjects: Record<string, ManifestSubject>;
}

export interface IndexedWord {
  id: string;
  word: string;
  meaning: string;
  difficulty: string;
  classId: string;
  subjectId: string;
  chapterId: string;
  pageNo: number;
}

export interface DatasetManifest {
  generatedAt: string;
  classes: Record<string, ManifestClass>;
  allWordsIndex: IndexedWord[];
}

export type ViewMode = 'page' | 'reel' | 'flashcard' | 'quiz' | 'bookmarks' | 'search';
