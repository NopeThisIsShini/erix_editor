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
import { insertPageBreak, printDocument, onTab, exitTableUp, exitTableDown } from '../commands/index';
import { createPlaceholderPlugin } from './placeholder';
import { createClipboardPastePlugin } from './clipboard-paste';
import { 
  columnResizing, 
  tableEditing, 
  addRowBefore, 
  addRowAfter, 
  addColumnBefore, 
  addColumnAfter, 
  deleteRow, 
  deleteColumn 
} from 'prosemirror-tables';
import { createTableToolbarPlugin } from './table-toolbar';

// Re-export placeholder utilities for external API usage
export { placeholderPluginKey, updatePlaceholder } from './placeholder';
export { clipboardPastePluginKey, transformWordHTML } from './clipboard-paste';

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
 * Keyboard shortcuts for table operations
 */
const tableKeymap = {
  'Tab': onTab(1),
  'Shift-Tab': onTab(-1),
  'ArrowUp': exitTableUp,
  'ArrowDown': exitTableDown,
  'Mod-Alt-ArrowUp': addRowBefore,
  'Mod-Alt-ArrowDown': addRowAfter,
  'Mod-Alt-ArrowLeft': addColumnBefore,
  'Mod-Alt-ArrowRight': addColumnAfter,
  'Mod-Backspace': deleteRow,
  'Mod-Shift-Backspace': deleteColumn,
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
    // Clipboard paste plugin for Word/RTF formatting
    createClipboardPastePlugin(),

    // Placeholder plugin
    createPlaceholderPlugin(placeholder),

    // History plugin (undo/redo stack)
    history(),

    // Table plugins
    columnResizing({ handleWidth: 12 }),
    tableEditing(),
    createTableToolbarPlugin(),

    // Custom keymaps (order: most specific to least specific)
    keymap(historyKeymap),
    keymap(tableKeymap),
    keymap(markKeymap),
    keymap(docKeymap),
    keymap(listKeymap),
    keymap(baseKeymap),
  ];
}

// Export the plugins array for direct usage (with default options)
export const editorPlugins = createEditorPlugins();
