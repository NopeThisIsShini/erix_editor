/**
 * Erix Editor API
 *
 * The main public API class for interacting with the Erix Editor.
 * This class provides a stable, engine-agnostic interface.
 *
 * @example
 * ```typescript
 * // Get editor instance
 * const editor = document.querySelector('erix-editor').api;
 *
 * // Content operations
 * const content = editor.getContent('html');
 * editor.setContent('<p>Hello World</p>', 'html');
 * editor.clearContent();
 *
 * // Focus management
 * editor.focus();
 * editor.blur();
 *
 * // History
 * editor.undo();
 * editor.redo();
 *
 * // Events
 * editor.on('change', ({ content }) => console.log(content));
 *
 * // Plugins
 * editor.registerPlugin({
 *   id: 'my-custom-action',
 *   label: 'Custom Action',
 *   icon: 'star',
 *   execute: (ctx) => { console.log('executed!'); return true; }
 * });
 * editor.invokePlugin('my-custom-action');
 * ```
 */

import { EditorController } from '../core/editor/editor-controller';
import { PluginRegistry } from './plugin-registry';
import { createBuiltinPlugins } from './plugins';
import {
  serializeToHTML,
  serializeToText,
  serializeToJSON,
  parseFromHTML,
  parseFromJSON,
} from './serializers';

import type {
  ContentFormat,
  EditorContent,
  EditorDocumentJSON,
  EditorSelection,
  EditorStateSnapshot,
  EditorEventType,
  EditorEventPayload,
  EditorEventListener,
} from './editor-api.types';

import type {
  PluginId,
  ErixPluginConfig,
  RegisteredPlugin,
  PluginQueryOptions,
  PluginContext,
  EditorConfig,
  PluginGroup,
} from './plugin-registry.types';

// =============================================================================
// EVENT EMITTER
// =============================================================================

type EventListenerMap = {
  [K in EditorEventType]: Set<EditorEventListener<K>>;
};

/**
 * Simple event emitter for editor events.
 */
class EventEmitter {
  private listeners: EventListenerMap = {
    change: new Set(),
    focus: new Set(),
    blur: new Set(),
    selectionChange: new Set(),
    ready: new Set(),
    destroy: new Set(),
  };

  on<T extends EditorEventType>(
    event: T,
    listener: EditorEventListener<T>
  ): () => void {
    (this.listeners[event] as Set<EditorEventListener<T>>).add(listener);
    return () => this.off(event, listener);
  }

  off<T extends EditorEventType>(event: T, listener: EditorEventListener<T>): void {
    (this.listeners[event] as Set<EditorEventListener<T>>).delete(listener);
  }

  emit<T extends EditorEventType>(event: T, payload: EditorEventPayload[T]): void {
    for (const listener of this.listeners[event]) {
      try {
        (listener as EditorEventListener<T>)(payload);
      } catch (error) {
        console.error(`[ErixEditorAPI] Error in "${event}" listener:`, error);
      }
    }
  }

  clear(): void {
    for (const key of Object.keys(this.listeners) as EditorEventType[]) {
      this.listeners[key].clear();
    }
  }
}

// =============================================================================
// MAIN API CLASS
// =============================================================================

/**
 * ErixEditorAPI - Public API for the Erix Editor.
 *
 * This class provides a stable, framework-agnostic interface for:
 * - Reading and writing editor content
 * - Managing focus and selection
 * - Undo/redo operations
 * - Plugin registration and invocation
 * - Event handling
 */
export class ErixEditorAPI {
  private controller: EditorController;
  private pluginRegistry: PluginRegistry;
  private events: EventEmitter;
  private _isDestroyed: boolean = false;
  private config: EditorConfig;

  /**
   * Create a new ErixEditorAPI instance.
   * @param controller - The internal EditorController
   * @param config - Optional editor configuration
   * @internal This constructor is called by the erix-editor component.
   */
  constructor(controller: EditorController, config?: EditorConfig) {
    this.controller = controller;
    this.pluginRegistry = new PluginRegistry();
    this.events = new EventEmitter();
    this.config = config || {};

    // Register built-in plugins
    this.registerBuiltinPlugins();

    // Register custom plugins from config
    if (config?.plugins?.custom) {
      config.plugins.custom.forEach(plugin => {
        this.pluginRegistry.register(plugin, false);
      });
    }

    // Disable specified plugins
    if (config?.plugins?.disabled) {
      config.plugins.disabled.forEach(id => {
        this.pluginRegistry.disable(id);
      });
    }

    // Set up transaction listener for change events
    this.controller.addTransactionListener((tr, _newState) => {
      if (tr.docChanged) {
        this.events.emit('change', { content: this.getContent() });
      }
      if (tr.selectionSet) {
        this.events.emit('selectionChange', { selection: this.getSelection() });
      }
    });
  }

