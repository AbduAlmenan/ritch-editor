'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sigma, Loader2, Keyboard } from 'lucide-react';

interface MathEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (latex: string, displayMode: boolean) => void;
  initialLatex?: string;
  initialDisplayMode?: boolean;
}

// ─── 150+ Symbol Definitions organized by tabs ─────────────────────────

interface SymbolItem {
  label: string;
  latex: string;
  display: string;
}

const TAB_COMMON: SymbolItem[] = [
  { label: 'Fraction', latex: '\\frac{a}{b}', display: 'a/b' },
  { label: 'Square Root', latex: '\\sqrt{x}', display: '\u221Ax' },
  { label: 'Nth Root', latex: '\\sqrt[n]{x}', display: '\u207F\u221Ax' },
  { label: 'Integral', latex: '\\int_{a}^{b}', display: '\u222B' },
  { label: 'Double Integral', latex: '\\iint_{a}^{b}', display: '\u222C' },
  { label: 'Triple Integral', latex: '\\iiint_{a}^{b}', display: '\u222D' },
  { label: 'Contour Integral', latex: '\\oint', display: '\u222E' },
  { label: 'Summation', latex: '\\sum_{i=0}^{n}', display: '\u2211' },
  { label: 'Product', latex: '\\prod_{i=1}^{n}', display: '\u220F' },
  { label: 'Coproduct', latex: '\\coprod_{i=1}^{n}', display: '\u2210' },
  { label: 'Limit', latex: '\\lim_{x \\to \\infty}', display: 'lim' },
  { label: 'Infinity', latex: '\\infty', display: '\u221E' },
  { label: 'Partial', latex: '\\partial', display: '\u2202' },
  { label: 'Nabla', latex: '\\nabla', display: '\u2207' },
  { label: 'Binomial', latex: '\\binom{n}{k}', display: 'C(n,k)' },
  { label: 'Subscript x^2', latex: 'x^{2}', display: 'x\u00B2' },
  { label: 'Subscript x_n', latex: 'x_{n}', display: 'x\u2099' },
  { label: 'Plus-Minus', latex: '\\pm', display: '\u00B1' },
  { label: 'Minus-Plus', latex: '\\mp', display: '\u2213' },
  { label: 'Degree', latex: '^{\\circ}', display: '\u00B0' },
];

const TAB_GREEK: SymbolItem[] = [
  // Lowercase
  { label: 'alpha', latex: '\\alpha', display: '\u03B1' },
  { label: 'beta', latex: '\\beta', display: '\u03B2' },
  { label: 'gamma', latex: '\\gamma', display: '\u03B3' },
  { label: 'delta', latex: '\\delta', display: '\u03B4' },
  { label: 'epsilon', latex: '\\epsilon', display: '\u03B5' },
  { label: 'varepsilon', latex: '\\varepsilon', display: '\u03B5' },
  { label: 'zeta', latex: '\\zeta', display: '\u03B6' },
  { label: 'eta', latex: '\\eta', display: '\u03B7' },
  { label: 'theta', latex: '\\theta', display: '\u03B8' },
  { label: 'vartheta', latex: '\\vartheta', display: '\u03D1' },
  { label: 'iota', latex: '\\iota', display: '\u03B9' },
  { label: 'kappa', latex: '\\kappa', display: '\u03BA' },
  { label: 'lambda', latex: '\\lambda', display: '\u03BB' },
  { label: 'mu', latex: '\\mu', display: '\u03BC' },
  { label: 'nu', latex: '\\nu', display: '\u03BD' },
  { label: 'xi', latex: '\\xi', display: '\u03BE' },
  { label: 'pi', latex: '\\pi', display: '\u03C0' },
  { label: 'varpi', latex: '\\varpi', display: '\u03D6' },
  { label: 'rho', latex: '\\rho', display: '\u03C1' },
  { label: 'varrho', latex: '\\varrho', display: '\u03F1' },
  { label: 'sigma', latex: '\\sigma', display: '\u03C3' },
  { label: 'varsigma', latex: '\\varsigma', display: '\u03C2' },
  { label: 'tau', latex: '\\tau', display: '\u03C4' },
  { label: 'upsilon', latex: '\\upsilon', display: '\u03C5' },
  { label: 'phi', latex: '\\phi', display: '\u03C6' },
  { label: 'varphi', latex: '\\varphi', display: '\u03D5' },
  { label: 'chi', latex: '\\chi', display: '\u03C7' },
  { label: 'psi', latex: '\\psi', display: '\u03C8' },
  { label: 'omega', latex: '\\omega', display: '\u03C9' },
  // Uppercase
  { label: 'Gamma', latex: '\\Gamma', display: '\u0393' },
  { label: 'Delta', latex: '\\Delta', display: '\u0394' },
  { label: 'Theta', latex: '\\Theta', display: '\u0398' },
  { label: 'Lambda', latex: '\\Lambda', display: '\u039B' },
  { label: 'Xi', latex: '\\Xi', display: '\u039E' },
  { label: 'Pi', latex: '\\Pi', display: '\u03A0' },
  { label: 'Sigma', latex: '\\Sigma', display: '\u03A3' },
  { label: 'Upsilon', latex: '\\Upsilon', display: '\u03A5' },
  { label: 'Phi', latex: '\\Phi', display: '\u03A6' },
  { label: 'Psi', latex: '\\Psi', display: '\u03A8' },
  { label: 'Omega', latex: '\\Omega', display: '\u03A9' },
];

