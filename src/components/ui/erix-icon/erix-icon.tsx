import { Component, Host, h, Prop, Watch, State } from '@stencil/core';
import { ICONS, IconName } from '../erix-icon/icons';
import { sanitizeSvg } from '@src/utils/svg-sanitizer';

@Component({
  tag: 'erix-icon',
  styleUrl: 'erix-icon.css',
  shadow: true,
})
export class ErixIcon {
  /**
   * The name of the semantic editor icon.
   */
  @Prop() name!: IconName;

  /**
   * The size of the icon in pixels (width and height).
   */
  @Prop() size: number = 20;

  @State() sanitizedSvg: string = '';

  componentWillLoad() {
    this.updateIcon();
  }

  @Watch('name')
  updateIcon() {
    if (!this.name) {
      this.sanitizedSvg = '';
      return;
    }

    const rawSvg = ICONS[this.name];

    if (!rawSvg) {
      console.warn(`[erix-icon] Icon "${this.name}" not found in icon map.`);
      this.sanitizedSvg = '';
      return;
    }

    this.sanitizedSvg = sanitizeSvg(rawSvg);
  }

  render() {
    const style = {
      '--icon-size': `${this.size}px`,
      'width': `${this.size}px`,
      'height': `${this.size}px`,
    };

    return (
      <Host style={style}>
        <div
          class="icon-container"
          role="img"
          aria-hidden="true"
          innerHTML={this.sanitizedSvg}
        ></div>
      </Host>
    );
  }
}
