import { newE2EPage } from '@stencil/core/testing';

describe('erix-editor', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<erix-editor></erix-editor>');

    const element = await page.find('erix-editor');
    expect(element).toHaveClass('hydrated');
  });
});
