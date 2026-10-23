import glaze from "glazejs"
import type { GlazeInstance } from "glazejs"
import { createGsapAdapter } from "glazejs/gsap"
import { createMotionAdapter } from "glazejs/motion"
import { gsap } from "gsap"
import { animate, stagger } from "motion"
import "./style.css"

const examples = document.querySelector("#examples")
const engine = document.querySelector<HTMLSelectElement>("#engine")
const status = document.querySelector("#status")
if (!examples || !engine || !status)
  throw new Error("Playground markup is missing")
let instance: GlazeInstance | undefined

const play = () => {
  instance?.destroy()
  instance = glaze({
    element: examples,
    adapter:
      engine.value === "motion"
        ? createMotionAdapter({ animate, stagger })
        : createGsapAdapter(gsap),
    breakpoints: { wide: "(min-width: 640px)" },
    presets: { spin: "from:rotate-360|scale-0.5|opacity-0|duration-1" },
    defaults: { element: "duration-0.6" },
  })
  status.textContent = `Playing with ${engine.value === "motion" ? "Motion" : "GSAP"}.`
}
document.querySelector("#replay")?.addEventListener("click", play)
engine.addEventListener("change", play)
document.querySelector("#reset")?.addEventListener("click", () => {
  instance?.destroy()
  instance = undefined
  status.textContent = "Animations stopped and original styles restored."
})
window.addEventListener("pagehide", () => instance?.destroy(), { once: true })
play()
