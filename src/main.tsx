import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { RouterProvider } from './lib/router'
import { SiteDataProvider } from './data/siteData'
import { ErrorBoundary } from './ErrorBoundary'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <SiteDataProvider>
        <RouterProvider>
          <App />
        </RouterProvider>
      </SiteDataProvider>
    </ErrorBoundary>
  </StrictMode>,
)
