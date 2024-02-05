import "../src/style.css";
import { Glaze } from "../../dist/glaze.es";
import { gsap } from "gsap";
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function ({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    const { ScrollTrigger } = require("gsap/ScrollTrigger");
    gsap.registerPlugin(ScrollTrigger);

    const init = () => {
      new Glaze({
        gsap: { core: gsap },
        breakpoints: {
          sm: "(min-width: 640px)",
          lg: "(min-width: 1024px)",
        },
      });
    };

    init();

    router.events.on("routeChangeComplete", init);
    return () => {
      router.events.off("routeChangeComplete", init);
    };
  }, []);

  return (
    <main>
      <Component {...pageProps} />
    </main>
  );
};
