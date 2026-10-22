import { useEffect, useState } from 'react'
import { secondsUntil } from './deadline'

/** Owns the ticking number so the rest of the quiz only re-renders when an answer changes. */
export function Countdown({ deadline, running }: { deadline: number; running: boolean }) {
  const [seconds, setSeconds] = useState(() => secondsUntil(deadline))

  useEffect(() => {
    if (!running) return
    const timer = window.setInterval(() => setSeconds(secondsUntil(deadline)), 250)
    return () => window.clearInterval(timer)
  }, [deadline, running])

  return (
    <span className="timer-number" role="timer" aria-label={`${seconds} seconds remaining`}>
      {seconds}
    </span>
  )
}
