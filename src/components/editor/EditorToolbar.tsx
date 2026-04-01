'use client';

import React, { useState, useCallback } from 'react';
import type { Editor } from '@tiptap/react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileImportMenu } from './FileImportMenu';
import { MathEditorDialog } from './MathEditorDialog';
import {
  GeometryEditorDialog,
  type GeometryEditorSaveData,
} from './GeometryEditorDialog';
import { ImageUploadDialog } from './ImageUploadDialog';
import { createDefaultCoordinateConfig } from '@/lib/editor/shape-definitions';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Subscript,
  Superscript,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  CheckSquare,
  Code2,
  Quote,
  Minus,
  Link2,
  ImageIcon,
  Table2,
  Sigma,
  Pentagon,
  Undo2,
  Redo2,
  Type,
  Heading1,
  Heading2,
  Heading3,
  ChevronDown,
  Palette,
  Highlighter,
  Download,
  Grid3X3,
} from 'lucide-react';
import { exportToHTML, exportToMarkdown, exportToPlainText } from '@/lib/editor/export-utils';

const PRESET_COLORS = [
  '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
  '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
  '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc',
  '#dd7e6b', '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#a4c2f4', '#9fc5e8', '#b4a7d6', '#d5a6bd',
  '#cc4125', '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6d9eeb', '#6fa8dc', '#8e7cc3', '#c27ba0',
  '#a61c00', '#cc0000', '#e69138', '#f1c232', '#6aa84f', '#45818e', '#3c78d8', '#3d85c6', '#674ea7', '#a64d79',
  '#85200c', '#990000', '#b45f06', '#bf9000', '#38761d', '#134f5c', '#1155cc', '#0b5394', '#351c75', '#741b47',
];

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  tooltip: string;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, isActive = false, disabled = false, tooltip, children }: ToolbarButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={isActive ? 'secondary' : 'ghost'}
          size="sm"
          className="h-8 w-8 p-0"
          onClick={onClick}
          disabled={disabled}
          aria-label={tooltip}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

