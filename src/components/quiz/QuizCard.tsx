import clsx from 'clsx'
import s from './QuizCard.module.css'

type Props = {
  icon: string
  title: string
  subtitle: string
  selected?: boolean
  onClick: () => void
}

export default function QuizCard({ icon, title, subtitle, selected, onClick }: Props) {
  return (
    <button className={clsx(s.card, selected && s.selected)} onClick={onClick}>
      <div className={s.icon}>{icon}</div>
      <div className={s.text}>
        <div className={s.t}>{title}</div>
        <div className={s.s}>{subtitle}</div>
      </div>
    </button>
  )
}
