/**
 * Text Format Commands
 * Commands for toggling text formatting marks (bold, italic, underline, etc.)
 */

import { EditorState, Transaction } from 'prosemirror-state';
import { MarkType } from 'prosemirror-model';
import { toggleMark } from 'prosemirror-commands';
import { editorSchema } from '../schema/index';

type Command = (state: EditorState, dispatch?: (tr: Transaction) => void) => boolean;

// ============================================================================
// TOGGLE COMMANDS
// ============================================================================

export function toggleBold(state: EditorState, dispatch?: (tr: Transaction) => void): boolean {
  return toggleMark(editorSchema.marks.strong)(state, dispatch);
}

export function toggleItalic(state: EditorState, dispatch?: (tr: Transaction) => void): boolean {
  return toggleMark(editorSchema.marks.em)(state, dispatch);
}

export function toggleUnderline(state: EditorState, dispatch?: (tr: Transaction) => void): boolean {
  return toggleMark(editorSchema.marks.underline)(state, dispatch);
}

export function toggleStrikethrough(state: EditorState, dispatch?: (tr: Transaction) => void): boolean {
  return toggleMark(editorSchema.marks.strikethrough)(state, dispatch);
}

export function toggleSuperscript(state: EditorState, dispatch?: (tr: Transaction) => void): boolean {
  return toggleMark(editorSchema.marks.superscript)(state, dispatch);
}

export function toggleSubscript(state: EditorState, dispatch?: (tr: Transaction) => void): boolean {
  return toggleMark(editorSchema.marks.subscript)(state, dispatch);
}

// ============================================================================
// MARK STATE CHECKS
// ============================================================================

export function isMarkActive(state: EditorState, markType: MarkType): boolean {
  const { from, $from, to, empty } = state.selection;
  if (empty) {
    return !!markType.isInSet(state.storedMarks || $from.marks());
  }
  return state.doc.rangeHasMark(from, to, markType);
}

export function isBoldActive(state: EditorState): boolean {
  return isMarkActive(state, editorSchema.marks.strong);
}

export function isItalicActive(state: EditorState): boolean {
  return isMarkActive(state, editorSchema.marks.em);
}

export function isUnderlineActive(state: EditorState): boolean {
  return isMarkActive(state, editorSchema.marks.underline);
}

export function isStrikethroughActive(state: EditorState): boolean {
  return isMarkActive(state, editorSchema.marks.strikethrough);
}

export function isSuperscriptActive(state: EditorState): boolean {
  return editorSchema.marks.superscript ? isMarkActive(state, editorSchema.marks.superscript) : false;
}

export function isSubscriptActive(state: EditorState): boolean {
  return editorSchema.marks.subscript ? isMarkActive(state, editorSchema.marks.subscript) : false;
}

// ============================================================================
// TEXT CASE COMMANDS
// ============================================================================

export function setTextCase(type: 'uppercase' | 'lowercase'): Command {
  return (state: EditorState, dispatch?: (tr: Transaction) => void): boolean => {
    const { from, to, empty } = state.selection;
    if (empty) return false;

    if (dispatch) {
      const tr = state.tr;
      const changes: { start: number; end: number; text: string }[] = [];

      state.doc.nodesBetween(from, to, (node, pos) => {
        if (node.isText) {
          const start = Math.max(from, pos);
          const end = Math.min(to, pos + node.nodeSize);
          const text = node.textContent.slice(start - pos, end - pos);
          const transformedText = type === 'uppercase' ? text.toUpperCase() : text.toLowerCase();
          if (transformedText !== text) {
            changes.push({ start, end, text: transformedText });
          }
        }
      });

      // Apply changes in reverse order to keep positions valid
      for (let i = changes.length - 1; i >= 0; i--) {
        const { start, end, text } = changes[i];
        tr.insertText(text, start, end);
      }

      dispatch(tr);
    }
    return true;
  };
}
