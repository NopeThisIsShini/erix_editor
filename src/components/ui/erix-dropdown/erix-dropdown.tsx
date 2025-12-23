import { Component, Host, h, Prop, State, Element, Listen } from '@stencil/core';

export type DropdownPosition = 'left' | 'right';

/**
 * @component ErixDropdown
 * A reusable dropdown component for the editor toolbar.
 * Provides a trigger button and a menu that opens on click.
 */
@Component({
  tag: 'erix-dropdown',
  styleUrl: 'erix-dropdown.css',
  shadow: true,
})
export class ErixDropdown {
  @Element() el!: HTMLElement;

  /**
   * Whether the dropdown menu is currently open
   */
  @Prop({ mutable: true }) open: boolean = false;

  /**
   * Tooltip text for the trigger button
   */
  @Prop() triggerTitle: string = '';

  /**
   * Position of the dropdown menu relative to the trigger
   */
  @Prop() position: DropdownPosition = 'left';

  /**
   * Whether the trigger should show active state when open
   */
  @Prop() showActiveState: boolean = true;

  /**
   * Whether to use extended menu style (for text-based options)
   */
  @Prop() extended: boolean = false;

  @State() private isOpen: boolean = false;

  componentWillLoad() {
    this.isOpen = this.open;
  }

  @Listen('mousedown', { target: 'document' })
  handleDocumentClick(event: MouseEvent) {
    const path = event.composedPath();
    if (this.isOpen && !path.includes(this.el)) {
      this.isOpen = false;
    }
  }

  private toggleMenu = () => {
    this.isOpen = !this.isOpen;
  };

  private closeMenu = () => {
    this.isOpen = false;
  };

  render() {
    const triggerClasses = {
      'erix-dropdown__trigger': true,
      'active': this.isOpen && this.showActiveState,
    };

    const menuClasses = {
      'erix-dropdown__menu': true,
      [`erix-dropdown__menu--${this.position}`]: true,
      'erix-dropdown__menu--extended': this.extended,
    };

    return (
      <Host>
        <div class="erix-dropdown">
          <button
            class={triggerClasses}
            onClick={this.toggleMenu}
            title={this.triggerTitle}
            type="button"
          >
            <slot name="trigger"></slot>
          </button>
          {this.isOpen && (
            <div class={menuClasses} onClick={this.closeMenu}>
              <slot name="menu"></slot>
            </div>
          )}
        </div>
      </Host>
    );
  }
}
