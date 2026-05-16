import clsx from 'clsx'
import s from './QuizDots.module.css'

type Props = { current: number; total: number }

export default function QuizDots({ current, total }: Props) {
  return (
    <div className={s.dots}>
      {Array.from({ length: total }, (_, i) => {
        const n = i + 1
        return (
          <span
            key={n}
            className={clsx(s.dot, n === current && s.active, n < current && s.done)}
          />
        )
      })}
    </div>
  )
}
