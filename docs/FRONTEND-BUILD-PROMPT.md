# Build the MACROPAGE Live Quiz frontend

Build a mobile-first web frontend for a **live, in-person business quiz** run at a
MACROPAGE stage event. ~100–110 small-business owners scan a QR code on their phones,
register, answer 5 mindset questions with a countdown timer, watch a live leaderboard,
and finish with an AI-generated "Analyze My Business" report. There is also a big-screen
"display" view for the projector, and an admin console the event host runs from a laptop
to control the quiz.

The backend is already built (NestJS + MongoDB + Socket.IO). Do not invent endpoints —
use exactly what's documented below. Base API URL and Socket.IO URL should be read from
environment variables (e.g. `VITE_API_URL`, `VITE_SOCKET_URL`).

## Screens to build

### 1. Participant flow (phone, portrait)
1. **Join / Register** — landing page opened via QR code URL containing `?session=<id>`.
   Form: name, WhatsApp number (10-digit Indian mobile). On submit, call
   `POST /api/participants/register`, store `participantId` and `sessionToken` in
   localStorage.
2. **Onboarding** — business name, business category (dropdown: Retail / Kirana, Food &
   Hospitality, Manufacturing, Services, Healthcare, Finance, Logistics & Transport,
   Education, Other — free text allowed too), and goal (grow customers / grow revenue /
   other, with a text field if "other"). Submit via
   `PATCH /api/participants/:id/onboarding` with the sessionToken as bearer auth.
3. **Waiting room** — shown while `session:state.status` is `draft` or
   `registration_open`. Friendly "hang tight, quiz starts soon" message.
4. **Question screen** — shown on `question:new` socket event. Render question text, 4
   options (A–D), a countdown ring/bar using `timeLimitSeconds` synced against
   `serverTimestamp` (don't trust local clock drift). On selecting an answer, call
   `POST /api/answers` immediately, then show a "locked in, waiting for others" state
   until the next `question:new` or `quiz:ended` event. Handle the case where the
   participant reloads mid-question — use `GET /api/sessions/:id/state?participantId=`
   to check `hasAnsweredCurrentQuestion` and skip straight to the waiting state if true.
5. **Live rank glimpse** (optional, between questions) — small toast/badge using
   `GET /api/participants/:id/rank`.
6. **Final screen** — shown on `quiz:ended`. Show final rank/score
   (`GET /api/participants/:id/rank`), then a prominent **"Analyze My Business"** button.
   On click, call `POST /api/participants/:id/analysis` (bearer sessionToken) — this can
   take a few seconds, show an "AI is thinking about your business…" loading state, then
   render the report: headline, businessSnapshot, mindsetProfile, archetype, a roadmap
   checklist (goalRoadmap items), and the tech recommendation as a soft CTA. On
   revisit/refresh, call `GET /api/participants/:id/analysis` first to show a cached
   report without re-triggering generation.

### 2. Display screen (projector, landscape, no interaction)
Connects to the socket with `role: "display"`. Shows:
- Waiting/registration count screen before start
- Current question + live options while a question is active (no correct answer shown)
- A big animated leaderboard (top 10) that updates on `leaderboard:update`, sorted by
  rank, showing name + business name + score
- A final leaderboard / "thank you" screen on `quiz:ended`

### 3. Admin console (laptop, desktop layout)
1. **Login** — `POST /api/auth/admin/login`, store the JWT, attach as bearer to all
   admin calls.
2. **Session control panel** — create a session (`POST /api/sessions`, title +
   auto-seed toggle), then buttons that call, in order: open registration
   (`POST /api/sessions/:id/open-registration`), start
   (`POST /api/sessions/:id/start`), next question
   (`POST /api/sessions/:id/next-question`, disabled/hidden on the last question), end
   (`POST /api/sessions/:id/end`). Disable buttons that aren't valid for the current
   status (the API also enforces this server-side and returns 400 — surface that error).
3. **Live dashboard** — participant count, current question index/total, a live ranked
   table (`GET /api/sessions/:id/leaderboard`, or listen to `leaderboard:update` on the
   socket joined with `role: "admin"`).
4. **Participants & export** — table from `GET /api/sessions/:id/participants`, and a
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
| POST | `/api/sessions` | admin | `{ title, autoSeedQuestions? }` | QuizSession |
| POST | `/api/sessions/:id/open-registration` | admin | — | QuizSession |
| POST | `/api/sessions/:id/start` | admin | — | QuizSession |
| POST | `/api/sessions/:id/next-question` | admin | — | QuizSession |
| POST | `/api/sessions/:id/end` | admin | — | QuizSession |
| GET | `/api/sessions/:id/leaderboard` | admin | — | `LeaderboardEntry[]` |
| GET | `/api/sessions/:id/participants` | admin | — | `Participant[]` |
| GET | `/api/sessions/:id/export.csv` | admin | — | CSV file |
| GET | `/api/sessions/:id/state?participantId=` | none | — | `{ sessionId, title, status, currentQuestionIndex, totalQuestions, hasAnsweredCurrentQuestion }` |
| GET | `/api/questions/:sessionId/current` | none | — | `{ id, text, order, timeLimitSeconds, dimension, options: [{key, text}], index, totalQuestions }` |
| POST | `/api/participants/register` | none (rate-limited) | `{ sessionId, name, whatsappNumber }` | `{ participantId, sessionToken }` |
| PATCH | `/api/participants/:id/onboarding` | sessionToken | `{ businessName?, businessCategory?, goal, goalOther? }` | Participant |
| GET | `/api/participants/:id/rank` | none | — | `{ rank: number\|null, score }` |
| POST | `/api/answers` | sessionToken | `{ questionId, selectedKey, timeTakenMs }` | Answer |
| POST | `/api/participants/:id/analysis` | sessionToken | — | AnalysisReport (generates or returns cached) |
| GET | `/api/participants/:id/analysis` | none | — | AnalysisReport or 404 |

`goal` enum: `grow_customers` \| `grow_revenue` \| `other` (send `goalOther` when
`other`). `selectedKey` enum: `A` \| `B` \| `C` \| `D`. `status` enum on QuizSession:
`draft` \| `registration_open` \| `in_progress` \| `ended`.

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
- `session:state` — `{ sessionId, title, status, currentQuestionIndex, totalQuestions, hasAnsweredCurrentQuestion }` — sent on join and every admin transition; drives which screen to show.
- `question:new` — `{ question: {id, text, order, timeLimitSeconds, dimension, options}, index, totalQuestions, timeLimitSeconds, serverTimestamp }` — start the countdown from `serverTimestamp`, not `Date.now()` on the client.
- `leaderboard:update` — `{ top: [{participantId, name, businessName?, score, rank}], totalAnswered }` — debounced ~1s, top 10 only.
- `quiz:ended` — `{}` — move participants/display to final screens.

Answers are always submitted via the REST endpoint (`POST /api/answers`), never over the
socket — the socket is read-only broadcast.

## Design direction

- Mobile-first, big tap targets (this is used one-handed at an event, possibly with
  spotty wifi) — show clear loading/retry states on every network call.
- Keep the "Analyze My Business" report screen the emotional high point — give it more
  visual polish than the rest of the app.
- Use a countdown that's visually obvious (ring or bar), since the time limit per
  question is short (default 20s).
- Handle reconnects gracefully: on socket reconnect, re-emit `join` and reconcile with
  `session:state` rather than assuming client-side state is still correct.
