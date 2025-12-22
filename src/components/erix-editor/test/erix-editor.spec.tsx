import { newSpecPage } from '@stencil/core/testing';
import { ErixEditor } from '@src/components/erix-editor/erix-editor';

describe('erix-editor', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [ErixEditor],
      html: `<erix-editor></erix-editor>`,
    });
    expect(page.root).toEqualHtml(`
      <erix-editor>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </erix-editor>
    `);
  });
});
