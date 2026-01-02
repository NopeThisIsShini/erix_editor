import { Component, Host, h, State, Event, EventEmitter, Prop } from '@stencil/core';

@Component({
  tag: 'erix-table-picker',
  styleUrl: 'erix-table-picker.css',
  shadow: true,
})
export class ErixTablePicker {
  @Prop() rows: number = 8;
  @Prop() cols: number = 8;

  @State() hoveredRow: number = 0;
  @State() hoveredCol: number = 0;

  @Event() selectGrid: EventEmitter<{ rows: number; cols: number }>;

  private handleMouseEnter(r: number, c: number) {
    this.hoveredRow = r;
    this.hoveredCol = c;
  }

  private handleMouseLeave() {
    this.hoveredRow = 0;
    this.hoveredCol = 0;
  }

  private handleClick(r: number, c: number) {
    this.selectGrid.emit({ rows: r, cols: c });
  }

  render() {
    const grid = [];
    for (let r = 1; r <= this.rows; r++) {
      for (let c = 1; c <= this.cols; c++) {
        const isHighlighted = r <= this.hoveredRow && c <= this.hoveredCol;
        grid.push(
          <div
            class={{ 'picker-cell': true, 'highlighted': isHighlighted }}
            onMouseEnter={() => this.handleMouseEnter(r, c)}
            onClick={() => this.handleClick(r, c)}
          ></div>
        );
      }
    }

    return (
      <Host onMouseLeave={() => this.handleMouseLeave()}>
        <div class="table-picker">
          <div class="picker-grid" style={{ gridTemplateColumns: `repeat(${this.cols}, 1fr)` }}>
            {grid}
          </div>
          <div class="picker-footer">
            {this.hoveredRow > 0 ? `${this.hoveredRow} × ${this.hoveredCol}` : 'Insert Table'}
          </div>
        </div>
      </Host>
    );
  }
}
