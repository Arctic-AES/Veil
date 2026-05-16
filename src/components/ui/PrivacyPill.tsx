import s from './PrivacyPill.module.css'

type Props = { label?: string }

export default function PrivacyPill({ label = 'Records stay on your device' }: Props) {
  return (
    <span className={s.pill} title="No personal health data ever leaves this device">
      <span className={s.lock}>{'\u{1F512}'}</span>
      <span>{label}</span>
      <span className={s.pulse} />
    </span>
  )
}