const TAB_OPERATORS: SymbolItem[] = [
  { label: 'times', latex: '\\times', display: '\u00D7' },
  { label: 'div', latex: '\\div', display: '\u00F7' },
  { label: 'cdot', latex: '\\cdot', display: '\u00B7' },
  { label: 'circ', latex: '\\circ', display: '\u2218' },
  { label: 'bullet', latex: '\\bullet', display: '\u2022' },
  { label: 'oplus', latex: '\\oplus', display: '\u2295' },
  { label: 'ominus', latex: '\\ominus', display: '\u2296' },
  { label: 'otimes', latex: '\\otimes', display: '\u2297' },
  { label: 'oslash', latex: '\\oslash', display: '\u2298' },
  { label: 'odot', latex: '\\odot', display: '\u2299' },
  { label: 'wedge', latex: '\\wedge', display: '\u2227' },
  { label: 'vee', latex: '\\vee', display: '\u2228' },
  { label: 'neg', latex: '\\neg', display: '\u00AC' },
  { label: 'implies', latex: '\\Rightarrow', display: '\u21D2' },
  { label: 'impliedby', latex: '\\Leftarrow', display: '\u21D0' },
  { label: 'iff', latex: '\\Leftrightarrow', display: '\u21D4' },
  { label: 'forall', latex: '\\forall', display: '\u2200' },
  { label: 'exists', latex: '\\exists', display: '\u2203' },
  { label: 'nexists', latex: '\\nexists', display: '\u2204' },
  { label: 'in', latex: '\\in', display: '\u2208' },
  { label: 'notin', latex: '\\notin', display: '\u2209' },
  { label: 'subset', latex: '\\subset', display: '\u2282' },
  { label: 'supset', latex: '\\supset', display: '\u2283' },
  { label: 'cup', latex: '\\cup', display: '\u222A' },
  { label: 'cap', latex: '\\cap', display: '\u2229' },
  { label: 'setminus', latex: '\\setminus', display: '\u2216' },
  { label: 'emptyset', latex: '\\emptyset', display: '\u2205' },
  { label: 'star', latex: '\\star', display: '\u22C6' },
  { label: 'ast', latex: '\\ast', display: '*' },
  { label: 'dagger', latex: '\\dagger', display: '\u2020' },
];

