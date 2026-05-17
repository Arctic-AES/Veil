import s from './HeroVisual.module.css'

export default function HeroVisual() {
  return (
    <div className={s.hero} aria-hidden="true">
      <video
        className={s.video}
        src="/hero.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
      />
      <div className={s.vignette} />
    </div>
  )
}
