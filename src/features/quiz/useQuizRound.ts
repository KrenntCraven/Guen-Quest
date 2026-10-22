import { useCallback, useEffect, useState } from 'react'
import { answerPoints, isCorrectAnswer } from '../../game/scoring'
import type { Level, Question } from '../../game/types'
import { deadlineFor } from './deadline'

/** `undefined` while the question is open, the chosen option once answered, `null` if time ran out. */
export type Selection = number | null | undefined

/** How long the feedback toast stays up before the next question (or the result). */
const FEEDBACK_MS = 1800

/**
 * Runs one level's questions: the deadline, the answer (or timeout), the score for speed, and the pause on the
 * feedback before moving on. Calls `onComplete` with the number of correct answers and the points earned.
 */
export function useQuizRound(level: Level, onComplete: (correct: number, score: number) => void) {
  const [questionIndex, setQuestionIndex] = useState(0)
  const [deadline, setDeadline] = useState(() => deadlineFor(level.questions[0]))
  const [selected, setSelected] = useState<Selection>(undefined)
  const [answers, setAnswers] = useState<boolean[]>([])
  const [earnedScore, setEarnedScore] = useState(0)
  const question: Question = level.questions[questionIndex]

  const submitAnswer = useCallback(
    (answerIndex: number) => {
      if (selected !== undefined) return
      const timeLeft = Math.max(0, deadline - performance.now()) / 1000
      const correct = isCorrectAnswer(question, answerIndex)
      setSelected(answerIndex)
      setEarnedScore((score) => score + answerPoints(correct, timeLeft, question.timeLimit))
    },
    [deadline, question, selected],
  )

  useEffect(() => {
    if (selected !== undefined) return
    const timer = window.setTimeout(() => setSelected(null), Math.max(0, deadline - performance.now()))
    return () => window.clearTimeout(timer)
  }, [deadline, selected])

  useEffect(() => {
    if (selected === undefined) return
    const correct = isCorrectAnswer(question, selected)
    const nextAnswers = [...answers, correct]
    const timer = window.setTimeout(() => {
      if (questionIndex === level.questions.length - 1) {
        onComplete(nextAnswers.filter(Boolean).length, earnedScore)
        return
      }
      setAnswers(nextAnswers)
      setQuestionIndex((index) => index + 1)
      setDeadline(deadlineFor(level.questions[questionIndex + 1]))
      setSelected(undefined)
    }, FEEDBACK_MS)
    return () => window.clearTimeout(timer)
  }, [answers, earnedScore, level.questions, onComplete, question, questionIndex, selected])

  return { question, questionIndex, deadline, selected, answered: selected !== undefined, submitAnswer }
}
