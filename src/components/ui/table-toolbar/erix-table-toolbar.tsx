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

  @Method()
  async update() {
    this.updateCounter++;
  }

  private exec = (cmd: any) => {
    if (!this.view) return;
    const { state, dispatch } = this.view;
    if (cmd(state, dispatch)) {
      this.view.focus();
      this.updateCounter++;
    }
  };

  render() {
    if (!this.view) return null;

    const info = getTableSelectionInfo(this.view.state);
    if (!info) return null;

    return (
      <Host>
        <div class="table-toolbar" key={this.updateCounter}>
          <erix-button 
            buttonTitle="Add Column Before" 
            disabled={!info.canAddColumnBefore}
            onErixClick={() => this.exec(tableCommands.addColumnBefore)}
          >
            <erix-icon name="tableAddColumnBefore" size={18}></erix-icon>
          </erix-button>
          <erix-button 
            buttonTitle="Add Column After" 
            disabled={!info.canAddColumnAfter}
            onErixClick={() => this.exec(tableCommands.addColumnAfter)}
          >
            <erix-icon name="tableAddColumnAfter" size={18}></erix-icon>
          </erix-button>
          <erix-button 
            buttonTitle="Delete Column" 
            disabled={!info.canDeleteColumn}
            onErixClick={() => this.exec(tableCommands.deleteColumn)}
          >
            <erix-icon name="tableDeleteColumn" size={18}></erix-icon>
          </erix-button>

          <div class="toolbar-divider"></div>

          <erix-button 
            buttonTitle="Add Row Before" 
            disabled={!info.canAddRowBefore}
            onErixClick={() => this.exec(tableCommands.addRowBefore)}
          >
            <erix-icon name="tableAddRowBefore" size={18}></erix-icon>
          </erix-button>
          <erix-button 
            buttonTitle="Add Row After" 
            disabled={!info.canAddRowAfter}
            onErixClick={() => this.exec(tableCommands.addRowAfter)}
          >
            <erix-icon name="tableAddRowAfter" size={18}></erix-icon>
          </erix-button>
          <erix-button 
            buttonTitle="Delete Row" 
            disabled={!info.canDeleteRow}
            onErixClick={() => this.exec(tableCommands.deleteRow)}
          >
            <erix-icon name="tableDeleteRow" size={18}></erix-icon>
          </erix-button>

          <div class="toolbar-divider"></div>

          <erix-button 
            buttonTitle="Merge Cells" 
            disabled={!info.canMerge} 
            onErixClick={() => this.exec(tableCommands.mergeCells)}
          >
            <erix-icon name="tableMergeCells" size={18}></erix-icon>
          </erix-button>
          <erix-button 
            buttonTitle="Split Cell" 
            disabled={!info.canSplit} 
            onErixClick={() => this.exec(tableCommands.splitCell)}
          >
            <erix-icon name="tableSplitCell" size={18}></erix-icon>
          </erix-button>

          <div class="toolbar-divider"></div>

          <erix-button 
            buttonTitle="Delete Table" 
            disabled={!info.canDeleteTable}
            onErixClick={() => this.exec(tableCommands.deleteTable)}
          >
            <erix-icon name="tableDelete" size={18}></erix-icon>
          </erix-button>
        </div>
      </Host>
    );
  }
}
