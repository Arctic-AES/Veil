import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { FlowProvider } from './state/FlowContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FlowProvider>
      <App />
    </FlowProvider>
  </StrictMode>,
)
