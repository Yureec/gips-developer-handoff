import { expect, test } from '@playwright/test';

import {
  expectAllImagesLoaded,
  expectNoHorizontalOverflow,
  expectVisibleFocus,
  waitForStablePage,
} from './helpers';

const routes = [
  '/?role=mass&section=home',
  '/?role=only&section=home',
  '/?role=manager&section=home',
  '/?role=consultant&section=home',
  '/?role=partner&section=home',
  '/?role=mass&section=marketplace',
  '/?role=mass&section=scenario&scenario=conversation-challenge',
];

test.describe('layout and asset integrity', () => {
  for (const route of routes) {
    test(`${route} has no broken images or horizontal overflow`, async ({ page }) => {
      await page.goto(route);
      await waitForStablePage(page);
      await expectAllImagesLoaded(page);
      await expectNoHorizontalOverflow(page);
    });
  }
});

test('contest widget keeps the shared Figma geometry on every role page', async ({ page }) => {
  const contestRoutes = [
    '/?role=mass&section=home',
    '/?role=only&section=home',
    '/?role=consultant&section=home',
  ];
  const geometry = [];

  for (const route of contestRoutes) {
    await page.goto(route);
    await waitForStablePage(page);
    geometry.push(await page.locator('.widget--contest').evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        gap: getComputedStyle(element.parentElement!).columnGap,
        height: element.getBoundingClientRect().height,
        padding: style.padding,
        radius: style.borderRadius,
        width: element.getBoundingClientRect().width,
      };
    }));
  }

  expect(new Set(geometry.map(({ width }) => width)).size).toBe(1);
  expect(geometry.map(({ height }) => height)).toEqual([342, 342, 342]);
  expect(geometry.map(({ gap }) => gap)).toEqual(['24px', '24px', '24px']);
  expect(new Set(geometry.map(({ padding }) => padding)).size).toBe(1);
  expect(geometry.map(({ radius }) => radius)).toEqual(['16px', '16px', '16px']);
});

test('Mass and Only KPI cards use one base widget contract', async ({ page }) => {
  const targets = [
    ['/?role=mass&section=home', '.widget--focus'],
    ['/?role=only&section=home', '.metric-widget'],
  ] as const;
  const contracts = [];

  for (const [route, selector] of targets) {
    await page.goto(route);
    await waitForStablePage(page);
    contracts.push(await page.locator(selector).first().evaluate((element) => {
      const style = getComputedStyle(element);
      const eyebrowStyle = getComputedStyle(element.querySelector('.widget-eyebrow')!);
      return {
        eyebrowFamily: eyebrowStyle.fontFamily,
        eyebrowLetterSpacing: eyebrowStyle.letterSpacing,
        eyebrowSize: eyebrowStyle.fontSize,
        height: element.getBoundingClientRect().height,
        padding: style.padding,
        radius: style.borderRadius,
        width: element.getBoundingClientRect().width,
      };
    }));
  }

  expect(contracts[1]).toEqual(contracts[0]);
  expect(contracts[0].height).toBe(342);
  expect(contracts[0].radius).toBe('16px');
});

test('Only dashboard modules follow the 342px vertical rhythm', async ({ page }) => {
  await page.goto('/?role=only&section=home');
  await waitForStablePage(page);

  const heights = await page.locator([
    '.only-priority-grid > .widget',
    '.only-goal-grid > .widget',
    '.only-driver-grid > .widget',
    '.only-nomination-grid > .widget',
    '.only-tools-grid > .widget',
    '.only-bottom-grid > .widget',
  ].join(',')).evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().height));

  expect(new Set(heights)).toEqual(new Set([342]));
});

test('carousel is operable from the keyboard', async ({ page }) => {
  await page.goto('/?role=mass&section=home');
  await waitForStablePage(page);

  const secondContest = page.getByRole('button', { name: 'Конкурс 2 из 2' });
  await secondContest.focus();
  await expectVisibleFocus(page);
  await page.keyboard.press('Space');

  await expect(secondContest).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('heading', { name: 'Драйвим будущее 2.0' })).toBeVisible();
});

test('mass dashboard exposes all four Figma challenge states', async ({ page }) => {
  await page.goto('/?role=mass&section=home');
  await waitForStablePage(page);

  const challengeNames = ['Полный круг', 'Разговоры о фондах', 'Знаток и практик', 'Чистая неделя'];
  for (const [index, name] of challengeNames.entries()) {
    await page.getByRole('button', { name: `Челлендж ${index + 1} из 4` }).click();
    await expect(page.locator('.widget--challenge').getByRole('heading', { name })).toBeVisible();
  }
});

