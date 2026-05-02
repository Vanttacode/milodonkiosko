import { defineConfig, fontProviders } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import legacy from '@vitejs/plugin-legacy'; // <-- 1. IMPORTACIÓN AÑADIDA

export default defineConfig({
  // Inyectamos React para la interactividad del carrito
  integrations: [react()],

  // Configuramos Tailwind y el Transpilador Legacy
  vite: {
    plugins: [
      tailwindcss(),
      // <-- 2. EL SALVAVIDAS PARA EL PANTALLAZO BLANCO EN RK3288 -->
      legacy({
        targets: ['chrome >= 39', 'android >= 5.1'],
        additionalLegacyPolyfills: ['regenerator-runtime/runtime']
      })
    ],
  },

  // 1. BLINDAJE DE SEGURIDAD (CSP)
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data: https:", 
        "connect-src 'self' https://*.supabase.co" 
      ],
    },
  },

  // 2. RENDIMIENTO DE HARDWARE (RK3288)
  experimental: {
    queuedRendering: {
      enabled: true, 
    },
  },

  // 3. TIPOGRAFÍAS OFFLINE-FIRST
  fonts: [
    {
      name: 'Roboto',
      cssVariable: '--font-roboto',
      provider: fontProviders.fontsource(),
    },
  ],
});