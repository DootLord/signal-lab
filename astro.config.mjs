import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  // Coolify's proxy terminates TLS, so Astro's built-in origin check would compare
  // https:// against http://. src/middleware.ts does an equivalent same-host check.
  security: { checkOrigin: false },
  vite: {
    ssr: { external: ['node:sqlite'] },
  },
});
