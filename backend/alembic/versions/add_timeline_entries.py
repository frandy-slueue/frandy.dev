"""add timeline_entries table

Revision ID: e5f6a7b8c9d0
Revises: d4e5f6a7b8c9
Create Date: 2026-04-03 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision      = 'e5f6a7b8c9d0'
down_revision = 'd4e5f6a7b8c9'
branch_labels = None
depends_on    = None


def upgrade() -> None:
    op.create_table(
        'timeline_entries',
        sa.Column('id',          UUID(as_uuid=True), primary_key=True),
        sa.Column('sort_order',  sa.Integer(),        nullable=False, server_default='0'),
        sa.Column('period',      sa.String(20),       nullable=False),
        sa.Column('date_label',  sa.String(50),       nullable=False, server_default=''),
        sa.Column('title',       sa.String(200),      nullable=False),
        sa.Column('category',    sa.String(50),       nullable=False),
        sa.Column('description', sa.Text(),           nullable=False, server_default=''),
        sa.Column('image_url',   sa.String(500),      nullable=True),
    )

    # Seed with the hardcoded data so admin sees it immediately
    op.execute("""
        INSERT INTO timeline_entries (id, sort_order, period, date_label, title, category, description)
        VALUES
          (gen_random_uuid(), 0, 'Before', '',          'The Foundation',         'Background',     'Life before code. A persistent drive to understand how things work and an instinct to build. That mindset was already there — software gave it a direction.'),
          (gen_random_uuid(), 1, '2023',   'January',   'Atlas School of Tulsa',  'Education',      'Enrolled in an intensive, project-based software engineering program. No lectures — just building, breaking, and figuring it out. The hardest and most formative experience of my engineering life.'),
          (gen_random_uuid(), 2, '2023',   'August',    'First Deployed Project', 'Milestone',      'First working application shipped to the web. Seeing something I built live on a real URL changed how I thought about what was possible.'),
          (gen_random_uuid(), 3, '2024',   'March',     'Advanced Curriculum',    'Education',      'React, Next.js, Python, Django, FastAPI, PostgreSQL, Docker. The stack expanded fast. Started understanding not just how to use tools but why certain tools exist.'),
          (gen_random_uuid(), 4, '2024',   'September', 'First Freelance Project','Work',           'First client project delivered. Real deadline, real feedback, real money. A completely different pressure than school projects — in a good way.'),
          (gen_random_uuid(), 5, '2024',   'November',  'DevOps & Docker',        'Certifications', 'Containerisation and deployment workflows. Docker Compose went from intimidating to natural. Started thinking about infrastructure as part of the product.'),
          (gen_random_uuid(), 6, '2025',   'February',  'Portfolio Launch',        'Milestone',      'frandy.dev — this portfolio. FastAPI backend, Next.js frontend, five Docker services, four animated themes, a CodeBreeder identity baked into the work layer.'),
          (gen_random_uuid(), 7, '2025',   'Present',   'Seeking First Role',     'Work',           'Open to full-stack engineering roles and freelance projects. If you are reading this and you have something worth building — I want to hear about it.')
    """)


def downgrade() -> None:
    op.drop_table('timeline_entries')
