import "../src/style.css";

const App = ({ Component, pageProps }) => {
  return (
    <main>
      <Component {...pageProps} />
    </main>
  );
};

export default App;
