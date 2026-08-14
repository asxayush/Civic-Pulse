# Civic Pulse — Frontend PRD

**Type:** Hostel/Campus Complaint Management System — Frontend
**Stack:** React + Vite, Context API (state), Axios (API layer), React Router
**Reference:** Builds directly on the Civic Pulse Backend PRD — all routes, roles, and data models below are taken from that document, not re-designed
**Status:** Planning phase — this is Step 14 of the backend build order ("Frontend — separate phase, separate plan")

---

## 1. Purpose

The backend PRD defines *what* the system does. This document defines *what the user sees and clicks* to make that happen — screen by screen, role by role — so that build order is unambiguous and nothing gets designed twice on the fly.

Scope discipline note: this PRD covers **only** the MVP features from Backend PRD §4. Nothing from Backend PRD §5 (Future Scope) gets a screen here.

---

## 2. Goals

- One frontend, three role experiences (Student / Staff / Admin) — gated by route, not by separate apps
- Every backend route in §9 of the backend PRD maps to exactly one frontend action — no orphan endpoints, no screens calling routes that don't exist
- Image upload (complaint proof) must feel instant — optimistic preview before the Cloudinary round-trip completes
- Status and escalation state must be readable at a glance (badge/color system, not just text)
- Anonymous filing must be a visible, deliberate toggle at file-time — never a silent default

---

## 3. State Management Strategy

Per your existing React learning (Virtual DOM, useState, Router, Context API covered; Redux Toolkit deferred) — this frontend uses **Context API only**, no Redux. Two contexts are enough:

| Context | Holds | Why not more contexts |
|---|---|---|
| `AuthContext` | `user` (`{_id, name, role, department}`), `token`, `login()`, `logout()` | Every protected route and every API call needs this — global by nature |
| `ComplaintContext` | Active complaint list for current view (my complaints / public feed / assigned / escalated / all) + refetch trigger | Scoped per page in practice, but centralizing avoids prop-drilling between list and detail views |

Everything else (form state, modal open/close, upload progress) stays local `useState` in the component that owns it. If a component needs more than 2 levels of prop-drilling for something that isn't auth or complaint data, that's the signal to stop and ask before reaching for a third context — not a default.

---

## 4. Routing Map

```
/                          → Public feed (no login required)
/login                     → Login
/register                  → Student self-registration
/complaint/:ticketId       → Track a single complaint (public/authenticated — matches GET /api/complaints/:ticketId)

/student/*                 → requires role: student
  /student/dashboard         → My complaints (GET /api/complaints/my)
  /student/file               → File a new complaint (POST /api/complaints)

/staff/*                   → requires role: staff
  /staff/dashboard            → Assigned complaints (GET /api/complaints/assigned)

/admin/*                   → requires role: admin
  /admin/dashboard            → All complaints (GET /api/complaints/all)
  /admin/escalated            → Escalated list (GET /api/complaints/escalated)
  /admin/users                → User management (GET /api/admin/users)
  /admin/create-staff          → Staff creation form (POST /api/admin/create-staff)
```

Route guarding: a single `<ProtectedRoute allowedRoles={[...]}>` wrapper reads `AuthContext.user.role`. No route-level logic duplicated per page — this is the one place role-checking lives on the frontend (the backend still re-checks independently; frontend guarding is UX, not security).

---

## 5. Screens by Role

### 5.1 Public / Unauthenticated

**Public Feed** (`/`)
- Card grid of complaints, sourced from `GET /api/complaints/public`
- Each card: category icon, title (truncated), status badge, upvote count, "Anonymous Student" or filer name per masking rule (Backend PRD §8.5)
- Sort control: Recent / Most Upvoted (client-side sort on upvote count — no new backend route needed)
- Filter chips: category (electricity/water/food/miscellaneous), status
- Each card links to `/complaint/:ticketId`

**Track Complaint** (`/complaint/:ticketId`)
- Ticket ID, title, description, image, category, status badge, filed date, resolution time (if resolved)
- Status shown as a 3-step progress indicator: Pending → In Progress → Resolved
- If `escalated: true` — visible escalation banner
- No edit actions here regardless of role — this is a read view only

**Login / Register**
- Login: email + password → on success, `AuthContext.login()` stores token, redirect by role (`student`→`/student/dashboard`, `staff`→`/staff/dashboard`, `admin`→`/admin/dashboard`)
- Register: name, email, password — inline email-domain validation (client-side pre-check mirroring the backend's domain restriction, so the student gets instant feedback instead of a round-trip error)

### 5.2 Student

**My Complaints Dashboard** (`/student/dashboard`)
- List (not grid — status and dates matter more than photos here) from `GET /api/complaints/my`
- Each row: ticket ID, title, category, status badge, escalated flag if true, resolution time if resolved
- "File New Complaint" primary button

**File Complaint** (`/student/file`)
- Form fields: title, description, category (select), image upload, `isAnonymous` toggle
- Image upload: drag-drop or tap, client-side preview before submit, file type/size validated client-side (matches Backend PRD §10 server-side limits — client check is UX only, not a replacement)
- Anonymous toggle: explicit, off by default, with one line of explanatory text ("Your identity stays hidden on the public feed only — staff and admin will always see who filed this")
- Rate-limit awareness: if the backend returns a rate-limit error (Backend PRD §8.7), show it as a clear message, not a generic "something went wrong"
- On submit success → show returned `ticketId` prominently with a "Track this complaint" link, since that ID is the student's only reference going forward

**Public Feed access**: students use the same `/` feed as everyone else, plus an upvote button becomes active (`POST /api/complaints/:id/upvote`) when logged in as student

### 5.3 Staff

**Assigned Dashboard** (`/staff/dashboard`)
- List from `GET /api/complaints/assigned`, filtered to this staff member's department automatically (backend already scopes this — frontend doesn't re-filter)
- Each row expands to a detail panel with:
  - Status update control (`PATCH /api/complaints/:id/status`) — dropdown: pending / in-progress / resolved
  - "Mark Invalid" action (`PATCH /api/complaints/:id/mark-invalid`) — behind a confirm step, since it affects the student's `invalidComplaintCount`
  - Full complainant identity always visible here (Backend PRD §8.5 — no masking for staff)
