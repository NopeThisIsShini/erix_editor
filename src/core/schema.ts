/**
 * TypeForge Editor Schema
 * Defines the structure of the document with support for:
 * - Paragraphs with alignment
 * - Headings (h1-h6) with alignment
 * - Bullet and ordered lists
 * - Basic marks (bold, italic, underline, strikethrough)
 */

import { Schema, type NodeSpec, type MarkSpec } from 'prosemirror-model';
import { schema as basicSchema } from 'prosemirror-schema-basic';

// ============================================================================
// ALIGNMENT UTILITIES
// ============================================================================

export type TextAlignment = 'left' | 'center' | 'right' | 'justify';

const alignmentAttrs = {
  align: { default: 'left' as TextAlignment },
};

function getAlignmentFromDOM(dom: HTMLElement): { align: TextAlignment } {
  const align = (dom.style.textAlign || dom.getAttribute('align') || 'left') as TextAlignment;
  return { align };
}

function createAlignmentDOMAttrs(node: { attrs: { align?: TextAlignment } }): Record<string, string> {
  if (node.attrs.align && node.attrs.align !== 'left') {
    return { style: `text-align: ${node.attrs.align}` };
  }
  return {};
}

// ============================================================================
// NODE SPECIFICATIONS
// ============================================================================

const paragraphNode: NodeSpec = {
  content: 'inline*',
  group: 'block',
  attrs: alignmentAttrs,
  parseDOM: [
    {
      tag: 'p',
      getAttrs(dom) {
        return getAlignmentFromDOM(dom as HTMLElement);
      },
    },
  ],
  toDOM(node) {
    return ['p', createAlignmentDOMAttrs(node), 0];
  },
};

const headingNode: NodeSpec = {
  content: 'inline*',
  group: 'block',
  attrs: {
    level: { default: 1 },
    align: { default: 'left' as TextAlignment },
  },
  parseDOM: [1, 2, 3, 4, 5, 6].map(level => ({
    tag: `h${level}`,
    attrs: { level },
    getAttrs(dom) {
      return { level, ...getAlignmentFromDOM(dom as HTMLElement) };
    },
  })),
  toDOM(node) {
    return [`h${node.attrs.level}`, createAlignmentDOMAttrs(node), 0];
  },
  defining: true,
};

const listNodes: { [key: string]: NodeSpec } = {
  ordered_list: {
    content: 'list_item+',
    group: 'block',
    attrs: { order: { default: 1 } },
    parseDOM: [
      {
        tag: 'ol',
        getAttrs(dom) {
          const element = dom as HTMLElement;
          return { order: element.hasAttribute('start') ? +element.getAttribute('start')! : 1 };
        },
      },
    ],
    toDOM(node) {
      return node.attrs.order === 1 ? ['ol', 0] : ['ol', { start: node.attrs.order }, 0];
    },
  },
  bullet_list: {
    content: 'list_item+',
    group: 'block',
    parseDOM: [{ tag: 'ul' }],
    toDOM() {
      return ['ul', 0];
    },
  },
  list_item: {
    content: 'block+',
    parseDOM: [{ tag: 'li' }],
    toDOM() {
      return ['li', 0];
    },
    defining: true,
  },
};

const additionalNodes: { [key: string]: NodeSpec } = {
  blockquote: {
    content: 'block+',
    group: 'block',
    defining: true,
    parseDOM: [{ tag: 'blockquote' }],
    toDOM() {
      return ['blockquote', 0];
    },
  },
  code_block: {
    content: 'text*',
    group: 'block',
    code: true,
    defining: true,
    parseDOM: [{ tag: 'pre', preserveWhitespace: 'full' }],
    toDOM() {
      return ['pre', ['code', 0]];
    },
  },
  horizontal_rule: {
    group: 'block',
    parseDOM: [{ tag: 'hr' }],
    toDOM() {
      return ['hr'];
    },
  },
  page_break: {
    group: 'block',
    atom: true,
    selectable: true,
    parseDOM: [{ tag: "div[data-type='page-break']" }],
    toDOM() {
      return ['div', { 'data-type': 'page-break', 'class': 'page-break' }, ['span', 'PAGE BREAK']];
    },
  },
};

// ============================================================================
// MARK SPECIFICATIONS
// ============================================================================

const extendedMarks: { [key: string]: MarkSpec } = {
  underline: {
    parseDOM: [{ tag: 'u' }, { style: 'text-decoration=underline' }, { style: 'text-decoration-line=underline' }],
    toDOM() {
      return ['u', 0];
    },
  },
  strikethrough: {
    parseDOM: [{ tag: 's' }, { tag: 'strike' }, { style: 'text-decoration=line-through' }, { style: 'text-decoration-line=line-through' }],
    toDOM() {
      return ['s', 0];
    },
  },
  fontFamily: {
    attrs: { family: { default: '' } },
    parseDOM: [
      {
        style: 'font-family',
        getAttrs: (value: string) => ({ family: value.replace(/['"]/g, '') }),
      },
    ],
    toDOM(mark) {
      return ['span', { style: `font-family: ${mark.attrs.family}` }, 0];
    },
  },
  fontSize: {
    attrs: { size: { default: '' } },
    parseDOM: [
      {
        style: 'font-size',
        getAttrs: (value: string) => ({ size: value }),
      },
    ],
    toDOM(mark) {
      return ['span', { style: `font-size: ${mark.attrs.size}` }, 0];
    },
  },
};

// ============================================================================
// BUILD SCHEMA
// ============================================================================

// Start with basic schema nodes and override/extend
let customNodes = basicSchema.spec.nodes.update('paragraph', paragraphNode).update('heading', headingNode);

// Add list nodes
customNodes = customNodes.append(listNodes);

// Add additional block nodes
customNodes = customNodes.append(additionalNodes);

// Extend basic marks with underline and strikethrough
const customMarks = basicSchema.spec.marks.append(extendedMarks);

// Create and export the final schema
export const editorSchema = new Schema({
  nodes: customNodes,
  marks: customMarks,
});
