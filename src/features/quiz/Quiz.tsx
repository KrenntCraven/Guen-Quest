import { AnimatePresence, m, useReducedMotion } from 'motion/react'
import { useRef } from 'react'
import { CloseIcon } from '../../components/icons'
import { isCorrectAnswer } from '../../game/scoring'
import type { Level } from '../../game/types'
import { textRise, tween } from '../../motion/tokens'
import { AnswerButton } from './AnswerButton'
import { Countdown } from './Countdown'
import { QuizFeedback } from './QuizFeedback'
import { TimerBar } from './TimerBar'
import { useQuizRound } from './useQuizRound'

/** Kahoot identities: each option position always keeps its shape (and colour, in CSS). */
const ANSWER_SHAPES = [
  { shape: '▲', label: 'Triangle' },
  { shape: '◆', label: 'Diamond' },
  { shape: '●', label: 'Circle' },
  { shape: '■', label: 'Square' },
]

export function Quiz({
  level,
  onExit,
  onComplete,
}: {
  level: Level
  onExit: () => void
  onComplete: (correct: number, score: number) => void
}) {
  const reduce = useReducedMotion()
  const answersRef = useRef<HTMLDivElement>(null)
  const { question, questionIndex, deadline, selected, answered, submitAnswer } = useQuizRound(level, onComplete)

  return (
    <main className="screen quiz-screen">
      <header className="quiz-header">
        <button className="icon-button" type="button" onClick={onExit} aria-label="Exit quiz">
          <CloseIcon />
        </button>
        <div className="quiz-header__title"><span>Level {level.id}</span><strong>{level.title}</strong></div>
        <span className="question-count">{questionIndex + 1}/{level.questions.length}</span>
      </header>

      <TimerBar questionIndex={questionIndex} timeLimit={question.timeLimit} paused={answered} />

      <section className="question-card">
        <AnimatePresence mode="wait">
          <m.div
            key={questionIndex}
            className="question-copy"
            variants={textRise}
            initial={reduce ? { opacity: 1, y: 0 } : 'initial'}
            animate="animate"
            exit={reduce ? { opacity: 1, y: 0 } : 'exit'}
            transition={reduce ? { duration: 0 } : tween.text}
          >
            <span className="eyebrow">Question {questionIndex + 1}</span>
            <h1>{question.text}</h1>
          </m.div>
        </AnimatePresence>
        <Countdown key={questionIndex} deadline={deadline} running={!answered} />
      </section>

      <div className="answer-grid" ref={answersRef}>
        {question.options.map((option, index) => (
          <AnswerButton
            key={`${questionIndex}-${index}`}
            index={index}
            label={option}
            shape={ANSWER_SHAPES[index].shape}
            shapeLabel={ANSWER_SHAPES[index].label}
            answered={answered}
            isCorrect={isCorrectAnswer(question, index)}
            isSelected={index === selected}
            celebrateOnlyIfSelected={question.anyCorrect}
            onSelect={submitAnswer}
          />
        ))}
      </div>

      <QuizFeedback question={question} selected={selected} answersRef={answersRef} />
    </main>
  )
}
