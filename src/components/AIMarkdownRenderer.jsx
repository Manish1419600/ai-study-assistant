// src/components/AIMarkdownRenderer.jsx - Full Google Gemini Style Markdown & KaTeX Math Renderer
import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { marked } from 'marked';
import { Copy, Check } from 'lucide-react';

/**
 * Render a standalone KaTeX mathematical formula (display mode)
 */
export function KaTeXBlock({ math, className = '' }) {
  const html = useMemo(() => {
    if (!math || typeof math !== 'string') return '';
    try {
      return katex.renderToString(math.trim(), {
        displayMode: true,
        throwOnError: false,
        strict: false
      });
    } catch (err) {
      console.warn('KaTeX render notice:', err);
      return `<span class="font-mono text-sm">${math}</span>`;
    }
  }, [math]);

  if (!html) return null;

  return (
    <div 
      className={`katex-display-wrapper py-2.5 px-4 overflow-x-auto text-center ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/**
 * Pre-process string to convert embedded LaTeX formulas into KaTeX HTML
 */
function preprocessMath(text) {
  if (!text || typeof text !== 'string') return '';

  let output = text;

  // 1. Double dollar display math: $$ ... $$
  output = output.replace(/\$\$([\s\S]+?)\$\$/g, (_, equation) => {
    try {
      const rendered = katex.renderToString(equation.trim(), {
        displayMode: true,
        throwOnError: false,
        strict: false
      });
      return `<div class="ai-math-block my-3 py-2 px-3 rounded-xl bg-slate-900/40 dark:bg-slate-950/60 border border-cyan-500/20 overflow-x-auto text-center">${rendered}</div>`;
    } catch {
      return `$$${equation}$$`;
    }
  });

  // 2. Bracket display math: \[ ... \]
  output = output.replace(/\\\[([\s\S]+?)\\\]/g, (_, equation) => {
    try {
      const rendered = katex.renderToString(equation.trim(), {
        displayMode: true,
        throwOnError: false,
        strict: false
      });
      return `<div class="ai-math-block my-3 py-2 px-3 rounded-xl bg-slate-900/40 dark:bg-slate-950/60 border border-cyan-500/20 overflow-x-auto text-center">${rendered}</div>`;
    } catch {
      return `\\[${equation}\\]`;
    }
  });

  // 3. Parenthesis inline math: \( ... \)
  output = output.replace(/\\\(([\s\S]+?)\\\)/g, (_, equation) => {
    try {
      return katex.renderToString(equation.trim(), {
        displayMode: false,
        throwOnError: false,
        strict: false
      });
    } catch {
      return `\\(${equation}\\)`;
    }
  });

  // 4. Single dollar inline math: $...$ (ensure not preceded/followed by digits or currency symbols)
  output = output.replace(/(?<![\$\w\\])\$([^\$\n\r]+?)\$(?![\$\w])/g, (_, equation) => {
    // Skip if looks like monetary amount e.g. $10 or $100
    if (/^\s*\d+([.,]\d+)?\s*$/.test(equation)) {
      return `$${equation}$`;
    }
    try {
      return katex.renderToString(equation.trim(), {
        displayMode: false,
        throwOnError: false,
        strict: false
      });
    } catch {
      return `$${equation}$`;
    }
  });

  return output;
}

/**
 * Gemini-style Markdown Parser & Renderer Component
 */
export default function AIMarkdownRenderer({ content, className = '' }) {
  const renderedHtml = useMemo(() => {
    if (!content) return '';

    // Step 1: Pre-process Math formulas into KaTeX HTML
    const withMath = preprocessMath(content);

    // Step 2: Configure marked renderer
    const renderer = new marked.Renderer();

    // Customize headings (like Gemini)
    renderer.heading = ({ tokens, depth }) => {
      const text = tokens.map(t => t.raw || t.text).join('');
      if (depth === 1) {
        return `<h2 class="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-5 mb-2.5 pb-1.5 border-b border-slate-200 dark:border-slate-800">${text}</h2>`;
      }
      if (depth === 2) {
        return `<h3 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-4 mb-2">${text}</h3>`;
      }
      if (depth === 3) {
        return `<h4 class="text-base sm:text-lg font-bold text-cyan-600 dark:text-cyan-400 mt-3.5 mb-1.5 flex items-center gap-1.5">${text}</h4>`;
      }
      return `<h5 class="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 mt-3 mb-1">${text}</h5>`;
    };

    // Customize lists
    renderer.list = ({ items, ordered, start }) => {
      const body = items.map(item => item.text ? `<li>${item.text}</li>` : item.raw).join('');
      if (ordered) {
        return `<ol class="list-decimal list-outside pl-5 space-y-1.5 my-2.5 text-slate-800 dark:text-slate-200" start="${start || 1}">${body}</ol>`;
      }
      return `<ul class="list-disc list-outside pl-5 space-y-1.5 my-2.5 text-slate-800 dark:text-slate-200">${body}</ul>`;
    };

    renderer.listitem = ({ tokens }) => {
      const text = tokens.map(t => t.raw || t.text).join('');
      return `<li class="text-sm sm:text-base leading-relaxed pl-1">${text}</li>`;
    };

    // Customize paragraphs
    renderer.paragraph = ({ tokens }) => {
      const text = tokens.map(t => t.raw || t.text).join('');
      return `<p class="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed mb-3">${text}</p>`;
    };

    // Customize bold / strong
    renderer.strong = ({ tokens }) => {
      const text = tokens.map(t => t.raw || t.text).join('');
      return `<strong class="font-bold text-slate-950 dark:text-white">${text}</strong>`;
    };

    // Customize horizontal rule (---)
    renderer.hr = () => {
      return `<hr class="my-4 border-slate-200 dark:border-slate-800" />`;
    };

    // Customize inline code (`code`)
    renderer.codespan = ({ text }) => {
      return `<code class="px-1.5 py-0.5 rounded-md bg-purple-500/10 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-mono text-xs sm:text-sm border border-purple-500/20">${text}</code>`;
    };

    // Customize fenced code block (```lang ... ```)
    renderer.code = ({ text, lang }) => {
      const language = (lang || 'code').toUpperCase();
      const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `
        <div class="my-4 rounded-2xl overflow-hidden border border-slate-800 bg-[#090C15] shadow-lg">
          <div class="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-xs font-mono text-slate-400">
            <span class="font-bold text-cyan-400">${language}</span>
            <span class="text-[11px] text-slate-500">StudyGenie AI</span>
          </div>
          <pre class="p-4 text-xs sm:text-sm font-mono text-emerald-400 dark:text-emerald-300 overflow-x-auto leading-relaxed whitespace-pre"><code>${escaped}</code></pre>
        </div>
      `;
    };

    // Customize blockquotes (> quote)
    renderer.blockquote = ({ tokens }) => {
      const text = tokens.map(t => t.raw || t.text).join('');
      return `<blockquote class="pl-4 py-1.5 my-3 border-l-4 border-cyan-500 bg-cyan-500/5 dark:bg-cyan-950/20 text-slate-700 dark:text-slate-300 rounded-r-xl italic">${text}</blockquote>`;
    };

    // Step 3: Run marked with custom renderer
    return marked.parse(withMath, { renderer, gfm: true, breaks: true });
  }, [content]);

  return (
    <div 
      className={`ai-markdown-content leading-relaxed select-text space-y-1 ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
}
