import { freshState } from './progress'
import type { GameState } from './types'

/** Changing the key would orphan every saved game, so it stays fixed. */
export const STORAGE_KEY = 'level-25-progress'

export function loadProgress(): GameState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? { ...freshState, ...JSON.parse(saved) } : freshState
  } catch {
    return freshState
  }
}

export const hasSavedProgress = () => localStorage.getItem(STORAGE_KEY) !== null

export const saveProgress = (state: GameState) => localStorage.setItem(STORAGE_KEY, JSON.stringify(state))

export const clearProgress = () => localStorage.removeItem(STORAGE_KEY)
