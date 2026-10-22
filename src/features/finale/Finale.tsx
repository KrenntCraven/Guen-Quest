import { m, useReducedMotion } from 'motion/react'
import { Fragment, useEffect, useRef } from 'react'
import { BunnyButton } from '../../components/BunnyButton'
import { FloatingHearts } from '../../components/ambience/Hearts'
import { lineReveal, reveal, springs, storyEase } from '../../motion/tokens'
import { PhotoTiles } from '../rewards/PhotoTiles'
import { StarReward } from '../rewards/StarReward'

/** Finale beats in seconds: the reward, the line word by word, the photo assembling, then the way onward. */
const FINALE = { stars: 0.2, eyebrow: 0.35, title: 0.55, photo: 0.4, tiles: 0.75, sheen: 1.9, message: 1.75, action: 2.15, hop: 2.9 }
const FINALE_TITLE = 'Every piece led back to us.'.split(' ')
/** The finale lets Continue's hearts bloom before the page lifts away; the exit then overlaps their fade. */
const BLOOM_LEAD_MS = 560

/** "Level 24 Complete": the full photo and a love note, the emotional peak before the invite. */
export function Finale({ onContinue }: { onContinue: () => void }) {
  const reduce = useReducedMotion()
  const leaving = useRef(false)
  const leaveTimer = useRef(0)

  useEffect(() => () => window.clearTimeout(leaveTimer.current), [])

  const handleContinue = () => {
    if (leaving.current) return
    leaving.current = true
    if (reduce) onContinue()
    else leaveTimer.current = window.setTimeout(onContinue, BLOOM_LEAD_MS)
  }

  return (
    <m.main
      className="screen centered-screen finale-screen story-split"
      initial={reduce ? false : 'hidden'}
      animate="shown"
    >
      <FloatingHearts count={6} />
      <div className="split-group story-split__top">
        <StarReward stars={3} className="finale-stars" delay={FINALE.stars} />
        <m.span className="eyebrow" variants={reveal(FINALE.eyebrow, 8, 0.6)}>
          Level 24 Complete
        </m.span>
        <h1>
          {FINALE_TITLE.map((word, index) => (
            <Fragment key={word}>
              {index > 0 && ' '}
              <span className="story-word">
                <m.span variants={lineReveal(FINALE.title + index * 0.09, 0.8)}>{word}</m.span>
              </span>
            </Fragment>
          ))}
        </h1>
      </div>
      <m.div className="finale-media story-split__media" variants={reveal(FINALE.photo, 0, 0.6)}>
        <m.div
          className="photo-frame"
          initial={reduce ? false : { opacity: 0, y: 24, scale: 0.9, rotate: -6 }}
          animate={{ opacity: 1, y: 0, scale: 1, rotate: -1.5 }}
          transition={reduce ? { duration: 0 } : { ...springs.gentle, delay: FINALE.photo }}
        >
          <PhotoTiles revealedTiles={[]} complete cinematic delay={FINALE.tiles} />
          {!reduce && (
            <span className="photo-sheen" aria-hidden="true">
              <m.span
                initial={{ transform: 'translateX(-160%) skewX(-18deg)' }}
                animate={{ transform: 'translateX(360%) skewX(-18deg)' }}
                transition={{ delay: FINALE.sheen, duration: 1.3, ease: storyEase }}
              />
            </span>
          )}
        </m.div>
      </m.div>
      <div className="split-group story-split__bottom">
        <m.p variants={reveal(FINALE.message, 10, 0.8)}>
          Happy birthday, Guen. I love you, and I have one more thing to show you.
        </m.p>
        <m.div className="finale-cta" variants={reveal(FINALE.action, 12, 0.7)}>
          <BunnyButton onClick={handleContinue} hopDelay={FINALE.hop}>
            Continue
          </BunnyButton>
        </m.div>
      </div>
    </m.main>
  )
}
