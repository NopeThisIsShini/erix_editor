# Erix Editor - Public API Design Document

## Overview

This document outlines the design for a **stable, minimal, framework-agnostic public API** for the Erix rich text editor. The API abstracts the underlying ProseMirror engine, providing a clean interface for consumers to:

- Read and write editor content
- Control focus and selection
- Manage undo/redo history
- Register and invoke custom plugins

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PUBLIC API LAYER                            │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    ErixEditorAPI (Class)                      │  │
│  │  - getContent() / setContent() / clearContent()               │  │
│  │  - focus() / blur() / hasFocus()                              │  │
│  │  - undo() / redo() / canUndo() / canRedo()                    │  │
│  │  - registerPlugin() / invokePlugin() / getPlugins()           │  │
│  │  - on() / off() / emit()                                      │  │
│  └────────────────────────────┬──────────────────────────────────┘  │
└───────────────────────────────┼─────────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────────┐
│                        EDITOR LAYER                                 │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                 EditorController (Internal)                   │  │
│  │  - Wraps ProseMirror EditorView                               │  │
│  │  - Manages state, transactions, plugins                       │  │
│  │  - Bridges public API to engine internals                     │  │
│  └────────────────────────────┬──────────────────────────────────┘  │
└───────────────────────────────┼─────────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────────┐
│                       PROSEMIRROR ENGINE                            │
│  ┌─────────────────┐  ┌───────────────┐  ┌────────────────────┐     │
│  │   EditorView    │  │  EditorState  │  │  Schema/Plugins    │     │
│  └─────────────────┘  └───────────────┘  └────────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
src/
├─ api/                              ← NEW: Public API module
│  ├─ index.ts                       ← Barrel export
│  ├─ editor-api.ts                  ← Main ErixEditorAPI class
│  ├─ editor-api.types.ts            ← Public type definitions
│  ├─ plugin-registry.ts             ← Plugin registration system
│  ├─ plugin-registry.types.ts       ← Plugin type definitions
│  └─ serializers/                   ← Content serializers
│     ├─ html-serializer.ts
│     ├─ json-serializer.ts
│     └─ index.ts
│
├─ core/
│  ├─ editor/                        ← NEW: Editor controller layer
│  │  ├─ editor-controller.ts        ← Wraps EditorView (internal)
│  │  ├─ editor-controller.types.ts  ← Internal types
│  │  └─ index.ts
│  ├─ schema/
│  ├─ plugins/
│  ├─ commands/
│  └─ index.ts
│
├─ components/
│  └─ erix-editor/
│
└─ index.ts                          ← NPM entry point (exports API)
```

---

## Type Definitions

### `src/api/editor-api.types.ts`

```typescript
/**
 * Public API Type Definitions
 * These types are exposed to consumers and must remain stable.
 */

// =============================================================================
// CONTENT TYPES
// =============================================================================

/**
 * Supported content formats for serialization.
 */
export type ContentFormat = 'html' | 'json' | 'text';

/**
 * Represents editor content in multiple formats.
 */
export interface EditorContent {
  /** HTML string representation */
  html: string;
  /** Plain text representation */
  text: string;
  /** JSON document structure (engine-agnostic) */
  json: EditorDocumentJSON;
}

/**
 * JSON representation of the editor document.
 * This is a simplified, engine-agnostic structure.
 */
export interface EditorDocumentJSON {
  type: 'doc';
  content: EditorNodeJSON[];
}

/**
 * JSON representation of a document node.
 */
export interface EditorNodeJSON {
  type: string;
  attrs?: Record<string, unknown>;
  content?: EditorNodeJSON[];
  text?: string;
  marks?: EditorMarkJSON[];
}

/**
 * JSON representation of a mark (formatting).
 */
export interface EditorMarkJSON {
  type: string;
  attrs?: Record<string, unknown>;
}

// =============================================================================
// SELECTION TYPES
// =============================================================================

/**
 * Represents the current selection in the editor.
 */
export interface EditorSelection {
  /** Start position (character offset) */
  from: number;
  /** End position (character offset) */
  to: number;
  /** Whether the selection is collapsed (cursor) */
  isEmpty: boolean;
  /** Selected text content */
  selectedText: string;
}

// =============================================================================
// STATE TYPES
// =============================================================================

/**
 * Read-only snapshot of the editor state.
 */
