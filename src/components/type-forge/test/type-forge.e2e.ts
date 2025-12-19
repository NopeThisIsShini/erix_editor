import { newE2EPage } from '@stencil/core/testing';

describe('type-forge', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<type-forge></type-forge>');

    const element = await page.find('type-forge');
    expect(element).toHaveClass('hydrated');
  });
});
