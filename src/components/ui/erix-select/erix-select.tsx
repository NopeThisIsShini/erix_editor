import { Component, Host, h, Prop, Event, EventEmitter, State, Element, Listen } from '@stencil/core';

export type SelectWidth = 'sm' | 'md' | 'lg' | 'auto';

export interface SelectOption {
  value: string;
  label: string;
  selected?: boolean;
  icon?: string;
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
  @Element() el!: HTMLElement;

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

  @State() private isOpen: boolean = false;

  @Listen('mousedown', { target: 'document' })
  handleDocumentClick(event: MouseEvent) {
    const path = event.composedPath();
    if (this.isOpen && !path.includes(this.el)) {
      this.isOpen = false;
    }
  }

  private toggleDropdown = () => {
    if (this.disabled) return;
    this.isOpen = !this.isOpen;
  };

  private selectOption = (option: SelectOption) => {
    if (this.disabled) return;
    this.erixChange.emit(option.value);
    this.isOpen = false;
  };

  render() {
    const selectedOption = this.options.find(opt => opt.value === this.value) || this.options[0];
    const displayLabel = selectedOption ? selectedOption.label : 'Select...';

    const classes = {
      'erix-select': true,
      'erix-select--open': this.isOpen,
      'erix-select--disabled': this.disabled,
      [`erix-select--${this.width}`]: true,
    };

    return (
      <Host>
        <div class={classes} title={this.selectTitle}>
          <div class="erix-select__trigger" onClick={this.toggleDropdown}>
            <span class="erix-select__label">{displayLabel}</span>
          </div>

          {this.isOpen && (
            <div class="erix-select__dropdown">
              <div class="erix-select__options">
                {this.options.map(option => (
                  <div
                    class={{
                      'erix-select__option': true,
                      'erix-select__option--selected': option.value === this.value,
                    }}
                    onClick={() => this.selectOption(option)}
                  >
                    {option.icon && <span class="erix-select__option-icon">{option.icon}</span>}
                    <span class="erix-select__option-label">{option.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Host>
    );
  }
}
