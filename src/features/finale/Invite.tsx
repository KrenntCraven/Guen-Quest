import { m, useReducedMotion } from 'motion/react'
import { Fragment } from 'react'
import { BunnyButton } from '../../components/BunnyButton'
import { IntroAmbience } from '../../components/ambience/IntroAmbience'
import { Petals } from '../../components/ambience/Petals'
import { StoryBadge } from '../../components/StoryBadge'
import { fadeSlide, lineReveal, reveal, stamp, tween } from '../../motion/tokens'
import { notifyAcceptance } from './notifyAcceptance'
import { StaycationTicket } from './StaycationTicket'

/**
 * "Level 25 complete." beats in seconds: the scene, the lily joining the bunny with a burst of hearts, the stamp,
 * the line word by word, the message, then the bunny's happy hop.
 */
const ACCEPTED = { scene: 0.05, lily: 0.4, burst: 0.5, stamp: 0.75, title: 0.95, message: 1.5, hop: 1.95 }
const ACCEPTED_TITLE = 'Level 25 complete.'.split(' ')

/** The staycation invite; once accepted it becomes "Level 25 complete.", framed by the intro's ambience. */
export function Invite({ accepted, onAccept }: { accepted: boolean; onAccept: () => void }) {
  const reduce = useReducedMotion()

  if (accepted) {
    return (
      <m.main className="screen centered-screen accepted-screen" initial={reduce ? false : 'hidden'} animate="shown">
        <m.div className="intro-ambience-layer" variants={reveal(ACCEPTED.scene, 0, 1.6)}>
          <IntroAmbience />
        </m.div>
        <StoryBadge lily celebrate={ACCEPTED} />
        <m.span className="eyebrow" variants={stamp(ACCEPTED.stamp)}>
          Reservation accepted
        </m.span>
        <h1>
          {ACCEPTED_TITLE.map((word, index) => (
            <Fragment key={word}>
              {index > 0 && ' '}
              <span className="story-word">
                <m.span variants={lineReveal(ACCEPTED.title + index * 0.09, 0.8)}>{word}</m.span>
              </span>
            </Fragment>
          ))}
        </h1>
        <m.p variants={reveal(ACCEPTED.message, 10, 0.8)}>See you there.</m.p>
      </m.main>
    )
  }

  return (
    <main className="screen invite-screen story-split">
      <Petals count={6} />
      <m.header
        className="story-split__top"
        variants={fadeSlide}
        initial={reduce ? { opacity: 1, y: 0 } : 'initial'}
        animate="animate"
        transition={reduce ? { duration: 0 } : tween.text}
      >
        <span className="eyebrow">A birthday escape for two</span>
        <h1>You're invited.</h1>
        <p>Pack a small bag. Our next adventure is waiting.</p>
      </m.header>
      <StaycationTicket />
      <div className="split-group story-split__bottom">
        <BunnyButton
          onClick={() => {
            notifyAcceptance()
            onAccept()
          }}
          hopDelay={1.2}
        >
          Accept this adventure
        </BunnyButton>
      </div>
    </main>
  )
}
