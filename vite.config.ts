import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";
import tsConfigPaths from "vite-tsconfig-paths";

// Static demo build (npm run build:demo → GitHub Pages): no server, no database.
const STATIC_DEMO = process.env["VITE_ARUA_STATIC_DEMO"] === "1";
const DEMO_BASE = process.env["ARUA_DEMO_BASE"] ?? "/arua-central/";
const REAL_API = fileURLToPath(new URL("./src/lib/api.ts", import.meta.url));
const DEMO_API = fileURLToPath(new URL("./src/demo/api.ts", import.meta.url));

// Every import of src/lib/api.ts (by alias or relative path) gets the demo stand-in.
function staticDemoApi(): Plugin {
  return {
    name: "arua-static-demo-api",
    enforce: "pre",
    async resolveId(source, importer, options) {
      if (!importer || importer === DEMO_API) return null;
      const resolved = await this.resolve(source, importer, { ...options, skipSelf: true });
      return resolved?.id === REAL_API ? DEMO_API : null;
    },
  };
}

export default defineConfig(({ command }) => ({
  ...(STATIC_DEMO ? { base: DEMO_BASE } : {}),
  // 127.0.0.1: o site abre só neste computador, não para quem estiver na mesma rede.
  server: { host: "127.0.0.1", port: 8080, strictPort: true },
  resolve: {
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
    ],
  },
  plugins: [
    ...(STATIC_DEMO ? [staticDemoApi()] : []),
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      server: { entry: "server" },
      // Impede o build se código de src/server for parar no navegador.
      importProtection: { behavior: "error", client: { files: ["**/server/**"] } },
      ...(STATIC_DEMO
        ? {
            prerender: {
              enabled: true,
              crawlLinks: true,
              autoSubfolderIndex: true,
              failOnError: true,
            },
          }
        : {}),
    }),
    // The demo is prerendered to static files, so it skips the Node server (Nitro).
    ...(command === "build" && !STATIC_DEMO ? [nitro({ preset: "node-server" })] : []),
    viteReact(),
  ],
}));
