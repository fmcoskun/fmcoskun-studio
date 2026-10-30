import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The 3D layer is code-split through React.lazy (hero + showcase entry points),
// so three / R3F / drei land in async chunks and never block first paint.

// GitHub Pages serves a project site under /<repo>/; the deploy workflow passes
// the real path (also correct for a custom domain). Local dev and preview stay at /.
const base = `${(process.env.BASE_PATH ?? '').replace(/\/+$/, '')}/`;

export default defineConfig({
  base,
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
