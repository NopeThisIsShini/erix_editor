import { Component, Host, h, Prop } from '@stencil/core';

export type DividerOrientation = 'vertical' | 'horizontal';
export type DividerSize = 'sm' | 'md' | 'lg';

/**
 * @component ErixDivider
 * A visual separator for toolbar groups and sections.
 */
@Component({
  tag: 'erix-divider',
  styleUrl: 'erix-divider.css',
  shadow: true,
})
export class ErixDivider {
  /**
   * The orientation of the divider
   */
  @Prop() orientation: DividerOrientation = 'vertical';

  /**
   * The size of the divider
   */
  @Prop() size: DividerSize = 'md';

  render() {
    const classes = {
      'erix-divider': true,
      [`erix-divider--${this.orientation}`]: true,
      [`erix-divider--${this.size}`]: true,
    };

    return (
      <Host>
        <div class={classes} role="separator" aria-orientation={this.orientation}></div>
      </Host>
    );
  }
}
