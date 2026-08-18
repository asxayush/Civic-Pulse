# Civic Pulse — Backend Product Requirements Document (PRD)

This document outlines the complete backend architecture, database schemas, step-by-step business logic, and API route specifications for the **Civic Pulse** campus complaint management system.

---

## 1. System Architecture & Tech Stack

The backend is built as a RESTful API using:
* **Runtime:** Node.js
* **Framework:** Express.js (configured with JSON parsing, urlencoded parser, CORS, and cookie-parser)
* **Database:** MongoDB (using Mongoose ODM)
* **Authentication:** JSON Web Tokens (JWT) & Bcrypt hashing
* **File Storage:** Multer (memory storage) + Cloudinary (remote media upload)
* **Email Service:** Nodemailer (SMTP configuration for sending OTPs)

---

## 2. Directory Structure

The backend source code is organized as follows:
```text
backend/
├── src/
│   ├── db/
│   │   └── schema.js            # MongoDB Connection configuration
│   ├── models/
│   │   ├── user.models.js       # User Schema
│   │   ├── complaint.models.js  # Complaint Schema
│   │   └── otp.models.js        # [NEW] OTP Verification Schema
│   ├── controllers/
│   │   ├── auth.controllers.js       # Auth, OTP, and Profile actions
│   │   ├── admin.controllers.js      # Staff management & User bans
│   │   └── complaint.controllers.js  # Complaint CRUD, upvotes, status changes
│   ├── middleware/
│   │   ├── auth.middleware.js        # verifyJWT and authorizeRoles middleware
│   │   └── error.middleware.js       # Centralized error handler
│   ├── routes/
│   │   ├── auth.routes.js            # Auth routes
│   │   ├── admin.routes.js           # Admin management routes
│   │   └── complaint.routes.js       # Complaint submission and tracking routes
│   ├── utils/
│   │   ├── api-error.js              # Standardized ApiError constructor
│   │   ├── api-response.js           # Standardized ApiResponse constructor
│   │   ├── asyncHandlers.js          # Express async wrapper
│   │   ├── mailer.js                 # [NEW] Nodemailer email helper
│   │   └── ticketGenerator.js        # Ticket ID generator utility
│   ├── validators/
│   │   ├── index.js                  # express-validator schemas
│   │   └── validator.middleware.js   # Validation runner middleware
│   ├── app.js                        # Express App config
│   └── index.js                      # Application server entry point
├── .env                              # Environment variables (git-ignored)
└── package.json                      # Project dependencies & scripts
```

---

## 3. Database Schema Models

### 3.1 User Model ([`user.models.js`](file:///c:/Users/asayu/CS%20LEARNING/WEB%20DEVELOPMENT/CIVIC-PULSE-MERN/backend/src/models/user.models.js))
Represents students, department staff, and administrators.
* `name`: String, required.
* `email`: String, required, unique, domain-restricted (`@yourcollege.edu.in`).
* `password`: String, required (stored as a bcrypt hash).
* `role`: String, enum: `["student", "staff", "admin"]`, default: `"student"`.
* `department`: String, enum: `["electricity", "water", "food", "miscellaneous"]`, required only if `role === "staff"`.
* `isVerified`: Boolean, default: `false` (set to `true` after successful OTP verification).
* `invalidComplaintCount`: Number, default: `0`.
* `isBanned`: Boolean, default: `false`.
* `timestamps`: true (creates `createdAt` and `updatedAt`).

### 3.2 OTP Model ([`otp.models.js`](file:///c:/Users/asayu/CS%20LEARNING/WEB%20DEVELOPMENT/CIVIC-PULSE-MERN/backend/src/models/otp.models.js)) **[NEW]**
Stores temporary 6-digit one-time passwords for email verification. Designed with a TTL index to delete expired OTPs automatically.
* `email`: String, required, index.
* `otp`: String, required.
* `createdAt`: Date, default: `Date.now`, expires: `300` (expires and deletes document automatically after 5 minutes / 300 seconds).

