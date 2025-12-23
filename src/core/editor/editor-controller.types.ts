/**
 * Editor Controller Types
 * Internal types for the editor controller layer.
 */

import type { EditorView } from 'prosemirror-view';
import type { EditorState, Transaction } from 'prosemirror-state';

/**
 * Dispatch function type.
 */
export type DispatchFn = (tr: Transaction) => void;

/**
 * Transaction listener callback.
 */
export type TransactionListener = (tr: Transaction, newState: EditorState) => void;

/**
 * Editor controller configuration.
 */
export interface EditorControllerConfig {
  /** The ProseMirror EditorView instance */
  view: EditorView;
  /** Optional transaction listener */
  onTransaction?: TransactionListener;
}