const TAB_ARROWS: SymbolItem[] = [
  { label: 'rightarrow', latex: '\\rightarrow', display: '\u2192' },
  { label: 'leftarrow', latex: '\\leftarrow', display: '\u2190' },
  { label: 'leftrightarrow', latex: '\\leftrightarrow', display: '\u2194' },
  { label: 'uparrow', latex: '\\uparrow', display: '\u2191' },
  { label: 'downarrow', latex: '\\downarrow', display: '\u2193' },
  { label: 'Rightarrow', latex: '\\Rightarrow', display: '\u21D2' },
  { label: 'Leftarrow', latex: '\\Leftarrow', display: '\u21D0' },
  { label: 'Leftrightarrow', latex: '\\Leftrightarrow', display: '\u21D4' },
  { label: 'Uparrow', latex: '\\Uparrow', display: '\u21D1' },
  { label: 'Downarrow', latex: '\\Downarrow', display: '\u21D3' },
  { label: 'mapsto', latex: '\\mapsto', display: '\u21A6' },
  { label: 'longmapsto', latex: '\\longmapsto', display: '\u27FC' },
  { label: 'hookrightarrow', latex: '\\hookrightarrow', display: '\u21AA' },
  { label: 'hookleftarrow', latex: '\\hookleftarrow', display: '\u21A9' },
  { label: 'nearrow', latex: '\\nearrow', display: '\u2197' },
  { label: 'searrow', latex: '\\searrow', display: '\u2198' },
  { label: 'nwarrow', latex: '\\nwarrow', display: '\u2196' },
  { label: 'swarrow', latex: '\\swarrow', display: '\u2199' },
  { label: 'to', latex: '\\to', display: '\u2192' },
  { label: 'gets', latex: '\\gets', display: '\u2190' },
  { label: 'longrightarrow', latex: '\\longrightarrow', display: '\u27F6' },
  { label: 'Longrightarrow', latex: '\\Longrightarrow', display: '\u27F9' },
];

const TAB_RELATIONS: SymbolItem[] = [
  { label: 'equals', latex: '=', display: '=' },
  { label: 'neq', latex: '\\neq', display: '\u2260' },
  { label: 'approx', latex: '\\approx', display: '\u2248' },
  { label: 'cong', latex: '\\cong', display: '\u2245' },
  { label: 'equiv', latex: '\\equiv', display: '\u2261' },
  { label: 'sim', latex: '\\sim', display: '\u223C' },
  { label: 'simeq', latex: '\\simeq', display: '\u2243' },
  { label: 'asymp', latex: '\\asymp', display: '\u224D' },
  { label: 'propto', latex: '\\propto', display: '\u221D' },
  { label: 'leq', latex: '\\leq', display: '\u2264' },
  { label: 'geq', latex: '\\geq', display: '\u2265' },
  { label: 'll', latex: '\\ll', display: '\u226A' },
  { label: 'gg', latex: '\\gg', display: '\u226B' },
  { label: 'prec', latex: '\\prec', display: '\u227A' },
  { label: 'succ', latex: '\\succ', display: '\u227B' },
  { label: 'preceq', latex: '\\preceq', display: '\u227C' },
  { label: 'succeq', latex: '\\succeq', display: '\u227D' },
  { label: 'subseteq', latex: '\\subseteq', display: '\u2286' },
  { label: 'supseteq', latex: '\\supseteq', display: '\u2287' },
  { label: 'sqsubset', latex: '\\sqsubset', display: '\u228F' },
  { label: 'sqsupset', latex: '\\sqsupset', display: '\u2290' },
  { label: 'perp', latex: '\\perp', display: '\u27C2' },
  { label: 'parallel', latex: '\\parallel', display: '\u2225' },
  { label: 'mid', latex: '\\mid', display: '|' },
  { label: 'nmid', latex: '\\nmid', display: '\u2224' },
];

