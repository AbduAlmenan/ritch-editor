import mammoth from 'mammoth';

export async function importFromWord(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();

  const result = await mammoth.convertToHtml(
    { arrayBuffer },
    {
      styleMap: [
        "p[style-name='Title'] => h1",
        "p[style-name='Heading 1'] => h1",
        "p[style-name='Heading 2'] => h2",
        "p[style-name='Heading 3'] => h3",
        "p[style-name='Subtitle'] => h2",
      ],
    }
  );

  return result.value;
}

export function importFromMarkdown(text: string): string {
  let html = text;

  // Code blocks (must be before inline code)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, lang, code) => {
    const languageClass = lang ? ` class="language-${lang}"` : '';
    return `<pre><code${languageClass}>${escapeHtml(code.trim())}</code></pre>`;
  });

  // Headings
  html = html.replace(/^#### (.*$)/gm, '<h4>$1</h4>');
  html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');

  // Bold + Italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Strikethrough
  html = html.replace(/~~(.*?)~~/g, '<s>$1</s>');

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Horizontal rule
  html = html.replace(/^---$/gm, '<hr>');

  // Blockquotes
  html = html.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>');
  // Merge adjacent blockquotes
  html = html.replace(/<\/blockquote>\n<blockquote>/g, '\n');

  // Unordered lists
  html = html.replace(/^[\*\-] (.*$)/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

  // Ordered lists
  html = html.replace(/^\d+\. (.*$)/gm, '<li>$1</li>');

  // Display math
  html = html.replace(/\$\$([\s\S]*?)\$\$/g, (_match, latex) => {
    return `<math-equation latex="${escapeHtml(latex.trim())}" display-mode="true"></math-equation>`;
  });

  // Inline math
  html = html.replace(/\$([^\$\n]+)\$/g, (_match, latex) => {
    return `<math-equation latex="${escapeHtml(latex.trim())}" display-mode="false"></math-equation>`;
  });

  // Paragraphs - wrap remaining text blocks
  html = html.split('\n\n').map(block => {
    block = block.trim();
    if (!block) return '';
    if (block.startsWith('<h') || block.startsWith('<pre') || block.startsWith('<ul') || 
        block.startsWith('<ol') || block.startsWith('<blockquote') || block.startsWith('<hr') ||
        block.startsWith('<table') || block.startsWith('<math-equation') || block.startsWith('<geometry')) {
      return block;
    }
    if (block.startsWith('<li>')) {
      return `<ul>${block}</ul>`;
    }
    return `<p>${block}</p>`;
  }).join('\n');

  // Clean up remaining newlines within paragraphs
  html = html.replace(/<p>(.*?)\n(.*?)<\/p>/gs, '<p>$1 $2</p>');

  return html.trim();
}

export async function importMarkdownFile(file: File): Promise<string> {
  const text = await file.text();
  return importFromMarkdown(text);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
