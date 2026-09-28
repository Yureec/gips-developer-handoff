import { expect, test } from '@playwright/test';
import { waitForStablePage } from './helpers';

test('home progress stays aligned on every challenge slide', async ({ page }) => {
  await page.goto('/?role=mass&section=home');
  await waitForStablePage(page);
  const challenge = page.locator('.widget--challenge');
  const learning = page.locator('.edu-daily-home');
  await expect(learning.getByRole('heading')).toHaveText('НСЖ');
  await expect(learning).toContainText('Ежедневное обучение по Daily Invest');
  await expect(learning).toContainText('Прогресс недели');
  await expect(learning).toContainText('3 из 5');
  await expect(learning).not.toContainText('долг');
  await expect(learning).not.toContainText('В среднем');
  await expect(learning.getByRole('link', { name: 'Мое обучение' })).toHaveAttribute(
    'href',
    'https://alfapeople.alfabank.ru/lxp-my-education/',
  );
  let previous: unknown;
  for (const button of await challenge.getByRole('button', { name: /^Челлендж \d/ }).all()) {
    await button.click();
    const geometry = await page.evaluate(() => {
      const card = document.querySelector('.widget--challenge')!;
      const daily = document.querySelector('.edu-daily-home')!;
      const c = card.getBoundingClientRect(), d = daily.getBoundingClientRect();
      const track = card.querySelector('.gips-step-progress')!.getBoundingClientRect();
      const bar = daily.querySelector('[role="progressbar"]')!.getBoundingClientRect();
      const description = card.querySelector('p')!.getBoundingClientRect();
      return { height: c.height, dailyHeight: d.height, track: track.top - c.top,
        dailyTrack: bar.top - d.top, difference: track.top - bar.top,
        footer: card.querySelector('.widget-card-footer')!.getBoundingClientRect().top - c.top,
        fits: description.bottom < track.top };
    });
    expect(geometry.fits).toBe(true);
    expect(Math.abs(geometry.difference)).toBeLessThanOrEqual(1);
    expect(geometry.height).toBe(342);
    expect(geometry.dailyHeight).toBe(342);
    if (previous) expect(geometry).toEqual(previous);
    previous = geometry;
  }
  expect(previous).toBeTruthy();
});

test('learning menu opens at the profile even after saved reading scroll', async ({ page }) => {
  await page.goto('/?role=mass&section=home');
  await page.evaluate(() => sessionStorage.setItem('resources-scroll:?role=mass&section=learning', '900'));
  await page.getByRole('button', { name: 'Обучение', exact: true }).click();
  await waitForStablePage(page);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await expect(page.locator('.header-user')).toBeInViewport();
  await expect(page.getByRole('navigation', { name: 'Основные разделы' })).toBeInViewport();
});
