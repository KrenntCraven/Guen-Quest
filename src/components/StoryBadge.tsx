import { m, useReducedMotion } from 'motion/react'
import { springs, storyEase } from '../motion/tokens'
import { HeartBurst } from './ambience/Hearts'
import { BunnyIcon } from './BunnyIcon'
import { LilyIcon } from './LilyIcon'

/** Seconds after mount for each beat of a celebrating badge. */
export type BadgeCelebration = { lily: number; burst: number; hop: number }

/**
 * The bunny on a soft lavender circle, echoing the intro's stage; the lily joins her for happy moments.
 * With `celebrate`, the lily twirls in late, a ring of hearts bursts from the badge and the bunny hops for joy.
 */
export function StoryBadge({ lily = false, celebrate }: { lily?: boolean; celebrate?: BadgeCelebration }) {
  const reduce = useReducedMotion()
  const play = Boolean(celebrate) && !reduce

  return (
    <m.span
      className={`story-badge ${lily ? '' : 'story-badge--quiet'}`}
      aria-hidden="true"
      initial={reduce ? false : { scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={reduce ? { duration: 0 } : springs.gentle}
    >
      {celebrate && <HeartBurst delay={celebrate.burst} />}
      <m.span
        className="story-badge__bunny"
        initial={{ y: 0 }}
        animate={play ? { y: [0, -9, 0, -4, 0] } : undefined}
        transition={{ delay: celebrate?.hop, duration: 0.9, ease: storyEase }}
      >
        <BunnyIcon width={56} />
      </m.span>
      {lily && (
        <m.span
          className="story-badge__lily"
          initial={play ? { opacity: 0, scale: 0, rotate: -40 } : false}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ ...springs.snappy, delay: celebrate?.lily }}
        >
          <LilyIcon size={30} />
        </m.span>
      )}
    </m.span>
  )
}
