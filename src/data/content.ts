import { TILE_COUNT } from '../game/progress'
import type { GameContent, Level, Question, StaycationPass } from '../game/types'
import levelsFile from './levels.json'
import questionsFile from './questions.json'
import passFile from './staycation-pass.json'

type LevelSettings = Omit<Level, 'questions'>

/** Typed so a missing or misspelled field fails the build. */
const settings: { photo: string; levels: LevelSettings[] } = levelsFile
/** Each level's questions, keyed by level id. */
const questions: Record<string, Question[]> = questionsFile
const pass: StaycationPass = passFile

/** Catches content mistakes the types can't, with a message that says what to fix. */
function check(condition: boolean, message: string) {
  if (!condition) throw new Error(`Content error: ${message}`)
}

function withQuestions(level: LevelSettings): Level {
  const list = questions[level.id] ?? []
  check(list.length > 0, `questions.json has no questions for level ${level.id}.`)
  check(
    level.passMin >= 1 && level.passMin <= list.length,
    `level ${level.id} needs ${level.passMin} correct answers to pass (passMin in levels.json) but has ${list.length} question(s).`,
  )
  list.forEach((question, index) => {
    const where = `level ${level.id}, question ${index + 1} ("${question.text}")`
    check(question.options.length === 4, `${where} needs exactly 4 options.`)
    check(question.correctIndex >= 0 && question.correctIndex <= 3, `${where}: correctIndex must be 0 to 3.`)
  })
  return { ...level, questions: list }
}

const levelIds = new Set(settings.levels.map((level) => String(level.id)))
for (const key of Object.keys(questions)) {
  check(levelIds.has(key), `questions.json has questions for level "${key}", but levels.json has no level with that id.`)
}

const tiles = settings.levels.map((level) => level.tileIndex).sort((a, b) => a - b)
check(
  tiles.length === TILE_COUNT && tiles.every((tile, index) => tile === index),
  `each level in levels.json needs its own tileIndex from 0 to ${TILE_COUNT - 1}, with no repeats (found ${tiles.join(', ')}).`,
)

check(pass.details.length > 0, 'staycation-pass.json needs at least one entry in "details".')
const { webAppUrl, start: startText, end: endText } = pass.calendarInvite
if (webAppUrl) {
  check(
    /^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(webAppUrl),
    'staycation-pass.json "calendarInvite.webAppUrl" needs the deployed Google Apps Script /exec URL.',
  )
}
if (startText || endText) {
  const start = Date.parse(startText)
  const end = Date.parse(endText)
  check(Number.isFinite(start), 'staycation-pass.json "calendarInvite.start" needs a valid ISO date and time.')
  check(Number.isFinite(end) && end > start, 'staycation-pass.json "calendarInvite.end" needs to be after its start.')
}

/** All editable game content: photo and level settings from levels.json, questions from questions.json, the ticket from staycation-pass.json. */
export const content: GameContent = { ...settings, pass, levels: settings.levels.map(withQuestions) }
