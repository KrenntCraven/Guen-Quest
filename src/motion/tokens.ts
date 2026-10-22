import type { Transition, Variants } from 'motion/react'

export const springs = {
  gentle: { type: 'spring', stiffness: 280, damping: 22, mass: 0.75 },
  snappy: { type: 'spring', stiffness: 480, damping: 26 },
  soft: { type: 'spring', stiffness: 340, damping: 28 },
} satisfies Record<string, Transition>

export const tween = {
  screen: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
  text: { duration: 0.34, ease: [0.22, 1, 0.36, 1] },
  shake: { duration: 0.42, ease: 'easeInOut' },
} satisfies Record<string, Transition>

export const fadeSlide: Variants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}

export const storyEase = [0.22, 1, 0.36, 1] as const

/** Milestone exit: the page lifts and swells slightly as it fades, carried up with the button's hearts. */
export const bloomOut: Variants = {
  ...fadeSlide,
  exit: { opacity: 0, y: -18, scale: 1.02, transition: { duration: 0.5, ease: storyEase } },
}

/** Orchestrated reveal: `shown` plays the choreographed entrance, `instant` settles quickly when skipped. */
export function reveal(delay: number, distance = 14, duration = 0.8): Variants {
  return {
    hidden: { opacity: 0, y: distance },
    shown: { opacity: 1, y: 0, transition: { delay, duration, ease: storyEase } },
    instant: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  }
}

/** Line-mask reveal: the text rises out of a clipped line (wrap it in an element with `overflow: clip`). */
export function lineReveal(delay: number, duration = 1): Variants {
  return {
    hidden: { y: '110%' },
    shown: { y: '0%', transition: { delay, duration, ease: storyEase } },
    instant: { y: '0%', transition: { duration: 0.25 } },
  }
}

/** Rubber-stamp landing: the element drops from slightly larger and settles with a snappy spring. */
export function stamp(delay: number, from = 1.4): Variants {
  return {
    hidden: { opacity: 0, scale: from },
    shown: { opacity: 1, scale: 1, transition: { ...springs.snappy, delay } },
    instant: { opacity: 1, scale: 1, transition: { duration: 0.25 } },
  }
}

export const textRise: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}
