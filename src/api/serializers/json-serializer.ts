/**
 * JSON Serializer
 * Converts between ProseMirror documents and JSON format.
 */

import { Schema, Node as ProseMirrorNode } from 'prosemirror-model';
import type { EditorDocumentJSON } from '../editor-api.types';

/**
 * Serialize a ProseMirror document to JSON.
 * @param doc - ProseMirror document node
 * @returns JSON representation
 */
export function serializeToJSON(doc: ProseMirrorNode): EditorDocumentJSON {
  return doc.toJSON() as EditorDocumentJSON;
}

/**
 * 
 * Parse JSON to ProseMirror document.
 * @param json - JSON document
 * @param schema - Editor schema
 * @returns ProseMirror document node
 */
export function parseFromJSON(json: EditorDocumentJSON, schema: Schema): ProseMirrorNode {
  return ProseMirrorNode.fromJSON(schema, json);
}