test('header and dashboard omit retired labels and actions', async ({ page }) => {
  await page.goto('/?role=mass&section=home');
  await waitForStablePage(page);

  const roleSwitcher = page.locator('.mode-switcher');
  const roleCombobox = page.getByRole('combobox', { name: 'Роль сотрудника' });
  await expect(roleCombobox).toBeVisible();
  expect(await roleCombobox.boundingBox()).toEqual(await roleSwitcher.boundingBox());
  await page.getByRole('button', { name: 'Поиск по инвестпорталу' }).click();
  await expect(page.getByRole('dialog', { name: 'Поиск по инвестпорталу' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Найти сотрудника, сервис или ответ на вопрос' })).toBeFocused();
  await expect(page.getByRole('dialog', { name: 'Поиск по инвестпорталу' }).getByText('Поиск по инвестпорталу', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Рекомендуемые статьи' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Рекомендуемые статьи' })).toHaveCSS('font-weight', '400');
  await expect(page.locator('.global-search-result strong').first()).toHaveCSS('font-weight', '400');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Поиск по инвестпорталу' })).toHaveCount(0);
  await expect(page.getByText('Режим', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Подписаться' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'QR-код' })).toHaveCount(0);
  await expect(page.getByText('за выполнение месячного KPI', { exact: true })).toHaveCount(0);
  await expect(page.locator('.widget--kpi .widget-header').getByText('КПЭ Продажа Инвестиций', { exact: true })).toBeVisible();
  await expect(page.getByText('KPI • КПЭ Продажа Инвестиций', { exact: true })).toHaveCount(0);
  await expect(page.getByText('KPI • ПРОДАЖА ИНВЕСТИЦИЙ', { exact: true })).toHaveCount(0);
});

test('role workspaces share the same card-title typography', async ({ page }) => {
  const headingTargets = [
    ['/?role=mass&section=home', '.widget--invest-class h2'],
    ['/?role=manager&section=home', '.role-section h2'],
    ['/?role=consultant&section=home', '.role-section h2'],
    ['/?role=partner&section=home', '.role-section h2'],
  ] as const;
  const typography = [];

  for (const [route, selector] of headingTargets) {
    await page.goto(route);
    await waitForStablePage(page);
    typography.push(await page.locator(selector).first().evaluate((element) => {
      const style = getComputedStyle(element);
      return { family: style.fontFamily, size: style.fontSize, weight: style.fontWeight };
    }));
  }

  expect(new Set(typography.map(({ family }) => family)).size).toBe(1);
  expect(new Set(typography.map(({ size }) => size))).toEqual(new Set(['20px']));
  expect(new Set(typography.map(({ weight }) => weight)).size).toBe(1);
});

test('employee roles reuse one hero contract', async ({ page }) => {
  const roleRoutes = ['only', 'manager', 'consultant', 'partner'];
  const contracts = [];

  for (const role of roleRoutes) {
    await page.goto(`/?role=${role}&section=home`);
    await waitForStablePage(page);
    contracts.push(await page.locator('.role-hero').evaluate((element) => {
      const style = getComputedStyle(element);
      const titleStyle = getComputedStyle(element.querySelector('h1')!);
      return {
        background: style.backgroundImage,
        padding: style.padding,
        radius: style.borderRadius,
        titleFamily: titleStyle.fontFamily,
        titleSize: titleStyle.fontSize,
        width: element.getBoundingClientRect().width,
      };
    }));
  }

  expect(new Set(contracts.map((contract) => JSON.stringify(contract))).size).toBe(1);
  expect(contracts[0].radius).toBe('16px');
  expect(contracts[0].titleSize).toBe('32px');
});

test('manager, consultant and partner modules follow the shared vertical rhythm', async ({ page }) => {
  for (const role of ['manager', 'consultant', 'partner']) {
    await page.goto(`/?role=${role}&section=home`);
    await waitForStablePage(page);
    const heights = await page.locator('.role-grid > .role-section').evaluateAll((elements) => (
      elements.map((element) => element.getBoundingClientRect().height)
    ));
    expect(new Set(heights), `${role} module heights`).toEqual(new Set([342]));
  }
});

test('role workspaces use Alfa controls for standard selection patterns', async ({ page }) => {
  for (const role of ['manager', 'consultant', 'partner']) {
    await page.goto(`/?role=${role}&section=home`);
    await waitForStablePage(page);
    await expect(page.getByRole('combobox', { name: 'Роль сотрудника' })).toBeVisible();
    await expect(page.locator('select')).toHaveCount(0);
  }
});

test('scenario transition updates URL, title and focus', async ({ page }) => {
  await page.goto('/?role=mass&section=scenario&scenario=learning-catalog');

  await expect(page).toHaveURL(/section=scenario.*scenario=learning-catalog/);
  await expect(page).toHaveTitle('Каталог учебных модулей · ГИПС');
  await expect(page.getByRole('heading', { level: 1, name: 'Каталог учебных модулей' })).toBeVisible();
  await page.getByRole('button', { name: 'Открыть обучение' }).click();
  await expect(page).toHaveURL(/role=mass.*section=learning/);
  await expect(page).toHaveTitle('Обучение · ГИПС');
  await expect(page.locator('.edu-summary')).toBeVisible();
});

test('reward checkout covers the affordable and savings-goal branches', async ({ page }) => {
  await page.goto('/?role=mass&section=marketplace-order&reward=cap');
  await page.getByRole('button', { name: 'Заказать за 650 I' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Заказ оформлен' })).toBeVisible();
  await expect(page.getByText('В обработке', { exact: true })).toBeVisible();

  await page.goto('/?role=mass&section=marketplace-order&reward=nvidia');
  await page.getByRole('button', { name: 'Добавить в цель' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Цель добавлена' })).toBeVisible();
  await expect(page.getByText('Цель накопления', { exact: true })).toBeVisible();
});

test('manager portrait is the square source image from the prototype', async ({ page }) => {
  await page.goto('/?role=manager&section=home');
  const portrait = page.locator('.role-hero__identity > img');

  await expect(portrait).toBeVisible();
  await expect.poll(() => portrait.evaluate((image: HTMLImageElement) => ({
    width: image.naturalWidth,
    height: image.naturalHeight,
  }))).toEqual({ width: 520, height: 520 });
});
