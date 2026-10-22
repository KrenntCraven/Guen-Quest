import { useCallback, useState } from 'react'
import { acceptInvite, applyPassedLevel, freshState } from './progress'
import { clearProgress, hasSavedProgress, loadProgress, saveProgress } from './storage'
import type { GameState, LevelResult } from './types'

/**
 * Saved progress for the whole game. Every change is written to localStorage straight away, so closing the tab
 * mid-game resumes from the last result. Nothing is saved until the first level is passed.
 */
export function useGameProgress() {
  const [state, setState] = useState<GameState>(loadProgress)
  const [hasProgress, setHasProgress] = useState(hasSavedProgress)

  const update = useCallback((change: (previous: GameState) => GameState) => {
    setState((previous) => {
      const next = change(previous)
      saveProgress(next)
      return next
    })
  }, [])

  const recordPass = useCallback(
    (result: LevelResult) => {
      update((previous) => applyPassedLevel(previous, result))
      setHasProgress(true)
    },
    [update],
  )

  const accept = useCallback(() => update(acceptInvite), [update])

  const reset = useCallback(() => {
    clearProgress()
    setState(freshState)
    setHasProgress(false)
  }, [])

  return { state, hasProgress, recordPass, acceptInvite: accept, reset }
}
