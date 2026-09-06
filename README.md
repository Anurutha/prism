# Prism — AI-Powered Text-to-Image Generation Platform

Prism is a full-stack SaaS-style web application that turns natural-language prompts
into AI-generated images. Built as a B.Tech AI & Data Science final-year project, it
demonstrates a complete production pipeline: authentication, a real diffusion-model
integration, per-user cloud storage, a searchable gallery, favorites, prompt history,
and a role-based admin dashboard.

> This is a real, working implementation — every endpoint calls a live text-to-image
> API and persists to a real Postgres database. Nothing here is a mock.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Project Structure](#project-structure)
5. [Local Development](#local-development)
6. [Environment Variables](#environment-variables)
7. [Database Setup (Supabase)](#database-setup-supabase)
8. [AI Provider Setup](#ai-provider-setup)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)
11. [Future Enhancements](#future-enhancements)

---

## Features

- Email/password authentication with bcrypt-hashed passwords and JWT sessions
- Text-to-image generation with 9 style presets, aspect ratio, negative prompt, seed, and batch (1–4 images)
- Per-user private image gallery with search, style filter, sort, and pagination
- Favorites, prompt history with one-click reuse, and a profile page with live stats
- Role-based admin dashboard with usage charts (daily generations, popular styles, recent activity)
- Row Level Security policies on every table and on Supabase Storage
- Rate limiting on auth and generation endpoints
- Fully responsive, accessible UI (keyboard navigation, ARIA labels, visible focus states, reduced-motion support)
- Dark UI with a distinct "Prism" visual identity (see [Design](#design))

### Design

The visual identity is built around light refracting into a spectrum: an ink-navy
base, a violet → magenta → amber → cyan gradient used sparingly as an accent, and a
pairing of **Fraunces** (display serif) with **Space Grotesk** (UI sans) — chosen to
avoid the generic "AI SaaS card kit" look.

---

## Tech Stack

| Layer          | Technology                                              |
|----------------|----------------------------------------------------------|
| Frontend       | React 18, Vite, Tailwind CSS, React Router, Axios, Lucide React, Recharts |
| Backend        | Node.js, Express.js, REST API                            |
| Database       | Supabase PostgreSQL                                       |
| File Storage   | Supabase Storage                                           |
| Auth           | Custom JWT + bcrypt (passwords hashed with bcrypt, 12 salt rounds) |
| AI Provider    | Pollinations.ai (default, free, keyless) — swappable for Stability AI or Hugging Face |
| Validation     | Zod                                                        |
| Deployment     | Vercel (frontend), Render/Railway (backend), Supabase (DB + storage) |

---

## Architecture

```
              USER
                │
        ┌───────▼────────┐
        │     Vercel      │
        │   React (Vite)  │
        └───────┬─────────┘
                │  HTTPS / JSON
        ┌───────▼─────────┐
        │  Render/Railway  │
        │ Node.js/Express  │
        └───────┬─────────┘
                │
       ┌────────┴─────────┐
       ▼                  ▼
┌─────────────┐   ┌──────────────────┐
│  Supabase   │   │  Pollinations.ai │
│  Postgres + │   │  Image API       │
│  Storage    │   │  (or HF/Stability)│
└─────────────┘   └──────────────────┘
```

**Generation workflow:**

```
User prompt → frontend validation → authenticated API request → Express backend
→ Zod validation → AI provider service → text-to-image API → image buffer
→ Supabase Storage upload → database record (generated_images) → JSON response
→ frontend renders the result
```

The AI provider is isolated in `backend/services/aiProvider.service.js` — swapping
providers means editing one file and one `.env` variable, nothing else.

---

## Project Structure

```
prism/
├── backend/
│   ├── controllers/       # auth, images, profile, admin
│   ├── routes/             # REST route definitions
│   ├── middleware/         # auth, error handling, rate limiting
│   ├── services/           # aiProvider.service.js, storage.service.js
│   ├── validators/         # Zod schemas
│   ├── utils/               # ApiError, asyncHandler
│   ├── config/              # Supabase client
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Navbar, Sidebar, ImageCard, ImageModal, etc.
│   │   ├── pages/           # Home, Login, Register, Dashboard pages, Admin
│   │   ├── layouts/         # DashboardLayout
│   │   ├── context/         # AuthContext, ToastContext
│   │   ├── services/        # api.js (Axios client)
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── database/
│   └── schema.sql            # Full Postgres schema + RLS policies
├── .gitignore
├── LICENSE
└── README.md
```

---

## Local Development

### Prerequisites

- Node.js 18+
- A free [Supabase](https://supabase.com) account

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/prism.git
cd prism

# Backend
cd backend
npm install
cp .env.example .env   # then fill in values — see Environment Variables below

# Frontend
cd ../frontend
npm install
cp .env.example .env
```

### 2. Set up the database

See [Database Setup](#database-setup-supabase) below, then come back here.

### 3. Run both apps

```bash
# Terminal 1
cd backend
npm run dev        # http://localhost:5000

# Terminal 2
cd frontend
npm run dev         # http://localhost:5173
```

Visit `http://localhost:5173`, register an account, and generate your first image.

---

## Environment Variables

### `backend/.env`

| Variable | Description |
|---|---|
| `PORT` | Port the Express server listens on (default `5000`) |
| `NODE_ENV` | `development` or `production` |
| `FRONTEND_URL` | Comma-separated allowed CORS origin(s), e.g. `http://localhost:5173` |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key (Project Settings → API). **Never expose this to the frontend.** |
| `SUPABASE_STORAGE_BUCKET` | Storage bucket name (default `generated-images`) |
| `JWT_SECRET` | Long random string used to sign sessions |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `AI_PROVIDER` | `pollinations` (default, free/keyless), `huggingface`, or `stability` |
| `HUGGINGFACE_API_KEY` | Only needed if `AI_PROVIDER=huggingface` |
| `STABILITY_API_KEY` | Only needed if `AI_PROVIDER=stability` |
| `GENERATION_RATE_LIMIT_MAX` / `_WINDOW_MINUTES` | Per-user generation rate limit |

### `frontend/.env`

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the backend API, e.g. `http://localhost:5000/api` |

**Never commit `.env` files, API keys, or credentials.** Only `.env.example` files belong in git.

---

## Database Setup (Supabase)

1. Create a project at [supabase.com](https://supabase.com) (free tier is sufficient).
2. Go to **SQL Editor → New query**, paste the entire contents of `database/schema.sql`, and run it. This creates:
   - `profiles`, `generated_images`, `favorites`, `generation_logs` tables
   - Indexes (including a trigram index for prompt search)
   - Row Level Security policies on every table
3. Go to **Storage → New bucket**:
   - Name: `generated-images`
   - Public bucket: **on** (images are served via public URL to the `<img>` tag)
4. The schema file also creates the Storage RLS policies automatically as part of the SQL script.
5. Go to **Project Settings → API** and copy:
   - `Project URL` → `SUPABASE_URL`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret, backend-only)
6. **Promote your first admin user** after registering through the app:
   ```sql
   update profiles set role = 'admin' where email = 'you@example.com';
   ```

---

## AI Provider Setup

Prism ships with **Pollinations.ai** as the default provider because it is:
- Currently live and publicly documented
- Free with no API key required (no billing risk for a student project)
- Good image quality via its Flux-based model

No setup is needed for the default provider — it works out of the box.

**To switch providers** (e.g. for higher throughput or a different model), edit
`backend/.env`:

```bash
AI_PROVIDER=huggingface
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxx
```

or

```bash
AI_PROVIDER=stability
STABILITY_API_KEY=sk-xxxxxxxxxxxx
```

No other file needs to change — `backend/services/aiProvider.service.js` is the
single integration point.

> **Free-tier note:** always check the provider's current rate limits and terms
> before going to production; they change over time and are outside this project's control.

---

## Deployment

### 1. GitHub

Push the repository to GitHub. Confirm `.env` files are **not** committed (check `.gitignore`).

### 2. Supabase

Already covered above — keep the project running; both frontend and backend will
point to it in production.

### 3. Backend (Render or Railway)

1. Create a new **Web Service** from your GitHub repo, root directory `backend/`.
2. Build command: `npm install`
3. Start command: `npm start`
4. Add all variables from `backend/.env.example` in the platform's environment settings, using your real Supabase and JWT values.
5. Set `FRONTEND_URL` to your eventual Vercel domain (you can update this after step 4).
6. Deploy, then note the public backend URL, e.g. `https://prism-api.onrender.com`.

### 4. Frontend (Vercel)

1. Import the repo into Vercel, set the project root to `frontend/`.
2. Framework preset: **Vite**.
3. Add environment variable `VITE_API_URL=https://prism-api.onrender.com/api`.
4. Deploy.

### 5. Close the loop on CORS

Go back to your backend host's environment variables and set:
```
FRONTEND_URL=https://your-project.vercel.app
```
Redeploy the backend so CORS allows requests from the deployed frontend.

### 6. Final production verification checklist

- [ ] Register a new account on the deployed frontend
- [ ] Generate an image and confirm it appears and persists on refresh
- [ ] Favorite, download, and delete an image
- [ ] Confirm a second account cannot see the first account's images (test authorization)
- [ ] Promote your account to `admin` in Supabase and confirm `/dashboard/admin` loads
- [ ] Check the Render/Railway logs for any 500 errors under real traffic

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| CORS error in browser console | `FRONTEND_URL` on backend doesn't match the deployed frontend origin | Update the env var and redeploy the backend |
| 401 on every request | Expired/missing token, or `JWT_SECRET` differs between deploys | Log out and back in; confirm `JWT_SECRET` is stable across deploys |
| Images fail to generate (502/504) | AI provider timeout or outage | Retry; consider switching `AI_PROVIDER` |
| Images generate but don't display | Storage bucket not public, or wrong `SUPABASE_STORAGE_BUCKET` name | Confirm bucket is public and name matches `.env` |
| "relation does not exist" DB errors | `database/schema.sql` wasn't run, or ran against the wrong project | Re-run the schema in the correct Supabase project's SQL editor |
| 429 errors during testing | Rate limiter is working as intended | Wait for the window to reset, or raise `GENERATION_RATE_LIMIT_MAX` in `.env` for local dev |

---

## Future Enhancements

- Image-to-image and inpainting workflows
- Social sharing with public share links per image
- Team/workspace accounts with shared galleries
- Webhooks for async generation (useful if a slower, higher-quality model is swapped in)
- Usage-based billing via Stripe for a paid tier

---

## License

MIT — see [LICENSE](./LICENSE).
