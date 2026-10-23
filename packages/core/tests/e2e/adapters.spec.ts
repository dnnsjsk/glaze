import { expect, test } from "@playwright/test"

for (const engine of ["gsap", "motion"]) {
  test(`${engine} animates real elements and restores styles on reset`, async ({
    page,
  }) => {
    const errors: string[] = []
    page.on("pageerror", (error) => errors.push(error.message))
    await page.goto("/")
    await page.locator("#reset").click()
    const original = await page
      .locator(".tile")
      .evaluateAll((elements) =>
        elements.map((element) => element.getAttribute("style"))
      )
    expect(original).toEqual([null, null, null])
    await page.locator("#engine").selectOption(engine)
    await page.locator("#replay").click()
    await expect(page.locator("#status")).toContainText(
      engine === "motion" ? "Motion" : "GSAP"
    )
    await expect
      .poll(async () =>
        Number(
          await page
            .locator(".coral")
            .evaluate((element) => getComputedStyle(element).opacity)
        )
      )
      .toBeLessThan(0.95)
    await expect(page.locator(".coral")).toHaveCSS("opacity", "1")
    await expect
      .poll(async () =>
        page.locator(".blue").evaluate((element) => {
          const transform = new DOMMatrix(getComputedStyle(element).transform)
          return [transform.m11, transform.m12, transform.m41].map(Math.round)
        })
      )
      .toEqual([0, 1, 120])
    await expect(page.locator(".gold")).toHaveCSS("opacity", "1")
    await page.locator("#reset").click()
    await expect
      .poll(async () =>
        page
          .locator(".tile")
          .evaluateAll((elements) =>
            elements.map((element) => element.getAttribute("style"))
          )
      )
      .toEqual(original)
    await expect
      .poll(async () =>
        page
          .locator(".tile")
          .evaluateAll((elements) =>
            elements.reduce(
              (count, element) => count + element.getAnimations().length,
              0
            )
          )
      )
      .toBe(0)
    expect(errors).toEqual([])
  })
}

test("Motion responsive presets rebuild from natural CSS endpoints", async ({
  page,
}) => {
  await page.setViewportSize({ width: 500, height: 800 })
  await page.goto("/")
  await page.locator("#engine").selectOption("motion")
  await expect(page.locator(".gold")).not.toHaveAttribute("style")
  await page.setViewportSize({ width: 1000, height: 800 })
  await expect
    .poll(async () =>
      Number(
        await page
          .locator(".gold")
          .evaluate((element) => getComputedStyle(element).opacity)
      )
    )
    .toBeLessThan(0.95)
  await expect(page.locator(".gold")).toHaveCSS("opacity", "1")
  await page.setViewportSize({ width: 500, height: 800 })
  await expect(page.locator(".gold")).not.toHaveAttribute("style")
  await page.setViewportSize({ width: 1000, height: 800 })
  await expect
    .poll(async () =>
      Number(
        await page
          .locator(".gold")
          .evaluate((element) => getComputedStyle(element).opacity)
      )
    )
    .toBeLessThan(0.95)
  await expect(page.locator(".gold")).toHaveCSS("opacity", "1")
  await page.locator("#reset").click()
  await expect(page.locator(".gold")).not.toHaveAttribute("style")
})
