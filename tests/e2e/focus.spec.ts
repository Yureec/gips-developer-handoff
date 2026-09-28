import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { salesProgress } from '../../src/domain/focus';
import { expectNoHorizontalOverflow, waitForStablePage } from './helpers';

test('RR uses supplied working calendar and distinguishes missing data from zero', () => {
  const period = { month: '2026-09', asOf: '2026-09-05', workingDates: ['2026-09-01', '2026-09-03', '2026-09-05', '2026-09-07', '2026-09-07', '2026-10-01'] };
  // Includes a transferred Saturday and excludes a weekday holiday, without assuming Mon–Fri.
  expect(salesProgress({ actual: 75, plan: 100 }, period)).toEqual({ completion: 75, runRate: 100, elapsed: 3, total: 4 });
  expect(salesProgress({ actual: 0, plan: 100 }, period).runRate).toBe(0);
  expect(salesProgress({ actual: null, plan: 100 }, period).runRate).toBeNull();
  expect(salesProgress({ actual: 100, plan: 0 }, period).runRate).toBeNull();
  expect(salesProgress({ actual: 100, plan: 100 }, { ...period, asOf: '2026-08-31' }).runRate).toBeNull();
  expect(salesProgress({ actual: 120, plan: 100 }, { ...period, asOf: '2026-09-30' }).runRate).toBe(120);
});

