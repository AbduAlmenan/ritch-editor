import { Node, mergeAttributes } from '@tiptap/core';

export interface MathEquationOptions {
  HTMLAttributes: Record<string, string>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    mathEquation: {
      insertMathEquation: (attributes: { latex: string; displayMode?: boolean }) => ReturnType;
    };
  }
}

export const MathEquation = Node.create<MathEquationOptions>({
  name: 'mathEquation',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,
  draggable: false,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      latex: {
        default: '',
        parseHTML: element => element.getAttribute('data-latex') || '',
        renderHTML: attributes => ({
          'data-latex': attributes.latex,
        }),
      },
      displayMode: {
        default: false,
        parseHTML: element => element.getAttribute('data-display-mode') === 'true',
        renderHTML: attributes => ({
          'data-display-mode': String(attributes.displayMode),
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-math-equation]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const displayMode = HTMLAttributes['data-display-mode'] === 'true';
    const latex = HTMLAttributes['data-latex'] || '';

    return [
      'span',
      mergeAttributes(
        { 'data-math-equation': '' },
        this.options.HTMLAttributes,
        HTMLAttributes,
        {
          class: displayMode
            ? 'math-equation-display math-equation-editable'
            : 'math-equation-inline math-equation-editable',
          contenteditable: 'false',
        }
      ),
      displayMode ? `$$${latex}$$` : `$${latex}$`,
    ];
  },

  addCommands() {
    return {
      insertMathEquation:
        (attributes) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes,
          });
        },
    };
  },
});
