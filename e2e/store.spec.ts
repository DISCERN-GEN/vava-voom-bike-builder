import { test, expect } from "@playwright/test";

const LIME_PNG = "iVBORw0KGgoAAAANSUhEUgAAAGAAAABAAQMAAADf+uBNAAAAIGNIUk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAAADUExURaPmNSLTTqoAAAAHdElNRQfqCxoROQu3zYnbAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDI2LTExLTI2VDE3OjU3OjExKzAwOjAwUm8lcAAAACV0RVh0ZGF0ZTptb2RpZnkAMjAyNi0xMS0yNlQxNzo1NzoxMSswMDowMCMyncwAAAAodEVYdGRhdGU6dGltZXN0YW1wADIwMjYtMTEtMjZUMTc6NTc6MTErMDA6MDB0J7wTAAAAEElEQVQoz2NgGAWjYBSQCwADQAABTT9aBwAAAABJRU5ErkJggg==";

test("storefront browse, filter and add to cart", async ({ page }) => {
  await page.goto("/collection");
  await expect(page.getByTestId("product-card")).toHaveCount(3);
  await page.getByRole("tab", { name: "Kids" }).click();
  await expect(page.getByTestId("product-card")).toHaveCount(1);
  await page.getByRole("button", { name: "Add to cart" }).click();
  await expect(page.getByTestId("cart-count")).toHaveText("1");
});

test("configurator steps, 26in 28-speed, decal and cart/WhatsApp", async ({ page }) => {
  await page.goto("/build");
  await page.getByTestId("size-26").click();
  await expect(page.getByTestId("live-price")).toHaveText("R1,890.00");
  for (const t of ["Frame style", "Front fork", "Handlebars", "Wheels & brakes", "Drivetrain"]) {
    await page.getByTestId("next").click();
    await expect(page.getByTestId("step-title")).toHaveText(t);
  }
  await page.getByTestId("drive28").click();
  await expect(page.getByTestId("live-price")).toHaveText("R2,240.00");
  await page.getByTestId("next").click();
  await page.getByTestId("next").click();
  await page.getByTestId("decal-input").fill("Thando");
  await expect(page.getByTestId("live-price")).toHaveText("R2,290.00");
  await page.getByTestId("next").click();
  await expect(page.getByTestId("step-title")).toHaveText("Summary");
  await page.getByTestId("add-to-cart").click();
  await page.getByTestId("cart-link").click();
  await expect(page.getByTestId("cart-total")).toHaveText("R2,290.00");
  const href = await page.getByTestId("whatsapp-order").getAttribute("href");
  expect(href).toContain("wa.me/");
  expect(decodeURIComponent(href!)).toContain("28-speed");
});

test("pasted illegal URL is clamped", async ({ page }) => {
  await page.goto("/build?step=fork&config=size:27.5~frame:yframe");
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
  await page.goto("/build?step=summary&config=size:20");
  await page.getByRole("button", { name: /Connect ChatGPT/ }).click();
  await page.getByLabel("API key").fill("sk-test-1234567890");
  await page.getByRole("button", { name: "Connect & generate" }).click();
  await expect(page.getByRole("alert")).toContainText("rejected");
  expect(page.url()).not.toContain("sk-test");
  await page.getByRole("button", { name: "Generate mockup" }).click();
  await expect(page.getByAltText("AI-generated mockup of your build")).toBeVisible();
  await expect(page.getByText("AI-generated illustration. Final build follows your saved spec.").first()).toBeVisible();
  await page.getByRole("button", { name: "Disconnect" }).click();
  await expect(page.getByRole("button", { name: /Connect ChatGPT/ })).toBeVisible();
});
