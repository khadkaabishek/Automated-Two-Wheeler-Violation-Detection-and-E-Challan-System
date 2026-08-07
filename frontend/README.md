# Smart Traffic — Frontend

React + Vite frontend for the Smart Traffic Violation Management System. Three role-specific dashboards (Super Admin, Traffic Police, User/citizen), the full violation lifecycle (issue → approve → pay/dispute → resolve), self-service citizen registration, and the New Violations review queue for AI-flagged detections.

See the **root README** (`../README.md`) for the full setup guide covering all three services (backend, frontend, ml-service) together — that's the one to start with.

## Quick reference

```bash
npm install
cp .env.example .env   # set VITE_API_BASE_URL to match your backend's port
npm run dev
```

Runs at `http://localhost:5173` by default.

## Structure

- `src/pages/dashboards/` — the three separate role dashboards
- `src/pages/NewViolations.jsx` — the AI-detection review queue
- `src/pages/Challans.jsx` — violation records (issue, approve, pay, dispute)
- `src/pages/Violations.jsx` — violation *type* management (fine categories, not individual records)
- `src/components/icons.jsx` — the original inline-SVG icon set used across dashboards
- `src/api/` — one file per backend resource, all going through the shared `api/client.js`
