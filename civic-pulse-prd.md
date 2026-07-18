# Civic Pulse — Product Requirements Document (PRD)

**Type:** Hostel/Campus Complaint Management System
**Stack:** MERN (MongoDB, Express, React + Vite, Node.js)
**Purpose:** Resume/portfolio project — independently built, production-quality
**Status:** Planning phase

---

## 1. Problem Statement

Students in college campuses/hostels face electricity, water, food, and miscellaneous issues that currently require writing physical applications and manually submitting them to authorities. This process is slow, has no tracking, no accountability, and no urgency signal. Civic Pulse digitizes this into a "click a photo, describe, submit" flow with automatic routing, ticket tracking, and escalation.

---

## 2. Goals

- Reduce complaint filing time from a manual paper process to under a minute
- Give students visibility into complaint status and resolution time
- Auto-route complaints to the right department staff without manual triage
- Create accountability through escalation when complaints go unaddressed
- Prevent spam/fake complaints without adding friction for genuine ones
- Surface high-impact/common problems via community upvotes

---

## 3. User Roles

| Role | Description | Account Creation |
|---|---|---|
| **Student** | Files complaints, tracks own complaints, upvotes others, can escalate to admin | Open self-registration (college email domain restricted) |
| **Staff** | Department-specific (electrician, plumber, mess-in-charge, etc.), resolves assigned complaints | Created by Admin only |
| **Admin** | Full visibility, manages staff, handles escalations, can override/reassign | Seeded / created manually, not via public signup |

---

## 4. Core Features (MVP — build this fully)

1. Authentication (role-based: student / staff / admin)
2. Complaint filing with image proof
3. Auto-generated unique ticket ID
4. Category-based auto-routing to staff
5. Status tracking (pending → in-progress → resolved) + resolution time
6. Anonymous complaint option (hidden from public feed, visible to staff/admin)
7. Escalation to admin after 24 hours of no update
8. Community upvote + auto-priority flagging
9. Fake-complaint prevention (email domain check, rate limiting, invalid-mark tracking)

## 5. Future Scope (design later, do not build in this phase)

- Moderated anonymous peer-support/venting module (not a chatbot), with a persistent crisis-helpline banner and human moderation — deliberately excluded from MVP to avoid rushing a safety-sensitive feature
- Round-robin staff assignment (currently one staff per category is enough)
- Push notifications / email alerts
- Analytics dashboard for admin (avg resolution time by department, etc.)

---

## 6. Data Models

### User
| Field | Type | Notes |
|---|---|---|
| name | String | required |
| email | String | required, unique, domain-restricted for students |
| password | String | hashed (bcrypt) |
| role | Enum | `student`, `staff`, `admin` — default `student` |
| department | Enum | `electricity`, `water`, `food`, `miscellaneous` — required only if role is `staff` |
| invalidComplaintCount | Number | default 0, used for fake-complaint tracking |
| isBanned | Boolean | default false, auto/manual flag after repeated invalid complaints |
| createdAt | Date | timestamp |

### Complaint
| Field | Type | Notes |
|---|---|---|
| ticketId | String | unique, auto-generated (e.g. `CP-2026-00147`) |
| title | String | required |
| description | String | required |
| category | Enum | `electricity`, `water`, `food`, `miscellaneous` |
| imageProof | String | URL (Cloudinary/Multer storage) |
| isAnonymous | Boolean | default false — hides identity in public feed only |
| filedBy | ObjectId (ref User) | always stored, even if anonymous |
| assignedTo | ObjectId (ref User) | auto-set based on category → staff |
| status | Enum | `pending`, `in-progress`, `resolved` |
| priority | Enum | `normal`, `high` — auto-set when upvotes cross threshold |
| upvotes | [ObjectId] (ref User) | one entry per student, no duplicates |
| escalated | Boolean | default false |
| isInvalid | Boolean | default false — staff can mark fake complaints |
| filedAt | Date | timestamp |
| lastUpdatedAt | Date | updated on every status change, used for escalation check |
| resolvedAt | Date | null until resolved |

---

## 7. Authentication Flow

1. Student registers with college email (`@yourcollege.edu.in` domain check) → password hashed with bcrypt → account created with role `student`
2. Login → credentials verified → JWT issued with payload `{ _id, role }` → returned to client
3. Protected routes use two middlewares:
   - `verifyToken` — validates JWT, attaches `req.user`
   - `authorizeRoles(...roles)` — checks `req.user.role` against allowed roles for that route
4. Staff and Admin accounts are never created through public registration — only Admin can create them (`POST /api/admin/create-staff`)

---

## 8. Core Business Logic Flows

### 8.1 Filing a Complaint
1. Student submits title, description, category, image, isAnonymous flag
2. Backend generates a unique `ticketId`
3. Backend auto-assigns `assignedTo` by looking up an active staff member matching the category
4. Complaint saved with status `pending`, `lastUpdatedAt` = now
5. Ticket ID returned to student for tracking

