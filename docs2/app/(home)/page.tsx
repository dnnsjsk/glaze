"use client";

import Hero from "@/components/Hero";
import HeroCode from "@/components/HeroCode.mdx";
import { Pre, CodeBlock } from "fumadocs-ui/components/codeblock";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <div className="relative mx-auto my-12 flex max-w-screen-xl flex-col items-center justify-center space-y-12 pl-[max(env(safe-area-inset-left),1.5rem)] pr-[max(env(safe-area-inset-right),1.5rem)] md:my-16 md:space-y-16 lg:my-20 lg:space-y-20 xl:my-24 xl:space-y-24">
        <div className="relative z-10 grid items-center gap-12 xl:grid-cols-[1.5fr,2fr]">
          <Hero />
          <CodeBlock className="!shadow-sm !overflow-hidden">
            <Pre className="!bg-fd-card lg:!p-8 lg:[&_*]:!text-sm">
              <HeroCode />
            </Pre>
          </CodeBlock>
        </div>
        <div className="relative z-10 grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
          {[
            {
              emoji: "🚀",
              title: "Based on GSAP",
              description:
                "Glaze is built on top of <a class='link' target='_blank' href='https://gsap.com/'>GSAP</a>, a powerful animation library that allows you to create complex animations with little code.",
            },
            {
              emoji: "🎨",
              title: "Utility inspired",
              description:
                "If you know Tailwind, you'll feel right at home with Glaze. It is inspired by its HTML- and utility-first approach.",
            },
            {
              emoji: "📱",
              title: "Breakpoints",
              description:
                "Glaze supports responsive design out of the box, allowing you to define different animations for different screen sizes.",
            },
            {
              emoji: "🔗",
              title: "Timelines",
              description:
                "Full support for timelines, allowing you to sequence multiple animations together, or run them in parallel.",
            },
            {
              emoji: "🔍",
              title: "Dot notation",
              description:
                "Use dot notation for specifying nested properties in the settings object, granting complete control over the animation.",
            },
            {
              emoji: "📚",
              title: "Library-agnostic syntax",
              description:
                "Though Glaze presently supports only GSAP, its syntax lays the groundwork for future integration with other libraries.",
            },
          ].map((item) => {
            return (
              <div
                key={item.title}
                className="space-y-2 rounded-lg shadow-sm bg-fd-card p-4 sm:rounded-xl border-fd-border border sm:p-6 lg:rounded-3xl lg:p-8"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-fd-accent text-2xl">
                  {item.emoji}
                </div>
                <h3 className="text-lg !font-semibold !mt-6">{item.title}</h3>
                <p
                  className="text-neutral-600 dark:text-neutral-400"
                  dangerouslySetInnerHTML={{ __html: item.description }}
                />
              </div>
            );
          })}
        </div>
      </div>
      <Footer />
    </>
  );
}