  // ===========================================================================
  // CONTENT METHODS
  // ===========================================================================

  /**
   * Get the current editor content in the specified format.
   * @param format - Output format ('html', 'json', or 'text')
   * @returns Content in the specified format
   */
  getContent(): EditorContent;
  getContent(format: 'html'): string;
  getContent(format: 'text'): string;
  getContent(format: 'json'): EditorDocumentJSON;
  getContent(format?: ContentFormat): EditorContent | string | EditorDocumentJSON {
    this.ensureNotDestroyed();

    const doc = this.controller.getDoc();
    const schema = this.controller.getSchema();

    if (format === 'html') {
      return serializeToHTML(doc, schema);
    }
    if (format === 'text') {
      return serializeToText(doc);
    }
    if (format === 'json') {
      return serializeToJSON(doc);
    }

    // Return all formats
    return {
      html: serializeToHTML(doc, schema),
      text: serializeToText(doc),
      json: serializeToJSON(doc),
    };
  }

  /**
   * Set the editor content.
   * @param content - Content to set (HTML string or JSON)
   * @param format - Content format hint
   */
  setContent(content: string, format?: 'html' | 'text'): void;
  setContent(content: EditorDocumentJSON, format?: 'json'): void;
  setContent(content: string | EditorDocumentJSON, format: ContentFormat = 'html'): void {
    this.ensureNotDestroyed();

    const schema = this.controller.getSchema();
    let doc;

    if (typeof content === 'string') {
      if (format === 'text') {
        // Wrap plain text in a paragraph
        const html = `<p>${this.escapeHTML(content)}</p>`;
        doc = parseFromHTML(html, schema);
      } else {
        doc = parseFromHTML(content, schema);
      }
    } else {
      doc = parseFromJSON(content, schema);
    }

    this.controller.setDoc(doc);
  }

  /**
   * Clear all editor content.
   */
  clearContent(): void {
    this.ensureNotDestroyed();
    this.controller.clearContent();
  }

  /**
   * Check if the editor content is empty.
   */
  isEmpty(): boolean {
    this.ensureNotDestroyed();
    return this.controller.isEmpty();
  }

  // ===========================================================================
  // IMPORT METHODS
  // ===========================================================================

  /**
   * Import content from a Word document (.docx file).
   * Opens a file picker dialog and imports the selected document.
   * 
   * @param options - Import options
   * @returns Promise resolving to import result, or null if cancelled
   * 
   * @example
   * ```typescript
   * const result = await editor.openWordImportDialog();
   * if (result) {
   *   console.log('Imported document:', result.metadata.title);
   * }
   * ```
   */
  async openWordImportDialog(options?: {
    preserveStyles?: boolean;
    preserveLists?: boolean;
  }): Promise<{ html: string; text: string; metadata: Record<string, unknown> } | null> {
    this.ensureNotDestroyed();
    
    const { openWordFileDialog } = await import('./serializers/word-importer');
    const result = await openWordFileDialog(options);
    
    if (result) {
      // Set the content in the editor
      this.setContent(result.html, 'html');
      
      return {
        html: result.html,
        text: result.text,
        metadata: result.metadata as Record<string, unknown>,
      };
    }
    
    return null;
  }

  /**
   * Import content from a Word document File or Blob.
   * 
   * @param file - The Word document file (.docx)
   * @param options - Import options
   * @returns Promise resolving to import result
   * 
   * @example
   * ```typescript
   * const fileInput = document.querySelector('input[type="file"]');
   * const file = fileInput.files[0];
   * const result = await editor.importFromWordFile(file);
   * ```
   */
  async importFromWordFile(
    file: File | Blob,
    options?: {
      preserveStyles?: boolean;
      preserveLists?: boolean;
    }
  ): Promise<{ html: string; text: string; metadata: Record<string, unknown> }> {
    this.ensureNotDestroyed();
    
    const { parseWordDocument } = await import('./serializers/word-importer');
    const result = await parseWordDocument(file, options);
    
    // Set the content in the editor
    this.setContent(result.html, 'html');
    
    return {
      html: result.html,
      text: result.text,
      metadata: result.metadata as Record<string, unknown>,
    };
  }

  /**
   * Parse a Word document without setting it as editor content.
   * Useful for previewing or processing documents before importing.
   * 
   * @param file - The Word document file (.docx)
   * @param options - Import options
   * @returns Promise resolving to parsed content
   */
  async parseWordDocument(
    file: File | Blob,
    options?: {
      preserveStyles?: boolean;
      preserveLists?: boolean;
    }
  ): Promise<{ html: string; text: string; metadata: Record<string, unknown> }> {
    const { parseWordDocument } = await import('./serializers/word-importer');
    const result = await parseWordDocument(file, options);
    
    return {
      html: result.html,
      text: result.text,
      metadata: result.metadata as Record<string, unknown>,
    };
  }

