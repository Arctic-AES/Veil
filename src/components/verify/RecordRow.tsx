import s from './RecordRow.module.css'

type Props = { name: string; size: number }

function fmt(n: number) {
  if (!n) return 'extracted'
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

export default function RecordRow({ name, size }: Props) {
  return (
    <div className={s.row}>
      <div className={s.ico}>{'\u{1F4C4}'}</div>
      <div className={s.meta}>
        <div className={s.t}>{name}</div>
        <div className={s.s}>{fmt(size)} · processed locally</div>
      </div>
      <div className={s.status}>✓ Loaded</div>
    </div>
  )
}