test('catalog filters, empty state, product routes and browser history', async ({ page }) => {
  await page.goto('/?role=mass&section=focus');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Фокусные продукты');
  await expect(page.getByLabel('Период списка фокусных продуктов')).toContainText('Сентябрь 2026');
  await page.getByRole('button', { name: /Что изменилось · 4/ }).click();
  await expect(page.getByText('ПСЖ «Чистый процент» на 2 и 3 года')).toBeVisible();
  await expect(page.getByText('ЦФА Альфа-Банка')).toBeVisible();
  await expect(page.locator('.focus-product-card')).toHaveCount(5);
  await expect(page.locator('.focus-summary')).toContainText('RR');
  await expect(page.locator('.focus-summary')).toContainText('80%');
  await expect(page.locator('.focus-summary')).toContainText('873 540 ₽');
  await expect(page.locator('.focus-summary')).toContainText('Учтены показатели по 3 из 5');
  await page.getByRole('button', { name: 'Страхование', exact: true }).click();
  await expect(page.locator('.focus-product-card')).toHaveCount(2);
  await page.getByRole('button', { name: 'Найти фокусный продукт' }).click();
  await page.getByRole('textbox', { name: 'Найти фокусный продукт' }).fill('несуществующий');
  await expect(page.getByText('Продукты не найдены')).toBeVisible();
  await page.getByRole('button', { name: 'Сбросить фильтры' }).click();
  await expect(page.locator('.focus-product-card')).toHaveCount(5);
  await page.getByRole('button', { name: 'Предыдущий месяц' }).click();
  await expect(page.getByLabel('Период списка фокусных продуктов')).toContainText('Август 2026');
  await expect(page.locator('.focus-product-card')).toHaveCount(3);
  await expect(page.getByRole('heading', { name: 'Защищённый капитал на 3 года', exact: true })).toBeVisible();
  await expect(page.getByText('FortKnox с первым периодом на три месяца', { exact: false })).toBeVisible();
  await expect(page.locator('.focus-summary')).toContainText('КПЭ');
  await expect(page.locator('.focus-summary')).toContainText('75%');
  await expect(page.locator('.focus-summary')).toContainText('1 387 765 ₽');
  await expect(page.locator('.focus-summary')).toContainText('КПЭ не выполнен — отставание 25%.');
  await expect(page.locator('.focus-summary')).toContainText('Итог по 3 из 3 продуктов');
  await expect(page.locator('.focus-summary')).not.toContainText('Проверьте темп продаж.');
  await expect(page.locator('.focus-product-card').first()).toContainText('Выполнение');
  await expect(page.locator('.focus-product-card').first()).not.toContainText('RR');
  for (const amount of await page.locator('.focus-product-card__result strong').all()) {
    await expect(amount).toHaveCSS('color', 'rgb(189, 52, 43)');
  }
  await page.getByRole('button', { name: /Что изменилось · 3/ }).click();
  await expect(page.getByRole('region', { name: 'Изменения за август' }).getByText('Фиксированный доход 3+12', { exact: true })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  const augustAccessibility = await new AxeBuilder({ page }).include('main').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(augustAccessibility.violations).toEqual([]);
  await page.getByRole('button', { name: 'Следующий месяц' }).click();
  await expect(page.getByLabel('Период списка фокусных продуктов')).toContainText('Сентябрь 2026');
  await page.getByRole('button', { name: 'Изучить НСЖ «Максимум»', exact: true }).click();
  await expect(page).toHaveURL(/product=nsj$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('НСЖ «Максимум»');
  await expect(page.locator('main')).toBeFocused();
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Фокусные продукты');
  await page.goForward();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('НСЖ «Максимум»');
  await page.getByRole('button', { name: 'Все фокусные продукты' }).click();
  await page.getByRole('button', { name: 'Изучить НСЖ «Максимум плюс»' }).click();
  await expect(page.locator('.focus-source')).toContainText('параметры «Максимума» здесь не применяются');
  await expect(page.locator('#example')).toHaveCount(0);
});

test('catalog reuses the four-column dashboard grid and sales widget', async ({ page }) => {
  await page.goto('/?role=mass&section=home');
  await waitForStablePage(page);
  const dashboardKpi = await page.locator('.sales-kpi-widget').evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      height: element.getBoundingClientRect().height,
      padding: style.padding,
      radius: style.borderRadius,
      width: element.getBoundingClientRect().width,
    };
  });

  await page.goto('/?role=mass&section=focus');
  await waitForStablePage(page);
  const catalogKpi = await page.locator('.focus-summary').evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      height: element.getBoundingClientRect().height,
      padding: style.padding,
      radius: style.borderRadius,
      width: element.getBoundingClientRect().width,
    };
  });
  const firstRow = await page.locator('.focus-product-card').evaluateAll((cards) => {
    const firstTop = cards[0].getBoundingClientRect().top;
    return cards.filter(card => Math.abs(card.getBoundingClientRect().top - firstTop) < 1).length;
  });
  const summaryBox = await page.locator('.focus-summary').boundingBox();
  const thirdProductBox = await page.locator('.focus-product-card').nth(2).boundingBox();
  const alignment = await page.locator('.focus-product-card').first().evaluate((card) => {
    const logo = card.querySelector('.product-mark')!.getBoundingClientRect();
    const title = card.querySelector('.focus-product-card__heading-copy')!.getBoundingClientRect();
    const tag = card.querySelector('.status-tag')!.getBoundingClientRect();
    const bounds = card.getBoundingClientRect();
    return {
      centerDelta: Math.abs((logo.top + logo.height / 2) - (title.top + title.height / 2)),
      tagTopGap: tag.top - bounds.top,
      tagRightGap: bounds.right - tag.right,
    };
  });
  const periodBox = await page.locator('.focus-period-slider').boundingBox();
  const filterBox = await page.locator('.catalog-filter').boundingBox();
  const search = page.locator('.focus-context-bar .compact-search');
  const searchBox = await search.boundingBox();
  const changesBox = await page.locator('.focus-changes').boundingBox();
  const navigationBox = await page.locator('.primary-navigation__control').boundingBox();
  const periodArrowStyles = await page.locator('.focus-period-slider button').evaluateAll((buttons) => buttons.map((button) => ({
    background: getComputedStyle(button).backgroundColor,
    shadow: getComputedStyle(button).boxShadow,
  })));

  expect(catalogKpi).toEqual(dashboardKpi);
  expect(firstRow).toBe(3);
  expect(summaryBox!.y).toBe(thirdProductBox!.y);
  expect(summaryBox!.x).toBeGreaterThan(thirdProductBox!.x);
  expect(alignment.centerDelta).toBeLessThan(1);
  expect(alignment.tagTopGap).toBe(alignment.tagRightGap);
  expect(periodBox!.x).toBeLessThan(filterBox!.x);
  expect(filterBox!.x).toBeLessThan(searchBox!.x);
  expect(searchBox!.x).toBeLessThan(changesBox!.x);
  for (const controlBox of [periodBox, filterBox, searchBox, changesBox]) {
    expect(controlBox!.height).toBe(navigationBox!.height);
  }
  expect(periodArrowStyles).toEqual([
    { background: 'rgba(0, 0, 0, 0)', shadow: 'none' },
    { background: 'rgba(0, 0, 0, 0)', shadow: 'none' },
  ]);
  await page.getByRole('button', { name: 'Найти фокусный продукт' }).click();
  const searchPanelBox = await search.locator('.compact-search__panel').boundingBox();
  expect(searchPanelBox!.x).toBeGreaterThanOrEqual(searchBox!.x + searchBox!.width);
});

