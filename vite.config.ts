import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// `base` doit correspondre au sous-chemin d'hébergement.
// GitHub Pages sert le dépôt sous /DHPM/ ; en local et sur un domaine
// dédié, on reste à la racine.
const base = process.env.DHPM_BASE ?? '/';

export default defineConfig({
  base,
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
