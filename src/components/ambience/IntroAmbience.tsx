import { m, useReducedMotion } from 'motion/react'
import { Petals } from './Petals'

/** A there-and-back loop (rather than `repeatType: 'mirror'`) keeps the sway eligible for the compositor. */
const sway = (from: number, to: number, duration: number) => ({
  animate: { transform: [`rotate(${from}deg)`, `rotate(${to}deg)`, `rotate(${from}deg)`] },
  transition: { duration: duration * 2, repeat: Infinity, ease: 'easeInOut' as const },
})

/** A hanging wisteria raceme: paired petal-shaped florets that shrink and pale towards the tip. */
function raceme(x: number, top: number, length: number, rows: number, width: number) {
  return Array.from({ length: rows * 2 }, (_, i) => {
    const t = Math.floor(i / 2) / (rows - 1)
    const side = i % 2 === 0 ? -1 : 1
    const size = 1 - t * 0.55
    return {
      x: x + side * (width * (1 - t) + 1.5) + Math.sin(t * 7) * 1.5,
      y: top + t * length + (side > 0 ? 2.5 : 0),
      size,
      angle: side * (32 - t * 18),
      light: t,
    }
  })
}

const RACEMES = [raceme(58, 30, 112, 9, 6), raceme(84, 30, 58, 6, 4.5)]
const FLORET = 'M0-5C3.6-3.2 4.2 2.2 0 5-4.2 2.2-3.6-3.2 0-5Z'
const LEAF = 'M0 0C5-4.5 13-4.5 18 0 13 4.5 5 4.5 0 0Z'

function floretColor(light: number) {
  const mix = (a: number, b: number) => Math.round(a + (b - a) * light)
  return `rgb(${mix(128, 228)} ${mix(94, 218)} ${mix(196, 248)})`
}

function Wisteria() {
  return (
    <svg viewBox="0 0 112 160" width="112" height="160" aria-hidden="true">
      <path d="M112 8C94 10 74 14 58 26M90 12C87 17 85 22 84 28" fill="none" stroke="#B9A2E6" strokeWidth="1.7" strokeLinecap="round" />
      <path d={LEAF} fill="#D9CDEF" transform="translate(98 10) rotate(32)" />
      <path d={LEAF} fill="#E4DBF4" transform="translate(76 15) rotate(150)" />
      <path d={LEAF} fill="#D9CDEF" transform="translate(66 20) rotate(48) scale(0.8)" />
      {RACEMES.map((florets, r) =>
        florets.map((f, i) => (
          <path
            key={`${r}-${i}`}
            d={FLORET}
            fill={floretColor(f.light)}
            transform={`translate(${f.x.toFixed(1)} ${f.y.toFixed(1)}) rotate(${f.angle.toFixed(0)}) scale(${f.size.toFixed(2)})`}
          />
        )),
      )}
    </svg>
  )
}

function Bellflower() {
  const bell = 'M0 0C-4.6 1.6-6 7-5.6 11.4L-3 10.2-1 12 1 10.2 3 12 5.6 11.4C6 7 4.6 1.6 0 0Z'
  return (
    <svg viewBox="0 0 70 132" width="84" height="158" aria-hidden="true">
      <path d="M18 132C20 100 24 66 36 26M24 86C32 78 42 74 52 72M28 56C34 48 40 44 48 42" fill="none" stroke="#B9A2E6" strokeWidth="1.5" strokeLinecap="round" />
      <path d={LEAF} fill="#D9CDEF" transform="translate(20 116) rotate(-128) scale(0.9)" />
      <path d={LEAF} fill="#E4DBF4" transform="translate(21 112) rotate(-48) scale(0.8)" />
      <path d={bell} fill="#9B7FD6" transform="translate(36 26) rotate(-8) scale(1.15)" />
      <path d={bell} fill="#B79BE6" transform="translate(52 72) rotate(12) scale(1.1)" />
      <path d={bell} fill="#C9B3EE" transform="translate(48 42) rotate(6)" />
    </svg>
  )
}

/** Quiet storybook motion behind the intro: two swaying sprigs and a few drifting violet petals. */
export function IntroAmbience() {
  const reduce = useReducedMotion()

  return (
    <div className="intro-ambience" aria-hidden="true">
      <m.div className="intro-sprig intro-sprig--wisteria" {...(reduce ? {} : sway(-2.5, 3, 6.5))}>
        <Wisteria />
      </m.div>
      <m.div className="intro-sprig intro-sprig--bellflower" {...(reduce ? {} : sway(-3, 2.5, 7.8))}>
        <Bellflower />
      </m.div>
      <Petals count={6} />
    </div>
  )
}