const TAB_FUNCTIONS: SymbolItem[] = [
  { label: 'sin', latex: '\\sin', display: 'sin' },
  { label: 'cos', latex: '\\cos', display: 'cos' },
  { label: 'tan', latex: '\\tan', display: 'tan' },
  { label: 'cot', latex: '\\cot', display: 'cot' },
  { label: 'sec', latex: '\\sec', display: 'sec' },
  { label: 'csc', latex: '\\csc', display: 'csc' },
  { label: 'arcsin', latex: '\\arcsin', display: 'arcsin' },
  { label: 'arccos', latex: '\\arccos', display: 'arccos' },
  { label: 'arctan', latex: '\\arctan', display: 'arctan' },
  { label: 'sinh', latex: '\\sinh', display: 'sinh' },
  { label: 'cosh', latex: '\\cosh', display: 'cosh' },
  { label: 'tanh', latex: '\\tanh', display: 'tanh' },
  { label: 'coth', latex: '\\coth', display: 'coth' },
  { label: 'log', latex: '\\log', display: 'log' },
  { label: 'log_b', latex: '\\log_{b}', display: 'log_b' },
  { label: 'ln', latex: '\\ln', display: 'ln' },
  { label: 'exp', latex: '\\exp', display: 'exp' },
  { label: 'det', latex: '\\det', display: 'det' },
  { label: 'dim', latex: '\\dim', display: 'dim' },
  { label: 'ker', latex: '\\ker', display: 'ker' },
  { label: 'hom', latex: '\\hom', display: 'hom' },
  { label: 'deg', latex: '\\deg', display: 'deg' },
  { label: 'gcd', latex: '\\gcd', display: 'gcd' },
  { label: 'lcm', latex: '\\lcm', display: 'lcm' },
  { label: 'min', latex: '\\min', display: 'min' },
  { label: 'max', latex: '\\max', display: 'max' },
  { label: 'sup', latex: '\\sup', display: 'sup' },
  { label: 'inf', latex: '\\inf', display: 'inf' },
  { label: 'arg', latex: '\\arg', display: 'arg' },
  { label: 'limsup', latex: '\\limsup', display: 'lim\u20D7sup' },
  { label: 'liminf', latex: '\\liminf', display: 'lim\u20D7inf' },
];

const TAB_DELIMITERS: SymbolItem[] = [
  { label: 'Absolute |', latex: '\\left| x \\right|', display: '|x|' },
  { label: 'Norm ||', latex: '\\left\\| x \\right\\|', display: '\u2016x\u2016' },
  { label: 'Floor', latex: '\\left\\lfloor x \\right\\rfloor', display: '\u230Ax\u230B' },
  { label: 'Ceil', latex: '\\left\\lceil x \\right\\rceil', display: '\u2308x\u2309' },
  { label: 'Parentheses', latex: '\\left( x \\right)', display: '(x)' },
  { label: 'Brackets', latex: '\\left[ x \\right]', display: '[x]' },
  { label: 'Braces', latex: '\\left\\{ x \\right\\}', display: '{x}' },
  { label: 'Angle', latex: '\\left\\langle x \\right\\rangle', display: '\u27E8x\u27E9' },
  { label: 'Group', latex: '\\left\\lgroup x \\right\\rgroup', display: '\u27EE x \u27EF' },
  { label: 'Pipe', latex: '\\left| x \\right|', display: '| x |' },
  { label: 'Double Bar', latex: '\\left\\| x \\right\\|', display: '\u2016 x \u2016' },
];

