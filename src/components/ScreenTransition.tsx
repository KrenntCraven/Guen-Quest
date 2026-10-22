import { m, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import { bloomOut, fadeSlide, tween } from '../motion/tokens'

/** `leave="bloom"` gives a milestone screen a softer, longer lift-away exit than the default slide. */
export function ScreenTransition({ children, leave = 'slide' }: { children: ReactNode; leave?: 'slide' | 'bloom' }) {
  const reduce = useReducedMotion()

  return (
    <m.div
      className="screen-transition"
      variants={leave === 'bloom' ? bloomOut : fadeSlide}
      initial={reduce ? { opacity: 0 } : 'initial'}
      animate="animate"
      exit={reduce ? { opacity: 0 } : 'exit'}
      transition={reduce ? { duration: 0 } : tween.screen}
    >
      {children}
    </m.div>
  )
}