export interface EditorStateSnapshot {
  /** Whether the editor is focused */
  isFocused: boolean;
  /** Whether the editor content is empty */
  isEmpty: boolean;
  /** Current selection */
  selection: EditorSelection;
  /** Active formatting marks at cursor */
  activeMarks: string[];
  /** Whether undo is available */
  canUndo: boolean;
  /** Whether redo is available */
  canRedo: boolean;
}

// =============================================================================
// EVENT TYPES
// =============================================================================

/**
 * Editor event types.
 */
export type EditorEventType = 'change' | 'focus' | 'blur' | 'selectionChange' | 'ready' | 'destroy';

/**
 * Event payload for editor events.
 */
export interface EditorEventPayload {
  change: { content: EditorContent };
  focus: void;
  blur: void;
  selectionChange: { selection: EditorSelection };
  ready: void;
  destroy: void;
}

/**
 * Event listener function type.
 */
export type EditorEventListener<T extends EditorEventType> = (payload: EditorEventPayload[T]) => void;

// =============================================================================
// CONFIGURATION TYPES
// =============================================================================

/**
 * Editor initialization options.
 */
export interface EditorOptions {
  /** Initial content (HTML, JSON, or plain text) */
  content?: string | EditorDocumentJSON;
  /** Content format hint for string content */
  contentFormat?: ContentFormat;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the editor is read-only */
  readOnly?: boolean;
  /** Theme ('light' or 'dark') */
  theme?: 'light' | 'dark';
  /** Custom plugins to register */
  plugins?: ErixPluginConfig[];
}
```

### `src/api/plugin-registry.types.ts`

```typescript
/**
 * Plugin System Type Definitions
 */

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
export type PluginGroup = 'formatting' | 'alignment' | 'lists' | 'insert' | 'history' | 'custom';

/**
 * Plugin priority for ordering (lower = earlier).
 */
export type PluginPriority = number;

/**
 * Plugin execution context (passed to execute function).
 * Contains only engine-agnostic information.
 */
export interface PluginContext {
  /** Current selection info */
  selection: EditorSelection;
  /** Active marks at cursor */
  activeMarks: string[];
  /** Execute another plugin by ID */
  invokePlugin: (id: PluginId) => boolean;
}

/**
 * Plugin configuration for registration.
 */
export interface ErixPluginConfig {
  /** Unique plugin identifier */
  id: PluginId;

  /** Human-readable label */
  label: string;

  /** Icon name (from erix-icon set) or custom SVG */
  icon?: string;

  /** Plugin group for toolbar organization */
  group?: PluginGroup;

  /** Priority within group (lower = earlier) */
  priority?: PluginPriority;

