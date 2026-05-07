/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** API origin (예: https://api.example.com). 비우면 상대 경로 + Vite 프록시 */
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
