import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    watch: {
      // Tiled locks this file while the editor is open. Watching it can crash
      // Vite on Windows with EBUSY, even though it is not part of the game.
      ignored: ['**/*.tiled-session', '**/*.tiled-session.lock'],
    },
  },
});
