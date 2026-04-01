'use client';

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Type, Hash } from 'lucide-react';

interface EditorPreviewProps {
  html: string;
}

// Simple LaTeX to unicode rendering for fallback
function simpleLatexPreview(latex: string): string {
  let text = latex;
  const subs: [RegExp, string][] = [
    [/\\frac\{([^}]*)\}\{([^}]*)\}/g, '($1/$2)'],
    [/\\sqrt\{([^}]*)\}/g, '√($1)'],
    [/\\sqrt\[([^\]]*)\]\{([^}]*)\}/g, '[$1]√($2)'],
    [/\\int(_\{([^}]*)\})?(\^\{([^}]*)\})?/g, '∫'],
    [/\\sum(_\{([^}]*)\})?(\^\{([^}]*)\})?/g, 'Σ'],
    [/\\prod(_\{([^}]*)\})?(\^\{([^}]*)\})?/g, 'Π'],
    [/\\infty/g, '∞'], [/\\pm/g, '±'], [/\\neq/g, '≠'],
    [/\\leq/g, '≤'], [/\\geq/g, '≥'], [/\\approx/g, '≈'],
    [/\\times/g, '×'], [/\\div/g, '÷'], [/\\cdot/g, '·'],
    [/\\alpha/g, 'α'], [/\\beta/g, 'β'], [/\\gamma/g, 'γ'],
    [/\\delta/g, 'δ'], [/\\theta/g, 'θ'], [/\\lambda/g, 'λ'],
    [/\\mu/g, 'μ'], [/\\pi/g, 'π'], [/\\sigma/g, 'σ'],
    [/\\omega/g, 'ω'], [/\\partial/g, '∂'], [/\\nabla/g, '∇'],
    [/\^{([^}]*)}/g, '$1'], [/_{([^}]*)}/g, '$1'],
    [/\\vec\{([^}]*)\}/g, '$1'], [/\\hat\{([^}]*)\}/g, '$1'],
    [/\\left/g, ''], [/\\right/g, ''],
    [/\\begin\{pmatrix\}(.+?)\\end\{pmatrix\}/gs, '[$1]'],
    [/\\\\/g, '; '], [/\\,/g, ' '], [/\\;/g, ' '],
    [/\\ /g, ' '],
  ];
  for (const [re, rep] of subs) {
    text = text.replace(re, rep);
  }
  return text;
}

// Module-level flag: only configure MathLive fonts once
let mathliveFontsConfigured = false;

function injectMathLiveFontFaces() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('mathlive-font-faces')) return;
  const style = document.createElement('style');
  style.id = 'mathlive-font-faces';
  style.textContent = `
    @font-face{font-display:swap;font-family:KaTeX_AMS;font-style:normal;font-weight:400;src:url(/mathlive-fonts/KaTeX_AMS-Regular.woff2) format("woff2")}
    @font-face{font-display:swap;font-family:KaTeX_Caligraphic;font-style:normal;font-weight:700;src:url(/mathlive-fonts/KaTeX_Caligraphic-Bold.woff2) format("woff2")}
    @font-face{font-display:swap;font-family:KaTeX_Caligraphic;font-style:normal;font-weight:400;src:url(/mathlive-fonts/KaTeX_Caligraphic-Regular.woff2) format("woff2")}
    @font-face{font-display:swap;font-family:KaTeX_Fraktur;font-style:normal;font-weight:700;src:url(/mathlive-fonts/KaTeX_Fraktur-Bold.woff2) format("woff2")}
    @font-face{font-display:swap;font-family:KaTeX_Fraktur;font-style:normal;font-weight:400;src:url(/mathlive-fonts/KaTeX_Fraktur-Regular.woff2) format("woff2")}
    @font-face{font-display:swap;font-family:KaTeX_Main;font-style:normal;font-weight:700;src:url(/mathlive-fonts/KaTeX_Main-Bold.woff2) format("woff2")}
    @font-face{font-display:swap;font-family:KaTeX_Main;font-style:italic;font-weight:700;src:url(/mathlive-fonts/KaTeX_Main-BoldItalic.woff2) format("woff2")}
    @font-face{font-display:swap;font-family:KaTeX_Main;font-style:italic;font-weight:400;src:url(/mathlive-fonts/KaTeX_Main-Italic.woff2) format("woff2")}
    @font-face{font-display:swap;font-family:KaTeX_Main;font-style:normal;font-weight:400;src:url(/mathlive-fonts/KaTeX_Main-Regular.woff2) format("woff2")}
    @font-face{font-display:swap;font-family:KaTeX_Math;font-style:italic;font-weight:700;src:url(/mathlive-fonts/KaTeX_Math-BoldItalic.woff2) format("woff2")}
    @font-face{font-display:swap;font-family:KaTeX_Math;font-style:italic;font-weight:400;src:url(/mathlive-fonts/KaTeX_Math-Italic.woff2) format("woff2")}
    @font-face{font-display:swap;font-family:KaTeX_SansSerif;font-style:normal;font-weight:700;src:url(/mathlive-fonts/KaTeX_SansSerif-Bold.woff2) format("woff2")}
    @font-face{font-display:swap;font-family:KaTeX_SansSerif;font-style:italic;font-weight:400;src:url(/mathlive-fonts/KaTeX_SansSerif-Italic.woff2) format("woff2")}
    @font-face{font-display:swap;font-family:KaTeX_SansSerif;font-style:normal;font-weight:400;src:url(/mathlive-fonts/KaTeX_SansSerif-Regular.woff2) format("woff2")}
    @font-face{font-display:swap;font-family:KaTeX_Script;font-style:normal;font-weight:400;src:url(/mathlive-fonts/KaTeX_Script-Regular.woff2) format("woff2")}
    @font-face{font-display:swap;font-family:KaTeX_Size1;font-style:normal;font-weight:400;src:url(/mathlive-fonts/KaTeX_Size1-Regular.woff2) format("woff2")}
    @font-face{font-display:swap;font-family:KaTeX_Size2;font-style:normal;font-weight:400;src:url(/mathlive-fonts/KaTeX_Size2-Regular.woff2) format("woff2")}
    @font-face{font-display:swap;font-family:KaTeX_Size3;font-style:normal;font-weight:400;src:url(/mathlive-fonts/KaTeX_Size3-Regular.woff2) format("woff2")}
    @font-face{font-display:swap;font-family:KaTeX_Size4;font-style:normal;font-weight:400;src:url(/mathlive-fonts/KaTeX_Size4-Regular.woff2) format("woff2")}
    @font-face{font-display:swap;font-family:KaTeX_Typewriter;font-style:normal;font-weight:400;src:url(/mathlive-fonts/KaTeX_Typewriter-Regular.woff2) format("woff2")}
  `;
  document.head.appendChild(style);
}

