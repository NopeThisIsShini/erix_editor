import { Component, Host, Prop, h } from '@stencil/core';

@Component({
  tag: 'type-forge',
  styleUrl: 'type-forge.css',
  shadow: true,
})
export class TypeForge {


  @Prop() buttonText: string;

  private handleClick =() => {
    window.open('https://typeforge.com', '_blank');
  }
  render() {
    return (
      <Host>
        <button onClick={this.handleClick}>{this.buttonText}</button>
      </Host>
    );
  }
}
