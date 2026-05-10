/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Sequelize(MySQL) 백엔드 origin. 비우면 Vite 프록시 `/sequelize`를 사용 */
  readonly VITE_SEQUELIZE_API_URL?: string
  /** Mongoose(MongoDB) 백엔드 origin. 비우면 Vite 프록시 `/mongoose`를 사용 */
  readonly VITE_MONGOOSE_API_URL?: string
  /** 첫 진입 시 사용할 백엔드 ('sequelize' | 'mongoose') */
  readonly VITE_DEFAULT_BACKEND?: 'sequelize' | 'mongoose'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
