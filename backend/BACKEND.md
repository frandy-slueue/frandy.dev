# frandy.dev — Backend Documentation

**Author:** Frandy Slueue  
**Stack:** FastAPI · PostgreSQL · SQLAlchemy · Alembic · Docker  
**Domain:** [frandy.dev](https://frandy.dev)

---

## Overview

The frandy.dev backend is a production-grade REST API built with FastAPI and Python 3.12. It powers all dynamic content on the portfolio — projects, contact form submissions, GitHub stats, visitor analytics, theme switching, and resume management. All services run inside Docker Compose on a single DigitalOcean Droplet.

---

## Architecture

```
Internet
    |
frandy.dev (443 HTTPS / 80 HTTP)
    |
[Nginx] ← SSL via Let's Encrypt / Certbot
    |
    ├── /        → [Next.js]  port 3000
    ├── /api     → [FastAPI]  port 8000
    └── /analytics → [Umami] port 3001
              |
        [PostgreSQL] port 5432 (internal only)
```

Five services orchestrated via Docker Compose: Next.js frontend, FastAPI backend, PostgreSQL database, Umami analytics, and Nginx reverse proxy.

---

## Tech Stack

| Technology | Version | Role |
|---|---|---|
| FastAPI | 0.111+ | Async Python API framework |
| Python | 3.12 | Runtime |
| PostgreSQL | 16 | Relational database |
| SQLAlchemy | 2.x | Async ORM |
| Alembic | 1.13+ | Schema migrations |
| Pydantic | v2 | Request/response validation |
| Uvicorn | 0.29+ | ASGI server |
| APScheduler | 3.10+ | Background task scheduler |
| Docker | 25+ | Containerisation |
| Docker Compose | v2 | Service orchestration |
| Nginx | latest | Reverse proxy + SSL |
| Certbot | latest | Let's Encrypt SSL automation |
| Resend | 0.8+ | Transactional email |
| Umami | 2.x | Self-hosted analytics |

---

## Database Schema

Four tables power the entire backend.

### `contacts`
Stores all contact form submissions.

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key, auto-generated |
| name | VARCHAR(100) | Required |
| email | VARCHAR(255) | Required, validated format |
| subject | VARCHAR(255) | Required |
| message | TEXT | Required |
| phone | VARCHAR(30) | Optional |
| company | VARCHAR(150) | Optional |
| is_read | BOOLEAN | Default false |
| created_at | TIMESTAMP | Auto set on insert |

### `projects`
CMS table for all portfolio projects.

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key, auto-generated |
| title | VARCHAR(100) | Required |
| description | TEXT | Required |
| case_study | TEXT | Optional rich text |
| category | VARCHAR(50) | frontend / backend / fullstack |
| status | VARCHAR(30) | live / in_progress / coming_soon |
| stack_tags | TEXT[] | Array of technology names |
| demo_url | VARCHAR(500) | Optional |
| github_url | VARCHAR(500) | Optional |
| thumbnail_url | VARCHAR(500) | Optional stored path |
| is_featured | BOOLEAN | Controls mosaic visibility |
| is_published | BOOLEAN | Draft vs published |
| sort_order | INTEGER | Controls display order |
| created_at | TIMESTAMP | Auto set on insert |
| updated_at | TIMESTAMP | Auto updated on change |

### `github_cache`
Caches GitHub API responses, refreshed every 3 hours.

| Column | Type | Notes |
|---|---|---|
| id | INTEGER | Primary key (always 1) |
| total_commits | INTEGER | All-time commit count |
| languages | JSONB | Language usage percentages |
| activity_graph | JSONB | Contribution data for graph |
| pinned_repos | JSONB | Array of pinned repo objects |
| last_updated | TIMESTAMP | When cache was last refreshed |

### `admin_users`
Admin authentication table.

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key, auto-generated |
| username | VARCHAR(50) | Unique |
| hashed_password | VARCHAR(255) | bcrypt hashed |
| created_at | TIMESTAMP | Auto set on insert |

### `site_settings`
Single-row table for global site configuration.

| Column | Type | Notes |
|---|---|---|
| id | INTEGER | Primary key (always 1) |
| active_theme | VARCHAR(20) | silver / cobalt / ember / jade |
| last_theme_changed | TIMESTAMP | Used for 90-day auto-rotation |
| resume_url | VARCHAR(500) | Current resume download path |
| resume_uploaded_at | TIMESTAMP | When resume was last uploaded |

---

## API Endpoints

### Auth — `/api/auth`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Login with username + password, returns JWT in httpOnly cookie |
| POST | `/api/auth/logout` | Admin | Clears the JWT cookie |
| GET | `/api/auth/me` | Admin | Returns current authenticated user |

### Projects — `/api/projects`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/projects` | Public | Returns all published projects. Supports `?category=` and `?featured_only=true` |
| GET | `/api/projects/all` | Admin | Returns all projects including drafts |
| POST | `/api/projects` | Admin | Create a new project |
| PUT | `/api/projects/{id}` | Admin | Update all fields of an existing project |
| DELETE | `/api/projects/{id}` | Admin | Delete a project permanently |
| POST | `/api/projects/reorder` | Admin | Update sort_order for multiple projects at once |
| POST | `/api/projects/upload` | Admin | Upload a thumbnail image, returns stored URL |

### Contact — `/api/contact`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/contact` | Public | Submit contact form, stores in DB and sends email via Resend |
| GET | `/api/contact` | Admin | List all submissions with pagination. Supports `?unread_only=true` |
| GET | `/api/contact/{id}` | Admin | Get full message body of a single submission |
| PATCH | `/api/contact/{id}` | Admin | Mark as read or unread |
| DELETE | `/api/contact/{id}` | Admin | Delete a submission permanently |

### GitHub — `/api/github`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/github/stats` | Public | Returns cached GitHub stats — commits, languages, activity graph |
| GET | `/api/github/pinned` | Public | Returns cached pinned repositories array |
| POST | `/api/github/refresh` | Admin | Force-refreshes GitHub cache immediately from API |

### Analytics — `/api/analytics`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/analytics/public` | Public | Total visitor count only — for public social proof counter |
| GET | `/api/analytics/stats` | Admin | Full metrics — visitors, pageviews, supports `?period_days=` |
| GET | `/api/analytics/referrers` | Admin | Top traffic referrers |
| GET | `/api/analytics/devices` | Admin | Browser and device type breakdown |
| GET | `/api/analytics/countries` | Admin | Visitor locations by country |

### Settings — `/api/settings`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/settings/theme` | Public | Returns active theme — frontend reads on page load |
| PUT | `/api/settings/theme` | Admin | Set active theme manually |
| GET | `/api/settings/resume` | Public | Returns current resume download URL |
| POST | `/api/settings/resume` | Admin | Upload a new resume PDF, replaces sitewide instantly |
| DELETE | `/api/settings/resume` | Admin | Remove the current resume |

### Health

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/health` | Public | Service health check |

---

## Project Structure

```
backend/
├── main.py                  # App entry point, lifespan, middleware, router registration
├── requirements.txt
├── Dockerfile               # Production image
├── Dockerfile.dev           # Development image with hot reload
├── alembic.ini
├── alembic/
│   ├── env.py               # Async Alembic config
│   └── versions/            # Migration files
├── core/
│   ├── config.py            # Pydantic Settings — all env vars
│   ├── database.py          # Async engine, session factory, Base
│   ├── dependencies.py      # get_current_admin auth guard
│   └── security.py          # JWT encode/decode, bcrypt hash/verify
├── models/
│   ├── admin_user.py
│   ├── contact.py
│   ├── github_cache.py
│   ├── project.py
│   └── site_settings.py
├── schemas/
│   ├── analytics.py
│   ├── auth.py
│   ├── contact.py
│   ├── github.py
│   ├── project.py
│   └── settings.py
├── routers/
│   ├── analytics.py
│   ├── auth.py
│   ├── contact.py
│   ├── github.py
│   ├── projects.py
│   └── settings.py
├── services/
│   ├── analytics.py         # Umami API proxy
│   ├── email.py             # Resend transactional email
│   ├── github.py            # GitHub REST + GraphQL API client
│   ├── resume.py            # PDF upload and storage
│   ├── scheduler.py         # APScheduler — GitHub refresh + theme rotation
│   └── upload.py            # Thumbnail image upload and validation
└── scripts/
    └── seed_admin.py        # One-time admin user creation script
```

---

## Local Development Setup

### Prerequisites

- Python 3.12
- Docker + Docker Compose
- Git

### Steps

**1. Clone the repository**

```bash
git clone https://github.com/frandy-slueue/frandy.dev.git
cd frandy.dev
```

**2. Start PostgreSQL locally**

```bash
docker compose -f docker-compose.dev.yml up postgres -d
```

**3. Create a virtual environment and install dependencies**

```bash
cd backend
python3.12 -m venv .venv
source .venv/bin/activate   # Mac/Linux
# .venv\Scripts\activate    # Windows
pip install -r requirements.txt
```

**4. Create a local `.env` file**

```bash
cp .env.example .env
```

Edit `backend/.env` with your local values:

```
DATABASE_URL=postgresql+asyncpg://frandy:devpassword@localhost:5432/portfolio
SECRET_KEY=dev-secret-key-change-in-production
RESEND_API_KEY=re_placeholder
CONTACT_EMAIL=your@email.com
GITHUB_TOKEN=your_github_token
GITHUB_USERNAME=your_github_username
UMAMI_API_URL=http://localhost:3001/api
UMAMI_API_KEY=placeholder
UMAMI_WEBSITE_ID=placeholder
UPLOAD_DIR=./uploads
UMAMI_APP_SECRET=dev-umami-secret
```

**5. Run database migrations**

```bash
alembic upgrade head
```

**6. Seed the admin user**

```bash
python scripts/seed_admin.py
```

This creates username `frandy` with password `changeme`. Change the password immediately after first login.

**7. Start the development server**

```bash
uvicorn main:app --reload --port 8000
```

API docs available at: `http://localhost:8000/api/docs`

---

## Running with Docker Compose (Full Stack)

```bash
# From the project root
cp .env.example .env
# Fill in all production values in .env

docker compose -f docker-compose.dev.yml up
```

This starts PostgreSQL, FastAPI with hot reload, and Umami together. Next.js runs separately during development.

---

## Environment Variables

| Variable | Service | Description |
|---|---|---|
| `DATABASE_URL` | FastAPI | PostgreSQL async connection string |
| `SECRET_KEY` | FastAPI | JWT signing secret — 32+ random chars |
| `RESEND_API_KEY` | FastAPI | From Resend dashboard |
| `CONTACT_EMAIL` | FastAPI | Email address to receive contact notifications |
| `GITHUB_TOKEN` | FastAPI | Personal access token with read:user scope |
| `GITHUB_USERNAME` | FastAPI | Your GitHub username |
| `UMAMI_API_URL` | FastAPI | Umami API base URL |
| `UMAMI_API_KEY` | FastAPI | From Umami settings page |
| `UMAMI_WEBSITE_ID` | FastAPI | From Umami website settings |
| `UMAMI_APP_SECRET` | Umami | Random secret for Umami sessions |
| `UPLOAD_DIR` | FastAPI | File upload directory path |
| `POSTGRES_USER` | Docker | PostgreSQL username |
| `POSTGRES_PASSWORD` | Docker | PostgreSQL password |
| `POSTGRES_DB` | Docker | PostgreSQL database name |

---

## Background Tasks

The APScheduler runs two background jobs on startup:

**GitHub cache refresh** — runs every 3 hours. Fetches total commits, language breakdown, contribution activity graph, and pinned repositories from the GitHub REST and GraphQL APIs. Stores results in the `github_cache` table. Can be manually triggered via `POST /api/github/refresh`.

**Theme auto-rotation** — runs every 24 hours. Checks whether 90 days have elapsed since `last_theme_changed` in `site_settings`. If so, rotates to the next theme in the cycle: Silver → Cobalt → Ember → Jade → Silver. Manual theme changes also reset the 90-day timer.

---

## Authentication

The API uses JWT tokens stored in httpOnly cookies. Tokens expire after 1 hour.

Protected endpoints use the `get_current_admin` dependency from `core/dependencies.py` which reads the `access_token` cookie, verifies the JWT signature, and fetches the admin user from the database. Any endpoint with `_: AdminUser = Depends(get_current_admin)` in its signature is admin-only.

Passwords are hashed with bcrypt via passlib. Raw passwords are never stored.

---

## Security

| Concern | Implementation |
|---|---|
| HTTPS only | Nginx redirects all HTTP to HTTPS. HSTS header enforced. |
| JWT auth | httpOnly cookie, 1 hour expiry, bcrypt passwords |
| CORS | Restricted to `frandy.dev` origin only in production |
| SQL injection | SQLAlchemy ORM + parameterised queries. No raw SQL. |
| XSS | Nginx X-XSS-Protection header. React escapes output by default. |
| File uploads | MIME type validation + 5MB size limit for thumbnails, 10MB for resume |
| DB exposure | PostgreSQL port 5432 not exposed externally. Internal Docker network only. |
| Secrets | No secrets in codebase. All via `.env` file, never committed. |

---

## Making Schema Changes

```bash
# 1. Edit the relevant model in models/
# 2. Generate a migration
alembic revision --autogenerate -m "describe your change"

# 3. Review the generated migration in alembic/versions/
# 4. Apply it
alembic upgrade head

# 5. To roll back
alembic downgrade -1
```

---

## Deployment

Full deployment instructions are documented in `docs/frandy_part2_tech_stack.pdf` in this repository. The short version:

```bash
# On the DigitalOcean Droplet
git clone https://github.com/frandy-slueue/frandy.dev.git
cd frandy.dev
cp .env.example .env
# Fill in all production values

docker compose up -d
docker compose exec fastapi alembic upgrade head
docker compose exec fastapi python scripts/seed_admin.py
docker compose exec nginx certbot --nginx -d frandy.dev -d www.frandy.dev
```

---

## API Documentation

Interactive API docs (Swagger UI) are available at `/api/docs` in development. They are disabled in production for security.

---

*Built by Frandy Slueue — Atlas School of Tulsa*
