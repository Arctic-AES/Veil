import { defineConfig, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  return {
    plugins: [
      react(),
      command === 'serve' ? {
        name: 'cjs-to-esm-plugin',
        transform(code: string, id: string) {
          if (id.endsWith('.cjs')) {
            const transformed = code
              .replace(/module\.exports\s*=\s*\{\s*Eligibility\s*\};?/g, 'export { Eligibility };')
              .replace(/module\.exports\.Eligibility\s*=\s*Eligibility;?/g, 'export { Eligibility };');
            return {
              code: transformed,
              map: null
            };
          }
        }
      } : null
    ].filter(Boolean) as PluginOption[],
    server: {
      port: 5173,
      open: true,
    },
  };
})
