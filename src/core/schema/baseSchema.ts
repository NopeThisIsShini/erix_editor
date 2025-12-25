/**
 * Erix Editor Schema
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

const formattingAttrs = {
  align: { default: 'left' as TextAlignment },
  lineHeight: { default: 'normal' },
};

function getFormattingFromDOM(dom: HTMLElement) {
  const align = (dom.style.textAlign || dom.getAttribute('align') || 'left') as TextAlignment;
  const lineHeight = dom.style.lineHeight || 'normal';
  return { align, lineHeight };
}

function createFormattingDOMAttrs(node: { attrs: { align?: TextAlignment; lineHeight?: string } }): Record<string, string> {
  const styles: string[] = [];
  if (node.attrs.align && node.attrs.align !== 'left') {
    styles.push(`text-align: ${node.attrs.align}`);
  }
  if (node.attrs.lineHeight && node.attrs.lineHeight !== 'normal') {
    styles.push(`line-height: ${node.attrs.lineHeight}`);
  }
  return styles.length ? { style: styles.join('; ') } : {};
}

// ============================================================================
// NODE SPECIFICATIONS
// ============================================================================

const paragraphNode: NodeSpec = {
  content: 'inline*',
  group: 'block',
  attrs: formattingAttrs,
  parseDOM: [
    {
      tag: 'p',
      getAttrs(dom) {
        return getFormattingFromDOM(dom as HTMLElement);
      },
    },
  ],
  toDOM(node) {
    return ['p', createFormattingDOMAttrs(node), 0];
  },
};

const headingNode: NodeSpec = {
  content: 'inline*',
  group: 'block',
  attrs: {
    level: { default: 1 },
    ...formattingAttrs,
  },
  parseDOM: [1, 2, 3, 4, 5, 6].map(level => ({
    tag: `h${level}`,
    attrs: { level },
    getAttrs(dom) {
      return { level, ...getFormattingFromDOM(dom as HTMLElement) };
    },
  })),
  toDOM(node) {
    return [`h${node.attrs.level}`, createFormattingDOMAttrs(node), 0];
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
  image: {
    inline: true,
    group: 'inline',
    draggable: true,
    attrs: {
      src: { default: '' },
      alt: { default: '' },
      title: { default: '' },
      width: { default: null },
      height: { default: null },
    },
    parseDOM: [
      {
        tag: 'img[src]',
        getAttrs(dom) {
          const img = dom as HTMLImageElement;
          return {
            src: img.getAttribute('src') || '',
            alt: img.getAttribute('alt') || '',
            title: img.getAttribute('title') || '',
            width: img.getAttribute('width') || img.style.width || null,
            height: img.getAttribute('height') || img.style.height || null,
          };
        },
      },
    ],
    toDOM(node) {
      const attrs: Record<string, string> = { src: node.attrs.src };
      if (node.attrs.alt) attrs.alt = node.attrs.alt;
      if (node.attrs.title) attrs.title = node.attrs.title;
      if (node.attrs.width) attrs.width = node.attrs.width;
      if (node.attrs.height) attrs.height = node.attrs.height;
      return ['img', attrs];
    },
  },
  // Table nodes with border support
  table: {
    content: 'table_row+',
    group: 'block',
    tableRole: 'table',
    isolating: true,
    attrs: {
      border: { default: null },
      borderColor: { default: null },
      borderStyle: { default: null },
      width: { default: null },
      cellpadding: { default: null },
      cellspacing: { default: null },
    },
    parseDOM: [
      {
        tag: 'table',
        getAttrs(dom) {
          const table = dom as HTMLTableElement;
          const style = table.style;
          return {
            border: table.getAttribute('border') || style.borderWidth || null,
            borderColor: style.borderColor || null,
            borderStyle: style.borderStyle || null,
            width: table.getAttribute('width') || style.width || null,
            cellpadding: table.getAttribute('cellpadding') || null,
            cellspacing: table.getAttribute('cellspacing') || null,
          };
        },
      },
    ],
    toDOM(node) {
      const styles: string[] = [];
      const attrs: Record<string, string> = {};

      if (node.attrs.border) {
        styles.push(`border: ${node.attrs.border}px solid ${node.attrs.borderColor || '#000'}`);
      }
      if (node.attrs.width) {
        styles.push(`width: ${node.attrs.width}`);
      }
      if (styles.length > 0) {
        attrs.style = styles.join('; ');
      }

      return ['table', attrs, ['tbody', 0]];
    },
  },
  table_row: {
    content: '(table_cell | table_header)+',
    tableRole: 'row',
    parseDOM: [{ tag: 'tr' }],
    toDOM() {
      return ['tr', 0];
    },
  },
  table_cell: {
    content: 'block+',
    tableRole: 'cell',
    isolating: true,
    attrs: {
      colspan: { default: 1 },
      rowspan: { default: 1 },
      border: { default: null },
      borderColor: { default: null },
      backgroundColor: { default: null },
      width: { default: null },
      textAlign: { default: null },
      verticalAlign: { default: null },
    },
    parseDOM: [
      {
        tag: 'td',
        getAttrs(dom) {
          const cell = dom as HTMLTableCellElement;
          const style = cell.style;
          return {
            colspan: cell.colSpan || 1,
            rowspan: cell.rowSpan || 1,
            border: style.border || style.borderWidth || null,
            borderColor: style.borderColor || null,
            backgroundColor: style.backgroundColor || null,
            width: cell.getAttribute('width') || style.width || null,
            textAlign: style.textAlign || null,
            verticalAlign: style.verticalAlign || cell.getAttribute('valign') || null,
          };
        },
      },
    ],
    toDOM(node) {
      const attrs: Record<string, string> = {};
      const styles: string[] = [];

      if (node.attrs.colspan !== 1) attrs.colspan = String(node.attrs.colspan);
      if (node.attrs.rowspan !== 1) attrs.rowspan = String(node.attrs.rowspan);

      if (node.attrs.border) {
        styles.push(`border: ${node.attrs.border}`);
      }
      if (node.attrs.borderColor) {
        styles.push(`border-color: ${node.attrs.borderColor}`);
      }
      if (node.attrs.backgroundColor) {
        styles.push(`background-color: ${node.attrs.backgroundColor}`);
      }
      if (node.attrs.width) {
        styles.push(`width: ${node.attrs.width}`);
      }
      if (node.attrs.textAlign) {
        styles.push(`text-align: ${node.attrs.textAlign}`);
      }
      if (node.attrs.verticalAlign) {
        styles.push(`vertical-align: ${node.attrs.verticalAlign}`);
      }

      if (styles.length > 0) {
        attrs.style = styles.join('; ');
      }

      return ['td', attrs, 0];
    },
  },
  table_header: {
    content: 'block+',
    tableRole: 'header_cell',
    isolating: true,
    attrs: {
      colspan: { default: 1 },
      rowspan: { default: 1 },
      border: { default: null },
      borderColor: { default: null },
      backgroundColor: { default: null },
      width: { default: null },
      textAlign: { default: null },
    },
    parseDOM: [
      {
        tag: 'th',
        getAttrs(dom) {
          const cell = dom as HTMLTableCellElement;
          const style = cell.style;
          return {
            colspan: cell.colSpan || 1,
            rowspan: cell.rowSpan || 1,
            border: style.border || style.borderWidth || null,
            borderColor: style.borderColor || null,
            backgroundColor: style.backgroundColor || null,
            width: cell.getAttribute('width') || style.width || null,
            textAlign: style.textAlign || null,
          };
        },
      },
    ],
    toDOM(node) {
      const attrs: Record<string, string> = {};
      const styles: string[] = [];

      if (node.attrs.colspan !== 1) attrs.colspan = String(node.attrs.colspan);
      if (node.attrs.rowspan !== 1) attrs.rowspan = String(node.attrs.rowspan);

      if (node.attrs.border) {
        styles.push(`border: ${node.attrs.border}`);
      }
      if (node.attrs.borderColor) {
        styles.push(`border-color: ${node.attrs.borderColor}`);
      }
      if (node.attrs.backgroundColor) {
        styles.push(`background-color: ${node.attrs.backgroundColor}`);
      }
      if (node.attrs.width) {
        styles.push(`width: ${node.attrs.width}`);
      }
      if (node.attrs.textAlign) {
        styles.push(`text-align: ${node.attrs.textAlign}`);
      }

      if (styles.length > 0) {
        attrs.style = styles.join('; ');
      }

      return ['th', attrs, 0];
    },
  },
  // Bordered box/container for Word border boxes
  bordered_box: {
    content: 'block+',
    group: 'block',
    defining: true,
    attrs: {
      border: { default: '1px solid #000' },
      padding: { default: '8px' },
      backgroundColor: { default: null },
    },
    parseDOM: [
      {
        tag: 'div[data-bordered-box]',
      },
      {
        // Parse divs/paragraphs with border styles
        tag: 'div',
        getAttrs(dom) {
          const el = dom as HTMLElement;
          const style = el.style;
          if (style.border || style.borderWidth || style.borderStyle) {
            return {
              border: style.border || `${style.borderWidth || '1px'} ${style.borderStyle || 'solid'} ${style.borderColor || '#000'}`,
              padding: style.padding || '8px',
              backgroundColor: style.backgroundColor || null,
            };
          }
          return false;
        },
      },
      {
        tag: 'p',
        getAttrs(dom) {
          const el = dom as HTMLElement;
          const style = el.style;
          if (style.border || style.borderWidth || style.borderStyle) {
            return {
              border: style.border || `${style.borderWidth || '1px'} ${style.borderStyle || 'solid'} ${style.borderColor || '#000'}`,
              padding: style.padding || '8px',
              backgroundColor: style.backgroundColor || null,
            };
          }
          return false;
        },
      },
    ],
    toDOM(node) {
      const styles: string[] = [];
      if (node.attrs.border) styles.push(`border: ${node.attrs.border}`);
      if (node.attrs.padding) styles.push(`padding: ${node.attrs.padding}`);
      if (node.attrs.backgroundColor) styles.push(`background-color: ${node.attrs.backgroundColor}`);

      return ['div', { 'data-bordered-box': 'true', style: styles.join('; ') }, 0];
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
  superscript: {
    parseDOM: [{ tag: 'sup' }, { style: 'vertical-align=super' }],
    toDOM() {
      return ['sup', 0];
    },
  },
  subscript: {
    parseDOM: [{ tag: 'sub' }, { style: 'vertical-align=sub' }],
    toDOM() {
      return ['sub', 0];
    },
  },
  textColor: {
    attrs: { color: { default: '' } },
    parseDOM: [
      {
        style: 'color',
        getAttrs: (value: string) => {
          if (!value || value === 'inherit' || value === 'initial' || value === 'transparent') {
            return false;
          }
          return { color: value };
        },
      },
    ],
    toDOM(mark) {
      return ['span', { style: `color: ${mark.attrs.color}` }, 0];
    },
  },
  backgroundColor: {
    attrs: { color: { default: '' } },
    parseDOM: [
      {
        style: 'background-color',
        getAttrs: (value: string) => {
          if (!value || value === 'inherit' || value === 'initial' || value === 'transparent') {
            return false;
          }
          return { color: value };
        },
      },
      {
        style: 'background',
        getAttrs: (value: string) => {
          // Extract color from background shorthand (e.g., "rgb(255,0,0) none")
          const colorMatch = value.match(/^(#[0-9a-fA-F]{3,6}|rgba?\([^)]+\)|[a-zA-Z]+)/);
          if (!colorMatch || colorMatch[1] === 'none' || colorMatch[1] === 'transparent') {
            return false;
          }
          return { color: colorMatch[1] };
        },
      },
    ],
    toDOM(mark) {
      return ['span', { style: `background-color: ${mark.attrs.color}` }, 0];
    },
  },
  highlight: {
    attrs: { color: { default: 'yellow' } },
    parseDOM: [
      { tag: 'mark' },
      {
        tag: 'span[data-highlight]',
        getAttrs: (dom: HTMLElement) => {
          return { color: dom.getAttribute('data-highlight') || 'yellow' };
        },
      },
    ],
    toDOM(mark) {
      return ['mark', { style: `background-color: ${mark.attrs.color}` }, 0];
    },
  },
  link: {
    attrs: {
      href: { default: '' },
      title: { default: null },
      target: { default: '_blank' },
    },
    inclusive: false,
    parseDOM: [
      {
        tag: 'a[href]',
        getAttrs(dom) {
          const a = dom as HTMLAnchorElement;
          return {
            href: a.getAttribute('href') || '',
            title: a.getAttribute('title') || null,
            target: a.getAttribute('target') || '_blank',
          };
        },
      },
    ],
    toDOM(mark) {
      const attrs: Record<string, string> = { href: mark.attrs.href };
      if (mark.attrs.title) attrs.title = mark.attrs.title;
      if (mark.attrs.target) attrs.target = mark.attrs.target;
      return ['a', attrs, 0];
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
