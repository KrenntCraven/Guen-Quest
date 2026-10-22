# Level 25: Guen's Birthday Quest: Spec

This is the product spec: what the game is, how it plays and what's left before launch. It describes the game as built. For how the code is organised, the design system and how to edit content, see the [README](./README.md).

## 1. Concept

**Title:** Level 25: Guen's Birthday Quest. The same title appears on the intro ("Level 25" chip and "Birthday Quest" label), the browser tab and the QR card.

A mobile-first web game delivered by a QR code on a flower.

- **Outer layer (Candy Crush style):** a level map with 9 levels on a winding path. Levels unlock in order and award up to 3 stars.
- **Inner layer (Kahoot style):** each level is a short timed multiple-choice quiz about the two of us.
- **Reward:** each passed level reveals one tile of a 3x3 couple photo.
- **Finale:** "Level 24 Complete" shows the full photo with a love note, then a staycation invite she can accept.

**Not included:** no match-3 board or gem-swapping engine. "Candy Crush" refers only to the map, progression, stars and locked levels.

---

## 2. Game flow

```
QR scan
  -> Intro ("Begin your story", or "Continue your story" with saved progress)
  -> Level map  (back button returns to the intro)
       -> Pick an unlocked level
            -> Quiz (close button returns to the map without saving)
                 -> Result
                      -> Pass: stars + photo tile -> "Back to map"
                      -> Pass on level 9: "Reveal the photo" -> Finale
                      -> Fail: "Try again" -> the same quiz
       -> All 9 tiles found: "See the final surprise" -> Finale
  -> Finale ("Level 24 Complete")
  -> Staycation invite
  -> "Accept this adventure" -> "Level 25 complete."
```

Screens cross-fade with a short slide. The finale leaves with a slower lift instead, so the invite feels like a reveal. Every button blooms a few small hearts when pressed. With reduced motion, the transitions are instant and no hearts bloom.

---

## 3. Screens

### 3.1 Intro

A single page: the copy on one side and an interactive 3D bunny beside a violet lily on the other. The lines build up and stay on screen; they don't replace each other.

> **Level 25** · Birthday Quest
> Hi, Guen.
> **Happy Birthday.**
> I made you something.
> It's a small game. Ready to play?
> [ Begin your story ]

**Timeline.** The sequence starts once the 3D scene is ready, or after 2.5 seconds at most, so it never stutters on slower phones.

| Time | Element | Effect |
|------|---------|--------|
| 0.0s | Bunny and lily | Scene fades in; the lily blooms as the bunny arrives |
| 0.3s | "Level 25" chip and "Birthday Quest" | Fade in |
| 1.0s | "Hi, Guen." | Fade up |
| 2.0s | "Happy Birthday." | Each word rises out of its own line; the purple period pops in at 3.0s |
| 3.4s | "I made you something." | Fade up |
| 4.8s | "It's a small game." | Fade up, with "Ready to play?" following at 5.2s |
| 5.2s | "Begin your story" button | Fade up; the bunny on the button hops once at 5.6s |
| 5.9s | "Drag to turn · Tap to say hi" | Fade in |

**Rules:**
- Tapping anywhere except the button skips straight to the finished layout.
- With saved progress, the intro appears already settled and the button reads "Continue your story".
- With reduced motion, everything is shown without movement.
- The 3D bunny follows the pointer, turns when dragged, and hops when tapped (or focused and Enter or Space is pressed). Without WebGL, a flat illustrated bunny and lily are shown instead.
- No sound or music.

### 3.2 Level map

- **Header:** a back button to the intro, "Birthday quest" / "Level 25", and the total score.
- **Photo card:** "Our picture" with the 3x3 photo. Found tiles show the image; the rest show a small heart.
- **Path:** 9 numbered levels on a winding path, each with its title. A level is either:
  - **locked:** a padlock, and it can't be tapped;
  - **current:** the next one to play, gently pulsing, labelled "Play now";
  - **completed:** shows its stars, and can be replayed to improve them.
- **Map bunny:** a small bunny stands beside the current level. When a level unlocks, she hops along the path to it, scrolling it into view if needed.
- **Final surprise:** once all 9 tiles are found, a "See the final surprise" button opens the finale.
- **Reset progress:** clears the save and returns to the intro.
- On tablets and desktop, the photo card and the final-surprise button sit beside the path.

### 3.3 Quiz

- 1 question per level on levels 1 to 8, and 2 on level 9 (10 in total).
- Each question shows:
  - its number and text;
  - a countdown bar and number (20 seconds in the current content, set per question);
  - four answers, always red triangle, blue diamond, yellow circle and green square by position.
