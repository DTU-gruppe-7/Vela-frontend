import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { isSsrRoute } from './ssr/routes'
import SsrApp from './ssr/SsrApp'

const rootElement = document.getElementById('root')!
const initialData = window.__INITIAL_DATA__
const useSsrApp = isSsrRoute(window.location.pathname)

if (useSsrApp) {
  hydrateRoot(
    rootElement,
    <StrictMode>
      <BrowserRouter>
        <SsrApp initialData={initialData} />
      </BrowserRouter>
    </StrictMode>,
  )
} else {
  createRoot(rootElement).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>,
  )
}
