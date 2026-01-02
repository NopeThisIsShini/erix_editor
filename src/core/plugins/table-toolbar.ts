import { Plugin, PluginKey } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { isInTable } from 'prosemirror-tables';

export const tableToolbarKey = new PluginKey('table-toolbar');

class TableToolbarView {
  popover: any;
  toolbar: any;
  currentAnchorRect: DOMRect | null = null;

  constructor(view: EditorView) {
    // Create the popover component
    this.popover = document.createElement('erix-popover');
    this.popover.placement = 'top';
    this.popover.offset = 10;
    this.popover.autoFlip = true;

    // Create the toolbar inside the popover
    this.toolbar = document.createElement('erix-table-toolbar');
    this.toolbar.view = view;
    this.popover.appendChild(this.toolbar);

    // Append to body for proper fixed positioning
    document.body.appendChild(this.popover);

    this.update(view, null);
  }

  update(view: EditorView, lastState: any) {
    const state = view.state;

    // Don't update if nothing changed
    if (lastState && lastState.doc.eq(state.doc) && lastState.selection.eq(state.selection)) {
      return;
    }

    if (!isInTable(state)) {
      this.popover.open = false;
      this.currentAnchorRect = null;
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
      Math.abs(end.left - start.left) || 1, // Ensure minimum width
      Math.abs(end.bottom - start.top) || 1  // Ensure minimum height
    );

    // Update popover position
    this.popover.anchorRect = anchorRect;
    this.popover.open = true;
    this.currentAnchorRect = anchorRect;

    // Update toolbar view reference and force re-render
    this.toolbar.view = view;
    if (this.toolbar.update) {
      this.toolbar.update();
    }

    // Trigger popover position recalculation
    if (this.popover.updatePosition) {
      this.popover.updatePosition();
    }
  }

  destroy() {
    this.popover.remove();
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
