import { m, useReducedMotion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const HEART_PATH =
  'M12 21s-7.4-4.5-9.5-9.1C1 8.4 3.1 4.6 6.7 4.6c2.1 0 3.5 1.1 4.3 2.5.8-1.4 2.2-2.5 4.3-2.5 3.6 0 5.7 3.8 4.2 7.3C19.4 16.5 12 21 12 21Z'

/** Purple, lavender and soft pink: the lily's palette plus a blush for the romantic moments. */
const HEART_COLORS = ['#B9A2E6', '#E7A3C2', '#8F6CCF', '#F2BCD3', '#C9B3EE'] as const

function Heart({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%">
      <path d={HEART_PATH} fill={color} />
    </svg>
  )
}

type Floater = { left: number; size: number; duration: number; delay: number; sway: number; color: string; opacity: number }

const FLOATERS: Floater[] = [
  { left: 8, size: 16, duration: 17, delay: 0.8, sway: 18, color: HEART_COLORS[0], opacity: 0.6 },
  { left: 88, size: 13, duration: 20, delay: 2.4, sway: 22, color: HEART_COLORS[1], opacity: 0.55 },
  { left: 27, size: 11, duration: 22, delay: 6, sway: 16, color: HEART_COLORS[3], opacity: 0.5 },
  { left: 70, size: 17, duration: 18, delay: 4.2, sway: 20, color: HEART_COLORS[4], opacity: 0.55 },
  { left: 50, size: 12, duration: 24, delay: 9, sway: 14, color: HEART_COLORS[2], opacity: 0.35 },
  { left: 95, size: 10, duration: 21, delay: 11.5, sway: 18, color: HEART_COLORS[1], opacity: 0.45 },
]

const STOPS = 7

/** Whole-`transform` keyframes (a slow rise with a sampled sway) so each heart runs on the compositor, like `Petals`. */
function rise(heart: Floater) {
  const transform: string[] = []
  const opacity: number[] = []
  const times: number[] = []
  for (let i = 0; i < STOPS; i++) {
    const t = i / (STOPS - 1)
    const x = Math.sin(t * Math.PI * 2) * heart.sway
    const y = 104 - t * 116
    const tilt = Math.sin(t * Math.PI * 2) * 10
    transform.push(`translate(${x.toFixed(1)}px, ${y.toFixed(1)}vh) rotate(${tilt.toFixed(1)}deg)`)
    opacity.push(i === 0 || i === STOPS - 1 ? 0 : heart.opacity)
    times.push(t)
  }
  return { transform, opacity, times }
}

const RISES = FLOATERS.map(rise)

/** A few hearts drifting slowly upward behind a screen's content. Hidden entirely with reduced motion. */
export function FloatingHearts({ count = 5 }: { count?: number }) {
  const reduce = useReducedMotion()
  if (reduce) return null

  return (
    <div className="petals" aria-hidden="true">
      {FLOATERS.slice(0, count).map((heart, index) => (
        <m.span
          key={heart.left}
          className="petal"
          style={{ left: `${heart.left}%`, width: heart.size, height: heart.size }}
          initial={{ opacity: 0 }}
          animate={{ transform: RISES[index].transform, opacity: RISES[index].opacity }}
          transition={{ duration: heart.duration, delay: heart.delay, times: RISES[index].times, ease: 'linear', repeat: Infinity }}
        >
          <Heart color={heart.color} />
        </m.span>
      ))}
    </div>
  )
}

/** A ring over the top half of a badge (angle in degrees, 0 = right, -90 = up), so the burst stays clear of the copy below. */
const RING = [
  { angle: -196, distance: 84, size: 15, spin: -26 },
  { angle: -164, distance: 100, size: 21, spin: -18 },
  { angle: -134, distance: 90, size: 17, spin: -12 },
  { angle: -106, distance: 104, size: 23, spin: -4 },
  { angle: -76, distance: 92, size: 16, spin: 6 },
  { angle: -46, distance: 102, size: 22, spin: 14 },
  { angle: -16, distance: 86, size: 17, spin: 22 },
  { angle: 14, distance: 80, size: 14, spin: 28 },
]

const BURST = RING.map((heart, index) => {
  const rad = (heart.angle * Math.PI) / 180
  const at = (k: number, rise: number, scale: number, spin: number) =>
    `translate(-50%, -50%) translate(${(Math.cos(rad) * heart.distance * k).toFixed(1)}px, ${(Math.sin(rad) * heart.distance * k - rise).toFixed(1)}px) scale(${scale}) rotate(${spin}deg)`
  return {
    size: heart.size,
    color: HEART_COLORS[index % HEART_COLORS.length],
    delay: (index % 2) * 0.05,
    transform: [at(0.5, 0, 0.3, 0), at(0.88, 0, 1, heart.spin / 2), at(1, 16, 0.8, heart.spin)],
  }
})

/** One celebratory ring of hearts from the rim of a `.story-badge`, played once after `delay`. Off with reduced motion. */
export function HeartBurst({ delay = 0 }: { delay?: number }) {
  const reduce = useReducedMotion()
  if (reduce) return null

  return (
    <span className="heart-burst" aria-hidden="true">
      {BURST.map((heart, index) => (
        <m.span
          key={index}
          className="heart-bloom__heart"
          style={{ width: heart.size, height: heart.size }}
          initial={{ transform: heart.transform[0], opacity: 0 }}
          animate={{ transform: heart.transform, opacity: [0, 1, 1, 0] }}
          transition={{
            transform: { duration: 1.4, delay: delay + heart.delay, times: [0, 0.4, 1], ease: ['easeOut', 'easeInOut'] },
            opacity: { duration: 1.4, delay: delay + heart.delay, times: [0, 0.15, 0.6, 1], ease: 'easeOut' },
          }}
        >
          <Heart color={heart.color} />
        </m.span>
      ))}
    </span>
  )
}

/** Fan of hearts (angle in degrees, 0 = right, -90 = straight up), sized for the full-width pill button. */
const FAN = [
  { angle: -170, distance: 74, size: 18, spin: -24 },
  { angle: -150, distance: 98, size: 24, spin: -14 },
  { angle: -128, distance: 82, size: 16, spin: -20 },
  { angle: -108, distance: 112, size: 26, spin: -6 },
  { angle: -90, distance: 84, size: 18, spin: 2 },
  { angle: -72, distance: 108, size: 22, spin: 10 },
  { angle: -52, distance: 86, size: 17, spin: 18 },
  { angle: -30, distance: 100, size: 23, spin: 22 },
  { angle: -10, distance: 76, size: 16, spin: 26 },
]

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

/**
 * Scales the fan to the button: wide and tall for the pill, tighter for answers, small for icon buttons.
 * Buttons near the top of the screen bloom downward first so the hearts aren't clipped by the edge.
 */
function fanFor(width: number, y: number) {
  const stretch = clamp(width / 200, 1, 1.7)
  const reach = clamp(width / 250, 0.6, 1)
  const sizeScale = width < 120 ? 0.75 : 1
  const direction = y < 110 ? -1 : 1
  return FAN.map((heart, index) => {
    const rad = (heart.angle * Math.PI) / 180
    const dx = Math.cos(rad) * heart.distance * reach * stretch
    const dy = Math.sin(rad) * heart.distance * reach * direction
    const lift = 46 * reach
    const at = (k: number, rise: number, scale: number, spin: number) =>
      `translate(-50%, -50%) translate(${(dx * k).toFixed(1)}px, ${(dy * k - rise).toFixed(1)}px) scale(${scale}) rotate(${spin}deg)`
    return {
      size: Math.round(heart.size * sizeScale),
      color: HEART_COLORS[index % HEART_COLORS.length],
      delay: (index % 3) * 0.04,
      transform: [at(0, 0, 0.3, 0), at(0.72, 0, 1, heart.spin / 2), at(1, lift, 0.85, heart.spin)],
    }
  })
}

type Bloom = { id: number; x: number; y: number; width: number }

/** One burst: hearts bloom out of a point (viewport coordinates), float up and fade within about a second. */
function HeartBloom({ x, y, width }: Bloom) {
  const fan = useMemo(() => fanFor(width, y), [width, y])

  return (
    <span className="heart-bloom" aria-hidden="true" style={{ left: x, top: y }}>
      {fan.map((heart, index) => (
        <m.span
          key={index}
          className="heart-bloom__heart"
          style={{ width: heart.size, height: heart.size }}
          initial={{ transform: heart.transform[0], opacity: 0 }}
          animate={{ transform: heart.transform, opacity: [0, 1, 0] }}
          transition={{
            transform: { duration: 0.95, delay: heart.delay, times: [0, 0.38, 1], ease: ['easeOut', 'easeInOut'] },
            opacity: { duration: 0.95, delay: heart.delay, times: [0, 0.18, 1], ease: 'easeOut' },
          }}
        >
          <Heart color={heart.color} />
        </m.span>
      ))}
    </span>
  )
}

const BLOOM_MS = 1150
const MAX_BLOOMS = 3

/**
 * Blooms hearts from every button the player presses. Mount once at the app root: it listens for clicks in the
 * capture phase (so buttons that stop propagation still bloom) and portals the hearts above the page, so they keep
 * floating while a screen transition swaps the page underneath. Opt a button out with `data-bloom="off"`, and mark
 * a child with `data-bloom-anchor` to bloom from it instead of the button's centre. Off with reduced motion.
 */
export function HeartBloomLayer() {
  const reduce = useReducedMotion()
  const [blooms, setBlooms] = useState<Bloom[]>([])
  const nextId = useRef(0)

  useEffect(() => {
    if (reduce) return
    const timers = new Set<number>()

    const onClick = (event: MouseEvent) => {
      const button = event.target instanceof Element ? event.target.closest('button') : null
      if (!button || button.disabled || button.dataset.bloom === 'off') return
      const rect = (button.querySelector('[data-bloom-anchor]') ?? button).getBoundingClientRect()
      const bloom = { id: nextId.current++, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, width: rect.width }
      setBlooms((list) => [...list.slice(1 - MAX_BLOOMS), bloom])
      const timer = window.setTimeout(() => {
        timers.delete(timer)
        setBlooms((list) => list.filter((item) => item.id !== bloom.id))
      }, BLOOM_MS)
      timers.add(timer)
    }

    document.addEventListener('click', onClick, true)
    return () => {
      document.removeEventListener('click', onClick, true)
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [reduce])

  if (reduce || blooms.length === 0) return null
  return createPortal(
    blooms.map((bloom) => <HeartBloom key={bloom.id} {...bloom} />),
    document.body,
  )
}
