import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'logo2.png'],
      manifest: {
        name: 'Vasudha Platform',
        short_name: 'Vasudha',
        description: 'Sustainable waste management and recycling platform',
        theme_color: '#FCF9F4',
        icons: [
          {
            src: 'logo2.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo2.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'logo2.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
