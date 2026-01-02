import { Component, Host, h, Prop, State, Method } from '@stencil/core';
import { EditorView } from 'prosemirror-view';
import { tableCommands, getTableSelectionInfo } from '@src/core';

@Component({
  tag: 'erix-table-toolbar',
  styleUrl: 'erix-table-toolbar.css',
  shadow: true,
})
export class ErixTableToolbar {
  @Prop() view?: EditorView;
  @State() private updateCounter: number = 0;

  private rowOptions = [
    { value: 'insert-above', label: 'Insert row above' },
    { value: 'insert-below', label: 'Insert row below' },
    { value: 'delete', label: 'Delete row' },
  ];

  private columnOptions = [
    { value: 'insert-left', label: 'Insert column left' },
    { value: 'insert-right', label: 'Insert column right' },
    { value: 'delete', label: 'Delete column' },
  ];

  @Method()
  async update() {
    this.updateCounter++;
  }

  private execCommand = (cmd: any) => {
    if (!this.view) return;
    const { state, dispatch } = this.view;
    if (cmd(state, dispatch)) {
      this.view.focus();
      this.updateCounter++;
    }
  };

  private handleRowAction = (event: CustomEvent<string>) => {
    const action = event.detail;
    switch (action) {
      case 'insert-above':
        this.execCommand(tableCommands.addRowBefore);
        break;
      case 'insert-below':
        this.execCommand(tableCommands.addRowAfter);
        break;
      case 'delete':
        this.execCommand(tableCommands.deleteRow);
        break;
    }
  };

  private handleColumnAction = (event: CustomEvent<string>) => {
    const action = event.detail;
    switch (action) {
      case 'insert-left':
        this.execCommand(tableCommands.addColumnBefore);
        break;
      case 'insert-right':
        this.execCommand(tableCommands.addColumnAfter);
        break;
      case 'delete':
        this.execCommand(tableCommands.deleteColumn);
        break;
    }
  };

  private handleDeleteTable = () => {
    this.execCommand(tableCommands.deleteTable);
  };

  render() {
    if (!this.view) return null;

    const info = getTableSelectionInfo(this.view.state);
    if (!info) return null;

    return (
      <Host>
        <div class="table-toolbar" key={this.updateCounter}>
          {/* Row dropdown with icon-only trigger */}
          <erix-select
            iconOnly={true}
            triggerIcon="row"
            options={this.rowOptions}
            selectTitle="Row"
            width="auto"
            onErixChange={this.handleRowAction}
          ></erix-select>

          {/* Column dropdown with icon-only trigger */}
          <erix-select
            iconOnly={true}
            triggerIcon="column"
            options={this.columnOptions}
            selectTitle="Column"
            width="auto"
            onErixChange={this.handleColumnAction}
          ></erix-select>

          <div class="toolbar-divider"></div>

          {/* Delete table button - using erix-button for consistency */}
          <erix-button
            buttonTitle="Delete Table"
            disabled={!info.canDeleteTable}
            onErixClick={this.handleDeleteTable}
          >
            <erix-icon name="delete" size={18}></erix-icon>
          </erix-button>
        </div>
      </Host>
    );
  }
}
