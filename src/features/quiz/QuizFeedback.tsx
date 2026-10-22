import { AnimatePresence, m, useReducedMotion } from 'motion/react'
import { useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { BunnyIcon } from '../../components/BunnyIcon'
import { isCorrectAnswer } from '../../game/scoring'
import type { Question } from '../../game/types'
import { springs } from '../../motion/tokens'
import type { Selection } from './useQuizRound'

/** Space (px) kept between a lifted toast and the answers below it. */
const LIFT_GAP = 10

/**
 * The toast after each answer: the verdict and the question's memory line, carried by the bunny.
 * It sits at the bottom of the screen; if a long memory line would make it cover the answers (small phones),
 * it rises to sit just above them, over the already-answered question.
 */
export function QuizFeedback({
  question,
  selected,
  answersRef,
}: {
  question: Question
  selected: Selection
  answersRef: RefObject<HTMLElement | null>
}) {
  const reduce = useReducedMotion()
  const anchorRef = useRef<HTMLDivElement>(null)
  const [lift, setLift] = useState<{ question: Question; bottom: number } | null>(null)
  const correct = selected !== undefined && isCorrectAnswer(question, selected)
  const liftBottom = lift?.question === question ? lift.bottom : undefined

  useLayoutEffect(() => {
    if (selected === undefined) return
    const anchor = anchorRef.current
    const answers = answersRef.current?.getBoundingClientRect()
    const toast = anchor?.firstElementChild?.getBoundingClientRect()
    if (!anchor || !answers || !toast) return
    // The anchor isn't transformed by the toast's entrance, so its top is where the toast will settle.
    const top = anchor.getBoundingClientRect().top
    const covers = toast.left < answers.right && toast.right > answers.left && top < answers.bottom
    setLift(covers ? { question, bottom: window.innerHeight - answers.top + LIFT_GAP } : null)
  }, [answersRef, question, selected])

  return (
    <AnimatePresence>
      {selected !== undefined && (
        <div className="feedback-anchor" key="feedback" ref={anchorRef} style={{ bottom: liftBottom }}>
          <m.div
            className={`feedback ${correct ? 'feedback--correct' : ''}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={reduce ? { duration: 0 } : springs.snappy}
          >
            <BunnyIcon className="feedback__bunny" width={34} />
            <div>
              <strong>{correct ? 'You got it!' : selected === null ? "Time's up!" : 'Not quite!'}</strong>
              <p>{question.memory}</p>
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  )
}
