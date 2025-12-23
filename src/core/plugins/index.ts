/**
 * Erix Editor Plugins
 * Configures keyboard shortcuts and history for the editor.
 */

import { history, undo, redo } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';
import { baseKeymap, toggleMark } from 'prosemirror-commands';
import { splitListItem, liftListItem, sinkListItem } from 'prosemirror-schema-list';
import { Plugin } from 'prosemirror-state';
import { editorSchema } from '../schema/index';
import { insertPageBreak, printDocument } from '../commands/index';
import { createPlaceholderPlugin } from './placeholder';

// Re-export placeholder utilities for external API usage
export { placeholderPluginKey, updatePlaceholder } from './placeholder';

/**
 * Keyboard shortcuts for formatting marks
 */
const markKeymap = {
  'Mod-b': toggleMark(editorSchema.marks.strong),
  'Mod-i': toggleMark(editorSchema.marks.em),
  'Mod-u': toggleMark(editorSchema.marks.underline),
};

/**
 * Keyboard shortcuts for history (undo/redo)
 */
const historyKeymap = {
  'Mod-z': undo,
  'Mod-y': redo,
  'Mod-Shift-z': redo,
};

/**
 * Keyboard shortcuts for list operations
 */
const listKeymap = {
  'Enter': splitListItem(editorSchema.nodes.list_item),
  'Tab': sinkListItem(editorSchema.nodes.list_item),
  'Shift-Tab': liftListItem(editorSchema.nodes.list_item),
};

/**
 * Keyboard shortcuts for document operations
 */
const docKeymap = {
  'Mod-Enter': insertPageBreak,
  'Mod-p': (_state: any, _dispatch: any) => {
    printDocument();
    return true;
  },
};

export interface EditorPluginsOptions {
  /**
   * Placeholder text to show when editor is empty
   */
  placeholder?: string;
}

/**
 * Creates the array of plugins for the editor.
 * Order matters - more specific keymaps should come before less specific ones.
 * @param options - Configuration options for plugins
 */
export function createEditorPlugins(options: EditorPluginsOptions = {}): Plugin[] {
  const { placeholder = 'Start typing...' } = options;

  return [
    // Placeholder plugin
    createPlaceholderPlugin(placeholder),

    // History plugin (undo/redo stack)
    history(),

    // Custom keymaps (order: most specific to least specific)
    keymap(historyKeymap),
    keymap(markKeymap),
    keymap(docKeymap),
    keymap(listKeymap),
    keymap(baseKeymap),
  ];
}

// Export the plugins array for direct usage (with default options)
export const editorPlugins = createEditorPlugins();
