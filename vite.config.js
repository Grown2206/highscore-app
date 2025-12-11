import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true // Erlaubt Zugriff im lokalen Netzwerk (wichtig für Handy-Tests)
  }
})