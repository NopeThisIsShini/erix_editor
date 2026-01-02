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
   * Icon-only mode - displays only an icon in the trigger (for compact toolbars)
   */
  @Prop() iconOnly: boolean = false;

  /**
   * Icon name to display in the trigger (used with iconOnly mode)
   */
  @Prop() triggerIcon?: string;

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
      'erix-select--icon-only': this.iconOnly,
      [`erix-select--${this.width}`]: true,
    };

    return (
      <Host>
        <div class={classes} title={this.selectTitle}>
          <div class="erix-select__trigger" onClick={this.toggleDropdown}>
            {this.iconOnly && this.triggerIcon ? (
              <erix-icon name={this.triggerIcon as any} size={18}></erix-icon>
            ) : (
              <span class="erix-select__label">{displayLabel}</span>
            )}
            <span class="erix-select__arrow">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
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