// Inline color picker button with proper Tooltip > Popover > Button hierarchy
function ColorPickerButton({
  color,
  onChange,
  tooltip,
  icon,
}: {
  color: string;
  onChange: (color: string) => void;
  tooltip: string;
  icon: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [customColor, setCustomColor] = useState(color);

  const handleCustomColorChange = (value: string) => {
    setCustomColor(value);
    if (/^#[0-9a-fA-F]{6}$/.test(value)) {
      onChange(value);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              aria-label={tooltip}
            >
              <div className="relative flex items-center justify-center">
                {icon}
                <div
                  className="absolute bottom-0.5 left-1 right-1 h-1.5 rounded-sm"
                  style={{ backgroundColor: color }}
                />
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="start">
            <Label className="text-xs text-muted-foreground mb-2 block">{tooltip}</Label>
            <div className="grid grid-cols-10 gap-1 mb-3">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  className="w-5 h-5 rounded-sm border border-gray-300 hover:scale-110 transition-transform cursor-pointer"
                  style={{ backgroundColor: c }}
                  onClick={() => {
                    onChange(c);
                    setCustomColor(c);
                  }}
                  title={c}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-md border border-gray-300 shrink-0"
                style={{ backgroundColor: color }}
              />
              <Input
                value={customColor}
                onChange={(e) => handleCustomColorChange(e.target.value)}
                placeholder="#000000"
                className="h-8 text-xs font-mono"
                maxLength={7}
              />
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-2 text-xs"
                onClick={() => {
                  onChange(customColor);
                  setOpen(false);
                }}
              >
                Set
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

interface EditorToolbarProps {
  editor: Editor | null;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const [mathDialogOpen, setMathDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [geometryDialogOpen, setGeometryDialogOpen] = useState(false);
  const [textColor, setTextColor] = useState('#000000');
  const [highlightColor, setHighlightColor] = useState('#ffff00');
  const [editingMathPos, setEditingMathPos] = useState<number | null>(null);
  const [editingMathLatex, setEditingMathLatex] = useState('');
  const [editingMathDisplayMode, setEditingMathDisplayMode] = useState(false);

  const handleMathInsert = useCallback(
    (latex: string, displayMode: boolean) => {
      if (!editor) return;
      editor
        .chain()
        .focus()
        .insertMathEquation({ latex, displayMode })
        .run();
    },
    [editor]
  );

  // Listen for window-level edit-math-equation events dispatched by editor click handler
  const openMathEditorForEdit = useCallback(
    (latex: string, displayMode: boolean, pos: number) => {
      setEditingMathLatex(latex);
      setEditingMathDisplayMode(displayMode);
      setEditingMathPos(pos);
      setMathDialogOpen(true);
    },
    []
  );

  React.useEffect(() => {
    const handleWindowEditMath = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { latex, displayMode, pos } = customEvent.detail;
      openMathEditorForEdit(latex, displayMode, pos);
    };
    window.addEventListener('edit-math-equation', handleWindowEditMath);
    return () => window.removeEventListener('edit-math-equation', handleWindowEditMath);
  }, [openMathEditorForEdit]);

  const handleMathDialogInsert = useCallback(
    (latex: string, displayMode: boolean) => {
      if (editingMathPos !== null && editor) {
        // Update existing math equation at the stored position
        const { state } = editor;
        const node = state.doc.nodeAt(editingMathPos);
        if (node && node.type.name === 'mathEquation') {
          editor
            .chain()
            .focus()
            .command(({ tr }) => {
              tr.setNodeMarkup(editingMathPos, undefined, {
                latex,
                displayMode,
              });
              return true;
            })
            .run();
        }
      } else {
        handleMathInsert(latex, displayMode);
      }
      setEditingMathPos(null);
      setEditingMathLatex('');
      setEditingMathDisplayMode(false);
    },
    [editingMathPos, editor, handleMathInsert]
  );

  const handleImageInsert = useCallback(
    (src: string, alt: string) => {
      if (!editor) return;
      editor.chain().focus().setImage({ src, alt }).run();
    },
    [editor]
  );

  const handleImport = useCallback(
    (html: string) => {
      if (!editor) return;
      editor.chain().focus().setContent(html).run();
    },
    [editor]
  );

  const handleInsertTable = useCallback(() => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  }, [editor]);

  const handleInsertLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  const [showXYZMode, setShowXYZMode] = useState(false);

  const handleInsertGeometry = useCallback(() => {
    setShowXYZMode(false);
    setGeometryDialogOpen(true);
  }, []);

  // Insert XYZ coordinate system DIRECTLY into document — no dialog needed
  const handleInsertXYZ = useCallback(() => {
    if (!editor) return;
    const coordConfig = createDefaultCoordinateConfig();
    coordConfig.showZAxis = true;
    coordConfig.showAxes = true;
    coordConfig.showGrid = true;
    coordConfig.showLabels = true;
    coordConfig.showTickMarks = true;
    coordConfig.showOrigin = true;
    coordConfig.showAxisArrows = true;
    editor.chain().focus().insertGeometryCanvas({
      shapes: [],
      width: 700,
      height: 450,
      coordinateConfig: coordConfig,
    }).run();
  }, [editor]);

  const handleInsertGeometryXYZ = useCallback(() => {
    handleInsertXYZ();
  }, [handleInsertXYZ]);

  const handleGeometrySave = useCallback(
    (data: GeometryEditorSaveData) => {
      if (!editor) return;
      editor.chain().focus().insertGeometryCanvas({
        shapes: data.shapes,
        width: data.width,
        height: data.height,
        coordinateConfig: data.coordinateConfig,
      }).run();
    },
    [editor]
  );

  const handleExport = useCallback(
    (format: 'html' | 'markdown' | 'text') => {
      if (!editor) return;
      let content = '';
      let filename = '';
      let mimeType = '';

      switch (format) {
        case 'html':
          content = exportToHTML(editor);
          filename = 'document.html';
          mimeType = 'text/html';
          break;
        case 'markdown':
          content = exportToMarkdown(editor);
          filename = 'document.md';
          mimeType = 'text/markdown';
          break;
        case 'text':
          content = exportToPlainText(editor);
          filename = 'document.txt';
          mimeType = 'text/plain';
          break;
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    },
    [editor]
  );

  if (!editor) {
    return (
      <div className="border-b px-3 py-2 bg-muted/20">
        <div className="h-8 animate-pulse bg-muted rounded" />
      </div>
    );
  }

  return (
    <>
      <div className="border-b bg-muted/20 px-2 py-1.5">
        <div className="flex flex-wrap items-center gap-0.5">
          {/* Undo / Redo */}
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            tooltip="Undo"
          >
            <Undo2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            tooltip="Redo"
          >
            <Redo2 className="h-4 w-4" />
          </ToolbarButton>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Headings */}
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 gap-1 px-2">
                    <Type className="h-4 w-4" />
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                Heading
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().setParagraph().run()}
              >
                <Type className="h-4 w-4 mr-2" /> Paragraph
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              >
                <Heading1 className="h-4 w-4 mr-2" /> Heading 1
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              >
                <Heading2 className="h-4 w-4 mr-2" /> Heading 2
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              >
                <Heading3 className="h-4 w-4 mr-2" /> Heading 3
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Text formatting */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            tooltip="Bold (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            tooltip="Italic (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            tooltip="Underline (Ctrl+U)"
          >
            <Underline className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            tooltip="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleSubscript().run()}
            isActive={editor.isActive('subscript')}
            tooltip="Subscript"
          >
            <Subscript className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
            isActive={editor.isActive('superscript')}
            tooltip="Superscript"
          >
            <Superscript className="h-4 w-4" />
          </ToolbarButton>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Colors - now with proper Tooltip > Popover > Button hierarchy */}
          <ColorPickerButton
            color={textColor}
            onChange={(c) => {
              setTextColor(c);
              editor.chain().focus().setColor(c).run();
            }}
            tooltip="Text Color"
            icon={<Palette className="h-4 w-4" />}
          />

          <ColorPickerButton
            color={highlightColor}
            onChange={(c) => {
              setHighlightColor(c);
              editor.chain().focus().toggleHighlight({ color: c }).run();
            }}
            tooltip="Highlight"
            icon={<Highlighter className="h-4 w-4" />}
          />

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Alignment */}
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            isActive={editor.isActive({ textAlign: 'left' })}
            tooltip="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            isActive={editor.isActive({ textAlign: 'center' })}
            tooltip="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            isActive={editor.isActive({ textAlign: 'right' })}
            tooltip="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            isActive={editor.isActive({ textAlign: 'justify' })}
            tooltip="Justify"
          >
            <AlignJustify className="h-4 w-4" />
          </ToolbarButton>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Lists */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            tooltip="Bullet List"
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            tooltip="Ordered List"
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            isActive={editor.isActive('taskList')}
            tooltip="Task List"
          >
            <CheckSquare className="h-4 w-4" />
          </ToolbarButton>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Block */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive('codeBlock')}
            tooltip="Code Block"
          >
            <Code2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            tooltip="Blockquote"
          >
            <Quote className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            tooltip="Horizontal Rule"
          >
            <Minus className="h-4 w-4" />
          </ToolbarButton>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Insert */}
          <ToolbarButton onClick={handleInsertLink} tooltip="Insert Link">
            <Link2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => setImageDialogOpen(true)} tooltip="Insert Image">
            <ImageIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={handleInsertTable} tooltip="Insert Table (3x3)">
            <Table2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => {
            setEditingMathPos(null);
            setEditingMathLatex('');
            setEditingMathDisplayMode(false);
            setMathDialogOpen(true);
          }} tooltip="Insert Math Equation">
            <Sigma className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={handleInsertGeometry} tooltip="Insert Geometry Canvas">
            <Pentagon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={handleInsertGeometryXYZ} tooltip="Insert XYZ Coordinate System (one-click)">
            <Grid3X3 className="h-4 w-4" />
          </ToolbarButton>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Import */}
          <FileImportMenu onImport={handleImport} />

          {/* Export */}
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 gap-1 px-2">
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Export</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                Export
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport('html')}>
                Export as HTML
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('markdown')}>
                Export as Markdown
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('text')}>
                Export as Plain Text
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Dialogs */}
      <MathEditorDialog
        open={mathDialogOpen}
        onOpenChange={(open) => {
          setMathDialogOpen(open);
          if (!open) {
            setEditingMathPos(null);
            setEditingMathLatex('');
            setEditingMathDisplayMode(false);
          }
        }}
        onInsert={handleMathDialogInsert}
        initialLatex={editingMathLatex}
        initialDisplayMode={editingMathDisplayMode}
      />
      <ImageUploadDialog
        open={imageDialogOpen}
        onOpenChange={setImageDialogOpen}
        onInsert={handleImageInsert}
      />
      <GeometryEditorDialog
        open={geometryDialogOpen}
        onOpenChange={setGeometryDialogOpen}
        onSave={handleGeometrySave}
        showCoordinateSystem={showXYZMode}
      />
    </>
  );
}

export default EditorToolbar;
