import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

// 두 백엔드를 동시에 띄우고 접두사로 라우팅한다:
//   /sequelize/*  → http://localhost:3001 (MySQL + Sequelize)
//   /mongoose/*   → http://localhost:3002 (MongoDB + Mongoose)
// 프론트엔드는 `apiUrl(backend, '/users')` 형태로 호출하면 위 프록시를 탄다.
// 빌드/배포 시에는 .env의 VITE_SEQUELIZE_API_URL / VITE_MONGOOSE_API_URL을 채워
// 브라우저가 절대 URL로 직접 호출하도록 한다(백엔드 CORS 허용 필요).
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  server: {
    proxy: {
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