test('changes disclosure avoids height animation and respects reduced motion', async ({ page }) => {
  await page.goto('/?role=mass&section=focus');
  const toggle = page.getByRole('button', { name: /Что изменилось · 4/ });
  const panel = page.locator('.focus-changes__content');

  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(panel).toBeHidden();
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(panel).toBeVisible();
  expect(await panel.evaluate((element) => getComputedStyle(element).transitionProperty)).not.toContain('height');
  await toggle.click();
  await expect(panel).toBeHidden();

  await page.emulateMedia({ reducedMotion: 'reduce' });
  const reducedMotionDuration = await panel.evaluate((element) => {
    const durations = getComputedStyle(element).transitionDuration.split(',');
    return Math.max(...durations.map((duration) => Number.parseFloat(duration) || 0));
  });
  expect(reducedMotionDuration).toBeLessThanOrEqual(0.001);
  await toggle.click();
  await expect(panel).toBeVisible();
});

test('learning example validates amounts and questions work from the keyboard', async ({ page }) => {
  await page.goto('/?role=mass&section=focus&product=nsj');
  await page.getByRole('button', { name: 'Разобрать пример', exact: true }).click();
  await expect(page.locator('#example')).toBeFocused();
  const input = page.getByRole('textbox', { name: 'Ежегодный взнос, ₽' });
  await expect(page.locator('.focus-example-result')).toContainText('726 000 ₽');
  await input.fill('400000');
  await expect(page.locator('.focus-example-result')).toContainText('1 452 000 ₽');
  await expect(page.locator('.focus-example-result')).toContainText('252 000 ₽');
  await input.fill('29999');
  await expect(page.getByText('Введите целую сумму от 30 000 до 20 000 000 ₽')).toBeVisible();
  await expect(page.locator('.focus-example-result')).toHaveCount(0);
  await input.fill('20000001');
  await expect(page.locator('.focus-example-result')).toHaveCount(0);
  await input.fill('');
  await expect(page.locator('.focus-example-result')).toHaveCount(0);
  await input.fill('30000');
  await expect(page.locator('.focus-example-result')).toContainText('108 900 ₽');
  const question = page.locator('.focus-question').first().locator('[role="button"]');
  await question.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText('Нет. 21% начисляется', { exact: false })).toBeVisible();
  await expect(page.locator('#conditions')).toContainText('Льготный период для очередного взноса — 14');
  await expect(page.locator('.focus-materials button')).toHaveCount(7);
  await page.locator('.focus-materials button').first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('.material-gallery img')).toBeVisible();
  await expect.poll(() => page.locator('.material-gallery img').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('.focus-materials button').first()).toBeFocused();

});

