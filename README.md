# frandy.dev

Personal portfolio website for Frandy Slueue — Full Stack Software Engineer.

**Live site:** [frandy.dev](https://frandy.dev)

## Stack

- **Frontend:** Next.js 16+, Tailwind CSS, Framer Motion
- **Backend:** FastAPI (Python 3.12), SQLAlchemy 2.x, Alembic
- **Database:** PostgreSQL 16
- **Analytics:** Umami (self-hosted)
- **Infrastructure:** Docker Compose, Nginx, DigitalOcean, GitHub Actions

## Local Development
```bash
cp .env.example .env
# Fill in your .env values
docker compose -f docker-compose.dev.yml up
```

## Architecture

Five services orchestrated via Docker Compose: Next.js frontend, FastAPI backend,
PostgreSQL database, Umami analytics, and Nginx reverse proxy.

Full specification documented in `/docs`.