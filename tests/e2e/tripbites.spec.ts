import { expect, test, type Page } from "@playwright/test";

const newsResponse = {
  place: "Vigan",
  recent_count: 1,
  items: [
    {
      title: "Local travel update",
      source: "Test source",
      date: "2026-09-11",
    },
  ],
  travel_relevance: "Check local updates before travel.",
  note: "Showing up to 3 recent local items from the last 7 days.",
};

const weatherResponse = {
  place: "Vigan",
  summary: "Warm with possible rain.",
  travel_relevance: "Weather may affect outdoor plans.",
  travel_advice: ["Carry rain protection"],
};

const chatResponse = {
  place: "Vigan",
  final: "Vigan looks suitable for travel today.",
  risk_level: "low",
  travel_advice: ["Check local updates before departure"],
  sources: [{ type: "weather" }, { type: "news" }],
};

async function mockFrontendApi(page: Page) {
  await page.route("**/api/news?place=*", async (route) => {
    await route.fulfill({ json: newsResponse });
  });

  await page.route("**/api/weather?place=*", async (route) => {
    await route.fulfill({ json: weatherResponse });
  });

  await page.route("**/api/chat", async (route) => {
    await route.fulfill({ json: chatResponse });
  });
}

test("frontend loads with the priority travel workflows", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "TripBites" })).toBeVisible();
  await expect(
    page.getByText("Weather Outlook", { exact: true })
  ).toBeVisible();
  await expect(
    page.getByText("Local Developments", { exact: true })
  ).toBeVisible();
  await expect(page.getByText("Suggested Questions")).toBeVisible();
});

test("news and weather workflows display successful responses", async ({
  page,
}) => {
  await mockFrontendApi(page);
  await page.goto("/");

  const cards = page.locator("section");
  const weatherCard = cards.filter({ hasText: "Weather Outlook" });
  const newsCard = cards.filter({ hasText: "Local Developments" });

  await weatherCard.getByPlaceholder("e.g. Vigan").fill("Vigan");
  await weatherCard.getByRole("button", { name: "Check" }).click();
  await expect(weatherCard.getByText(weatherResponse.summary)).toBeVisible();
  await expect(weatherCard.getByText("Carry rain protection")).toBeVisible();

  await newsCard.getByPlaceholder("e.g. Vigan").fill("Vigan");
  await newsCard.getByRole("button", { name: "Fetch" }).click();
  await expect(newsCard.getByText("Local travel update")).toBeVisible();
});

test("chat workflow displays the answer and travel advice", async ({
  page,
}) => {
  await mockFrontendApi(page);
  await page.goto("/");

  await page
    .getByPlaceholder("Enter a travel question for this destination")
    .fill("Is it safe to travel today?");
  await page.getByRole("button", { name: "Send" }).click();

  await expect(page.getByText(chatResponse.final)).toBeVisible();
  await expect(
    page.getByText("Check local updates before departure")
  ).toBeVisible();
});

test("chat prevents sending an empty question", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("button", { name: "Send" })).toBeDisabled();
});

test("news failure displays an error and retry action", async ({ page }) => {
  await page.route("**/api/news?place=*", async (route) => {
    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ error: { message: "News request failed" } }),
    });
  });
  await page.goto("/");

  const newsCard = page
    .locator("section")
    .filter({ hasText: "Local Developments" });
  await newsCard.getByRole("button", { name: "Fetch" }).click();

  await expect(newsCard.getByText("News request failed")).toBeVisible();
  await expect(newsCard.getByRole("button", { name: "Retry" })).toBeVisible();
});
