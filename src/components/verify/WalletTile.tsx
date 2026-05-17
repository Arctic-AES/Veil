import clsx from 'clsx'
import { useWallet } from '../../hooks/useWallet'
import s from './WalletTile.module.css'

export default function WalletTile() {
  const { connected, connecting, connect, address } = useWallet()
  const isDemo = address?.startsWith('demo1') ?? false
  return (
    <button
      className={clsx(s.tile, connected && s.connected)}
      onClick={connect}
      disabled={connecting}
    >
      <div className={s.logoSq}>L</div>
      <div className={s.body}>
        <div className={s.t}>{connected && isDemo ? 'Demo wallet' : 'Lace Wallet'}</div>
        <div className={s.s}>
          {connecting
            ? 'Connecting…'
            : connected
              ? isDemo
                ? 'Session-random pseudonymous address · Midnight testnet'
                : 'Connected · Midnight testnet'
              : 'Privacy-first · Midnight ZK-enabled'}
        </div>
      </div>
      <div className={s.check}>{connected && '✓'}</div>
    </button>
  )
}
