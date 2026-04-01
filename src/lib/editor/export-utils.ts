import type { Editor } from '@tiptap/react';

export function exportToHTML(editor: Editor): string {
  return editor.getHTML();
}

export function exportToMarkdown(editor: Editor): string {
  const html = editor.getHTML();
  return htmlToMarkdown(html);
}

export function exportToPlainText(editor: Editor): string {
  return editor.getText();
}

function htmlToMarkdown(html: string): string {
  let md = html;

  // Headings
  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');

  // Bold and Italic
  md = md.replace(/<(strong|b)[^>]*>(.*?)<\/(strong|b)>/gi, '**$2**');
  md = md.replace(/<(em|i)[^>]*>(.*?)<\/(em|i)>/gi, '*$2*');
  md = md.replace(/<u[^>]*>(.*?)<\/u>/gi, '<u>$1</u>');
  md = md.replace(/<s[^>]*>(.*?)<\/s>/gi, '~~$1~~');
  md = md.replace(/<sub[^>]*>(.*?)<\/sub>/gi, '~$1~');
  md = md.replace(/<sup[^>]*>(.*?)<\/sup>/gi, '^$1^');

  // Code blocks
  md = md.replace(/<pre[^>]*><code[^>]*class="[^"]*language-([^"]*)"[^>]*>(.*?)<\/code><\/pre>/gis, '```$1\n$2\n```\n\n');
  md = md.replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gis, '```\n$1\n```\n\n');

  // Inline code
  md = md.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');

  // Links
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');

  // Images
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)');
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, '![]($1)');

  // Blockquotes
  md = md.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, (_, content) => {
    return content
      .split('\n')
      .map((line: string) => `> ${line}`)
      .join('\n') + '\n\n';
  });

  // Horizontal rule
  md = md.replace(/<hr[^>]*\/?>/gi, '\n---\n\n');

  // Lists
  md = md.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
  md = md.replace(/<\/?[ou]l[^>]*>/gi, '\n');

  // Tables
  md = md.replace(/<table[^>]*>(.*?)<\/table>/gis, (_, tableContent) => {
    const rows = tableContent.match(/<tr[^>]*>(.*?)<\/tr>/gis);
    if (!rows) return '';
    let tableMd = '';
    rows.forEach((row: string, index: number) => {
      const cells = row.match(/<t[hd][^>]*>(.*?)<\/t[hd]>/gis);
      if (!cells) return;
      const cellContents = cells.map((cell: string) =>
        cell.replace(/<t[hd][^>]*>/gi, '').replace(/<\/t[hd]>/gi, '').trim()
      );
      tableMd += '| ' + cellContents.join(' | ') + ' |\n';
      if (index === 0) {
        tableMd += '| ' + cellContents.map(() => '---').join(' | ') + ' |\n';
      }
    });
    return tableMd + '\n';
  });

  // Math equations
  md = md.replace(/<math-equation[^>]*latex="([^"]*)"[^>]*display-mode="true"[^>]*>.*?<\/math-equation>/gi, '$$\n$1\n$$\n\n');
  md = md.replace(/<math-equation[^>]*latex="([^"]*)"[^>]*display-mode="false"[^>]*>.*?<\/math-equation>/gi, '$$$1$$$');
  md = md.replace(/<math-equation[^>]*latex="([^"]*)"[^>]*\/>/gi, '$$$1$$$');

  // Geometry canvas - just mark as image placeholder
  md = md.replace(/<geometry-canvas[^>]*>.*?<\/geometry-canvas>/gi, '[Geometry Canvas]\n\n');
  md = md.replace(/<geometry-canvas[^>]*\/>/gi, '[Geometry Canvas]\n\n');

  // Paragraphs
  md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
  md = md.replace(/<div[^>]*>(.*?)<\/div>/gi, '$1\n');

  // Clean remaining HTML tags
  md = md.replace(/<br[^>]*\/?>/gi, '\n');
  md = md.replace(/<[^>]+>/g, '');

  // Clean up whitespace
  md = md.replace(/\n{3,}/g, '\n\n');
  md = md.replace(/&nbsp;/g, ' ');
  md = md.replace(/&amp;/g, '&');
  md = md.replace(/&lt;/g, '<');
  md = md.replace(/&gt;/g, '>');
  md = md.replace(/&quot;/g, '"');

  return md.trim();
}
