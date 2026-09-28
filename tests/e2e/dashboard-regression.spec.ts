import { expect, test } from '@playwright/test';
import { expectAllImagesLoaded, expectNoHorizontalOverflow, waitForStablePage } from './helpers';

test('dashboard retains approved KPI and September coefficients', async ({ page }) => {
  await page.goto('/?role=mass&section=home');
  await waitForStablePage(page);
  const kpi = page.locator('.widget--kpi');
  await expect(kpi).toContainText('Темп медленный.');
  await expect(kpi).toContainText('+1 000 руб.');
  await expect(kpi).toContainText('+1200');
  await expect(kpi.locator('.kpi-ring')).toHaveText('78%');
  await expect(page.locator('.widget--coefficients')).toContainText('СЕНТЯБРЬ');
  await expect(page.locator('.coefficient-list > div')).toHaveText(['ПИФ3', 'НСЖ1,5', 'НСЖ Фиксированный доход1,5', 'Стратегии1', 'ОМС0,75', 'ПДС0,75']);
});

test('dashboard shows approved news, market and achievement widgets', async ({ page }) => {
  await page.goto('/?role=mass&section=home');
  await waitForStablePage(page);

  await expect(page.locator('.widget--kpi .widget-header').getByText('КПЭ Продажа Инвестиций', { exact: true })).toBeVisible();
  await expect(page.getByText('KPI • КПЭ Продажа Инвестиций', { exact: true })).toHaveCount(0);

  const investNews = page.locator('.widget--invest-news');
  await expect(investNews.getByRole('heading', { name: 'Invest News' })).toBeVisible();
  await expect(investNews.getByRole('link')).toHaveCount(4);
  await expect(investNews.getByRole('button')).toHaveCount(0);
  await expect(investNews.getByRole('link', { name: /MAX: Invest Easy, канал/ })).toHaveAttribute('href', 'https://alfapeople.alfabank.ru/channels/366?type=working_chat');
  await expect(investNews.getByRole('link', { name: /Telegram: Invest Easy, бот/ })).toHaveAttribute('href', 'https://t.me/InvestAlfa_bot');
  await expect(investNews.getByRole('link', { name: /Telegram: Альфа-Инвестиции, канал/ })).toHaveAttribute('href', 'https://alfapeople.alfabank.ru/channels/109?type=community');

  const market = page.locator('.widget--market');
  await expect(market).toContainText('Ключевая ставка14%');
  await expect(market).not.toContainText('23 октября 2026');
  await expect(market).not.toContainText('Цель · 4%');
  await expect(market).toContainText('Золото11 814 ₽/г · $4 372/oz');
  await expect(market).toContainText('USD / RUB84,07 ₽');
  await expect(market.getByText('Демо', { exact: true })).toHaveCount(0);
  await expect(market.getByRole('link', { name: /Ключевая ставка/ })).toHaveAttribute('href', 'https://cbr.ru/hd_base/KeyRate/');
  await expect(market.getByRole('link', { name: /Инфляция/ })).toHaveAttribute('href', 'https://cbr.ru/hd_base/infl/');
  await expect(market.getByRole('link')).toHaveCount(2);
  await market.getByRole('button', { name: /Информация о ключевой ставке/ }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText('Следующее заседание Совета директоров Банка России — 23 октября 2026 года.')).toBeVisible();
  await market.getByRole('button', { name: /Информация об инфляции/ }).click();
  await expect(page.getByText('Цель Банка России по инфляции — 4%.')).toBeVisible();

  const achievements = page.locator('.achievements-widget');
  await expect(achievements.getByText('Получено 3', { exact: true })).toHaveCount(0);
  await expect(achievements.locator('img')).toHaveCount(3);
  await expect(achievements.getByRole('link', { name: 'Знаток инвестиций' })).toHaveAttribute('href', 'https://alfapeople.alfabank.ru/faq/tree/post/7444-znatok-i-magistr-investitsiy');
  await expect(achievements.getByRole('link', { name: 'Магистр инвестиций' })).toHaveAttribute('href', 'https://alfapeople.alfabank.ru/faq/tree/post/7444-znatok-i-magistr-investitsiy');
  await expect(achievements.getByRole('link', { name: 'Мастер накоплений' })).toHaveAttribute('href', 'https://alfapeople.alfabank.ru/faq/tree/post/7471-master-nakopleniy');

  const widgetHeights = await Promise.all([
    page.locator('.widget--invest-news'),
    page.locator('.widget--investor-feed'),
    market,
    page.locator('.ratings-card--compact'),
    achievements,
  ].map(async locator => (await locator.boundingBox())?.height));
  expect(new Set(widgetHeights)).toEqual(new Set([342]));

  const investorFeed = page.locator('.widget--investor-feed');
  await expect(investorFeed.getByRole('heading', { name: 'Аналитика рынка' })).toBeVisible();
  await expect(investorFeed).toContainText('Экономика, инвестиции, идеи');
  await expect(investorFeed).not.toContainText('Свежие материалы для разговора с клиентом');
  await expect(investorFeed).not.toContainText('10 сентября');
  await expect(investorFeed).not.toContainText('Тем временем спрос на ОФЗ-ПД');
  await expect(investorFeed.locator('.investor-news-card--featured')).toHaveCount(1);
  await expect(investorFeed.locator('.investor-news-card:not(.investor-news-card--featured)')).toHaveCount(2);
  await expect(investorFeed.getByRole('link', { name: 'Все материалы' })).toHaveAttribute('href', 'https://alfabank.ru/alfa-investor/');
  await expect(investorFeed.getByRole('link', { name: /Главное к открытию/ })).toHaveAttribute('href', 'https://alfabank.ru/alfa-investor/t/glavnoe-k-otkrytiyu-10-09-2026/');
  await expect(investorFeed.getByRole('link', { name: /Сбербанк увеличил доходы/ })).toHaveAttribute('href', 'https://alfabank.ru/alfa-investor/t/sberbank-uvelichil-dohody-v-avguste/');
  await expect(investorFeed.getByRole('link', { name: /Фавориты стратегии/ })).toHaveAttribute('href', 'https://alfabank.ru/alfa-investor/t/favority-strategii-na-iii-kvartal-2026-goda-novatek-090826/');
  for (const category of await investorFeed.locator('.investor-news-card__copy > span').all()) {
    expect(await category.evaluate((element) => {
      const categoryBox = element.getBoundingClientRect();
      const copyBox = element.parentElement?.getBoundingClientRect();
      return Boolean(copyBox && categoryBox.top - copyBox.top <= 17);
    })).toBe(true);
  }
  for (const title of await investorFeed.locator('.investor-news-card h3').all()) {
    expect(await title.evaluate((element) => {
      const titleBox = element.getBoundingClientRect();
      const cardBox = element.closest('.investor-news-card')?.getBoundingClientRect();
      return Boolean(cardBox && titleBox.top >= cardBox.top && titleBox.bottom <= cardBox.bottom);
    })).toBe(true);
    await expect(title).toHaveCSS('-webkit-line-clamp', 'none');
  }
  expect(await market.evaluate(element => element.previousElementSibling?.classList.contains('widget--investor-feed'))).toBe(true);

  await expectAllImagesLoaded(page);
  await expectNoHorizontalOverflow(page);
});

