import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    optimizeDeps: {
      include: ['three', 'three-globe'],
    },
    server: {
      proxy: {
        '/api/countries': {
          target: 'https://www.restcountries.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/countries/, '/v3.1'),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              if (env.VITE_COUNTRIES_API_KEY) {
                proxyReq.setHeader('X-Api-Key', env.VITE_COUNTRIES_API_KEY)
              }
            })
          },
        },
        '/api/finnhub': {
          target: 'https://finnhub.io/api/v1',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/finnhub/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              const token = env.VITE_FINNHUB_API_KEY || 'demo'
              const sep = proxyReq.path.includes('?') ? '&' : '?'
              proxyReq.path += `${sep}token=${encodeURIComponent(token)}`
            })
          },
        },
      },
    },
  }
})
