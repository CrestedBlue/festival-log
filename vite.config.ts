/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { minimal2023Preset } from '@vite-pwa/assets-generator/config'
import { VitePWA } from 'vite-plugin-pwa'

const OSM_TILES = 'https://tile.openstreetmap.org'
const FONT_ORIGINS = ['https://cdn.jsdelivr.net', 'https://fonts.googleapis.com', 'https://fonts.gstatic.com']
const DAY_SECONDS = 60 * 60 * 24
const ICON_BACKGROUND = '#1c1726'

// icon.svg is full-bleed with the mark inside the maskable safe zone, so skip the preset's white padding.
const ICON_PRESET = {
  ...minimal2023Preset,
  maskable: { ...minimal2023Preset.maskable, padding: 0, resizeOptions: { background: ICON_BACKGROUND } },
  apple: { ...minimal2023Preset.apple, padding: 0, resizeOptions: { background: ICON_BACKGROUND } },
}
// Workbox serializes matchers into sw.js, so they must be self-contained regexes (no closure variables).
const OSM_TILE_PATTERN = /^https:\/\/tile\.openstreetmap\.org\//
const FONT_PATTERN = /^https:\/\/(cdn\.jsdelivr\.net|fonts\.googleapis\.com|fonts\.gstatic\.com)\//

// GitHub Pages serves from /<repo>/, so the deploy workflow passes BASE_PATH.
const base = process.env.BASE_PATH ?? '/'

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self'",
  `style-src 'self' 'unsafe-inline' ${FONT_ORIGINS.slice(0, 2).join(' ')}`,
  `font-src 'self' ${FONT_ORIGINS.join(' ')}`,
  `img-src 'self' data: blob: ${OSM_TILES}`,
  `connect-src 'self' ${OSM_TILES} ${FONT_ORIGINS.join(' ')}`,
  "worker-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

/** Static hosts can't send headers, so ship the CSP as a meta tag — production only, it would block Vite's HMR. */
function contentSecurityPolicy(): Plugin {
  return {
    name: 'festival-log:csp',
    apply: 'build',
    // Right after <meta charset> so it governs every stylesheet and script that follows.
    transformIndexHtml: (html) =>
      html.replace(
        '<meta charset="UTF-8" />',
        `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${CONTENT_SECURITY_POLICY}" />`,
      ),
  }
}

export default defineConfig({
  base,
  plugins: [
    react(),
    contentSecurityPolicy(),
    VitePWA({
      registerType: 'autoUpdate',
      // Generates PNG/maskable/apple-touch icons from the SVG and injects them into the manifest and <head>.
      pwaAssets: { image: 'public/icon.svg', preset: ICON_PRESET, overrideManifestIcons: true },
      manifest: {
        name: '두두페 — 두근두근 페스티벌',
        short_name: '두두페',
        description: '두근두근 페스티벌(HBFe) — 페스티벌 타임테이블과 현장 지도를 기록하는 앱',
        lang: 'ko',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#13101b',
        theme_color: '#13101b',
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        runtimeCaching: [
          {
            // Festival grounds often have no signal: keep every map tile you've already looked at.
            urlPattern: OSM_TILE_PATTERN,
            handler: 'CacheFirst',
            options: {
              cacheName: 'osm-tiles',
              expiration: { maxEntries: 3000, maxAgeSeconds: 30 * DAY_SECONDS },
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            urlPattern: FONT_PATTERN,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'fonts',
              expiration: { maxEntries: 300, maxAgeSeconds: 365 * DAY_SECONDS },
              cacheableResponse: { statuses: [200] },
            },
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      include: ['src/lib/**/*.ts', 'src/data/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/data/store.ts', 'src/data/testFixtures.ts'],
    },
  },
})
