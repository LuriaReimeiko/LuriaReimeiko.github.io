import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://luriareimeiko.github.io',
  output: 'static',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr', 'ja'],
    routing: {
      prefixDefaultLocale: false
    }
  }
});