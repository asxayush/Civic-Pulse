Setup — backend/ folder me npm init, express, mongoose, dotenv, nodemon install. .env, .gitignore, basic server.js with DB connect.

## Authentication troubleshooting

Start MongoDB/API before using the frontend:

```bash
cd backend
npm install
npm run dev
```

New student registration works with any valid email in the MVP. Without SMTP settings, the six-digit OTP is returned in the registration response and printed in the backend terminal; enter it in the verification form.

The quick demo buttons require the seeded accounts. Seed the configured database once with:

```bash
cd backend
npm run seed
npm run dev
```

`npm run seed` clears existing users and complaints before recreating the demo data. Do not run it against a database containing data you need to keep.

## Vercel deployment

Deploy `frontend/` and `backend/` as separate Vercel projects.

Frontend project:

```text
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Environment Variable: VITE_API_BASE_URL=https://<backend-project>.vercel.app/api
```

Backend project:

```text
Root Directory: backend
Environment Variable: MONGODB_URI=<production MongoDB connection string>
Environment Variable: JWT_SECRET=<long random secret>
Environment Variable: ADMIN_LOGIN_PIN=1234
Environment Variable: FRONTEND_URL=https://<frontend-project>.vercel.app
```

Add `GEMINI_API_KEY`, Cloudinary variables, and SMTP variables in Vercel when those features are enabled. The backend uses `api/index.js` as its Vercel function entrypoint; do not use the local `npm start` process as the Vercel deployment command.

Schemas pehle, sab kuch baad me — User, Department, Complaint models likhna sabse pehla code kaam. Relations decide karke.
Auth flow — signup/login with email domain restriction, JWT, bcrypt. Middleware for protected routes.
Core Complaint CRUD — create complaint (with photo upload — multer/cloudinary), get complaints, get single complaint by ticket ID.
Business logic layer — auto-routing to department (based on category), escalation logic (cron job or check-on-read after 24hrs), anonymous flag handling, upvote endpoint, rate limiting middleware.
Testing via Postman — har route ko manually test, Postman collection bana lo documentation ke liye.
Frontend baad me shuru — React + Vite, complaint form, dashboard, status tracker.