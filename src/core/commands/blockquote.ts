/**
 * Blockquote Commands
 * Commands for toggling blockquotes.
 */

import { EditorState, Transaction } from 'prosemirror-state';
import { wrapIn, lift } from 'prosemirror-commands';
import { editorSchema } from '../schema/index';

/**
 * Helper to find the parent node of a specific type
 */
function findParentNode(predicate: (node: any) => boolean) {
  return (selection: any) => {
    const { $from } = selection;
    for (let depth = $from.depth; depth > 0; depth--) {
      const node = $from.node(depth);
      if (predicate(node)) {
        return { node, pos: $from.before(depth), depth };
      }
    }
    return null;
  };
}

/**
 * Toggle blockquote command
 */
export function toggleBlockquote(state: EditorState, dispatch?: (tr: Transaction) => void): boolean {
  const { blockquote } = editorSchema.nodes;
  if (!blockquote) return false;

  if (isBlockquoteActive(state)) {
    return lift(state, dispatch);
  }

  return wrapIn(blockquote)(state, dispatch);
}

/**
 * Check if blockquote is active at current selection
 */
export function isBlockquoteActive(state: EditorState): boolean {
  const { blockquote } = editorSchema.nodes;
  if (!blockquote) return false;
  
  const parent = findParentNode(node => node.type === blockquote)(state.selection);
  return !!parent;
}
