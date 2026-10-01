# PROJECT BRIEF: Tollgate frontend (landing + scroll story + admin console)

You are a senior full-stack engineer and product designer working autonomously in this workspace.
Build the complete production frontend for "Tollgate", my API rate limiter (token-bucket algorithm).
My backend is ALREADY BUILT and running. Do NOT rewrite it. Connect the new frontend to it.

## 0. Inputs you must read FIRST (before writing any code)
1. `tollgate.html` in the workspace: my old single-file prototype. Reuse its brand, copy, the Three.js
   scene (glass pipe, amber gate ring, glass bucket, coins, red shield) and the token-bucket demo logic.
2. The backend code in this workspace (look for server/, api/, backend/, src/, routes, controllers,
   middleware, OpenAPI/Swagger files, README, .env.example, docker-compose). Extract:
   - Base URL, port, CORS config, auth method for admin routes (API key header / JWT / session)
   - Every endpoint, method, request body, and response shape
   - How rate-limit headers are returned (X-RateLimit-Limit / Remaining / Reset, Retry-After)
   - Whether there is a real-time channel (SSE, WebSocket) for logs/metrics
   - The data model: clients (IP or API key), rules, buckets, counters, logs, alerts
3. Write what you found into `docs/API_CONTRACT.md` (table of endpoints + TypeScript types) and show
   it to me as an Artifact BEFORE building the UI. If something is missing or ambiguous, list it under
   "Open questions" and proceed with the safest assumption, isolated behind the API layer so it is a
   one-file change.

### Fill-in section (leave blank = discover from the code)
- BACKEND_BASE_URL: 
- ADMIN_AUTH: 
- REALTIME_TRANSPORT (sse / websocket / polling): 
- NON-OBVIOUS ENDPOINTS I WANT USED: 

## 1. Tech stack (decide and stick to it)
- Vite + React 18 + TypeScript (strict), React Router (hash or browser router), Tailwind CSS with a
  custom design-token theme, Zustand for state, TanStack Query for server data.
- three (Three.js), gsap + ScrollTrigger (+ Lenis for smooth scrolling), lucide-react icons.
- Charts: build a custom lightweight canvas/SVG time-series component (smooth curves, gradient fill,
  crosshair tooltip). Do not pull in a heavy chart library.
- Fonts: Anybody (headings), Hanken Grotesk (body), JetBrains Mono (data), self-hosted or Google Fonts.
- Folder layout: src/api, src/features/{landing,admin}, src/components/ui, src/three, src/lib,
  src/hooks, src/styles. Path alias `@/`. ESLint + Prettier configured.
- Env vars via `.env` (`VITE_API_BASE_URL`, `VITE_ADMIN_KEY` if applicable). Provide `.env.example`.

## 2. API layer (src/api)
- One typed client (fetch wrapper) with: base URL, auth header injection, timeout, retry with backoff
  on network errors (not on 4xx), JSON error normalisation, and automatic capture of the rate-limit
  headers from every response into a store (so the UI can show live Remaining / Reset).
- One typed module per resource (metrics, clients, rules, logs, alerts, auth).
- Real-time: use the backend's SSE/WebSocket if it exists (auto-reconnect, exponential backoff,
  heartbeat, "connection lost / reconnecting" banner). If not, poll with TanStack Query
  (refetchInterval 1-2s, paused when the tab is hidden).
- MOCK MODE: `VITE_MOCK=1` runs a realistic in-browser simulation (daily traffic curve, random bursts,
  one abusive client that floods then recovers) implementing the exact same interfaces, so the UI can be
  developed and demoed with no backend. Default is LIVE mode against my real backend.
- The landing-page "Send request" buttons must call the REAL backend (a public demo/test endpoint) and
  show the real status code, latency, and headers. If no such endpoint exists, add the smallest possible
  one to the backend (`GET /api/demo/ping`, behind the limiter) and document it.

## 3. Design system
- Brand: navy #0B1040, cyan #3DE8FF, amber #FFB627, green #4DFFB0, red #FF5A47, lavender #B9C2FF.
- Tokens as CSS variables + Tailwind theme: spacing scale, radius scale, elevation scale, one easing
  `cubic-bezier(.22,1,.36,1)`, durations 150/250/450ms.
- Component kit in src/components/ui: Button (primary/secondary/ghost/danger, loading, disabled),
  Input, Select, Toggle, Slider (custom track + glowing thumb + value bubble), Badge, Card (glass),
  Table (sortable, sticky header), Modal, Drawer, Tabs, Tooltip, Toast, Skeleton, EmptyState, Kbd,
  CommandPalette (Cmd/Ctrl+K), Sparkline, Gauge, CountUp.
- Micro-interactions: hover lift, press scale .97, ripple on primary buttons, focus rings, animated
  numbers (tween, never snap), red edge pulse on a 429.

## 4. Landing page = a continuous scroll-driven story (the core experience)
Feels like an Apple/Stripe product page. One pinned fixed Three.js canvas, ~600vh of scroll (~400vh on
mobile), one master GSAP timeline scrubbed by scroll (scrub: 1) with Lenis smooth scrolling.
- Camera moves along a smooth CatmullRom path through the keyframes (hero -> bucket -> coins dropping
  -> gate -> blocked request -> wide shot) with mouse parallax. No jump-cuts.
- Scrolling forward fills the bucket coin by coin, sends requests through the pipe, and when the bucket
  empties the gate closes (red shield scales in) and requests bounce back. Scrolling back rewinds
  everything (fully reversible).
- Right-edge vertical progress bar + clickable step dots (1, 2, 3, Try it, Admin).
- Step panels fade/slide in and out only within their scroll range (opacity + translateY, no layout
  shift), big animated step numbers, live HUD (tokens left / allowed / blocked).
