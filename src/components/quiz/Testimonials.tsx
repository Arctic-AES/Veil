import s from './Testimonials.module.css'

type Pos = 'topRight' | 'midLeft' | 'bottom'

type Quote = {
  quote: string
  name: string
  meta: string
  pos: Pos
}

const QUOTES: Quote[] = [
  {
    quote: 'Found a match in under a minute. They never saw my chart.',
    name: 'Sarah K.',
    meta: 'Patient · Boston',
    pos: 'topRight',
  },
  {
    quote: "First time I felt safe sharing — because I wasn't.",
    name: 'David R.',
    meta: 'Patient · San Francisco',
    pos: 'midLeft',
  },
  {
    quote: 'Eligibility verified in seconds. Zero PII liability for the site.',
    name: 'Dr. Priya M.',
    meta: 'Trial Coordinator',
    pos: 'bottom',
  },
]

export default function Testimonials() {
  return (
    <div className={s.wrap}>
      {QUOTES.map((t) => (
        <blockquote key={t.name} className={`${s.card} ${s[t.pos]}`}>
          <div className={s.quote}>{`“${t.quote}”`}</div>
          <div className={s.cite}>
            <span className={s.name}>{t.name}</span>
            <span className={s.meta}> · {t.meta}</span>
          </div>
        </blockquote>
      ))}
    </div>
  )
}
