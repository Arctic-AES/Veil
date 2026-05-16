import { type ReactNode } from 'react'
import clsx from 'clsx'
import s from './Tag.module.css'

type Tone = 'default' | 'teal' | 'violet' | 'green' | 'amber'

type Props = { tone?: Tone; children: ReactNode }

export default function Tag({ tone = 'default', children }: Props) {
  return <span className={clsx(s.tag, s[tone])}>{children}</span>
}