test('new dashboard widgets use only the portal typography roles', async ({ page }) => {
  await page.goto('/?role=mass&section=home');
  await waitForStablePage(page);

  const typographyContract = [
    ['.home-widget-eyebrow', '12px'],
    ['.invest-news__intro', '14px'],
    ['.invest-news__copy strong', '14px'],
    ['.invest-news__copy small', '12px'],
    ['.market-date', '12px'],
    ['.market-macro__link > span', '12px'],
    ['.market-macro__link strong', '20px'],
    ['.market-quote dt', '12px'],
    ['.market-quote dd', '13px'],
    ['.ratings-card--compact .ratings-card__intro', '14px'],
    ['.ratings-card--compact .rating-row strong', '13px'],
    ['.ratings-card--compact .rating-row small', '12px'],
    ['.achievements-widget__list strong', '13px'],
    ['.investor-feed__heading h2', '12px'],
    ['.investor-feed__intro', '14px'],
    ['.investor-news-card__copy > span', '12px'],
    ['.investor-news-card:not(.investor-news-card--featured) h3', '14px'],
    ['.investor-news-card--featured h3', '17px'],
  ] as const;

  for (const [selector, size] of typographyContract) {
    await expect(page.locator(selector).first(), selector).toHaveCSS('font-size', size);
  }
});

test('menu navigation opens the home page at the top', async ({ page }) => {
  await page.goto('/?role=mass&section=focus');
  await waitForStablePage(page);
  await page.evaluate(() => {
    sessionStorage.setItem('resources-scroll:?role=mass&section=home', '900');
  });

  await page.getByRole('navigation', { name: 'Основные разделы' }).getByText('Главная', { exact: true }).click();
  await expect(page).toHaveURL(/section=home/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});

test('shell keeps its width across home, focus and reload with short content', async ({ page }) => {
  await page.setViewportSize({ width: test.info().project.use.viewport!.width, height: 1400 });
  const widths: number[] = [];
  for (const section of ['home', 'focus', 'home']) {
    await page.goto(`/?role=mass&section=${section}`);
    await waitForStablePage(page);
    widths.push((await page.locator('.content-shell').boundingBox())!.width);
    await page.reload();
    await waitForStablePage(page);
    widths.push((await page.locator('.content-shell').boundingBox())!.width);
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflowY)).toBe('scroll');
  }
  expect(new Set(widths).size).toBe(1);
});
