'use client';

import React, { useState } from 'react';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sigma,
  Pentagon,
  FileText,
  Code2,
  Palette,
  Image as ImageIcon,
  Download,
  Table2,
  Type,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';

const DEMO_CONTENT = `<h1>Welcome to Rich Text Editor Pro</h1>
<p>This is a <strong>professional-grade rich text editor</strong> built with modern web technologies. It supports a wide range of features for creating rich, interactive documents.</p>

<h2>Text Formatting</h2>
<p>You can make text <strong>bold</strong>, <em>italic</em>, <u>underlined</u>, <s>strikethrough</s>, and even use <sub>subscript</sub> and <sup>superscript</sup>. Combine them for <strong><em>bold italic</em></strong> text.</p>

<p>Apply <mark data-color="#fef08a">highlight colors</mark> to emphasize important text. You can also change <span style="color: #dc2626">text colors</span> to suit your needs.</p>

<h2>Math Equations</h2>
<p>Support for inline math: <span data-math-equation="" data-latex="E=mc^2" data-display-mode="false" contenteditable="false" class="math-equation-inline math-equation-editable">$E=mc^2$</span> and display mode equations:</p>
<span data-math-equation="" data-latex="\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}" data-display-mode="true" contenteditable="false" class="math-equation-display math-equation-editable">$$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$</span>
<p>Another example: <span data-math-equation="" data-latex="a^2 + b^2 = c^2" data-display-mode="false" contenteditable="false" class="math-equation-inline math-equation-editable">$a^2 + b^2 = c^2$</span> (Pythagorean theorem).</p>

<h2>Tables</h2>
<table><tbody><tr><th>Feature</th><th>Status</th><th>Description</th></tr><tr><td>Rich Text</td><td>✅</td><td>Full formatting support</td></tr><tr><td>Math</td><td>✅</td><td>LaTeX equations</td></tr><tr><td>Geometry</td><td>✅</td><td>2D canvas editor</td></tr><tr><td>Import/Export</td><td>✅</td><td>Word, Markdown, HTML</td></tr></tbody></table>

<h2>Code Blocks</h2>
<pre><code class="language-typescript">function greet(name: string): string {
  return \`Hello, \${name}! Welcome to the editor.\`;
}

const message = greet("World");
console.log(message);</code></pre>

<h3>Lists</h3>
<ul><li>Bullet list item one</li><li>Bullet list item two</li><li>Bullet list item three</li></ul>

<ol><li>First ordered item</li><li>Second ordered item</li><li>Third ordered item</li></ol>

<blockquote><p>"The only way to do great work is to love what you do." — Steve Jobs</p></blockquote>

<hr>

<p>Try editing this content! Use the toolbar above to format text, insert math equations, create tables, and more.</p>`;

const features = [
  {
    icon: <Type className="h-6 w-6" />,
    title: 'Rich Text Formatting',
    description: 'Bold, italic, underline, headings, lists, alignment, and more.',
  },
  {
    icon: <Sigma className="h-6 w-6" />,
    title: 'Math Equations',
    description: 'LaTeX support with MathLive editor. Inline and display modes.',
  },
  {
    icon: <Pentagon className="h-6 w-6" />,
    title: 'Geometry Canvas',
    description: '2D geometry editor with mathematical and physics shapes.',
  },
  {
    icon: <Code2 className="h-6 w-6" />,
    title: 'Code Blocks',
    description: 'Syntax-highlighted code blocks with 25+ languages.',
  },
  {
    icon: <Palette className="h-6 w-6" />,
    title: 'Colors & Styles',
    description: 'Text colors, highlight colors, and rich text styling.',
  },
  {
    icon: <Table2 className="h-6 w-6" />,
    title: 'Tables',
    description: 'Insert and edit tables with headers and resizable columns.',
  },
  {
    icon: <ImageIcon className="h-6 w-6" />,
    title: 'Image Upload',
    description: 'Upload images with alt text support and responsive display.',
  },
  {
    icon: <FileText className="h-6 w-6" />,
    title: 'Import & Export',
    description: 'Import Word/Markdown files. Export to HTML, Markdown, or text.',
  },
  {
    icon: <Download className="h-6 w-6" />,
    title: 'Multiple Formats',
    description: 'Export your documents in HTML, Markdown, or plain text.',
  },
];

export default function Home() {
  const [editorContent, setEditorContent] = useState(DEMO_CONTENT);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <img
            src="/editor-hero.png"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="secondary" className="mb-4 px-3 py-1">
              <Sparkles className="h-3 w-3 mr-1" />
              Professional Rich Text Editor
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
              Rich Text Editor{' '}
              <span className="bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
                Pro
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-2">
              Professional Rich Text Editor with Math, Geometry & More
            </p>
            <p className="text-sm text-muted-foreground/70 max-w-xl mx-auto">
              Built with TipTap, MathLive, Konva, and modern React patterns.
              Type, format, calculate, and draw — all in one place.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * i }}
            >
              <Card className="h-full hover:shadow-md transition-shadow border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <span className="text-foreground/70">{feature.icon}</span>
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Editor Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Try It Out</h2>
            <p className="text-muted-foreground flex items-center justify-center gap-1 text-sm">
              <ArrowRight className="h-4 w-4" />
              Edit the content below to explore all features
            </p>
          </div>
          <div className="border rounded-xl shadow-lg overflow-hidden bg-background">
            <RichTextEditor
              content={editorContent}
              onChange={setEditorContent}
              editable={true}
              placeholder="Start writing something amazing..."
              showPreview={true}
              className="h-[700px]"
            />
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <p className="text-xs text-muted-foreground">
          Built with TipTap, MathLive, Konva, Tailwind CSS & shadcn/ui
        </p>
      </footer>
    </div>
  );
}
