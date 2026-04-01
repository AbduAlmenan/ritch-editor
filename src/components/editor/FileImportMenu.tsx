'use client';

import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FileUp, FileText, FileDown } from 'lucide-react';
import { importFromWord, importMarkdownFile } from '@/lib/editor/import-utils';

interface FileImportMenuProps {
  onImport: (html: string) => void;
}

export function FileImportMenu({ onImport }: FileImportMenuProps) {
  const wordInputRef = useRef<HTMLInputElement>(null);
  const markdownInputRef = useRef<HTMLInputElement>(null);

  const handleWordImport = async () => {
    wordInputRef.current?.click();
  };

  const handleMarkdownImport = () => {
    markdownInputRef.current?.click();
  };

  const handleWordFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const html = await importFromWord(file);
      onImport(html);
    } catch (error) {
      console.error('Failed to import Word document:', error);
    }

    if (wordInputRef.current) {
      wordInputRef.current.value = '';
    }
  };

  const handleMarkdownFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const html = await importMarkdownFile(file);
      onImport(html);
    } catch (error) {
      console.error('Failed to import Markdown file:', error);
    }

    if (markdownInputRef.current) {
      markdownInputRef.current.value = '';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-1">
          <FileUp className="h-4 w-4" />
          <span className="hidden sm:inline">Import</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={handleWordImport}>
          <FileText className="h-4 w-4 mr-2" />
          Import Word (.docx)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleMarkdownImport}>
          <FileDown className="h-4 w-4 mr-2" />
          Import Markdown (.md)
        </DropdownMenuItem>
      </DropdownMenuContent>

      <input
        ref={wordInputRef}
        type="file"
        accept=".docx"
        onChange={handleWordFileChange}
        className="hidden"
      />
      <input
        ref={markdownInputRef}
        type="file"
        accept=".md,.markdown,.txt"
        onChange={handleMarkdownFileChange}
        className="hidden"
      />
    </DropdownMenu>
  );
}

export default FileImportMenu;
