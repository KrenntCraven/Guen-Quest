import { BunnyButton } from '../../components/BunnyButton'
import { Petals } from '../../components/ambience/Petals'
import { StoryBadge } from '../../components/StoryBadge'
import { isFinalLevel } from '../../game/progress'
import type { LevelResult } from '../../game/types'
import { PhotoTiles } from './PhotoTiles'
import { StarReward } from './StarReward'

/** After a level: stars and the newly revealed photo piece on a pass, an encouraging retry otherwise. */
export function ResultScreen({
  result,
  revealedTiles,
  onContinue,
  onRetry,
}: {
  result: LevelResult
  revealedTiles: number[]
  onContinue: () => void
  onRetry: () => void
}) {
  return (
    <main
      className={`screen centered-screen result-screen ${
        result.passed ? 'result-screen--pass story-split' : 'result-screen--retry'
      }`}
    >
      {result.passed && <Petals count={6} />}
      <div className="split-group story-split__top">
        <StoryBadge lily={result.passed} />
        <span className="eyebrow">Level {result.level.id} · {result.level.title}</span>
        <h1>{result.passed ? 'Memory unlocked!' : 'So close!'}</h1>
        <p>
          {result.passed
            ? `You've found ${revealedTiles.length} of 9 photo pieces.`
            : 'Every great player gets another try. Take a breath and go again.'}
        </p>
        <StarReward stars={result.stars} className="result-stars" />
      </div>
      <div className="split-group story-split__media">
        {result.passed && (
          <div className="result-photo">
            <PhotoTiles revealedTiles={revealedTiles} highlightTile={result.level.tileIndex} />
          </div>
        )}
        <div className="result-stats">
          <div><strong>{result.correct}/{result.level.questions.length}</strong><span>Correct</span></div>
          <div><strong>+{result.score}</strong><span>Points</span></div>
        </div>
      </div>
      <div className="split-group story-split__bottom">
        <BunnyButton onClick={result.passed ? onContinue : onRetry} hopDelay={1.4}>
          {result.passed ? (isFinalLevel(result.level) ? 'Reveal the photo' : 'Back to map') : 'Try again'}
        </BunnyButton>
      </div>
    </main>
  )
}
