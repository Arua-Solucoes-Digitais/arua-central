/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** "1" only in the static demo build (npm run build:demo). */
  readonly VITE_ARUA_STATIC_DEMO?: string;
  readonly VITE_ARUA_PUBLIC_SITE?: string;
}
