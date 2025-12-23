/**
 * HTML Serializer
 * Converts between ProseMirror documents and HTML strings.
 */

import { DOMSerializer, DOMParser as ProseDOMParser, Schema, Node as ProseMirrorNode } from 'prosemirror-model';

/**
 * Serialize a ProseMirror document to HTML string.
 * @param doc - ProseMirror document node
 * @param schema - Editor schema
 * @returns HTML string
 */
export function serializeToHTML(doc: ProseMirrorNode, schema: Schema): string {
  const serializer = DOMSerializer.fromSchema(schema);
  const fragment = serializer.serializeFragment(doc.content);
  
  const container = document.createElement('div');
  container.appendChild(fragment);
  
  return container.innerHTML;
}

/**
 * Parse HTML string to ProseMirror document.
 * @param html - HTML string
 * @param schema - Editor schema
 * @returns ProseMirror document node
 */
export function parseFromHTML(html: string, schema: Schema): ProseMirrorNode {
  const parser = ProseDOMParser.fromSchema(schema);
  const container = document.createElement('div');
  container.innerHTML = html;
  
  return parser.parse(container);
}

/**
 * Get plain text from a ProseMirror document.
 * @param doc - ProseMirror document node
 * @returns Plain text string
 */
export function serializeToText(doc: ProseMirrorNode): string {
  return doc.textContent;
}
