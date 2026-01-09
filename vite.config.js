import { defineConfig } from 'vite';

export default defineConfig({
    base: '/ToonMe-Mirror/', // Matches your repository name
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
    }
});
