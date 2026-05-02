import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  integrations: [react()],
  vite: {
    plugins: [
      legacy({
        targets: ['chrome >= 39'], // Ajuste de compatibilidad para RK3288
        additionalLegacyPolyfills: ['regenerator-runtime/runtime']
      })
    ]
  }
});