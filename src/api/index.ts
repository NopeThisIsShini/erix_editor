/**
 * Erix Editor API Module
 * Public exports for the editor API.
 */

// Main API class
export { ErixEditorAPI } from './editor-api';

// Plugin registry
export { PluginRegistry } from './plugin-registry';

// Built-in plugins
export { createBuiltinPlugins, DEFAULT_PLUGINS, ALL_BUILTIN_PLUGINS } from './plugins';

// Type exports - Editor API
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
} from './editor-api.types';

// Type exports - Plugin System
export type {
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
} from './plugin-registry.types';

// Default configuration
export { DEFAULT_EDITOR_CONFIG } from './plugin-registry.types';

// Word document import utilities
export {
  parseWordDocument,
  parseWordToNode,
  isValidWordDocument,
  openWordFileDialog,
} from './serializers/word-importer';


export type {
  WordImportOptions,
  WordImportResult,
  WordDocumentMetadata,
} from './serializers/word-importer';

/**
 * Global JSX Support
 * This ensures that these custom elements are recognized in JSX/React environments.
 */
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'erix-button': any;
      'erix-divider': any;
      'erix-dropdown': any;
      'erix-editor': any;
      'erix-icon': any;
      'erix-popover': any;
      'erix-select': any;
      'erix-status-bar': any;
      'erix-table-picker': any;
      'erix-table-toolbar': any;
      'erix-toolbar': any;
    }
  }
}
