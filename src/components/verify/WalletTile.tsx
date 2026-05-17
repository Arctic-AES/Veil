import clsx from 'clsx'
import { useWallet } from '../../hooks/useWallet'
import { isLaceAvailable } from '../../services/laceWallet'
import s from './WalletTile.module.css'

export default function WalletTile() {
  const { connected, connecting, connect, address, kind, error } = useWallet()
  const laceInstalled = isLaceAvailable()

  return (
    <div>
      <button
        type="button"
        className={clsx(s.tile, connected && s.connected)}
        onClick={connect}
        disabled={connecting}
      >
        <div className={s.logoSq}>L</div>
        <div className={s.body}>
          <div className={s.t}>
            {connected
              ? kind === 'lace'
                ? 'Lace · Midnight'
                : 'Demo wallet'
              : laceInstalled
                ? 'Connect Lace'
                : 'Connect wallet'}
          </div>
          <div className={s.s}>
            {connecting
              ? 'Connecting…'
              : connected
                ? kind === 'lace'
                  ? `${address?.slice(0, 14)}… · preprod`
                  : 'Session address · local proof only'
                : laceInstalled
                  ? 'Midnight preprod network'
                  : 'Install Lace, or continue with a session address'}
          </div>
        </div>
        <div className={s.check}>{connected && '✓'}</div>
      </button>
      {error && (
        <p className={s.walletErr} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
