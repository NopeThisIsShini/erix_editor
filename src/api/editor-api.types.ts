/**
 * Public API Type Definitions
 * These types are exposed to consumers and must remain stable.
 * DO NOT expose any ProseMirror types here.
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
export type EditorEventType =
  | 'change'
  | 'focus'
  | 'blur'
  | 'selectionChange'
  | 'ready'
  | 'destroy';

/**
 * Event payload mapping for editor events.
 */
export interface EditorEventPayload {
  change: { content: EditorContent };
  focus: undefined;
  blur: undefined;
  selectionChange: { selection: EditorSelection };
  ready: undefined;
  destroy: undefined;
}

/**
 * Event listener function type.
 */
export type EditorEventListener<T extends EditorEventType> = (
  payload: EditorEventPayload[T]
) => void;

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
}
