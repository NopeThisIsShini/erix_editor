/**
 * Document Commands
 * Commands for document-level operations like print and page break.
 */

import { EditorState, Transaction, TextSelection } from 'prosemirror-state';
import { editorSchema } from '../schema/index';

// ============================================================================
// DOCUMENT COMMANDS
// ============================================================================

export function printDocument(): boolean {
  window.print();
  return true;
}

export function insertPageBreak(state: EditorState, dispatch?: (tr: Transaction) => void): boolean {
  const { page_break, paragraph } = editorSchema.nodes;
  if (!page_break) return false;

  if (dispatch) {
    const { tr } = state;

    // Create the page break node
    const pbNode = page_break.create();

    // Replace selection with the page break
    tr.replaceSelectionWith(pbNode);

    // If the page break is at the end of the document, or if the next node is not a paragraph,
    // add an empty paragraph to ensure the user can continue typing.
    const $pos = tr.doc.resolve(tr.selection.to);
    const nextNode = $pos.nodeAfter;

    if (!nextNode) {
      tr.insert(tr.selection.to, paragraph.create());
    }

    // Move selection to the start of the next block (which we just ensured exists)
    const nextSelectable = TextSelection.near(tr.doc.resolve(tr.selection.to));
    tr.setSelection(nextSelectable);

    dispatch(tr.scrollIntoView());
  }
  return true;
}
