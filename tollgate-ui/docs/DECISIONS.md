# Design Decisions

## 1. Vite & API Mocking
Since the backend lacks administrative endpoints (tables, rules CRUD, live-logs output), I implemented `VITE_MOCK=1` abstraction. The landing page `/test` route will connect dynamically via the Vite Proxy (`/api`) to bypass local CORS, allowing true Token-Bucket demonstration.

## 2. Animation & UI
- **Styling**: Upgraded to Tailwind v4, defining the brand tokens (`--color-brand-cyan`, etc.) directly inside the new `@theme` root syntax in `index.css`.
- **GSAP & Lenis**: Implemented in `App.tsx` and `Landing.tsx`. The custom CatmullRom path approach requested for the 3D scene will require a detailed Three.js canvas which is isolated, so for Phase 3 I've begun with the overarching standard layout (Navbar, interactive GSAP hero text, and the "Try It" Demo block side-by-side with realtime logs).
- **Mock Fallback**: On the frontend, if the Spring Boot gateway is offline, `VITE_MOCK` falls back to realistic `setTimeout` spoofing inside `src/api/client.ts` delivering 429 statuses after a random burst simulation.