const TAB_MATRICES: SymbolItem[] = [
  { label: '2x2 Matrix', latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', display: '(2\u00D72)' },
  { label: '3x3 Matrix', latex: '\\begin{pmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{pmatrix}', display: '(3\u00D73)' },
  { label: '2x2 Brackets', latex: '\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}', display: '[2\u00D72]' },
  { label: '3x3 Brackets', latex: '\\begin{bmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{bmatrix}', display: '[3\u00D73]' },
  { label: '2x2 Determ.', latex: '\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}', display: '|2\u00D72|' },
  { label: '3x3 Determ.', latex: '\\begin{vmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{vmatrix}', display: '|3\u00D73|' },
  { label: 'Augmented 2x3', latex: '\\left[\\begin{array}{cc|c} a & b & c \\\\ d & e & f \\end{array}\\right]', display: '[2|3]' },
  { label: 'Cases', latex: '\\begin{cases} a & \\text{if } x > 0 \\\\ b & \\text{otherwise} \\end{cases}', display: '{cases}' },
  { label: 'Row Vector', latex: '\\begin{pmatrix} a & b & c \\end{pmatrix}', display: '(1\u00D73)' },
  { label: 'Col Vector', latex: '\\begin{pmatrix} a \\\\ b \\\\ c \\end{pmatrix}', display: '(3\u00D71)' },
  { label: 'Diag Matrix', latex: '\\operatorname{diag}(a, b, c)', display: 'diag' },
];

const TABS: { id: string; label: string; symbols: SymbolItem[] }[] = [
  { id: 'common', label: 'Common', symbols: TAB_COMMON },
  { id: 'greek', label: 'Greek', symbols: TAB_GREEK },
  { id: 'operators', label: 'Operators', symbols: TAB_OPERATORS },
  { id: 'arrows', label: 'Arrows', symbols: TAB_ARROWS },
  { id: 'relations', label: 'Relations', symbols: TAB_RELATIONS },
  { id: 'functions', label: 'Functions', symbols: TAB_FUNCTIONS },
  { id: 'delimiters', label: 'Delimiters', symbols: TAB_DELIMITERS },
  { id: 'matrices', label: 'Matrices', symbols: TAB_MATRICES },
];

const ALL_SYMBOLS = TABS.flatMap((t) => t.symbols);

// Simple LaTeX-to-HTML rendering for the preview area
function simpleLatexToHtml(latex: string): string {
  let html = latex;
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const subs: [RegExp, string][] = [
    [/\\frac\{([^}]*)\}\{([^}]*)\}/g, '<sup>$1</sup>\u2044<sub>$2</sub>'],
    [/\\sqrt\{([^}]*)\}/g, '\u221A($1)'],
    [/\\sqrt\[([^\]]*)\]\{([^}]*)\}/g, '<sup>$1</sup>\u221A($2)'],
    [/\\int(_\{([^}]*)\})?(\^\{([^}]*)\})?/g, '\u222B<sub>$2</sub><sup>$4</sup>'],
    [/\\iint(_\{([^}]*)\})?(\^\{([^}]*)\})?/g, '\u222C<sub>$2</sub><sup>$4</sup>'],
    [/\\iiint(_\{([^}]*)\})?(\^\{([^}]*)\})?/g, '\u222D<sub>$2</sub><sup>$4</sup>'],
    [/\\oint/g, '\u222E'],
    [/\\sum(_\{([^}]*)\})?(\^\{([^}]*)\})?/g, '\u2211<sub>$2</sub><sup>$4</sup>'],
    [/\\prod(_\{([^}]*)\})?(\^\{([^}]*)\})?/g, '\u220F<sub>$2</sub><sup>$4</sup>'],
    [/\\coprod(_\{([^}]*)\})?(\^\{([^}]*)\})?/g, '\u2210<sub>$2</sub><sup>$4</sup>'],
    [/\\lim_\{([^}]*)\}/g, 'lim($1)'],
    [/\\infty/g, '\u221E'], [/\\pm/g, '\u00B1'], [/\\mp/g, '\u2213'],
    [/\\neq/g, '\u2260'], [/\\leq/g, '\u2264'], [/\\geq/g, '\u2265'],
    [/\\approx/g, '\u2248'], [/\\equiv/g, '\u2261'], [/\\sim/g, '\u223C'],
    [/\\cong/g, '\u2245'], [/\\propto/g, '\u221D'],
    [/\\times/g, '\u00D7'], [/\\div/g, '\u00F7'], [/\\cdot/g, '\u00B7'],
    [/\\alpha/g, '\u03B1'], [/\\beta/g, '\u03B2'], [/\\gamma/g, '\u03B3'],
    [/\\delta/g, '\u03B4'], [/\\epsilon/g, '\u03B5'], [/\\theta/g, '\u03B8'],
    [/\\lambda/g, '\u03BB'], [/\\mu/g, '\u03BC'], [/\\pi/g, '\u03C0'],
    [/\\sigma/g, '\u03C3'], [/\\omega/g, '\u03C9'], [/\\phi/g, '\u03C6'],
    [/\\rho/g, '\u03C1'], [/\\tau/g, '\u03C4'], [/\\eta/g, '\u03B7'],
    [/\\nu/g, '\u03BD'], [/\\partial/g, '\u2202'], [/\\nabla/g, '\u2207'],
    [/\\forall/g, '\u2200'], [/\\exists/g, '\u2203'], [/\\in/g, '\u2208'],
    [/\\notin/g, '\u2209'], [/\\subset/g, '\u2282'], [/\\supset/g, '\u2283'],
    [/\\cup/g, '\u222A'], [/\\cap/g, '\u2229'], [/\\emptyset/g, '\u2205'],
    [/\\wedge/g, '\u2227'], [/\\vee/g, '\u2228'], [/\\neg/g, '\u00AC'],
    [/\\Rightarrow/g, '\u21D2'], [/\\Leftarrow/g, '\u21D0'], [/\\Leftrightarrow/g, '\u21D4'],
    [/\\rightarrow/g, '\u2192'], [/\\leftarrow/g, '\u2190'], [/\\leftrightarrow/g, '\u2194'],
    [/\\vec\{([^}]*)\}/g, '$1\u20D7'], [/\\hat\{([^}]*)\}/g, '$1\u0302'],
    [/\\bar\{([^}]*)\}/g, '$1\u0304'], [/\\dot\{([^}]*)\}/g, '$1\u0307'],
    [/\\tilde\{([^}]*)\}/g, '$1\u0303'],
    [/\\sin/g, 'sin'], [/\\cos/g, 'cos'], [/\\tan/g, 'tan'],
    [/\\log/g, 'log'], [/\\ln/g, 'ln'], [/\\exp/g, 'exp'],
    [/\^{([^}]*)}/g, '<sup>$1</sup>'],
    [/_{([^}]*)}/g, '<sub>$1</sub>'],
    [/\\left/g, ''], [/\\right/g, ''],
    [/\\begin\{pmatrix\}(.+?)\\end\{pmatrix\}/gs, '[$1]'],
    [/\\begin\{bmatrix\}(.+?)\\end\{bmatrix\}/gs, '[$1]'],
    [/\\begin\{vmatrix\}(.+?)\\end\{vmatrix\}/gs, '|$1|'],
    [/\\begin\{cases\}(.+?)\\end\{cases\}/gs, '{$1}'],
    [/\\begin\{array\}(.+?)\\end\{array\}/gs, '[$1]'],
    [/\\operatorname\{([^}]*)\}/g, '$1'],
    [/\\text\{([^}]*)\}/g, '$1'],
    [/\\\\/g, '<br/>'], [/\\,/g, ' '], [/\\;/g, ' '],
    [/\\! /g, ''], [/\\ /g, ' '],
  ];

  for (const [regex, replacement] of subs) {
    html = html.replace(regex, replacement);
  }
  return html;
}

