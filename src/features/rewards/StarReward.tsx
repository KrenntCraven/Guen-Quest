import { m, useReducedMotion } from 'motion/react'
import { springs } from '../../motion/tokens'

export function StarReward({ stars, className = '', delay = 0 }: { stars: number; className?: string; delay?: number }) {
  const reduce = useReducedMotion()

  return (
    <span className={`star-row ${className}`} role="img" aria-label={`${stars} of 3 stars`}>
      {[1, 2, 3].map((star, index) => {
        const earned = star <= stars
        return (
          <m.span
            className={earned ? 'star star--earned' : 'star'}
            key={star}
            initial={earned && !reduce ? { scale: 0.2, opacity: 0 } : false}
            animate={{ scale: 1, opacity: 1 }}
            transition={
              reduce
                ? { duration: 0 }
                : { ...springs.snappy, delay: earned ? delay + 0.18 + index * 0.16 : 0 }
            }
          >
            ★
          </m.span>
        )
      })}
    </span>
  )
}
