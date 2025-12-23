/**
 * Heading Commands
 * Commands for setting headings and paragraphs.
 */

import { EditorState, Transaction } from 'prosemirror-state';
import { editorSchema } from '../schema/index';

type Command = (state: EditorState, dispatch?: (tr: Transaction) => void) => boolean;

// ============================================================================
// HEADING COMMANDS
// ============================================================================

export function setHeading(level: number): Command {
  return (state: EditorState, dispatch?: (tr: Transaction) => void): boolean => {
    const { $from, $to } = state.selection;
    const range = $from.blockRange($to);

    if (!range) return false;

    if (dispatch) {
      const tr = state.tr;
      const headingType = editorSchema.nodes.heading;

      tr.setBlockType(range.start, range.end, headingType, { level });
      dispatch(tr);
    }

    return true;
  };
}

export function setParagraph(state: EditorState, dispatch?: (tr: Transaction) => void): boolean {
  const { $from, $to } = state.selection;
  const range = $from.blockRange($to);

  if (!range) return false;

  if (dispatch) {
    const tr = state.tr;
    tr.setBlockType(range.start, range.end, editorSchema.nodes.paragraph);
    dispatch(tr);
  }

  return true;
}

// ============================================================================
// HEADING STATE CHECKS
// ============================================================================

export function getCurrentHeadingLevel(state: EditorState): number | null {
  const { $from } = state.selection;
  const node = $from.parent;

  if (node.type === editorSchema.nodes.heading) {
    return node.attrs.level;
  }

  return null;
}
