import { Component, Host, h, Prop, Event, EventEmitter } from '@stencil/core';

export type SelectWidth = 'sm' | 'md' | 'lg' | 'auto';

export interface SelectOption {
  value: string;
  label: string;
  selected?: boolean;
}

/**
 * @component ErixSelect
 * A reusable select/dropdown component for the editor toolbar.
 */
@Component({
  tag: 'erix-select',
  styleUrl: 'erix-select.css',
  shadow: true,
})
export class ErixSelect {
  /**
   * Array of options for the select
   */
  @Prop() options: SelectOption[] = [];

  /**
   * The currently selected value
   */
  @Prop() value: string = '';

  /**
   * Tooltip text for the select
   */
  @Prop() selectTitle: string = '';

  /**
   * Whether the select is disabled
   */
  @Prop() disabled: boolean = false;

  /**
   * Width variant
   */
  @Prop() width: SelectWidth = 'md';

  /**
   * Emitted when the selection changes
   */
  @Event() erixChange: EventEmitter<string>;

  private handleChange = (event: Event) => {
    const select = event.target as HTMLSelectElement;
    this.erixChange.emit(select.value);
  };

  render() {
    const classes = {
      'erix-select': true,
      [`erix-select--${this.width}`]: true,
    };

    return (
      <Host>
        <select
          class={classes}
          title={this.selectTitle}
          disabled={this.disabled}
          onChange={this.handleChange}
        >
          {this.options.map(option => (
            <option
              value={option.value}
              selected={option.value === this.value || option.selected}
            >
              {option.label}
            </option>
          ))}
        </select>
      </Host>
    );
  }
}
