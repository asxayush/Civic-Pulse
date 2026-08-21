# Civic Pulse — Frontend Product Requirements Document (PRD)

This document outlines the frontend architecture, design system, component hierarchy, state management, API integration layer, user flows, and deployment guidelines for the **Civic Pulse** campus complaint management web application.

---

## 1. Tech Stack & Architecture

- **Framework**: React 18+ (bootstrapped with Vite for fast HMR and bundle optimization)
- **Styling**: Modern CSS / Tailwind CSS with custom variables for dark/light themes, smooth glassmorphism, and responsive layouts
- **Routing**: React Router DOM (v6+) with Role-Based Guarded Routes (`ProtectedLayout`, `RequireRole`)
- **State Management**: React Context API + Custom Hooks (for Authentication & Global Notifications)
- **HTTP Client**: Axios (configured with base URL, credentials, and request/response interceptors)
- **Icons & UI Enhancements**: Lucide React icons, Toast notification library (e.g. `react-hot-toast` or custom floating toasts)

---

## 2. Directory Structure

```text
frontend/
├── src/
│   ├── assets/              # Logos, default avatars, background illustrations
│   ├── components/          # Reusable UI components
│   │   ├── common/          # Navbar, Footer, Modal, Loader, Toast, Badge
│   │   ├── complaints/      # ComplaintCard, UpvoteButton, StatusBadge, ImageModal
│   │   └── routing/         # ProtectedRoute, PublicRoute, RoleGuard
│   ├── context/
│   │   └── AuthContext.jsx  # User state, login, register, verifyOTP, logout
│   ├── hooks/
│   │   ├── useAuth.js       # Custom auth hook
│   │   └── useComplaints.js # Custom hook for complaint fetching & mutations
│   ├── pages/
│   │   ├── auth/            # Login, Register, VerifyOTP
│   │   ├── student/         # StudentDashboard, FileComplaint, MyComplaints, PublicFeed, TrackTicket
│   │   ├── staff/           # StaffDashboard, AssignedComplaints
│   │   └── admin/           # AdminDashboard, ManageUsers, CreateStaff, Escalations
│   ├── services/
│   │   ├── api.js           # Axios instance with interceptors
│   │   ├── auth.service.js   # Auth API calls
│   │   ├── complaint.service.js # Complaint API calls
│   │   └── admin.service.js  # Admin API calls
│   ├── styles/
│   │   └── index.css        # Global CSS variables, utility classes & animations
│   ├── App.jsx              # Main router configuration
│   └── main.jsx             # Entry point
├── index.html
├── package.json
└── vite.config.js
```

---

## 3. UI/UX Design System & Aesthetics

- **Palette**:
  - Primary: Deep Indigo / Electric Blue (`#2563eb`)
  - Accent: Emerald Green (`#10b981`) for Resolved, Amber (`#f59e0b`) for In-Progress, Crimson (`#ef4444`) for Escalated/Invalid
  - Background: Sleek Dark (`#0f172a` / `#1e293b`) or Clean Light (`#f8fafc`)
- **Typography**: Inter / Outfit (Google Fonts) with clear visual hierarchy
- **Components**:
  - Glassmorphic card surfaces with subtle hover scale effects (`transform transition-all`)
  - Status badges with vibrant color coding (`Pending` = Gray/Yellow, `In-Progress` = Blue/Amber, `Resolved` = Green, `Escalated` = Red Pulse)
  - Ticket ID copy button with toast feedback
  - Image preview modal with zoom/lightbox capability

---

## 4. Navigation & Route Hierarchy

| Path | Component | Access Control | Description |
|---|---|---|---|
| `/` | `LandingPage` / `PublicFeed` | Public | View public feed, search ticket ID |
| `/login` | `LoginPage` | Public (Unauthenticated) | Login form with role redirection |
| `/register` | `RegisterPage` | Public (Unauthenticated) | Domain-restricted registration form |
| `/verify-otp` | `VerifyOTPPage` | Public (Unauthenticated) | 6-digit OTP verification screen |
| `/track/:ticketId` | `TrackTicketPage` | Public | Live status timeline by Ticket ID |
| `/student/dashboard` | `StudentDashboard` | `student` | Overview of filed complaints & quick stats |
| `/student/file` | `FileComplaintPage` | `student` | Complaint filing form with image uploader |
| `/student/my-complaints`| `MyComplaintsPage` | `student` | Filterable list of student's own complaints |
| `/staff/dashboard` | `StaffDashboard` | `staff` | Staff portal showing assigned category complaints |
| `/admin/dashboard` | `AdminDashboard` | `admin` | Admin overview, metrics & escalation alerts |
| `/admin/create-staff` | `CreateStaffPage` | `admin` | Form to provision new department staff |
| `/admin/users` | `ManageUsersPage` | `admin` | User directory with ban/unban controls |
| `/admin/escalations` | `EscalationsPage` | `admin` | Priority list of 24h idle complaints |

---

## 5. Detailed Component Specifications

### 5.1 Auth Flow Components
- **`RegisterForm`**:
  - Fields: `Name`, `Email` (validates `@yourcollege.edu.in`), `Password`.
  - On submit: calls `POST /api/auth/register`. On success, redirects to `/verify-otp?email=...` with auto-filled email state.
- **`VerifyOTPForm`**:
  - 6-digit split input boxes with auto-focus movement.
  - Timer countdown (5 minutes) for OTP expiration.
  - On submit: calls `POST /api/auth/verify-otp`. On success, stores JWT token in `localStorage`, sets `AuthContext`, and redirects based on role.

### 5.2 Student Portal Components
- **`ComplaintForm`**:
  - Drag-and-drop or click file uploader for image proof (max 5MB image preview).
  - Category dropdown (`electricity`, `water`, `food`, `miscellaneous`).
  - `isAnonymous` toggle switch.
  - Submit button with spinner loading state.
- **`PublicFeed`**:
  - Upvote button with real-time count increment and high-priority badge trigger.
  - Search input box to filter by Ticket ID or title.
  - Shows "Anonymous Student" for masked submitters.

### 5.3 Staff & Admin Portal Components
- **`StaffComplaintCard`**:
  - Status toggle buttons: `In-Progress`, `Resolved`.
  - "Mark Invalid / Spam" button with confirmation alert modal.
  - Direct student contact info (non-masked) for follow-up.
- **`AdminUserRow`**:
  - User profile details, role badge, invalid complaint count badge.
  - Toggle switch for `isBanned` state with immediate UI feedback.

---

## 6. Frontend API Integration Layer (`services/api.js`)

```javascript
import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  withCredentials: true
});

// Request Interceptor: Attach JWT Token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Handle 401 & Banned status globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;
```

---

## 7. Recommended Frontend Build Order

1. **Vite Setup & CSS Theme**: Initialize Vite React app, setup Axios instance, configure global CSS variables and toast notifications.
2. **Auth Context & Route Protection**: Create `AuthContext.jsx`, `ProtectedRoute`, and `RoleGuard` components.
3. **Auth Views**: Build `LoginPage`, `RegisterPage`, and `VerifyOTPPage`.
4. **Student Complaint Filing**: Build `FileComplaintPage` with Multer/Cloudinary image preview support.
5. **Feeds & Upvoting**: Implement `PublicFeed`, `MyComplaintsPage`, `UpvoteButton`, and `TrackTicketPage`.
6. **Staff Portal**: Build `StaffDashboard` with status updates (`pending` -> `in-progress` -> `resolved`) and mark-invalid button.
7. **Admin Portal**: Build `AdminDashboard`, `CreateStaffPage`, `ManageUsersPage` (ban controls), and `EscalationsPage`.
