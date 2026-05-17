import { hasGeminiApiKey } from '../../config/env'
import s from './EnvBanner.module.css'

export default function EnvBanner() {
  if (hasGeminiApiKey()) return null

  return (
    <div className={s.banner} role="status">
      AI record extraction requires an API key.{' '}
      Use <strong>Demo Patients</strong> to explore the full flow without one — or add your key to <code>.env</code> to import real PDFs.
    </div>
  )
}
