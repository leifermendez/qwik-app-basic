import { component$, useStyles$ } from "@builder.io/qwik";
import { QwikCity, RouterOutlet } from "@builder.io/qwik-city";
import { Head } from "./components/head/head";
import Header from "./components/header";

import style from "./global.css";

export default component$(() => {
  useStyles$(style);
  return (
    <QwikCity>
      <Head />
      <body lang="en">
        <Header />
        <RouterOutlet />
      </body>
    </QwikCity>
  );
});
