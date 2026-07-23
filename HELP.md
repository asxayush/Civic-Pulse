Setup — backend/ folder me npm init, express, mongoose, dotenv, nodemon install. .env, .gitignore, basic server.js with DB connect.
Schemas pehle, sab kuch baad me — User, Department, Complaint models likhna sabse pehla code kaam. Relations decide karke.
Auth flow — signup/login with email domain restriction, JWT, bcrypt. Middleware for protected routes.
Core Complaint CRUD — create complaint (with photo upload — multer/cloudinary), get complaints, get single complaint by ticket ID.
Business logic layer — auto-routing to department (based on category), escalation logic (cron job or check-on-read after 24hrs), anonymous flag handling, upvote endpoint, rate limiting middleware.
Testing via Postman — har route ko manually test, Postman collection bana lo documentation ke liye.
Frontend baad me shuru — React + Vite, complaint form, dashboard, status tracker.