# Build the MACROPAGE Live Quiz frontend

Build a mobile-first web frontend for a **live, in-person business quiz** run at a
MACROPAGE stage event. ~100–110 small-business owners scan a QR code on their phones,
register, create their profile, and wait. When the admin starts the quiz, everyone gets
all 5 mindset questions at once and races through them self-paced (the whole quiz
typically wraps in under a minute). Once the admin ends the quiz, every participant is
dropped straight onto a results screen with their rank and an AI-generated "Analyze My
Business" report. There is also a big-screen "display" view for the projector, and an
admin console the event host runs from a laptop with exactly two controls: start and end.

The backend is already built (NestJS + MongoDB + Socket.IO). Do not invent endpoints —
use exactly what's documented below. There is no "next question" admin control and no
separate "open registration" step — do not build UI for either. Base API URL and
Socket.IO URL should be read from environment variables (e.g. `VITE_API_URL`,
`VITE_SOCKET_URL`).

## Screens to build

### 1. Participant flow (phone, portrait)
1. **Join / Register** — landing page opened via QR code URL containing `?session=<id>`.
   No "registration open" gate to check — the URL works as soon as the session exists,
   right up until it's `ended`. Form: name, WhatsApp number (10-digit Indian mobile). On
   submit, call `POST /api/participants/register`, store `participantId` and
   `sessionToken` in localStorage.
2. **Onboarding** — business name, business category (dropdown: Retail / Kirana, Food &
   Hospitality, Manufacturing, Services, Healthcare, Finance, Logistics & Transport,
   Education, Other — free text allowed too), and goal (grow customers / grow revenue /
   other, with a text field if "other"). Submit via
   `PATCH /api/participants/:id/onboarding` with the sessionToken as bearer auth.
3. **Waiting room** — shown while `session:state.status` is `draft`. Friendly "hang
   tight, quiz starts soon" message. This is where participants sit after finishing
   onboarding.
4. **Quiz screen** — shown on the `questions:all` socket event (fires once, when the
   admin starts the quiz, containing all 5 questions). Render questions one at a time
   (or as a swipeable stack) client-side — pacing is entirely up to the participant, the
   server does not push questions individually. For each question, submit the answer via
   `POST /api/answers` as soon as the participant picks an option, then move to the next
   unanswered question immediately (no server round-trip needed to "unlock" it — they're
   all already available). Once all 5 are answered, show a "you're done — waiting for
   others to finish" screen. Handle reload mid-quiz: call
   `GET /api/sessions/:id/state?participantId=` and use `answeredQuestionIds` to skip
   already-answered questions and resume at the first unanswered one. `timeLimitSeconds`
   on each question is a per-question display hint (e.g. a small elapsed/suggested-pace
   indicator) — it is not server-enforced, so don't block submission on it.
5. **Results screen** — shown on the `quiz:ended` socket event; this is the direct next
   screen after the quiz, no separate "final rank" step. Show final rank/score
   (`GET /api/participants/:id/rank`) and the leaderboard, then a prominent
   **"Analyze My Business"** section. Call `POST /api/participants/:id/analysis` (bearer
   sessionToken) — this can take a few seconds, show an "AI is thinking about your
   business…" loading state, then render the report inline on the same screen: headline,
   businessSnapshot, mindsetProfile, archetype, a roadmap checklist (goalRoadmap items),
   and the tech recommendation as a soft CTA. On revisit/refresh, call
   `GET /api/participants/:id/analysis` first to show a cached report without
   re-triggering generation.

### 2. Display screen (projector, landscape, no interaction)
Connects to the socket with `role: "display"`. Shows:
- Waiting/registration count screen before start (`status: "draft"`)
- A "quiz is live!" screen once `questions:all` fires (no per-question tracking to show,
  since pacing is per-participant — a live answered-count via `leaderboard:update.
  totalAnswered` is a good substitute for "progress")
- A big animated leaderboard (top 10) that updates on `leaderboard:update`, sorted by
  rank, showing name + business name + score
- A final leaderboard / "thank you" screen on `quiz:ended`

### 3. Admin console (laptop, desktop layout)
1. **Login** — `POST /api/auth/admin/login`, store the JWT, attach as bearer to all
   admin calls.
2. **Session list / history** — landing screen after login. `GET /api/sessions` returns
   every session ever created (newest first) with its `status`, so past events stay
   browsable — clicking an old (`ended`) session opens its leaderboard/participants/CSV
   export read-only; clicking a `draft` one resumes the control panel below. A "Create
   New Session" action calls `POST /api/sessions`.
3. **Session control panel** — create a session (`POST /api/sessions`, title +
   auto-seed toggle). Exactly two action buttons after that: **Start Quiz**
   (`POST /api/sessions/:id/start`) and **End Quiz** (`POST /api/sessions/:id/end`). Do
   not build a "next question" control — there isn't one. Disable Start once already
   started, disable End until started; the API also enforces this server-side and
   returns 400 on an invalid transition — surface that error.
4. **Live dashboard** — participant count, total answered so far, a live ranked table
   (`GET /api/sessions/:id/leaderboard`, or listen to `leaderboard:update` on the socket
   joined with `role: "admin"`). This is how the admin judges when to hit End (e.g. once
   most participants have finished, or ~1 minute has passed).
