/**
 * Alignment Commands
 * Commands for text alignment and line spacing.
 */

import { EditorState, Transaction } from 'prosemirror-state';
import { editorSchema } from '../schema/index';

type Command = (state: EditorState, dispatch?: (tr: Transaction) => void) => boolean;

// ============================================================================
// TEXT ALIGNMENT COMMANDS
// ============================================================================

export function setTextAlignment(align: string): Command {
  return (state: EditorState, dispatch?: (tr: Transaction) => void): boolean => {
    const { from, to } = state.selection;
    let tr = state.tr;
    let hasChanged = false;

    state.doc.nodesBetween(from, to, (node, pos) => {
      if (node.type === editorSchema.nodes.paragraph || node.type === editorSchema.nodes.heading) {
        tr = tr.setNodeMarkup(pos, undefined, { ...node.attrs, align });
        hasChanged = true;
      }
    });

    if (hasChanged && dispatch) {
      dispatch(tr);
    }

    return hasChanged;
  };
}

export function getActiveAlignment(state: EditorState): string {
  const { $from } = state.selection;
  let node = $from.parent;

  if (node.attrs && node.attrs.align) {
    return node.attrs.align;
  }

  return 'left';
}

// ============================================================================
// LINE SPACING COMMANDS
// ============================================================================

export function setTextLineSpacing(lineHeight: string): Command {
  return (state: EditorState, dispatch?: (tr: Transaction) => void): boolean => {
    const { from, to } = state.selection;
    let tr = state.tr;
    let hasChanged = false;

    state.doc.nodesBetween(from, to, (node, pos) => {
      if (node.type === editorSchema.nodes.paragraph || node.type === editorSchema.nodes.heading) {
        tr = tr.setNodeMarkup(pos, undefined, { ...node.attrs, lineHeight });
        hasChanged = true;
      }
    });

    if (hasChanged && dispatch) {
      dispatch(tr);
    }

    return hasChanged;
  };
}

export function getActiveLineSpacing(state: EditorState): string {
  const { $from } = state.selection;
  let node = $from.parent;

  if (node.attrs && node.attrs.lineHeight) {
    return node.attrs.lineHeight;
  }

  return 'normal';
}
