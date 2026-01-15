import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plugins: [react() as any],
  // @ts-expect-error - Vitest types conflict with Vite 7
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
})

