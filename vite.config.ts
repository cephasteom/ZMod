import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(process.cwd(), 'lib/main.ts'),
      name: 'zen-blocks',
      fileName: (format) => `zen-blocks.${format}.js`,
    }
  }
});