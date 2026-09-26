// src/components/NotesQuizTab.jsx - Smart Notes Generator (FR5)
import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { Sparkles, Upload, FileText, CheckCircle2, Volume2, Download, Layers, HelpCircle, VolumeX, Trash2, Loader2 } from 'lucide-react';

export default function NotesQuizTab({ onOpenQuiz }) {
  const { authFetch } = useAuth();
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const fetchNotes = async () => {
    try {
      const res = await authFetch(`${API_BASE_URL}/notes`);
      const data = await res.json();
      if (data.notes && data.notes.length > 0) {
        setNotes(data.notes);
        setSelectedNote(data.notes[0]);
      }
    } catch (err) {
      console.warn('Notes fetch notice:', err);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // FR5 Core: Handle File Upload (PDF/Text) to backend /api/notes/upload
  const [uploadStatus, setUploadStatus] = useState('');

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const cleanTopic = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
    setIsProcessing(true);
    setUploadStatus(`Analyzing ${file.name} with Gemini AI...`);

    const formData = new FormData();
    formData.append('document', file);
    formData.append('subject', cleanTopic);

    try {
      const res = await authFetch(`${API_BASE_URL}/notes/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (data.success && data.note) {
        setNotes(prev => [data.note, ...prev]);
        setSelectedNote(data.note);
      } else if (data.note) {
        setNotes(prev => [data.note, ...prev]);
        setSelectedNote(data.note);
      }
    } catch (err) {
      console.error('File upload error:', err);
    } finally {
      setIsProcessing(false);
      setUploadStatus('');
      // Reset input so same file can be re-uploaded if needed
      e.target.value = '';
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      await authFetch(`${API_BASE_URL}/notes/${id}`, { method: 'DELETE' });
      setNotes(notes.filter(n => (n._id || n.id) !== id));
      if (selectedNote && (selectedNote._id || selectedNote.id) === id) {
        setSelectedNote(notes.find(n => (n._id || n.id) !== id) || null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAudioPlayback = () => {
    if (!('speechSynthesis' in window) || !selectedNote) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    } else {
      const textToSpeak = `${selectedNote.title}. ${selectedNote.summary}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.onend = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 pb-20 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="glass-card p-4 lg:p-6 rounded-2xl border-purple-500/30 bg-gradient-to-r from-purple-950/50 via-slate-900 to-indigo-950/50 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 block">
            FR5 – SMART NOTES GENERATOR
          </span>
          <h2 className="text-base lg:text-xl font-extrabold text-white mt-0.5">
            AI Document Summarizer &amp; PDF Text Extractor
          </h2>
        </div>
        <div className="px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Gemini 3.5 Flash (Live AI)</span>
        </div>
      </div>

      {/* Main Desktop Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: File Upload & Notes History */}
        <div className="space-y-5">
          {/* Upload Dropzone */}
          <div className="glass-card p-6 rounded-2xl border-dashed border-2 border-slate-700 hover:border-purple-500/50 text-center space-y-3 bg-[#0B0F1E]/80">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-purple-400">
              {isProcessing ? <Loader2 className="w-6 h-6 animate-spin text-purple-400" /> : <Upload className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Upload Any PDF / Document</h3>
              <p className="text-xs text-slate-400 mt-0.5">Extract content &amp; generate chapter notes automatically for any topic</p>
            </div>
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-500 cursor-pointer shadow-lg">
              <FileText className="w-4 h-4" />
              <span>{isProcessing ? 'Analyzing Document...' : 'Browse PDF / TXT'}</span>
              <input type="file" accept=".pdf,.txt,.md" onChange={handleFileUpload} disabled={isProcessing} className="hidden" />
            </label>
          </div>

          {/* Stored Notes List */}
          <div className="glass-card p-4 rounded-2xl border-slate-800 space-y-3 bg-[#0D1220]">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Your Smart Notes</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {notes.map((note) => {
                const isSelected = selectedNote && (selectedNote._id || selectedNote.id) === (note._id || note.id);
                return (
                  <div
                    key={note._id || note.id}
                    onClick={() => setSelectedNote(note)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                      isSelected ? 'bg-purple-900/40 border-purple-500/50 text-white' : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-white">{note.title}</h4>
                      <span className="text-[10px] text-slate-400">{note.fileName}</span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteNote(note._id || note.id); }}
                      className="p-1 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: AI Summary & Key Concepts */}
        <div className="lg:col-span-2 space-y-5">
          {isProcessing && (
            <div className="glass-card p-6 rounded-2xl border-purple-500/40 bg-purple-950/30 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto" />
              <h4 className="text-sm font-bold text-white">{uploadStatus || 'Processing Document with Gemini 3.5 Flash...'}</h4>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Extracting textual contents from the PDF, identifying core themes, and synthesizing comprehensive academic chapter notes and takeaways.
              </p>
            </div>
          )}

          {selectedNote ? (
            <div className="glass-card p-6 rounded-2xl border-slate-800 space-y-4 bg-[#0E1424]">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-900/60 border border-purple-500/40 text-purple-300 text-[10px] font-bold">
                    {selectedNote.subject || 'Academic Notes'}
                  </span>
                  <h3 className="text-lg font-extrabold text-white mt-1">{selectedNote.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAudioPlayback}
                    className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                  >
                    {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={onOpenQuiz}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold flex items-center gap-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Generate Quiz</span>
                  </button>
                </div>
              </div>

              {/* AI Summary View */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Chapter Summary</h4>
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                  {selectedNote.summary}
                </div>
              </div>

              {/* Key Concepts */}
              {selectedNote.keyConcepts && selectedNote.keyConcepts.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider">Key Conceptual Takeaways</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedNote.keyConcepts.map((kc, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                        <h5 className="text-xs font-bold text-cyan-300">{kc.title}</h5>
                        <p className="text-[11px] text-slate-300 mt-0.5">{kc.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card p-12 rounded-2xl border-slate-800 text-center text-slate-400">
              Select or upload a document to view AI chapter notes.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
