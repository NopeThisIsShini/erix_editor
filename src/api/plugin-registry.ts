/**
 * Plugin Registry
 * Advanced plugin management system inspired by CKEditor.
 */

import type {
  PluginId,
  ErixPluginConfig,
  RegisteredPlugin,
  PluginQueryOptions,
  PluginContext,
  PluginGroup,
} from './plugin-registry.types';

/**
 * PluginRegistry manages all registered plugins.
 * Provides advanced features like dependency resolution, groups, and lifecycle hooks.
 */
export class PluginRegistry {
  private plugins: Map<PluginId, RegisteredPlugin> = new Map();
  private groups: Map<PluginGroup, Set<PluginId>> = new Map();
  private shortcuts: Map<string, PluginId> = new Map();

  constructor() {
    // Initialize group sets
    const groups: PluginGroup[] = [
      'formatting', 'alignment', 'lists', 'insert', 
      'media', 'table', 'history', 'tools', 'custom'
    ];
    groups.forEach(g => this.groups.set(g, new Set()));
  }

  // ===========================================================================
  // REGISTRATION
  // ===========================================================================

  /**
   * Register a new plugin.
   * @param config - Plugin configuration
   * @param isBuiltin - Whether this is a built-in plugin
   * @throws Error if plugin ID already exists or dependencies are missing
   */
  register(config: ErixPluginConfig, isBuiltin: boolean = false): void {
    if (this.plugins.has(config.id)) {
      throw new Error(`Plugin with ID "${config.id}" is already registered.`);
    }

    // Check dependencies
    if (config.requires) {
      const missing = config.requires.filter(id => !this.plugins.has(id));
      if (missing.length > 0) {
        throw new Error(
          `Plugin "${config.id}" requires missing plugins: ${missing.join(', ')}`
        );
      }
    }

    const plugin: RegisteredPlugin = {
      ...config,
      enabled: config.enabled ?? true,
      showInToolbar: config.showInToolbar ?? true,
      priority: config.priority ?? 100,
      group: config.group ?? 'custom',
      registeredAt: Date.now(),
      isBuiltin,
    };

    this.plugins.set(config.id, plugin);

    // Add to group
    const groupSet = this.groups.get(plugin.group);
    if (groupSet) {
      groupSet.add(config.id);
    }

    // Register shortcut
    if (config.shortcut) {
      this.shortcuts.set(this.normalizeShortcut(config.shortcut), config.id);
    }

    // Call init hook
    if (config.onInit) {
      try {
        config.onInit();
      } catch (error) {
        console.error(`[PluginRegistry] Error in onInit for "${config.id}":`, error);
      }
    }
  }

  /**
   * Register multiple plugins at once.
   * @param configs - Array of plugin configurations
   * @param isBuiltin - Whether these are built-in plugins
   */
  registerAll(configs: ErixPluginConfig[], isBuiltin: boolean = false): void {
    configs.forEach(config => this.register(config, isBuiltin));
  }

  /**
   * Unregister a plugin by ID.
   * @param id - Plugin identifier
   * @returns true if plugin was removed
   */
  unregister(id: PluginId): boolean {
    const plugin = this.plugins.get(id);
    if (!plugin) return false;

    // Check if other plugins depend on this one
    const dependents = this.getDependents(id);
    if (dependents.length > 0) {
      console.warn(
        `[PluginRegistry] Cannot unregister "${id}": required by ${dependents.join(', ')}`
      );
      return false;
    }

    // Call destroy hook
    if (plugin.onDestroy) {
      try {
        plugin.onDestroy();
      } catch (error) {
        console.error(`[PluginRegistry] Error in onDestroy for "${id}":`, error);
      }
    }

    // Remove from group
    const groupSet = this.groups.get(plugin.group!);
    if (groupSet) {
      groupSet.delete(id);
    }

    // Remove shortcut
    if (plugin.shortcut) {
      this.shortcuts.delete(this.normalizeShortcut(plugin.shortcut));
    }

    return this.plugins.delete(id);
  }

  // ===========================================================================
  // QUERIES
  // ===========================================================================

  /**
   * Get a plugin by ID.
   * @param id - Plugin identifier
   */
  get(id: PluginId): RegisteredPlugin | undefined {
    return this.plugins.get(id);
  }

  /**
   * Check if a plugin exists.
   * @param id - Plugin identifier
   */
  has(id: PluginId): boolean {
    return this.plugins.has(id);
  }

