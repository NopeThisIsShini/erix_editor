/**
 * Placeholder Plugin for ProseMirror
 * Displays placeholder text when the editor is empty.
 */

import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

export const placeholderPluginKey = new PluginKey('placeholder');

/**
 * Creates a placeholder plugin that shows placeholder text when the editor is empty.
 * @param placeholderText - The placeholder text to display
 * @returns ProseMirror Plugin
 */
export function createPlaceholderPlugin(placeholderText: string = 'Start typing...'): Plugin {
  return new Plugin({
    key: placeholderPluginKey,

    state: {
      init: () => placeholderText,
      apply: (_tr, value) => value,
    },

    props: {
      decorations(state) {
        const doc = state.doc;
        const placeholder = this.getState(state);

        // Check if the document is empty (only one paragraph with no text)
        const isEmpty =
          doc.childCount === 1 &&
          doc.firstChild?.isTextblock &&
          doc.firstChild.content.size === 0;

        if (!isEmpty || !placeholder) {
          return DecorationSet.empty;
        }

        // Create a widget decoration for the placeholder
        const decorations: Decoration[] = [];

        // Add a class to the first paragraph when empty
        decorations.push(
          Decoration.node(0, doc.firstChild!.nodeSize, {
            class: 'is-editor-empty',
            'data-placeholder': placeholder,
          })
        );

        return DecorationSet.create(doc, decorations);
      },
    },
  });
}

/**
 * Updates the placeholder text for an existing editor
 * @param view - The EditorView instance
 * @param newPlaceholder - The new placeholder text
 */
export function updatePlaceholder(view: any, newPlaceholder: string) {
  const { state, dispatch } = view;
  const tr = state.tr.setMeta(placeholderPluginKey, newPlaceholder);
  dispatch(tr);
}
