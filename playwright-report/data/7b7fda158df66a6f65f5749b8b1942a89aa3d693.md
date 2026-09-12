# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tripbites.spec.ts >> news failure displays an error and retry action
- Location: tests\e2e\tripbites.spec.ts:96:5

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:3000/
Call log:
  - navigating to "http://127.0.0.1:3000/", waiting until "load"

```

# Test source

```ts
  4   |   place: "Vigan",
  5   |   recent_count: 1,
  6   |   items: [
  7   |     {
  8   |       title: "Local travel update",
  9   |       source: "Test source",
  10  |       date: "2026-09-11",
  11  |     },
  12  |   ],
  13  |   travel_relevance: "Check local updates before travel.",
  14  |   note: "Showing up to 3 recent local items from the last 7 days.",
  15  | };
  16  | 
  17  | const weatherResponse = {
  18  |   place: "Vigan",
  19  |   summary: "Warm with possible rain.",
  20  |   travel_relevance: "Weather may affect outdoor plans.",
  21  |   travel_advice: ["Carry rain protection"],
  22  | };
  23  | 
  24  | const chatResponse = {
  25  |   place: "Vigan",
  26  |   final: "Vigan looks suitable for travel today.",
  27  |   risk_level: "low",
  28  |   travel_advice: ["Check local updates before departure"],
  29  |   sources: [{ type: "weather" }, { type: "news" }],
  30  | };
  31  | 
  32  | async function mockFrontendApi(page: Page) {
  33  |   await page.route("**/api/news?place=*", async (route) => {
  34  |     await route.fulfill({ json: newsResponse });
  35  |   });
  36  | 
  37  |   await page.route("**/api/weather?place=*", async (route) => {
  38  |     await route.fulfill({ json: weatherResponse });
  39  |   });
  40  | 
  41  |   await page.route("**/api/chat", async (route) => {
  42  |     await route.fulfill({ json: chatResponse });
  43  |   });
  44  | }
  45  | 
  46  | test("frontend loads with the priority travel workflows", async ({ page }) => {
  47  |   await page.goto("/");
  48  | 
  49  |   await expect(page.getByRole("heading", { name: "TripBites" })).toBeVisible();
  50  |   await expect(
  51  |     page.getByText("Weather Outlook", { exact: true })
  52  |   ).toBeVisible();
  53  |   await expect(
  54  |     page.getByText("Local Developments", { exact: true })
  55  |   ).toBeVisible();
  56  |   await expect(page.getByText("Suggested Questions")).toBeVisible();
  57  | });
  58  | 
  59  | test("news and weather workflows display successful responses", async ({ page }) => {
  60  |   await mockFrontendApi(page);
  61  |   await page.goto("/");
  62  | 
  63  |   const cards = page.locator("section");
  64  |   const weatherCard = cards.filter({ hasText: "Weather Outlook" });
  65  |   const newsCard = cards.filter({ hasText: "Local Developments" });
  66  | 
  67  |   await weatherCard.getByPlaceholder("e.g. Vigan").fill("Vigan");
  68  |   await weatherCard.getByRole("button", { name: "Check" }).click();
  69  |   await expect(weatherCard.getByText(weatherResponse.summary)).toBeVisible();
  70  |   await expect(weatherCard.getByText("Carry rain protection")).toBeVisible();
  71  | 
  72  |   await newsCard.getByPlaceholder("e.g. Vigan").fill("Vigan");
  73  |   await newsCard.getByRole("button", { name: "Fetch" }).click();
  74  |   await expect(newsCard.getByText("Local travel update")).toBeVisible();
  75  | });
  76  | 
  77  | test("chat workflow displays the answer and travel advice", async ({ page }) => {
  78  |   await mockFrontendApi(page);
  79  |   await page.goto("/");
  80  | 
  81  |   await page
  82  |     .getByPlaceholder("Enter a travel question for this destination")
  83  |     .fill("Is it safe to travel today?");
  84  |   await page.getByRole("button", { name: "Send" }).click();
  85  | 
  86  |   await expect(page.getByText(chatResponse.final)).toBeVisible();
  87  |   await expect(page.getByText("Check local updates before departure")).toBeVisible();
  88  | });
  89  | 
  90  | test("chat prevents sending an empty question", async ({ page }) => {
  91  |   await page.goto("/");
  92  | 
  93  |   await expect(page.getByRole("button", { name: "Send" })).toBeDisabled();
  94  | });
  95  | 
  96  | test("news failure displays an error and retry action", async ({ page }) => {
  97  |   await page.route("**/api/news?place=*", async (route) => {
  98  |     await route.fulfill({
  99  |       status: 500,
  100 |       contentType: "application/json",
  101 |       body: JSON.stringify({ error: { message: "News request failed" } }),
  102 |     });
  103 |   });
> 104 |   await page.goto("/");
      |              ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:3000/
  105 | 
  106 |   const newsCard = page.locator("section").filter({ hasText: "Local Developments" });
  107 |   await newsCard.getByRole("button", { name: "Fetch" }).click();
  108 | 
  109 |   await expect(newsCard.getByText("News request failed")).toBeVisible();
  110 |   await expect(newsCard.getByRole("button", { name: "Retry" })).toBeVisible();
  111 | });
  112 | 
```