import { Component, Host, h, Prop, Event, EventEmitter } from '@stencil/core';
import { ButtonVariant, ButtonSize } from './erix-button.types';

/**
 * @component ErixButton
 * A reusable button component for the editor toolbar and UI.
 */
@Component({
  tag: 'erix-button',
  styleUrl: 'erix-button.css',
  shadow: true,
})
export class ErixButton {
  /**
   * Whether the button is in an active/pressed state
   */
  @Prop() active: boolean = false;

  /**
   * Whether the button is disabled
   */
  @Prop() disabled: boolean = false;

  /**
   * The visual style variant of the button
   */
  @Prop() variant: ButtonVariant = 'default';

  /**
   * The size of the button
   */
  @Prop() size: ButtonSize = 'md';

  /**
   * Tooltip text for the button
   */
  @Prop() buttonTitle: string = '';

  /**
   * Emitted when the button is clicked
   */
  @Event() erixClick: EventEmitter<MouseEvent>;

  private handleClick = (event: MouseEvent) => {
    if (!this.disabled) {
      this.erixClick.emit(event);
    }
  };

  render() {
    const classes = {
      'erix-button': true,
      [`erix-button--${this.variant}`]: true,
      [`erix-button--${this.size}`]: true,
      'active': this.active,
    };

    return (
      <Host>
        <button
          class={classes}
          disabled={this.disabled}
          title={this.buttonTitle}
          onClick={this.handleClick}
          type="button"
        >
          <slot></slot>
        </button>
      </Host>
    );
  }
}
