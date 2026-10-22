import { m, useReducedMotion, type HTMLMotionProps } from 'motion/react'
import type { ReactNode } from 'react'
import { storyEase } from '../motion/tokens'
import { BunnyIcon } from './BunnyIcon'
import { Pressable } from './Pressable'

type BunnyButtonProps = Omit<HTMLMotionProps<'button'>, 'children'> & {
  children: ReactNode
  /** Seconds after mount before the bunny's little hop, so it lands once the screen has settled. */
  hopDelay?: number
}

/** The storybook call to action: a violet pill led by the bunny, matching the intro's button. */
export function BunnyButton({ children, className = '', hopDelay = 0.9, ...props }: BunnyButtonProps) {
  const reduce = useReducedMotion()

  return (
    <Pressable className={`primary-button ${className}`} type="button" {...props}>
      <m.span
        className="button-bunny"
        initial={{ y: 0 }}
        animate={reduce ? undefined : { y: [0, -6, 0, -3, 0] }}
        transition={{ delay: hopDelay, duration: 0.9, ease: storyEase }}
      >
        <BunnyIcon width={26} />
      </m.span>
      {children}
    </Pressable>
  )
}
