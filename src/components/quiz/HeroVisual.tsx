import s from './HeroVisual.module.css'

export default function HeroVisual() {
  return (
    <div className={s.hero} aria-hidden="true">
      <svg viewBox="0 0 500 500" className={s.svg} preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="vGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(13, 148, 136, 0.35)" />
            <stop offset="60%" stopColor="rgba(13, 148, 136, 0.08)" />
            <stop offset="100%" stopColor="rgba(13, 148, 136, 0)" />
          </radialGradient>
          <linearGradient id="vOrb" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5dd5c5" />
            <stop offset="55%" stopColor="#0d9488" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <pattern id="vDots" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="rgba(37,99,235,0.18)" />
          </pattern>
        </defs>

        <rect x="0" y="0" width="500" height="500" fill="url(#vDots)" opacity="0.4" />
        <circle cx="250" cy="250" r="230" fill="url(#vGlow)" />

        <g className={s.spinSlow}>
          <circle cx="250" cy="250" r="200" fill="none" stroke="rgba(37,99,235,0.18)" strokeWidth="1" strokeDasharray="2 10" />
        </g>
        <g className={s.spinFast}>
          <circle cx="250" cy="250" r="155" fill="none" stroke="rgba(13,148,136,0.28)" strokeWidth="1" strokeDasharray="6 8" />
        </g>
        <circle cx="250" cy="250" r="115" fill="none" stroke="rgba(13,148,136,0.18)" strokeWidth="1" />

        <circle cx="250" cy="250" r="78" fill="url(#vOrb)" />
        <circle cx="250" cy="250" r="78" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />

        <text
          x="250"
          y="266"
          textAnchor="middle"
          fontSize="48"
          fontFamily="system-ui, sans-serif"
          fill="rgba(255,255,255,0.95)"
        >
          {'\u{1F512}'}
        </text>

        <g className={s.float}>
          <circle cx="70" cy="120" r="3" fill="#0d9488" opacity="0.6" />
          <circle cx="430" cy="160" r="2" fill="#2563eb" opacity="0.5" />
          <circle cx="100" cy="400" r="2.5" fill="#0d9488" opacity="0.4" />
          <circle cx="420" cy="380" r="3" fill="#2563eb" opacity="0.55" />
          <circle cx="250" cy="60" r="2" fill="#0d9488" opacity="0.45" />
          <circle cx="250" cy="440" r="2" fill="#2563eb" opacity="0.4" />
        </g>
      </svg>
    </div>
  )
}
