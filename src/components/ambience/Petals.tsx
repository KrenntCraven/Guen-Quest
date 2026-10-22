import { m, useReducedMotion } from 'motion/react'

type Petal = { left: number; size: number; duration: number; delay: number; sway: number; spin: number; color: string; opacity: number }

const PETALS: Petal[] = [
  { left: 10, size: 17, duration: 22, delay: 0.4, sway: 26, spin: 220, color: '#C9B3EE', opacity: 0.8 },
  { left: 33, size: 13, duration: 27, delay: 6, sway: 34, spin: -260, color: '#B9A2E6', opacity: 0.65 },
  { left: 57, size: 15, duration: 24, delay: 2.6, sway: 22, spin: 300, color: '#9B7FD6', opacity: 0.55 },
  { left: 79, size: 18, duration: 21, delay: 9, sway: 30, spin: -200, color: '#C9B3EE', opacity: 0.75 },
  { left: 93, size: 12, duration: 29, delay: 4.2, sway: 20, spin: 240, color: '#B9A2E6', opacity: 0.6 },
  { left: 46, size: 14, duration: 25, delay: 13, sway: 28, spin: -280, color: '#9B7FD6', opacity: 0.5 },
  { left: 22, size: 12, duration: 26, delay: 10.5, sway: 24, spin: 260, color: '#B9A2E6', opacity: 0.55 },
  { left: 68, size: 16, duration: 23, delay: 15, sway: 32, spin: -240, color: '#C9B3EE', opacity: 0.7 },
]

const STOPS = 9

/**
 * Whole-`transform` keyframes (a sampled sine sway, a slow spin and a scaleX "flip") let Motion run each fall
 * on the compositor, so the petals cost nothing on the main thread.
 */
function fall(petal: Petal) {
  const transform: string[] = []
  const opacity: number[] = []
  const times: number[] = []
  for (let i = 0; i < STOPS; i++) {
    const t = i / (STOPS - 1)
    const x = Math.sin(t * Math.PI * 3) * petal.sway
    const y = -8 + t * 118
    const flip = 0.72 + 0.28 * Math.cos(t * Math.PI * 4)
    transform.push(`translate(${x.toFixed(1)}px, ${y.toFixed(1)}vh) rotate(${Math.round(t * petal.spin)}deg) scaleX(${flip.toFixed(2)})`)
    opacity.push(i === 0 || i === STOPS - 1 ? 0 : petal.opacity)
    times.push(t)
  }
  return { transform, opacity, times }
}

const FALLS = PETALS.map(fall)

/** Violet petals drifting down behind a screen's content. Hidden entirely with reduced motion. */
export function Petals({ count = 6 }: { count?: number }) {
  const reduce = useReducedMotion()
  if (reduce) return null

  return (
    <div className="petals" aria-hidden="true">
      {PETALS.slice(0, count).map((petal, index) => (
        <m.span
          key={petal.left}
          className="petal"
          style={{ left: `${petal.left}%`, width: petal.size, height: petal.size * 1.35 }}
          initial={{ opacity: 0 }}
          animate={{ transform: FALLS[index].transform, opacity: FALLS[index].opacity }}
          transition={{ duration: petal.duration, delay: petal.delay, times: FALLS[index].times, ease: 'linear', repeat: Infinity }}
        >
          <svg viewBox="0 0 12 16" width="100%" height="100%">
            <path d="M6 0C10.5 3.6 11.4 10 6 16 0.6 10 1.5 3.6 6 0Z" fill={petal.color} />
            <path d="M6 2.5V13" stroke="#FFFFFF" strokeOpacity="0.45" strokeWidth="0.8" strokeLinecap="round" />
          </svg>
        </m.span>
      ))}
    </div>
  )
}
