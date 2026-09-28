import { expect, type Page } from '@playwright/test';

export async function waitForStablePage(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      Array.from(document.images, (image) => image.complete
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            image.addEventListener('load', () => resolve(), { once: true });
            image.addEventListener('error', () => resolve(), { once: true });
          })),
    );
  });
}

export async function expectAllImagesLoaded(page: Page) {
  const failures = await page.evaluate(async () => {
    const failed: string[] = [];

    for (const image of document.images) {
      if (!image.complete || image.naturalWidth === 0 || image.naturalHeight === 0) {
        failed.push(`img: ${image.currentSrc || image.src || '<empty src>'}`);
      }
    }

    const backgroundUrls = new Set<string>();
    const collectUrls = (value: string) => {
      for (const match of value.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
        backgroundUrls.add(match[1]);
      }
    };

    for (const element of document.querySelectorAll<HTMLElement>('*')) {
      collectUrls(getComputedStyle(element).backgroundImage);
      collectUrls(getComputedStyle(element, '::before').backgroundImage);
      collectUrls(getComputedStyle(element, '::after').backgroundImage);
    }

    await Promise.all(Array.from(backgroundUrls, (url) => new Promise<void>((resolve) => {
      const image = new Image();
      image.onload = () => resolve();
      image.onerror = () => {
        failed.push(`background: ${url}`);
        resolve();
      };
      image.src = url;
    })));

    return failed;
  });

  expect(failures, 'All rendered images and CSS backgrounds must load').toEqual([]);
}

export async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const root = document.documentElement;
    const external = root.scrollWidth > window.innerWidth + 1
      ? [`document: ${root.scrollWidth}px > ${window.innerWidth}px`]
      : [];
    const nested: string[] = [];

    for (const element of document.querySelectorAll<HTMLElement>('body *')) {
      const style = getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden') continue;
      if (element.clientWidth <= 0 || element.scrollWidth <= element.clientWidth + 1) continue;
      if (['auto', 'scroll', 'hidden'].includes(style.overflowX)) continue;

      const label = element.id
        ? `#${element.id}`
        : element.classList.length
          ? `${element.tagName.toLowerCase()}.${Array.from(element.classList).join('.')}`
          : element.tagName.toLowerCase();
      nested.push(`${label}: ${element.scrollWidth}px > ${element.clientWidth}px (${style.overflowX})`);
    }

    return { external, nested };
  });

  expect(overflow.external, 'The document must not overflow its viewport horizontally').toEqual([]);
  expect(overflow.nested, 'Nested content must not overflow a non-scrollable container horizontally').toEqual([]);
}

export async function expectVisibleFocus(page: Page) {
  const focus = await page.evaluate(() => {
    const element = document.activeElement as HTMLElement | null;
    if (!element) return null;
    const style = getComputedStyle(element);
    return {
      tag: element.tagName.toLowerCase(),
      outlineStyle: style.outlineStyle,
      outlineWidth: Number.parseFloat(style.outlineWidth),
    };
  });

  expect(focus, 'An element must own keyboard focus').not.toBeNull();
  expect(focus?.outlineStyle, `Focused ${focus?.tag} must have a visible outline`).not.toBe('none');
  expect(focus?.outlineWidth, `Focused ${focus?.tag} must have a visible outline`).toBeGreaterThanOrEqual(2);
}
