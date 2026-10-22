/** Shapes of the editable content in `data/levels.json`, `data/questions.json` and `data/staycation-pass.json`. */
export type Question = {
  text: string
  /** Seconds. */
  timeLimit: number
  options: string[]
  correctIndex: number
  /** When true, every option is accepted; `correctIndex` remains the fallback/default answer. */
  anyCorrect?: boolean
  /** Shown in the feedback toast after the answer. */
  memory: string
}

export type Level = {
  id: number
  title: string
  /** Correct answers needed to pass. */
  passMin: number
  /** Photo tile revealed on passing (0 to 8, row by row). */
  tileIndex: number
  questions: Question[]
}

type TicketStop = { place: string; note: string }

/** Every line of text on the staycation ticket, top to bottom. */
export type StaycationPass = {
  header: { left: string; title: string; right: string }
  route: { from: TicketStop; symbol: string; to: TicketStop }
  /** Shown two per row. */
  details: { label: string; value: string }[]
  code: string
  /** Automatic Google Calendar invitation sent through the deployed Apps Script endpoint. */
  calendarInvite: {
    webAppUrl: string
    /** ISO 8601 with an explicit offset, for example 2026-12-01T15:00:00+08:00. */
    start: string
    end: string
    /** Full address used for the Google Calendar location and invitation email. */
    location: string
  }
}

export type GameContent = {
  photo: string
  pass: StaycationPass
  levels: Level[]
}

export type Stars = 0 | 1 | 2 | 3

/** Saved progress; persisted as-is to localStorage, so keep the field names stable. */
export type GameState = {
  currentLevel: number
  stars: Record<number, Stars>
  revealedTiles: number[]
  score: number
  inviteAccepted: boolean
}

export type LevelResult = {
  level: Level
  correct: number
  score: number
  passed: boolean
  stars: Stars
}
