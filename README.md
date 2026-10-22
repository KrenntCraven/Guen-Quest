# Level 25: Guen's Birthday Quest

A small, mobile-first birthday game delivered by QR code. Guen opens a storybook intro, plays through a 9-level map of timed quiz levels about us, uncovers a couple photo one tile at a time, and finishes with a staycation invite she can accept.

This README covers how the game is built and how to change it. The product spec, [`birthday-quest-spec.md`](./birthday-quest-spec.md), covers what each screen does in detail and what's left before launch.

## Getting started

Requires Node.js 20.19 or newer (needed by Vite 8).

```bash
npm install
npm run dev       # local dev server with hot reload
npm run build     # type-check and build into dist/
npm run preview   # serve the production build locally
npm run lint      # oxlint
```

To test on a phone, run `npm run dev -- --host` and open the network URL shown in the terminal while on the same Wi-Fi.

## Private entrance with Supabase

The quest starts with Google sign-in. Only `krenntc@gmail.com` and `guenyli8@gmail.com` are allowed through; any other account is immediately signed out.

1. Create a [Supabase](https://supabase.com/) project.
2. In **Authentication → Providers**, enable Google and add the Google OAuth client ID and secret. In Google Cloud, add the Supabase callback URL shown on that provider page as an authorized redirect URI.
3. In **Authentication → URL Configuration**, set the Site URL to the deployed quest URL. Add `http://localhost:5173/**` and the final deployed URL to Redirect URLs.
4. Copy `.env.example` to `.env.local`, then add the project URL and publishable key from **Project Settings → API**:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

5. Restart the Vite development server after changing environment variables. Add the same two variables to the Vercel or Netlify project before deploying.

The publishable key is designed to be used in browser code; never put the Supabase service-role key in this project. This login gates the app UI, but files in a public static deployment can still be fetched directly.

## How the game works

```text
Intro ──► Level map ──► Quiz ──► Result ──► back to the map (or "Try again")
  ▲           │                    │
  └─ back ────┤                    └─ after level 9 ──┐
              └─ all 9 tiles: "See the final surprise" ─► Finale ──► Invite ──► "Level 25 complete."
```

1. **Intro:** an interactive 3D bunny beside a violet lily that blooms as she arrives. Once the scene is ready (or after 2.5 seconds at most), a roughly 6-second sequence builds up "Hi, Guen.", "Happy Birthday.", "I made you something." and "It's a small game. Ready to play?", then the "Begin your story" button.
   - The bunny follows the pointer, turns when dragged, and hops when tapped (or focused and Enter or Space is pressed).
   - Tapping anywhere else skips the sequence.
   - Returning players see the intro already settled, with "Continue your story".
2. **Level map:** the score, the photo card and 9 levels on a winding path.
   - Only the next unlocked level is playable; completed levels can be replayed for more stars.
   - A small bunny stands beside the current level and hops along the path when a new one unlocks.
   - The back button returns to the intro, and "Reset progress" clears the save.
   - Once all 9 tiles are found, "See the final surprise" opens the finale.
3. **Quiz:** Kahoot-style questions, each with its own timer (20 seconds in the current content) and four colored answers.
   - A correct answer scores 500 to 1000 points depending on speed.
   - After each answer, the correct option is highlighted and a feedback toast shows the question's memory line for 1.8 seconds. If the toast would cover the answers (long memory lines on small phones), it rises to sit just above them.
   - The timer bar turns pink for the last 6 seconds.
   - The close button returns to the map without saving.
4. **Result:** passing (at least `passMin` correct) awards 1 to 3 stars and reveals one tile of the 3x3 photo. Then she goes "Back to map", or "Reveal the photo" after level 9. Failing offers an unlimited "Try again".
5. **Finale:** "Level 24 Complete" shows the full photo with a love note.
6. **Invite:** the staycation pass. "Accept this adventure" saves the answer and shows "Level 25 complete." / "See you there."

Progress is saved to `localStorage` under the key `level-25-progress` after every passed level and when the invite is accepted, so the game resumes where she left off. Failed or abandoned quizzes save nothing. To start over while testing, use "Reset progress" on the map or clear that key in the browser's dev tools.

## Editing the content

All game content lives in three JSON files in `src/data/`, so it can change without touching code. All three are type-checked against `src/game/types.ts`, so a missing or misspelled field fails the build instead of breaking the game.

[`questions.json`](./src/data/questions.json) holds only the questions, grouped by level number (`"1"` to `"9"`):

```json
"1": [
  {
    "text": "Where was our first date?",
    "timeLimit": 20,
    "options": ["Place A", "Place B", "Place C", "Place D"],
    "correctIndex": 1,
    "memory": "Replace this with a memory from your first date."
  }
]
```

- Each question has `text`, `timeLimit` in seconds, four `options`, `correctIndex` (0 to 3, counting from the first option) and a `memory` line shown after the answer.
- Add `"anyCorrect": true` when every option should count as correct. Keep `correctIndex` as the default answer; without `anyCorrect`, only that indexed option is accepted.
- A level can have any number of questions, but every level needs at least one, and its `passMin` in `levels.json` can't be more than its number of questions.
- Only the level numbers in `levels.json` (`"1"` to `"9"`) are used. To add a question, put it inside an existing level's list rather than under a new number.
- If something's wrong, the game shows a "Content error" naming the level instead of starting, so mistakes show up as soon as you open it. It checks for a missing level, an extra level number, a `passMin` that's too high, anything other than four options, and a `correctIndex` outside 0 to 3.

[`staycation-pass.json`](./src/data/staycation-pass.json) holds the ticket text and Calendar invitation settings:

- `header`: the dark strip, with `left` ("LEVEL 25"), the centered `title` ("STAYCATION PASS") and `right` ("FOR GUEN ♥").
- `route`: `from` and `to`, each a big `place` ("HOME", "ESCAPE") with a small `note` under it, joined by `symbol` on the dotted line.
- `details`: the label and value boxes, shown two per row. Edit the `value`s for the real date, check-in time, duration and destination. You can also rename, add or remove boxes, but keep at least one and an even count so the grid stays full.
- `code`: the strip along the bottom.
- `calendarInvite`: settings for the automatic Google Calendar invitation. `guestEmail` is currently `Krenntc@gmail.com`. Fill `start` and `end` with ISO timestamps that include the UTC offset, such as `2026-12-01T15:00:00+08:00`, and put the deployed Apps Script `/exec` URL in `webAppUrl`.

To enable the Calendar invitation:

1. Open [Google Apps Script](https://script.google.com/) while signed into the Google account whose calendar should own the event.
2. Create a project and paste [`tools/google-calendar-invite.gs`](./tools/google-calendar-invite.gs) into `Code.gs`.
3. Choose **Deploy → New deployment → Web app**, set **Execute as** to **Me** and **Who has access** to **Anyone**, then authorize Calendar and Gmail access. After any later edit to the script, use **Deploy → Manage deployments → Edit → Version: New version** so the same `/exec` URL runs the new code.
4. Copy the deployment's `/exec` URL into `calendarInvite.webAppUrl`, and fill its `start` and `end`.

Pressing "Accept this adventure" then creates the event once and asks Google Calendar to email the guest. Google never emails an event's own organizer, so if the guest is the account the script runs as, the script sends a styled staycation-pass email instead. To test without the game, choose `sendSample` in the editor's function menu and click **Run**. Repeated taps for the same guest and start time do not create duplicates. The celebration does not wait for Google. Empty placeholders disable the request, so local testing remains safe.

[`levels.json`](./src/data/levels.json) holds everything else:

- `photo`: path to the couple photo, served from `public/` (currently `/couple-photobooth.jpg`, the whole photobooth sheet; set it to `/couple-photo.jpg` for the heart-hands pose alone). Every photo frame is 4:3 (the `--photo-aspect` token in `styles/tokens.css`), so a 4:3 photo shows whole. Other shapes still work: the puzzle crops them from the centre to fit and never stretches them. Use a compressed JPEG under 300 KB, ideally at least 1200 × 900 so it stays sharp in the finale frame.
- `levels`: 9 entries, each with `id`, `title`, `passMin` (correct answers needed to pass) and `tileIndex` (0 to 8, row by row: the photo piece that level reveals). The `id` is the number that groups the level's questions in `questions.json`. Every level needs a different `tileIndex`, or the photo could never be completed; the game shows a "Content error" if two levels share one. Level 9 reveals piece 7 (bottom middle), which is the heart hands when the heart-hands photo is used.

Answer colors and shapes follow the option's position: 0 is the red triangle, 1 the blue diamond, 2 the yellow circle and 3 the green square.

## Project structure

```text
src/
  main.tsx                 Entry: global styles, LazyMotion and the app
  app/
    App.tsx                Screen flow and transitions; mounts the heart-bloom layer
  game/                    Rules and saved progress, with no UI
    types.ts               Content, progress and result types
    scoring.ts             Points for speed, stars and pass/fail
    progress.ts            Level unlocking, tile reveals, level status and the fresh state
    storage.ts             localStorage persistence under `level-25-progress`
    useGameProgress.ts     React hook that applies progress changes and saves each one
  data/
    questions.json         Every level's questions
    levels.json            Level settings and the photo
    staycation-pass.json   Ticket text and Calendar invitation settings
    content.ts             Merges, types and checks the content files
  motion/tokens.ts         Shared springs, easings and animation variants
  styles/                  Global CSS, imported in order by styles/index.css
    tokens.css             Design tokens (palette, radii, shadows, type)
    base.css               Reset and element defaults
    shared.css             Buttons, chips, labels, petals and other shared pieces
    intro.css, levels.css, rewards.css, quiz.css, story-screens.css
                           One file per area (story-screens covers results, finale and invite)
    responsive.css         Breakpoints for every screen (kept last so they win the cascade)
    reduced-motion.css
  components/              Shared UI used by more than one feature
    BunnyButton.tsx        Primary call to action led by a hopping bunny
    Pressable.tsx          Shared button with hover and tap feedback
    ScreenTransition.tsx   Fade and slide between screens
    StoryBadge.tsx         The bunny (and lily) on a lavender circle, with an optional celebration
    BunnyIcon.tsx          Flat SVG bunny used by the map marker, buttons, badges and quiz feedback
    LilyIcon.tsx           Flat SVG violet lily for small badges
    icons.tsx              Back, close and lock icons
    ambience/
      Petals.tsx           Drifting violet petals behind celebrations
      Hearts.tsx           Floating background hearts, the heart bloom shown on every button press and the
                           badge's heart burst on the accepted screen
      IntroAmbience.tsx    Swaying sprigs and petals, shared by the intro and the accepted screen
  features/
    intro/
      StoryIntro.tsx       Intro layout, copy and reveal sequence
      stage/               The 3D scene, lazy-loaded as its own chunk
        BunnyStage.tsx     Three.js renderer, lighting, render loop and interactions
        bunnyModel.ts      The 3D bunny's geometry and materials
        lilyModel.ts       The 3D violet lily and its bloom and sway
        bake.ts            Merges static meshes that share a material into one draw call
        StoryBunny.tsx     SVG bunny and lily, shown only if WebGL is unavailable
    levels/
      LevelMap.tsx         The map screen: header, photo card, path and reset
      LevelNode.tsx        One level on the path
      MapBunny.tsx         The bunny marker that hops between levels
      levelPath.ts         Node positions and the winding trail
    quiz/
      Quiz.tsx             The quiz screen
      useQuizRound.ts      Question flow: deadline, answer or timeout, scoring and the pause before the next one
      AnswerButton.tsx     Kahoot answer with correct/wrong feedback
      Countdown.tsx        The ticking seconds
      TimerBar.tsx         The CSS-animated timer bar
      QuizFeedback.tsx     The feedback toast
      deadline.ts          Deadline helpers shared by the timer and scoring
    rewards/
      ResultScreen.tsx     Level result: stars, the new photo piece or a retry
      StarReward.tsx       Animated star rating
      PhotoTiles.tsx       3x3 photo reveal; each tile is a window onto one centre-cropped copy of the photo
    finale/
      Finale.tsx           "Level 24 Complete"
      Invite.tsx           The invite and the "Level 25 complete." screen
      notifyAcceptance.ts  Calls the Calendar Apps Script when the invite is accepted
      StaycationTicket.tsx The staycation pass, filled from staycation-pass.json
public/
  couple-photobooth.jpg    The puzzle photo: the whole photobooth sheet at 4:3, with an even black border
  couple-photo.jpg         Alternative puzzle photo: just the heart-hands pose
  favicon.svg
tools/
  google-calendar-invite.gs  Google Apps Script backend that owns and sends the Calendar event
```

### Architecture

Dependencies point one way, so there are no import cycles:

- `game/` and `data/` hold the rules and content. They don't import React components, so scoring, unlocking and persistence can change (or be unit tested) without touching any screen.
- `components/` holds shared UI and depends only on `motion/`.
- Each folder in `features/` is one part of the story and imports from the layers above. Features don't import from each other, with one exception: any feature may use `rewards/` (stars and photo tiles appear on the map, results and finale), but `rewards/` never imports another feature.
- `app/App.tsx` is the only place that knows the screen order. Screens receive data and callbacks as props and never switch screens themselves.

When adding something:

- **A new screen:** add a folder under `features/`, then wire it into `App.tsx`.
- **A new rule:** add a pure function in `game/`.
- **UI shared by two features:** move it to `components/`.
- **Styles:** add rules to the area's file in `styles/`, and put breakpoints in `responsive.css` so the cascade order stays predictable.

Screen-specific choreography stays next to its markup: `BEATS` in `StoryIntro.tsx`, `FINALE` in `Finale.tsx` and the hop timings in `MapBunny.tsx`. Anything reused belongs in `motion/tokens.ts`.

## Design system

Keep new work consistent with these rules. If something needs a new color, size or animation, add it as a token first instead of hard-coding it in a component.

### One storybook look, from intro to invite

Every screen shares the same flat page (`--color-background`, `#FAF7FF`), generous space, white cards with a hairline border, and purple used for emphasis and interaction only. The palette lives in `src/styles/tokens.css`:

| Name | Token | Hex | Used for |
|------|-------|-----|----------|
| Ink | `--ink` / `--color-text` | `#2A1B3D` | Headlines and strong text |
| Violet | `--violet` / `--color-primary` | `#6B4FB0` | Primary buttons, current level, labels, scores |
| Deep violet | `--violet-deep` | `#3D2A6E` | Ticket header, correct-answer feedback, node depth |
| Soft violet | `--violet-soft` | `#8F6CCF` | Completed levels |
| Lavender | `--lavender` / `--color-accent` | `#B9A2E6` | Trail progress, focus rings, the bunny's bow |
| Lavender mist | `--lavender-mist` | `#F3EEFB` | Locked levels, quiet panels, the trail |
| Rose | `--rose` / `--color-retry` | `#A63D6B` | Wrong answers, time running out |
| Muted | `--color-text-muted` | `#6F647F` | Supporting text |

Components use the semantic tokens rather than raw hex or the `--purple-*` scale. Gold (`--gold-*`) is reserved for stars. No gradient backgrounds or glows; depth comes from the shadow tokens only. The one exception is the soft gold pulse behind the finale's three stars, which marks the end of the game.

Shared motifs keep the screens connected to the intro:

- **Bunny:** every primary action is a `BunnyButton`, the same violet pill as the intro's button, led by a bunny that hops once. Result and accepted screens show her on a lavender circle (`.story-badge`), and quiz feedback carries a small bunny.
- **Violet lily:** `LilyIcon` marks the photo card and joins the bunny's badge on happy screens.
- **Petals:** `Petals` drifts a few violet petals behind celebrations (passed level and invite). The accepted screen reuses the full `IntroAmbience`, so the story ends where it began.
- **Finale ("Level 24 Complete"):** the game's emotional peak, sequenced by the `FINALE` timings in `features/finale/Finale.tsx`:
  - The three stars pop in, and each word of "Every piece led back to us." rises out of its own clipped line.
  - The photo settles into a tilted frame while its tiles assemble, then a single sheen sweeps across it.
  - `FloatingHearts` drifts six faint hearts up the page in place of the petals.
  - Continue waits about half a second so its heart bloom (below) can open before the page fades and lifts away (`bloomOut`, chosen by `ScreenTransition`'s `leave` prop). The hearts' float and the exit end together, then the invite fades in.
- **"Level 25 complete.":** the story's closing beat, sequenced by the `ACCEPTED` timings in `features/finale/Invite.tsx`:
  - The intro's wisteria, bellflower and petals fade in, and the bunny's badge pops up.
  - The lily twirls in beside her, and a single ring of eight hearts bursts over the top half of the badge (`HeartBurst`), clear of the copy below.
  - "Reservation accepted" lands like a ticket stamp (`stamp` in `motion/tokens.ts`).
  - Each word of "Level 25 complete." rises out of its own clipped line, like the intro and finale (`.story-word`), then "See you there." fades up.
  - The bunny hops once for joy. Nothing loops except the ambience, so the screen settles into the same calm ending as before.
- **Heart bloom on every button:** `HeartBloomLayer`, mounted once at the app root, blooms nine small hearts out of any button that's pressed (mouse, touch or keyboard). It works like this:
  - It listens for clicks in the capture phase, so new buttons get the bloom automatically.
  - The hearts are portalled above the page, so they keep floating while the screen changes underneath, and no button waits for them.
  - The fan scales to the button: wide for pill buttons, tighter for quiz answers, small for icon buttons. Buttons near the top of the screen bloom downward first.
  - Add `data-bloom="off"` to a button to skip it; quiz answers use this so only a correct pick blooms. Add `data-bloom-anchor` to a child to bloom from it instead of the button's centre, as the map's level circles do.

  Keep the hearts in the lavender, violet and soft pink palette (`HEART_COLORS`), few in number and clear of the copy.

- **Intro:** one scene, the 3D bunny and lily. The soft circle behind the scene uses `--color-surface-soft`. The `--intro-*` variables on `.intro` in `styles/intro.css` are aliases of the shared palette.

  The headline group follows a fixed hierarchy:
  - A "Level 25" chip and the "Birthday Quest" label.
  - "Hi, Guen." in purple.
  - "Happy Birthday." as the large Fredoka headline, with its period in purple.
  - "I made you something." directly beneath it.
  - The invitation set apart, with "Ready to play?" in purple to lead into the button.

  Each headline word rises out of its own clipped line (`lineReveal` in `motion/tokens.ts`).

  The only background decoration is `IntroAmbience`: a hanging wisteria sprig, a bellflower sprig and six drifting violet petals, all in the lily's lavender-to-violet palette. Avoid gradients, extra floating shapes, stacks of rounded cards, emoji and other effects in the intro.

- **3D bunny:** a stylized collectible-toy look. Cream fur uses a soft sheen material with a fine fur bump texture. She has glossy eyes with lavender irises, highlights and lashes, pale pink inner ears, nose and blush, and satin lavender accessories (bow, collar and heart charm). Keep new details within this palette (defined in `bunnyModel.ts`), soft and rounded, and lit by the existing warm key light and lavender rim light.

- **3D lily:** six curled petals with a gradient from a pale center through lavender to deep violet, a slender stem with five narrow leaves, and stamens. The petals open in a staggered bloom (outer petals first), then the flower sways gently. Its palette lives in `lilyModel.ts`. The map's `MapBunny` is a flat SVG version of the same bunny.

### Kahoot answer identities

The four answers always keep their color and shape: `--answer-red` triangle, `--answer-blue` diamond, `--answer-yellow` circle and `--answer-green` square. The hex values are tuned so white text stays above 4.5:1 contrast, so don't lighten them.

### Typography

- **Display:** Fredoka (`--font-display`) at weight 600 on every screen, for headlines, level titles, scores and numbers.
- **Body:** Nunito (`--font-body`) everywhere else, including buttons and labels.
- Small uppercase labels (`.eyebrow`) are violet with wide letter spacing (about 0.16em) and never carry essential information alone.

### Shape and depth

Use the radius tokens (`--radius-sm` 12px, `--radius-md` 18px, `--radius-lg` 26px, `--radius-pill` for buttons) and the shadow tokens (`--shadow-sm` to `--shadow-lg`, `--shadow-primary` for the main call to action). Primary actions are pill-shaped.

### Responsive layout

Styles are mobile first: the base rules are the phone layout, and the media queries in `styles/responsive.css` (and the intro's own breakpoints at the end of `styles/intro.css`) adapt it per device class rather than stretching it.

- **Narrow phones (≤380px) and short portrait phones (≤667px tall):** tighter padding and quiz sizing so the answers and the feedback toast fit on one screen.
- **Portrait tablets (≥600px):** the same stacked story with larger intro type and a wider map column.
- **Landscape (≥560px wide):** the intro, results, finale and invite all split into copy on the left and the picture (3D scene, photo or ticket) on the right. Result, finale and invite markup wraps text and media in `.split-group` boxes that use `display: contents` on phones, so the stacked order is unchanged.
- **Landscape ≥768px and desktop (≥1024px):** the map shows the photo and the final-surprise button beside the winding path.
- **Short landscape phones (≤540px tall):** the quiz puts the question and answers side by side, and the feedback toast covers the answered question, never the answers.
- **Wide monitors (≥1440px):** the intro sits in a centred frame, and the map and quiz grow a little.

Quiz cards and answers size with `svh` clamps so they fit the screen height. Horizontal padding comes from `--pad-x` on `.screen` and respects the safe-area insets (the page uses `viewport-fit=cover`). Small uppercase labels use `--text-label` (12px) and never go smaller.

### Motion

- All UI animation uses [Motion for React](https://motion.dev) (`motion/react`). Don't add GSAP or Anime.js. The exceptions are deliberate:
  - The 3D scene animates inside its own Three.js render loop in `BunnyStage.tsx`.
  - A few simple loops use CSS keyframes so they run entirely on the compositor: the quiz timer bar, the map bunny's idle bob, the glow on a newly found photo tile and the finale's star glow.
- The app is wrapped in `<LazyMotion features={domAnimation} strict>`, so components must use `m.div`, `m.span` and so on, never `motion.div`. Strict mode throws if a full `motion` component slips in. Layout and drag animations aren't loaded; switch to `domMax` if you ever need them.
- The 3D render loop pauses when the scene is off screen or the tab is hidden. Keep it that way to save battery.
- Reuse the springs, easings and variants in `src/motion/tokens.ts`. `reveal(delay)` drives the intro's sequenced entrance, and `storyEase` is its easing curve.
- Motion should have a purpose: guide attention, confirm an action or celebrate progress. Keep idle loops subtle (breathing, a blink, a gentle sway).
- Always respect reduced motion. Check `useReducedMotion()` and show the final state without movement. Saved progress also skips the intro choreography. With reduced motion, no button blooms hearts. On the finale, reduced motion also shows everything at once, drops the floating hearts and moves on as soon as Continue is tapped. "Level 25 complete." appears fully formed, with no heart burst or hop.
- Animate `opacity` and `transform` only, so it stays smooth on phones. For endless loops, animate a whole `transform` string (for example `transform: ['translateY(6px)', 'translateY(-10px)']`) rather than `x`, `y` or `scale`. Motion can then hand them to the browser's compositor instead of running them on the main thread.

### Performance

The intro has to feel instant on a mid-range phone, so the 3D scene follows these rules:

- **Startup:** the Three.js chunk is lazy-loaded. Its heavy setup (environment map and shader compilation via `compileAsync`) runs after the first paint, while the canvas is still invisible, and the canvas then fades in. The greeting sequence starts only once the stage is ready, or after 2.5 seconds at most, so setup work never lands in the middle of the choreography.
- **Draw calls:** static parts that share a material are merged with `bake()`. Only the larger shapes cast shadows. Materials with the same features share a shader program, so avoid one-off material flags.
- **Render loop:** it runs at full rate during the opening sequence and while she's being touched. When idle it drops to 30 fps and refreshes shadows every other frame. It never allocates objects per frame.
- **Resolution:** the pixel ratio starts at up to 2 and steps down to 1.25 if frames run slow.
- **Quiz:** the countdown lives in its own small component and the bar is a CSS animation, so the quiz itself re-renders only when an answer changes.
- **Photo:** it's preloaded while the intro plays.

### Accessibility and layout

- Mobile-first, portrait layout. It also adapts to tablets, desktop and landscape via the breakpoints in `styles/responsive.css` and `styles/intro.css`.
- Every tap target is at least 48px (`--tap-min`).
- Keep the visible `:focus-visible` outline on everything interactive.
- Selected text is white on purple (`--color-selection`). On purple or colored surfaces such as buttons, answers and feedback, it flips to deep purple on lavender (`--color-selection-inverse`) so the highlight stays visible.
- Decorative art is `aria-hidden`. Meaningful or interactive art gets a label: the 3D bunny is a focusable button with an `aria-label`, and pressing Enter or Space makes her hop.
- Check text contrast against the actual background, especially over illustrations.

## Before launch

- [x] Add the real photo (`public/couple-photobooth.jpg`)
- [ ] Set the real staycation date, check-in time, duration and destination in `src/data/staycation-pass.json`
- [x] Deploy the latest `tools/google-calendar-invite.gs` version
- [ ] Deploy (Vercel or Netlify), create a short URL and generate the QR card
- [x] Test on her phone model, on mobile data, and by scanning the printed QR