- The timer bar turns pink for the last 6 seconds.
- **Points:** a correct answer scores 500 plus up to 500 more for speed: 500 + 500 × (time left ÷ time limit), rounded. A wrong answer or a timeout scores 0.
- **After each answer**, the answers lock:
  - the correct one is highlighted in green with a check;
  - a wrong pick shakes;
  - a correct pick blooms hearts.

  A feedback toast with the bunny shows "You got it!", "Not quite!" or "Time's up!" with the question's memory line. After 1.8 seconds the next question starts, or the result appears. If a long memory line would make the toast cover the answers (on small phones), it rises to sit just above them, over the answered question.
- Wrong answers and timeouts cost nothing beyond the lost points.
- The close button returns to the map. Nothing from an unfinished quiz is saved.

### 3.4 Level result

- **Pass:** at least `passMin` correct answers. That's the single question on levels 1 to 8, and both questions on level 9.
- **Stars:**
  - 3 for all correct;
  - 2 for more than `passMin` correct but not all;
  - 1 for exactly `passMin`.

  With the current content, every level gives 3 stars or a retry, since passing means getting every question right. Two stars would need a level with more questions above its pass mark.
- **On pass:**
  - The screen shows the bunny-and-lily badge, "Memory unlocked!", "You found photo piece N of 9", the stars, the photo with the new tile glowing, and the correct count and points.
  - The button reads "Back to map", or "Reveal the photo" after level 9.
  - Replaying a level keeps the best star rating, but its points are added to the score again.
- **On fail:** "So close!" with an encouraging line and "Try again". Retries are unlimited.

### 3.5 Finale: "Level 24 Complete"

The emotional peak, about 2.5 seconds of choreography:
- Three gold stars pop in and glow softly.
- "Level 24 Complete" appears, then "Every piece led back to us." rises word by word.
- The full photo settles into a tilted frame while its tiles assemble, then a single sheen sweeps across it.
- The note follows: "Happy birthday, Guen. I love you, and I have one more thing to show you."
- A few faint hearts drift up the page.

"Continue" blooms hearts, waits about half a second, then the page lifts away into the invite.

### 3.6 Staycation invite

- "A birthday escape for two" / "You're invited." / "Pack a small bag. Our next adventure is waiting."
- A boarding-pass style ticket (LEVEL 25 · STAYCATION PASS · FOR GUEN), with HOME → ESCAPE, then the date, check-in time, duration and destination. All of its text comes from `staycation-pass.json`.
- An "Accept this adventure" button. Once configured, accepting creates the staycation event through Google Apps Script and Google Calendar emails the guest invitation.
- **On accept:** the choice is saved and the screen becomes "Reservation accepted" / "Level 25 complete." / "See you there.", framed by the intro's wisteria, bellflower and petals. The invite shows this accepted state from then on.
- **Its entrance:** the bunny's badge pops up, the lily twirls in with a small ring of hearts, "Reservation accepted" lands like a ticket stamp, the headline rises word by word, then the bunny hops once. With reduced motion it simply appears.
- **The Calendar invitation:** sent through a Google Apps Script web app when she accepts, without delaying the screen. The script owns the event, restricts it to `Krenntc@gmail.com` and prevents duplicates for the same start time.

---

## 4. Level progression

| Level | Title | Difficulty | Question themes |
|-------|-------|-----------|-----------------|
| 1 | Where it began | Very easy | Our first date |
| 2 | The first message | Very easy | Who messaged first |
| 3 | Our color | Easy | The color we both love |
| 4 | Movie memories | Easy | Our first movie in the cinema |
| 5 | Binge-worthy | Medium | Our favorite TV series |
| 6 | Movie night | Medium | Who picks what we watch |
| 7 | Sleepy credits | Medium | Who falls asleep first during a movie |
| 8 | Our soundtrack | Hard | Our favorite artist |
| 9 | The heart level | Boss | His favorite dish, and "Ready for the next chapter?" |

Content rules:
- Levels 1 to 3 should be nearly impossible to fail.
- Keep the playful options (such as "The universe" or "All of the above") rare, so they stay funny.
- Level 9 is the emotional peak, right before the photo and the invite.

---

## 5. Content

Content lives in three JSON files in `src/data/`, so it can be edited without touching code. All three are type-checked at build time. Field-by-field instructions are in the README's "Editing the content" section.

`questions.json` holds only the questions, grouped by level id:

```json
{
  "1": [
    {
      "text": "Where was our first date?",
      "timeLimit": 20,
      "options": ["Place A", "Place B", "Place C", "Place D"],
      "correctIndex": 1,
      "memory": "Short line shown after answering"
    }
  ]
}
```

`levels.json` holds the photo and each level's settings:

```json
{
  "photo": "/couple-photobooth.jpg",
  "levels": [{ "id": 1, "title": "Where it began", "passMin": 1, "tileIndex": 0 }]
}
```

