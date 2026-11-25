import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 850,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'three-core',
              test: /[\\/]node_modules[\\/]three[\\/]/,
              priority: 20,
            },
            {
              name: 'r3f-ecosystem',
              test: /[\\/]node_modules[\\/](@react-three|three-stdlib|camera-controls)[\\/]/,
              priority: 15,
            },
            {
              name: 'ui-vendor',
              test: /[\\/]node_modules[\\/](react|react-dom|motion|lucide-react)[\\/]/,
              priority: 10,
            },
          ],
        },
      },
    },
  },
})
