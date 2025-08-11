import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { type Plugin } from 'vite'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import tailwindcss from "@tailwindcss/vite"

export function htmlTextPlugin(): Plugin {
  return {
    name: 'html-text',
    load(id) {
      // Check if the import has the ?text suffix
      if (id.endsWith('.html?text')) {
        const filePath = id.replace('?text', '')
        
        try {
          const htmlContent = readFileSync(filePath, 'utf-8')
          // Return the HTML content as a default export string
          return `export default ${JSON.stringify(htmlContent)}`
        } catch (error) {
          this.error(`Failed to read HTML file: ${filePath}`)
        }
      }
    }
  }
}


// https://vite.dev/config/
export default defineConfig({
  plugins: [htmlTextPlugin(), react(), tailwindcss() ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
