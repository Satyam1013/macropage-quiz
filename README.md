# MACROPAGE Quiz Backend

Backend for a live, in-person business quiz used at a MACROPAGE stage event.
~100–110 small-business owners scan a QR code, register, and each answers
their own randomly-assigned set of 5 mindset questions (one per business
dimension, drawn from a larger bank so no two people necessarily see the
same wording) plus an optional shared trivia round, all on their phones.
They watch a live leaderboard on a projector and finish with an
AI-generated "Analyze My Business" report based on their mindset answers.
An admin controls the quiz flow from a laptop.

## Tech stack

- NestJS (TypeScript)
- MongoDB + Mongoose
- Socket.IO (`@nestjs/websockets` + `@nestjs/platform-socket.io`) for
  live leaderboard and quiz-state sync (question content itself is fetched
  per-participant over REST, since it's personalized — see below)
- JWT admin auth (`@nestjs/jwt`) — participants use a lightweight bearer
  session token issued at registration, no password
- `class-validator` / `class-transformer` for DTO validation
- Anthropic API (`@anthropic-ai/sdk`) for AI business-analysis report
  generation
- `@nestjs/throttler` to survive 100+ people scanning a QR code at once

## Setup

```bash
npm install
cp .env.example .env
# fill in MONGO_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, ANTHROPIC_API_KEY

npm run start:dev
```

On startup, the single admin account is bootstrapped automatically from
`ADMIN_EMAIL` / `ADMIN_PASSWORD` if it doesn't already exist — no manual
seeding step required.

### Environment variables

See `.env.example`:

| Variable | Description |
|---|---|
| `PORT` | HTTP port (default 3000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign admin JWTs |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Bootstrapped admin login |
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `ANTHROPIC_MODEL` | Model string, e.g. `claude-sonnet-5` |
| `CORS_ORIGIN` | Comma-separated allowed origins, or `*` |

## Running a live event

1. Admin logs in: `POST /api/auth/admin/login`.
2. (One-time, or whenever a bank needs refreshing) Admin seeds the question
   banks — both are idempotent, safe to call more than once:
   `POST /api/questions/mindset/seed` (15 questions, 3 per dimension) and
   `POST /api/questions/trivia/seed` (50 questions). Browse either with the
   matching `GET .../bank` route.
3. Admin creates a session: `POST /api/sessions` — optionally appends a
   shared trivia round via `triviaQuestionIds` (a hand-picked, ordered list)
   or `triviaCount` (a random sample from the bank). Mindset questions are
   *not* configured here — they're assigned per participant, not per
   session (see below). Registration is open immediately — no separate
   "open registration" step. Participants scan the QR code
   (`https://quiz.macropage.in/join?session=<id>`), hit
   `POST /api/participants/register`, complete onboarding, and wait.
4. Admin starts the quiz: `POST /api/sessions/:id/start`. Each participant
   then calls `GET /api/questions/:sessionId` (bearer sessionToken) to fetch
   *their own* question set: 5 mindset questions randomly assigned one per
   dimension the first time they ask (and reused after that), plus the
   session's shared trivia questions, if any. Different participants likely
   see different mindset wording for the same dimension. They answer
   self-paced (`POST /api/answers` per question) and then wait.
5. Admin ends the quiz whenever they choose (typically within ~1 minute):
   `POST /api/sessions/:id/end` — freezes the leaderboard and moves
   participants straight to their results screen (rank + leaderboard).
6. Participants tap "Analyze My Business" on the results screen:
   `POST /api/participants/:id/analysis` — built from their 5 personal
   mindset answers only (trivia never factors into it).
7. Admin exports the lead list: `GET /api/sessions/:id/export.csv`.

## REST API

All routes are prefixed with `/api` (except `/health`).

### Public / participant-facing

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/participants/register` | — | `{ sessionId, name, whatsappNumber }` → `{ participantId, sessionToken }`; blocked only once the session has `ended` |
| PATCH | `/participants/:id/onboarding` | sessionToken | `{ businessName?, businessCategory?, goal, goalOther? }` |
| GET | `/sessions/:id/state` | — | `?participantId=` optional; `{ status, totalQuestions, answeredQuestionIds }` |
| GET | `/questions/:sessionId` | sessionToken | This participant's personal question set: 5 randomly-assigned mindset questions (one per dimension, assigned on first call and reused after) + the session's shared trivia questions, sanitized (no points); 400 until the quiz has started |
| POST | `/answers` | sessionToken | `{ questionId, selectedKey, timeTakenMs }` — any question belonging to your personal set or the session's trivia round, in any order, while `in_progress` |
| GET | `/participants/:id/rank` | — | Current rank + score |
| POST | `/participants/:id/analysis` | sessionToken | Generates (or returns cached) AI report |
| GET | `/participants/:id/analysis` | — | Fetch existing report |

### Admin-only (JWT bearer)

| Method | Path | Description |
|---|---|---|
| POST | `/auth/admin/login` | `{ email, password }` → `{ accessToken }` |
| POST | `/questions/mindset/seed` | Idempotent: inserts the 15-question mindset bank (3 per dimension) if none exist yet |
| GET | `/questions/mindset/bank` | List the full mindset bank, grouped implicitly by `dimension` |
| POST | `/questions/trivia/seed` | Idempotent: inserts the 50 trivia questions if none exist yet |
| GET | `/questions/trivia/bank` | List the full trivia bank, incl. `correctKey`, for picking questions |
| POST | `/sessions` | Create a session (`draft`); optionally append a shared trivia round via `triviaQuestionIds` (ordered pick) or `triviaCount` (random sample) — mindset questions are assigned per participant, not configured here; registration is open immediately |
| GET | `/sessions` | List all sessions (past + current), newest first — for browsing quiz history |
| POST | `/sessions/:id/start` | draft → in_progress; requires the mindset bank to be seeded |
| POST | `/sessions/:id/end` | in_progress → ended, freezes leaderboard |
| GET | `/sessions/:id/leaderboard` | Full ranked list with scores |
| GET | `/sessions/:id/participants` | Full participant list + onboarding data |
| GET | `/sessions/:id/export.csv` | CSV lead list (participants + business info + scores) |

### Misc

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Render health check (not prefixed with `/api`) |

## WebSocket gateway (`/quiz` namespace)

Rooms: one room per `sessionId`, plus a `${sessionId}:display` sub-room for
the projector screen.

**Client → server**

- `join` — `{ sessionId, participantId?, role: 'participant' | 'display' | 'admin' }`

**Server → client**

- `session:state` — full state snapshot, sent on join and on every transition
- `leaderboard:update` — `{ top: [{ participantId, name, businessName, score, rank }], totalAnswered }`,
  debounced to at most once per second per session
- `quiz:ended` — results-screen trigger

There's no socket event carrying question content — since each participant's
set is personalized, question content is always fetched per-participant over
REST (`GET /questions/:sessionId`, bearer-authed) once the client sees
`session:state.status` become `in_progress`. Answers are likewise always
submitted over REST (`POST /answers`), never over the socket — the socket is
read/broadcast-only (state sync + leaderboard), which keeps the write path
simple and avoids double-submits.

## Data model

- **QuizSession** — one live event run; `draft → in_progress → ended`, with
  an ordered `questionIds` list that holds *only* the session's shared
  trivia picks (mindset questions are never session-scoped — see below).
  Registration is open throughout `draft` and `in_progress` (blocked only
  once `ended`); the admin starts and ends the quiz, participants answer
  self-paced in between. Sessions are never deleted — every `Participant`,
  `Answer`, and `AnalysisReport` carries its `sessionId`, so past events
  stay fully queryable via `GET /sessions` (list) and the existing
  per-session leaderboard/participants/export routes.
- **Question** — `type: 'mindset' | 'trivia'`, text, 4 options. Mindset
  questions carry a `dimension` (one of `growth_mindset`,
  `customer_relationship`, `strategic_thinking`, `investment_discipline`,
  `digital_readiness`) with options worth 0–3 points each, feeding the
  archetype/`techScore` analysis; the bank holds 3 variants per dimension so
  participants can get different specific wording. Trivia questions have no
  dimension — one option worth full points (correct), the rest worth 0 —
  and count toward the leaderboard score only, not the AI analysis. Both
  banks are seeded once (`POST /questions/mindset/seed`,
  `POST /questions/trivia/seed`) and reused globally; a session only ever
  picks a trivia subset at creation time.
- **Participant** — registers into a session with just a name + WhatsApp
  number; gets a `sessionToken` used as a bearer token for every
  authenticated follow-up call, and an `assignedQuestionIds` array holding
  their personal, randomly-picked mindset question set (one per dimension) —
  assigned on their first `GET /questions/:sessionId` call and reused after
  that, so it's stable across reloads.
- **Answer** — one per `(participantId, questionId)`, enforced by a unique
  index.
- **AnalysisReport** — cached per participant; dimension scores, a
  weighted `techScore`, an archetype derived from the highest-scoring
  dimension, and the AI-generated `reportJson`.

## Scoring & the AI report

1. Each dimension's score is the earned points on the participant's one
   assigned question for that dimension, normalized to 0–100. Trivia answers
   are excluded from this calculation entirely (they still count toward
   leaderboard score).
2. `techScore` is a weighted average across all five dimensions, weighted
   toward `digital_readiness`.
3. The archetype is picked from whichever dimension scored highest.
4. The Anthropic API is prompted with the business info, computed scores,
   and archetype, and asked to return strict JSON matching the
   `reportJson` shape. A malformed response is retried once before
   surfacing an error.
5. Reports are cached — hitting `POST /participants/:id/analysis` again
   returns the existing report instead of calling the model again.

## Non-functional notes

- Sized for ~110 concurrent participants: leaderboard broadcasts are
  debounced to once per second per session instead of firing on every
  single answer.
- `POST /participants/register` is throttled (5 requests / 10s per IP) to
  survive 100+ people scanning a QR code at the same moment; all other
  routes share a lighter global default (120 req/min).
- WhatsApp numbers are validated as 10-digit Indian mobile numbers with no
  OTP step — this is a live-event lead-capture flow, not a banking app.
