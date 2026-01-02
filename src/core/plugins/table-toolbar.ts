import { Plugin, PluginKey } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { isInTable } from 'prosemirror-tables';

export const tableToolbarKey = new PluginKey('table-toolbar');

class TableToolbarView {
  container: HTMLDivElement;
  toolbar: any;
  isVisible: boolean = false;

  constructor(view: EditorView) {
    // Create a fixed-position container for the toolbar
    this.container = document.createElement('div');
    this.container.className = 'erix-table-toolbar-container';
    this.container.style.cssText = `
      position: fixed;
      z-index: 9999;
      pointer-events: auto;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.12s ease;
      background-color: var(--editor-surface, #ffffff);
      border: 1px solid var(--editor-border, #e2e8f0);
      border-radius: 6px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    `;

    // Create the toolbar and append it directly (not cloned)
    this.toolbar = document.createElement('erix-table-toolbar');
    this.toolbar.view = view;
    this.container.appendChild(this.toolbar);

    // Append to body for proper fixed positioning
    document.body.appendChild(this.container);

    this.update(view, null);
  }

  private showToolbar() {
    if (!this.isVisible) {
      this.container.style.opacity = '1';
      this.container.style.visibility = 'visible';
      this.isVisible = true;
    }
  }

  private hideToolbar() {
    if (this.isVisible) {
      this.container.style.opacity = '0';
      this.container.style.visibility = 'hidden';
      this.isVisible = false;
    }
  }

  private positionToolbar(anchorRect: DOMRect) {
    const containerRect = this.container.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
    const offset = 10;

    // Try to position above the selection
    let top = anchorRect.top - containerRect.height - offset;
    let left = anchorRect.left + (anchorRect.width - containerRect.width) / 2;

    // If not enough space above, position below
    if (top < 8) {
      top = anchorRect.bottom + offset;
    }

    // Clamp to viewport edges
    left = Math.max(8, Math.min(left, viewport.width - containerRect.width - 8));
    top = Math.max(8, Math.min(top, viewport.height - containerRect.height - 8));

    this.container.style.top = `${top}px`;
    this.container.style.left = `${left}px`;
  }

  update(view: EditorView, lastState: any) {
    const state = view.state;

    // Don't update if nothing changed
    if (lastState && lastState.doc.eq(state.doc) && lastState.selection.eq(state.selection)) {
      return;
    }

    if (!isInTable(state)) {
      this.hideToolbar();
      return;
    }

    // Get selection coordinates
    const { from, to } = state.selection;
    const start = view.coordsAtPos(from);
    const end = view.coordsAtPos(to);

    // Create an anchor rect from the selection
    const anchorRect = new DOMRect(
      Math.min(start.left, end.left),
      Math.min(start.top, end.top),
      Math.abs(end.left - start.left) || 1,
      Math.abs(end.bottom - start.top) || 1
    );

    // Update toolbar view reference
    this.toolbar.view = view;

    // Position and show the toolbar
    requestAnimationFrame(() => {
      this.positionToolbar(anchorRect);
      this.showToolbar();

      // Force toolbar to update its state
      if (this.toolbar.update) {
        this.toolbar.update();
      }
    });
  }

  destroy() {
    this.container.remove();
  }
}

export const createTableToolbarPlugin = () => {
  return new Plugin({
    key: tableToolbarKey,
    view(editorView) {
      return new TableToolbarView(editorView);
    },
  });
};
