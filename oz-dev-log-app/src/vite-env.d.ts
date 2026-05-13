/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 메인 API 백엔드 origin. 비우면 Vite 프록시 `/api`를 사용 */
  readonly VITE_API_URL?: string
  /** Sequelize(MySQL) 백엔드 origin. 비우면 Vite 프록시 `/sequelize`를 사용 */
  readonly VITE_SEQUELIZE_API_URL?: string
  /** Mongoose(MongoDB) 백엔드 origin. 비우면 Vite 프록시 `/mongoose`를 사용 */
  readonly VITE_MONGOOSE_API_URL?: string
  /** 첫 진입 시 사용할 백엔드 — 기본 'api' */
  readonly VITE_DEFAULT_BACKEND?: 'api' | 'sequelize' | 'mongoose'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
