import { defineConfig } from 'astro/config';
import preact from "@astrojs/preact";
import icon from "astro-icon";

const tailwind = await import("@astrojs/tailwind");

// https://astro.build/config
export default defineConfig({
  output: "static",

  integrations: [preact(), tailwind.default(), icon({
    include: {
      mdi: ["*"],
    }
  })],
});
