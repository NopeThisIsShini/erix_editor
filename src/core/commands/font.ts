/**
 * Font Commands
 * Commands for setting font family and font size.
 */

import { EditorState, Transaction } from 'prosemirror-state';
import { editorSchema } from '../schema/index';

type Command = (state: EditorState, dispatch?: (tr: Transaction) => void) => boolean;

// ============================================================================
// FONT FAMILY COMMANDS
// ============================================================================

export function setFontFamily(family: string): Command {
  return (state: EditorState, dispatch?: (tr: Transaction) => void): boolean => {
    const { from, to, empty } = state.selection;
    const { fontFamily } = editorSchema.marks;
    if (!fontFamily) return false;

    if (dispatch) {
      let tr = state.tr;
      if (empty) {
        if (family) {
          tr = tr.addStoredMark(fontFamily.create({ family }));
        } else {
          tr = tr.removeStoredMark(fontFamily);
        }
      } else {
        if (family) {
          tr = tr.addMark(from, to, fontFamily.create({ family }));
        } else {
          tr = tr.removeMark(from, to, fontFamily);
        }
      }
      dispatch(tr);
    }
    return true;
  };
}

export function getActiveFontFamily(state: EditorState): string {
  const { $from, empty } = state.selection;
  const { fontFamily } = editorSchema.marks;
  if (!fontFamily) return '';

  const mark = empty
    ? fontFamily.isInSet(state.storedMarks || $from.marks())
    : state.doc.rangeHasMark(state.selection.from, state.selection.to, fontFamily)
    ? $from.marks().find(m => m.type === fontFamily)
    : null;

  return mark ? mark.attrs.family : '';
}

// ============================================================================
// FONT SIZE COMMANDS
// ============================================================================

export function setFontSize(size: string): Command {
  return (state: EditorState, dispatch?: (tr: Transaction) => void): boolean => {
    const { from, to, empty } = state.selection;
    const { fontSize } = editorSchema.marks;
    if (!fontSize) return false;

    if (dispatch) {
      let tr = state.tr;
      if (empty) {
        if (size) {
          tr = tr.addStoredMark(fontSize.create({ size }));
        } else {
          tr = tr.removeStoredMark(fontSize);
        }
      } else {
        if (size) {
          tr = tr.addMark(from, to, fontSize.create({ size }));
        } else {
          tr = tr.removeMark(from, to, fontSize);
        }
      }
      dispatch(tr);
    }
    return true;
  };
}

export function getActiveFontSize(state: EditorState): string {
  const { $from, empty } = state.selection;
  const { fontSize } = editorSchema.marks;
  if (!fontSize) return '';

  const mark = empty
    ? fontSize.isInSet(state.storedMarks || $from.marks())
    : state.doc.rangeHasMark(state.selection.from, state.selection.to, fontSize)
    ? $from.marks().find(m => m.type === fontSize)
    : null;

  return mark ? mark.attrs.size : '';
}
