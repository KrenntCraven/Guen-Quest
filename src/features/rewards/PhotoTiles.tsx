import { m, useReducedMotion } from 'motion/react'
import type { CSSProperties } from 'react'
import { content } from '../../data/content'
import { TILE_COUNT } from '../../game/progress'
import { springs } from '../../motion/tokens'

export function PhotoTiles({
  revealedTiles,
  complete = false,
  highlightTile,
  cinematic = false,
  delay = 0,
}: {
  revealedTiles: number[]
  complete?: boolean
  highlightTile?: number
  cinematic?: boolean
  /** Seconds before the cinematic assembly starts, so it can follow a frame's entrance. */
  delay?: number
}) {
  const reduce = useReducedMotion()

  return (
    <div className={`photo-grid ${complete ? 'photo-grid--complete' : ''}`}>
      {Array.from({ length: TILE_COUNT }, (_, index) => {
        const revealed = complete || revealedTiles.includes(index)
        const highlight = highlightTile === index
        return (
          <m.div
            className={`photo-tile ${revealed ? 'photo-tile--revealed' : ''} ${
              highlight ? 'photo-tile--new' : ''
            }`}
            key={index}
            initial={revealed && !reduce ? { opacity: 0, scale: 0.84 } : false}
            animate={
              highlight && !reduce
                ? { opacity: 1, scale: [0.84, 1.08, 1] }
                : { opacity: 1, scale: 1 }
            }
            transition={
              reduce
                ? { duration: 0 }
                : { ...springs.soft, delay: cinematic ? delay + 0.15 + index * 0.055 : highlight ? 0.2 : 0 }
            }
          >
            {revealed ? (
              <span className="photo-tile__window">
                <span
                  className="photo-tile__image"
                  style={{ '--col': index % 3, '--row': Math.floor(index / 3), backgroundImage: `url(${content.photo})` } as CSSProperties}
                />
              </span>
            ) : (
              <span>♥</span>
            )}
          </m.div>
        )
      })}
    </div>
  )
}