  /**
   * Execute function - called when plugin is invoked.
   * @param context - Plugin execution context
   * @returns true if the command was executed, false otherwise
   */
  execute: (context: PluginContext) => boolean;

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
   * Whether to show in toolbar.
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
}
```

---

## Main API Class

### `src/api/editor-api.ts`

````typescript
/**
 * ErixEditorAPI
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
export class ErixEditorAPI {
  // =========================================================================
  // CONTENT METHODS
  // =========================================================================

  /**
   * Get the current editor content in the specified format.
   * @param format - Output format ('html', 'json', or 'text')
   * @returns Content in the specified format
   */
  getContent(format: 'html'): string;
  getContent(format: 'text'): string;
  getContent(format: 'json'): EditorDocumentJSON;
  getContent(): EditorContent;

  /**
   * Set the editor content.
   * @param content - Content to set (HTML string or JSON)
   * @param format - Content format hint
   */
  setContent(content: string, format?: 'html' | 'text'): void;
  setContent(content: EditorDocumentJSON, format?: 'json'): void;

  /**
   * Clear all editor content.
   */
  clearContent(): void;

  /**
   * Insert content at the current cursor position.
   * @param content - Content to insert
   * @param format - Content format
   */
  insertContent(content: string, format?: ContentFormat): void;

  // =========================================================================
  // FOCUS METHODS
  // =========================================================================

  /**
   * Focus the editor.
   */
  focus(): void;

  /**
   * Remove focus from the editor.
   */
  blur(): void;

  /**
   * Check if the editor is currently focused.
   */
  hasFocus(): boolean;

  // =========================================================================
  // SELECTION METHODS
  // =========================================================================

  /**
   * Get the current selection.
   */
  getSelection(): EditorSelection;

  /**
   * Set the selection range.
   * @param from - Start position
   * @param to - End position (defaults to from for cursor)
   */
  setSelection(from: number, to?: number): void;

  /**
   * Select all content.
   */
  selectAll(): void;

  // =========================================================================
  // HISTORY METHODS
  // =========================================================================

  /**
   * Undo the last action.
   * @returns true if undo was performed
   */
  undo(): boolean;

  /**
   * Redo the last undone action.
   * @returns true if redo was performed
   */
  redo(): boolean;

  /**
   * Check if undo is available.
   */
  canUndo(): boolean;

  /**
   * Check if redo is available.
   */
  canRedo(): boolean;

  // =========================================================================
  // STATE METHODS
  // =========================================================================

  /**
   * Get a snapshot of the current editor state.
   */
  getState(): EditorStateSnapshot;

  /**
   * Check if the editor content is empty.
   */
  isEmpty(): boolean;

  /**
   * Check if a specific mark/format is active at the current selection.
   * @param markName - Name of the mark (e.g., 'bold', 'italic')
   */
  isMarkActive(markName: string): boolean;

  // =========================================================================
  // PLUGIN METHODS
  // =========================================================================

  /**
   * Register a custom plugin.
   * @param config - Plugin configuration
   * @throws Error if plugin ID already exists
   */
  registerPlugin(config: ErixPluginConfig): void;

  /**
   * Unregister a plugin by ID.
   * @param id - Plugin identifier
   * @returns true if plugin was removed
   */
  unregisterPlugin(id: PluginId): boolean;

  /**
   * Invoke a registered plugin by ID.
   * @param id - Plugin identifier
   * @returns true if plugin was executed successfully
   */
  invokePlugin(id: PluginId): boolean;

  /**
   * Get all registered plugins.
   * @param options - Optional query filters
   */
  getPlugins(options?: PluginQueryOptions): RegisteredPlugin[];

  /**
   * Get a specific plugin by ID.
   * @param id - Plugin identifier
   */
  getPlugin(id: PluginId): RegisteredPlugin | undefined;

  /**
   * Enable or disable a plugin.
   * @param id - Plugin identifier
   * @param enabled - Enabled state
   */
  setPluginEnabled(id: PluginId, enabled: boolean): void;

  /**
   * Check if a plugin is currently active.
   * @param id - Plugin identifier
   */
  isPluginActive(id: PluginId): boolean;

  // =========================================================================
  // EVENT METHODS
  // =========================================================================

  /**
   * Subscribe to an editor event.
   * @param event - Event type
   * @param listener - Event listener function
   * @returns Unsubscribe function
   */
  on<T extends EditorEventType>(event: T, listener: EditorEventListener<T>): () => void;

  /**
   * Unsubscribe from an editor event.
   * @param event - Event type
   * @param listener - Event listener function
   */
  off<T extends EditorEventType>(event: T, listener: EditorEventListener<T>): void;

  // =========================================================================
  // LIFECYCLE METHODS
  // =========================================================================

  /**
   * Destroy the editor instance and clean up resources.
   */
  destroy(): void;

  /**
   * Check if the editor has been destroyed.
   */
  isDestroyed(): boolean;
}
````

---

## Built-in Plugins

The editor ships with pre-registered plugins for common formatting operations:

| Plugin ID       | Group      | Label           | Shortcut    |
| --------------- | ---------- | --------------- | ----------- |
| `bold`          | formatting | Bold            | Mod+B       |
| `italic`        | formatting | Italic          | Mod+I       |
| `underline`     | formatting | Underline       | Mod+U       |
| `strikethrough` | formatting | Strikethrough   | Mod+Shift+S |
| `superscript`   | formatting | Superscript     | —           |
| `subscript`     | formatting | Subscript       | —           |
| `bullet-list`   | lists      | Bullet List     | Mod+Shift+8 |
| `ordered-list`  | lists      | Ordered List    | Mod+Shift+7 |
| `indent`        | lists      | Increase Indent | Tab         |
| `outdent`       | lists      | Decrease Indent | Shift+Tab   |
| `align-left`    | alignment  | Align Left      | —           |
| `align-center`  | alignment  | Align Center    | —           |
| `align-right`   | alignment  | Align Right     | —           |
| `align-justify` | alignment  | Justify         | —           |
| `undo`          | history    | Undo            | Mod+Z       |
| `redo`          | history    | Redo            | Mod+Shift+Z |

---

## Usage Examples

### Basic Usage

```typescript
// Get editor API reference
const editorEl = document.querySelector('erix-editor');
const editor = editorEl.api;

// Set content
editor.setContent('<p>Hello <strong>World</strong></p>', 'html');

// Get content
const html = editor.getContent('html');
const json = editor.getContent('json');

// Focus and selection
editor.focus();
editor.selectAll();

