import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The 3D scene is code-split through React.lazy (src/features/hero/HeroVisual.tsx),
// so three / R3F / drei land in their own async chunk and never block first paint.
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2022',
    sourcemap: false,
    // three alone is ~700 kB minified; it is async, so silence the generic warning
    // but keep a ceiling that still flags accidental growth.
    chunkSizeWarningLimit: 1100,
  },
  server: {
    host: true,
  },
});
