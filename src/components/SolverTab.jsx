// src/components/SolverTab.jsx - Larger Font Sizing for PC Readability (FR3 & FR4)
import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { Sparkles, Camera, Mic, ArrowUp, Bookmark, HelpCircle, Copy, Volume2, Check, Plus, BookOpen, Zap, Clock, History } from 'lucide-react';

export default function SolverTab({ onOpenQuiz, savedNotes, setSavedNotes }) {
  const { authFetch } = useAuth();
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [faqs, setFaqs] = useState([]);

  const [chats, setChats] = useState([
    {
      id: 'doubt-1',
      sender: 'user',
      time: '10:42 AM',
      text: "Can you explain the intuition behind Schrödinger's wave equation and how ψ relates to probability density |ψ|²?"
    },
    {
      id: 'answer-1',
      sender: 'ai',
      model: 'Gemini 3.8 Flash',
      time: '10:42 AM',
      type: 'rich-doubt',
      title: 'Time-Independent Equation',
      equation: 'Ĥψ = Eψ',
      equationSubtitle: 'Total Energy Operator × Wavefunction = Energy Eigenvalue × Wavefunction',
      explanation: "Think of ψ (psi) not as a tangible physical wave, but as an information wave that encodes everything quantum mechanics permits us to know about a state.",
      keyPoints: [
        {
          title: "Born Rule Intuition",
          text: "Since ψ itself is a complex quantity (a + bi), squaring its absolute magnitude gives real spatial probabilities."
        },
        {
          title: "P(x) = |ψ(x)|² dx",
          text: "Gives the precise probability density of finding the particle inside spatial interval dx."
        }
      ],
      hasGraph: true,
      isAutoFaqMatch: false
    }
  ]);

  // Load Doubt History & Auto-FAQs on mount
  useEffect(() => {
    async function loadDoubtHistory() {
      try {
        const res = await authFetch(`${API_BASE_URL}/doubts/history`);
        const data = await res.json();
        if (data.faqs) {
          setFaqs(data.faqs);
        }
      } catch (err) {
        console.warn('History load notice:', err);
      }
    }
    loadDoubtHistory();
  }, []);

  // Handle submitting academic doubt query
  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    const query = inputText.trim();
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: query
    };

    setChats(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await authFetch(`${API_BASE_URL}/doubts/ask`, {
        method: 'POST',
        body: JSON.stringify({ query, subject: 'General Academic' })
      });
      const data = await res.json();

      if (data.success && data.chat) {
        const c = data.chat;
        const ans = c.answer || {};
        const aiMsg = {
          id: c.id,
          sender: 'ai',
          model: data.isAutoFaqMatch ? 'Auto-FAQ Cache Engine' : 'Gemini 3.8 Flash',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'rich-doubt',
          title: ans.equationSubtitle || 'Academic Decomposition',
          equation: ans.equation || null,
          equationSubtitle: ans.equationSubtitle || null,
          explanation: ans.explanation || 'Detailed academic solution.',
          keyPoints: ans.keyPoints || [],
          hasGraph: ans.hasGraph || false,
          isAutoFaqMatch: !!data.isAutoFaqMatch,
          similarityScore: data.similarityScore || null
        };

        setChats(prev => [...prev, aiMsg]);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn("Backend fetch fallback:", err);
    }

    setLoading(false);
  };

  const handleSaveNote = async (msg) => {
    if (!savedNotes.find(n => n.id === msg.id)) {
      setSavedNotes(prev => [...prev, {
        id: msg.id,
        title: msg.title || 'Saved Academic Doubt',
        explanation: msg.explanation,
        equation: msg.equation
      }]);
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-32">
      {/* Top Engine & Auto-FAQ Cache Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/70 p-4.5 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex items-center gap-2.5">
          <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-sm sm:text-base font-bold text-cyan-300">
            AI Doubt Solver &amp; Auto-FAQ History Engine (FR3 &amp; FR4)
          </span>
        </div>
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-bold">
          <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span>Auto-FAQ Similarity Check Active</span>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="desktop-grid-solver space-y-6 lg:space-y-0">
        
        {/* Left Pane: Chat Messages Stream */}
        <div className="space-y-5">
          <div className="space-y-5">
            {chats.map((msg) => {
              if (msg.sender === 'user') {
                return (
                  <div key={msg.id} className="flex flex-col items-end space-y-1.5">
                    <span className="text-xs text-slate-400">You • {msg.time}</span>
                    <div className="max-w-[85%] p-4 rounded-2xl rounded-tr-xs bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm sm:text-base font-medium shadow-lg shadow-purple-900/20 leading-relaxed">
                      {msg.text}
                    </div>
                  </div>
                );
              }

              const isSaved = savedNotes.some(n => n.id === msg.id);

              return (
                <div key={msg.id} className="flex flex-col space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                    <span className="text-xs font-bold text-cyan-400">{msg.model}</span>
                    <span className="text-xs text-slate-500">• {msg.time}</span>

                    {/* FR4 Auto-FAQ Cached Answer Badge */}
                    {msg.isAutoFaqMatch && (
                      <span className="ml-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                        <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        Auto-FAQ Match (Instant DB Answer)
                      </span>
                    )}

                    <button className="ml-auto p-1.5 rounded hover:bg-slate-800 text-slate-400">
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Answer Card */}
                  <div className="glass-card p-6 rounded-2xl border-slate-800 bg-[#0E1424] space-y-4 shadow-xl">
                    {/* LaTeX Mathematical Equation Header */}
                    {msg.equation && (
                      <div className="math-equation-box text-center space-y-1.5">
                        <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block">
                          {msg.title || 'Mathematical Formulation'}
                        </span>
                        <div className="text-2xl sm:text-3xl font-serif text-white font-bold tracking-wider py-2">
                          {msg.equation}
                        </div>
                        {msg.equationSubtitle && (
                          <p className="text-xs sm:text-sm text-slate-300">{msg.equationSubtitle}</p>
                        )}
                      </div>
                    )}

                    {/* Explanation text */}
                    <div className="text-sm sm:text-base text-slate-100 leading-relaxed whitespace-pre-line font-normal">
                      {msg.explanation}
                    </div>

                    {/* Key Points */}
                    {msg.keyPoints && msg.keyPoints.length > 0 && (
                      <div className="space-y-2.5 pt-1">
                        {msg.keyPoints.map((kp, idx) => (
                          <div key={idx} className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                              <h5 className="text-xs sm:text-sm font-bold text-cyan-300">{kp.title}</h5>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-200 pl-4.5 leading-relaxed">{kp.text}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Quantum Graph Illustration */}
                    {msg.hasGraph && (
                      <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2.5">
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <span className="text-slate-200 font-semibold">
                            Wavefunction ψ(x) vs Probability Density |ψ(x)|²
                          </span>
                          <span className="px-3 py-1 rounded bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                            Ground State Visualization
                          </span>
                        </div>

                        <div className="h-48 w-full bg-[#080B14] rounded-lg relative overflow-hidden flex items-center justify-center p-2">
                          <svg className="w-full h-full" viewBox="0 0 300 120">
                            <line x1="40" y1="10" x2="40" y2="110" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
                            <line x1="260" y1="10" x2="260" y2="110" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
                            <path d="M 40 95 Q 150 15 260 95" fill="none" stroke="#06B6D4" strokeWidth="2.5" />
                            <path d="M 40 95 Q 150 35 260 95 Z" fill="rgba(168, 85, 247, 0.25)" stroke="#A855F7" strokeWidth="2" />
                            <text x="90" y="55" fill="#06B6D4" fontSize="11" fontWeight="bold">ψ(x)</text>
                            <text x="110" y="85" fill="#C084FC" fontSize="11" fontWeight="bold">|ψ(x)|²</text>
                          </svg>
                        </div>
                      </div>
                    )}

                    {/* Actions: Save to Notes & Generate Quiz */}
                    <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800/80">
                      <button
                        onClick={() => handleSaveNote(msg)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                          isSaved
                            ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                            : 'bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700'
                        }`}
                      >
                        <Bookmark className="w-4 h-4" />
                        <span>{isSaved ? 'Saved to Notes' : 'Save to Notes'}</span>
                      </button>

                      <button
                        onClick={onOpenQuiz}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600/30 border border-purple-400/40 text-purple-200 text-xs sm:text-sm font-semibold hover:bg-purple-600/40 transition-all"
                      >
                        <HelpCircle className="w-4 h-4 text-purple-300" />
                        <span>Generate Quiz</span>
                      </button>

                      <button
                        onClick={() => handleCopy(msg.id, msg.explanation)}
                        className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white ml-auto"
                      >
                        {copiedId === msg.id ? <Check className="w-4.5 h-4.5 text-emerald-400" /> : <Copy className="w-4.5 h-4.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-purple-400">
                <Sparkles className="w-5 h-5 animate-spin" />
                <span className="text-xs sm:text-sm text-slate-300 font-medium">Checking Doubt History Auto-FAQ &amp; querying Gemini API...</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Doubt History Auto-FAQ Library */}
        <div className="space-y-5">
          <div className="glass-card p-5.5 rounded-2xl border-slate-800 space-y-3.5 bg-[#0D1222] shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <History className="w-4.5 h-4.5 text-amber-400" />
                Stored Doubt History &amp; Auto-FAQs (FR4)
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Resolved doubts stored in MongoDB. Similar questions return stored answers instantly.
            </p>

            <div className="space-y-2.5">
              {faqs.map((faq) => (
                <button
                  key={faq.id}
                  onClick={() => setInputText(faq.question)}
                  className="w-full text-left p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 transition-all group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-purple-300 leading-snug">
                      {faq.question}
                    </span>
                    <span className="px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-xs font-bold shrink-0">
                      {faq.useCount || 1}x asked
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Saved Notebook Highlights */}
          <div className="glass-card p-5.5 rounded-2xl border-slate-800 space-y-3.5 bg-[#0D1222] shadow-lg">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Bookmark className="w-4.5 h-4.5 text-emerald-400" />
              Saved Doubt Notes ({savedNotes.length})
            </h3>
            <div className="space-y-2.5 max-h-64 overflow-y-auto">
              {savedNotes.map((note) => (
                <div key={note.id} className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <h4 className="text-xs sm:text-sm font-bold text-cyan-300">{note.title}</h4>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{note.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Multimodal Input Bar */}
      <div className="fixed bottom-0 lg:bottom-4 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 bg-[#070913]/95 backdrop-blur-lg z-20">
        <form onSubmit={handleSend} className="glass-card p-3 rounded-2xl border-purple-500/30 bg-[#12182B] flex items-center gap-3 shadow-2xl shadow-purple-950/40">
          <button
            type="button"
            onClick={() => alert("Camera OCR enabled: Point camera at textbook equation.")}
            className="p-3 rounded-xl bg-slate-800/80 text-slate-200 hover:text-white hover:bg-slate-700 transition-colors"
            title="Scan Equation / OCR"
          >
            <Camera className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => alert("Voice input active: Speak academic doubt now.")}
            className="p-3 rounded-xl bg-slate-800/80 text-slate-200 hover:text-white hover:bg-slate-700 transition-colors"
            title="Voice Input"
          >
            <Mic className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask any academic doubt (e.g. Schrödinger equation, Faraday law, SN2 mechanisms)..."
            className="flex-1 bg-transparent text-sm sm:text-base text-white placeholder-slate-400 outline-none px-2 font-medium"
          />

          <button
            type="submit"
            disabled={loading}
            className="p-3 px-5 rounded-xl gradient-btn-purple text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-600/30 hover:scale-105 transition-transform disabled:opacity-50 flex items-center gap-2"
          >
            <span>Ask</span>
            <ArrowUp className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>
      </div>
    </div>
  );
}
