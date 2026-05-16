import { type HTMLAttributes, type ReactNode } from 'react'
import clsx from 'clsx'
import s from './Card.module.css'

type Props = HTMLAttributes<HTMLDivElement> & {
  padded?: boolean
  tinted?: boolean
  children: ReactNode
}

export default function Card({ padded, tinted, className, children, ...rest }: Props) {
  return (
    <div
      className={clsx(s.card, padded && s.padded, tinted && s.tinted, className)}
      {...rest}
    >
      {children}
    </div>
  )
}
