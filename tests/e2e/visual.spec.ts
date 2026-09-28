import { expect, test } from '@playwright/test';

import { waitForStablePage } from './helpers';

const screens = [
  ['mass-home', '/?role=mass&section=home'],
  ['only-home', '/?role=only&section=home'],
  ['manager-home', '/?role=manager&section=home'],
  ['consultant-home', '/?role=consultant&section=home'],
  ['partner-home', '/?role=partner&section=home'],
  ['marketplace', '/?role=mass&section=marketplace'],
  ['scenario', '/?role=mass&section=scenario&scenario=conversation-challenge'],
  ['reward-ordered', '/?role=mass&section=marketplace-success&reward=cap&order=ORD-0650'],
  ['reward-goal', '/?role=mass&section=marketplace-success&reward=nvidia&order=GOAL-9200'],
] as const;

for (const [name, route] of screens) {
  test(`${name} matches its Chrome baseline`, async ({ page }) => {
    await page.goto(route);
    await waitForStablePage(page);
    await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: true });
  });
}
