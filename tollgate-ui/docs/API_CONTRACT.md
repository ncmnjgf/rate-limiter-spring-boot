# API Contract (Gateway Rate Limiter)

Based on the discovery of the Java Spring Cloud Gateway backend and `gatekeeper.html`, here is the API contract for the frontend.

## Overview
- **BACKEND_BASE_URL:** `http://localhost:8080` (or as configured in `.env`)
- **ADMIN_AUTH:** Not explicitly found in the minimal backend provided (likely no auth implemented for admin routes yet or they don't exist). Proceeding with a simulated/mock admin authentication or no auth if not needed.
- **REALTIME_TRANSPORT:** Polling via TanStack Query (no SSE/WebSocket implementation found in the backend code).
- **NON-OBVIOUS ENDPOINTS I WANT USED:** The rate-limit limit/remaining information is extracted directly from the response headers of *any* proxied request. 

## Endpoints

### 1. Health Check
- **GET** `/gateway/health`
- **Response (200 OK):**
```json
{
  "status": "UP",
  "service": "Rate Limiter Gateway"
}
```

### 2. Rate Limit Status
- **GET** `/gateway/rate-limit/status`
- **Request Headers:**
  - `X-Forwarded-For` (Optional): ID of the client to check status for.
- **Response (200 OK):**
```json
{
  "clientId": "192.168.1.1",
  "capacity": 20,
  "availableTokens": 10
}
```

### 3. Proxied Requests (Any Route)
- **GET/POST/PUT/DELETE** `/*` (Any proxied route, e.g. `/v1/search`)
- **Rate Limit Headers (Included on 429 and 200 responses):**
  - `X-RateLimit-Limit`: Total capacity (e.g., "20")
  - `X-RateLimit-Remaining`: Available tokens (e.g., "19")
- **Error Response (429 Too Many Requests):**
```json
{
  "error": "Rate limited exceeded",
  "clientId": "192.168.1.1"
}
```

## Open Questions & Assumptions
- The backend does not currently have endpoints for creating rules, viewing logs of all requests, or managing clients globally. The `RateLimiterService` seems to operate mostly internally.
- **Assumption:** For the Admin UI (Clients, Rules, Live logs, Alerts), unless more endpoints are added to the backend, we will use the frontend Mock mode (`VITE_MOCK=1`) or rely on a simulated API layer to demonstrate the functionality, while the landing page interacts with the real `/gateway/rate-limit/status` and proxied requests.
- **Action Plan:** I will proceed with building the UI based on `gatekeeper.html` aesthetics and logic, connecting the landing page demo to the real endpoints where possible, and mocking the admin dashboard data.
