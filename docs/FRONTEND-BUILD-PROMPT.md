# Build the MACROPAGE Live Quiz frontend

Build a mobile-first web frontend for a **live, in-person business quiz** run at a
MACROPAGE stage event. ~100–110 small-business owners scan a QR code on their phones,
register, create their profile, and wait. When the admin starts the quiz, each
participant fetches their **own personalized question set**: 5 mindset questions (one
randomly assigned per business dimension, from a bank of 3 variants each — so different
people likely see different specific wording) plus a shared trivia round the admin
configured for that session. They race through their set self-paced (the whole quiz
typically wraps in under a minute). Once the admin ends the quiz, every participant is
dropped straight onto a results screen with their rank and an AI-generated "Analyze My
Business" report (based only on their 5 mindset answers — trivia doesn't affect it, just
the leaderboard score). There is also a big-screen "display" view for the projector, and
an admin console the event host runs from a laptop with exactly two quiz-flow controls:
start and end (plus one-time question-bank setup steps).

The backend is already built (NestJS + MongoDB + Socket.IO). Do not invent endpoints —
use exactly what's documented below. There is no "next question" admin control and no
separate "open registration" step — do not build UI for either. Critically: **there is no
socket event carrying question content** — because each participant's set is
personalized, questions are always fetched per-participant over an authenticated REST
call, not broadcast. Base API URL and Socket.IO URL should be read from environment
variables (e.g. `VITE_API_URL`, `VITE_SOCKET_URL`).

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
4. **Quiz screen** — shown once `session:state.status` becomes `in_progress` (via the
   socket). On entering this screen, call `GET /api/questions/:sessionId` (bearer
   sessionToken) to fetch *this participant's own* question set — the backend assigns
   their 5 mindset questions the first time they call this (and returns the same ones on
   every later call/reload), plus the session's shared trivia questions appended after.
   Each question has a `type: "mindset" | "trivia"` — you can style them differently
   (e.g. a small "Trivia" badge) but the answer flow is identical for both; don't treat
   them as separate screens. Render questions one at a time (or as a swipeable stack)
   client-side — pacing is entirely up to the participant. For each question, submit the
   answer via `POST /api/answers` as soon as the participant picks an option, then move
   to the next unanswered question immediately (no server round-trip needed to "unlock"
   it — they're all already available in the fetched set). Once every question is
   answered, show a "you're done — waiting for others to finish" screen. Handle reload
   mid-quiz: call `GET /api/sessions/:id/state?participantId=` and use
   `answeredQuestionIds` to skip already-answered questions and resume at the first
   unanswered one (the re-fetched `GET /api/questions/:sessionId` will return the exact
   same set as before, since it's persisted per participant). `timeLimitSeconds` on each
   question is a per-question display hint (e.g. a small elapsed/suggested-pace
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
- A "quiz is live!" screen once status becomes `in_progress` (there's no shared
  question-by-question progress to show since pacing and content are per-participant — a
  live answered-count via `leaderboard:update.totalAnswered` is a good substitute for
  "progress")
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
3. **Question bank setup** (one-time, or whenever refreshing) — two independent banks,
   each with the same pattern: a "Seed" button (`POST /api/questions/mindset/seed` /
   `POST /api/questions/trivia/seed`, both idempotent — safe to call again, they no-op if
   already seeded) and a browse view (`GET /api/questions/mindset/bank` /
   `GET /api/questions/trivia/bank`, the latter includes `correctKey` for review). The
   mindset bank isn't picked from per-session — it's just seeded once, globally; only the
   trivia bank feeds into session creation below.
4. **Session creation** — title + a trivia picker. Let the admin either hand-pick trivia
   questions in order (sends `triviaQuestionIds: string[]` on `POST /api/sessions`) or
   just request a random count (sends `triviaCount: number`, 1–50) — don't send both, and
   it's fine to send neither (pure mindset-only quiz). Submitting creates the session.
5. **Session control panel** — exactly two action buttons: **Start Quiz**
   (`POST /api/sessions/:id/start`) and **End Quiz** (`POST /api/sessions/:id/end`). Do
   not build a "next question" control — there isn't one. Disable Start once already
   started, disable End until started; the API also enforces this server-side and
   returns 400 on an invalid transition (e.g. if the mindset bank was never seeded) —
   surface that error.
6. **Live dashboard** — participant count, total answered so far, a live ranked table
   (`GET /api/sessions/:id/leaderboard`, or listen to `leaderboard:update` on the socket
   joined with `role: "admin"`). This is how the admin judges when to hit End (e.g. once
   most participants have finished, or ~1 minute has passed).
7. **Participants & export** — table from `GET /api/sessions/:id/participants`, and a
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
| POST | `/api/questions/mindset/seed` | admin | — | `SanitizedQuestion[]` — idempotent, inserts the 15-question mindset bank (3 per dimension) only if none exist yet |
| GET | `/api/questions/mindset/bank` | admin | — | `SanitizedQuestion[]` — full mindset bank |
| POST | `/api/questions/trivia/seed` | admin | — | `SanitizedQuestion[]` — idempotent, inserts the 50 trivia questions only if none exist yet |
| GET | `/api/questions/trivia/bank` | admin | — | `(SanitizedQuestion & { correctKey })[]` — full trivia bank for the picker UI |
| POST | `/api/sessions` | admin | `{ title, triviaQuestionIds?: string[], triviaCount?: number }` | QuizSession (`status: "draft"`) — send at most one of `triviaQuestionIds` (ordered pick, takes priority) / `triviaCount` (random sample, 1–50); mindset is never configured here |
| GET | `/api/sessions` | admin | — | `QuizSession[]`, newest first — full history, not just the active one |
| POST | `/api/sessions/:id/start` | admin | — | QuizSession (`draft` → `in_progress`); 400 if the mindset bank hasn't been seeded yet |
| POST | `/api/sessions/:id/end` | admin | — | QuizSession (`in_progress` → `ended`) |
| GET | `/api/sessions/:id/leaderboard` | admin | — | `LeaderboardEntry[]` (full ranked list) |
| GET | `/api/sessions/:id/participants` | admin | — | `Participant[]` |
| GET | `/api/sessions/:id/export.csv` | admin | — | CSV file |
| GET | `/api/sessions/:id/state?participantId=` | none | — | `{ sessionId, title, status, totalQuestions, answeredQuestionIds: string[]\|null }` |
| GET | `/api/questions/:sessionId` | sessionToken | — | `SanitizedQuestion[]` — **this participant's own** set: their 5 assigned mindset questions (randomized on first call, stable after) + the session's shared trivia; 400 if session is still `draft` |
| POST | `/api/participants/register` | none (rate-limited) | `{ sessionId, name, whatsappNumber }` | `{ participantId, sessionToken }`; 400 only if session already `ended` |
| PATCH | `/api/participants/:id/onboarding` | sessionToken | `{ businessName?, businessCategory?, goal, goalOther? }` | Participant |
| GET | `/api/participants/:id/rank` | none | — | `{ rank: number\|null, score }` |
| POST | `/api/answers` | sessionToken | `{ questionId, selectedKey, timeTakenMs }` | `{ success: true }` — must be a question from your own fetched set (mindset or trivia), any order, only while `in_progress` |
| POST | `/api/participants/:id/analysis` | sessionToken | — | AnalysisReport (generates or returns cached; built only from this participant's mindset answers) |
| GET | `/api/participants/:id/analysis` | none | — | AnalysisReport or 404 |

`SanitizedQuestion`: `{ id, text, order, timeLimitSeconds, type: "mindset"|"trivia", dimension?, options: [{key, text}] }`
(`dimension` is only present on mindset questions; no points/correct-answer info is
exposed on the participant-facing routes — the trivia bank listing is the only place
`correctKey` appears, and that's admin-only).

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
- `session:state` — `{ sessionId, title, status, totalQuestions, answeredQuestionIds }` — sent on join and every admin transition; drives which screen to show. When `status` becomes `in_progress`, that's the client's cue to call `GET /api/questions/:sessionId` and fetch its own question set — there is no socket push of question content.
- `leaderboard:update` — `{ top: [{participantId, name, businessName?, score, rank}], totalAnswered }` — debounced ~1s, top 10 only.
- `quiz:ended` — `{}` — move participants/display straight to the results screen.

Answers are always submitted via the REST endpoint (`POST /api/answers`), never over the
socket — the socket is read-only broadcast (state sync + leaderboard).

## Design direction

- Mobile-first, big tap targets (this is used one-handed at an event, possibly with
  spotty wifi) — show clear loading/retry states on every network call, especially the
  `GET /api/questions/:sessionId` fetch right as the quiz starts (everyone hits it at
  once).
- Keep the results screen (leaderboard + "Analyze My Business" report) the emotional
  high point — give it more visual polish than the rest of the app, since it's the last
  thing every participant sees.
- The quiz itself is fast and self-paced — optimize the question screen for speed
  (instant tap-to-submit-to-next, no artificial waiting between questions).
- Handle reconnects gracefully: on socket reconnect, re-emit `join` and reconcile with
  `session:state` (and its `answeredQuestionIds`) rather than assuming client-side state
  is still correct. If the quiz is already `in_progress` on reconnect, re-fetch
  `GET /api/questions/:sessionId` — it always returns the same personal set, so this is
  safe to call repeatedly.
