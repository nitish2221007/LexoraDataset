import React, { useState, useEffect } from 'react';
import { WordItem } from '../types/dataset';
import { HelpCircle, CheckCircle, XCircle, Trophy, RotateCcw, Volume2, Sparkles } from 'lucide-react';
import { speakWord } from '../lib/datasetLoader';
import confetti from 'canvas-confetti';

interface QuizViewProps {
  words: WordItem[];
  currentPageNo: number;
}

interface Question {
  word: WordItem;
  options: string[];
  correctOptionIndex: number;
}

export const QuizView: React.FC<QuizViewProps> = ({ words, currentPageNo }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isQuizComplete, setIsQuizComplete] = useState(false);

  useEffect(() => {
    if (!words || words.length === 0) return;

    // Generate questions for all words on the page
    const generated: Question[] = words.map((targetWord) => {
      const otherMeanings = words
        .filter((w) => w.id !== targetWord.id && w.meaning)
        .map((w) => w.meaning);

      // Shuffle other meanings to pick 3 distractors
      const shuffledDistractors = [...otherMeanings].sort(() => Math.random() - 0.5);
      const distractors = shuffledDistractors.slice(0, Math.min(3, shuffledDistractors.length));

      // Build options array
      const options = [targetWord.meaning, ...distractors].sort(() => Math.random() - 0.5);
      const correctOptionIndex = options.indexOf(targetWord.meaning);

      return {
        word: targetWord,
        options,
        correctOptionIndex
      };
    });

    setQuestions(generated);
    setCurrentQIndex(0);
    setScore(0);
    setSelectedOption(null);
    setIsQuizComplete(false);
  }, [words, currentPageNo]);

  if (!words || words.length === 0 || questions.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Not enough words on Page {currentPageNo} to generate quiz questions.
        </h3>
      </div>
    );
  }

  const currentQ = questions[currentQIndex];

  const handleSelectOption = (index: number) => {
    if (selectedOption !== null) return; // Prevent double clicking

    setSelectedOption(index);
    if (index === currentQ.correctOptionIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
    } else {
      setIsQuizComplete(true);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  };

  const handleRestart = () => {
    setCurrentQIndex(0);
    setScore(0);
    setSelectedOption(null);
    setIsQuizComplete(false);
  };

  if (isQuizComplete) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-xl">
          <Trophy className="w-10 h-10" />
        </div>

        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">Quiz Completed!</h2>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Page {currentPageNo} Vocabulary Test Results
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md space-y-2">
          <div className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {score} / {questions.length}
          </div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Accuracy Score: {percentage}%
          </div>
        </div>

        <button
          onClick={handleRestart}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-extrabold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/25"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Retake Quiz</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      
      {/* Quiz Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-600" />
            <span>Page {currentPageNo} Quiz</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Question {currentQIndex + 1} of {questions.length} • Score: {score}
          </p>
        </div>

        <div className="w-32 bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-indigo-600 h-full transition-all duration-300"
            style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
            Select the correct meaning
          </span>
          <div className="flex items-center gap-3 mt-3">
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              "{currentQ.word.word}"
            </h3>
            <button
              onClick={() => speakWord(currentQ.word.word)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-all"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Multiple Choice Options */}
        <div className="space-y-3">
          {currentQ.options.map((opt, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === currentQ.correctOptionIndex;
            let optionStyle = 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-indigo-400';

            if (selectedOption !== null) {
              if (isCorrect) {
                optionStyle = 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold';
              } else if (isSelected && !isCorrect) {
                optionStyle = 'bg-rose-50 dark:bg-rose-950/80 border-rose-500 text-rose-900 dark:text-rose-200 font-bold';
              } else {
                optionStyle = 'opacity-50 border-slate-200 dark:border-slate-800';
              }
            }

            return (
              <button
                key={idx}
                disabled={selectedOption !== null}
                onClick={() => handleSelectOption(idx)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-3 text-sm font-semibold ${optionStyle}`}
              >
                <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs shrink-0 font-bold">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="flex-1 leading-snug">{opt}</span>
                {selectedOption !== null && isCorrect && (
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                )}
                {selectedOption !== null && isSelected && !isCorrect && (
                  <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {/* Footer Next Button */}
        {selectedOption !== null && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-extrabold text-sm hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20"
            >
              {currentQIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question ►'}
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
