# Teamtask — Team Task Manager

A collaborative project and task management web application built with **React**, **TypeScript**, **Vite**, **Tailwind CSS**, and **Supabase**.

## Features

- **Authentication** — Email/password sign-up and sign-in powered by Supabase Auth
- **Projects** — Create and manage multiple projects
- **Team Management** — Invite team members with role-based access (`admin` / `member`)
- **Tasks** — Create tasks with title, description, priority (`low` / `medium` / `high`), status (`pending` / `in_progress` / `completed`), and due dates
- **Task Assignments** — Assign tasks to team members
- **Row-Level Security** — All data is protected via Supabase RLS policies ensuring users only access what they're authorized to see

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite 5 |
| Styling | Tailwind CSS 3, PostCSS, Autoprefixer |
| Icons | Lucide React |
| Backend / Auth | Supabase (PostgreSQL + Auth + RLS) |
| Linting | ESLint 9, typescript-eslint |

## Database Schema

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles (name, avatar) linked to `auth.users` |
| `projects` | Projects created by users |
| `team_members` | Project membership with roles (admin/member) |
| `tasks` | Tasks within projects (status, priority, due date) |
| `task_assignments` | Many-to-many task ↔ user assignments |

All tables have **Row-Level Security** enabled with fine-grained policies for select, insert, and update operations.

## Prerequisites

- [Node.js](https://nodejs.org/) v18+ and npm
- A [Supabase](https://supabase.com/) project

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd Teamtask
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Get these values from your Supabase dashboard → **Settings** → **API**.

### 4. Apply database migrations

Run the SQL in `supabase/migrations/20260506123216_01_create_initial_schema.sql` via:

- **Supabase Dashboard** → SQL Editor → paste and run, OR
- **Supabase CLI**:
  ```bash
  npx supabase db push
  ```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Build for production (outputs to `dist/`) |
| `npm run preview` | Preview production build locally |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run lint` | Run ESLint |

## Deployment

This is a static SPA — deploy the `dist/` folder to any static host:

- **Vercel** — auto-detects Vite; add env vars in dashboard
- **Netlify** — set build command `npm run build`, publish directory `dist`
- **GitHub Pages / S3 / Firebase Hosting** — upload `dist/` after building

> **Note:** Configure your host to redirect all routes to `index.html` for SPA routing.

## Project Structure

```
src/
├── App.tsx                 # Root component (auth gate + routing)
├── main.tsx                # Entry point
├── index.css               # Tailwind imports + global styles
├── components/
│   ├── Auth.tsx            # Sign-up / Sign-in form
│   ├── Dashboard.tsx       # Main dashboard layout
│   ├── ProjectList.tsx     # List of user's projects
│   ├── ProjectDetail.tsx   # Single project view
│   ├── TaskForm.tsx        # Create/edit task form
│   ├── TaskList.tsx        # Task list with filters
│   └── TeamPanel.tsx       # Team member management
└── lib/
    ├── supabase.ts         # Supabase client initialization
    └── types.ts            # TypeScript interfaces
```

## Troubleshooting

- **"Email rate limit exceeded"** during sign-up — Supabase free tier limits to 2 confirmation emails/hour. Disable email confirmation in Supabase dashboard (Authentication → Providers → Email) for development, or add a custom SMTP provider.
- **`npm` not recognized** — Install Node.js LTS from [nodejs.org](https://nodejs.org/) or via `winget install OpenJS.NodeJS.LTS`.
