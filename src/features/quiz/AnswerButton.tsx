import { m, useReducedMotion } from 'motion/react'
import { memo } from 'react'
import { springs, tween } from '../../motion/tokens'

const BURST = Array.from({ length: 6 }, (_, index) => {
  const angle = (index / 6) * Math.PI * 2
  return { x: Math.cos(angle) * 30, y: Math.sin(angle) * 24 }
})

function Burst() {
  return (
    <span className="burst" aria-hidden="true">
      {BURST.map((point, index) => (
        <m.span
          key={index}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0.4 }}
          animate={{ x: point.x, y: point.y, opacity: 0, scale: 1 }}
          transition={{ duration: 0.48, ease: 'easeOut' }}
        />
      ))}
    </span>
  )
}

export const AnswerButton = memo(function AnswerButton({
  index,
  label,
  shape,
  shapeLabel,
  answered,
  isCorrect,
  isSelected,
  celebrateOnlyIfSelected = false,
  onSelect,
}: {
  index: number
  label: string
  shape: string
  shapeLabel: string
  answered: boolean
  isCorrect: boolean
  isSelected: boolean
  /** For questions where every option is valid, celebrate only the option the player chose. */
  celebrateOnlyIfSelected?: boolean
  onSelect: (index: number) => void
}) {
  const reduce = useReducedMotion()
  const celebrate = answered && isCorrect && (!celebrateOnlyIfSelected || isSelected)
  const shake = answered && isSelected && !isCorrect

  return (
    <m.button
      className={`answer answer--${index} ${celebrate ? 'answer--correct' : ''} ${
        shake ? 'answer--wrong' : ''
      }`}
      type="button"
      disabled={answered}
      data-bloom={isCorrect ? undefined : 'off'}
      onClick={() => onSelect(index)}
      initial={false}
      animate={
        reduce
          ? undefined
          : celebrate
            ? { scale: [1, 1.06, 1], x: 0 }
            : shake
              ? { x: [0, -8, 8, -5, 5, 0], scale: 1 }
              : { x: 0, scale: 1 }
      }
      transition={shake ? tween.shake : springs.snappy}
      whileHover={!answered && !reduce ? { y: -2 } : undefined}
      whileTap={!answered && !reduce ? { scale: 0.97 } : undefined}
    >
      {celebrate && !reduce && (
        <>
          <m.span
            className="answer-flash"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
          />
          {!isSelected && <Burst />}
        </>
      )}
      <span className="answer-shape" aria-label={shapeLabel}>
        {shape}
      </span>
      <span>{label}</span>
    </m.button>
  )
})
