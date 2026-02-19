import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind()],
  output: 'static',  // Cloudflare Pages — HTML estático + JS mínimo
  outDir: '../dist', // Cloudflare Pages busca "dist" en la raíz del repo
});
