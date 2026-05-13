import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

// 세 백엔드에 대한 개발용 프록시 (VITE_*_API_URL 이 비어 있을 때만 사용):
//   /api/*        → http://localhost:3000 (메인 API, JWT 인증)
//   /sequelize/*  → http://localhost:3001 (MySQL + Sequelize, 비교용)
//   /mongoose/*   → http://localhost:3002 (MongoDB + Mongoose, 비교용)
//
// 빌드/배포 시에는 .env 의 VITE_API_URL / VITE_SEQUELIZE_API_URL / VITE_MONGOOSE_API_URL 을
// 채워 브라우저가 절대 URL로 직접 호출하도록 한다(각 백엔드 CORS 허용 필요).
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/sequelize': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/sequelize/, ''),
      },
      '/mongoose': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/mongoose/, ''),
      },
    },
  },
})
