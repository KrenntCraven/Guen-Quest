import type { Question } from '../../game/types'

/** Questions run on an absolute deadline (performance.now() ms) so timers and scoring never drift apart. */
export const deadlineFor = (question: Question) => performance.now() + question.timeLimit * 1000

export const secondsUntil = (deadline: number) => Math.max(0, Math.ceil((deadline - performance.now()) / 1000))
