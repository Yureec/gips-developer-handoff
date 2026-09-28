import { expect, test } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';

import { expectAllImagesLoaded, waitForStablePage } from './helpers';

test('resource library and learning registration work offline', async ({ page }) => {
 const external: string[] = [];page.on('request',r=>{if(/^https?:/.test(r.url()))external.push(r.url())});
 const standalone = pathToFileURL(resolve('release/GIPS.html'));
 standalone.search='?role=mass&section=knowledge&material=nsj:conditions';
 await page.goto(standalone.href);await expect(page.getByRole('heading',{level:1})).toContainText('Условия программы');
 await expect(page.locator('.edu-article-content')).toBeVisible();await page.reload();
 await expect(page.locator('.edu-article-toc')).toBeVisible();
 standalone.search='?role=mass&section=learning&view=invest-class&item=investment-practice';
 await page.goto(standalone.href);await page.getByRole('button',{name:'Записаться',exact:true}).click();
 await page.reload();await expect(page.getByText('Вы записаны',{exact:true})).toBeVisible();expect(external).toEqual([]);
});

test('single-file release runs from disk without a server or network assets', async ({ page }) => {
  const externalRequests: string[] = [];
  page.on('request', (request) => {
    const url = request.url();
    if (!url.startsWith('file:') && !url.startsWith('data:') && !url.startsWith('blob:')) {
      externalRequests.push(url);
    }
  });

  const standalone = pathToFileURL(resolve('release/GIPS.html'));
  standalone.search = '?role=manager&section=home';
  await page.goto(standalone.href);
  await waitForStablePage(page);

  await expect(page.getByRole('heading', { level: 1, name: 'Алексей Морозов' })).toBeVisible();
  await expectAllImagesLoaded(page);
  expect(externalRequests).toEqual([]);
});

test('focus learning and original materials work in the offline release', async ({ page }) => {
  const externalRequests: string[] = [];
  page.on('request', request => { if (/^https?:/.test(request.url())) externalRequests.push(request.url()); });
  const standalone = pathToFileURL(resolve('release/GIPS.html'));
  standalone.search = '?role=mass&section=focus&product=nsj';
  await page.goto(standalone.href);
  await page.getByRole('textbox', { name: 'Ежегодный взнос, ₽' }).fill('400000');
  await expect(page.locator('.focus-example-result')).toContainText('1 452 000 ₽');
  await page.locator('.focus-materials button').first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expectAllImagesLoaded(page);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Все фокусные продукты' }).click();
  await expect(page.locator('.focus-product-card')).toHaveCount(5);
  expect(externalRequests).toEqual([]);
});


test('gold product and supplied materials are available offline', async ({ page }) => {
  const externalRequests: string[] = [];
  page.on('request', request => { if (/^https?:/.test(request.url())) externalRequests.push(request.url()); });
  const standalone = pathToFileURL(resolve('release/GIPS.html'));
  standalone.search = '?role=mass&section=focus';
  await page.goto(standalone.href);
  await page.getByRole('link', { name: 'ОМС «Золото»', exact: true }).click();
  await expect(page.locator('#opening')).toContainText('0,01 г');
  await expectAllImagesLoaded(page);
  for (const material of await page.locator('.focus-materials button').all()) {
    await material.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expectAllImagesLoaded(page);
    await page.keyboard.press('Escape');
  }
  expect(externalRequests).toEqual([]);
});

test('contest catalog, addressable details and original PDF work offline', async ({ page }) => {
  const external: string[] = [];
  page.on('request', r => { if (/^https?:/.test(r.url())) external.push(r.url()); });
  const url = pathToFileURL(resolve('release/GIPS.html'));
  url.search = '?role=mass&section=contest';
  await page.goto(url.href);
  await expect(page.locator('.contest-catalog-card')).toHaveCount(6);
  await page.getByRole('link', { name: 'Открыть конкурс «Драйвим будущее 2.0»' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Драйвим будущее 2.0');
  await expectAllImagesLoaded(page);
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#contest-materials a[download]').click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  const buffers: Buffer[] = [];
  for await (const chunk of stream!) buffers.push(chunk);
  expect(Buffer.concat(buffers).subarray(0,5).toString()).toBe('%PDF-');
  expect(external).toEqual([]);
});


test('standalone stays within its size budget and embeds every optimized PDF intact', () => {
  const html = readFileSync('release/GIPS.html', 'utf8');
  expect(statSync('release/GIPS.html').size).toBeLessThanOrEqual(9 * 1024 * 1024);
  const hash = (buffer: Buffer) => createHash('sha256').update(buffer).digest('hex');
  const embedded = [...html.matchAll(/data:application\/pdf;base64,([A-Za-z0-9+/=]+)/g)]
    .map((match) => hash(Buffer.from(match[1], 'base64'))).sort();
  const expected = readdirSync('src/assets/optimized').filter(name => name.endsWith('.pdf'))
    .map(name => hash(readFileSync(resolve('src/assets/optimized', name)))).sort();
  expect(expected).toHaveLength(6);
  expect(embedded).toEqual(expected);
});
