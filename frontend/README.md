# DigiNotice AI - Frontend Web Application

A modern, responsive Digital Notice Board frontend built with **React 18**, **Vite**, **TypeScript**, and **TailwindCSS**.

---

## 🚀 Features
- **Role-Based Dashboards**: Super Admin, Department HOD, Faculty, and Students.
- **Interactive Digital Display / Kiosk Mode**: Real-time auto-scrolling notice ticker, weather widgets, and campus news.
- **Authentication**: JWT authentication with email OTP verification and self-serve password recovery.
- **Modern UI**: Glassmorphism, dark/light themes, animations with Lucide icons.

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
   Set `VITE_API_URL`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

4. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 🌐 Deploy to Vercel (Step-by-Step)

### Option 1: Vercel Dashboard (Recommended)
1. Push this repository to GitHub.
2. Go to [Vercel Dashboard](https://vercel.com/new).
3. Click **"Add New..."** -> **"Project"** and select your GitHub frontend repository (`diginotice-frontend`).
4. In the Project Configuration:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add:
   - `VITE_API_URL` = `https://<your-backend-service>.up.railway.app/api`
     *(Replace with your Railway backend deployment URL)*
6. Click **Deploy**!

### Option 2: Vercel CLI
```bash
npm install -g vercel
vercel
```

> **Note on SPA Routing**: This repository includes `vercel.json` with rewrite rules to ensure client-side routing works seamlessly across page reloads.
