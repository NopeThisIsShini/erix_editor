/**
 * Plugin System Type Definitions
 * Advanced plugin architecture inspired by CKEditor.
 */

import type { EditorSelection } from './editor-api.types';

// =============================================================================
// PLUGIN TYPES
// =============================================================================

/**
 * Plugin identifier - must be unique.
 */
export type PluginId = string;

/**
 * Plugin group for toolbar organization.
 */
export type PluginGroup =
  | 'formatting'
  | 'alignment'
  | 'lists'
  | 'insert'
  | 'media'
  | 'table'
  | 'history'
  | 'tools'
  | 'custom';

/**
 * Plugin priority for ordering (lower = earlier).
 */
export type PluginPriority = number;

/**
 * Plugin execution context (passed to execute function).
 * Contains engine-agnostic information about the editor state.
 */
export interface PluginContext {
  /** Current selection info */
  selection: EditorSelection;
  /** Active marks at cursor */
  activeMarks: string[];
  /** Execute another plugin by ID */
  invokePlugin: (id: PluginId) => boolean;
  /** Check if a plugin is active */
  isPluginActive: (id: PluginId) => boolean;
  /** Get the current editor content as HTML */
  getHTML: () => string;
  /** Get the current editor content as plain text */
  getText: () => string;
}

/**
 * Plugin toolbar configuration.
 */
export interface PluginToolbarConfig {
  /** Show in main toolbar */
  showInToolbar?: boolean;
  /** Show in bubble/floating toolbar */
  showInBubble?: boolean;
  /** Show in block toolbar */
  showInBlock?: boolean;
  /** Custom toolbar position */
  position?: 'start' | 'middle' | 'end';
  /** Separator before this item */
  separator?: boolean;
}

/**
 * Plugin dropdown configuration.
 */
export interface PluginDropdownConfig {
  /** Dropdown items (plugin IDs) */
  items: PluginId[];
  /** Dropdown title */
  title?: string;
  /** Dropdown icon */
  icon?: string;
}

/**
 * Plugin configuration for registration.
 */
export interface ErixPluginConfig {
  /** Unique plugin identifier */
  id: PluginId;

  /** Human-readable label */
  label: string;

  /** Optional description for tooltips */
  description?: string;

  /** Icon name (from erix-icon set) or custom SVG string */
  icon?: string;

  /** Plugin group for toolbar organization */
  group?: PluginGroup;

  /** Priority within group (lower = earlier) */
  priority?: PluginPriority;

  /**
   * Execute function - called when plugin is invoked.
   * @param context - Plugin execution context
   * @returns true if the command was executed, false otherwise.
   *          Can be async for operations like file import/export.
   */
  execute: (context: PluginContext) => boolean | Promise<boolean>;

  /**
   * Optional: Check if plugin is currently active/enabled.
   * Used for toggle-style plugins (e.g., bold, italic).
   * @param context - Plugin context
   * @returns true if active
   */
  isActive?: (context: PluginContext) => boolean;

  /**
   * Optional: Check if plugin can be executed.
   * @param context - Plugin context
   * @returns true if executable
   */
  canExecute?: (context: PluginContext) => boolean;

  /**
   * Toolbar configuration.
   */
  toolbar?: PluginToolbarConfig;

  /**
   * Whether to show in toolbar (shorthand for toolbar.showInToolbar).
   * @default true
   */
  showInToolbar?: boolean;

  /**
   * Whether plugin is currently enabled.
   * @default true
   */
  enabled?: boolean;

  /**
   * Keyboard shortcut (e.g., 'Ctrl+B', 'Mod+Shift+L').
   * 'Mod' is translated to Ctrl on Windows/Linux, Cmd on Mac.
   */
  shortcut?: string;

  /**
   * Plugin dependencies (IDs of required plugins).
   */
  requires?: PluginId[];

  /**
   * Dropdown configuration (for dropdown-style plugins).
   */
  dropdown?: PluginDropdownConfig;

  /**
   * Custom render function for toolbar item.
   * If provided, overrides default button rendering.
   */
  render?: () => HTMLElement;

  /**
   * Called when plugin is registered.
   */
  onInit?: () => void;

  /**
   * Called when plugin is unregistered.
   */
  onDestroy?: () => void;

  /**
   * Custom metadata (for user extensions).
   */
  meta?: Record<string, unknown>;
}

/**
 * Registered plugin (internal + computed properties).
 */
export interface RegisteredPlugin extends ErixPluginConfig {
  /** Registration timestamp */
  registeredAt: number;
  /** Whether this is a built-in plugin */
  isBuiltin: boolean;
}

/**
 * Plugin query options.
 */
export interface PluginQueryOptions {
  /** Filter by group */
  group?: PluginGroup;
  /** Filter by enabled state */
  enabled?: boolean;
  /** Filter by toolbar visibility */
  showInToolbar?: boolean;
  /** Filter by built-in status */
  isBuiltin?: boolean;
  /** Include disabled plugins */
  includeDisabled?: boolean;
}

// =============================================================================
// EDITOR CONFIGURATION TYPES
// =============================================================================

/**
 * Toolbar item can be a plugin ID or a group configuration.
 */
export type ToolbarItem = PluginId | ToolbarGroup | '|' | '-';

/**
 * Toolbar group configuration.
 */
export interface ToolbarGroup {
  /** Group name */
  name: string;
  /** Items in the group */
  items: PluginId[];
}

/**
 * Toolbar configuration.
 */
export interface ToolbarConfig {
  /** Items to show in the toolbar */
  items: ToolbarItem[];
  /** Whether to show the toolbar */
  visible?: boolean;
  /** Sticky toolbar */
  sticky?: boolean;
}

/**
 * Editor plugins configuration.
 */
export interface PluginsConfig {
  /** Built-in plugins to enable (default: all) */
  builtin?: PluginId[] | 'all' | 'none';
  /** Built-in plugins to disable */
  disabled?: PluginId[];
  /** Custom plugins to register */
  custom?: ErixPluginConfig[];
}

/**
 * Complete editor configuration.
 */
export interface EditorConfig {
  /** Plugins configuration */
  plugins?: PluginsConfig;
  /** Toolbar configuration */
  toolbar?: ToolbarConfig;
  /** Initial content */
  content?: string;
  /** Content format */
  contentFormat?: 'html' | 'json';
  /** Placeholder text */
  placeholder?: string;
  /** Read-only mode */
  readonly?: boolean;
  /** Theme */
  theme?: 'light' | 'dark';
  /** Language */
  language?: string;
}

/**
 * Default editor configuration.
 */
export const DEFAULT_EDITOR_CONFIG: EditorConfig = {
  plugins: {
    builtin: 'all',
    disabled: [],
    custom: [],
  },
  toolbar: {
    items: [
      'undo', 'redo', '|',
      'bold', 'italic', 'underline', 'strikethrough', '|',
      'bullet-list', 'ordered-list', '|',
      'align-left', 'align-center', 'align-right',
    ],
    visible: true,
    sticky: false,
  },
  placeholder: 'Start typing...',
  readonly: false,
  theme: 'light',
};
