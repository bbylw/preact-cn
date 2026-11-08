import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig(({ mode }) => ({
  // GitHub Pages serves project sites under /<repo>/, while local preview uses /.
  base: mode === 'pages' ? '/preact-cn/' : '/',
  plugins: [preact()],
  // README 里提到的 preact/compat 别名：React 生态代码无需改写即可运行
  resolve: {
    alias: [
      { find: /^react-dom\/(.*)$/, replacement: 'preact/compat/$1' },
      { find: /^react-dom$/, replacement: 'preact/compat' },
      { find: /^react\/jsx-runtime$/, replacement: 'preact/jsx-runtime' },
      { find: /^react$/, replacement: 'preact/compat' },
    ],
  },
  build: {
    target: 'es2022',
    cssCodeSplit: false,
  },
}));