export function EditorPreview({ html }: EditorPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [mathliveReady, setMathliveReady] = useState(false);

  // Load MathLive once on mount — inject fonts and configure before using
  useEffect(() => {
    injectMathLiveFontFaces();

    import('mathlive')
      .then((mod) => {
        // Configure font directory for MathLive so it doesn't try CDN
        const MFE = (mod as any).MathFieldElement;
        if (MFE && !mathliveFontsConfigured) {
          MFE.fontsDirectory = '/mathlive-fonts/';
          mathliveFontsConfigured = true;
        }
        if ((mod as any).renderMathInElement) {
          setMathliveReady(true);
        }
      })
      .catch(() => {
        // MathLive not available — fallback rendering only
        setMathliveReady(false);
      });
  }, []);

  const stats = useMemo(() => {
    const text = html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ');
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const characters = text.length;
    const paragraphs = (html.match(/<p/g) || []).length;
    return { words, characters, paragraphs };
  }, [html]);

  // Process HTML for preview
  const processedHtml = useMemo(() => {
    let processed = html;

    if (mathliveReady) {
      processed = processed.replace(
        /<span data-math-equation="" data-latex="([^"]*)" data-display-mode="([^"]*)"[^>]*>[^<]*<\/span>/g,
        (_match, latex, displayMode) => {
          const escapedLatex = latex
            .replace(/&quot;/g, '"')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>');
          if (displayMode === 'true') {
            return `<div class="math-equation-display"><span class="math-content">$$${escapedLatex}$$</span></div>`;
          }
          return `<span class="math-equation-inline"><span class="math-content">$${escapedLatex}$</span></span>`;
        }
      );
    } else {
      // Fallback: render math as styled unicode text
      processed = processed.replace(
        /<span data-math-equation="" data-latex="([^"]*)" data-display-mode="([^"]*)"[^>]*>[^<]*<\/span>/g,
        (_match, latex, displayMode) => {
          const rawLatex = latex
            .replace(/&quot;/g, '"')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>');
          const rendered = simpleLatexPreview(rawLatex);
          if (displayMode === 'true') {
            return `<div class="math-equation-display" style="display:block;text-align:center;padding:8px 0;"><span class="math-fallback-display" style="font-family:serif;font-size:1.1em;">${rendered}</span></div>`;
          }
          return `<span class="math-equation-inline"><span class="math-fallback-inline" style="font-family:serif;">${rendered}</span></span>`;
        }
      );
    }

    return processed;
  }, [html, mathliveReady]);

  // Render with mathlive when available
  useEffect(() => {
    if (previewRef.current && mathliveReady) {
      import('mathlive')
        .then((mathlive) => {
          if (previewRef.current) {
            try {
              (mathlive as any).renderMathInElement(previewRef.current, {
                texClass: 'math-content',
                throwOnError: false,
              });
            } catch {
              // Rendering failed silently
            }
          }
        })
        .catch(() => {
          // Ignore errors
        });
    }
  }, [processedHtml, mathliveReady]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-2 border-b bg-muted/30">
        <BookOpen className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Preview</span>
        {!mathliveReady && (
          <Badge variant="secondary" className="text-[10px] ml-auto">
            LaTeX text
          </Badge>
        )}
      </div>
      <ScrollArea className="flex-1">
        <div
          ref={previewRef}
          className="prose prose-sm sm:prose-base max-w-none p-6 min-h-[200px] preview-content"
          dangerouslySetInnerHTML={{ __html: processedHtml }}
        />
      </ScrollArea>
      <div className="flex items-center gap-4 px-4 py-2 border-t bg-muted/30 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Type className="h-3 w-3" />
          {stats.words} words
        </span>
        <span className="flex items-center gap-1">
          <Hash className="h-3 w-3" />
          {stats.characters} chars
        </span>
        <Badge variant="secondary" className="text-xs">
          {stats.paragraphs} paragraphs
        </Badge>
      </div>
    </div>
  );
}

export default EditorPreview;
