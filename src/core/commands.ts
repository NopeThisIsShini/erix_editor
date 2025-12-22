import { EditorState, Transaction, TextSelection } from 'prosemirror-state';
import { NodeType, MarkType } from 'prosemirror-model';
import { toggleMark } from 'prosemirror-commands';
import { wrapInList, liftListItem, sinkListItem } from 'prosemirror-schema-list';
import { undo, redo } from 'prosemirror-history';
import { editorSchema } from '@src/core/schema';

type Command = (state: EditorState, dispatch?: (tr: Transaction) => void) => boolean;

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

// INDENT COMMANDS
export function increaseIndent(state: EditorState, dispatch?: (tr: Transaction) => void): boolean {
  const { list_item } = editorSchema.nodes;
  return sinkListItem(list_item)(state, dispatch);
}

export function decreaseIndent(state: EditorState, dispatch?: (tr: Transaction) => void): boolean {
  const { list_item } = editorSchema.nodes;
  return liftListItem(list_item)(state, dispatch);
}


// HEADING COMMANDS
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

// FONT COMMANDS
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

// ALIGNMENT COMMANDS
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

// DOCUMENT COMMANDS
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

// HISTORY COMMANDS
export { undo, redo };
