import { Plugin, PluginKey } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { isInTable } from 'prosemirror-tables';

export const tableToolbarKey = new PluginKey('table-toolbar');

class TableToolbarView {
  dom: HTMLElement;
  toolbar: any;

  constructor(view: EditorView) {
    this.dom = document.createElement('div');
    this.dom.style.position = 'absolute';
    this.dom.style.zIndex = '100';
    this.dom.style.display = 'none';
    this.dom.style.pointerEvents = 'auto';
    
    // Create the stencil component
    this.toolbar = document.createElement('erix-table-toolbar');
    this.toolbar.view = view;
    this.dom.appendChild(this.toolbar);

    // Append to editor's parent or body
    view.dom.parentNode?.appendChild(this.dom);

    this.update(view, null);
  }

  update(view: EditorView, lastState: any) {
    const state = view.state;
    
    // Don't update if nothing changed and we're not in a table
    if (lastState && lastState.doc.eq(state.doc) && lastState.selection.eq(state.selection)) {
      return;
    }

    if (!isInTable(state)) {
      this.dom.style.display = 'none';
      return;
    }

    // Position the toolbar
    const { from, to } = state.selection;
    const start = view.coordsAtPos(from);
    const end = view.coordsAtPos(to);
    
    // Find the table element to center the toolbar
    const parentBox = (view.dom.parentNode as HTMLElement).getBoundingClientRect();

    // Center above the selection or the table
    const left = (start.left + end.left) / 2 - parentBox.left;
    const top = start.top - parentBox.top - 10; // 10px above

    this.dom.style.display = 'block';
    this.dom.style.left = `${left}px`;
    this.dom.style.top = `${top}px`;
    this.dom.style.transform = 'translate(-50%, -100%)';
    
    // Update toolbar view reference and force re-render
    this.toolbar.view = view;
    if (this.toolbar.update) {
      this.toolbar.update();
    }
  }

  destroy() {
    this.dom.remove();
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
