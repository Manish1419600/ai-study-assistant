// src/components/AIMarkdownRenderer.jsx - Full Google Gemini Style Markdown & KaTeX Math Renderer
import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { marked } from 'marked';

// Configure marked
marked.setOptions({
  gfm: true,
  breaks: true,
});

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
      const rendered = katex.renderToString(equation.trim(), {
        displayMode: false,
        throwOnError: false,
        strict: false
      });
      return `<span class="katex-inline px-1">${rendered}</span>`;
    } catch {
      return `\\(${equation}\\)`;
    }
  });

  // 4. Single dollar inline math: $...$
  output = output.replace(/(?<![\$\w\\])\$([^\$\n\r]+?)\$(?![\$\w])/g, (_, equation) => {
    if (/^\s*\d+([.,]\d+)?\s*$/.test(equation)) {
      return `$${equation}$`;
    }
    try {
      const rendered = katex.renderToString(equation.trim(), {
        displayMode: false,
        throwOnError: false,
        strict: false
      });
      return `<span class="katex-inline px-1">${rendered}</span>`;
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

    // Step 2: Use marked.parse directly so it parses **, *, ###, lists into clean HTML tags without stars
    const html = marked.parse(withMath);
    return html;
  }, [content]);

  return (
    <div 
      className={`ai-markdown-content leading-relaxed select-text space-y-2 text-slate-800 dark:text-slate-100 ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
}
