import React from 'react';
import { DatasetManifest } from '../types/dataset';

interface DeckSelectionViewProps {
  step: 'class' | 'subject' | 'chapter';
  setStep: (s: 'class' | 'subject' | 'chapter' | 'words') => void;
  manifest: DatasetManifest | null;
  selectedClass: string;
  setSelectedClass: (c: string) => void;
  selectedSubject: string;
  setSelectedSubject: (s: string) => void;
  selectedChapterId: string;
  setSelectedChapterId: (ch: string) => void;
  setCurrentPageNo: (p: number) => void;
}

export const DeckSelectionView: React.FC<DeckSelectionViewProps> = ({
  step,
  setStep,
  manifest,
  selectedClass,
  setSelectedClass,
  selectedSubject,
  setSelectedSubject,
  selectedChapterId,
  setSelectedChapterId,
  setCurrentPageNo
}) => {
  if (!manifest) return null;

  const allClasses = [
    'class_1', 'class_2', 'class_3', 'class_4',
    'class_5', 'class_6', 'class_7', 'class_8',
    'class_9', 'class_10', 'class_11', 'class_12'
  ];

  const activeClassObj = manifest.classes[selectedClass] || manifest.classes['class_10'];
  const availableSubjects = activeClassObj
    ? Object.keys(activeClassObj.subjects)
    : ['history', 'political_science', 'english', 'geography', 'economics'];

  const activeSubjectObj = activeClassObj?.subjects[selectedSubject];
  const availableChapters = activeSubjectObj ? Object.values(activeSubjectObj.chapters) : [];

  const isClassActive = (cId: string) => {
    const classObj = manifest.classes[cId];
    if (!classObj?.subjects) return false;
    let totalChaps = 0;
    Object.values(classObj.subjects).forEach((s) => {
      totalChaps += Object.keys(s.chapters || {}).length;
    });
    return totalChaps > 0;
  };

  const isSubjectActive = (cId: string, sId: string) => {
    const subjObj = manifest.classes[cId]?.subjects[sId];
    if (!subjObj) return false;
    return Object.keys(subjObj.chapters || {}).length > 0;
  };

  const [comingSoonNotice, setComingSoonNotice] = React.useState<string | null>(null);

  const handleSelectClass = (cId: string) => {
    if (!isClassActive(cId)) {
      const num = cId.replace('class_', '');
      setComingSoonNotice(`🔒 Class ${num} dataset is Coming Soon! Currently, Class 10 (History & Civics) dataset is live with 12,441+ page-wise word meanings.`);
      return;
    }
    setSelectedClass(cId);
    
    // Auto-select first active subject
    const subjObj = manifest.classes[cId]?.subjects || {};
    const activeSubjKey = Object.keys(subjObj).find(s => Object.keys(subjObj[s].chapters || {}).length > 0) || 'history';
    setSelectedSubject(activeSubjKey);
    
    setStep('subject');
  };

  const handleSelectSubject = (sId: string) => {
    if (!isSubjectActive(selectedClass, sId)) {
      const subjName = getSubjectName(sId);
      const num = selectedClass.replace('class_', '');
      setComingSoonNotice(`🔒 ${subjName} for Class ${num} is Coming Soon! Please choose an active subject like History or Civics.`);
      return;
    }
    setSelectedSubject(sId);
    
    // Auto select first chapter if available
    const chapKeys = Object.keys(manifest.classes[selectedClass]?.subjects[sId]?.chapters || {});
    if (chapKeys.length > 0) {
      setSelectedChapterId(chapKeys[0]);
    }
    
    setStep('chapter');
  };

  const handleSelectChapter = (chId: string) => {
    setSelectedChapterId(chId);
    
    // Find first page of selected chapter
    const chapObj = manifest.classes[selectedClass]?.subjects[selectedSubject]?.chapters[chId];
    if (chapObj && chapObj.pages && chapObj.pages.length > 0) {
      setCurrentPageNo(chapObj.pages[0].pageNo);
    }
    
    setStep('words');
  };

  const getSubjectName = (key: string) => {
    if (key === 'political_science') return 'Civics / Political Science';
    return activeClassObj?.subjects[key]?.name || key.replace(/_/g, ' ').toUpperCase();
  };

  const classNum = selectedClass.replace('class_', '');
  const subjectNameFormatted = selectedSubject.replace('_', ' ').toUpperCase();

  return (
    <div className="min-h-screen bg-[#FFF5F8] dark:bg-slate-950 text-[#2A1420] dark:text-slate-100 font-serif px-5 py-10 sm:py-16 transition-colors duration-200">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Brand Header */}
        <div className="text-center font-sans font-bold text-xs sm:text-sm tracking-[0.14em] uppercase text-[#C2185B] dark:text-pink-400">
          VOCABULARY BUILDER
        </div>

        {/* Coming Soon Alert Modal */}
        {comingSoonNotice && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 border border-amber-200 dark:border-amber-900 shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl mx-auto">
                🔒
              </div>
              <h3 className="text-center text-xl font-bold font-serif text-slate-900 dark:text-white">
                Dataset Coming Soon!
              </h3>
              <p className="text-center font-sans text-sm text-slate-600 dark:text-slate-300">
                {comingSoonNotice}
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setComingSoonNotice(null);
                    setSelectedClass('class_10');
                    setSelectedSubject('history');
                    setStep('subject');
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#C2185B] text-white font-sans text-xs font-bold shadow-md cursor-pointer hover:bg-[#a0134a]"
                >
                  Open Class 10 History (Live)
                </button>
                <button
                  type="button"
                  onClick={() => setComingSoonNotice(null)}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-sans text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 1: CHOOSE CLASS */}
        {step === 'class' && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center space-y-3">
              <h1 className="text-4xl sm:text-5xl font-serif font-bold text-[#7A0F35] dark:text-pink-200 tracking-tight">
                Choose Your Class
              </h1>
              <p className="font-sans text-base sm:text-lg text-[#8A4A63] dark:text-slate-400 max-w-md mx-auto">
                Class 10 (History & Civics) live. Other classes coming soon!
              </p>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 max-w-xl mx-auto">
              {allClasses.map((cId) => {
                const num = cId.replace('class_', '');
                const isSelected = selectedClass === cId;
                const active = isClassActive(cId);

                return (
                  <button
                    key={cId}
                    onClick={() => handleSelectClass(cId)}
                    className={`relative p-5 sm:p-6 rounded-xl border-2 text-center transition-all duration-200 cursor-pointer ${
                      isSelected && active
                        ? 'bg-[#C2185B] text-white border-[#C2185B] shadow-lg shadow-pink-500/25 scale-105'
                        : active
                        ? 'bg-white dark:bg-slate-900 border-[#F3C6D6] dark:border-slate-800 hover:border-[#C2185B] hover:bg-[#FFEAF2] dark:hover:bg-slate-850'
                        : 'bg-slate-100 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-75 hover:opacity-100'
                    }`}
                  >
                    {!active && (
                      <span className="absolute top-2 right-2 text-xs" title="Coming Soon">
                        🔒
                      </span>
                    )}

                    <span className={`block text-3xl sm:text-4xl font-serif font-bold ${isSelected && active ? 'text-white' : active ? 'text-[#C2185B] dark:text-pink-400' : 'text-slate-400 dark:text-slate-500'}`}>
                      {num}
                    </span>
                    <span className={`block text-[10px] font-sans font-bold uppercase tracking-widest mt-1 ${isSelected && active ? 'text-pink-100' : active ? 'text-[#8A4A63] dark:text-slate-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {active ? `CLASS ${num}` : 'COMING SOON'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* SCREEN 2: CHOOSE SUBJECT */}
        {step === 'subject' && (
          <div className="space-y-8 animate-fade-in max-w-md mx-auto">
            <div className="text-center space-y-3">
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#7A0F35] dark:text-pink-200 tracking-tight">
                Choose a Subject
              </h1>
              <p className="font-sans text-base sm:text-lg font-semibold text-[#8A4A63] dark:text-slate-400">
                Class {classNum}
              </p>
            </div>

            <div className="space-y-3">
              {availableSubjects.map((sKey) => {
                const isSelected = selectedSubject === sKey;
                const subjName = getSubjectName(sKey);
                const active = isSubjectActive(selectedClass, sKey);

                return (
                  <button
                    key={sKey}
                    onClick={() => handleSelectSubject(sKey)}
                    className={`w-full p-4 sm:p-5 rounded-xl border-2 flex items-center justify-between text-left transition-all cursor-pointer ${
                      isSelected && active
                        ? 'bg-[#C2185B] text-white border-[#C2185B] shadow-md'
                        : active
                        ? 'bg-white dark:bg-slate-900 border-[#F3C6D6] dark:border-slate-800 hover:border-[#C2185B] hover:bg-[#FFEAF2] dark:hover:bg-slate-850'
                        : 'bg-slate-100 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <span className={`text-base sm:text-lg font-serif font-bold flex items-center gap-2 ${isSelected && active ? 'text-white' : active ? 'text-[#7A0F35] dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                      {!active && <span>🔒</span>}
                      {subjName}
                    </span>
                    {active ? (
                      <span className={`font-sans text-xl font-bold ${isSelected ? 'text-white' : 'text-[#C2185B] dark:text-pink-400'}`}>
                        &rarr;
                      </span>
                    ) : (
                      <span className="font-sans text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
                        Coming Soon
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="text-center pt-4">
              <button
                onClick={() => setStep('class')}
                className="font-sans text-sm font-bold text-[#C2185B] dark:text-pink-400 hover:underline bg-transparent border-0 cursor-pointer"
              >
                &larr; Change class
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 3: CHOOSE CHAPTER */}
        {step === 'chapter' && (
          <div className="space-y-8 animate-fade-in max-w-md mx-auto">
            <div className="text-center space-y-3">
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#7A0F35] dark:text-pink-200 tracking-tight">
                Choose a Chapter
              </h1>
              <p className="font-sans text-base sm:text-lg font-semibold text-[#8A4A63] dark:text-slate-400">
                Class {classNum} · {subjectNameFormatted}
              </p>
            </div>

            {availableChapters.length > 0 ? (
              <div className="space-y-3">
                {availableChapters.map((chapter, i) => {
                  const isSelected = selectedChapterId === chapter.id;
                  const formattedNum = String(i + 1).padStart(2, '0');
                  const chapterTitleClean = chapter.title.replace(/^Chapter \d+:\s*/, '');

                  return (
                    <button
                      key={chapter.id}
                      onClick={() => handleSelectChapter(chapter.id)}
                      className={`w-full p-4 sm:p-5 rounded-xl border-2 flex items-center gap-4 text-left transition-all ${
                        isSelected
                          ? 'bg-[#C2185B] text-white border-[#C2185B] shadow-md'
                          : 'bg-white dark:bg-slate-900 border-[#F3C6D6] dark:border-slate-800 hover:border-[#C2185B] hover:bg-[#FFEAF2] dark:hover:bg-slate-850'
                      }`}
                    >
                      <span className={`text-xl sm:text-2xl font-serif font-bold min-w-[36px] ${isSelected ? 'text-white' : 'text-[#C2185B] dark:text-pink-400'}`}>
                        {formattedNum}
                      </span>
                      <span className={`text-base sm:text-lg font-serif font-bold flex-1 truncate ${isSelected ? 'text-white' : 'text-[#7A0F35] dark:text-white'}`}>
                        {chapterTitleClean}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-xl border-2 border-dashed border-[#F3C6D6] dark:border-slate-800 space-y-3">
                <p className="font-serif font-bold text-[#7A0F35] dark:text-pink-300 text-lg">
                  No chapters available for Class {classNum} {subjectNameFormatted} yet.
                </p>
                <p className="font-sans text-xs text-[#8A4A63] dark:text-slate-400">
                  Class 10 History & Civics dataset (12,441 words across 225 pages) is live.
                </p>
                <button
                  onClick={() => {
                    setSelectedClass('class_10');
                    setSelectedSubject('history');
                    setStep('chapter');
                  }}
                  className="mt-2 px-5 py-2.5 rounded-lg bg-[#C2185B] text-white font-sans text-xs font-bold shadow-md cursor-pointer"
                >
                  Open Active Class 10 Dataset &rarr;
                </button>
              </div>
            )}

            <div className="text-center pt-4">
              <button
                onClick={() => setStep('subject')}
                className="font-sans text-sm font-bold text-[#C2185B] dark:text-pink-400 hover:underline bg-transparent border-0 cursor-pointer"
              >
                &larr; Change subject
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