### 8.2 Auto-Routing
- Each category maps to a staff account (one active staff per department is sufficient for MVP)
- On complaint creation, backend queries `User.findOne({ role: 'staff', department: category })` and sets `assignedTo`

### 8.3 Status Updates & Resolution Time
- Staff/admin updates status via `PATCH /api/complaints/:id/status`
- On every update, `lastUpdatedAt` is refreshed
- When status becomes `resolved`, `resolvedAt` is set; resolution time = `resolvedAt - filedAt`, shown to the student

### 8.4 Escalation
- A scheduled check (cron job or on-read comparison) flags complaints where `status !== 'resolved'` and `(now - lastUpdatedAt) > 24 hours`
- `escalated` set to true → complaint appears in Admin's escalation list
- Student's UI shows a "Contact Admin" option once escalated

### 8.5 Anonymous Complaints
- `isAnonymous: true` hides `filedBy` identity only in the **public feed** response (student name replaced with "Anonymous Student")
- Staff/Admin-facing endpoints always return real identity — anonymity is not applied internally, since accountability and resolution require knowing who filed it

### 8.6 Community Upvote & Priority
- `POST /api/complaints/:id/upvote` — adds student's ID to `upvotes` array if not already present (prevents duplicate upvotes)
- If `upvotes.length` crosses a threshold (e.g., 10), backend sets `priority: 'high'`
- Public feed can be sorted by upvote count for a "trending issues" view

### 8.7 Fake-Complaint Prevention
- Registration restricted to verified college email domain
- Rate limiting: max N complaints per category per student per 24 hours (`express-rate-limit` or custom middleware)
- Staff can mark a complaint `isInvalid: true` → increments `filedBy.invalidComplaintCount`
- If `invalidComplaintCount` crosses a threshold (e.g., 3), student account is flagged/temporarily banned (`isBanned: true`)
- Duplicate check (optional, simple version): warn if the same student has an open complaint in the same category within 24 hours

---

## 9. API Routes

### Auth
| Method | Route | Access | Description |
|---|---|---|---|
| POST | /api/auth/register | Public | Student self-registration (email domain checked) |
| POST | /api/auth/login | Public | Login, returns JWT |
| GET | /api/auth/me | Authenticated | Get current logged-in user profile |

### Admin — User Management
| Method | Route | Access | Description |
|---|---|---|---|
| POST | /api/admin/create-staff | Admin | Create a staff account for a department |
| GET | /api/admin/users | Admin | List all users |
| PATCH | /api/admin/users/:id/ban | Admin | Ban/unban a student |

### Complaints
| Method | Route | Access | Description |
|---|---|---|---|
| POST | /api/complaints | Student | File a new complaint (with image upload) |
| GET | /api/complaints/my | Student | Get own filed complaints |
| GET | /api/complaints/public | Public | Public feed (anonymous ones masked) |
| GET | /api/complaints/:ticketId | Public/Authenticated | Track a specific complaint by ticket ID |
| GET | /api/complaints/assigned | Staff | Get complaints assigned to logged-in staff |
| PATCH | /api/complaints/:id/status | Staff/Admin | Update complaint status |
| PATCH | /api/complaints/:id/mark-invalid | Staff | Mark a complaint as fake/invalid |
| POST | /api/complaints/:id/upvote | Student | Upvote a complaint |
| GET | /api/complaints/escalated | Admin | List all escalated complaints |
| GET | /api/complaints/all | Admin | List all complaints (full visibility) |

---

## 10. Non-Functional Requirements

- **Validation:** Server-side validation on all inputs (required fields, enum checks, file type/size limits on image upload)
- **Error handling:** Centralized error-handling middleware, consistent JSON error responses
- **Security:** Passwords hashed (bcrypt), JWT with reasonable expiry, role checks on every protected route, rate limiting on complaint creation and login
- **File storage:** Use Cloudinary (or similar) for image proof rather than storing files on local disk, since this needs to be deployable
- **Environment config:** All secrets (DB URI, JWT secret, Cloudinary keys) in `.env`, never hardcoded

---

## 11. Build Order (Recommended Steps)

1. Project setup — folder structure, Express app skeleton, MongoDB connection
2. User model + Auth (register, login, JWT middleware, role middleware)
3. Admin-only staff creation route
4. Complaint model + basic CRUD (create, get by ticket ID, get own complaints)
5. Ticket ID auto-generation utility
6. Image upload integration (Multer + Cloudinary)
7. Auto-routing logic (category → staff assignment)
8. Status update route + resolution time calculation
9. Anonymous complaint logic (feed-level masking)
10. Escalation logic (24hr check)
11. Upvote + priority logic
12. Fake-complaint prevention (rate limiting, invalid-mark, ban logic)
13. Testing all routes with Postman before moving to frontend
14. Frontend (React + Vite) — separate phase, separate plan

---

## 12. Out of Scope for This PRD

- Frontend UI/UX design and component structure (to be planned separately once backend is stable)
- Peer-support/mental-health module (deferred, needs its own safety-focused design pass)
- Deployment/hosting plan (to be decided closer to completion — Render/Railway are reasonable defaults for a backend like this)
