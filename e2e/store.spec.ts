import { test, expect } from "@playwright/test";

const LIME_PNG = "iVBORw0KGgoAAAANSUhEUgAAAGAAAABAAQMAAADf+uBNAAAAIGNIUk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAAADUExURaPmNSLTTqoAAAAHdElNRQfqCxoROQu3zYnbAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDI2LTExLTI2VDE3OjU3OjExKzAwOjAwUm8lcAAAACV0RVh0ZGF0ZTptb2RpZnkAMjAyNi0xMS0yNlQxNzo1NzoxMSswMDowMCMyncwAAAAodEVYdGRhdGU6dGltZXN0YW1wADIwMjYtMTEtMjZUMTc6NTc6MTErMDA6MDB0J7wTAAAAEElEQVQoz2NgGAWjYBSQCwADQAABTT9aBwAAAABJRU5ErkJggg==";

test("landing page has the two calls to action and no shop", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.getByRole("link", { name: /see our catalogue/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /build your bike/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /shop/i })).toHaveCount(0);
});

test("catalogue shows base prices with optional upgrades and links into the builder", async ({ page }) => {
  await page.goto("/collection", { waitUntil: "networkidle" }); // old URL redirects
  await expect(page).toHaveURL(/\/catalogue/);
  await expect(page.getByTestId("product-card")).toHaveCount(4);
  const firstRiders = page.getByRole("article", { name: "First riders", exact: true });
  await firstRiders.getByRole("button", { name: '14"', exact: true }).click();
  await expect(firstRiders.getByRole("img")).toHaveAttribute("src", /bike-14in/);
  await expect(firstRiders.getByText("R520.00")).toBeVisible();
  await expect(firstRiders.getByTestId("upgrades")).toContainText("+R175.00");
  await expect(page.getByRole("button", { name: /add to cart/i })).toHaveCount(0);
  await firstRiders.getByRole("link", { name: "Customise this build" }).click();
  await expect(page).toHaveURL(/\/build/);
});

test("configurator steps, 26in 28-speed, decal and cart/WhatsApp", async ({ page }) => {
  await page.goto("/build", { waitUntil: "networkidle" });
  await page.getByTestId("size-26").click();
  await expect(page.getByTestId("live-price")).toHaveText("R1,890.00");
  for (const t of ["Frame style", "Front fork", "Handlebars", "Gears & drive"]) {
    await page.getByTestId("next").click();
    await expect(page.getByTestId("step-title")).toHaveText(t);
  }
  await page.getByTestId("drive28").click();
  await expect(page.getByTestId("live-price")).toHaveText("R2,240.00");
  for (let k = 0; k < 3; k++) await page.getByTestId("next").click();
  await page.getByTestId("decal-input").fill("Thando");
  await expect(page.getByTestId("live-price")).toHaveText("R2,290.00");
  await page.getByTestId("next").click();
  await expect(page.getByTestId("step-title")).toHaveText("Summary");
  await page.getByTestId("add-to-cart").click();
  await page.getByTestId("cart-link").click();
  await expect(page.getByTestId("cart-total")).toHaveText("R2,290.00");
  const href = await page.getByTestId("whatsapp-order").getAttribute("href");
  expect(href).toContain("wa.me/");
  expect(decodeURIComponent(href ?? "")).toContain("28-speed");
});

test("pasted illegal URL is clamped", async ({ page }) => {
  await page.goto("/build?step=fork&config=size:27.5~frame:yframe", { waitUntil: "networkidle" });
  await expect(page.getByTestId("step-title")).toHaveText("Handlebars");
  await expect(page.getByTestId("live-price")).toHaveText("R3,250.00");
});

test("in-site AI connect, auth error, then mockup", async ({ page }) => {
  let calls = 0;
  await page.route("https://api.openai.com/**", (route) => {
    calls++;
    if (calls === 1) return route.fulfill({ status: 401, body: "{}" });
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [{ b64_json: LIME_PNG }] }) });
  });
  await page.goto("/build?step=summary&config=size:20", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Connect ChatGPT/ }).click();
  await page.getByLabel("API key").fill("sk-test-1234567890");
  await page.getByRole("button", { name: "Connect & generate" }).click();
  await expect(page.getByRole("alert")).toContainText("rejected");
  expect(page.url()).not.toContain("sk-test");
  await page.getByRole("button", { name: "Generate mockup" }).click();
  await expect(page.getByAltText("AI-generated mockup of your build")).toBeVisible();
  await expect(page.getByText("AI-generated illustration. Final build follows your saved spec.").first()).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByTestId("download-image").click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^vavavoom-.*\.png$/);
  expect(await download.failure()).toBeNull();
  await page.getByRole("button", { name: "Disconnect" }).click();
  await expect(page.getByRole("button", { name: /Connect ChatGPT/ })).toBeVisible();
});

test("full package is R750 on a 20in", async ({ page }) => {
  await page.goto("/build?step=brakes&config=size:20", { waitUntil: "networkidle" });
  await page.getByTestId("package").click();
  await expect(page.getByTestId("live-price")).toHaveText("R2,040.00");
});
