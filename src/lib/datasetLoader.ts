import { DatasetManifest, PageData, WordItem } from '../types/dataset';

// Cache for loaded chapter json data
const chapterCache: Record<string, PageData[]> = {};
let cachedManifest: DatasetManifest | null = null;

/**
 * Fetch the dataset manifest containing catalog of classes, subjects, chapters, and word index.
 */
export async function getDatasetManifest(): Promise<DatasetManifest> {
  if (cachedManifest) return cachedManifest;

  try {
    const res = await fetch('/dataset-manifest.json');
    if (!res.ok) throw new Error('Failed to load dataset manifest');
    const data: DatasetManifest = await res.json();
    cachedManifest = data;
    return data;
  } catch (err) {
    console.error('Error fetching manifest:', err);
    throw err;
  }
}

/**
 * Load words for a specific chapter file path.
 */
export async function getChapterPages(filePath: string): Promise<PageData[]> {
  const normalizedPath = filePath.replace(/\\/g, '/');
  if (chapterCache[normalizedPath]) {
    return chapterCache[normalizedPath];
  }

  try {
    const res = await fetch(`/dataset/${normalizedPath}`);
    if (!res.ok) throw new Error(`Failed to load dataset at ${filePath}`);
    const data: PageData[] = await res.json();
    chapterCache[normalizedPath] = data;
    return data;
  } catch (err) {
    console.error(`Error loading chapter ${filePath}:`, err);
    return [];
  }
}

/**
 * Text-to-Speech audio reader using browser Web Speech API.
 */
export function speakWord(word: string, rate: number = 0.9) {
  if (!('speechSynthesis' in window)) {
    console.warn('Text-to-speech is not supported in this browser.');
    return;
  }

  window.speechSynthesis.cancel(); // Stop ongoing speech
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.rate = rate;
  utterance.lang = 'en-US';
  window.speechSynthesis.speak(utterance);
}

/**
 * Manage Saved / Bookmarked Words in localStorage
 */
const BOOKMARKS_KEY = 'lexora_bookmarked_words_v1';

export function getBookmarkedIds(): string[] {
  try {
    const saved = localStorage.getItem(BOOKMARKS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function toggleBookmark(wordId: string): string[] {
  const current = getBookmarkedIds();
  const next = current.includes(wordId)
    ? current.filter(id => id !== wordId)
    : [...current, wordId];
  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next));
  } catch (e) {
    console.error('Error saving bookmarks', e);
  }
  return next;
}
