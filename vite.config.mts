import { defineConfig } from 'vite';
import { dependencies } from './package.json';

export default defineConfig({
  envDir: 'env',
  build: {
    minify: false,
    rollupOptions: {
      preserveEntrySignatures: 'strict',
      input: './src/extension.ts',
      external: [
        ...Object.keys(dependencies),
        'vscode',
        'fs',
        'path'
      ],
      output: {
        dir: 'out',
        format: 'cjs',
        preserveModules: true,
        entryFileNames: '[name].js'
      }
    }
  }
});