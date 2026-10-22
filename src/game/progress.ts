import type { GameState, Level, LevelResult, Stars } from './types'

/** One level per tile of the 3x3 photo. */
export const LEVEL_COUNT = 9
export const TILE_COUNT = 9

export const freshState: GameState = {
  currentLevel: 1,
  stars: {},
  revealedTiles: [],
  score: 0,
  inviteAccepted: false,
}

/** Unlocks the next level, keeps the best star rating, reveals the level's tile and banks the points. */
export function applyPassedLevel(state: GameState, { level, stars, score }: LevelResult): GameState {
  return {
    ...state,
    currentLevel: Math.min(LEVEL_COUNT, Math.max(state.currentLevel, level.id + 1)),
    stars: {
      ...state.stars,
      [level.id]: Math.max(state.stars[level.id] ?? 0, stars) as Stars,
    },
    revealedTiles: state.revealedTiles.includes(level.tileIndex)
      ? state.revealedTiles
      : [...state.revealedTiles, level.tileIndex],
    score: state.score + score,
  }
}

export function acceptInvite(state: GameState): GameState {
  return { ...state, inviteAccepted: true }
}

export const isPhotoComplete = (state: GameState) => state.revealedTiles.length === TILE_COUNT

/** Passing the last level leads to the finale instead of back to the map. */
export const isFinalLevel = (level: Level) => level.id === LEVEL_COUNT

export type LevelStatus = { stars: Stars; locked: boolean; completed: boolean; current: boolean }

/** Only the next unlocked level is "current"; completed levels stay replayable for more stars. */
export function levelStatus(state: GameState, level: Level): LevelStatus {
  const stars = state.stars[level.id] ?? 0
  const locked = level.id > state.currentLevel
  const completed = stars > 0
  return { stars, locked, completed, current: !locked && !completed }
}