- Sort/filter: by status, by filed date (oldest-first default, since that surfaces stale ones first — same intent as the 24hr escalation logic)

### 5.4 Admin

**All Complaints** (`/admin/dashboard`)
- Full table view from `GET /api/complaints/all` — every complaint, every department
- Columns: ticket ID, category, status, priority, escalated, filed date, assigned staff
- Same status-update and mark-invalid actions available as staff view, plus reassign (override `assignedTo`)

**Escalated** (`/admin/escalated`)
- Filtered view from `GET /api/complaints/escalated` — this is a separate screen, not just a filter toggle on All Complaints, because escalations need to be the thing an admin checks first, not something they have to remember to filter for

**User Management** (`/admin/users`)
- Table from `GET /api/admin/users`: name, email, role, department (if staff), `isBanned` status
- Ban/unban toggle inline (`PATCH /api/admin/users/:id/ban`) — confirm step before banning

**Create Staff** (`/admin/create-staff`)
- Form: name, email, password, department (select) → `POST /api/admin/create-staff`
- This is the only place a staff account can be created — no self-registration path exists for staff, and the UI should not imply one

---

## 6. Component Inventory

Kept flat and reusable — no premature abstraction. Roughly:

| Component | Used in |
|---|---|
| `ComplaintCard` | Public feed |
| `ComplaintRow` | Student/Staff/Admin dashboards |
| `StatusBadge` | Everywhere a status shows — single source of truth for status → color mapping |
| `EscalationBanner` | Track view, dashboards |
| `ImageUploadField` | File complaint form |
| `CategorySelect` | File complaint form, feed filter |
| `ProtectedRoute` | Router setup |
| `ConfirmDialog` | Mark invalid, ban user (any destructive/consequential action) |
| `UpvoteButton` | Public feed |

---

## 7. API Integration Layer

Single `api/` folder, one file per resource, mirroring backend route grouping exactly:

```
api/
  auth.js         → register, login, me
  complaints.js   → create, my, public, byTicketId, assigned, updateStatus, markInvalid, upvote, escalated, all
  admin.js        → createStaff, listUsers, banUser
```

Every function attaches the JWT from `AuthContext` via an Axios interceptor — no manual header-setting per call. A single interceptor also handles 401s globally (auto-logout + redirect to `/login`), so no screen needs its own auth-expiry handling.

---

## 8. Non-Functional Requirements (Frontend-specific)

- **Loading states:** every data-fetching screen needs a skeleton or spinner — no blank screen while awaiting a response, especially for the live demo
- **Error states:** every form and list needs a visible failure state, not just a console error — this matters more for a judged demo than most other polish
- **Responsive:** hostel/campus users are heavily mobile — dashboards must work at phone width, not just desktop
- **Optimistic UI:** upvote button should update instantly and reconcile on response, not wait for round-trip (small thing, but it's the single most-clicked action on the public feed and latency there is the most visible lag in a demo)

---

## 9. Build Order (Recommended)

1. Project setup — Vite + React Router + Axios instance + folder structure
2. `AuthContext` + Login/Register screens wired to `/api/auth/*`
3. `ProtectedRoute` + role-based redirect logic
4. Public Feed (`/`) — read-only, no auth needed, good first working screen for demo confidence
5. Track Complaint view (`/complaint/:ticketId`)
6. Student: File Complaint form (incl. image upload) → My Complaints dashboard
7. Staff: Assigned dashboard + status update + mark-invalid
8. Admin: All Complaints + Escalated + User Management + Create Staff
9. Upvote wiring on public feed (needs auth context already in place)
10. Polish pass: loading/error states, responsive check, status badge consistency

This order is deliberately demo-shaped: by step 4 you have something visibly working end-to-end (backend feed → rendered cards), which matters if you're rehearsing a live demo before every piece is done.

---

## 10. Out of Scope for This PRD

- Visual design system / color palette / component styling specifics (separate design pass, not a PRD concern)
- Any screen for Backend PRD §5 future-scope features (peer-support module, notifications, analytics dashboard, round-robin assignment)
- Multi-organization / multi-tenant UI (flagged separately as a post-MVP architecture question, not scoped here)