- Extras: word-by-word headline reveal, count-up stats when in view, staggered cards, parallax layers,
  a pinned horizontal-scroll "Algorithms" section (Token bucket, Sliding window, Fixed window,
  Leaky bucket) with a small looping animation each, a velocity-reactive marquee, scroll-linked
  background glow shift (navy -> deep purple -> navy).
- "Try it" panel: sliders for bucket size and refill rate (sent to the backend if it supports per-demo
  config, otherwise simulated locally and labelled clearly), Send 1 / Send 20 buttons, animated token
  pips, slide-in request log with status badge, latency and Retry-After.
- Also: nav that turns to frosted glass on scroll with active-section highlight and an "Open admin"
  button, mobile menu, code-snippet section showing the rate-limit response headers with a copy button,
  FAQ accordion with smooth height animation, footer.
- NEVER scroll-jack: normal scrolling, touch, keyboard, anchor links and browser back/forward must all
  work and restore position.

## 5. Admin console (route /admin, real data from my backend)
Full-screen app: fixed sidebar (collapsible, icons, tooltips) + fixed top bar + independently scrolling
content area with thin styled scrollbar and a top-bar shadow when scrolled.
- Auth: login screen using the backend's real auth. Protected routes, token/session persisted safely,
  auto-logout on 401, clear error messages.
- Top bar: environment switcher, time-range picker (5m/1h/24h/7d), global search (press "/"),
  notification bell with unread count, avatar menu, theme toggle.
- Overview: 4 KPI cards (Total requests, Allowed %, Blocked 429, Avg bucket usage) with count-up, delta
  vs previous period and sparkline; main time-series chart (Allowed vs Blocked, legend toggles, hover
  crosshair + tooltip, gradient fill, smooth live updates); animated bucket gauge; Top endpoints
  (allowed/blocked split); Top offenders with Block button.
- Clients: data table (IP/API key, plan, tokens left with inline bar, req/min, 429 count, last seen,
  status). Sort, filter chips (All/Throttled/Blocked), search, infinite scroll with skeleton rows.
  Update cells IN PLACE (keyed rows, never rebuild the table) so nothing flickers. Row click opens a
  right drawer with a usage chart and actions: Reset bucket, Block, Unblock, Change limit (all call the
  real API with optimistic updates + rollback on failure).
- Rules: list + create/edit modal (name, route pattern, algorithm, capacity, refill rate, scope per-IP /
  per-key / global, enabled toggle) with validation and a live "= N requests per minute" preview.
  Delete with confirm dialog.
- Live logs: streaming terminal-style feed (timestamp, method badge, path, client, status color-coded,
  latency). Pause/Resume, status filter, download CSV. Auto-scroll to newest, stops when the user scrolls
  up and shows a floating "Jump to latest (N new)" button. Cap the DOM at ~500 rows (virtualise).
- Alerts: list with severity chips, timestamps, acknowledge button.
- Every action shows a toast; every list has loading skeletons, empty state and error state with Retry.
- Requests sent from the landing page must appear in the admin logs and counters (it's the same
  backend, so verify this end-to-end).

## 6. Quality bars
- Performance: animate only transform/opacity; one shared rAF loop; pause Three.js when the admin is
  open or the tab is hidden; cap devicePixelRatio at 1.75; lazy-load the 3D scene and admin routes with
  code splitting; Lighthouse Performance >= 85 on the landing page (mobile).
- Responsive: usable at 360px (sidebar -> drawer/bottom bar, tables -> stacked cards).
- Accessibility: semantic HTML, WCAG AA contrast, visible focus, full keyboard support, focus trap in
  modals/drawers, Esc to close, aria-live for HUD/log updates, `prefers-reduced-motion` disables
  scrubbing/parallax/magnetic effects and falls back to simple fades.
- Security: no secrets committed, escape all rendered log/IP strings (XSS), respect CORS, never log
  tokens to the console.
- Error handling: nothing may crash the page; add an error boundary per route.

## 7. How to work (agent workflow)
Work in phases. After each phase, run the app and verify in the browser before continuing, and
produce an Artifact (short summary + screenshots or a recording of the key interaction).
1. Discovery: read tollgate.html + backend, write docs/API_CONTRACT.md. STOP and show it.
2. Scaffold: Vite project, tooling, design tokens, UI kit, API layer with typed client + mock mode.
3. Landing page: 3D scene port, then the scroll-driven story, then Try-it wired to the real backend.
4. Admin: auth, layout, Overview, Clients, Rules, Live logs, Alerts.
5. Polish: performance, accessibility, responsive, reduced-motion, error/empty states.
6. Tests + docs: Vitest unit tests for the API client and rate-limit helpers, a Playwright smoke test
   (landing loads, send request shows a status, admin login, rules CRUD, logs stream), README with
   setup, env vars, scripts and screenshots.

Do not ask me questions unless something is truly blocking. Make reasonable decisions, record them
in `docs/DECISIONS.md`, and keep going. Do not leave TODOs, placeholder text or fake data in LIVE mode.

## 8. Definition of done (verify each item yourself in the browser)
[ ] `npm install && npm run dev` starts cleanly against my backend, `npm run build` passes with zero
    TypeScript/ESLint errors
[ ] Landing: pinned 3D scene, scrubbed scroll story, reversible, works on mobile
[ ] "Send request" hits the real backend and shows real status/latency/headers
[ ] Admin login works with my real auth; all 5 pages show REAL data
[ ] Rule create/edit/delete and client block/unblock/reset actually change backend state
[ ] Live logs stream in real time; the landing-page requests show up in them
[ ] No table flicker, numbers tween, charts have hover tooltips
[ ] Keyboard-only and 360px mobile pass, reduced-motion mode works
[ ] No console errors, README + API_CONTRACT.md + DECISIONS.md written