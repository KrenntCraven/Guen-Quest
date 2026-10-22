import { m, useReducedMotion, type Easing } from 'motion/react'
import { useEffect, useRef } from 'react'
import { BunnyIcon } from '../../components/BunnyIcon'

const HOP_SECONDS = 0.52
const HOP_LIFT = 30
const MAX_HOPS = 3
const HOP_DELAY = 0.7
/** Px from the node centre; she stands on the side away from the level's label. */
const SIDE_OFFSET = 47

const levelsBetween = (from: number, to: number) => {
  const step = Math.sign(to - from)
  const start = Math.abs(to - from) > MAX_HOPS ? to - step * MAX_HOPS : from
  return Array.from({ length: Math.abs(to - start) + 1 }, (_, index) => start + index * step)
}

/** The player's avatar on the level map: sits on the current level and hops along the path when a new one unlocks. */
export function MapBunny({
  path,
  rowHeight,
  from,
  to,
  onSettled,
}: {
  path: number[]
  rowHeight: number
  from: number
  to: number
  onSettled: (level: number) => void
}) {
  const reduce = Boolean(useReducedMotion())
  const ref = useRef<HTMLDivElement>(null)
  const hopping = !reduce && from !== to
  const stops = hopping ? levelsBetween(from, to) : [to]
  const hops = stops.length - 1
  const duration = hops * HOP_SECONDS
  const spot = (level: number) => {
    const x = path[level - 1]
    return { x, side: x > 0.5 ? SIDE_OFFSET : -SIDE_OFFSET, y: (level - 1) * rowHeight + rowHeight / 2 }
  }
  const spots = stops.map(spot)
  const start = spots[0]

  useEffect(() => {
    if (from === to) return
    if (!hopping) {
      onSettled(to)
      return
    }
    const row = ref.current?.parentElement?.querySelectorAll('.level-row')[to - 1]
    const bounds = row?.getBoundingClientRect()
    if (bounds && (bounds.top < 0 || bounds.bottom > window.innerHeight)) {
      row?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }
  }, [from, hopping, onSettled, to])

  return (
    <m.div
      ref={ref}
      className="map-bunny"
      aria-hidden="true"
      initial={hopping ? { '--bx': start.x, '--bs': start.side, '--by': start.y } : false}
      animate={{
        '--bx': spots.map((s) => s.x),
        '--bs': spots.map((s) => s.side),
        '--by': spots.map((s) => s.y),
      }}
      transition={hopping ? { duration, delay: HOP_DELAY, ease: 'easeInOut' } : { duration: 0 }}
      onAnimationComplete={() => {
        if (hopping) onSettled(to)
      }}
    >
      <m.div
        className="map-bunny__body"
        initial={hopping ? { y: 0, scaleX: 1, scaleY: 1 } : false}
        animate={
          hopping
            ? {
                y: [0, ...stops.slice(1).flatMap(() => [-HOP_LIFT, 0])],
                scaleX: [1, 1.12, 0.97, 1],
                scaleY: [1, 0.82, 1.06, 1],
              }
            : { y: 0, scaleX: 1, scaleY: 1 }
        }
        transition={
          hopping
            ? {
                y: {
                  duration,
                  delay: HOP_DELAY,
                  ease: stops.slice(1).flatMap((): Easing[] => ['easeOut', 'easeIn']),
                },
                scaleX: { duration: 0.38, delay: HOP_DELAY + duration, ease: 'easeOut' },
                scaleY: { duration: 0.38, delay: HOP_DELAY + duration, ease: 'easeOut' },
              }
            : { duration: 0 }
        }
      >
        <BunnyIcon className="map-bunny__figure" />
      </m.div>
    </m.div>
  )
}