// History
if (editor.canUndo()) {
  editor.undo();
}
```

### Event Handling

```typescript
// Listen for content changes
const unsubscribe = editor.on('change', ({ content }) => {
  console.log('Content changed:', content.html);
  saveToServer(content.json);
});

// Listen for selection changes
editor.on('selectionChange', ({ selection }) => {
  console.log('Selection:', selection.from, selection.to);
});

// Cleanup
unsubscribe();
```

### Custom Plugin Registration

```typescript
// Register a custom plugin
editor.registerPlugin({
  id: 'insert-timestamp',
  label: 'Insert Timestamp',
  icon: 'clock',
  group: 'insert',
  priority: 10,
  shortcut: 'Mod+Shift+T',
  showInToolbar: true,

  execute: ctx => {
    const timestamp = new Date().toLocaleString();
    // Insert at cursor position
    return true;
  },

  canExecute: ctx => {
    return !ctx.selection.isEmpty || true;
  },
});

// Invoke programmatically
editor.invokePlugin('insert-timestamp');

// Query plugins
const insertPlugins = editor.getPlugins({ group: 'insert' });
```

### React Integration

```tsx
import { useRef, useEffect, useState } from 'react';
import type { ErixEditorAPI, EditorContent } from 'erix';

function MyEditor() {
  const editorRef = useRef<HTMLErixEditorElement>(null);
  const [content, setContent] = useState<EditorContent | null>(null);

  useEffect(() => {
    const editor = editorRef.current?.api;
    if (!editor) return;

    const unsubscribe = editor.on('change', ({ content }) => {
      setContent(content);
    });

    return () => unsubscribe();
  }, []);

  return <erix-editor ref={editorRef} />;
}
```

### Vue Integration

```vue
<template>
  <erix-editor ref="editorRef" @change="handleChange" />
</template>

<script setup>
import { ref, onMounted } from 'vue';

const editorRef = ref(null);

onMounted(() => {
  const editor = editorRef.value?.api;
  editor.setContent('<p>Initial content</p>', 'html');
});

const handleChange = event => {
  console.log('Content:', event.detail.content);
};
</script>
```

---

## NPM Entry Point

### `src/index.ts`

```typescript
/**
 * Erix Editor - Public Exports
 *
 * This is the main entry point for npm consumers.
 * Only stable, documented APIs are exported here.
 */

// =============================================================================
// PUBLIC API
// =============================================================================

export { ErixEditorAPI } from './api/editor-api';

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
} from './api/editor-api.types';

export type {
  // Plugin types
  PluginId,
  PluginGroup,
  PluginPriority,
  PluginContext,
  ErixPluginConfig,
  RegisteredPlugin,
  PluginQueryOptions,
} from './api/plugin-registry.types';

// =============================================================================
// COMPONENT TYPE AUGMENTATION
// =============================================================================

declare global {
  interface HTMLErixEditorElement extends HTMLElement {
    /** Public API instance */
    readonly api: ErixEditorAPI;
  }

  interface HTMLElementTagNameMap {
    'erix-editor': HTMLErixEditorElement;
  }
}
```

---

## Backward Compatibility Guidelines

1. **Semantic Versioning**: Follow semver strictly

   - MAJOR: Breaking changes to public API
   - MINOR: New features, backward-compatible
   - PATCH: Bug fixes only

2. **Deprecation Policy**:

   - Deprecated APIs marked with `@deprecated` JSDoc
   - Deprecated APIs work for 2 minor versions
   - Console warnings in development mode

3. **Type Stability**:

   - All public types are exported
   - No ProseMirror types in public API
   - Union types preferred over enums (extensible)

4. **Event Stability**:
   - Event names never change
   - Event payloads only add optional fields

---

## Implementation Priority

### Phase 1: Core API (MVP)

- [ ] `EditorController` class
- [ ] Content methods (get/set/clear)
- [ ] Focus methods
- [ ] History methods (undo/redo)
- [ ] Basic events (change, focus, blur)

### Phase 2: Plugin System

- [ ] `PluginRegistry` class
- [ ] Built-in plugin registration
- [ ] Plugin invocation
- [ ] Toolbar integration

### Phase 3: Advanced Features

- [ ] Selection API
- [ ] State snapshots
- [ ] Serializer customization
- [ ] Advanced events

---

## Notes

- All internal ProseMirror usage is encapsulated in `EditorController`
- The public API never exposes `EditorView`, `EditorState`, or `Transaction`
- Plugin `execute` functions receive only engine-agnostic context
- Serializers handle conversion between ProseMirror and public formats
