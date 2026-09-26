// src/components/QuizModal.jsx - Quiz Generator & Evaluation (FR6)
import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { X, CheckCircle2, AlertCircle, HelpCircle, Trophy, Sparkles, RefreshCw, BarChart2 } from 'lucide-react';

export default function QuizModal({ isOpen, onClose, defaultTopic = "Electromagnetism & Waves" }) {
  const { authFetch } = useAuth();
  const [topicInput, setTopicInput] = useState(defaultTopic);
  const [difficulty, setDifficulty] = useState('Medium'); // 'Easy' | 'Medium' | 'Hard'
  const [loading, setLoading] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [resultData, setResultData] = useState(null);

  useEffect(() => {
    if (isOpen && !currentQuiz) {
      handleGenerateQuiz();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // FR6 Step 1: Generate Subject-wise MCQs with difficulty level
  const handleGenerateQuiz = async () => {
    setLoading(true);
    setSubmitted(false);
    setResultData(null);
    setSelectedAnswers({});

    try {
      const res = await authFetch(`${API_BASE_URL}/quiz/generate`, {
        method: 'POST',
        body: JSON.stringify({
          topic: topicInput || 'Physics & Calculus',
          difficulty: difficulty
        })
      });
      const data = await res.json();
      if (data.quiz) {
        setCurrentQuiz(data.quiz);
      }
    } catch (err) {
      console.warn('Quiz generate notice:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (qIndex, optionIndex) => {
    if (submitted) return;
    setSelectedAnswers({ ...selectedAnswers, [qIndex]: optionIndex });
  };

  // FR6 Step 3: Submit quiz & display score immediately after submission
  const handleSubmitQuiz = async () => {
    if (!currentQuiz) return;

    const quizId = currentQuiz._id || currentQuiz.id;
    const answersArray = currentQuiz.questions.map((_, idx) => selectedAnswers[idx] ?? -1);

    try {
      const res = await authFetch(`${API_BASE_URL}/quiz/${quizId}/submit`, {
        method: 'POST',
        body: JSON.stringify({ userAnswers: answersArray })
      });
      const data = await res.json();

      if (data.success) {
        setResultData(data);
        setSubmitted(true);
      }
    } catch (err) {
      console.error(err);
      setSubmitted(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border-purple-500/30 p-6 space-y-4 bg-[#0D1222] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">AI MCQ Quiz Generator (FR6)</h3>
              <p className="text-xs text-purple-300 font-medium">Subject-wise MCQs &amp; Difficulty Adjustment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Setup Controls: Topic & Difficulty Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Subject Topic</label>
            <input
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="e.g. Organic Reactions, Electromagnetism"
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Difficulty Level</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-purple-300 font-bold focus:outline-none"
            >
              <option value="Easy">🟢 Easy</option>
              <option value="Medium">🟡 Medium</option>
              <option value="Hard">🔴 Hard</option>
            </select>
          </div>

          <div className="sm:col-span-3 flex justify-end">
            <button
              onClick={handleGenerateQuiz}
              disabled={loading}
              className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>Generate {difficulty} Quiz</span>
            </button>
          </div>
        </div>

        {/* Immediate Scorecard Banner if Submitted */}
        {submitted && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-purple-900/80 to-cyan-900/80 border border-purple-500/40 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-400" />
              <div>
                <h4 className="text-sm font-bold text-white">Quiz Attempt Submitted!</h4>
                <p className="text-xs text-slate-200">
                  Score:{' '}
                  <span className="text-cyan-300 font-extrabold text-sm">
                    {resultData?.score ?? 0} / {resultData?.totalQuestions ?? currentQuiz?.questions?.length}
                  </span>{' '}
                  ({resultData?.percentage ?? 100}%)
                </p>
              </div>
            </div>
            <button
              onClick={handleGenerateQuiz}
              className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-bold hover:bg-purple-500 shadow"
            >
              Try New Quiz
            </button>
          </div>
        )}

        {/* Quiz Questions List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-3">
            <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
            <p className="text-xs text-slate-400">Generating {difficulty} MCQs using Gemini API...</p>
          </div>
        ) : currentQuiz && currentQuiz.questions ? (
          <div className="space-y-4">
            {currentQuiz.questions.map((q, qIdx) => {
              const resultItem = resultData?.breakdown?.[qIdx];
              return (
                <div key={qIdx} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-100 flex items-start gap-2">
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px]">
                      Q{qIdx + 1}
                    </span>
                    <span>{q.questionText}</span>
                  </h4>

                  <div className="space-y-2 pt-1">
                    {q.options.map((option, optIdx) => {
                      const isSelected = selectedAnswers[qIdx] === optIdx;
                      const isCorrect = q.correctAnswerIndex === optIdx;
                      let btnStyle = 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800';

                      if (submitted) {
                        if (isCorrect) {
                          btnStyle = 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300 font-semibold';
                        } else if (isSelected && !isCorrect) {
                          btnStyle = 'bg-rose-950/80 border-rose-500/60 text-rose-300';
                        }
                      } else if (isSelected) {
                        btnStyle = 'bg-purple-600/30 border-purple-400 text-purple-200 font-semibold';
                      }

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectAnswer(qIdx, optIdx)}
                          className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{option}</span>
                          {submitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />}
                          {submitted && isSelected && !isCorrect && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>

                  {submitted && q.explanation && (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
                      <span className="text-cyan-400 font-bold block mb-0.5">Explanation:</span>
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : null}

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
          >
            Close
          </button>
          {!submitted && currentQuiz && (
            <button
              onClick={handleSubmitQuiz}
              className="px-5 py-2 rounded-xl gradient-btn-purple text-white text-xs font-bold shadow-lg shadow-purple-900/40"
            >
              Submit Quiz &amp; Evaluate Score
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
