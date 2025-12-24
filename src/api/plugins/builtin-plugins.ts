/**
 * Built-in Plugins
 * Pre-configured plugins that ship with the editor.
 */

import { EditorView } from 'prosemirror-view';
import {
  toggleBold,
  toggleItalic,
  toggleUnderline,
  toggleStrikethrough,
  toggleSuperscript,
  toggleSubscript,
  toggleBulletList,
  toggleOrderedList,
  isInBulletList,
  isInOrderedList,
  setTextAlignment,
  getActiveAlignment,
  increaseIndent,
  decreaseIndent,
} from '../../core';

import type { ErixPluginConfig } from '../plugin-registry.types';

/**
 * Create a command executor that gets the current view state.
 */
type CommandExecutor = (view: EditorView) => boolean;

/**
 * Factory function to create built-in plugins.
 * @param getView - Function to get the current EditorView
 * @param isMarkActive - Function to check if a mark is active
 */
export function createBuiltinPlugins(
  getView: () => EditorView,
  isMarkActive: (markName: string) => boolean,
  undoFn: () => boolean,
  redoFn: () => boolean,
  canUndoFn: () => boolean,
  canRedoFn: () => boolean
): ErixPluginConfig[] {
  const executeCommand = (command: CommandExecutor): boolean => {
    const view = getView();
    return command(view);
  };

  return [
    // =========================================================================
    // FORMATTING PLUGINS
    // =========================================================================
    {
      id: 'bold',
      label: 'Bold',
      icon: 'bold',
      group: 'formatting',
      priority: 10,
      shortcut: 'Mod+B',
      showInToolbar: true,
      execute: () => executeCommand((view) => toggleBold(view.state, view.dispatch)),
      isActive: () => isMarkActive('strong'),
    },
    {
      id: 'italic',
      label: 'Italic',
      icon: 'italic',
      group: 'formatting',
      priority: 20,
      shortcut: 'Mod+I',
      showInToolbar: true,
      execute: () => executeCommand((view) => toggleItalic(view.state, view.dispatch)),
      isActive: () => isMarkActive('em'),
    },
    {
      id: 'underline',
      label: 'Underline',
      icon: 'underline',
      group: 'formatting',
      priority: 30,
      shortcut: 'Mod+U',
      showInToolbar: true,
      execute: () => executeCommand((view) => toggleUnderline(view.state, view.dispatch)),
      isActive: () => isMarkActive('underline'),
    },
    {
      id: 'strikethrough',
      label: 'Strikethrough',
      icon: 'strikethrough',
      group: 'formatting',
      priority: 40,
      shortcut: 'Mod+Shift+S',
      showInToolbar: true,
      execute: () => executeCommand((view) => toggleStrikethrough(view.state, view.dispatch)),
      isActive: () => isMarkActive('strikethrough'),
    },
    {
      id: 'superscript',
      label: 'Superscript',
      icon: 'superscript',
      group: 'formatting',
      priority: 50,
      showInToolbar: false,
      execute: () => executeCommand((view) => toggleSuperscript(view.state, view.dispatch)),
      isActive: () => isMarkActive('superscript'),
    },
    {
      id: 'subscript',
      label: 'Subscript',
      icon: 'subscript',
      group: 'formatting',
      priority: 60,
      showInToolbar: false,
      execute: () => executeCommand((view) => toggleSubscript(view.state, view.dispatch)),
      isActive: () => isMarkActive('subscript'),
    },

    // =========================================================================
    // LIST PLUGINS
    // =========================================================================
    {
      id: 'bullet-list',
      label: 'Bullet List',
      icon: 'list-ul',
      group: 'lists',
      priority: 10,
      showInToolbar: true,
      execute: () => executeCommand((view) => toggleBulletList(view.state, view.dispatch)),
      isActive: () => {
        const view = getView();
        return isInBulletList(view.state);
      },
    },
    {
      id: 'ordered-list',
      label: 'Ordered List',
      icon: 'list-ol',
      group: 'lists',
      priority: 20,
      showInToolbar: true,
      execute: () => executeCommand((view) => toggleOrderedList(view.state, view.dispatch)),
      isActive: () => {
        const view = getView();
        return isInOrderedList(view.state);
      },
    },
    {
      id: 'indent',
      label: 'Increase Indent',
      icon: 'indent',
      group: 'lists',
      priority: 30,
      shortcut: 'Tab',
      showInToolbar: false,
      execute: () => executeCommand((view) => increaseIndent(view.state, view.dispatch)),
    },
    {
      id: 'outdent',
      label: 'Decrease Indent',
      icon: 'outdent',
      group: 'lists',
      priority: 40,
      shortcut: 'Shift+Tab',
      showInToolbar: false,
      execute: () => executeCommand((view) => decreaseIndent(view.state, view.dispatch)),
    },

    // =========================================================================
    // ALIGNMENT PLUGINS
    // =========================================================================
    {
      id: 'align-left',
      label: 'Align Left',
      icon: 'align-left',
      group: 'alignment',
      priority: 10,
      showInToolbar: true,
      execute: () => executeCommand((view) => setTextAlignment('left')(view.state, view.dispatch)),
      isActive: () => {
        const view = getView();
        return getActiveAlignment(view.state) === 'left';
      },
    },
    {
      id: 'align-center',
      label: 'Align Center',
      icon: 'align-center',
      group: 'alignment',
      priority: 20,
      showInToolbar: true,
      execute: () => executeCommand((view) => setTextAlignment('center')(view.state, view.dispatch)),
      isActive: () => {
        const view = getView();
        return getActiveAlignment(view.state) === 'center';
      },
    },
    {
      id: 'align-right',
      label: 'Align Right',
      icon: 'align-right',
      group: 'alignment',
      priority: 30,
      showInToolbar: true,
      execute: () => executeCommand((view) => setTextAlignment('right')(view.state, view.dispatch)),
      isActive: () => {
        const view = getView();
        return getActiveAlignment(view.state) === 'right';
      },
    },
    {
      id: 'align-justify',
      label: 'Justify',
      icon: 'align-justify',
      group: 'alignment',
      priority: 40,
      showInToolbar: true,
      execute: () => executeCommand((view) => setTextAlignment('justify')(view.state, view.dispatch)),
      isActive: () => {
        const view = getView();
        return getActiveAlignment(view.state) === 'justify';
      },
    },

    // =========================================================================
    // HISTORY PLUGINS
    // =========================================================================
    {
      id: 'undo',
      label: 'Undo',
      icon: 'undo',
      group: 'history',
      priority: 10,
      shortcut: 'Mod+Z',
      showInToolbar: true,
      execute: () => undoFn(),
      canExecute: () => canUndoFn(),
    },
    {
      id: 'redo',
      label: 'Redo',
      icon: 'redo',
      group: 'history',
      priority: 20,
      shortcut: 'Mod+Shift+Z',
      showInToolbar: true,
      execute: () => redoFn(),
      canExecute: () => canRedoFn(),
    },

    // =========================================================================
    // IMPORT PLUGINS
    // =========================================================================
    {
      id: 'import-word',
      label: 'Import from Word',
      description: 'Import content from a Microsoft Word document (.docx)',
      icon: 'importFromWord',
      group: 'tools',
      priority: 10,
      showInToolbar: false,
      execute: async () => {
        try {
          // Dynamically import to avoid loading when not needed
          const { openWordFileDialog } = await import('../serializers/word-importer');
          const result = await openWordFileDialog();
          
          if (result) {
            // Content will be set via the API by the caller
            // This plugin just handles the file picker
            // Store result in a custom event for the API to handle
            const event = new CustomEvent('erix-word-import', {
              detail: { result },
              bubbles: true,
            });
            document.dispatchEvent(event);
            return true;
          }
          return false;
        } catch (error) {
          console.error('[ImportWord] Failed to import Word document:', error);
          return false;
        }
      },
    },
  ];
}

/**
 * Default plugin IDs that are enabled by default.
 */
export const DEFAULT_PLUGINS = [
  'bold',
  'italic',
  'underline',
  'strikethrough',
  'bullet-list',
  'ordered-list',
  'align-left',
  'align-center',
  'align-right',
  'undo',
  'redo',
];

/**
 * All available built-in plugin IDs.
 */
export const ALL_BUILTIN_PLUGINS = [
  'bold',
  'italic',
  'underline',
  'strikethrough',
  'superscript',
  'subscript',
  'bullet-list',
  'ordered-list',
  'indent',
  'outdent',
  'align-left',
  'align-center',
  'align-right',
  'align-justify',
  'undo',
  'redo',
  'import-word',
];
