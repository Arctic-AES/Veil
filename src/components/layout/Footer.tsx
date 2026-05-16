import PrivacyPill from '../ui/PrivacyPill'
import s from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={s.foot}>
      <div className={s.inner}>
        <div>VEIL · Built for MLH Midnight Hackathon · May 15–17, 2026</div>
        <PrivacyPill label="0 bytes of PHI transmitted this session" />
      </div>
    </footer>
  )
}
