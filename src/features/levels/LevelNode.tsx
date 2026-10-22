import { m, useReducedMotion } from 'motion/react'
import type { CSSProperties } from 'react'
import { LockIcon } from '../../components/icons'
import type { LevelStatus } from '../../game/progress'
import type { Level } from '../../game/types'
import { springs } from '../../motion/tokens'
import { StarReward } from '../rewards/StarReward'
import { PATH_POSITIONS, PATH_ROW_HEIGHT } from './levelPath'

/** One stop on the winding path: the numbered circle plus its label card, placed on the side with more room. */
export function LevelNode({
  level,
  index,
  status,
  onSelect,
}: {
  level: Level
  index: number
  status: LevelStatus
  onSelect: (level: Level) => void
}) {
  const reduce = useReducedMotion()
  const { stars, locked, completed, current } = status
  const x = PATH_POSITIONS[index]
  const labelLeft = x > 0.5
  const statusLabel = completed ? `${stars} of 3 stars` : locked ? 'locked' : 'ready to play'

  return (
    <div className="level-row" style={{ '--x': x, height: PATH_ROW_HEIGHT } as CSSProperties}>
      <button
        className={`level-node ${labelLeft ? 'level-node--label-left' : ''} ${
          locked ? 'level-node--locked' : ''
        } ${completed ? 'level-node--completed' : ''} ${current ? 'level-node--current' : ''}`}
        disabled={locked}
        onClick={() => onSelect(level)}
        type="button"
        aria-label={`Level ${level.id}: ${level.title}, ${statusLabel}`}
      >
        <m.span
          className="node-number"
          data-bloom-anchor
          initial={current && !reduce ? { scale: 0.72, opacity: 0 } : false}
          animate={{ scale: 1, opacity: 1 }}
          transition={reduce ? { duration: 0 } : springs.snappy}
        >
          {current && !reduce && (
            <m.span
              className="node-pulse"
              aria-hidden="true"
              initial={{ transform: 'scale(0.92)', opacity: 0.8 }}
              animate={{ transform: 'scale(1.3)', opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
            />
          )}
          {locked ? <LockIcon /> : level.id}
        </m.span>
        <span className="node-info">
          <strong>{level.title}</strong>
          {completed ? (
            <StarReward stars={stars} />
          ) : (
            <span className="node-status">{locked ? 'Locked' : 'Play now'}</span>
          )}
        </span>
      </button>
    </div>
  )
}
