# E-Challan Console — Frontend

A React admin console for the E-Challan Management System backend: issue and track citations, manage vehicles/owners/violations, process payments, run reports, and administer users/roles — all backed by the real API.

## Stack

- React 19 + Vite
- React Router (client-side routing)
- Recharts (dashboard charts)
- Plain CSS with a small design-token system (no UI framework) — see `src/styles/tokens.css`

## Design

Built around the actual subject matter — a traffic citation — rather than a generic admin template:
- **Color** is semantic, not decorative: amber = pending, blue = approved/info, green = paid/approved, red = rejected/stop. These are the same colors a traffic signal uses for the same meanings.
- **Type**: Space Grotesk for headers/nav, Inter for UI text, JetBrains Mono for anything that reads like it was printed on a ticket (challan numbers, plate numbers, amounts).
- **Signature element**: the Challan detail view is rendered as an actual ticket stub — dashed perforated edge, monospace serial number, rotated status stamp.

## Setup

1. **Make sure the backend is running first** (see the backend's own README). Note the port it's on — the backend README covers a common macOS port 5000 conflict with AirPlay Receiver, so it may be running on 5001.

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Point the frontend at your backend**
   ```bash
   cp .env.example .env
   ```
   Edit `.env`:
   ```
   VITE_API_BASE_URL=http://localhost:5001/api/v1
   ```
   (match whatever port your backend is actually running on)

4. **Run it**
   ```bash
   npm run dev
   ```
   Open the URL Vite prints (typically `http://localhost:5173`).

5. **Log in**
   Use the Super Admin account created by the backend's seed script:
   - Email: `superadmin@echallan.gov.np`
   - Password: `SuperAdmin@123`

   Change this password before using this anywhere but your own machine.

## What's wired up

Every page talks to a real backend endpoint — nothing here is mocked:

| Page | Backend module |
|---|---|
| Dashboard | `/dashboard/*` — summary stats, daily challans, monthly revenue, top violations, challans by officer |
| Challans | `/challans/*` — full workflow (issue → approve/reject → pay → close/cancel), evidence upload |
| Payments | `/payments/*` — process payment against an approved challan |
| Vehicles | `/vehicles/*` — CRUD, status changes |
| Vehicle Owners | `/owners/*` — CRUD |
| Violations | `/violations/*` — CRUD, fine amounts |
| Reports | `/reports/excel`, `/reports/pdf` — file downloads |
| Users | `/users/*` — CRUD, activate/deactivate (admin) |
| Roles & Permissions | `/roles/*` — create roles, assign permissions per module (admin) |
| Audit Log | `/audit-logs` — read-only activity trail (Super Admin/Admin) |

## Auth & permissions

- On login, the access + refresh tokens are stored in `localStorage` and attached automatically to every request.
- If a request gets a `401`, the client silently tries a refresh once and retries; if that also fails, you're bounced to `/login`.
- The sidebar and action buttons hide themselves based on the logged-in user's actual permissions (`user.permissions`, resolved server-side from their role) — the same RBAC the backend enforces, reflected in the UI. Hiding a button doesn't replace the backend's own permission checks; it just avoids showing actions the user can't perform.

## Build

```bash
npm run build     # outputs to dist/
npm run preview   # preview the production build locally
```

## Notes

- File uploads (avatars, vehicle images, challan evidence) go through the backend's Multer endpoints as `multipart/form-data`.
- Payment methods `ESEWA`, `KHALTI`, and `STRIPE` are available in the UI but will return a clear "not yet configured" error from the backend until real gateway credentials are wired up there — `CASH` and `BANK_TRANSFER` work end-to-end today.
- CORS: the backend's `.env` has `CORS_ORIGIN` — make sure it matches wherever this frontend is actually running (default Vite dev port is `5173`).
