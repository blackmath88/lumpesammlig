import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// Deployed as a GitHub Pages project site, so every root-relative URL in the
// site goes through withBase() from src/data/site.ts.
export default defineConfig({
  site: 'https://blackmath88.github.io',
  base: '/lumpesammlig',
  integrations: [react()],
  vite: {
    build: {
      target: 'es2022'
    }
  }
});
