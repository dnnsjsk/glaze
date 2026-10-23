import { test, expect as baseExpect, type Page } from "@playwright/test"

test.setTimeout(30000)
const expect = baseExpect.configure({ timeout: 12000 })

const goToPage = async (page: Page) => page.goto("/legacy/")

test("no animations below 640px", async ({ page }) => {
  await page.setViewportSize({ width: 639, height: 480 })
  await goToPage(page)
  await expect(page.locator(".tl-seven")).toHaveCount(1)
  await expect(page.locator("[style]")).toHaveCount(0)
})

test.describe("timeline", () => {
  test("preset has correct values", async ({ page }) => {
    await goToPage(page)

    const elements = page.locator(".tl-preset")
    const count = await elements.count()

    expect(count).toBe(1)

    await expect(elements).toHaveCSS(
      "transform",
      "matrix(0.707107, 0.707107, -0.707107, 0.707107, 500, 0)"
    )
    await expect(elements).toHaveCSS("background-color", "rgb(255, 255, 0)")
  })

  test("main has correct values", async ({ page }) => {
    await goToPage(page)

    const elements = page.locator("[class*='tl-main']")
    await expect(elements).toHaveCount(6)
    const count = await elements.count()

    expect(count).toBe(6)

    for (let i = 0; i < count; i++) {
      await expect(elements.nth(i)).toHaveCSS(
        "transform",
        "matrix(1, 0, 0, 1, 500, 0)"
      )
      await expect(elements.nth(i)).toHaveCSS(
        "background-color",
        "rgb(255, 0, 0)"
      )
    }
  })

  test.describe("two", () => {
    test("has correct values", async ({ page }) => {
      await goToPage(page)
      await page.setViewportSize({ width: 768, height: 768 })

      const elements = page.locator(".tl-two")
      const count = await elements.count()

      for (let i = 0; i < count; i++) {
        await expect(elements.nth(i)).toHaveCSS(
          "transform",
          "matrix(1, 0, 0, 1, 500, 0)"
        )
        await expect(elements.nth(i)).toHaveCSS(
          "background-color",
          "rgb(0, 0, 255)"
        )
      }
    })

    test("has correct values bigger than 1024", async ({ page }) => {
      await goToPage(page)

      const elements = page.locator(".tl-two")
      const count = await elements.count()

      for (let i = 0; i < count; i++) {
        await expect(elements.nth(i)).toHaveCSS(
          "transform",
          "matrix(1, 0, 0, 1, 500, 0)"
        )
        await expect(elements.nth(i)).toHaveCSS(
          "background-color",
          i === 0 ? "rgb(0, 0, 255)" : "rgb(0, 0, 128)"
        )
      }
    })
  })

  test.describe("three", () => {
    test("has correct values", async ({ page }) => {
      await goToPage(page)
      await page.setViewportSize({ width: 768, height: 768 })

      const elements = page.locator(".tl-three")
      const count = await elements.count()

      for (let i = 0; i < count; i++) {
        await expect(elements.nth(i)).toHaveCSS(
          "transform",
          "matrix(1, 0, 0, 1, 500, 0)"
        )
        await expect(elements.nth(i)).toHaveCSS(
          "background-color",
          "rgb(0, 128, 0)"
        )
      }
    })
  })

  ;["four", "five"].forEach((timeline) => {
    test.describe(timeline, () => {
      test("has correct values", async ({ page }) => {
        await goToPage(page)
        await page.setViewportSize({ width: 768, height: 768 })

        const elements = page.locator(`.tl-${timeline}`)
        const count = await elements.count()

        for (let i = 0; i < count; i++) {
          await expect(elements.nth(i)).toHaveCSS(
            "transform",
            "matrix(1, 0, 0, 1, 500, 0)"
          )
          await expect(elements.nth(i)).toHaveCSS(
            "background-color",
            "rgb(255, 255, 0)"
          )
        }
      })

      test("has correct values bigger than 1024", async ({ page }) => {
        await goToPage(page)

        const elements = page.locator(`.tl-${timeline}`)
        const count = await elements.count()

        for (let i = 0; i < count; i++) {
          await expect(elements.nth(i)).toHaveCSS(
            "transform",
            "matrix(1, 0, 0, 1, 500, 0)"
          )
          await expect(elements.nth(i)).toHaveCSS(
            "background-color",
            "rgb(128, 0, 128)"
          )
        }
      })
    })
  })

  test.describe("six", () => {
    test("has correct values", async ({ page }) => {
      await goToPage(page)

      const elements = () => page.locator(".tl-six .box")
      await expect(elements()).toHaveCount(4)
      const count = await elements().count()

      expect(count).toBe(4)

      for (let i = 0; i < count; i++) {
        await expect(elements().nth(i)).toHaveCSS(
          "transform",
          "matrix(1, 0, 0, 1, 0, 0)"
        )
        await expect(elements().nth(i)).toHaveCSS(
          "background-color",
          "rgb(0, 0, 0)"
        )
      }

      await page.setViewportSize({ width: 768, height: 768 })
      await page.waitForTimeout(1000)
      await page.setViewportSize({ width: 1280, height: 768 })

      for (let i = 0; i < count; i++) {
        await expect(elements().nth(i)).toHaveCSS(
          "transform",
          "matrix(1, 0, 0, 1, 0, 0)"
        )
        await expect(elements().nth(i)).toHaveCSS(
          "background-color",
          "rgb(0, 0, 0)"
        )
      }
    })
  })

  test.describe("seven", () => {
    test("has correct values", async ({ page }) => {
      await goToPage(page)

      const elements = page.locator(".tl-seven")
      await expect(elements).toHaveCount(1)
      const count = await elements.count()

      expect(count).toBe(1)

      await expect(elements).toHaveCSS(
        "transform",
        "matrix(1, 0, 0, 1, 500, 0)"
      )
      await expect(elements).toHaveCSS("background-color", "rgb(255, 0, 255)")
    })
  })
})
