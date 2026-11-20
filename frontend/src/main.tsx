import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@fontsource-variable/manrope'
import '@fontsource/sansation/400.css'
import '@fontsource/sansation/700.css'
import { App } from '@/app/app'
import '@/app/styles/index.css'

const root = document.getElementById('root')

if (!root) {
  throw new Error('Root element was not found')
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
