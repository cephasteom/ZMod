import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    minify: false,
    rollupOptions: {
      external: ['zmod'],
    },
    lib: {
      entry: path.resolve(process.cwd(), 'lib/index.ts'),
      name: 'zmod',
      fileName: (format) => `zmod.${format}.js`,
    }
  }
});