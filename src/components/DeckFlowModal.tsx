import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, ChevronRight, X, AlertCircle } from 'lucide-react';
import { DatasetManifest } from '../types/dataset';

interface DeckFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  manifest: DatasetManifest | null;
  selectedClass: string;
  setSelectedClass: (c: string) => void;
  selectedSubject: string;
  setSelectedSubject: (s: string) => void;
  selectedChapterId: string;
  setSelectedChapterId: (ch: string) => void;
  setCurrentPageNo: (p: number) => void;
}

export const DeckFlowModal: React.FC<DeckFlowModalProps> = ({
  isOpen,
  onClose,
  manifest,
  selectedClass,
  setSelectedClass,
  selectedSubject,
  setSelectedSubject,
  selectedChapterId,
  setSelectedChapterId,
  setCurrentPageNo
}) => {
  // Step 1: Class, Step 2: Subject, Step 3: Chapter
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [tempClass, setTempClass] = useState<string>(selectedClass);
  const [tempSubject, setTempSubject] = useState<string>(selectedSubject);

  // Reset step to 1 ONLY when the modal transitions from closed to open
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setTempClass(selectedClass);
      setTempSubject(selectedSubject);
    }
  }, [isOpen]); // IMPORTANT: Do NOT include selectedClass/selectedSubject here!

  if (!isOpen || !manifest) return null;

  const allClasses = ['class_1', 'class_2', 'class_3', 'class_4', 'class_5', 'class_6', 'class_7', 'class_8', 'class_9', 'class_10', 'class_11', 'class_12'];

  const activeClassObj = manifest.classes[tempClass] || manifest.classes['class_10'];
  const availableSubjects = activeClassObj
    ? Object.keys(activeClassObj.subjects)
    : ['history', 'political_science', 'english', 'geography', 'economics'];

  const activeSubjectObj = activeClassObj?.subjects[tempSubject];
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

  const [modalNotice, setModalNotice] = useState<string | null>(null);

  const handleSelectClass = (cId: string) => {
    if (!isClassActive(cId)) {
      const num = cId.replace('class_', '');
      setModalNotice(`🔒 Class ${num} dataset is Coming Soon! Class 10 (History & Civics) dataset is currently live with 12,441+ words.`);
      return;
    }
    setTempClass(cId);
    setSelectedClass(cId);
    
    // Auto-select first active subject
    const subjObj = manifest.classes[cId]?.subjects || {};
    const activeSubjKey = Object.keys(subjObj).find(s => Object.keys(subjObj[s].chapters || {}).length > 0) || 'history';
    setTempSubject(activeSubjKey);
    setSelectedSubject(activeSubjKey);
    
    // Advance to Step 2 (Choose Subject)
    setStep(2);
  };

  const handleSelectSubject = (sId: string) => {
    if (!isSubjectActive(tempClass, sId)) {
      const subjName = getSubjectName(sId);
      const num = tempClass.replace('class_', '');
      setModalNotice(`🔒 ${subjName} for Class ${num} is Coming Soon! Please choose an active subject like History or Civics.`);
      return;
    }
    setTempSubject(sId);
    setSelectedSubject(sId);
    
    // Auto select first chapter if available
    const chapKeys = Object.keys(manifest.classes[tempClass]?.subjects[sId]?.chapters || {});
    if (chapKeys.length > 0) {
      setSelectedChapterId(chapKeys[0]);
    }
    
    // Advance to Step 3 (Choose Chapter)
    setStep(3);
  };

  const handleSelectChapter = (chId: string) => {
    setSelectedChapterId(chId);
    
    // Find first page of selected chapter
    const chapObj = manifest.classes[tempClass]?.subjects[tempSubject]?.chapters[chId];
    if (chapObj && chapObj.pages && chapObj.pages.length > 0) {
      setCurrentPageNo(chapObj.pages[0].pageNo);
    }
    
    onClose();
  };

  const getSubjectName = (key: string) => {
    if (key === 'political_science') return 'Civics / Political Science';
    return activeClassObj?.subjects[key]?.name || key.replace(/_/g, ' ').toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#FFF5F8] dark:bg-slate-900 rounded-3xl border-2 border-[#F3C6D6] dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Coming Soon Notice Modal Inside Step Modal */}
        {modalNotice && (
          <div className="absolute inset-0 z-30 bg-black/70 backdrop-blur-xs flex items-center justify-center p-6 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 text-center space-y-4 max-w-sm border border-amber-200 dark:border-amber-900 shadow-2xl">
              <div className="text-4xl">🔒</div>
              <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">Dataset Coming Soon!</h3>
              <p className="font-sans text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{modalNotice}</p>
              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => {
                    setModalNotice(null);
                    setTempClass('class_10');
                    setSelectedClass('class_10');
                    setTempSubject('history');
                    setSelectedSubject('history');
                    setStep(2);
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#C2185B] text-white font-sans text-xs font-bold shadow-md cursor-pointer"
                >
                  Go to Class 10 (Live)
                </button>
                <button
                  onClick={() => setModalNotice(null)}
                  className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-sans text-xs font-bold cursor-pointer"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="px-6 py-4 border-b border-[#F3C6D6] dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[#C2185B] text-white flex items-center justify-center font-black text-xs shadow-md">
              <BookOpen className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[11px] font-bold tracking-widest text-[#C2185B] dark:text-pink-400 uppercase">
                VOCABULARY BUILDER
              </span>
              <h2 className="text-sm font-extrabold text-[#7A0F35] dark:text-white leading-tight">
                {step === 1 && 'Step 1: Choose Class'}
                {step === 2 && `Step 2: Choose Subject (Class ${tempClass.replace('class_', '')})`}
                {step === 3 && `Step 3: Choose Chapter (${tempClass.replace('class_', '')} · ${tempSubject.replace('_', ' ')})`}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            aria-label="Close selector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* SCREEN 1: CLASS SELECTOR */}
          {step === 1 && (
            <div className="space-y-5 text-center">
              <div className="space-y-1">
                <h1 className="text-3xl font-serif font-bold text-[#7A0F35] dark:text-pink-300">
                  Choose Your Class
                </h1>
                <p className="text-sm font-sans text-[#8A4A63] dark:text-slate-400">
                  Class 10 & Class 9 datasets live. Other classes coming soon!
                </p>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-w-md mx-auto">
                {allClasses.map((cId) => {
                  const num = cId.replace('class_', '');
                  const isSelected = tempClass === cId;
                  const active = isClassActive(cId);

                  return (
                    <button
                      key={cId}
                      onClick={() => handleSelectClass(cId)}
                      className={`relative group p-3.5 sm:p-4 rounded-2xl border-2 text-center transition-all duration-200 cursor-pointer ${
                        isSelected && active
                          ? 'bg-[#C2185B] text-white border-[#C2185B] shadow-lg shadow-pink-500/30 scale-105'
                          : active
                          ? 'bg-white dark:bg-slate-800 border-[#F3C6D6] dark:border-slate-700 hover:border-[#C2185B] hover:bg-[#FFEAF2] dark:hover:bg-slate-750'
                          : 'bg-slate-100 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-75 hover:opacity-100'
                      }`}
                    >
                      {!active && (
                        <span className="absolute top-1.5 right-1.5 text-[10px]" title="Coming Soon">
                          🔒
                        </span>
                      )}
                      <span className={`block text-2xl font-bold font-serif ${isSelected && active ? 'text-white' : active ? 'text-[#C2185B] dark:text-pink-400' : 'text-slate-400 dark:text-slate-500'}`}>
                        {num}
                      </span>
                      <span className={`block text-[9px] font-sans font-bold uppercase tracking-wider mt-0.5 ${isSelected && active ? 'text-pink-100' : active ? 'text-[#8A4A63] dark:text-slate-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {active ? `Class ${num}` : 'SOON'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* SCREEN 2: SUBJECT SELECTOR */}
          {step === 2 && (
            <div className="space-y-5 max-w-md mx-auto">
              <div className="text-center space-y-1">
                <h1 className="text-3xl font-serif font-bold text-[#7A0F35] dark:text-pink-300">
                  Choose a Subject
                </h1>
                <p className="text-sm font-sans text-[#8A4A63] dark:text-slate-400">
                  Class {tempClass.replace('class_', '')} Textbooks
                </p>
              </div>

              <div className="space-y-3">
                {availableSubjects.map((sKey) => {
                  const isSelected = tempSubject === sKey;
                  const subjName = getSubjectName(sKey);
                  const active = isSubjectActive(tempClass, sKey);
                  const chapterCount = activeClassObj?.subjects[sKey]
                    ? Object.keys(activeClassObj.subjects[sKey].chapters).length
                    : 0;

                  return (
                    <button
                      key={sKey}
                      onClick={() => handleSelectSubject(sKey)}
                      className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between text-left transition-all cursor-pointer ${
                        isSelected && active
                          ? 'bg-[#C2185B] text-white border-[#C2185B] shadow-md'
                          : active
                          ? 'bg-white dark:bg-slate-800 border-[#F3C6D6] dark:border-slate-700 hover:border-[#C2185B] hover:bg-[#FFEAF2] dark:hover:bg-slate-750'
                          : 'bg-slate-100 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div>
                        <h3 className={`text-base font-serif font-bold flex items-center gap-2 ${isSelected && active ? 'text-white' : active ? 'text-[#7A0F35] dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                          {!active && <span>🔒</span>}
                          {subjName}
                        </h3>
                        <p className={`text-xs font-sans font-medium ${isSelected && active ? 'text-pink-100' : active ? 'text-[#8A4A63] dark:text-slate-400' : 'text-amber-600 dark:text-amber-400'}`}>
                          {active ? `${chapterCount} Chapters available` : '🔒 Coming Soon'}
                        </p>
                      </div>
                      {active ? (
                        <ChevronRight className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-[#C2185B] dark:text-pink-400'}`} />
                      ) : (
                        <span className="font-sans text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
                          Coming Soon
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1 text-sm font-sans font-bold text-[#C2185B] dark:text-pink-400 hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Change Class</span>
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 3: CHAPTER SELECTOR */}
          {step === 3 && (
            <div className="space-y-5 max-w-md mx-auto">
              <div className="text-center space-y-1">
                <h1 className="text-3xl font-serif font-bold text-[#7A0F35] dark:text-pink-300">
                  Choose a Chapter
                </h1>
                <p className="text-sm font-sans text-[#8A4A63] dark:text-slate-400">
                  Class {tempClass.replace('class_', '')} · {tempSubject.replace('_', ' ').toUpperCase()}
                </p>
              </div>

              {availableChapters.length > 0 ? (
                <div className="space-y-3">
                  {availableChapters.map((chapter, i) => {
                    const isSelected = selectedChapterId === chapter.id;
                    const formattedNum = String(i + 1).padStart(2, '0');

                    return (
                      <button
                        key={chapter.id}
                        onClick={() => handleSelectChapter(chapter.id)}
                        className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 text-left transition-all ${
                          isSelected
                            ? 'bg-[#C2185B] text-white border-[#C2185B] shadow-md'
                            : 'bg-white dark:bg-slate-800 border-[#F3C6D6] dark:border-slate-700 hover:border-[#C2185B] hover:bg-[#FFEAF2] dark:hover:bg-slate-750'
                        }`}
                      >
                        <span className={`text-xl font-bold font-serif min-w-[28px] ${isSelected ? 'text-white' : 'text-[#C2185B] dark:text-pink-400'}`}>
                          {formattedNum}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-base font-serif font-bold truncate ${isSelected ? 'text-white' : 'text-[#7A0F35] dark:text-white'}`}>
                            {chapter.title.replace(/^Chapter \d+:\s*/, '')}
                          </h3>
                          <p className={`text-xs font-sans ${isSelected ? 'text-pink-100' : 'text-[#8A4A63] dark:text-slate-400'}`}>
                            {chapter.pageCount} Pages • {chapter.wordCount} Words
                          </p>
                        </div>
                        <ChevronRight className={`w-5 h-5 shrink-0 ${isSelected ? 'text-white' : 'text-[#C2185B] dark:text-pink-400'}`} />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-[#F3C6D6] dark:border-slate-700 space-y-3">
                  <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                  <p className="font-serif font-bold text-[#7A0F35] dark:text-white text-base">
                    Class {tempClass.replace('class_', '')} {tempSubject.replace('_', ' ').toUpperCase()} dataset is being built!
                  </p>
                  <p className="text-xs text-[#8A4A63] dark:text-slate-400 max-w-xs mx-auto">
                    Currently Class 10 History & Civics dataset (12,441 words across 225 pages) is live.
                  </p>
                  <button
                    onClick={() => {
                      handleSelectClass('class_10');
                      handleSelectSubject('history');
                      setStep(3);
                    }}
                    className="inline-block mt-2 px-4 py-2 rounded-xl bg-[#C2185B] text-white text-xs font-bold font-sans shadow-md"
                  >
                    Open Active Class 10 Dataset ►
                  </button>
                </div>
              )}

              <div className="text-center pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-1 text-sm font-sans font-bold text-[#C2185B] dark:text-pink-400 hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Change Subject</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
