import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import glaze from "./src";

gsap.registerPlugin(ScrollTrigger);

const { timelines } = glaze({
  breakpoints: {
    default: "(min-width: 640px)",
    lg: "(min-width: 1024px)",
  },
  lib: {
    gsap: { core: gsap },
  },
  className: "animate",
  watch: true,
  presets: {
    helicopter:
      "from:rotate-2160 to:rotate-45|x-500|background-yellow|duration-3",
  },
  defaults: {
    tl: "defaults:duration-3",
  },
});

const tlLast = timelines[timelines.length - 1];
const tlFirst = timelines[0];

let indexFirst = 0;
for (const [element] of tlFirst.elements) {
  indexFirst++;
  if (indexFirst !== 3) continue;

  setTimeout(() => {
    const clone = element.cloneNode(true);
    document.body.appendChild(clone);
  }, 1000);
}

let indexLast = 0;
for (const [element] of tlLast.elements) {
  indexLast++;
  if (!element) continue;

  setTimeout(() => {
    const clone = element.children[0].cloneNode(true);
    element.appendChild(clone);
  }, 2000);

  const animateObject = element.getAttribute("data-animate");
  if (animateObject) {
    element.setAttribute(
      "data-animate",
      animateObject.replace("yellow", "pink"),
    );
  }
  const classes = element.getAttribute("class") || "";
  if (classes) {
    element.setAttribute("class", classes.replace("yellow", "pink"));
  }
}

setTimeout(() => {
  const element = document.createElement("div");
  element.classList.add(
    "tl-seven",
    "box",
    "animate-@lg:to:x-500|duration-3|background-fuchsia|ease-power2.inOut",
  );
  document.body.appendChild(element);
}, 3000);
