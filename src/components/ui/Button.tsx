import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import clsx from 'clsx'
import s from './Button.module.css'

type Variant = 'primary' | 'ghost' | 'soft'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  children: ReactNode
}

export default function Button({ variant = 'primary', className, children, ...rest }: Props) {
  return (
    <button className={clsx(s.btn, s[variant], className)} {...rest}>
      {children}
    </button>
  )
}
