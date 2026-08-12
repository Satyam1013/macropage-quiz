# MACROPAGE Quiz Backend

Backend for a live, in-person business quiz used at a MACROPAGE stage event.
~100–110 small-business owners scan a QR code, register, answer a mix of
5 mindset-based questions and optional trivia questions on their phones,
watch a live leaderboard on a projector, and finish with an AI-generated
"Analyze My Business" report. An admin controls the quiz flow from a laptop.

## Tech stack

- NestJS (TypeScript)
- MongoDB + Mongoose
- Socket.IO (`@nestjs/websockets` + `@nestjs/platform-socket.io`) for
  real-time question push, live leaderboard, and state sync
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
2. (One-time, or whenever the bank needs refreshing) Admin seeds the trivia
   bank: `POST /api/questions/trivia/seed` — idempotent, inserts the 50
   trivia questions only if none exist yet. Browse them with
   `GET /api/questions/trivia/bank`.
3. Admin creates a session: `POST /api/sessions` (auto-seeds the 5 default
   mindset questions unless `autoSeedQuestions: false` is passed, and
   optionally appends trivia via `triviaQuestionIds` — a hand-picked, ordered
   list — or `triviaCount` — a random sample from the bank). Registration is
   open immediately — no separate "open registration" step. Participants
   scan the QR code (`https://quiz.macropage.in/join?session=<id>`), hit
   `POST /api/participants/register`, complete onboarding, and wait.
4. Admin starts the quiz: `POST /api/sessions/:id/start` — broadcasts every
   question in the session (mindset + trivia, in the order configured) to
   everyone connected at once; participants answer them self-paced
   (`POST /api/answers` per question) and then wait.
5. Admin ends the quiz whenever they choose (typically within ~1 minute):
   `POST /api/sessions/:id/end` — freezes the leaderboard and moves
   participants straight to their results screen (rank + leaderboard).
6. Participants tap "Analyze My Business" on the results screen:
   `POST /api/participants/:id/analysis`.
7. Admin exports the lead list: `GET /api/sessions/:id/export.csv`.

## REST API

All routes are prefixed with `/api` (except `/health`).

### Public / participant-facing

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/participants/register` | — | `{ sessionId, name, whatsappNumber }` → `{ participantId, sessionToken }`; blocked only once the session has `ended` |
| PATCH | `/participants/:id/onboarding` | sessionToken | `{ businessName?, businessCategory?, goal, goalOther? }` |
| GET | `/sessions/:id/state` | — | `?participantId=` optional; `{ status, totalQuestions, answeredQuestionIds }` |
| GET | `/questions/:sessionId` | — | All of the session's questions at once (mindset + trivia), sanitized (no points); 400 until the quiz has started |
| POST | `/answers` | sessionToken | `{ questionId, selectedKey, timeTakenMs }` — any question belonging to the session, in any order, while `in_progress` |
| GET | `/participants/:id/rank` | — | Current rank + score |
| POST | `/participants/:id/analysis` | sessionToken | Generates (or returns cached) AI report |
| GET | `/participants/:id/analysis` | — | Fetch existing report |

### Admin-only (JWT bearer)

| Method | Path | Description |
|---|---|---|
| POST | `/auth/admin/login` | `{ email, password }` → `{ accessToken }` |
| POST | `/questions/trivia/seed` | Idempotent: inserts the 50 trivia questions if none exist yet |
| GET | `/questions/trivia/bank` | List the full trivia bank, incl. `correctKey`, for picking questions |
| POST | `/sessions` | Create a session (`draft`); auto-seeds the 5 default mindset questions; optionally append trivia via `triviaQuestionIds` (ordered pick) or `triviaCount` (random sample); registration is open immediately |
| GET | `/sessions` | List all sessions (past + current), newest first — for browsing quiz history |
| POST | `/sessions/:id/start` | draft → in_progress; broadcasts all questions at once |
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
- `questions:all` — `{ questions: [...], totalQuestions, serverTimestamp }`, sent once
  when the quiz starts (and to anyone joining mid-quiz or after it ends)
- `leaderboard:update` — `{ top: [{ participantId, name, businessName, score, rank }], totalAnswered }`,
  debounced to at most once per second per session
- `quiz:ended` — results-screen trigger

Answers are always submitted over REST (`POST /answers`), never over the
socket — the socket is read/broadcast only, which keeps the write path
simple and avoids double-submits.

## Data model

- **QuizSession** — one live event run; `draft → in_progress → ended`, with
  an ordered `questionIds` list. Registration is open throughout `draft`
  and `in_progress` (blocked only once `ended`); all questions are pushed
  to participants at once when the quiz starts, answered self-paced, and
  the admin ends the quiz whenever they choose. Sessions are never
  deleted — every `Participant`, `Answer`, and `AnalysisReport` carries its
  `sessionId`, so past events stay fully queryable via `GET /sessions` (list)
  and the existing per-session leaderboard/participants/export routes.
- **Question** — `type: 'mindset' | 'trivia'`, text, 4 options. Mindset
  questions carry a `dimension` (one of `growth_mindset`,
  `customer_relationship`, `strategic_thinking`, `investment_discipline`,
  `digital_readiness`) with options worth 0–3 points each, feeding the
  archetype/`techScore` analysis. Trivia questions have no dimension — one
  option worth full points (correct), the rest worth 0 — and count toward
  the leaderboard score only, not the AI analysis. The 50-question trivia
  bank is seeded once (`POST /questions/trivia/seed`) and reused across
  sessions; a session picks a subset of it at creation time.
- **Participant** — registers into a session with just a name + WhatsApp
  number; gets a `sessionToken` used as a bearer token for every
  authenticated follow-up call.
- **Answer** — one per `(participantId, questionId)`, enforced by a unique
  index.
- **AnalysisReport** — cached per participant; dimension scores, a
  weighted `techScore`, an archetype derived from the highest-scoring
  dimension, and the AI-generated `reportJson`.

## Scoring & the AI report

1. Each dimension's score is the earned points on its one mindset question,
   normalized to 0–100. Trivia answers are excluded from this calculation
   entirely (they still count toward leaderboard score).
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
