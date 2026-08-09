import React from 'react';
import { BookOpen, Zap, Layers, HelpCircle, Bookmark } from 'lucide-react';
import { ViewMode } from '../types/dataset';

interface MobileBottomNavProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  bookmarkCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  viewMode,
  setViewMode,
  bookmarkCount
}) => {
  const navItemClass = (mode: ViewMode, featured = false) =>
    `mobile-dock-item ${viewMode === mode ? 'is-active' : ''} ${featured ? 'is-featured' : ''}`;

  return (
    <nav className="mobile-dock md:hidden" aria-label="Primary navigation">
      <div className="mobile-dock-inner">
        <button
          type="button"
          onClick={() => setViewMode('page')}
          className={navItemClass('page')}
          aria-current={viewMode === 'page' ? 'page' : undefined}
        >
          <span className="mobile-dock-icon"><BookOpen aria-hidden="true" /></span>
          <span>Reader</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode('flashcard')}
          className={navItemClass('flashcard')}
          aria-current={viewMode === 'flashcard' ? 'page' : undefined}
        >
          <span className="mobile-dock-icon"><Layers aria-hidden="true" /></span>
          <span>Cards</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode('reel')}
          className={navItemClass('reel', true)}
          aria-current={viewMode === 'reel' ? 'page' : undefined}
        >
          <span className="mobile-dock-icon"><Zap aria-hidden="true" /></span>
          <span>Quick learn</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode('quiz')}
          className={navItemClass('quiz')}
          aria-current={viewMode === 'quiz' ? 'page' : undefined}
        >
          <span className="mobile-dock-icon"><HelpCircle aria-hidden="true" /></span>
          <span>Quiz</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode('bookmarks')}
          className={navItemClass('bookmarks')}
          aria-current={viewMode === 'bookmarks' ? 'page' : undefined}
        >
          <span className="mobile-dock-icon mobile-bookmark-icon">
            <Bookmark aria-hidden="true" />
            {bookmarkCount > 0 && <span className="mobile-bookmark-count">{bookmarkCount}</span>}
          </span>
          <span>Saved</span>
        </button>
      </div>
    </nav>
  );
};