  // ===========================================================================
  // FOCUS METHODS
  // ===========================================================================

  /**
   * Focus the editor.
   */
  focus(): void {
    this.ensureNotDestroyed();
    this.controller.focus();
    this.events.emit('focus', undefined);
  }

  /**
   * Remove focus from the editor.
   */
  blur(): void {
    this.ensureNotDestroyed();
    const view = this.controller.getView();
    (view.dom as HTMLElement).blur();
    this.events.emit('blur', undefined);
  }

  /**
   * Check if the editor is currently focused.
   */
  hasFocus(): boolean {
    this.ensureNotDestroyed();
    return this.controller.hasFocus();
  }

  // ===========================================================================
  // SELECTION METHODS
  // ===========================================================================

  /**
   * Get the current selection.
   */
  getSelection(): EditorSelection {
    this.ensureNotDestroyed();
    return this.controller.getSelection();
  }

  /**
   * Set the selection range.
   * @param from - Start position
   * @param to - End position (defaults to from for cursor)
   */
  setSelection(from: number, to?: number): void {
    this.ensureNotDestroyed();
    this.controller.setSelection(from, to ?? from);
  }

  /**
   * Select all content.
   */
  selectAll(): void {
    this.ensureNotDestroyed();
    this.controller.selectAll();
  }

  // ===========================================================================
  // HISTORY METHODS
  // ===========================================================================

  /**
   * Undo the last action.
   * @returns true if undo was performed
   */
  undo(): boolean {
    this.ensureNotDestroyed();
    return this.controller.undo();
  }

  /**
   * Redo the last undone action.
   * @returns true if redo was performed
   */
  redo(): boolean {
    this.ensureNotDestroyed();
    return this.controller.redo();
  }

  /**
   * Check if undo is available.
   */
  canUndo(): boolean {
    this.ensureNotDestroyed();
    return this.controller.canUndo();
  }

  /**
   * Check if redo is available.
   */
  canRedo(): boolean {
    this.ensureNotDestroyed();
    return this.controller.canRedo();
  }

  // ===========================================================================
  // STATE METHODS
  // ===========================================================================

  /**
   * Get a snapshot of the current editor state.
   */
  getState(): EditorStateSnapshot {
    this.ensureNotDestroyed();
    return {
      isFocused: this.hasFocus(),
      isEmpty: this.isEmpty(),
      selection: this.getSelection(),
      activeMarks: this.controller.getActiveMarks(),
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
    };
  }

  /**
   * Check if a specific mark/format is active at the current selection.
   * @param markName - Name of the mark (e.g., 'strong', 'em')
   */
  isMarkActive(markName: string): boolean {
    this.ensureNotDestroyed();
    return this.controller.isMarkActive(markName);
  }

  // ===========================================================================
  // PLUGIN METHODS
  // ===========================================================================

  /**
   * Register a custom plugin.
   * @param config - Plugin configuration
   * @throws Error if plugin ID already exists
   */
  registerPlugin(config: ErixPluginConfig): void {
    this.ensureNotDestroyed();
    this.pluginRegistry.register(config, false);
  }

  /**
   * Register multiple plugins at once.
   * @param configs - Array of plugin configurations
   */
  registerPlugins(configs: ErixPluginConfig[]): void {
    this.ensureNotDestroyed();
    this.pluginRegistry.registerAll(configs, false);
  }

  /**
   * Unregister a plugin by ID.
   * @param id - Plugin identifier
   * @returns true if plugin was removed
   */
  unregisterPlugin(id: PluginId): boolean {
    this.ensureNotDestroyed();
    return this.pluginRegistry.unregister(id);
  }

  /**
   * Invoke a registered plugin by ID.
   * @param id - Plugin identifier
   * @returns true if plugin was executed successfully
   */
  invokePlugin(id: PluginId): boolean {
    this.ensureNotDestroyed();
    const context = this.createPluginContext();
    return this.pluginRegistry.execute(id, context);
  }

  /**
   * Get all registered plugins.
   * @param options - Optional query filters
   */
  getPlugins(options?: PluginQueryOptions): RegisteredPlugin[] {
    this.ensureNotDestroyed();
    return this.pluginRegistry.getAll(options);
  }

  /**
   * Get plugins by group.
   * @param group - Plugin group
   */
  getPluginsByGroup(group: PluginGroup): RegisteredPlugin[] {
    this.ensureNotDestroyed();
    return this.pluginRegistry.getByGroup(group);
  }

  /**
   * Get a specific plugin by ID.
   * @param id - Plugin identifier
   */
  getPlugin(id: PluginId): RegisteredPlugin | undefined {
    this.ensureNotDestroyed();
    return this.pluginRegistry.get(id);
  }

