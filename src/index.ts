/**
 * @fileoverview Erix Editor - Public Entry Point
 *
 * This is the main entry point for the Erix Editor npm package.
 * It exports the public API, types, and utilities.
 *
 * @example
 * ```typescript
 * import { ErixEditorAPI, DEFAULT_EDITOR_CONFIG } from 'erix';
 * import type { EditorContent, ErixPluginConfig, EditorConfig } from 'erix';
 * ```
 */

// =============================================================================
// PUBLIC API
// =============================================================================

export { ErixEditorAPI, PluginRegistry } from '@src/api';

// Built-in plugins utilities
export { createBuiltinPlugins, DEFAULT_PLUGINS, ALL_BUILTIN_PLUGINS } from '@src/api';

// Default configuration
export { DEFAULT_EDITOR_CONFIG } from '@src/api';

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type {
  // Content types
  ContentFormat,
  EditorContent,
  EditorDocumentJSON,
  EditorNodeJSON,
  EditorMarkJSON,

  // Selection & State
  EditorSelection,
  EditorStateSnapshot,

  // Events
  EditorEventType,
  EditorEventPayload,
  EditorEventListener,

  // Configuration
  EditorOptions,

  // Plugin types
  PluginId,
  PluginGroup,
  PluginPriority,
  PluginContext,
  ErixPluginConfig,
  RegisteredPlugin,
  PluginQueryOptions,

  // Toolbar types
  PluginToolbarConfig,
  PluginDropdownConfig,
  ToolbarItem,
  ToolbarGroup,
  ToolbarConfig,

  // Configuration types
  PluginsConfig,
  EditorConfig,
} from '@src/api';

// =============================================================================
// UTILITIES
// =============================================================================

export { format, sanitizeSvg } from '@src/utils';

// =============================================================================
// WORD IMPORT
// =============================================================================

export {
  parseWordDocument,
  parseWordToNode,
  isValidWordDocument,
  openWordFileDialog,
} from '@src/api';

export type {
  WordImportOptions,
  WordImportResult,
  WordDocumentMetadata,
} from '@src/api';

// =============================================================================
// COMPONENT TYPES
// =============================================================================

export type * from '@src/components.d.ts';

// =============================================================================
// GLOBAL TYPE AUGMENTATION
// =============================================================================

import type { ErixEditorAPI, EditorConfig } from '@src/api';

declare global {
  interface HTMLErixEditorElement extends HTMLElement {
    /** Public API instance (available after component loads) */
    readonly api: ErixEditorAPI;
    /** Get the public API instance (async) */
    getAPI(): Promise<ErixEditorAPI>;
    /** Editor configuration */
    config?: EditorConfig;
  }

  interface HTMLElementTagNameMap {
    'erix-editor': HTMLErixEditorElement;
  }

  interface GlobalEventHandlersEventMap {
    'erix-ready': CustomEvent<{ api: ErixEditorAPI }>;
  }
}
