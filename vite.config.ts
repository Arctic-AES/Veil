import { defineConfig, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from 'vite-plugin-wasm'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  return {
    plugins: [
      react(),
      wasm(),
      command === 'serve'
        ? ({
            name: 'cjs-to-esm-plugin',
            transform(code: string, id: string) {
              if (id.endsWith('.cjs')) {
                const transformed = code
                  .replace(/module\.exports\s*=\s*\{\s*Eligibility\s*\};?/g, 'export { Eligibility };')
                  .replace(/module\.exports\.Eligibility\s*=\s*Eligibility;?/g, 'export { Eligibility };')
                return {
                  code: transformed,
                  map: null,
                }
              }
            },
          } as PluginOption)
        : null,
    ].filter(Boolean) as PluginOption[],
    server: {
      port: 5173,
      open: true,
    },
    optimizeDeps: {
      exclude: [
        '@midnight-ntwrk/compact-runtime',
        '@midnight-ntwrk/onchain-runtime-v3',
      ],
      include: [
        'object-inspect',
      ],
    },
    build: {
      target: 'esnext',
    },
  }
})
