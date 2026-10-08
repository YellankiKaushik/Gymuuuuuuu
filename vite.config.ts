import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  resolve: {
    alias: [{ find: /^zod$/, replacement: fileURLToPath(new URL('./src/config/validation.ts', import.meta.url)) }],
  },
  plugins: [tailwindcss(), tanstackStart(), nitro(), react()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'validation-library', test: /node_modules[\\/]zod[\\/]/ },
            {
              name: (id) => `route-${id.match(/src[\\/]routes[\\/]([a-z-]+)/)?.[1] ?? 'other'}`,
              test: /src[\\/]routes[\\/].*[?&]tsr-split=/,
              includeDependenciesRecursively: false,
            },
          ],
        },
      },
    },
  },
  server: { host: '127.0.0.1', port: 3000 },
})