`staycation-pass.json` holds every line of text on the ticket, top to bottom:

```json
{
  "header": { "left": "LEVEL 25", "title": "STAYCATION PASS", "right": "FOR GUEN ♥" },
  "route": {
    "from": { "place": "HOME", "note": "Everyday" },
    "symbol": "♥",
    "to": { "place": "ESCAPE", "note": "Just us" }
  },
  "details": [
    { "label": "Date", "value": "2026-00-00" },
    { "label": "Check-in", "value": "15:00" },
    { "label": "Duration", "value": "2 days" },
    { "label": "Destination", "value": "Our staycation destination" }
  ],
  "code": "2 5 ♥ G U E N ♥ 2 5",
  "calendarInvite": {
    "webAppUrl": "",
    "guestEmail": "Krenntc@gmail.com",
    "start": "",
    "end": ""
  }
}
```

- `tileIndex` is 0 to 8, row by row, left to right, and each level reveals a different piece. Levels 8 and 9 are swapped (pieces 8 and 7) so that, with the heart-hands photo, "The heart level" reveals the heart last.
- Option colors and shapes follow position: 0 red, 1 blue, 2 yellow, 3 green.

---

## 6. State and saving

```ts
type GameState = {
  currentLevel: number            // highest unlocked level (1-9)
  stars: Record<number, 0|1|2|3>  // best rating per level
  revealedTiles: number[]         // tile indices found so far
  score: number                   // cumulative points from passed levels
  inviteAccepted: boolean
}
```

Progress is saved to `localStorage` under `level-25-progress`, so she can close the tab and resume:

- **When it saves:** after every passed level and when she accepts the invite.
- **What doesn't save:** a failed or abandoned quiz changes nothing.
- **Resetting:** "Reset progress" on the map deletes the save.
- **Before the first pass:** nothing is stored, so the intro still offers "Begin your story".

---

## 7. Technical notes

- **Stack:** React 19, TypeScript and Vite 8, with Motion for React for UI animation and Three.js for the intro's 3D scene. There's no state library; the state is small.
- **Timer:** the bar is a CSS animation. The logic uses an absolute deadline (`performance.now()`) with `setTimeout`, so scoring never drifts from what's on screen.
- **Photo tiles:** one image, shown as a 3x3 grid where each tile displays its part of the picture. It's preloaded while the intro plays. Use a compressed portrait image under 300 KB.
- **3D scene:** lazy-loaded as its own chunk. It renders at a lower rate when idle and pauses when off screen.
- **Layout:** mobile-first portrait, adapting to tablets, desktop and landscape. Tap targets are at least 48px, and reduced motion is respected throughout.
- **Calendar invitation on Accept:** a POST to the deployed Google Apps Script in `tools/google-calendar-invite.gs`. The script creates one event on its owner's calendar and adds `Krenntc@gmail.com` as a guest with `sendInvites: true`. Empty URL/time placeholders disable the request until the real booking is known.
- **Hosting (not done):** Vercel or Netlify, with a short custom URL.
- **Optional, not built:** lock the site until midnight of her birthday with a client-side date check. It's trivial to bypass, which is fine here.

---

## 8. QR and flower delivery

- QR at least 2.5 cm square, dark on light, with a white border.
- Card text: "Level 25 unlocked. Scan to begin."
- Printed on a small card tied to the bouquet, with the short URL printed underneath.
- Test the scan on her phone model.
- Confirm the staycation booking before the Accept button goes live.

---

## 9. Status

Built:
- [x] Animated intro with the 3D bunny and lily
- [x] Level map with locked, current and completed levels, the map bunny and stars
- [x] Quiz with the timer, four answers, speed scoring and feedback
- [x] Pass, fail and star logic wired to the map
- [x] Photo tile reveal, on the result screen and the map
- [x] Content loaded from JSON
- [x] localStorage persistence
- [x] Finale, invite and the "Level 25 complete." screen
- [x] Polish: animations, heart blooms, fonts, colors, responsive layout

Remaining:
- [ ] Google Apps Script deployed and Calendar invitation tested
- [ ] Real content: the invite details (the photo and all 10 questions are done)
- [ ] Deploy, short URL and QR card
- [ ] Test on her phone model, on mobile data, and by scanning the printed QR

---

## 10. Open items

- [x] Intro copy chosen ("Hi, Guen. / Happy Birthday. / I made you something. / It's a small game. Ready to play?")
- [x] Photo chosen (the whole SM Mall of Asia photobooth sheet; the heart-hands pose alone is kept as an alternative)
- [x] Questions written
- [ ] Staycation date, time, days and place confirmed
- [x] Notification method chosen (automatic Google Calendar invitation through Apps Script)
- [ ] Short URL and QR generated
- [ ] Midnight lock: yes or no
