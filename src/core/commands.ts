/**
 * TypeForge Editor Commands
 * Provides commands for formatting and list operations.
 */

import { EditorState, Transaction, TextSelection } from 'prosemirror-state';
import { NodeType, MarkType } from 'prosemirror-model';
import { toggleMark } from 'prosemirror-commands';
import { wrapInList, liftListItem, sinkListItem } from 'prosemirror-schema-list';
import { undo, redo } from 'prosemirror-history';
import { editorSchema } from './schema';

// ============================================================================
// TYPES
// ============================================================================

type Command = (state: EditorState, dispatch?: (tr: Transaction) => void) => boolean;

// ============================================================================
// MARK COMMANDS
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

// ============================================================================
// LIST COMMANDS
// ============================================================================

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

function toggleList(listType: NodeType, itemType: NodeType): Command {
  return (state: EditorState, dispatch?: (tr: Transaction) => void): boolean => {
    const { $from, $to } = state.selection;
    const range = $from.blockRange($to);

    if (!range) return false;

    // Check if we're already in a list
    const inAnyList = findParentNode(node => node.type === editorSchema.nodes.bullet_list || node.type === editorSchema.nodes.ordered_list)(state.selection);

    if (inAnyList) {
      if (inAnyList.node.type === listType) {
        // We're in this list type, so lift out of it
        return liftListItem(itemType)(state, dispatch);
      } else {
        // We're in a different list type, change the list type
        if (dispatch) {
          dispatch(state.tr.setNodeMarkup(inAnyList.pos, listType));
        }
        return true;
      }
    }

    // Not in a list, wrap in one
    return wrapInList(listType)(state, dispatch);
  };
}

export function toggleBulletList(state: EditorState, dispatch?: (tr: Transaction) => void): boolean {
  const { bullet_list, list_item } = editorSchema.nodes;
  return toggleList(bullet_list, list_item)(state, dispatch);
}

export function toggleOrderedList(state: EditorState, dispatch?: (tr: Transaction) => void): boolean {
  const { ordered_list, list_item } = editorSchema.nodes;
  return toggleList(ordered_list, list_item)(state, dispatch);
}

// ============================================================================
// LIST STATE CHECKS
// ============================================================================

export function isInBulletList(state: EditorState): boolean {
  const parentList = findParentNode(node => node.type === editorSchema.nodes.bullet_list)(state.selection);
  return !!parentList;
}

export function isInOrderedList(state: EditorState): boolean {
  const parentList = findParentNode(node => node.type === editorSchema.nodes.ordered_list)(state.selection);
  return !!parentList;
}

// ============================================================================
// INDENT COMMANDS
// ============================================================================

export function increaseIndent(state: EditorState, dispatch?: (tr: Transaction) => void): boolean {
  const { list_item } = editorSchema.nodes;
  return sinkListItem(list_item)(state, dispatch);
}

export function decreaseIndent(state: EditorState, dispatch?: (tr: Transaction) => void): boolean {
  const { list_item } = editorSchema.nodes;
  return liftListItem(list_item)(state, dispatch);
}

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

export function getCurrentHeadingLevel(state: EditorState): number | null {
  const { $from } = state.selection;
  const node = $from.parent;

  if (node.type === editorSchema.nodes.heading) {
    return node.attrs.level;
  }

  return null;
}

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

// ============================================================================
// HISTORY COMMANDS
// ============================================================================

export { undo, redo };
