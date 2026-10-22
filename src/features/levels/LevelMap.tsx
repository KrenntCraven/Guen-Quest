import { BunnyButton } from '../../components/BunnyButton'
import { BackIcon } from '../../components/icons'
import { LilyIcon } from '../../components/LilyIcon'
import { content } from '../../data/content'
import { isPhotoComplete, levelStatus } from '../../game/progress'
import type { GameState, Level } from '../../game/types'
import { PhotoTiles } from '../rewards/PhotoTiles'
import { buildPath, PATH_HEIGHT, PATH_POINTS, PATH_POSITIONS, PATH_ROW_HEIGHT } from './levelPath'
import { LevelNode } from './LevelNode'
import { MapBunny } from './MapBunny'

export function LevelMap({
  state,
  markerLevel,
  onMarkerSettled,
  onSelect,
  onFinale,
  onReset,
  onBack,
}: {
  state: GameState
  /** Where the map bunny stands; it hops to `state.currentLevel` when they differ. */
  markerLevel: number
  onMarkerSettled: (level: number) => void
  onSelect: (level: Level) => void
  onFinale: () => void
  onReset: () => void
  onBack: () => void
}) {
  return (
    <main className="screen map-screen">
      <div className="map-layout">
        <header className="game-header">
          <button className="icon-button" type="button" onClick={onBack} aria-label="Back to intro">
            <BackIcon />
          </button>
          <div className="game-header__title">
            <span className="eyebrow">Birthday quest</span>
            <h1>Level 25</h1>
          </div>
          <div className="score-chip">
            <span>Score</span>
            <strong>{state.score.toLocaleString()}</strong>
          </div>
        </header>

        <div className="map-aside">
          <section className="photo-card">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Our picture</span>
                <h2>{state.revealedTiles.length} of 9 pieces found</h2>
              </div>
              <span className="lily-badge" aria-hidden="true">
                <LilyIcon size={26} />
              </span>
            </div>
            <PhotoTiles revealedTiles={state.revealedTiles} />
          </section>
          {isPhotoComplete(state) && (
            <BunnyButton className="finale-button" onClick={onFinale}>
              See the final surprise
            </BunnyButton>
          )}
        </div>

        <section className="level-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Your journey</span>
              <h2>Choose a level</h2>
            </div>
            <span className="progress-label">{state.revealedTiles.length}/9</span>
          </div>
          <div className="level-path" style={{ height: PATH_HEIGHT }}>
            <svg
              className="path-trail"
              viewBox={`0 0 100 ${PATH_HEIGHT}`}
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path className="path-trail__base" d={buildPath(PATH_POINTS)} />
              <path
                className="path-trail__progress"
                d={buildPath(PATH_POINTS.slice(0, Math.max(1, state.currentLevel)))}
              />
            </svg>
            {content.levels.map((level, index) => (
              <LevelNode
                key={level.id}
                level={level}
                index={index}
                status={levelStatus(state, level)}
                onSelect={onSelect}
              />
            ))}
            <MapBunny
              path={PATH_POSITIONS}
              rowHeight={PATH_ROW_HEIGHT}
              from={markerLevel}
              to={state.currentLevel}
              onSettled={onMarkerSettled}
            />
          </div>
        </section>

        <button className="text-button" type="button" onClick={onReset}>
          Reset progress
        </button>
      </div>
    </main>
  )
}
