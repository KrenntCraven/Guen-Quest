import { AnimatePresence } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'
import { HeartBloomLayer } from '../components/ambience/Hearts'
import { ScreenTransition } from '../components/ScreenTransition'
import { content } from '../data/content'
import { freshState, isFinalLevel } from '../game/progress'
import { evaluateLevel } from '../game/scoring'
import type { Level, LevelResult } from '../game/types'
import { useGameProgress } from '../game/useGameProgress'
import { Finale } from '../features/finale/Finale'
import { Invite } from '../features/finale/Invite'
import { StoryIntro } from '../features/intro/StoryIntro'
import { LevelMap } from '../features/levels/LevelMap'
import { Quiz } from '../features/quiz/Quiz'
import { ResultScreen } from '../features/rewards/ResultScreen'

type Screen = 'intro' | 'map' | 'quiz' | 'result' | 'finale' | 'invite' | 'accepted'

/** Warm the photo cache while the intro plays so the map's puzzle tiles paint without a pop-in. */
const PHOTO_PRELOAD_MS = 2500

/** Screen flow: intro → map ⇄ quiz → result → … → finale → invite → accepted. */
function App() {
  const { state, hasProgress, recordPass, acceptInvite, reset } = useGameProgress()
  const [screen, setScreen] = useState<Screen>('intro')
  const [activeLevel, setActiveLevel] = useState<Level | null>(null)
  const [result, setResult] = useState<LevelResult | null>(null)
  const [markerLevel, setMarkerLevel] = useState(state.currentLevel)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      new Image().src = content.photo
    }, PHOTO_PRELOAD_MS)
    return () => window.clearTimeout(timer)
  }, [])

  const finishLevel = useCallback(
    (correct: number, score: number) => {
      if (!activeLevel) return
      const nextResult = evaluateLevel(activeLevel, correct, score)
      if (nextResult.passed) recordPass(nextResult)
      setResult(nextResult)
      setScreen('result')
    },
    [activeLevel, recordPass],
  )

  const resetProgress = () => {
    reset()
    setMarkerLevel(freshState.currentLevel)
    setScreen('intro')
  }

  let view = (
    <LevelMap
      state={state}
      markerLevel={markerLevel}
      onMarkerSettled={setMarkerLevel}
      onSelect={(level) => {
        setActiveLevel(level)
        setScreen('quiz')
      }}
      onFinale={() => setScreen('finale')}
      onReset={resetProgress}
      onBack={() => setScreen('intro')}
    />
  )
  if (screen === 'intro') view = <StoryIntro hasProgress={hasProgress} onStart={() => setScreen('map')} />
  else if (screen === 'quiz' && activeLevel) {
    view = <Quiz level={activeLevel} onExit={() => setScreen('map')} onComplete={finishLevel} />
  } else if (screen === 'result' && result) {
    view = (
      <ResultScreen
        result={result}
        revealedTiles={state.revealedTiles}
        onRetry={() => setScreen('quiz')}
        onContinue={() => setScreen(isFinalLevel(result.level) ? 'finale' : 'map')}
      />
    )
  } else if (screen === 'finale') view = <Finale onContinue={() => setScreen('invite')} />
  else if (screen === 'invite' || screen === 'accepted') {
    view = (
      <Invite
        accepted={state.inviteAccepted}
        onAccept={() => {
          acceptInvite()
          setScreen('accepted')
        }}
      />
    )
  }

  return (
    <>
      <AnimatePresence mode="wait">
        <ScreenTransition key={screen} leave={screen === 'finale' ? 'bloom' : 'slide'}>
          {view}
        </ScreenTransition>
      </AnimatePresence>
      <HeartBloomLayer />
    </>
  )
}

export default App