  /**
   * Get all plugins, optionally filtered.
   * @param options - Query options
   */
  getAll(options?: PluginQueryOptions): RegisteredPlugin[] {
    let result = Array.from(this.plugins.values());

    if (options?.group !== undefined) {
      result = result.filter(p => p.group === options.group);
    }

    if (options?.enabled !== undefined) {
      result = result.filter(p => p.enabled === options.enabled);
    }

    if (options?.showInToolbar !== undefined) {
      result = result.filter(p => p.showInToolbar === options.showInToolbar);
    }

    if (options?.isBuiltin !== undefined) {
      result = result.filter(p => p.isBuiltin === options.isBuiltin);
    }

    if (!options?.includeDisabled) {
      result = result.filter(p => p.enabled);
    }

    // Sort by priority
    return result.sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100));
  }

  /**
   * Get all plugins in a specific group.
   * @param group - Plugin group
   */
  getByGroup(group: PluginGroup): RegisteredPlugin[] {
    return this.getAll({ group });
  }

  /**
   * Get plugins that depend on a specific plugin.
   * @param id - Plugin identifier
   */
  getDependents(id: PluginId): PluginId[] {
    const dependents: PluginId[] = [];
    for (const [pluginId, plugin] of this.plugins) {
      if (plugin.requires?.includes(id)) {
        dependents.push(pluginId);
      }
    }
    return dependents;
  }

  /**
   * Get plugin by keyboard shortcut.
   * @param shortcut - Keyboard shortcut string
   */
  getByShortcut(shortcut: string): RegisteredPlugin | undefined {
    const normalizedShortcut = this.normalizeShortcut(shortcut);
    const pluginId = this.shortcuts.get(normalizedShortcut);
    return pluginId ? this.plugins.get(pluginId) : undefined;
  }

  // ===========================================================================
  // STATE MANAGEMENT
  // ===========================================================================

  /**
   * Set plugin enabled state.
   * @param id - Plugin identifier
   * @param enabled - Enabled state
   */
  setEnabled(id: PluginId, enabled: boolean): void {
    const plugin = this.plugins.get(id);
    if (plugin) {
      plugin.enabled = enabled;
    }
  }

  /**
   * Enable a plugin.
   * @param id - Plugin identifier
   */
  enable(id: PluginId): void {
    this.setEnabled(id, true);
  }

  /**
   * Disable a plugin.
   * @param id - Plugin identifier
   */
  disable(id: PluginId): void {
    this.setEnabled(id, false);
  }

  /**
   * Toggle plugin enabled state.
   * @param id - Plugin identifier
   * @returns New enabled state
   */
  toggle(id: PluginId): boolean {
    const plugin = this.plugins.get(id);
    if (plugin) {
      plugin.enabled = !plugin.enabled;
      return plugin.enabled;
    }
    return false;
  }

  // ===========================================================================
  // EXECUTION
  // ===========================================================================

  /**
   * Execute a plugin.
   * @param id - Plugin identifier
   * @param context - Execution context
   * @returns true if executed successfully (for async plugins, returns true if started)
   */
  execute(id: PluginId, context: PluginContext): boolean {
    const plugin = this.plugins.get(id);
    
    if (!plugin) {
      console.warn(`[PluginRegistry] Plugin "${id}" not found.`);
      return false;
    }

    if (!plugin.enabled) {
      console.warn(`[PluginRegistry] Plugin "${id}" is disabled.`);
      return false;
    }

    if (plugin.canExecute && !plugin.canExecute(context)) {
      return false;
    }

    try {
      const result = plugin.execute(context);
      
      // Handle async execute functions
      if (result instanceof Promise) {
        // For async plugins, we return true immediately and handle errors in the background
        result.catch((error) => {
          console.error(`[PluginRegistry] Async plugin "${id}" execution failed:`, error);
        });
        return true;
      }
      
      return result;
    } catch (error) {
      console.error(`[PluginRegistry] Error executing plugin "${id}":`, error);
      return false;
    }
  }

  /**
   * Execute a plugin by keyboard shortcut.
   * @param shortcut - Keyboard shortcut
   * @param context - Execution context
   * @returns true if executed
   */
  executeByShortcut(shortcut: string, context: PluginContext): boolean {
    const plugin = this.getByShortcut(shortcut);
    if (plugin) {
      return this.execute(plugin.id, context);
    }
    return false;
  }

  /**
   * Check if a plugin is active.
   * @param id - Plugin identifier
   * @param context - Execution context
   */
  isActive(id: PluginId, context: PluginContext): boolean {
    const plugin = this.plugins.get(id);
    if (!plugin || !plugin.isActive) {
      return false;
    }
    return plugin.isActive(context);
  }

  /**
   * Check if a plugin can be executed.
   * @param id - Plugin identifier
   * @param context - Execution context
   */
  canExecute(id: PluginId, context: PluginContext): boolean {
    const plugin = this.plugins.get(id);
    if (!plugin || !plugin.enabled) {
      return false;
    }
    if (plugin.canExecute) {
      return plugin.canExecute(context);
    }
    return true;
  }

  // ===========================================================================
  // UTILITIES
  // ===========================================================================

  /**
   * Get the total number of registered plugins.
   */
  get count(): number {
    return this.plugins.size;
  }

  /**
   * Get all plugin IDs.
   */
  get ids(): PluginId[] {
    return Array.from(this.plugins.keys());
  }

  /**
   * Clear all plugins.
   */
  clear(): void {
    // Call destroy hooks
    for (const plugin of this.plugins.values()) {
      if (plugin.onDestroy) {
        try {
          plugin.onDestroy();
        } catch (error) {
          console.error(`[PluginRegistry] Error in onDestroy for "${plugin.id}":`, error);
        }
      }
    }

    this.plugins.clear();
    this.shortcuts.clear();
    this.groups.forEach(g => g.clear());
  }

  /**
   * Normalize a keyboard shortcut for comparison.
   */
  private normalizeShortcut(shortcut: string): string {
    return shortcut
      .toLowerCase()
      .replace(/mod/g, 'ctrl')
      .split('+')
      .sort()
      .join('+');
  }

  /**
   * Export plugins configuration (for serialization).
   */
  export(): { id: PluginId; enabled: boolean }[] {
    return Array.from(this.plugins.values()).map(p => ({
      id: p.id,
      enabled: p.enabled ?? true,
    }));
  }

  /**
   * Import plugins configuration.
   * @param config - Configuration to import
   */
  import(config: { id: PluginId; enabled: boolean }[]): void {
    config.forEach(({ id, enabled }) => {
      this.setEnabled(id, enabled);
    });
  }
}
