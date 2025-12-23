/**
 * Editor Controller
 * 
 * Internal class that wraps ProseMirror EditorView.
 * This is the bridge between the public API and ProseMirror internals.
 * 
 * IMPORTANT: This class is internal and should NOT be exposed publicly.
 */

import { EditorView } from 'prosemirror-view';
import { EditorState, Transaction } from 'prosemirror-state';
import { Schema, Node as ProseMirrorNode } from 'prosemirror-model';
import { undo as pmUndo, redo as pmRedo, undoDepth, redoDepth } from 'prosemirror-history';
import type { EditorSelection } from '../../api/editor-api.types';
import type { TransactionListener } from './editor-controller.types';

/**
 * EditorController wraps ProseMirror and provides a clean internal interface.
 */
export class EditorController {
  private view: EditorView;
  private transactionListeners: Set<TransactionListener> = new Set();
  private _isDestroyed: boolean = false;

  constructor(view: EditorView) {
    this.view = view;
  }

  // ===========================================================================
  // VIEW ACCESS (internal only)
  // ===========================================================================

  /**
   * Get the raw EditorView (internal use only).
   */
  getView(): EditorView {
    this.ensureNotDestroyed();
    return this.view;
  }

  /**
   * Get the current EditorState.
   */
  getState(): EditorState {
    this.ensureNotDestroyed();
    return this.view.state;
  }

  /**
   * Get the schema.
   */
  getSchema(): Schema {
    return this.view.state.schema;
  }

  /**
   * Get the current document.
   */
  getDoc(): ProseMirrorNode {
    return this.view.state.doc;
  }

  // ===========================================================================
  // CONTENT OPERATIONS
  // ===========================================================================

  /**
   * Replace the entire document content.
   * @param doc - New document node
   */
  setDoc(doc: ProseMirrorNode): void {
    this.ensureNotDestroyed();
    const tr = this.view.state.tr.replaceWith(
      0,
      this.view.state.doc.content.size,
      doc.content
    );
    this.dispatch(tr);
  }

  /**
   * Clear all content (replace with empty paragraph).
   */
  clearContent(): void {
    this.ensureNotDestroyed();
    const schema = this.getSchema();
    const emptyDoc = schema.node('doc', null, [
      schema.node('paragraph')
    ]);
    this.setDoc(emptyDoc);
  }

  /**
   * Check if the document is empty.
   */
  isEmpty(): boolean {
    const doc = this.getDoc();
    return doc.childCount === 0 || 
      (doc.childCount === 1 && 
       doc.firstChild?.isTextblock && 
       doc.firstChild.content.size === 0);
  }

  // ===========================================================================
  // SELECTION OPERATIONS
  // ===========================================================================

  /**
   * Get the current selection info.
   */
  getSelection(): EditorSelection {
    const { from, to, empty } = this.view.state.selection;
    const selectedText = empty 
      ? '' 
      : this.view.state.doc.textBetween(from, to, ' ');
    
    return {
      from,
      to,
      isEmpty: empty,
      selectedText,
    };
  }

  /**
   * Set the selection range.
   * @param from - Start position
   * @param to - End position
   */
  setSelection(from: number, to: number): void {
    this.ensureNotDestroyed();
    const { TextSelection } = require('prosemirror-state');
    const tr = this.view.state.tr.setSelection(
      TextSelection.create(this.view.state.doc, from, to)
    );
    this.dispatch(tr);
  }

  /**
   * Select all content.
   */
  selectAll(): void {
    const docSize = this.view.state.doc.content.size;
    this.setSelection(0, docSize);
  }

  // ===========================================================================
  // FOCUS OPERATIONS
  // ===========================================================================

  /**
   * Focus the editor.
   */
  focus(): void {
    this.ensureNotDestroyed();
    this.view.focus();
  }

  /**
   * Check if the editor is focused.
   */
  hasFocus(): boolean {
    this.ensureNotDestroyed();
    return this.view.hasFocus();
  }

  // ===========================================================================
  // HISTORY OPERATIONS
  // ===========================================================================

  /**
   * Undo the last action.
   * @returns true if undo was performed
   */
  undo(): boolean {
    this.ensureNotDestroyed();
    return pmUndo(this.view.state, this.view.dispatch);
  }

  /**
   * Redo the last undone action.
   * @returns true if redo was performed
   */
  redo(): boolean {
    this.ensureNotDestroyed();
    return pmRedo(this.view.state, this.view.dispatch);
  }

  /**
   * Check if undo is available.
   */
  canUndo(): boolean {
    return undoDepth(this.view.state) > 0;
  }

  /**
   * Check if redo is available.
   */
  canRedo(): boolean {
    return redoDepth(this.view.state) > 0;
  }

  // ===========================================================================
  // MARK OPERATIONS
  // ===========================================================================

  /**
   * Check if a mark is active at the current selection.
   * @param markName - Name of the mark
   */
  isMarkActive(markName: string): boolean {
    const markType = this.getSchema().marks[markName];
    if (!markType) return false;
    
    const { from, $from, to, empty } = this.view.state.selection;
    if (empty) {
      return !!markType.isInSet(this.view.state.storedMarks || $from.marks());
    }
    return this.view.state.doc.rangeHasMark(from, to, markType);
  }

  /**
   * Get all active marks at the current selection.
   */
  getActiveMarks(): string[] {
    const marks: string[] = [];
    const schema = this.getSchema();
    
    for (const markName of Object.keys(schema.marks)) {
      if (this.isMarkActive(markName)) {
        marks.push(markName);
      }
    }
    
    return marks;
  }

  // ===========================================================================
  // TRANSACTION HANDLING
  // ===========================================================================

  /**
   * Dispatch a transaction.
   * @param tr - Transaction to dispatch
   */
  dispatch(tr: Transaction): void {
    this.ensureNotDestroyed();
    this.view.dispatch(tr);
  }

  /**
   * Add a transaction listener.
   * @param listener - Callback function
   */
  addTransactionListener(listener: TransactionListener): void {
    this.transactionListeners.add(listener);
  }

  /**
   * Remove a transaction listener.
   * @param listener - Callback function
   */
  removeTransactionListener(listener: TransactionListener): void {
    this.transactionListeners.delete(listener);
  }

  /**
   * Notify all transaction listeners.
   * @param tr - The transaction
   * @param newState - The new state
   */
  notifyTransactionListeners(tr: Transaction, newState: EditorState): void {
    for (const listener of this.transactionListeners) {
      try {
        listener(tr, newState);
      } catch (error) {
        console.error('[EditorController] Transaction listener error:', error);
      }
    }
  }

  // ===========================================================================
  // LIFECYCLE
  // ===========================================================================

  /**
   * Check if the controller is destroyed.
   */
  isDestroyed(): boolean {
    return this._isDestroyed;
  }

  /**
   * Destroy the controller and clean up.
   */
  destroy(): void {
    if (this._isDestroyed) return;
    
    this._isDestroyed = true;
    this.transactionListeners.clear();
    this.view.destroy();
  }

  /**
   * Ensure the controller is not destroyed.
   */
  private ensureNotDestroyed(): void {
    if (this._isDestroyed) {
      throw new Error('EditorController has been destroyed.');
    }
  }
}