### 3.3 Complaint Model ([`complaint.models.js`](file:///c:/Users/asayu/CS%20LEARNING/WEB%20DEVELOPMENT/CIVIC-PULSE-MERN/backend/src/models/complaint.models.js))
Tracks submitted campus issues.
* `ticketId`: String, unique, auto-generated index (e.g., `CP-2026-00001`).
* `title`: String, required.
* `description`: String, required.
* `category`: String, enum: `["electricity", "water", "food", "miscellaneous"]`, required.
* `imageProof`: String (Cloudinary URL), required.
* `isAnonymous`: Boolean, default: `false` (hides submitter's name in public feeds).
* `filedBy`: ObjectId, ref: `"User"`, required (always points to the student who filed it).
* `assignedTo`: ObjectId, ref: `"User"` (points to a staff member with a matching department).
* `status`: String, enum: `["pending", "in-progress", "resolved"]`, default: `"pending"`.
* `priority`: String, enum: `["normal", "high"]`, default: `"normal"`.
* `upvotes`: Array of ObjectIds, ref: `"User"` (stores user IDs who upvoted to prevent duplicates).
* `escalated`: Boolean, default: `false` (flagged true if unresolved after 24 hours of no activity).
* `isInvalid`: Boolean, default: `false` (marked by staff/admin if found to be fake or spam).
* `resolvedAt`: Date, default: `null`.
* `timestamps`: true (creates `createdAt` and `updatedAt` / used for last update activity checks).

---

## 4. Logical Flows

### 4.1 Authentication & Email OTP Verification Flow

```
[Register POST] ──► Generate OTP & Save to DB ──► Send Email ──► Return 201 (Unverified)
                                                                       │
[Verify OTP POST] ◄────────────────────────────────────────────────────┘
       │
       ├──► Match OTP & Check Expiration
       └──► Success: Set isVerified = true ──► Return Token
```

#### Step 1: User Registration (`POST /api/auth/register`)
1. Receive `name`, `email`, and `password`.
2. Validate domain constraint (e.g., must end with `@yourcollege.edu.in`).
3. Check if user already exists:
   * If user exists and `isVerified` is `true`, reject with an error (409 Conflict).
   * If user exists but is **unverified**, proceed to overwrite/update password or simply reuse the account to regenerate the OTP.
4. Hash the password with Bcrypt (cost factor 10).
5. Save the user in the database with `isVerified: false`.
6. Generate a random 6-digit OTP string.
7. Save the OTP along with the email in the `OTP` collection.
8. Trigger an email containing the OTP via Nodemailer.
9. Return a response indicating that registration was successful, and an OTP has been sent.

#### Step 2: OTP Verification (`POST /api/auth/verify-otp`)
1. Receive `email` and `otp`.
2. Find the latest OTP document matching the email.
   * If no document is found (meaning it expired and was purged, or never existed), return an error (400 Bad Request: "Expired or invalid OTP").
3. Compare the received OTP with the stored OTP.
   * If they do not match, return an error (400 Bad Request: "Invalid OTP").
4. If they match:
   * Delete the OTP document from the database.
   * Find the user matching the email and set `isVerified: true`.
   * Issue a JWT (valid payload: `{ _id, role }`) and return it along with the user details to log them in automatically.

#### Step 3: Login (`POST /api/auth/login`)
1. Receive `email` and `password`.
2. Check if the user exists.
3. Verify password validity using `bcrypt.compare`.
4. Check if user is verified (`isVerified === true`).
   * If not verified, reject with an error (403 Forbidden: "Please verify your email before logging in") and prompt them to verify.
5. If verified, sign and return a JWT.

---

### 4.2 Role-Based Access Control (RBAC) Flow

Rather than hardcoding permissions, dynamic middleware handles role restriction.

#### Middleware Configuration (`authorizeRoles(...allowedRoles)`)
1. The middleware is set up as a curried function:
   * Outer function accepts an array of strings (e.g. `authorizeRoles("admin", "staff")`).
   * Inner function handles the standard Express signature: `async (req, res, next)`.
2. **Access Evaluation**:
   * It checks if `req.user` exists. If not, throw a **401 Unauthorized** error.
   * It compares `req.user.role` against the `allowedRoles` array.
   * If the role is found, call `next()`.
   * If the role is not found, throw a **403 Forbidden** error.

---

### 4.3 Complaint Submission & Routing Flow

1. **Submission**: Student uploads a complaint payload (`title`, `description`, `category`, `isAnonymous`) along with an image file.
2. **Media Processing**: Multer intercepts the file upload, and the controller sends it to Cloudinary, returning a secure asset URL.
3. **Ticket ID Generation**:
   * Count the existing complaints in the database.
   * Format a unique ticket string using the current year and counter: `CP-YYYY-XXXXX` (padded with zeros, e.g. `CP-2026-00042`).
4. **Auto-Routing**:
   * Find an active staff user whose `department` matches the complaint's `category`.
     `User.findOne({ role: 'staff', department: category })`
   * Assign the staff's ObjectId to `assignedTo`. If no staff is registered for that department, leave it empty (defaults to Admin triage).
5. **Database Storage**: Save the complaint. `filedBy` is mapped to the logged-in student (`req.user._id`). Return the completed complaint schema (including the generated `ticketId`).

---

### 4.4 Status Tracking & Resolution Metrics

* **In-Progress Status**: When staff accesses the complaint and changes status to `in-progress`, `lastUpdatedAt` is set to the current date.
* **Resolution**: When staff resolves the issue, set `status = "resolved"` and set `resolvedAt = Date.now()`.
* **Resolution Time**: Calculated when requested by frontend by subtracting `createdAt` (or `filedAt`) from `resolvedAt`.

---

### 4.5 Anonymous Complaint Masking

* **Data Integrity**: Store the original `filedBy` (Student ID) in the database at all times.
* **Public Feed Protection**: In the public feed controller (`GET /api/complaints/public`), fetch all complaints. Before sending the JSON response:
  * Map through the results.
  * If `isAnonymous` is `true`, replace the user details inside `filedBy` with dummy values (e.g., `{ name: "Anonymous Student", _id: null }`).
* **Privileged Feeds**: Admin and Staff feeds do not apply masking, allowing them to contact the complainant if details are needed.

---

### 4.6 Community Upvotes & Auto-Priority Escalation

* **Upvote Handler (`POST /api/complaints/:id/upvote`)**:
  * Check if the student's ID already exists in the `upvotes` array.
  * If it exists, remove it (toggles upvote off).
  * If it does not exist, push it (toggles upvote on).
* **Auto-Priority Check**:
  * If the length of the `upvotes` array crosses a predefined threshold (default: `10`), automatically set `priority = "high"`.

---

### 4.7 Escalation Rules

* **Idle Check**: A complaint is eligible for escalation if it is not resolved (`status !== "resolved"`) and the time elapsed since `lastUpdatedAt` is greater than 24 hours.
* **Implementation Options**:
  * **On-Read Triage (Active)**: Whenever an admin queries the escalated complaints endpoint, run a bulk update query to mark all idle complaints as `escalated = true` before serving the results.
  * **Cron Job (Scheduled)**: Execute a lightweight cron service (e.g., `node-cron`) every hour to scan the collection and flip the `escalated` flag to true.

---

### 4.8 Abuse and Fraud Prevention

* **Strict Domain Constraint**: Check the domain during the registration step.
* **Submission Rate Limiting**: Limit complaint submissions to a maximum of 3 complaints per user per hour.
* **Staff Invalid Flagging**:
  * If staff marks a complaint as spam (`isInvalid: true`):
    * Find the complainant's User profile and increment `invalidComplaintCount` by 1.
    * If `invalidComplaintCount >= 3`, automatically change the user status to `isBanned = true` and restrict their access.

---

## 5. API Routes Reference

### 5.1 Auth Routes (`/api/auth`)
* `POST /register`: Registers a student (unverified status). Sends an email OTP.
* `POST /verify-otp`: Confirms the OTP and returns a JWT on success.
* `POST /login`: Log in registered and verified users.
* `GET /me`: Returns the authenticated user's profile (requires `verifyJWT`).

### 5.2 Admin Routes (`/api/admin`) — (Requires `verifyJWT`, `authorizeRoles("admin")`)
* `POST /create-staff`: Admin creates a staff member with a specific department.
* `GET /users`: List all users.
* `PATCH /users/:id/ban`: Toggle a student's `isBanned` property.
* `GET /complaints/escalated`: Fetch all escalated complaints.
* `GET /complaints/all`: Full visibility complaint view.

### 5.3 Complaint Routes (`/api/complaints`)
* `POST /`: Submit a complaint with image proof. (Requires `verifyJWT`, `authorizeRoles("student")`, rate-limited).
* `GET /my`: Get complaints filed by the logged-in student. (Requires `verifyJWT`, `authorizeRoles("student")`).
* `GET /public`: Fetch public feed (masks anonymous users' profiles). (Public access).
* `GET /track/:ticketId`: Find a complaint details by its ticket ID. (Public access).
* `GET /assigned`: Fetch complaints assigned to the logged-in staff member. (Requires `verifyJWT`, `authorizeRoles("staff")`).
* `PATCH /:id/status`: Update complaint status. (Requires `verifyJWT`, `authorizeRoles("staff", "admin")`).
* `PATCH /:id/mark-invalid`: Flag complaint as fake/spam. (Requires `verifyJWT`, `authorizeRoles("staff")`).
* `POST /:id/upvote`: Upvote/remove upvote for a complaint. (Requires `verifyJWT`, `authorizeRoles("student")`).
