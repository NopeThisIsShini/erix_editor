/**
 * List Commands
 * Commands for toggling and managing lists.
 */

import { EditorState, Transaction } from 'prosemirror-state';
import { NodeType } from 'prosemirror-model';
import { wrapInList, liftListItem, sinkListItem } from 'prosemirror-schema-list';
import { editorSchema } from '../schema/index';

type Command = (state: EditorState, dispatch?: (tr: Transaction) => void) => boolean;

// ============================================================================
// HELPER FUNCTIONS
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

// ============================================================================
// LIST TOGGLE COMMANDS
// ============================================================================

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
