import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Base assume repo GitHub "atta" (GitHub Pages: usuario.github.io/atta/).
// Ajustar se o nome do repositorio for diferente.
export default defineConfig({
  base: '/atta/',
  plugins: [react(), tailwindcss()],
})
