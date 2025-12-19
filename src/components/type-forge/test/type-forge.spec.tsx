import { newSpecPage } from '@stencil/core/testing';
import { TypeForge } from '../type-forge';

describe('type-forge', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [TypeForge],
      html: `<type-forge></type-forge>`,
    });
    expect(page.root).toEqualHtml(`
      <type-forge>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </type-forge>
    `);
  });
});