  /**
   * Enable a plugin.
   * @param id - Plugin identifier
   */
  enablePlugin(id: PluginId): void {
    this.ensureNotDestroyed();
    this.pluginRegistry.enable(id);
  }

  /**
   * Disable a plugin.
   * @param id - Plugin identifier
   */
  disablePlugin(id: PluginId): void {
    this.ensureNotDestroyed();
    this.pluginRegistry.disable(id);
  }

  /**
   * Enable or disable a plugin.
   * @param id - Plugin identifier
   * @param enabled - Enabled state
   */
  setPluginEnabled(id: PluginId, enabled: boolean): void {
    this.ensureNotDestroyed();
    this.pluginRegistry.setEnabled(id, enabled);
  }

  /**
   * Check if a plugin is currently active.
   * @param id - Plugin identifier
   */
  isPluginActive(id: PluginId): boolean {
    this.ensureNotDestroyed();
    const context = this.createPluginContext();
    return this.pluginRegistry.isActive(id, context);
  }

  /**
   * Check if a plugin can be executed.
   * @param id - Plugin identifier
   */
  canExecutePlugin(id: PluginId): boolean {
    this.ensureNotDestroyed();
    const context = this.createPluginContext();
    return this.pluginRegistry.canExecute(id, context);
  }

  /**
   * Get the number of registered plugins.
   */
  getPluginCount(): number {
    return this.pluginRegistry.count;
  }

  /**
   * Export plugin configuration.
   */
  exportPluginConfig(): { id: PluginId; enabled: boolean }[] {
    return this.pluginRegistry.export();
  }

  /**
   * Import plugin configuration.
   * @param config - Configuration to import
   */
  importPluginConfig(config: { id: PluginId; enabled: boolean }[]): void {
    this.pluginRegistry.import(config);
  }

  // ===========================================================================
  // EVENT METHODS
  // ===========================================================================

  /**
   * Subscribe to an editor event.
   * @param event - Event type
   * @param listener - Event listener function
   * @returns Unsubscribe function
   */
  on<T extends EditorEventType>(event: T, listener: EditorEventListener<T>): () => void {
    this.ensureNotDestroyed();
    return this.events.on(event, listener);
  }

  /**
   * Unsubscribe from an editor event.
   * @param event - Event type
   * @param listener - Event listener function
   */
  off<T extends EditorEventType>(event: T, listener: EditorEventListener<T>): void {
    this.ensureNotDestroyed();
    this.events.off(event, listener);
  }

  // ===========================================================================
  // LIFECYCLE METHODS
  // ===========================================================================

  /**
   * Destroy the editor instance and clean up resources.
   */
  destroy(): void {
    if (this._isDestroyed) return;

    this.events.emit('destroy', undefined);
    this.events.clear();
    this.pluginRegistry.clear();
    this.controller.destroy();
    this._isDestroyed = true;
  }

  /**
   * Check if the editor has been destroyed.
   */
  isDestroyed(): boolean {
    return this._isDestroyed;
  }

  // ===========================================================================
  // PRIVATE METHODS
  // ===========================================================================

  /**
   * Create a plugin execution context.
   */
  private createPluginContext(): PluginContext {
    return {
      selection: this.getSelection(),
      activeMarks: this.controller.getActiveMarks(),
      invokePlugin: (id: PluginId) => this.invokePlugin(id),
      isPluginActive: (id: PluginId) => this.isPluginActive(id),
      getHTML: () => this.getContent('html'),
      getText: () => this.getContent('text'),
    };
  }

  /**
   * Register built-in plugins.
   */
  private registerBuiltinPlugins(): void {
    const builtinConfig = this.config.plugins?.builtin;

    // Skip if explicitly set to 'none'
    if (builtinConfig === 'none') {
      return;
    }

    // Create built-in plugins with proper closures
    const builtinPlugins = createBuiltinPlugins(
      () => this.controller.getView(),
      (markName: string) => this.isMarkActive(markName),
      () => this.undo(),
      () => this.redo(),
      () => this.canUndo(),
      () => this.canRedo()
    );

    // Filter plugins if specific list provided
    let pluginsToRegister = builtinPlugins;
    if (Array.isArray(builtinConfig)) {
      pluginsToRegister = builtinPlugins.filter(p => builtinConfig.includes(p.id));
    }

    // Register all built-in plugins
    this.pluginRegistry.registerAll(pluginsToRegister, true);
  }

  /**
   * Escape HTML special characters.
   */
  private escapeHTML(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Ensure the API is not destroyed.
   */
  private ensureNotDestroyed(): void {
    if (this._isDestroyed) {
      throw new Error('ErixEditorAPI has been destroyed.');
    }
  }
}
