/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_API_BASEURL: string
  readonly VITE_APP_BASE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}