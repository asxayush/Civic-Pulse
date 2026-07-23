Phase 1: Setup (Day 1, ~1hr)
backend/
  ├── config/db.js
  ├── models/
  ├── controllers/
  ├── routes/
  ├── middlewares/
  ├── utils/
  ├── .env
  └── server.js
npm init -y
npm i express mongoose dotenv bcrypt jsonwebtoken cors express-rate-limit multer
npm i -D nodemon
.env → PORT, MONGO_URI, JWT_SECRET
config/db.js → mongoose connect function (tu ProjManagment mein already kar chuka hai, wahi pattern)
server.js → express app, app.use(express.json()), DB connect call, listen

Checkpoint: server chal raha ho, MongoDB connected log dikhe. Isse aage mat badho jab tak ye stable na ho.

Phase 2: User Model + Auth (Day 1-2)

models/User.js — PRD ka table jaisa hai schema banao, seedha:

js
role: { type: String, enum: ['student','staff','admin'], default: 'student' }
department: { type: String, enum: ['electricity','water','food','miscellaneous'], required: function() { return this.role === 'staff' } }

department ka conditional required — ye naya concept hai tere liye, note kar lena.

controllers/authController.js:

register — email domain check (email.endsWith('@yourcollege.edu.in')), bcrypt hash, save
login — compare password, sign JWT with { _id, role }
getMe — req.user se profile return

middlewares/verifyToken.js aur authorizeRoles.js — ye tu ProjManagment mein bana chuka hai, same pattern copy-adapt kar (khud likh, bas structure yaad kar).

Checkpoint: Postman se register + login + JWT decode test karo.

Phase 3: Admin creates Staff (Day 2)

POST /api/admin/create-staff — sirf admin route, body mein department bhejna required hoga. Isko authorizeRoles('admin') middleware se protect karo.

Admin ka pehla account manually seed karo (ek chhota seed.js script ya directly MongoDB Compass se ek document daal do role: admin).

Phase 4: Complaint Model + Ticket ID (Day 3)

models/Complaint.js — PRD ka table hubahu schema.

utils/generateTicketId.js — ye naya utility hai, khud likhne ki koshish karo pehle, agar stuck ho to logic ye hai:

js
// CP-2026-00147 format
// year + count of complaints so far (or random 5-digit)
const count = await Complaint.countDocuments();
const ticketId = `CP-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;

controllers/complaintController.js:

createComplaint — ticketId generate, filedBy = req.user._id
getMyComplaints — Complaint.find({ filedBy: req.user._id })
getByTicketId — Complaint.findOne({ ticketId })

Checkpoint: Complaint create + fetch by ticket ID working, bina image ke abhi.

Phase 5: Image Upload (Day 4)

Multer memory storage → Cloudinary upload. Ye tera pehla baar hoga, isliye Hitesh ke course mein agar Cloudinary section hai wahi refer karo, warna Cloudinary docs quick padh lo (15 min). Middleware chain: verifyToken → multer.single('image') → controller.

Phase 6: Auto-Routing (Day 4-5)

createComplaint ke andar hi:

js
const staff = await User.findOne({ role: 'staff', department: category });
assignedTo: staff?._id

Simple hai — ek query add karna hai. Yahi tera "auto-routing" hai, over-think mat karo.

Phase 7: Status Update + Resolution Time (Day 5)

PATCH /api/complaints/:id/status — status change karte waqt:

js
lastUpdatedAt = Date.now()
if (status === 'resolved') resolvedAt = Date.now()

Resolution time frontend mein calculate hoga (resolvedAt - filedAt), backend bas dono fields bhejta rahe.

Phase 8: Anonymous Masking (Day 6)

Sirf getPublicFeed controller mein — data DB se normal nikaalo, response bhejne se pehle map karo:

js
complaints.map(c => c.isAnonymous ? {...c._doc, filedBy: 'Anonymous Student'} : c)

DB mein kabhi mat chhupao identity — sirf response transform karo. Staff/admin routes untouched.

Phase 9: Escalation (Day 6-7)

Simplest version (cron ki jagah): jab bhi koi GET request aaye complaints ke liye, ek check chala do:

js
if (status !== 'resolved' && (Date.now() - lastUpdatedAt) > 24*60*60*1000) {
  complaint.escalated = true; await complaint.save();
}

Baad mein node-cron se upgrade kar sakta hai, MVP ke liye on-read check kaafi hai — PRD khud yehi option deta hai.

Phase 10: Upvote + Priority (Day 7)
js
if (!complaint.upvotes.includes(userId)) {
  complaint.upvotes.push(userId);
  if (complaint.upvotes.length >= 10) complaint.priority = 'high';
}
Phase 11: Fake-Complaint Prevention (Day 8)
express-rate-limit middleware sirf POST /api/complaints route pe lagao
mark-invalid route → invalidComplaintCount++ on the User, threshold cross → isBanned = true
Phase 12: Postman Testing (Day 8-9)

Har route ek collection mein test karo — student, staff, admin teeno role ke tokens alag rakh ke.