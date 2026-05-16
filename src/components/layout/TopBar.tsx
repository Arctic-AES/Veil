import clsx from 'clsx'
import PrivacyPill from '../ui/PrivacyPill'
import { useFlow } from '../../hooks/useFlow'
import s from './TopBar.module.css'

export default function TopBar() {
  const { state } = useFlow()
  const connected = !!state.walletAddress
  const chipText = connected
    ? state.walletAddress!.slice(0, 8) + '…' + state.walletAddress!.slice(-4)
    : 'Wallet not connected'

  return (
    <header className={s.bar}>
      <div className={s.inner}>
        <a className={s.logo} href="#">
          VE<span className={s.dot}>I</span>L
        </a>
        <span className={s.tag}>PRIVATE TRIAL SCREENING · v0.1</span>
        <div className={s.spacer} />
        <PrivacyPill />
        <span className={clsx(s.chip, connected && s.chipOn)}>
          <span className={clsx(s.chipDot, connected && s.chipDotOn)} />
          {chipText}
        </span>
      </div>
    </header>
  )
}
