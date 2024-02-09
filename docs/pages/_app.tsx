import "../src/style.css";
import { Analytics } from "@vercel/analytics/react";
import { AppProps } from "next/app";

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <main>
        <Component {...pageProps} />
      </main>
      <Analytics />
    </>
  );
};

export default App;
