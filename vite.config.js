import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: { game: 'index.html', terminal: 'prototype-ui/computer-ui-preview.html' },
    },
  },
  server: {
    // Temporary Quick Tunnel testing; opt in only in the Vite terminal.
    allowedHosts: process.env.VITE_QUICK_TUNNEL === 'true' ? ['.trycloudflare.com'] : [],
    watch: {
      // Tiled locks this file while the editor is open. Watching it can crash
      // Vite on Windows with EBUSY, even though it is not part of the game.
      ignored: ['**/*.tiled-session', '**/*.tiled-session.lock'],
    },
  },
});
