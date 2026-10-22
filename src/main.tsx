import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { domAnimation, LazyMotion } from 'motion/react'
import './styles/index.css'
import App from './app/App.tsx'
import { AuthGate } from './auth/AuthGate.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LazyMotion features={domAnimation} strict>
      <AuthGate>
        <App />
      </AuthGate>
    </LazyMotion>
  </StrictMode>,
)