for (const product of ['', 'nsj', 'oms', 'pds', 'nsj-plus', 'autofollow']) {
  test(`focus visual and accessibility ${product || 'catalog'}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`/?role=mass&section=focus${product ? `&product=${product}` : ''}`);
    await waitForStablePage(page);
    await expectNoHorizontalOverflow(page);
    const accessibility = await new AxeBuilder({ page }).include('main').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(accessibility.violations).toEqual([]);
    expect(errors).toEqual([]);
    if (product === 'nsj' || product === 'oms' || !product) await expect(page).toHaveScreenshot(`focus-${product || 'catalog'}.png`, { fullPage: true });
  });
}


test('gold content stays within Mass and separates product risk from tax and service rules', async ({ page }) => {
  // Keep the CI regression covered even when local assets load very quickly.
  await page.route('**/oms-brochure*.webp', async route => {
    const response = await route.fetch();
    await new Promise(resolve => setTimeout(resolve, 300));
    await route.fulfill({ response });
  });
  await page.goto('/?role=mass&section=focus&product=oms');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('ОМС «Золото»');
  await expect(page.locator('.focus-facts')).toContainText('от 0,01 г');
  await expect(page.locator('.focus-facts')).toContainText('от 1 г');
  await expect(page.locator('.focus-important')).toContainText('не застрахован');
  await expect(page.locator('#conditions')).toContainText('не начисляет и не выплачивает проценты');
  await expect(page.locator('#taxes')).toContainText('альтернативные способы');
  await expect(page.locator('#preferential')).toContainText('20 млн ₽');
  await expect(page.locator('main')).not.toContainText('19,5%');
  await expect(page.locator('main')).not.toContainText('А-Клуб');
  await expect(page.locator('#example')).toHaveCount(0);
  await expect(page.locator('.focus-materials button')).toHaveCount(1);
  await page.getByRole('navigation', { name: 'Разделы продукта' }).getByRole('button', { name: /Налоги/ }).click();
  await expect(page.locator('#taxes')).toBeFocused();
  for (const link of await page.locator('#taxes a').all()) {
    expect(new URL((await link.getAttribute('href'))!).hostname).toBe('www.nalog.gov.ru');
  }
  await page.locator('.focus-materials button').first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect.poll(() => page.locator('.material-gallery img').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  await page.keyboard.press('Escape');
  await expect(page.locator('.focus-materials button').first()).toBeFocused();
});

for (const product of ['nsj', 'oms']) {
  test(`Alfa Gallery fits, toggles fullscreen and restores focus: ${product}`, async ({ page }) => {
    await page.goto(`/?role=mass&section=focus&product=${product}`);
    const trigger = page.locator('.focus-materials button').first();
    await trigger.click();
    const image = page.locator('.material-gallery img');
    await image.evaluate((element: HTMLImageElement) => element.decode());
    const fits = () => image.evaluate(element => {
      const box = element.getBoundingClientRect();
      return box.height > 100 && box.top >= 0 && box.bottom <= innerHeight && box.left >= 0 && box.right <= innerWidth;
    });
    await expect.poll(fits).toBe(true);
    await page.getByRole('button', { name: 'Открыть в полноэкранном режиме' }).click();
    await expect(page.getByRole('button', { name: 'Выйти из полноэкранного режима' })).toBeVisible();
    await expect.poll(fits).toBe(true);
    await page.getByRole('button', { name: 'Выйти из полноэкранного режима' }).click();
    const current = page.viewportSize()!;
    await page.setViewportSize({ ...current, height: current.height - 120 });
    await expect.poll(fits).toBe(true);
    const accessibility = await new AxeBuilder({ page }).include('[role="dialog"]').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(accessibility.violations).toEqual([]);
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
    await trigger.click();
    await expect.poll(fits).toBe(true);
    await page.getByRole('button', { name: 'Закрыть', exact: true }).click();
    await expect(trigger).toBeFocused();
  });
}