// Module-level flag: MathLive loaded with fonts configured at least once
let mathliveConfigured = false;
let mathliveCssInjected = false;

function injectMathLiveStyles() {
  if (mathliveCssInjected || typeof document === 'undefined') return;
  mathliveCssInjected = true;
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

type MathLiveStatus = 'loading' | 'ready' | 'fallback';

export function MathEditorDialog({
  open,
  onOpenChange,
  onInsert,
  initialLatex = '',
  initialDisplayMode = false,
}: MathEditorDialogProps) {
  const [latex, setLatex] = useState(initialLatex);
  const [displayMode, setDisplayMode] = useState(initialDisplayMode);
  const [mathliveStatus, setMathliveStatus] = useState<MathLiveStatus>('loading');
  const mathFieldRef = useRef<HTMLDivElement>(null);
  const mathFieldInstance = useRef<any>(null);
  const [symbolSearch, setSymbolSearch] = useState('');
  const [activeTab, setActiveTab] = useState('common');

  useEffect(() => {
    if (!open) return;

    setLatex(initialLatex);
    setDisplayMode(initialDisplayMode);
    setMathliveStatus('loading');
    mathFieldInstance.current = null;

    let cancelled = false;

    // Inject font-face CSS and configure MathLive font directory before loading
    injectMathLiveStyles();

    // Attempt to load MathLive
    import('mathlive')
      .then((mathliveModule) => {
        if (cancelled) return;

        const MFE = (mathliveModule as any).MathFieldElement;
        if (!MFE) {
          setMathliveStatus('fallback');
          return;
        }

        // Configure fonts directory and virtual keyboard ONCE
        if (!mathliveConfigured) {
          MFE.fontsDirectory = '/mathlive-fonts/';
          MFE.mathVirtualKeyboardPolicy = 'manual';
          mathliveConfigured = true;
        }

        // Give DOM time to mount
        setTimeout(() => {
          if (cancelled) return;
          try {
            if (mathFieldRef.current) {
              mathFieldRef.current.innerHTML = '';
              const el = new MFE() as any;
              mathFieldInstance.current = el;
              mathFieldRef.current.appendChild(el);
              el.value = initialLatex || '';
              el.addEventListener('input', (e: any) => {
                const val = (e.target as any).value || '';
                setLatex(val);
              });
              setMathliveStatus('ready');
            } else {
              setMathliveStatus('fallback');
            }
          } catch (err) {
            console.warn('MathLive MathFieldElement creation failed, using fallback:', err);
            setMathliveStatus('fallback');
          }
        }, 200);
      })
      .catch((err) => {
        if (!cancelled) {
          console.warn('MathLive failed to load, using fallback:', err);
          setMathliveStatus('fallback');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, initialLatex, initialDisplayMode]);

  const handleInsert = useCallback(() => {
    const currentLatex = mathFieldInstance.current?.value || latex;
    if (currentLatex.trim()) {
      onInsert(currentLatex, displayMode);
      handleClose();
    }
  }, [latex, displayMode, onInsert]);

  const handleClose = useCallback(() => {
    setLatex('');
    setDisplayMode(false);
    if (mathFieldRef.current) {
      mathFieldRef.current.innerHTML = '';
    }
    mathFieldInstance.current = null;
    setMathliveStatus('loading');
    onOpenChange(false);
  }, [onOpenChange]);

  const insertSymbol = useCallback((symbolLatex: string) => {
    if (mathliveStatus === 'ready' && mathFieldInstance.current) {
      try {
        mathFieldInstance.current.executeCommand('insert', symbolLatex);
        setLatex(mathFieldInstance.current.value || '');
        return;
      } catch {
        // fall through to manual insert
      }
    }
    setLatex((prev) => prev + symbolLatex);
  }, [mathliveStatus]);

  // Filter symbols based on search
  const filteredSymbols = useMemo(() => {
    if (!symbolSearch) {
      const tab = TABS.find((t) => t.id === activeTab);
      return tab ? tab.symbols : TAB_COMMON;
    }
    return ALL_SYMBOLS.filter(
      (s) =>
        s.label.toLowerCase().includes(symbolSearch.toLowerCase()) ||
        s.latex.toLowerCase().includes(symbolSearch.toLowerCase())
    );
  }, [symbolSearch, activeTab]);

  const previewHtml = simpleLatexToHtml(latex);

  const handleToggleVirtualKeyboard = useCallback(() => {
    if (mathliveStatus === 'ready' && mathFieldInstance.current) {
      try {
        const currentPolicy = mathFieldInstance.current.mathVirtualKeyboardPolicy;
        if (currentPolicy === 'manual') {
          mathFieldInstance.current.executeCommand('showVirtualKeyboard');
        } else {
          mathFieldInstance.current.executeCommand('hideVirtualKeyboard');
        }
      } catch {
        // ignore
      }
    }
  }, [mathliveStatus]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sigma className="h-5 w-5" />
            {initialLatex ? 'Edit Math Equation' : 'Insert Math Equation'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden space-y-3">
          {mathliveStatus === 'loading' ? (
            <div className="flex items-center justify-center h-24 gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading math editor...
            </div>
          ) : mathliveStatus === 'ready' ? (
            <div className="space-y-1.5">
              <Label>Equation Editor</Label>
              <div
                ref={mathFieldRef}
                className="border rounded-lg p-3 min-h-[80px] bg-white focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-shadow"
                style={
                  {
                    '--math-display': displayMode ? 'block' : 'inline',
                  } as React.CSSProperties
                }
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Keyboard className="h-3 w-3" />
                  Type LaTeX or use symbol buttons below.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleToggleVirtualKeyboard}
                >
                  <Keyboard className="h-3 w-3 mr-1" />
                  Virtual Keyboard
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>LaTeX Input</Label>
              <textarea
                value={latex}
                onChange={(e) => setLatex(e.target.value)}
                placeholder="Type LaTeX, e.g. \frac{a}{b} + \sqrt{c}"
                className="w-full min-h-[100px] px-3 py-2 border rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                autoFocus
              />
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Live Preview</Label>
                <div
                  className="border rounded-lg p-3 min-h-[50px] bg-muted/30 text-center"
                  style={{ fontSize: displayMode ? '1.2em' : '1em' }}
                >
                  {latex.trim() ? (
                    <span
                      dangerouslySetInnerHTML={{ __html: previewHtml }}
                      className="font-serif"
                    />
                  ) : (
                    <span className="text-muted-foreground italic">Type LaTeX above to see preview</span>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                MathLive editor unavailable. Using plain LaTeX input with live preview.
              </p>
            </div>
          )}

          {/* Tabbed Symbol Keyboard */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Symbol Keyboard ({ALL_SYMBOLS.length} symbols)</Label>
            <input
              type="text"
              value={symbolSearch}
              onChange={(e) => setSymbolSearch(e.target.value)}
              placeholder="Search symbols... (e.g. 'alpha', 'integral', 'matrix')"
              className="w-full h-7 px-2 text-xs border rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
            />

            {/* Tabs */}
            {!symbolSearch && (
              <div className="flex gap-1 flex-wrap">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-2 py-0.5 text-[10px] rounded-md border transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background hover:bg-accent border-border'
                    }`}
                  >
                    {tab.label} ({tab.symbols.length})
                  </button>
                ))}
              </div>
            )}

            {/* Symbol Grid */}
            <ScrollArea className="max-h-40">
              <div className="grid grid-cols-8 sm:grid-cols-10 gap-0.5 p-0.5">
                {filteredSymbols.map((sym) => (
                  <button
                    key={sym.label}
                    type="button"
                    onClick={() => insertSymbol(sym.latex)}
                    className="flex items-center justify-center px-0.5 py-1 text-sm border rounded hover:bg-accent transition-colors min-h-[32px]"
                    title={`${sym.label}: ${sym.latex}`}
                  >
                    {sym.display}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Display mode toggle */}
          <div className="flex items-center gap-3">
            <Switch
              checked={displayMode}
              onCheckedChange={setDisplayMode}
              id="display-mode-toggle"
            />
            <Label htmlFor="display-mode-toggle" className="cursor-pointer">
              Display mode (block, centered)
            </Label>
          </div>

          {/* Current LaTeX code preview */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Current LaTeX</Label>
            <code className="block text-xs bg-muted px-3 py-2 rounded-md overflow-x-auto font-mono max-h-20">
              {latex || '(empty)'}
            </code>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleInsert} disabled={!latex.trim()}>
            {initialLatex ? 'Update Equation' : 'Insert Equation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default MathEditorDialog;
