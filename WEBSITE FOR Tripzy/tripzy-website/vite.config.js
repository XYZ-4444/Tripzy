import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'esbuild',
    cssCodeSplit: true,
    rollupOptions: {
      input: {
        main: 'index.html',
        explore: 'explore.html',
        hotels: 'hotels.html',
        guides: 'guides.html',
        planner: 'planner.html',
        about: 'about.html',
        login: 'login.html',
        dashboard: 'dashboard.html',
        calendar: 'calendar.html',
        vendor: 'vendor.html',
        trust: 'trust.html'
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});