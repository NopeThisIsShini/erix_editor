import { Component, Host, h, Prop } from '@stencil/core';

@Component({
  tag: 'type-forge',
  styleUrl: 'type-forge.css',
  shadow: true,
})
export class TypeForge {
  /**
   * The editor theme.
   */
  @Prop({ reflect: true }) theme: 'light' | 'dark' | string = 'light';

  render() {
    return (
      <Host data-theme={this.theme}>
        <slot></slot>
      </Host>
    );
  }
}
