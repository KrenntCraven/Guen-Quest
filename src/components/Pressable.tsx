import { m, useReducedMotion, type HTMLMotionProps } from 'motion/react'
import { springs } from '../motion/tokens'

type PressableProps = HTMLMotionProps<'button'> & {
  pulse?: boolean
}

export function Pressable({ pulse = false, disabled, ...props }: PressableProps) {
  const reduce = useReducedMotion()
  const still = Boolean(reduce || disabled)

  return (
    <m.button
      disabled={disabled}
      whileHover={still ? undefined : { y: -2 }}
      whileTap={still ? undefined : { scale: 0.98 }}
      animate={pulse && !still ? { scale: [1, 1.035, 1] } : undefined}
      transition={
        pulse && !still
          ? { scale: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }, default: springs.snappy }
          : springs.snappy
      }
      {...props}
    />
  )
}
