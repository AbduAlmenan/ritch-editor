import { common, createLowlight } from 'lowlight';

export const lowlight = createLowlight(common);

export const supportedLanguages = [
  'javascript',
  'typescript',
  'python',
  'html',
  'css',
  'json',
  'markdown',
  'bash',
  'sql',
  'java',
  'cpp',
  'c',
  'rust',
  'go',
  'ruby',
  'php',
  'swift',
  'kotlin',
  'yaml',
  'xml',
  'jsx',
  'tsx',
  'graphql',
  'shell',
  'plaintext',
];

export function getLanguageLabel(lang: string): string {
  const labels: Record<string, string> = {
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    python: 'Python',
    html: 'HTML',
    css: 'CSS',
    json: 'JSON',
    markdown: 'Markdown',
    bash: 'Bash',
    sql: 'SQL',
    java: 'Java',
    cpp: 'C++',
    c: 'C',
    rust: 'Rust',
    go: 'Go',
    ruby: 'Ruby',
    php: 'PHP',
    swift: 'Swift',
    kotlin: 'Kotlin',
    yaml: 'YAML',
    xml: 'XML',
    jsx: 'JSX',
    tsx: 'TSX',
    graphql: 'GraphQL',
    shell: 'Shell',
    plaintext: 'Plain Text',
  };
  return labels[lang] || lang;
}
