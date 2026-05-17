import { useState } from 'react'
import { useFlow } from '../hooks/useFlow'
import QuizDots from '../components/quiz/QuizDots'
import QuizCard from '../components/quiz/QuizCard'
import ScanSplash from '../components/quiz/ScanSplash'
import HeroVisual from '../components/quiz/HeroVisual'
import Testimonials from '../components/quiz/Testimonials'
import PrivacyPill from '../components/ui/PrivacyPill'
import Button from '../components/ui/Button'
import s from './QuizPage.module.css'

type QKey = 'condition' | 'region' | 'priority'

const Q1 = [
  { val: 'Breast Cancer',         icon: '\u{1FA78}', t: 'Breast Cancer',         sub: 'Stage I–IV, HR+ / HER2+ / TNBC' },
  { val: 'Type 2 Diabetes',       icon: '\u{1FA78}', t: 'Type 2 Diabetes',       sub: 'Newer insulins, GLP-1, prevention' },
  { val: 'Major Depression',      icon: '\u{1F9E0}', t: 'Major Depression',      sub: 'Treatment-resistant, novel therapies' },
  { val: 'Rare Genetic Disorder', icon: '\u{1F9EC}', t: 'Rare genetic disorder', sub: 'Gene therapy, orphan drug trials' },
]
const Q2 = [
  { val: 'Northeast US',      icon: '\u{1F30E}', t: 'Northeast US',      sub: 'Boston, NYC, Philadelphia…' },
  { val: 'West Coast US',     icon: '\u{1F30F}', t: 'West Coast US',     sub: 'SF, LA, Seattle, San Diego…' },
  { val: 'Other US',          icon: '\u{1F30D}', t: 'Other US',          sub: 'Midwest, South, Mountain' },
  { val: 'Prefer not to say', icon: '\u{1F512}', t: 'Prefer not to say', sub: "We'll show all available trials" },
]
const Q3 = [
  { val: 'Speed',         icon: '⚡',         t: 'Enroll fast',           sub: 'Trials still actively recruiting' },
  { val: 'Privacy',       icon: '\u{1F512}', t: 'Maximum privacy',       sub: 'Smallest possible data disclosure' },
  { val: 'Cutting-edge',  icon: '\u{1F9EA}', t: 'Cutting-edge therapy',  sub: 'Phase II novel mechanisms' },
  { val: 'All',           icon: '✨',         t: 'Best overall fit',      sub: 'Weigh all factors equally' },
]
const QUESTIONS: { key: QKey; q: string; hint: string; opts: typeof Q1 }[] = [
  { key: 'condition', q: 'What are you exploring?',   hint: 'Pick the area closest to your situation.',          opts: Q1 },
  { key: 'region',    q: 'Where are you?',             hint: 'Helps prioritize sites near you. You can change this later.', opts: Q2 },
  { key: 'priority',  q: 'What matters most to you?', hint: "We'll weight your matches accordingly.",            opts: Q3 },
]

export default function QuizPage() {
  const { state, dispatch } = useFlow()
  const [qIdx, setQIdx] = useState(0)
  const [scanning, setScanning] = useState(false)

  const q = QUESTIONS[qIdx]
  const selected = state.quiz[q?.key]

  function select(opt: { val: string }) {
    dispatch({ type: 'ANSWER_QUIZ', key: q.key, value: opt.val })
  }

  function next() {
    if (!selected) return
    if (qIdx < QUESTIONS.length - 1) setQIdx(qIdx + 1)
    else setScanning(true)
  }

  if (scanning) {
    const phases = [
      { t: 'Searching active clinical trials…', sub: 'ClinicalTrials.gov v2 API' },
      {
        t: 'Ranking by your criteria…',
        sub: `Condition: ${state.quiz.condition} · Region: ${state.quiz.region}`,
      },
      { t: 'Scoring privacy fit…', sub: `Priority: ${state.quiz.priority}` },
    ]
    return (
      <div className={s.wrap}>
        <ScanSplash phases={phases} durationMs={2900} onDone={() => dispatch({ type: 'SET_STEP', step: 2 })} />
      </div>
    )
  }

  if (qIdx === 0) {
    return (
      <div className={s.landing}>
        <section className={s.left}>
          <header className={s.brand}>
            <div className={s.bigLogo}>
              VE<span className={s.dot}>I</span>L
            </div>
            <div className={s.brandTag}>— Private Trial Screening —</div>
          </header>

          <h1 className={s.motto}>
            Find a trial.<br />
            Prove you qualify.<br />
            <em>Reveal nothing else.</em>
          </h1>

          <div className={s.form}>
            <h2 className={s.subhead}>{q.q}</h2>
            <p className={s.hint}>{q.hint}</p>
            <div className={s.grid}>
              {q.opts.map((opt) => (
                <QuizCard
                  key={opt.val}
                  icon={opt.icon}
                  title={opt.t}
                  subtitle={opt.sub}
                  selected={selected === opt.val}
                  onClick={() => select(opt)}
                />
              ))}
            </div>
            <Button
              onClick={next}
              disabled={!selected}
              className={s.cta}
            >
              Get Started →
            </Button>
            <div className={s.badges}>
              <PrivacyPill label="Records stay on your device" />
              <PrivacyPill label="0 bytes of PHI transmitted" />
            </div>
          </div>
        </section>

        <aside className={s.right}>
          <HeroVisual />
          <Testimonials />
          <div className={s.disclaimer}>
            * Testimonials shown are illustrative — created for hackathon demo purposes only.
          </div>
        </aside>
      </div>
    )
  }

  return (
    <div className={s.wrap}>
      <div className={s.header}>
        <div className={s.tagline}>
          Find a trial. Prove you qualify. <em>Reveal nothing else.</em>
        </div>
        <div className={s.taglineSub}>Answer 3 quick questions — nothing leaves this device.</div>
      </div>

      <QuizDots current={qIdx + 1} total={QUESTIONS.length} />

      <h2 className={s.question}>{q.q}</h2>
      <p className={s.hint}>{q.hint}</p>

      <div className={s.options}>
        {q.opts.map((opt) => (
          <QuizCard
            key={opt.val}
            icon={opt.icon}
            title={opt.t}
            subtitle={opt.sub}
            selected={selected === opt.val}
            onClick={() => select(opt)}
          />
        ))}
      </div>

      <div className={s.foot}>
        <button
          className={s.back}
          disabled={qIdx === 0}
          onClick={() => setQIdx(Math.max(0, qIdx - 1))}
        >
          ← Back
        </button>
        <Button onClick={next} disabled={!selected}>
          Continue →
        </Button>
      </div>
    </div>
  )
}
