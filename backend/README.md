# DigiNotice AI - Backend API Service

A robust, enterprise-grade REST API backend built with **Node.js**, **Express**, and **TypeScript**. Supports MySQL, MongoDB, and local JSON mock persistence with automated table migrations, security firewalls, and live SMTP notifications.

---

## 🚀 Key Features
- **Flexible Database Architecture**: Auto-connects to MySQL, MongoDB, or falls back to high-performance local JSON storage.
- **Security Firewall**: Helmet headers, dynamic CORS validation with `*.vercel.app` auto-whitelist, rate limiting, and prototype pollution protection.
- **Authentication**: JWT authentication with bcrypt password hashing, email verification tokens, and OTP recovery.
- **Auditing & Logging**: Complete audit trails for campus notice lifecycles and administrative actions.

---

## 🛠️ Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

4. **Build & Test Production Output**:
   ```bash
   npm run build
   npm start
   ```

---

## 🚂 Deploy to Railway (Step-by-Step)

### Step 1: Create a New Project on Railway
1. Push this repository to GitHub.
2. Go to [railway.com](https://railway.com/) and click **"New Project"**.
3. Select **"Deploy from GitHub repo"** and choose your backend repository (`diginotice-backend`).

### Step 2: (Optional but Recommended) Add a MySQL Database
1. In your Railway project canvas, click **"+ New"** -> **"Database"** -> **"Add MySQL"**.
2. Railway will automatically create the MySQL service and provide `MYSQLHOST`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLPORT`, `MYSQLDATABASE`, and `MYSQL_URL`.
3. In your Backend service settings -> **Variables**, add a reference:
   - `MYSQL_URL` = `${{MySQL.MYSQL_URL}}` (or Railway links it automatically).
   *(Note: If no database is attached, the backend automatically uses its built-in fallback engine).*

### Step 3: Configure Environment Variables
In your Backend service -> **Variables** tab, set the following:
- `JWT_SECRET`: Any random 32+ character string (e.g. `d7f8a9e2c1b4a6d8e0...`)
- `FRONTEND_URL`: Your Vercel frontend URL (e.g. `https://your-diginotice-frontend.vercel.app`)
- `SMTP_USER` / `SMTP_PASS` / `SMTP_HOST`: (Optional) Your Gmail or SMTP credentials for password reset emails.
- `AUTO_SEED`: `true` (seeds initial campus accounts on first launch).

### Step 4: Generate Public Domain
1. In your Backend service -> **Settings** -> **Networking**, click **"Generate Domain"**.
2. You will get a URL like `https://diginotice-backend-production.up.railway.app`.
3. Copy this URL and set it as `VITE_API_URL` in your Vercel frontend deployment!
4. Test health check: `https://<your-railway-domain>/health` -> `{ "status": "ok", "firewall": "active" }`.
