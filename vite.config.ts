import { defineConfig } from 'vite';

// GitHub Pages serves the app at /rxjs-operator-trees/; dev stays at /.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/rxjs-operator-trees/' : '/',
}));
