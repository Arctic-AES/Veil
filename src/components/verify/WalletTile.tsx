import clsx from 'clsx'
import { useWallet } from '../../hooks/useWallet'
import s from './WalletTile.module.css'

export default function WalletTile() {
  const { connected, connecting, connect } = useWallet()
  return (
    <button
      className={clsx(s.tile, connected && s.connected)}
      onClick={connect}
      disabled={connecting}
    >
      <div className={s.logoSq}>L</div>
      <div className={s.body}>
        <div className={s.t}>Lace Wallet</div>
        <div className={s.s}>
          {connecting
            ? 'Connecting…'
            : connected
              ? 'Connected · Midnight testnet'
              : 'Privacy-first · Midnight ZK-enabled'}
        </div>
      </div>
      <div className={s.check}>{connected && '✓'}</div>
    </button>
  )
}
