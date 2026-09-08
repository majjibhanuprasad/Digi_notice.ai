<div align="center">

<img src="https://img.shields.io/badge/DigiNotice-AI-6366f1?style=for-the-badge&logo=react&logoColor=white" alt="DigiNotice AI" height="40"/>

# DigiNotice AI — Smart Digital College Notice Board

### *Replacing physical cork boards with an AI-powered, real-time, multilingual notice ecosystem*

[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06b6d4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6-646cff?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8-47a248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](./LICENSE)

<br/>

**[🚀 Live Demo](#-demo-accounts) · [📖 Documentation](#-setup--execution) · [🏗️ Architecture](#-architecture) · [✨ Features](#-features)**

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Database Schema](#-database-schema)
- [API Reference](#-api-reference)
- [Setup & Execution](#-setup--execution)
- [Demo Accounts](#-demo-accounts)
- [Demo Flow](#-recommended-evaluation-demo-flow)
- [Department Directory](#-department-directory)
- [Folder Structure](#-folder-structure)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌐 Overview

**DigiNotice AI** is a full-stack, AI-powered web application built to modernize campus communication. It replaces traditional physical notice boards with a smart, digital platform that supports role-based access control, real-time notice broadcasting, AI-assisted content generation, and multilingual support.

> Designed for college environments — from HODs drafting placement drives to students receiving personalized, department-specific announcements with built-in translation and an AI Q&A assistant.

### Why DigiNotice AI?

| Pain Point (Traditional) | Solution (DigiNotice AI) |
|---|---|
| Notices missed or torn down | Digital, always-accessible feed |
| No personalization | Targeted by dept, year & clubs |
| Language barrier | AI translation in 4 Indian languages |
| Manual drafting errors | AI Copilot generates & validates notices |
| No urgency system | Emergency broadcast with forced acknowledgment |
| No analytics | Real-time view counts & engagement charts |
| Paper clutter | Paperless, searchable archive |

---

## ✨ Features

### 🤖 AI Capabilities

| Feature | Description |
|---|---|
| **AI Notice Generator** | Type a topic prompt → receive a professionally formatted notice title & body instantly |
| **Smart Target Recommender** | AI reads the notice and auto-suggests the relevant department, category & target year |
| **Content Safety Checker** | Scores notices 0–100% and flags issues like missing deadlines, unprofessional tone, or incomplete information |
| **AI Summaries** | One-sentence digest auto-generated for every notice for quick scanning |
| **Multilingual Translation** | Instant translation into **Telugu, Hindi, Tamil & Kannada** via AI |
| **Notice Q&A Chatbot** | Per-notice AI assistant — students ask questions, answers are grounded strictly in that notice's content |

### 📢 Notice Management

- **9-Stage Workflow**: `Draft → Submitted → Under Review → Approved → Scheduled → Published → Expired → Archived`
- **Emergency Broadcast**: CRITICAL priority notices pin to the top of every student dashboard with mandatory one-click acknowledgment
- **Rich Targeting**: Filter by department, academic year (1st–4th), target audience, and student clubs
- **Scheduling**: Set publish date/time and auto-expiry date on any notice
- **Attachments**: Attach PDFs and images to notices
- **Rejection Feedback**: Admins can reject with a detailed reason, which is surfaced to the submitter

### 🎓 Student Portal

- **Personalized Feed**: Notices filtered by the student's own department and academic year
- **Bookmarks**: Save important notices for later
- **Search & Filter**: Full-text search with category/date/priority filters
- **Calendar Integration**: Download `.ics` calendar event files directly from notice cards
- **Notifications Inbox**: Priority-sorted notification centre with read/unread state

### 🛡️ Admin Portal

- **Super Admin (Principal)**: Full system control — approve/reject/publish all notices, view audit logs, manage all departments
- **Department Admin (HOD)**: Create, draft, and submit notices for their department; answer student queries
- **Notice Approvals Queue**: Dedicated review panel for pending notices
- **Query Manager**: View and answer student questions submitted via the notice chatbot
- **Real-time Analytics**: SVG charts for total views, category distribution, and emergency acknowledgment rates
- **Audit Log**: Immutable log of every admin action with timestamps and actor details

### 📺 Kiosk / Display Mode

- **Full-screen Signage**: Designed for hallway monitors and smart TVs
- **Auto-playing Carousel**: Cycles through published notices automatically
- **QR Code Integration**: Scannable QR on each slide loads the notice detail on student smartphones
- **Public Access**: No login required — accessible at `/display-mode`

### 🔐 Security & Auth

- **JWT Authentication**: Stateless, token-based auth for all protected routes
- **Role-based Access Control (RBAC)**: Three roles with granular middleware enforcement
- **Password Hashing**: BCryptJS with salted hashes — no plain-text passwords stored
- **Auth Guard Routes**: Frontend route guards for protected and admin-only pages

### 🗄️ Hybrid Database (Zero-Config Fallback)

- Connects to **MongoDB** if available
- **Automatically falls back** to a local JSON file database (`backend/data/`) if MongoDB is not running
- **Works out-of-the-box** on any evaluation machine — no database setup required

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI Component Framework |
| TypeScript | 6.0 | Type Safety |
| Vite | 6 | Build Tool & Dev Server |
| Tailwind CSS | v4 | Utility-First Styling |
| React Router | v7 | Client-Side Routing |
| Lucide React | 1.31 | Icon Library |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Node.js | 22 | Runtime |
| Express.js | 4 | HTTP Server & REST API |
| TypeScript | 5.3 | Type Safety |
| Mongoose | 8 | MongoDB ODM |
| JSON Web Token | 9 | Authentication |
| BCryptJS | 2.4 | Password Hashing |
| dotenv | 16 | Environment Configuration |
| ts-node-dev | 2 | Dev hot-reloading |

### Infrastructure

| Service | Role |
|---|---|
| MongoDB | Primary Database |
| JSON File DB | Fallback / Offline Database |
| Portable Node.js v22 | Bundled runtime — no install needed |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      CLIENT BROWSER                          │
│                                                              │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │ LandingPage│  │  LoginPage   │  │    DisplayMode       │ │
│  │  (Public)  │  │  (Public)    │  │   (Kiosk/Public)     │ │
│  └────────────┘  └──────────────┘  └──────────────────────┘ │
│                                                              │
│  ┌──────────────────────┐  ┌───────────────────────────────┐ │
│  │   StudentDashboard   │  │      AdminDashboard           │ │
│  │  (ProtectedRoute)    │  │  (AdminRoute: SA + DA only)   │ │
│  │  • Notice Feed       │  │  • Notice Creator + AI Panel  │ │
│  │  • Bookmarks         │  │  • Approval Queue             │ │
│  │  • Notifications     │  │  • Analytics & Audit Logs     │ │
│  │  • AI Chatbot        │  │  • Query Management           │ │
│  │  • Calendar Export   │  │  • Emergency Broadcast        │ │
│  └──────────────────────┘  └───────────────────────────────┘ │
│         AuthContext (React Context — JWT Token Management)    │
└──────────────────────────────────────────────────────────────┘
                        │  REST API (HTTP/JSON)
                        ▼
┌──────────────────────────────────────────────────────────────┐
│                  EXPRESS.JS BACKEND (:5000)                   │
│                                                              │
│  authMiddleware  •  requireRoles  •  JWT Verification        │
│                                                              │
│  ┌─────────────┐ ┌──────────────┐ ┌────────────────────────┐ │
│  │authController│ │noticeCtrl   │ │    aiController        │ │
│  │  • login    │ │  • CRUD      │ │  • generateNotice      │ │
│  │  • profile  │ │  • workflow  │ │  • recommendTarget     │ │
│  │             │ │  • bookmark  │ │  • contentCheck        │ │
│  │             │ │  • queries   │ │  • summarize           │ │
│  │             │ │  • acknowledge│ │  • translate / ask    │ │
│  └─────────────┘ └──────────────┘ └────────────────────────┘ │
│         analyticsController:  getAnalytics • getAuditLogs    │
│                                                              │
│              DatabaseModel<T> — Unified Wrapper              │
│                    ┌──────┴──────┐                           │
│              MongoDB           JSON File DB                  │
│           (Mongoose ODM)      (Auto-fallback)                │
└──────────────────────────────────────────────────────────────┘
```

---

## 🗃️ Database Schema

The application uses **10 collections/models**:

| Model | Key Fields |
|---|---|
| `User` | name, email, role (SA/DA/STUDENT), department, academicYear, clubs |
| `Notice` | title, content, summary, category, priority, status (9 states), targeting |
| `Bookmark` | userId, noticeId |
| `Notification` | userId, noticeId, type, isRead |
| `Acknowledgement` | userId, noticeId, timestamp |
| `Query` | noticeId, studentId, question, answer, status (Open/Answered/Closed) |
| `AuditLog` | userId, userName, action, noticeId, timestamp |
| `Department` | code, name |
| `Category` | name |
| `CalendarEvent` | noticeId, title, date, startTime, endTime, location |

---

## 🔌 API Reference

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `POST` | `/api/auth/login` | ❌ | — | Login, returns JWT |
| `GET` | `/api/auth/profile` | ✅ | Any | Get current user profile |
| `GET` | `/api/notices` | ✅ | STUDENT | Get personalized notice feed |
| `GET` | `/api/notices/admin` | ✅ | SA/DA | Get all notices for admin view |
| `GET` | `/api/notices/kiosk` | ❌ | — | Public kiosk feed |
| `GET` | `/api/notices/search` | ✅ | Any | Full-text search notices |
| `GET` | `/api/notices/:id` | ✅ | Any | Get notice by ID |
| `POST` | `/api/notices` | ✅ | SA/DA | Create new notice |
| `PUT` | `/api/notices/:id` | ✅ | SA/DA | Update notice |
| `DELETE` | `/api/notices/:id` | ✅ | SA/DA | Delete notice |
| `POST` | `/api/notices/:id/submit` | ✅ | DA | Submit for approval |
| `POST` | `/api/notices/:id/approve` | ✅ | SA | Approve notice |
| `POST` | `/api/notices/:id/reject` | ✅ | SA | Reject with reason |
| `POST` | `/api/notices/:id/publish` | ✅ | SA | Publish immediately |
| `POST` | `/api/notices/:id/acknowledge` | ✅ | STUDENT | Acknowledge CRITICAL notice |
| `POST` | `/api/notices/:id/bookmark` | ✅ | STUDENT | Toggle bookmark |
| `POST` | `/api/notices/:noticeId/query` | ✅ | STUDENT | Post a question |
| `GET` | `/api/queries` | ✅ | SA/DA | View all student queries |
| `POST` | `/api/queries/:id/answer` | ✅ | SA/DA | Answer a query |
| `POST` | `/api/ai/generate-notice` | ❌ | — | Generate notice from prompt |
| `POST` | `/api/ai/target` | ❌ | — | Recommend targeting |
| `POST` | `/api/ai/content-check` | ❌ | — | Safety & quality score |
| `POST` | `/api/ai/summarize` | ❌ | — | Generate AI summary |
| `POST` | `/api/ai/translate` | ❌ | — | Translate to language |
| `POST` | `/api/ai/ask` | ❌ | — | Notice-specific Q&A |
| `GET` | `/api/analytics` | ✅ | SA/DA | Analytics data |
| `GET` | `/api/audit-logs` | ✅ | SA | Immutable audit trail |
| `GET` | `/health` | ❌ | — | Backend health check |

> **SA** = Super Admin &nbsp;|&nbsp; **DA** = Department Admin

---

## 🏃 Setup & Execution

> **A portable Node.js v22 runtime is bundled inside `node-portable/`** — no system-level Node.js installation is required on Windows.

### Prerequisites

- Windows OS (portable Node included) — or Node.js v18+ on macOS/Linux
- MongoDB *(optional — the app auto-falls back to local JSON DB if not running)*

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/your-username/digital-notice-board.git
cd "digital-notice-board"
```

---

### Step 2 — Start the Backend Server

Open a **PowerShell terminal** at the project root and run:

```powershell
# Add portable Node to PATH and bypass execution policy
$env:PATH = "$PWD\node-portable\node-v22.11.0-win-x64;" + $env:PATH
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process

# Install dependencies and start backend
cd backend
npm install
npm run dev
```

✅ Backend starts at **http://localhost:5000** and auto-seeds all demo users & notices.

---

### Step 3 — Start the Frontend Client

Open a **second PowerShell terminal** at the project root and run:

```powershell
# Add portable Node to PATH and bypass execution policy
$env:PATH = "$PWD\node-portable\node-v22.11.0-win-x64;" + $env:PATH
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process

# Install dependencies and launch dev server
cd frontend
npm run dev
```

✅ Frontend starts at **http://localhost:5173**

---

### Application URLs

| URL | Purpose |
|-----|---------|
| `http://localhost:5173` | Main Application (Landing Page) |
| `http://localhost:5173/login` | Login Page |
| `http://localhost:5173/display-mode` | Kiosk / Signage Mode |
| `http://localhost:5000/health` | Backend Health Check |

---

### Environment Variables

**Backend** — `backend/.env`:
```env
PORT=5000
JWT_SECRET=your_secret_key_here
MONGO_URI=mongodb://localhost:27017/diginotice
```

**Frontend** — `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🔐 Demo Accounts

> Quick-fill buttons for all accounts are available directly on the Login page.

### Administrative Accounts

| Role | Email | Password | Name |
|------|-------|----------|------|
| 🔴 Super Admin (Principal) | `superadmin@college.edu` | `admin123` | Dr. Alok Verma |
| 🟠 Dept Admin — CSE | `cseadmin@college.edu` | `admin123` | Prof. Ramesh K. |
| 🟠 Dept Admin — ECE | `eceadmin@college.edu` | `admin123` | Prof. Sunita Rao |

> All HOD logins follow the pattern `{dept}.faculty@college.edu` / `admin123`

---

### Student Accounts

> All student accounts share the password: **`password123`**

| Email | Name | Department | Year |
|-------|------|------------|------|
| `student1@college.edu` | Abhinav Sharma | CSE | 4th Year |
| `student2@college.edu` | Bhavana Reddy | CSE | 3rd Year |
| `student3@college.edu` | Chaitanya Kumar | ECE | 4th Year |
| `student4@college.edu` | Divya Patel | EEE | 2nd Year |
| `student5@college.edu` | Eshwar Prasad | Civil | 1st Year |
| `student.csm@college.edu` | Aditya Sen | CSM (AI & ML) | 3rd Year |
| `student.csd@college.edu` | Kavya Nair | CSD (Data Science) | 4th Year |
| `student.it@college.edu` | Rahul Varma | IT | 3rd Year |
| `student.mech@college.edu` | Varun Dhawan | Mech | 3rd Year |
| `student.robotics@college.edu` | Siddharth Roy | Robotics | 2nd Year |
| `student.chemical@college.edu` | Ananya Goel | Chemical Engineering | 3rd Year |
| `student.biotech@college.edu` | Priyanka Das | Bio Technology | 2nd Year |
| `student.aerospace@college.edu` | Rohan Mehra | Aero Space | 3rd Year |
| `student.agri@college.edu` | Harish Rao | Agricultural Engineering | 1st Year |
| `student.mining@college.edu` | Pranav Joshi | Mining Engineering | 4th Year |

---

## 🎬 Recommended Evaluation Demo Flow

Follow this sequence to explore all major features in under **10 minutes**:

**1. 🏠 Landing Page** — Visit `http://localhost:5173`, explore the platform overview.

**2. 🤖 Draft a Notice with AI Copilot**
   - Login as **Dept Admin (CSE HOD)**
   - Click **"Create Notice"** in the sidebar
   - In the **AI Copilot** panel, type:  
     *"Placement drive for CSE 4th-year students by Google on September 12 at Seminar Hall 2. Apply by September 5."*
   - Click **"Generate Notice with AI"** — title and body auto-populate
   - Observe the **Target Recommendations** and **Safety Score**
   - Click **"Submit for Approval"**

**3. ✅ Approve as Super Admin**
   - Log out → Login as **Super Admin (Principal)**
   - Navigate to **"Notice Approvals"** → Click **"Approve"**

**4. 🎓 Student View with AI Features**
   - Log out → Login as **Student (CSE 4th Year)** — `student1@college.edu`
   - The approved notice appears in the personalized feed
   - Open the notice detail view:
     - Read the **AI Summary**
     - Switch translation to **Telugu** or **Hindi**
     - Ask the **AI Notice Assistant**: *"Where is the placement held?"*
     - Click **"Add to Calendar"** to download an `.ics` event file

**5. 📺 Kiosk Mode** — Open `http://localhost:5173/display-mode` — full-screen TV signage with QR codes

**6. 🚨 Emergency Broadcast**
   - Login as **Super Admin** → Create a notice → Set priority to **CRITICAL**
   - Accept the emergency confirmation modal
   - Login as any student → Observe the red alert banner requiring mandatory acknowledgment

---

## 🏫 Department Directory

The platform includes **15 engineering departments**:

| Code | Department |
|------|-----------|
| `CSE` | Computer Science & Engineering |
| `CSM` | CSE (AI & Machine Learning) |
| `CSD` | CSE (Data Science) |
| `ECE` | Electronics & Communication Engineering |
| `EEE` | Electrical & Electronics Engineering |
| `Mech` | Mechanical Engineering |
| `Civil` | Civil Engineering |
| `IT` | Information Technology |
| `Robotics` | Robotics Engineering |
| `Chemical Engineering` | Chemical Engineering |
| `Cyber Security` | Cyber Security |
| `Bio Technology` | Bio Technology |
| `Aero Space` | Aerospace Engineering |
| `Agricultural Engineering` | Agricultural Engineering |
| `Mining Engineering` | Mining Engineering |

---

## 📁 Folder Structure

```
digital-notice-board/
│
├── 📄 README.md
├── 📄 .gitignore
├── 📄 init_git.ps1
│
├── 📦 node-portable/                    # Portable Node.js v22 (Windows)
│   └── node-v22.11.0-win-x64/
│
├── 🖥️  frontend/                        # React + Vite SPA
│   ├── index.html
│   ├── vite.config.ts
│   ├── package.json
│   └── src/
│       ├── main.tsx                     # App entry point
│       ├── App.tsx                      # Router + Auth guards
│       ├── context/
│       │   └── AuthContext.tsx          # JWT auth context provider
│       └── pages/
│           ├── LandingPage.tsx          # Public marketing page
│           ├── LoginPage.tsx            # Login + demo quick-fill
│           ├── StudentDashboard.tsx     # Full student portal
│           ├── AdminDashboard.tsx       # Full admin / HOD portal
│           └── DisplayMode.tsx          # Kiosk TV signage
│
└── ⚙️  backend/                         # Express REST API
    ├── package.json
    ├── tsconfig.json
    ├── data/                            # JSON fallback DB files (auto-created)
    └── src/
        ├── server.ts                    # App entry point + seeding logic
        ├── config/
        │   └── db.ts                    # MongoDB + JSON fallback connection
        ├── models/
        │   └── Schemas.ts              # All Mongoose schemas + unified wrapper
        ├── routes/
        │   └── api.ts                   # All REST routes + auth middleware
        ├── controllers/
        │   ├── authController.ts        # Login, profile
        │   ├── noticeController.ts      # CRUD, workflow, Q&A, bookmarks
        │   ├── aiController.ts          # All 6 AI endpoints
        │   └── analyticsController.ts   # Analytics + audit logs
        └── services/                    # Shared business logic
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'feat: add amazing feature'`
4. **Push** to your branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

Please ensure your code follows the existing TypeScript conventions and includes proper type annotations.

---

## 📄 License

This project is licensed under the **MIT License**.

---

<div align="center">

Made with ❤️ for smarter campus communication

**DigiNotice AI** — *From cork boards to AI-powered digital ecosystems*

</div>
