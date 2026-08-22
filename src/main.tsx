import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { RouterProvider } from './lib/router'
import { SiteDataProvider } from './data/siteData'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SiteDataProvider>
      <RouterProvider>
        <App />
      </RouterProvider>
    </SiteDataProvider>
  </StrictMode>,
)
