import { expect, test, type Locator } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { waitForStablePage } from './helpers';

const content = JSON.parse(readFileSync(new URL('../../src/data/commonContent.json', import.meta.url), 'utf8')) as { marketplace: Array<{ id: string; type: string; title: string }> };
const merch = content.marketplace.filter(item => item.type === 'merch');

async function expectCompleteProduct(media: Locator, height: number) {
  await media.scrollIntoViewIfNeeded();
  const image = media.locator('img');
  await expect(image).toBeVisible();
  const result = await image.evaluate((img: HTMLImageElement) => {
    const box = img.getBoundingClientRect();
    const frame = img.parentElement!.getBoundingClientRect();
    const style = getComputedStyle(img);
    const scale = Math.min(box.width / img.naturalWidth, box.height / img.naturalHeight);
    const width = img.naturalWidth * scale;
    const height = img.naturalHeight * scale;
    const painted = { left: box.left + (box.width - width) / 2, top: box.top + (box.height - height) / 2, width, height };
    let visible = true;
    let bounded = true;
    for (let node: HTMLElement | null = img; node; node = node.parentElement) {
      const css = getComputedStyle(node);
      visible &&= css.visibility === 'visible' && Number(css.opacity) > 0 && css.display !== 'none';
      if (node !== img && /(hidden|clip|auto|scroll)/.test(css.overflow + css.overflowX + css.overflowY)) {
        const clip = node.getBoundingClientRect();
        bounded &&= painted.left >= clip.left - 1 && painted.top >= clip.top - 1
          && painted.left + width <= clip.right + 1 && painted.top + height <= clip.bottom + 1;
      }
    }
    const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
    return {
      loaded: img.complete && img.naturalWidth > 0 && img.naturalHeight > 0,
      fit: style.objectFit, position: style.objectPosition, visible, bounded, hit: hit === img,
      frameHeight: frame.height, width, height,
      inFrame: box.left >= frame.left - 1 && box.top >= frame.top - 1
        && box.right <= frame.right + 1 && box.bottom <= frame.bottom + 1,
    };
  });
  expect(result.loaded).toBe(true);
  expect(result.fit).toBe('contain');
  expect(result.position).toBe('50% 50%');
  expect(result.visible).toBe(true);
  expect(result.bounded).toBe(true);
  expect(result.hit).toBe(true);
  expect(result.inFrame).toBe(true);
  expect(result.frameHeight).toBe(height);
  expect(result.width).toBeGreaterThan(80);
  expect(result.height).toBeGreaterThan(80);
}

test('all eight previews show complete products inside their media bounds', async ({ page }) => {
  await page.goto('/?role=mass&section=marketplace');
  await waitForStablePage(page);
  await expect(page.locator('.marketplace-visual img')).toHaveCount(8);
  for (const item of merch) {
    const card = page.locator('.marketplace-card').filter({ has: page.getByRole('heading', { name: item.title, exact: true }) });
    await expectCompleteProduct(card.locator('.marketplace-visual'), page.viewportSize()!.width <= 1380 ? 170 : 190);
  }
});

for (const item of merch) {
  test(`${item.id}: detail image and order form have independent bounds`, async ({ page }) => {
    await page.goto(`/?role=mass&section=marketplace-order&reward=${item.id}`);
    await waitForStablePage(page);
    await expect(page.getByRole('heading', { level: 1, name: item.title, exact: true })).toBeVisible();
    await expectCompleteProduct(page.locator('.marketplace-visual'), 620);
    const layout = page.locator('.marketplace-order-layout');
    const before = await layout.boundingBox();
    // Removing intrinsic image dimensions must not change the order form's geometry.
    await page.locator('.marketplace-visual img').evaluate(img => { img.style.display = 'none'; });
    expect(await layout.boundingBox()).toEqual(before);
    await page.locator('.marketplace-visual img').evaluate(img => { img.style.removeProperty('display'); });
    await expect(layout).toHaveScreenshot(`order-${item.id}.png`);
  });
}
