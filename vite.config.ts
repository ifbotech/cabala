import { defineConfig } from 'vite';

// CÁBALA se publica estática en GitHub Pages bajo /cabala/. En desarrollo y en la QA se sirve desde la raíz.
export default defineConfig(({ command }) => ({
  root: '.',
  base: command === 'build' ? '/cabala/' : '/',
  build: {
    outDir: 'dist/web',
    emptyOutDir: true,
    target: 'es2022',
    chunkSizeWarningLimit: 800,
    rolldownOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/three')) return 'vendor-three';
          return undefined;
        },
      },
    },
  },
  server: { port: 5183, strictPort: true },
  preview: { port: 5184, strictPort: true },
}));