5. **Participants & export** — table from `GET /api/sessions/:id/participants`, and a
   "Download CSV" button linking to `GET /api/sessions/:id/export.csv` (send the Bearer
   token; if using a plain `<a href>` you'll need to fetch it with auth headers and
   trigger a blob download instead of a direct link, since the browser won't attach the
   Authorization header to a normal navigation).

## API reference

**Base URL:** all REST routes are prefixed with `/api` except `/health`.
**Auth header format:** `Authorization: Bearer <token>` — participants use their
`sessionToken`, admin uses the JWT `accessToken` from login. Never send both.

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| GET | `/health` | none | — | `{ status: "ok" }` |
| POST | `/api/auth/admin/login` | none | `{ email, password }` | `{ accessToken }` |
| POST | `/api/sessions` | admin | `{ title, autoSeedQuestions? }` | QuizSession (`status: "draft"`) |
| GET | `/api/sessions` | admin | — | `QuizSession[]`, newest first — full history, not just the active one |
| POST | `/api/sessions/:id/start` | admin | — | QuizSession (`draft` → `in_progress`) |
| POST | `/api/sessions/:id/end` | admin | — | QuizSession (`in_progress` → `ended`) |
| GET | `/api/sessions/:id/leaderboard` | admin | — | `LeaderboardEntry[]` (full ranked list) |
| GET | `/api/sessions/:id/participants` | admin | — | `Participant[]` |
| GET | `/api/sessions/:id/export.csv` | admin | — | CSV file |
| GET | `/api/sessions/:id/state?participantId=` | none | — | `{ sessionId, title, status, totalQuestions, answeredQuestionIds: string[]\|null }` |
| GET | `/api/questions/:sessionId` | none | — | `SanitizedQuestion[]` (all 5 at once); 400 if session is still `draft` |
| POST | `/api/participants/register` | none (rate-limited) | `{ sessionId, name, whatsappNumber }` | `{ participantId, sessionToken }`; 400 only if session already `ended` |
| PATCH | `/api/participants/:id/onboarding` | sessionToken | `{ businessName?, businessCategory?, goal, goalOther? }` | Participant |
| GET | `/api/participants/:id/rank` | none | — | `{ rank: number\|null, score }` |
| POST | `/api/answers` | sessionToken | `{ questionId, selectedKey, timeTakenMs }` | `{ success: true }` — any question in the session, any order, only while `in_progress` |
| POST | `/api/participants/:id/analysis` | sessionToken | — | AnalysisReport (generates or returns cached) |
| GET | `/api/participants/:id/analysis` | none | — | AnalysisReport or 404 |

`SanitizedQuestion`: `{ id, text, order, timeLimitSeconds, dimension, options: [{key, text}] }`
(no points/correct-answer info exposed).

`goal` enum: `grow_customers` \| `grow_revenue` \| `other` (send `goalOther` when
`other`). `selectedKey` enum: `A` \| `B` \| `C` \| `D`. `status` enum on QuizSession:
`draft` \| `in_progress` \| `ended` — that's the whole state machine, only two admin
transitions exist.

**AnalysisReport shape:**
```json
{
  "participantId": "string",
  "sessionId": "string",
  "generatedAt": "ISO date",
  "techScore": 0,
  "archetype": "string",
  "dimensionScores": {
    "growthMindset": 0, "customerRelationship": 0, "strategicThinking": 0,
    "investmentDiscipline": 0, "digitalReadiness": 0
  },
  "reportJson": {
    "headline": "string",
    "businessSnapshot": "string",
    "mindsetProfile": "string",
    "goalRoadmap": ["string"],
    "techRecommendation": "string"
  }
}
```

## Socket.IO (`/quiz` namespace)

Connect with `io(SOCKET_URL + '/quiz')`, then immediately emit `join`.

**Emit (client → server):**
- `join` — `{ sessionId, participantId?, role: 'participant' | 'display' | 'admin' }`

**Listen (server → client):**
- `session:state` — `{ sessionId, title, status, totalQuestions, answeredQuestionIds }` — sent on join and every admin transition; drives which screen to show.
- `questions:all` — `{ questions: SanitizedQuestion[], totalQuestions, serverTimestamp }` — sent once when the quiz starts (and to anyone joining mid-quiz or after it ends, so late joiners/refreshes still get the full set).
- `leaderboard:update` — `{ top: [{participantId, name, businessName?, score, rank}], totalAnswered }` — debounced ~1s, top 10 only.
- `quiz:ended` — `{}` — move participants/display straight to the results screen.

Answers are always submitted via the REST endpoint (`POST /api/answers`), never over the
socket — the socket is read-only broadcast.

## Design direction

- Mobile-first, big tap targets (this is used one-handed at an event, possibly with
  spotty wifi) — show clear loading/retry states on every network call.
- Keep the results screen (leaderboard + "Analyze My Business" report) the emotional
  high point — give it more visual polish than the rest of the app, since it's the last
  thing every participant sees.
- The quiz itself is fast and self-paced — optimize the question screen for speed
  (instant tap-to-submit-to-next, no artificial waiting between questions).
- Handle reconnects gracefully: on socket reconnect, re-emit `join` and reconcile with
  `session:state` (and its `answeredQuestionIds`) rather than assuming client-side state
  is still correct.
