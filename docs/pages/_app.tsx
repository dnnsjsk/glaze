import "../src/style.css";
import { AppProps } from "next/app";

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <main>
        <Component {...pageProps} />
      </main>
    </>
  );
};

export default App;
