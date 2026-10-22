import type { Level, LevelResult, Question, Stars } from './types'

/** Whether a submitted option is accepted. A timeout (`null`) is never correct. */
export function isCorrectAnswer(question: Question, answerIndex: number | null) {
  return answerIndex !== null && (question.anyCorrect === true || answerIndex === question.correctIndex)
}

/** A correct answer earns 500 points plus up to 500 more for speed; a wrong or missed one earns nothing. */
export function answerPoints(correct: boolean, secondsLeft: number, timeLimit: number) {
  return correct ? Math.round(500 + 500 * Math.min(1, secondsLeft / timeLimit)) : 0
}

/** No stars below the pass mark, 3 for a perfect level, 2 for beating the pass mark, otherwise 1. */
export function starsFor(level: Level, correct: number): Stars {
  if (correct < level.passMin) return 0
  if (correct === level.questions.length) return 3
  return correct > level.passMin ? 2 : 1
}

export function evaluateLevel(level: Level, correct: number, score: number): LevelResult {
  return { level, correct, score, passed: correct >= level.passMin, stars: starsFor(level, correct) }
}
