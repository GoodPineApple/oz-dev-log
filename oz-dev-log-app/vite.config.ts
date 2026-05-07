import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// `VITE_API_BASE_URL`이 비어 있을 때만 상대 경로 요청이 이 프록시를 탑니다.
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  server: {
    proxy: {
      '/users': { target: 'http://localhost:3000', changeOrigin: true },
      '/logs': { target: 'http://localhost:3000', changeOrigin: true },
      '/credit-transactions': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
