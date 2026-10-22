import { m, useReducedMotion, type Variants } from 'motion/react'
import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { lineReveal, reveal, storyEase } from '../../motion/tokens'
import { BunnyIcon } from '../../components/BunnyIcon'
import { Pressable } from '../../components/Pressable'
import { IntroAmbience } from '../../components/ambience/IntroAmbience'

const BunnyStage = lazy(() => import('./stage/BunnyStage'))

/** The greeting waits for the 3D stage so its one-off setup work never lands mid-sequence; slow devices start anyway. */
const STAGE_WAIT_MS = 2500

/** Greeting beats in seconds, matching the 3D scene: bunny and lily arrive first, the lily finishes opening by ~3.4s. */
const BEATS = { scene: 0.05, top: 0.3, greeting: 1.0, headline: 2.0, surprise: 3.4, invite: 4.8, action: 5.2, nudge: 5.6, hint: 5.9 }

const stopPop: Variants = {
  hidden: { scale: 0, opacity: 0 },
  shown: { scale: 1, opacity: 1, transition: { delay: BEATS.headline + 1, type: 'spring', stiffness: 520, damping: 16 } },
  instant: { scale: 1, opacity: 1, transition: { duration: 0.25 } },
}

const hop: Variants = {
  hidden: { y: 0 },
  shown: { y: [0, -6, 0, -3, 0], transition: { delay: BEATS.nudge, duration: 0.9, ease: storyEase } },
  instant: { y: 0 },
}

export function StoryIntro({ hasProgress, onStart }: { hasProgress: boolean; onStart: () => void }) {
  const reduce = useReducedMotion()
  const [skipped, setSkipped] = useState(false)
  const [stageReady, setStageReady] = useState(false)
  const markReady = useCallback(() => setStageReady(true), [])
  const still = Boolean(reduce) || hasProgress

  useEffect(() => {
    const timer = window.setTimeout(markReady, STAGE_WAIT_MS)
    return () => window.clearTimeout(timer)
  }, [markReady])

  return (
    <m.main
      className="screen intro"
      initial={still ? false : 'hidden'}
      animate={still || skipped ? 'instant' : stageReady ? 'shown' : 'hidden'}
      onClick={() => setSkipped(true)}
    >
      <m.div className="intro-ambience-layer" variants={reveal(BEATS.scene, 0, 1.6)}>
        <IntroAmbience />
      </m.div>

      <m.header className="intro-top" variants={reveal(BEATS.top, 0, 0.6)}>
        <span className="intro-top__level">Level 25</span>
        <span>Birthday Quest</span>
      </m.header>

      <div className="intro-copy">
        <m.p className="intro-greeting" variants={reveal(BEATS.greeting, 10, 0.8)}>
          Hi, Guen.
        </m.p>
        <h1 className="intro-headline">
          <span className="intro-line">
            <m.span variants={lineReveal(BEATS.headline)}>Happy</m.span>
          </span>{' '}
          <span className="intro-line">
            <m.span variants={lineReveal(BEATS.headline + 0.18)}>
              Birthday
              <m.span className="intro-headline__stop" variants={stopPop}>.</m.span>
            </m.span>
          </span>
        </h1>
        <m.p className="intro-message" variants={reveal(BEATS.surprise, 8, 0.8)}>
          I made you something.
        </m.p>
        <m.p className="intro-invite" variants={reveal(BEATS.invite, 8, 0.8)}>
          It's a small game.{' '}
          <m.span className="intro-invite__ask" variants={reveal(BEATS.invite + 0.4, 6, 0.7)}>
            Ready to play?
          </m.span>
        </m.p>
      </div> 

      <m.div className="intro-stage" variants={reveal(BEATS.scene, 16, 1)}>
        <Suspense fallback={<div className="bunny-stage" aria-hidden="true" />}>
          <BunnyStage onReady={markReady} />
        </Suspense>
        <m.p className="intro-hint" variants={reveal(BEATS.hint, 4, 0.6)} aria-hidden="true">
          Drag to turn · Tap to say hi
        </m.p>
      </m.div>

      <m.div className="intro-actions" variants={reveal(BEATS.action, 12, 0.7)}>
        <Pressable
          className="intro-button"
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onStart()
          }}
        >
          <m.span className="intro-button__bunny" variants={hop}>
            <BunnyIcon width={26} />
          </m.span>
          {hasProgress ? 'Continue your story' : 'Begin your story'}
        </Pressable>
      </m.div>
    </m.main>
  )
}
