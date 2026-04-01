'use client';

import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Typography from '@tiptap/extension-typography';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';

import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from '@/components/ui/resizable';
import { EditorToolbar } from './EditorToolbar';
import { EditorPreview } from './EditorPreview';
import { MathEquation } from '@/lib/editor/math-extension';
import { GeometryCanvas } from '@/lib/editor/geometry-extension';
import { lowlight } from '@/lib/editor/highlight-config';

interface RichTextEditorProps {
  content?: string;
  onChange?: (html: string) => void;
  editable?: boolean;
  placeholder?: string;
  showPreview?: boolean;
  className?: string;
}

export function RichTextEditor({
  content = '',
  onChange,
  editable = true,
  placeholder = 'Start writing...',
  showPreview = false,
  className = '',
}: RichTextEditorProps) {
  const [htmlContent, setHtmlContent] = useState(content);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: { levels: [1, 2, 3, 4] },
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline hover:text-primary/80',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      CodeBlockLowlight.configure({ lowlight }),
      Color,
      TextStyle,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({
        placeholder,
      }),
      CharacterCount,
      Typography,
      Subscript,
      Superscript,
      MathEquation,
      GeometryCanvas,
    ],
    content,
    editable,
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      setHtmlContent(html);
      onChange?.(html);
    },
    editorProps: {
      attributes: {
        class: 'tiptap min-h-[300px] px-8 py-6 focus:outline-none',
      },
      handleClick: (_view, pos, event) => {
        // Handle click on math equations to open the editor
        const target = event.target as HTMLElement;
        const mathEl = target.closest('[data-math-equation]') as HTMLElement | null;

        if (mathEl) {
          const latex = mathEl.getAttribute('data-latex') || '';
          const displayMode = mathEl.getAttribute('data-display-mode') === 'true';

          // Dispatch window-level event that EditorToolbar listens for
          window.dispatchEvent(
            new CustomEvent('edit-math-equation', {
              detail: { latex, displayMode, pos },
            })
          );
        }
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const wordCount = editor?.storage.characterCount.words() || 0;
  const charCount = editor?.storage.characterCount.characters() || 0;

  if (!editor) {
    return (
      <div className={`border rounded-lg bg-background ${className}`}>
        <div className="p-6 animate-pulse">
          <div className="h-4 bg-muted rounded mb-3 w-3/4" />
          <div className="h-4 bg-muted rounded mb-3 w-1/2" />
          <div className="h-4 bg-muted rounded w-2/3" />
        </div>
      </div>
    );
  }

  const editorPanel = (
    <div className={`flex flex-col h-full border rounded-lg bg-background overflow-hidden ${className}`}>
      <EditorToolbar editor={editor} />
      <div className="flex-1 overflow-y-auto max-h-[600px]">
        <EditorContent editor={editor} />
      </div>
      <div className="flex items-center justify-between px-4 py-1.5 border-t bg-muted/30 text-xs text-muted-foreground">
        <span>{wordCount} words</span>
        <span>{charCount} characters</span>
      </div>
    </div>
  );

  if (!showPreview) {
    return editorPanel;
  }

  return (
    <ResizablePanelGroup direction="horizontal" className={`h-full rounded-lg overflow-hidden ${className}`}>
      <ResizablePanel defaultSize={50} minSize={30}>
        {editorPanel}
      </ResizablePanel>
      <ResizableHandle className="w-1.5 bg-border hover:bg-primary/20 transition-colors active:bg-primary/30" />
      <ResizablePanel defaultSize={50} minSize={30}>
        <div className="h-full border rounded-lg bg-background overflow-hidden">
          <EditorPreview html={htmlContent} />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

export default RichTextEditor;
