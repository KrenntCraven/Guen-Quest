import type { CSSProperties } from 'react'

/** The bar turns pink for this many final seconds. */
const TIMER_WARN_SECONDS = 6

/** A CSS-animated bar (drain and warning colour run on the compositor); keyed per question to restart it. */
export function TimerBar({ questionIndex, timeLimit, paused }: { questionIndex: number; timeLimit: number; paused: boolean }) {
  return (
    <div className={`timer-track ${paused ? 'timer-track--paused' : ''}`} aria-hidden="true">
      <span
        key={questionIndex}
        style={{
          '--timer-duration': `${timeLimit}s`,
          '--timer-warn-at': `${Math.max(0, timeLimit - TIMER_WARN_SECONDS)}s`,
        } as CSSProperties}
      />
    </div>
  )
}
