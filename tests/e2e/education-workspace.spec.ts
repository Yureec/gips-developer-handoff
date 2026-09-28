import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync } from "node:fs";
import { expectNoHorizontalOverflow, waitForStablePage } from "./helpers";

const learning = "/?role=mass&section=learning";
test("home and learning show the same snapshot; links do not award completion", async ({
  page,
}) => {
  await page.goto("/?role=mass&section=home");
  const card = page.getByRole("article", { name: "Daily Invest", exact: true });
  await expect(card.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "3",
  );
  await expect(card.getByRole("progressbar")).toHaveAttribute("aria-valuemax", "5");
  await expect(card.getByRole("link", { name: "Мое обучение" })).toHaveAttribute(
    "href",
    "https://alfapeople.alfabank.ru/lxp-my-education/",
  );
  await expect(card.getByRole("link", { name: "К обучению", exact: true })).toHaveCount(0);
  await page.goto(learning);
  await expect(page.locator(".edu-summary")).toContainText("8 из 12");
  await expect(
    page.locator(".edu-daily-card").getByRole("progressbar"),
  ).toHaveAttribute("aria-valuenow", "60");
  const launch = page
    .locator(".edu-daily-card")
    .getByRole("link", { name: "Продолжить", exact: true });
  await expect(launch).toHaveAttribute(
    "href",
    "https://alfapeople.alfabank.ru/lxp-my-education/",
  );
  await expect(launch).toHaveAttribute("target", "_blank");
  await page.route("https://alfapeople.alfabank.ru/**", (route) =>
    route.fulfill({ body: "Обучение" }),
  );
  const popup = page.waitForEvent("popup");
  await launch.click();
  await (await popup).close();
  await page.reload();
  await expect(
    page.locator(".edu-daily-card").getByRole("progressbar"),
  ).toHaveAttribute("aria-valuenow", "60");
  await page
    .getByRole("button", { name: "Как считается средний процент прохождения" })
    .click();
  await expect(page.getByRole("dialog")).toContainText("84");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("button", {
      name: "Как считается средний процент прохождения",
    }),
  ).toBeFocused();
});

test("legacy Daily Invest pages redirect to Alfa People", async ({
  page,
}) => {
  await page.route("https://alfapeople.alfabank.ru/**", (route) =>
    route.fulfill({ body: "Обучение" }),
  );
  await page.goto(learning + "&view=daily");
  await expect(page).toHaveURL("https://alfapeople.alfabank.ru/lxp-my-education/");
});

test("event registration persists, cancellation requires an explicit action, calendar downloads", async ({
  page,
}) => {
  await page.goto(learning + "&view=invest-class&item=investment-practice");
  await page.getByRole("button", { name: "Записаться", exact: true }).click();
  await page.reload();
  await expect(page.getByText("Вы записаны", { exact: true })).toBeVisible();
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Добавить в календарь", exact: true })
    .click();
  const file = await download;
  expect(file.suggestedFilename()).toBe("invest-class-investment-practice.ics");
  const text = readFileSync((await file.path())!, "utf8");
  expect(text).toContain("DTSTART:20260925T080000Z");
  expect(text).toContain("BEGIN:VEVENT");
  await page
    .getByRole("button", { name: "Отменить запись", exact: true })
    .click();
  await expect(page.getByText("Отменить запись на встречу?")).toBeVisible();
  await page.getByRole("button", { name: "Да, отменить", exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Записаться", exact: true }),
  ).toBeVisible();
  await page.goto(learning + "&view=events");
  await page.getByText("Мои", { exact: true }).click();
  await expect(page.locator(".edu-event-row")).toHaveCount(1);
});

test("resource cross-links preserve context and transcript; blocked storage is tolerated", async ({
  page,
}) => {
  await page.goto(learning);
  await page
    .getByRole("link")
    .filter({ hasText: "НСЖ: ответы на частые вопросы" })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("НСЖ");
  await page.reload();
  await page.getByRole("link", { name: "К обучению", exact: true }).click();
  await expect(page).toHaveURL(/section=learning$/);
  await page.goto(learning + "&view=invest-class&item=pds-questions");
  expect(
    (await page.locator("[data-source-text]").allTextContents()).join(""),
  ).toBe(readFileSync("src/data/learning/pds-voronkov.txt", "utf8"));
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw Error("blocked");
    };
    Storage.prototype.setItem = () => {
      throw Error("blocked");
    };
  });
  await page.goto(learning + "&view=invest-class&item=investment-practice");
  await page.getByRole("button", { name: "Записаться", exact: true }).click();
  await expect(page.getByText("Вы записаны", { exact: true })).toBeVisible();
});

for (const [name, route] of [
  ["overview", learning],
  ["assignments", learning + "&view=assignments"],
  ["events", learning + "&view=events"],
  ["event", learning + "&view=invest-class&item=investment-practice"],
  ["knowledge", "/?role=mass&section=knowledge"],
  ["article", "/?role=mass&section=knowledge&material=nsj%3Aconditions"],
]) {
  test(`${name}: desktop layout and accessibility`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(route);
    await waitForStablePage(page);
    await expectNoHorizontalOverflow(page);
    expect(
      (
        await new AxeBuilder({ page })
          .include("main")
          .withTags(["wcag2a", "wcag2aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await expect(page).toHaveScreenshot(`education-${name}.png`, {
      fullPage: true,
    });
    expect(errors).toEqual([]);
  });
}

test("Core filters preserve assignment criteria across reload", async ({
  page,
}) => {
  await page.goto(learning + "&view=assignments");
  await page.getByRole("combobox", { name: "Тип задания" }).click();
  await page.getByRole("option", { name: "Курсы", exact: true }).click();
  await expect(page.locator(".edu-task-row")).toHaveCount(1);
  await page.getByRole("textbox", { name: "Поиск заданий" }).fill("НСЖ");
  await page.reload();
  await expect(
    page.getByRole("textbox", { name: "Поиск заданий" }),
  ).toHaveValue("НСЖ");
  await expect(page.locator(".edu-task-row")).toHaveCount(1);
  await expect(page).toHaveURL(/kind=course/);
});

test('learning summary reuses dashboard profile geometry and KPI type', async ({page})=>{
 await page.goto('/?role=mass&section=home');
 const level=await page.locator('.level-card').boundingBox();
 const badge=await page.locator('.level-card__labels span').first().boundingBox();
 const kpi=await page.locator('.kpi-ring__value strong').evaluate(n=>{const s=getComputedStyle(n);return {size:s.fontSize,line:s.lineHeight,weight:s.fontWeight}});
 await page.goto(learning);
 expect((await page.locator('.level-card').boundingBox())!.height).toBe(level!.height);
 expect((await page.locator('.level-card').boundingBox())!.width).toBeCloseTo(level!.width,0);
 expect((await page.locator('.level-card__labels span').first().boundingBox())!.height).toBe(badge!.height);
 expect((await page.locator('.edu-summary').boundingBox())!.height).toBe(level!.height);
 for(const n of await page.locator('.edu-summary .edu-ring strong,.edu-summary-stat>strong').all()) {
  expect(await n.evaluate(n=>{const s=getComputedStyle(n);return {size:s.fontSize,line:s.lineHeight,weight:s.fontWeight}})).toEqual(kpi);
 }
});
